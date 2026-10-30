import { Router, Response } from 'express';
import { getDatabase } from '../db.js';
import { requireAuth, optionalAuth, AuthenticatedRequest } from '../auth.js';

const router = Router();

/**
 * GET /api/registrations - Retrieve registrations
 * Students only see their own; Staff/Admins see all
 */
router.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  const user = req.user;

  const { status, activity_id, user_id } = req.query;
  const conditions: string[] = [];
  const params: any[] = [];

  // Role filtering
  if (!user || user.role === 'student') {
    const studentUserId = user ? user.id : 1; // Default to student id 1 for demo browsing
    conditions.push('r.user_id = ?');
    params.push(user ? user.id : studentUserId);
  } else if (user_id) {
    conditions.push('r.user_id = ?');
    params.push(Number(user_id));
  }

  if (status && status !== 'all') {
    conditions.push('r.status = ?');
    params.push(status);
  }

  if (activity_id) {
    conditions.push('r.activity_id = ?');
    params.push(Number(activity_id));
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT 
      r.id, r.activity_id, r.user_id, r.status, r.notes, r.team_name, r.created_at, r.updated_at,
      a.title as activity_title, a.date as activity_date, a.start_time, a.end_time,
      a.venue as activity_venue, a.organizer as activity_organizer, a.capacity as activity_capacity,
      d.name as department_name, d.color as department_color,
      u.full_name as student_name, u.email as student_email, u.grade as student_grade, u.house as student_house
    FROM registrations r
    JOIN activities a ON r.activity_id = a.id
    JOIN departments d ON a.department_id = d.id
    JOIN users u ON r.user_id = u.id
    ${whereClause}
    ORDER BY r.created_at DESC
  `;

  try {
    const registrations = db.prepare(query).all(...params);
    res.json({ registrations, count: registrations.length });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch registrations: ' + err.message });
  }
});

/**
 * POST /api/registrations - Register student for an activity
 */
router.post('/', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  const { activity_id, notes, team_name, user_id } = req.body;

  if (!activity_id) {
    res.status(400).json({ error: 'activity_id is required.' });
    return;
  }

  // Determine target user
  let targetUserId = req.user?.id;
  if (!targetUserId || (req.user?.role !== 'student' && user_id)) {
    targetUserId = user_id ? Number(user_id) : 1;
  }

  // Verify activity exists and is open
  const activity = db.prepare('SELECT id, title, capacity, status FROM activities WHERE id = ?').get(Number(activity_id)) as any;
  if (!activity) {
    res.status(404).json({ error: 'Activity not found.' });
    return;
  }

  if (activity.status === 'cancelled') {
    res.status(400).json({ error: 'Cannot register for a cancelled activity.' });
    return;
  }

  // Check duplicate registration
  const existing = db.prepare('SELECT id, status FROM registrations WHERE activity_id = ? AND user_id = ?').get(Number(activity_id), targetUserId) as any;
  if (existing) {
    if (existing.status === 'cancelled') {
      // Re-activate
      db.prepare(`
        UPDATE registrations
        SET status = 'pending', notes = ?, team_name = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(notes || null, team_name || null, existing.id);

      res.json({ message: 'Registration resubmitted.', registrationId: existing.id, status: 'pending' });
      return;
    }
    res.status(400).json({ error: `You have already applied for this activity (Current status: ${existing.status}).` });
    return;
  }

  // Check capacity for waitlist status
  let initialStatus = 'pending';
  if (activity.capacity) {
    const confirmedCount = (db.prepare("SELECT COUNT(*) as count FROM registrations WHERE activity_id = ? AND status IN ('approved', 'confirmed')").get(Number(activity_id)) as any).count;
    if (confirmedCount >= activity.capacity) {
      initialStatus = 'waitlisted';
    }
  }

  try {
    const result = db.prepare(`
      INSERT INTO registrations (activity_id, user_id, status, notes, team_name)
      VALUES (?, ?, ?, ?, ?)
    `).run(Number(activity_id), targetUserId, initialStatus, notes || null, team_name || null);

    res.status(201).json({
      message: initialStatus === 'waitlisted' ? 'Activity is at capacity. You have been placed on the waitlist.' : 'Application submitted successfully.',
      registrationId: result.lastInsertRowid,
      status: initialStatus
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

/**
 * PUT /api/registrations/:id/status - Update application status (Approve, Reject, Cancel)
 */
router.put('/:id/status', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  const regId = Number(req.params.id);
  const { status, notes } = req.body;

  const validStatuses = ['pending', 'approved', 'rejected', 'waitlisted', 'confirmed', 'cancelled'];
  if (!status || !validStatuses.includes(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    return;
  }

  const existing = db.prepare('SELECT id, activity_id, user_id, status FROM registrations WHERE id = ?').get(regId) as any;
  if (!existing) {
    res.status(404).json({ error: 'Registration record not found.' });
    return;
  }

  // If student is cancelling their own registration
  if (req.user && req.user.role === 'student' && req.user.id !== existing.user_id) {
    res.status(403).json({ error: 'You can only manage your own applications.' });
    return;
  }

  try {
    db.prepare(`
      UPDATE registrations
      SET status = ?, notes = COALESCE(?, notes), updated_at = datetime('now')
      WHERE id = ?
    `).run(status, notes || null, regId);

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (admin_id, admin_username, action, entity, entity_id, details)
      VALUES (?, ?, ?, 'registration', ?, ?)
    `).run(
      req.user?.id || 1,
      req.user?.username || 'faculty',
      'STATUS_CHANGE',
      regId,
      `Updated registration #${regId} status to '${status}'`
    );

    res.json({ message: `Registration status updated to ${status}.`, id: regId, status });
  } catch (err: any) {
    res.status(500).json({ error: 'Status update failed: ' + err.message });
  }
});

/**
 * DELETE /api/registrations/:id - Cancel or delete registration
 */
router.delete('/:id', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  const regId = Number(req.params.id);

  const existing = db.prepare('SELECT id, user_id FROM registrations WHERE id = ?').get(regId) as any;
  if (!existing) {
    res.status(404).json({ error: 'Registration not found.' });
    return;
  }

  try {
    db.prepare('DELETE FROM registrations WHERE id = ?').run(regId);
    res.json({ message: 'Registration successfully removed.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to remove registration: ' + err.message });
  }
});

export default router;

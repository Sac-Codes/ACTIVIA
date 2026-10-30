import { Router, Response } from 'express';
import { getDatabase } from '../db.js';
import { optionalAuth, AuthenticatedRequest } from '../auth.js';

const router = Router();

/**
 * GET /api/tickets - Retrieve tickets (Student sees own; Staff/Admin sees all)
 */
router.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  const user = req.user;

  try {
    let tickets: any[];
    if (user && user.role !== 'student') {
      tickets = db.prepare(`
        SELECT id, user_id, user_name, user_role, subject, category, description, status, response, created_at, updated_at
        FROM tickets
        ORDER BY created_at DESC
      `).all();
    } else {
      const userId = user?.id || 1;
      tickets = db.prepare(`
        SELECT id, user_id, user_name, user_role, subject, category, description, status, response, created_at, updated_at
        FROM tickets
        WHERE user_id = ?
        ORDER BY created_at DESC
      `).all(userId);
    }

    res.json({ tickets, count: tickets.length });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve tickets: ' + err.message });
  }
});

/**
 * POST /api/tickets - Submit new support ticket or feedback idea
 */
router.post('/', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  const { subject, category, description } = req.body;

  if (!subject || !description) {
    res.status(400).json({ error: 'Subject and description are required.' });
    return;
  }

  const userId = req.user?.id || 1;
  const userName = req.user?.fullName || 'Student Submitter';
  const userRole = req.user?.role || 'student';

  try {
    const result = db.prepare(`
      INSERT INTO tickets (user_id, user_name, user_role, subject, category, description, status)
      VALUES (?, ?, ?, ?, ?, ?, 'open')
    `).run(userId, userName, userRole, subject.trim(), category || 'Support', description.trim());

    res.status(201).json({ message: 'Ticket submitted successfully.', ticketId: result.lastInsertRowid });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to submit ticket: ' + err.message });
  }
});

/**
 * PUT /api/tickets/:id - Update ticket status or add staff response
 */
router.put('/:id', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  const ticketId = Number(req.params.id);
  const { status, response } = req.body;

  const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
  if (status && !validStatuses.includes(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    return;
  }

  try {
    db.prepare(`
      UPDATE tickets
      SET status = COALESCE(?, status),
          response = COALESCE(?, response),
          updated_at = datetime('now')
      WHERE id = ?
    `).run(status || null, response || null, ticketId);

    res.json({ message: 'Ticket updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update ticket: ' + err.message });
  }
});

export default router;

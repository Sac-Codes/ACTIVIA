import { Router, Response } from 'express';
import { getDatabase } from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../auth.js';

const router = Router();

/**
 * Middleware: Require Administrator (Principal) role
 */
function requireAdmin(req: AuthenticatedRequest, res: Response, next: () => void): void {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'coordinator')) {
    res.status(403).json({ error: 'Access restricted: Administrator role required.' });
    return;
  }
  next();
}

/**
 * GET /api/users
 * Returns list of users with optional filtering
 */
router.get('/', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  const search = req.query.search ? String(req.query.search).trim() : '';
  const role = req.query.role ? String(req.query.role).trim() : '';
  const status = req.query.status ? String(req.query.status).trim() : '';

  try {
    let query = `
      SELECT id, username, full_name, email, role, status, grade, class_name, stream, student_id, house, created_at
      FROM users
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND (full_name LIKE ? OR username LIKE ? OR email LIKE ? OR student_id LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (role && role !== 'all') {
      if (role === 'viewer') {
        query += ` AND (role = 'viewer' OR role = 'student')`;
      } else if (role === 'editor') {
        query += ` AND (role = 'editor' OR role = 'teacher')`;
      } else {
        query += ` AND role = ?`;
        params.push(role);
      }
    }

    if (status && status !== 'all') {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY id DESC`;

    const users = db.prepare(query).all(...params);
    res.json({ users });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve users: ' + err.message });
  }
});

/**
 * PUT /api/users/:id/role
 * Allows Principal to update a user's role (e.g. promote Student to Editor / Teacher)
 */
router.put('/:id/role', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const userId = Number(req.params.id);
  const { role } = req.body;

  if (!role || !['editor', 'viewer', 'admin'].includes(role)) {
    res.status(400).json({ error: 'Valid role (editor, viewer, or admin) is required.' });
    return;
  }

  const db = getDatabase();
  const targetUser = db.prepare('SELECT id, username, full_name, role FROM users WHERE id = ?').get(userId) as any;

  if (!targetUser) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  // Prevent demoting the logged-in administrator or root admin
  if (targetUser.id === req.user?.id && role !== 'admin') {
    res.status(400).json({ error: 'You cannot remove administrative privileges from your own account.' });
    return;
  }

  try {
    db.prepare("UPDATE users SET role = ?, updated_at = datetime('now') WHERE id = ?").run(role, userId);

    // Audit log
    const adminLog = db.prepare('SELECT id FROM administrators WHERE id = ? OR username = ?').get(req.user?.id, req.user?.username) as any;
    const adminLogId = adminLog?.id || (db.prepare('SELECT id FROM administrators LIMIT 1').get() as any)?.id || null;

    db.prepare(`
      INSERT INTO audit_logs (admin_id, admin_username, action, entity, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      adminLogId,
      req.user?.username ?? 'admin',
      'ROLE_CHANGE',
      'users',
      userId,
      `Changed role of ${targetUser.full_name} (${targetUser.username}) from ${targetUser.role} to ${role}.`
    );

    res.json({
      message: `User role successfully updated to ${role}.`,
      user: { id: userId, role }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update role: ' + err.message });
  }
});

/**
 * PUT /api/users/:id/status
 * Allows Principal to approve, suspend, or reactivate accounts
 */
router.put('/:id/status', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const userId = Number(req.params.id);
  const { status } = req.body;

  if (!status || !['active', 'pending_approval', 'suspended'].includes(status)) {
    res.status(400).json({ error: 'Valid status (active, pending_approval, or suspended) is required.' });
    return;
  }

  const db = getDatabase();
  const targetUser = db.prepare('SELECT id, username, full_name, status FROM users WHERE id = ?').get(userId) as any;

  if (!targetUser) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (targetUser.id === req.user?.id && status === 'suspended') {
    res.status(400).json({ error: 'You cannot suspend your own administrator account.' });
    return;
  }

  try {
    db.prepare("UPDATE users SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, userId);

    // Audit log
    const adminLog = db.prepare('SELECT id FROM administrators WHERE id = ? OR username = ?').get(req.user?.id, req.user?.username) as any;
    const adminLogId = adminLog?.id || (db.prepare('SELECT id FROM administrators LIMIT 1').get() as any)?.id || null;

    db.prepare(`
      INSERT INTO audit_logs (admin_id, admin_username, action, entity, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      adminLogId,
      req.user?.username ?? 'admin',
      'STATUS_CHANGE',
      'users',
      userId,
      `Updated status of ${targetUser.full_name} (${targetUser.username}) to ${status}.`
    );

    res.json({
      message: `User status successfully updated to ${status}.`,
      user: { id: userId, status }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update status: ' + err.message });
  }
});

/**
 * DELETE /api/users/:id
 * Allows Principal to remove an account with safety protections
 */
router.delete('/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const userId = Number(req.params.id);
  const db = getDatabase();

  const targetUser = db.prepare('SELECT id, username, full_name, role FROM users WHERE id = ?').get(userId) as any;

  if (!targetUser) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (targetUser.id === req.user?.id) {
    res.status(400).json({ error: 'You cannot delete your own active administrator account.' });
    return;
  }

  if (targetUser.username === 'admin') {
    res.status(400).json({ error: 'The primary system administrator account cannot be deleted.' });
    return;
  }

  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);

    // Audit log
    const adminLog = db.prepare('SELECT id FROM administrators WHERE id = ? OR username = ?').get(req.user?.id, req.user?.username) as any;
    const adminLogId = adminLog?.id || (db.prepare('SELECT id FROM administrators LIMIT 1').get() as any)?.id || null;

    db.prepare(`
      INSERT INTO audit_logs (admin_id, admin_username, action, entity, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      adminLogId,
      req.user?.username ?? 'admin',
      'USER_DELETED',
      'users',
      userId,
      `Permanently deleted user account ${targetUser.full_name} (${targetUser.username}).`
    );

    res.json({ message: `User ${targetUser.full_name} has been removed successfully.` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete user: ' + err.message });
  }
});

export default router;

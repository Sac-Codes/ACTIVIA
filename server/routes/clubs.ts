import { Router, Response } from 'express';
import { getDatabase } from '../db.js';
import { requireAuth, optionalAuth, AuthenticatedRequest } from '../auth.js';

const router = Router();

/**
 * GET /api/clubs - List all clubs with membership count and current user status
 */
router.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  const userId = req.user?.id || 1;

  try {
    const clubs = db.prepare(`
      SELECT 
        c.id, c.name, c.code, c.description, c.category, c.meeting_day, c.meeting_time,
        c.room, c.advisor_name, c.max_members, c.created_at,
        COUNT(m.id) as member_count,
        MAX(CASE WHEN m.user_id = ? THEN 1 ELSE 0 END) as is_member
      FROM clubs c
      LEFT JOIN club_memberships m ON c.id = m.club_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `).all(userId);

    res.json({ clubs, count: clubs.length });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve clubs: ' + err.message });
  }
});

/**
 * POST /api/clubs/:id/toggle-membership - Join or leave a club
 */
router.post('/:id/toggle-membership', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  const clubId = Number(req.params.id);
  const userId = req.user?.id || 1;

  const club = db.prepare('SELECT id, name, max_members FROM clubs WHERE id = ?').get(clubId) as any;
  if (!club) {
    res.status(404).json({ error: 'Club not found.' });
    return;
  }

  const existing = db.prepare('SELECT id FROM club_memberships WHERE club_id = ? AND user_id = ?').get(clubId, userId) as any;

  if (existing) {
    // Leave club
    db.prepare('DELETE FROM club_memberships WHERE id = ?').run(existing.id);
    res.json({ message: `Left ${club.name}.`, joined: false });
  } else {
    // Check capacity
    const count = (db.prepare('SELECT COUNT(*) as count FROM club_memberships WHERE club_id = ?').get(clubId) as any).count;
    if (club.max_members && count >= club.max_members) {
      res.status(400).json({ error: 'This club has reached its maximum roster capacity.' });
      return;
    }

    db.prepare(`
      INSERT INTO club_memberships (club_id, user_id, role)
      VALUES (?, ?, 'member')
    `).run(clubId, userId);

    res.json({ message: `Successfully joined ${club.name}!`, joined: true });
  }
});

/**
 * POST /api/clubs - Create new club (Staff / Admin)
 */
router.post('/', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  const { name, code, description, category, meeting_day, meeting_time, room, advisor_name, max_members } = req.body;

  if (!name || !code || !description) {
    res.status(400).json({ error: 'Name, code, and description are required.' });
    return;
  }

  try {
    const result = db.prepare(`
      INSERT INTO clubs (name, code, description, category, meeting_day, meeting_time, room, advisor_name, max_members)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name.trim(),
      code.trim().toUpperCase(),
      description.trim(),
      category || 'General',
      meeting_day || 'TBA',
      meeting_time || 'TBA',
      room || 'TBA',
      advisor_name || 'Staff Advisor',
      max_members ? Number(max_members) : 50
    );

    res.status(201).json({ message: 'Club chartered successfully.', clubId: result.lastInsertRowid });
  } catch (err: any) {
    res.status(400).json({ error: 'Failed to create club (Name or code may already exist).' });
  }
});

export default router;

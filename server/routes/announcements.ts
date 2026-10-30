import { Router, Response } from 'express';
import { getDatabase } from '../db.js';
import { optionalAuth, AuthenticatedRequest } from '../auth.js';

const router = Router();

/**
 * GET /api/announcements - Retrieve announcements
 */
router.get('/', optionalAuth, (_req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();

  try {
    const announcements = db.prepare(`
      SELECT id, title, content, priority, target_role, author_name, created_at
      FROM announcements
      ORDER BY 
        CASE priority 
          WHEN 'pinned' THEN 1 
          WHEN 'urgent' THEN 2 
          ELSE 3 
        END,
        created_at DESC
      LIMIT 50
    `).all();

    res.json({ announcements, count: announcements.length });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve announcements: ' + err.message });
  }
});

/**
 * POST /api/announcements - Publish new announcement (Staff / Admin)
 */
router.post('/', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  const { title, content, priority, target_role, author_name } = req.body;

  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required.' });
    return;
  }

  const validPriority = ['normal', 'urgent', 'pinned'].includes(priority) ? priority : 'normal';
  const author = author_name || req.user?.fullName || 'School Administration';

  try {
    const result = db.prepare(`
      INSERT INTO announcements (title, content, priority, target_role, author_name)
      VALUES (?, ?, ?, ?, ?)
    `).run(title.trim(), content.trim(), validPriority, target_role || 'all', author);

    res.status(201).json({ message: 'Announcement published.', announcementId: result.lastInsertRowid });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to publish announcement: ' + err.message });
  }
});

export default router;

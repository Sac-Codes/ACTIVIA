import { Router, Response } from 'express';
import { getDatabase } from '../db.js';
import { optionalAuth, AuthenticatedRequest } from '../auth.js';

const router = Router();

/**
 * GET /api/settings - Retrieve school configuration settings
 */
router.get('/', optionalAuth, (_req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();

  try {
    const rows = db.prepare('SELECT key, value FROM school_settings').all() as Array<{ key: string; value: string }>;
    const settings: Record<string, string> = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }

    res.json({ settings });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve settings: ' + err.message });
  }
});

/**
 * PUT /api/settings - Update school settings (Admin only)
 */
router.put('/', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  const updates = req.body;

  if (!updates || typeof updates !== 'object') {
    res.status(400).json({ error: 'Updates object required.' });
    return;
  }

  try {
    const upsert = db.prepare(`
      INSERT INTO school_settings (key, value, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
    `);

    for (const [key, val] of Object.entries(updates)) {
      upsert.run(key, String(val));
    }

    res.json({ message: 'Settings successfully updated.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update settings: ' + err.message });
  }
});

export default router;

import { Router, Response } from 'express';
import { getDatabase } from '../db.js';
import { optionalAuth, AuthenticatedRequest } from '../auth.js';

const router = Router();

/**
 * GET /api/resources - Retrieve school handbooks, forms, guidelines
 */
router.get('/', optionalAuth, (_req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();

  try {
    const resources = db.prepare(`
      SELECT id, title, category, description, file_url, file_type, created_at
      FROM resources
      ORDER BY category ASC, title ASC
    `).all();

    res.json({ resources, count: resources.length });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve resources: ' + err.message });
  }
});

export default router;

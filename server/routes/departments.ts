import { Router, Request, Response } from 'express';
import { getDatabase } from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../auth.js';

const router = Router();

router.get('/', (_req: Request, res: Response): void => {
  const db = getDatabase();
  const departments = db.prepare(`
    SELECT 
      d.id, d.name, d.code, d.color, d.icon, d.description, d.created_at,
      COUNT(a.id) as activity_count,
      COUNT(CASE WHEN a.status = 'published' THEN 1 END) as published_activity_count
    FROM departments d
    LEFT JOIN activities a ON d.id = a.department_id
    GROUP BY d.id
    ORDER BY d.name ASC
  `).all();

  res.json({ departments });
});

router.post('/', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const { name, code, color, icon, description } = req.body;

  if (!name || !code) {
    res.status(400).json({ error: 'Department name and unique code are required.' });
    return;
  }

  const db = getDatabase();
  try {
    const stmt = db.prepare(`
      INSERT INTO departments (name, code, color, icon, description)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      name.trim(),
      code.trim().toUpperCase(),
      color || '#4f46e5',
      icon || 'BookOpen',
      description ? description.trim() : null
    );

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (admin_id, admin_username, action, entity, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      req.user!.id,
      req.user!.username,
      'CREATE',
      'department',
      Number(result.lastInsertRowid),
      `Created department "${name}" (${code})`
    );

    const created = db.prepare('SELECT * FROM departments WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Department created successfully', department: created });
  } catch (err: any) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      res.status(409).json({ error: 'A department with this name or code already exists.' });
      return;
    }
    res.status(500).json({ error: 'Failed to create department: ' + err.message });
  }
});

export default router;

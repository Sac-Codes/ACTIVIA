import { Router, Request, Response } from 'express';
import fs from 'node:fs';
import { getDatabase, DB_PATH } from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../auth.js';
import { seedDatabase } from '../seed.js';

const router = Router();

// Protect all admin diagnostic routes
router.use(requireAuth);

/**
 * GET /api/admin/audit-logs - View administrative audit trail
 */
router.get('/audit-logs', (_req: Request, res: Response): void => {
  const db = getDatabase();
  const logs = db.prepare(`
    SELECT id, admin_id, admin_username, action, entity, entity_id, details, created_at
    FROM audit_logs
    ORDER BY created_at DESC, id DESC
    LIMIT 50
  `).all();

  res.json({ logs });
});

/**
 * GET /api/admin/db-inspector - Live read-only database inspector for competition judges
 */
router.get('/db-inspector', (_req: Request, res: Response): void => {
  const db = getDatabase();

  // Get file size
  let fileSizeKb = 0;
  try {
    if (fs.existsSync(DB_PATH)) {
      const stats = fs.statSync(DB_PATH);
      fileSizeKb = Math.round((stats.size / 1024) * 10) / 10;
    }
  } catch {
    // Continue
  }

  // Get sqlite version
  const sqliteVersion = (db.prepare('SELECT sqlite_version() as version').get() as any)?.version || '3.x';

  // Table information
  const tables = ['activities', 'departments', 'administrators', 'audit_logs'];
  const inspectorData: Record<string, any> = {};

  for (const table of tables) {
    // Get column schema
    const schema = db.prepare(`PRAGMA table_info(${table})`).all() as any[];
    // Get row count
    const count = (db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as any).count;
    // Get rows (limit 15 for safety and speed)
    let rows: any[] = [];
    if (table === 'administrators') {
      rows = db.prepare(`SELECT id, username, '[PROTECTED_SCRYPT_HASH]' as password_hash, full_name, role, created_at FROM administrators LIMIT 15`).all();
    } else {
      rows = db.prepare(`SELECT * FROM ${table} ORDER BY id DESC LIMIT 15`).all();
    }

    inspectorData[table] = {
      tableName: table,
      rowCount: count,
      columns: schema.map(c => ({ name: c.name, type: c.type, notNull: !!c.notnull, isPk: !!c.pk })),
      sampleRows: rows,
    };
  }

  res.json({
    dbPath: DB_PATH,
    fileSizeKb,
    sqliteVersion,
    tables: inspectorData,
    inspectedAt: new Date().toISOString(),
  });
});

/**
 * POST /api/admin/reset-demo - Instant demo reset to baseline state
 */
router.post('/reset-demo', (req: AuthenticatedRequest, res: Response): void => {
  try {
    seedDatabase(true);
    res.json({ message: 'Demonstration environment successfully reset and re-seeded.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reset demo: ' + err.message });
  }
});

export default router;

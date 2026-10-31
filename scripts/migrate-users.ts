import { getDatabase } from '../server/db.js';

const db = getDatabase();
console.log('Running user schema migration...');

const table = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").get() as { sql: string } | undefined;
console.log('Current SQL:', table?.sql);

db.exec('PRAGMA foreign_keys = OFF;');
db.exec(`
  CREATE TABLE IF NOT EXISTS users_v3 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK(role IN ('admin', 'editor', 'viewer', 'student', 'teacher', 'coordinator')) DEFAULT 'viewer',
    status TEXT NOT NULL CHECK(status IN ('active', 'pending_approval', 'suspended')) DEFAULT 'active',
    grade TEXT DEFAULT NULL,
    class_name TEXT DEFAULT NULL,
    stream TEXT DEFAULT NULL,
    student_id TEXT DEFAULT NULL,
    house TEXT DEFAULT NULL,
    reset_token TEXT DEFAULT NULL,
    reset_token_expiry TEXT DEFAULT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  INSERT OR IGNORE INTO users_v3 (id, username, password_hash, full_name, email, role, status, grade, house, created_at)
  SELECT id, username, password_hash, full_name, email,
    CASE role WHEN 'student' THEN 'viewer' WHEN 'teacher' THEN 'editor' ELSE role END,
    'active', grade, house, created_at
  FROM users;
  DROP TABLE users;
  ALTER TABLE users_v3 RENAME TO users;
  PRAGMA foreign_keys = ON;
`);

console.log('Migration completed successfully!');
const users = db.prepare('SELECT id, username, email, role, status FROM users').all();
console.log('Users in DB now:', users);

import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const DB_PATH = process.env.DATABASE_PATH || path.join(dataDir, 'campusflow.sqlite');

let databaseInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (!databaseInstance) {
    databaseInstance = new DatabaseSync(DB_PATH);
    databaseInstance.exec('PRAGMA foreign_keys = ON;');
    databaseInstance.exec('PRAGMA journal_mode = WAL;');
    initSchema(databaseInstance);
  }
  return databaseInstance;
}

export function initSchema(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      code TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#4f46e5',
      icon TEXT NOT NULL DEFAULT 'BookOpen',
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS administrators (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      start_datetime TEXT NOT NULL,
      end_datetime TEXT NOT NULL,
      venue TEXT NOT NULL,
      organizer TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('draft', 'published', 'completed', 'cancelled')) DEFAULT 'published',
      featured INTEGER NOT NULL DEFAULT 0,
      capacity INTEGER DEFAULT NULL,
      registration_url TEXT DEFAULT NULL,
      participation_instructions TEXT DEFAULT NULL,
      created_by INTEGER REFERENCES administrators(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER REFERENCES administrators(id),
      admin_username TEXT NOT NULL,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id INTEGER,
      details TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date);
    CREATE INDEX IF NOT EXISTS idx_activities_dept ON activities(department_id);
    CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
    CREATE INDEX IF NOT EXISTS idx_activities_venue ON activities(venue);
    CREATE INDEX IF NOT EXISTS idx_activities_start ON activities(start_datetime);
  `);
}

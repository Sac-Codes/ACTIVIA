# CampusFlow — Smart School Activity Dashboard
> **Competition-Ready School Activity Coordination Platform**

[![Tests](https://img.shields.io/badge/Tests-12%2F12%20Passing-emerald)](./tests/api.test.ts)
[![Database](https://img.shields.io/badge/Database-SQLite%20(WAL%20Mode)-indigo)](./server/db.ts)
[![Engine](https://img.shields.io/badge/Backend-Node.js%2025%20%2B%20Express-blue)](./server/index.ts)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%20%2B%20Tailwind-teal)](./src/App.tsx)

---

## 1. Project Overview

**CampusFlow** is a complete, production-grade school activity coordination web platform designed to solve the real-world communication breakdowns and scheduling collisions common across educational institutions. 

Instead of scattered flyers, buried group chat announcements, and double-booked auditoriums, CampusFlow provides **one reliable digital destination**:
- **Students & General Viewers:** Browse upcoming events, filter by academic department, search by keywords, view chronological day-by-day agendas, inspect full event instructions, and export events to Google/Apple Calendar (`.ics`).
- **School Administrators:** Access a protected management console secured by cryptographic `scrypt` hashing and session tokens to publish, edit, archive, and delete activities with real-time **Schedule Conflict Detection** and an integrated **Database Inspector**.

---

## 2. Technology Stack

| Layer | Technology | Rationale & Architecture |
|---|---|---|
| **Frontend** | React 18, TypeScript, Vite 6, Tailwind CSS | Lightning-fast rendering, strict typing, responsive design tokens |
| **Icons & UI** | Lucide React | Uniform iconography, accessible ARIA states, no generic emojis |
| **Backend API** | Node.js (v25), Express, TypeScript (tsx) | Fast REST endpoints, robust request validation, JSON error schemas |
| **Database** | SQLite (`node:sqlite` DatabaseSync) | Self-contained, zero cloud dependencies, WAL journal mode, Foreign Key constraints |
| **Security & Auth** | Node `crypto.scryptSync`, HMAC SHA-256 tokens | Salted 64-byte derived keys, timing-safe equality checks, HTTP-only cookies |
| **Automated Testing**| Node.js Native Test Runner (`node:test`) | 12 comprehensive automated integration tests running against real database |

---

## 3. Quick Start & Demonstration Commands

### Prerequisites
- Node.js v20+ (Node.js v25+ recommended)
- npm v10+

### Installation
```bash
npm install
```

### Initialize / Seed Demonstration Database
```bash
npm run seed
```
> *Seeds 6 campus departments (STEM, Fine Arts, Athletics, Debate, Student Council, Career), 11 curated activities across dates and statuses, and the default competition administrator account.*

### Run in Development Mode
Starts both the Express API server (port 5000) and the Vite development server (port 5173 with proxy) simultaneously:
```bash
npm run dev
```

### Run Production Build (Self-Contained Local Demonstration)
```bash
npm run build
npm start
```
The application will be live at **`http://localhost:5000`** serving both the REST API and the bundled frontend.

---

## 4. Competition Demonstration Credentials

| Role | Username | Password | Notes |
|---|---|---|---|
| **Administrator** | `admin` | `CampusFlow2026!` | Pre-seeded with full privileges. The login modal includes a one-click **"Auto-Fill"** button for zero-friction judge presentations. |

---

## 5. Automated Test Suite

Run the full suite of 12 automated integration tests:
```bash
npm test
```

### Test Coverage Highlights:
1. `Health Check Endpoint`: Validates server and database health status.
2. `Public Activity Listing`: Proves draft activities are never publicly exposed.
3. `Department Filtering`: Confirms filtering by department ID returns matching records.
4. `Full-Text Search`: Tests keyword querying across titles, venues, and organizers.
5. `Authentication Rejection`: Confirms invalid credentials return HTTP 401.
6. `Authentication Success`: Confirms valid credentials issue signed session tokens.
7. `Protected Endpoints`: Confirms management operations reject unauthenticated calls.
8. `Time Range Validation`: Verifies that end times earlier than start times are rejected with 400.
9. `Conflict Detection`: Verifies that concurrent venue bookings are flagged.
10. `Full CRUD Cycle`: Creates, reads, updates, and deletes an activity record with database persistence.
11. `Database Inspector`: Verifies schema introspection and masks sensitive password hashes.
12. `Audit Log Trail`: Verifies all administrative mutations are permanently logged.

---

## 6. High-Value Innovations

### 1. Real-Time Schedule Conflict Engine
When an administrator creates or edits an event, the system checks whether the selected venue is already occupied on that date during the requested time window (`start_time < existing_end AND end_time > existing_start`). Overlaps trigger an instant warning banner detailing the conflicting event before saving.

### 2. Live Read-Only Database Inspector (Judges' Screen)
Located in the Administrator Console under the **Database Inspector** tab:
- Shows live SQLite database file path, file size in KB, and SQLite version.
- Displays full schemas for `activities`, `departments`, `administrators`, and `audit_logs`.
- Displays real table rows with password hashes safely redacted to `[PROTECTED_SCRYPT_HASH]`.

### 3. Chronological Agenda Schedule & iCal Export
- Public timeline view grouping activities by date with visual day tracks ("Today", "Tomorrow").
- One-click `.ics` calendar generation to import activities into Google Calendar, Outlook, or Apple Calendar.
- Export entire schedule to formatted CSV file (`/api/activities/export/csv`).

### 4. Demo Environment Instant Reset
A protected one-click reset endpoint restores the exact competition baseline dataset should judges request repeated testing.

---

## 7. Database Schema & Architecture

```sql
-- Departments table
CREATE TABLE departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#4f46e5',
  icon TEXT NOT NULL DEFAULT 'BookOpen',
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Administrators table
CREATE TABLE administrators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Activities table
CREATE TABLE activities (
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

-- Audit Logs table
CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER REFERENCES administrators(id),
  admin_username TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id INTEGER,
  details TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

---

## 8. Presentation & Delivery Guides
- [PRESENTATION_SCRIPT.md](./PRESENTATION_SCRIPT.md): 10-minute competition speaking script timed to the second.
- [DEMO_CHECKLIST.md](./DEMO_CHECKLIST.md): Step-by-step checklist for the live judging session.
- [QA_REPORT.md](./QA_REPORT.md): Complete verification and test report.

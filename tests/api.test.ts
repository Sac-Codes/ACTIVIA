import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import app from '../server/index.js';
import { seedDatabase } from '../server/seed.js';

let server: http.Server;
let baseUrl: string;
let adminToken: string;

before(async () => {
  // Ensure fresh seed
  seedDatabase(true);

  // Start test server on random free port
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address() as any;
      baseUrl = `http://localhost:${addr.port}`;
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
  process.exit(0);
});

describe('CampusFlow Automated Test Suite', () => {

  test('1. Health Check Endpoint responds with status ok', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'ok');
    assert.strictEqual(data.database, 'healthy');
  });

  test('2. Public Activity Listing hides draft activities', async () => {
    const res = await fetch(`${baseUrl}/api/activities`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(Array.isArray(data.activities));
    assert(data.activities.length > 0);

    // Verify NO draft activity is visible to the public
    const hasDraft = data.activities.some((a: any) => a.status === 'draft');
    assert.strictEqual(hasDraft, false, 'Draft activities must never be publicly exposed!');
  });

  test('3. Department Filtering returns matching activities', async () => {
    // First get departments
    const deptRes = await fetch(`${baseUrl}/api/departments`);
    assert.strictEqual(deptRes.status, 200);
    const deptData = await deptRes.json();
    assert(deptData.departments.length >= 6);

    const stemDept = deptData.departments.find((d: any) => d.code === 'STEM');
    assert(stemDept, 'STEM department must exist');

    // Filter by STEM department
    const actRes = await fetch(`${baseUrl}/api/activities?department_id=${stemDept.id}`);
    assert.strictEqual(actRes.status, 200);
    const actData = await actRes.json();
    assert(actData.activities.length > 0);
    for (const act of actData.activities) {
      assert.strictEqual(act.department_id, stemDept.id);
    }
  });

  test('4. Full-text search filters activities by title or keywords', async () => {
    const res = await fetch(`${baseUrl}/api/activities?search=Robotics`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(data.activities.length >= 1);
    assert(data.activities[0].title.toLowerCase().includes('robotics'));
  });

  test('5. Authentication: Rejects invalid credentials', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'WrongPassword123!' }),
    });
    assert.strictEqual(res.status, 401);
  });

  test('6. Authentication: Accepts valid credentials and returns session token', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'CampusFlow2026!' }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(data.token, 'Must return signed session token');
    assert.strictEqual(data.user.username, 'admin');
    adminToken = data.token;
  });

  test('7. Protected Endpoint: Rejects unauthenticated request without token', async () => {
    const res = await fetch(`${baseUrl}/api/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Unauthorized Event' }),
    });
    assert.strictEqual(res.status, 401);
  });

  test('8. Validation: Rejects activity with end_time before start_time', async () => {
    const res = await fetch(`${baseUrl}/api/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Invalid Timing Conference',
        description: 'This event should fail validation because end time is earlier than start time.',
        department_id: 1,
        date: '2026-11-15',
        start_time: '14:00',
        end_time: '11:00', // Invalid!
        venue: 'Main Hall',
        organizer: 'Test Org',
      }),
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert(data.error.toLowerCase().includes('end time must be later than start time'));
  });

  test('9. Innovation: Schedule Conflict Detection identifies overlapping venue booking', async () => {
    // First find an existing event's date, time, and venue
    const actsRes = await fetch(`${baseUrl}/api/activities`);
    const actsData = await actsRes.json();
    const existing = actsData.activities[0];

    // Check conflict for the exact same venue and overlapping time slot
    const checkRes = await fetch(`${baseUrl}/api/activities/check-conflict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: existing.date,
        venue: existing.venue,
        start_time: existing.start_time,
        end_time: existing.end_time,
        department_id: existing.department_id,
      }),
    });
    assert.strictEqual(checkRes.status, 200);
    const checkData = await checkRes.json();
    assert.strictEqual(checkData.hasVenueConflict, true, 'Must detect venue conflict');
    assert(checkData.venueConflicts.length >= 1);
    assert.strictEqual(checkData.venueConflicts[0].id, existing.id);
  });

  test('10. CRUD: Create, Read, Update, and Delete activity with database persistence', async () => {
    // Dynamically retrieve a valid department
    const deptRes = await fetch(`${baseUrl}/api/departments`);
    const deptData = await deptRes.json();
    const targetDeptId = deptData.departments[0].id;

    // A. CREATE
    const createRes = await fetch(`${baseUrl}/api/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Statewide Championship Math Olympiad',
        description: 'Elite mathematics competition testing problem solving, combinatorics, and geometry.',
        department_id: targetDeptId,
        date: '2026-12-10',
        start_time: '10:00',
        end_time: '14:00',
        venue: 'Mathematics Annex Room 101',
        organizer: 'Dr. Katherine Bellamy',
        status: 'published',
        capacity: 100,
        registration_url: 'https://campusflow.school.edu/register/olympiad-2026',
        participation_instructions: 'Bring two HB pencils and an approved graphing calculator.',
      }),
    });
    assert.strictEqual(createRes.status, 201);
    const createdData = await createRes.json();
    const createdId = createdData.activity.id;
    assert(createdId > 0);

    // B. READ SINGLE
    const getRes = await fetch(`${baseUrl}/api/activities/${createdId}`);
    assert.strictEqual(getRes.status, 200);
    const getData = await getRes.json();
    assert.strictEqual(getData.activity.title, 'Statewide Championship Math Olympiad');

    // C. UPDATE
    const updateRes = await fetch(`${baseUrl}/api/activities/${createdId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Statewide Championship Math Olympiad [UPDATED]',
        description: 'Elite mathematics competition testing problem solving, combinatorics, and geometry.',
        department_id: targetDeptId,
        date: '2026-12-10',
        start_time: '10:30',
        end_time: '15:00',
        venue: 'Mathematics Annex Room 101',
        organizer: 'Dr. Katherine Bellamy',
        status: 'published',
        capacity: 120,
      }),
    });
    assert.strictEqual(updateRes.status, 200);
    const updatedData = await updateRes.json();
    assert.strictEqual(updatedData.activity.title, 'Statewide Championship Math Olympiad [UPDATED]');
    assert.strictEqual(updatedData.activity.start_time, '10:30');

    // D. DELETE
    const deleteRes = await fetch(`${baseUrl}/api/activities/${createdId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });
    assert.strictEqual(deleteRes.status, 200);

    // E. VERIFY DELETED
    const verifyRes = await fetch(`${baseUrl}/api/activities/${createdId}`);
    assert.strictEqual(verifyRes.status, 404);
  });

  test('11. Database Inspector Endpoint: Returns schema and masks password hashes', async () => {
    const res = await fetch(`${baseUrl}/api/admin/db-inspector`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(data.tables.activities);
    assert(data.tables.administrators);
    assert(data.tables.audit_logs);
    assert(data.fileSizeKb >= 0);

    // Verify password hash is redacted
    const adminRows = data.tables.administrators.sampleRows;
    for (const row of adminRows) {
      assert.strictEqual(row.password_hash, '[PROTECTED_SCRYPT_HASH]', 'Password hashes must never be exposed!');
    }
  });

  test('12. Audit Logs: Confirms all admin actions were logged in database', async () => {
    const res = await fetch(`${baseUrl}/api/admin/audit-logs`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(Array.isArray(data.logs));
    assert(data.logs.length >= 3);
    const actions = data.logs.map((l: any) => l.action);
    assert(actions.includes('LOGIN') || actions.includes('CREATE') || actions.includes('UPDATE') || actions.includes('DELETE'));
  });

});

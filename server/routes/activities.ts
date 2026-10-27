import { Router, Request, Response } from 'express';
import { getDatabase } from '../db.js';
import { requireAuth, optionalAuth, AuthenticatedRequest } from '../auth.js';

const router = Router();

/**
 * GET /api/activities/stats - Dashboard summary statistics derived from real data
 */
router.get('/stats', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  const isAdmin = !!req.user;
  const todayStr = new Date().toISOString().split('T')[0];

  const total = db.prepare(`SELECT COUNT(*) as count FROM activities ${isAdmin ? '' : "WHERE status != 'draft'"}`).get() as { count: number };
  const published = db.prepare("SELECT COUNT(*) as count FROM activities WHERE status = 'published'").get() as { count: number };
  const upcoming = db.prepare(`SELECT COUNT(*) as count FROM activities WHERE date >= ? ${isAdmin ? '' : "AND status != 'draft'"} AND status != 'cancelled'`).get(todayStr) as { count: number };
  const completed = db.prepare("SELECT COUNT(*) as count FROM activities WHERE status = 'completed'").get() as { count: number };
  const cancelled = db.prepare("SELECT COUNT(*) as count FROM activities WHERE status = 'cancelled'").get() as { count: number };
  const drafts = db.prepare("SELECT COUNT(*) as count FROM activities WHERE status = 'draft'").get() as { count: number };

  const deptCounts = db.prepare(`
    SELECT d.id, d.name, d.code, d.color, COUNT(a.id) as count
    FROM departments d
    LEFT JOIN activities a ON d.id = a.department_id ${isAdmin ? '' : "AND a.status != 'draft'"}
    GROUP BY d.id
    ORDER BY count DESC
  `).all();

  const venues = db.prepare(`
    SELECT venue, COUNT(*) as count
    FROM activities
    ${isAdmin ? '' : "WHERE status != 'draft'"}
    GROUP BY venue
    ORDER BY count DESC
    LIMIT 5
  `).all();

  const busiestDay = db.prepare(`
    SELECT date, COUNT(*) as count
    FROM activities
    WHERE date >= ? ${isAdmin ? '' : "AND status != 'draft'"}
    GROUP BY date
    ORDER BY count DESC
    LIMIT 1
  `).get(todayStr) as { date: string; count: number } | undefined;

  res.json({
    totalActivities: total.count,
    upcomingCount: upcoming.count,
    publishedCount: published.count,
    completedCount: completed.count,
    cancelledCount: cancelled.count,
    draftCount: drafts.count,
    departmentCount: deptCounts.length,
    byDepartment: deptCounts,
    topVenues: venues,
    busiestUpcomingDate: busiestDay || null,
  });
});

/**
 * GET /api/activities/export/csv - Schedule export in CSV format
 */
router.get('/export/csv', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  const isAdmin = !!req.user;

  const activities = db.prepare(`
    SELECT 
      a.id, a.title, d.name as department, a.date, a.start_time, a.end_time,
      a.venue, a.organizer, a.status, a.capacity, a.registration_url, a.description
    FROM activities a
    JOIN departments d ON a.department_id = d.id
    ${isAdmin ? '' : "WHERE a.status = 'published'"}
    ORDER BY a.date ASC, a.start_time ASC
  `).all() as any[];

  const escapeCsv = (str: any) => {
    if (str === null || str === undefined) return '""';
    const clean = String(str).replace(/"/g, '""');
    return `"${clean}"`;
  };

  const header = ['ID', 'Title', 'Department', 'Date', 'Start Time', 'End Time', 'Venue', 'Organizer', 'Status', 'Capacity', 'Registration URL', 'Description'].join(',');
  const rows = activities.map(a => [
    a.id,
    escapeCsv(a.title),
    escapeCsv(a.department),
    escapeCsv(a.date),
    escapeCsv(a.start_time),
    escapeCsv(a.end_time),
    escapeCsv(a.venue),
    escapeCsv(a.organizer),
    escapeCsv(a.status),
    a.capacity ?? '',
    escapeCsv(a.registration_url),
    escapeCsv(a.description)
  ].join(','));

  const csvContent = [header, ...rows].join('\r\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="campusflow_activities_schedule.csv"');
  res.send(csvContent);
});

/**
 * POST /api/activities/check-conflict - Schedule Conflict Detection
 */
router.post('/check-conflict', (req: Request, res: Response): void => {
  const { date, start_time, end_time, venue, department_id, exclude_id } = req.body;

  if (!date || !start_time || !end_time || !venue) {
    res.status(400).json({ error: 'Date, start_time, end_time, and venue are required for conflict checking.' });
    return;
  }

  const db = getDatabase();
  const excludeId = exclude_id ? Number(exclude_id) : -1;

  // Venue conflict: same date, same venue, overlapping time, not cancelled
  const venueConflicts = db.prepare(`
    SELECT 
      a.id, a.title, a.start_time, a.end_time, a.venue, d.name as department_name
    FROM activities a
    JOIN departments d ON a.department_id = d.id
    WHERE a.date = ?
      AND LOWER(a.venue) = LOWER(?)
      AND a.id != ?
      AND a.status != 'cancelled'
      AND (a.start_time < ? AND a.end_time > ?)
  `).all(date, venue.trim(), excludeId, end_time, start_time);

  // Department overlap check: same department hosting multiple concurrent events
  let departmentOverlaps: any[] = [];
  if (department_id) {
    departmentOverlaps = db.prepare(`
      SELECT 
        a.id, a.title, a.start_time, a.end_time, a.venue
      FROM activities a
      WHERE a.date = ?
        AND a.department_id = ?
        AND a.id != ?
        AND a.status != 'cancelled'
        AND (a.start_time < ? AND a.end_time > ?)
    `).all(date, Number(department_id), excludeId, end_time, start_time);
  }

  res.json({
    hasVenueConflict: venueConflicts.length > 0,
    venueConflicts,
    hasDepartmentOverlap: departmentOverlaps.length > 0,
    departmentOverlaps,
  });
});

/**
 * GET /api/activities - Retrieve activities with search, filter, sort
 */
router.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  const isAdmin = !!req.user;

  const { search, department_id, date_filter, date, status, sort } = req.query;

  const conditions: string[] = [];
  const params: any[] = [];

  // Public users can never view draft activities
  if (!isAdmin) {
    if (status && status !== 'draft' && status !== 'all') {
      conditions.push('a.status = ?');
      params.push(status);
    } else {
      conditions.push("a.status != 'draft'");
    }
  } else {
    // Admin user filtering
    if (status && status !== 'all') {
      conditions.push('a.status = ?');
      params.push(status);
    }
  }

  // Department filter
  if (department_id) {
    conditions.push('a.department_id = ?');
    params.push(Number(department_id));
  }

  // Exact date filter
  if (date) {
    conditions.push('a.date = ?');
    params.push(date);
  }

  // Preset Date range filters
  const todayStr = new Date().toISOString().split('T')[0];
  if (date_filter) {
    if (date_filter === 'today') {
      conditions.push('a.date = ?');
      params.push(todayStr);
    } else if (date_filter === 'this_week') {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];
      conditions.push('a.date >= ? AND a.date <= ?');
      params.push(todayStr, nextWeekStr);
    } else if (date_filter === 'upcoming') {
      conditions.push('a.date >= ?');
      params.push(todayStr);
    } else if (date_filter === 'past') {
      conditions.push('a.date < ?');
      params.push(todayStr);
    }
  }

  // Full-text search
  if (search && String(search).trim()) {
    const term = `%${String(search).trim()}%`;
    conditions.push('(a.title LIKE ? OR a.description LIKE ? OR a.venue LIKE ? OR a.organizer LIKE ?)');
    params.push(term, term, term, term);
  }

  // Sorting
  let orderBy = 'a.date ASC, a.start_time ASC';
  if (sort === 'date_desc') {
    orderBy = 'a.date DESC, a.start_time DESC';
  } else if (sort === 'title_asc') {
    orderBy = 'a.title ASC';
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT 
      a.id, a.title, a.description, a.department_id, a.date, a.start_time, a.end_time,
      a.start_datetime, a.end_datetime, a.venue, a.organizer, a.status, a.featured,
      a.capacity, a.registration_url, a.participation_instructions, a.created_by,
      a.created_at, a.updated_at,
      d.name as department_name, d.code as department_code, d.color as department_color, d.icon as department_icon
    FROM activities a
    JOIN departments d ON a.department_id = d.id
    ${whereClause}
    ORDER BY ${orderBy}
  `;

  const activities = db.prepare(query).all(...params);
  res.json({ activities, count: activities.length });
});

/**
 * GET /api/activities/:id - Retrieve single activity details
 */
router.get('/:id', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  const db = getDatabase();
  const isAdmin = !!req.user;
  const id = Number(req.params.id);

  const activity = db.prepare(`
    SELECT 
      a.id, a.title, a.description, a.department_id, a.date, a.start_time, a.end_time,
      a.start_datetime, a.end_datetime, a.venue, a.organizer, a.status, a.featured,
      a.capacity, a.registration_url, a.participation_instructions, a.created_by,
      a.created_at, a.updated_at,
      d.name as department_name, d.code as department_code, d.color as department_color, d.icon as department_icon
    FROM activities a
    JOIN departments d ON a.department_id = d.id
    WHERE a.id = ?
  `).get(id) as any;

  if (!activity) {
    res.status(404).json({ error: 'Activity not found.' });
    return;
  }

  if (activity.status === 'draft' && !isAdmin) {
    res.status(404).json({ error: 'Activity not found or is currently private.' });
    return;
  }

  res.json({ activity });
});

/**
 * POST /api/activities - Create new activity (Admin only)
 */
router.post('/', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const {
    title, description, department_id, date, start_time, end_time,
    venue, organizer, status, featured, capacity, registration_url, participation_instructions
  } = req.body;

  // Validation
  const errors: string[] = [];
  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push('Title is required and must be at least 3 characters.');
  }
  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    errors.push('Description is required and must be at least 10 characters.');
  }
  if (!department_id || isNaN(Number(department_id))) {
    errors.push('A valid department must be selected.');
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    errors.push('Date is required in YYYY-MM-DD format.');
  }
  if (!start_time || !/^\d{2}:\d{2}$/.test(start_time)) {
    errors.push('Start time is required in HH:MM format.');
  }
  if (!end_time || !/^\d{2}:\d{2}$/.test(end_time)) {
    errors.push('End time is required in HH:MM format.');
  }
  if (start_time && end_time && start_time >= end_time) {
    errors.push('End time must be later than start time.');
  }
  if (!venue || typeof venue !== 'string' || venue.trim().length < 2) {
    errors.push('Venue is required.');
  }
  if (!organizer || typeof organizer !== 'string' || organizer.trim().length < 2) {
    errors.push('Organizer is required.');
  }

  const validStatuses = ['draft', 'published', 'completed', 'cancelled'];
  const activityStatus = status && validStatuses.includes(status) ? status : 'published';

  if (registration_url && typeof registration_url === 'string' && registration_url.trim()) {
    try {
      new URL(registration_url);
    } catch {
      errors.push('Registration URL must be a valid URL (including https://).');
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ error: errors.join(' ') });
    return;
  }

  const db = getDatabase();

  // Verify department exists
  const dept = db.prepare('SELECT id FROM departments WHERE id = ?').get(Number(department_id));
  if (!dept) {
    res.status(400).json({ error: 'Selected department does not exist.' });
    return;
  }

  const startDatetime = `${date}T${start_time}:00`;
  const endDatetime = `${date}T${end_time}:00`;

  try {
    const insertStmt = db.prepare(`
      INSERT INTO activities (
        title, description, department_id, date, start_time, end_time,
        start_datetime, end_datetime, venue, organizer, status, featured,
        capacity, registration_url, participation_instructions, created_by
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?
      )
    `);

    const result = insertStmt.run(
      title.trim(),
      description.trim(),
      Number(department_id),
      date,
      start_time,
      end_time,
      startDatetime,
      endDatetime,
      venue.trim(),
      organizer.trim(),
      activityStatus,
      featured ? 1 : 0,
      capacity ? Number(capacity) : null,
      registration_url ? registration_url.trim() : null,
      participation_instructions ? participation_instructions.trim() : null,
      req.user!.id
    );

    const newActivityId = Number(result.lastInsertRowid);

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (admin_id, admin_username, action, entity, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      req.user!.id,
      req.user!.username,
      'CREATE',
      'activity',
      newActivityId,
      `Created activity "${title.trim()}" scheduled for ${date} at ${venue.trim()} (${activityStatus})`
    );

    const created = db.prepare(`
      SELECT 
        a.*, d.name as department_name, d.code as department_code, d.color as department_color, d.icon as department_icon
      FROM activities a
      JOIN departments d ON a.department_id = d.id
      WHERE a.id = ?
    `).get(newActivityId);

    res.status(201).json({ message: 'Activity created successfully.', activity: created });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create activity: ' + err.message });
  }
});

/**
 * PUT /api/activities/:id - Update activity (Admin only)
 */
router.put('/:id', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const id = Number(req.params.id);
  const db = getDatabase();

  const existing = db.prepare('SELECT * FROM activities WHERE id = ?').get(id) as any;
  if (!existing) {
    res.status(404).json({ error: 'Activity not found.' });
    return;
  }

  const {
    title, description, department_id, date, start_time, end_time,
    venue, organizer, status, featured, capacity, registration_url, participation_instructions
  } = req.body;

  // Validation
  const errors: string[] = [];
  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push('Title is required and must be at least 3 characters.');
  }
  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    errors.push('Description is required and must be at least 10 characters.');
  }
  if (!department_id || isNaN(Number(department_id))) {
    errors.push('A valid department must be selected.');
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    errors.push('Date is required in YYYY-MM-DD format.');
  }
  if (!start_time || !/^\d{2}:\d{2}$/.test(start_time)) {
    errors.push('Start time is required in HH:MM format.');
  }
  if (!end_time || !/^\d{2}:\d{2}$/.test(end_time)) {
    errors.push('End time is required in HH:MM format.');
  }
  if (start_time && end_time && start_time >= end_time) {
    errors.push('End time must be later than start time.');
  }
  if (!venue || typeof venue !== 'string' || venue.trim().length < 2) {
    errors.push('Venue is required.');
  }
  if (!organizer || typeof organizer !== 'string' || organizer.trim().length < 2) {
    errors.push('Organizer is required.');
  }

  const validStatuses = ['draft', 'published', 'completed', 'cancelled'];
  const activityStatus = status && validStatuses.includes(status) ? status : existing.status;

  if (registration_url && typeof registration_url === 'string' && registration_url.trim()) {
    try {
      new URL(registration_url);
    } catch {
      errors.push('Registration URL must be a valid URL.');
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ error: errors.join(' ') });
    return;
  }

  const startDatetime = `${date}T${start_time}:00`;
  const endDatetime = `${date}T${end_time}:00`;

  try {
    db.prepare(`
      UPDATE activities SET
        title = ?,
        description = ?,
        department_id = ?,
        date = ?,
        start_time = ?,
        end_time = ?,
        start_datetime = ?,
        end_datetime = ?,
        venue = ?,
        organizer = ?,
        status = ?,
        featured = ?,
        capacity = ?,
        registration_url = ?,
        participation_instructions = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      title.trim(),
      description.trim(),
      Number(department_id),
      date,
      start_time,
      end_time,
      startDatetime,
      endDatetime,
      venue.trim(),
      organizer.trim(),
      activityStatus,
      featured ? 1 : 0,
      capacity ? Number(capacity) : null,
      registration_url ? registration_url.trim() : null,
      participation_instructions ? participation_instructions.trim() : null,
      id
    );

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (admin_id, admin_username, action, entity, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      req.user!.id,
      req.user!.username,
      'UPDATE',
      'activity',
      id,
      `Updated activity #${id} "${title.trim()}" (Status: ${activityStatus})`
    );

    const updated = db.prepare(`
      SELECT 
        a.*, d.name as department_name, d.code as department_code, d.color as department_color, d.icon as department_icon
      FROM activities a
      JOIN departments d ON a.department_id = d.id
      WHERE a.id = ?
    `).get(id);

    res.json({ message: 'Activity updated successfully.', activity: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update activity: ' + err.message });
  }
});

/**
 * DELETE /api/activities/:id - Delete activity (Admin only)
 */
router.delete('/:id', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const id = Number(req.params.id);
  const db = getDatabase();

  const existing = db.prepare('SELECT id, title, venue, date FROM activities WHERE id = ?').get(id) as any;
  if (!existing) {
    res.status(404).json({ error: 'Activity not found.' });
    return;
  }

  try {
    db.prepare('DELETE FROM activities WHERE id = ?').run(id);

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (admin_id, admin_username, action, entity, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      req.user!.id,
      req.user!.username,
      'DELETE',
      'activity',
      id,
      `Deleted activity #${id} "${existing.title}"`
    );

    res.json({ message: `Activity "${existing.title}" deleted successfully.` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete activity: ' + err.message });
  }
});

export default router;

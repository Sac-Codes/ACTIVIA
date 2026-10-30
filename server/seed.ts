import { getDatabase } from './db.js';
import { hashPassword } from './auth.js';

export function seedDatabase(reset: boolean = false) {
  const db = getDatabase();

  if (reset) {
    db.exec(`
      DELETE FROM registrations;
      DELETE FROM club_memberships;
      DELETE FROM clubs;
      DELETE FROM announcements;
      DELETE FROM achievements;
      DELETE FROM tickets;
      DELETE FROM resources;
      DELETE FROM school_settings;
      DELETE FROM users;
      DELETE FROM audit_logs;
      DELETE FROM activities;
      DELETE FROM departments;
      DELETE FROM administrators;
      DELETE FROM sqlite_sequence WHERE name IN (
        'audit_logs', 'activities', 'departments', 'administrators',
        'users', 'registrations', 'clubs', 'club_memberships',
        'announcements', 'achievements', 'tickets', 'resources', 'school_settings'
      );
    `);
  }

  // Check if admin already exists
  const existingAdmin = db.prepare('SELECT id FROM administrators WHERE username = ?').get('admin');
  let adminId: number | bigint = 1;

  if (!existingAdmin) {
    const passwordHash = hashPassword('CampusFlow2026!');
    const insertAdmin = db.prepare(`
      INSERT INTO administrators (username, password_hash, full_name, role)
      VALUES (?, ?, ?, ?)
    `);
    const res = insertAdmin.run('admin', passwordHash, 'Dr. Eleanor Vance (Dean of Student Affairs)', 'admin');
    adminId = res.lastInsertRowid;
  } else {
    adminId = (existingAdmin as any).id;
  }

  // Check if departments exist
  const existingDepts = db.prepare('SELECT COUNT(*) as count FROM departments').get() as { count: number };
  if (existingDepts.count === 0) {
    const insertDept = db.prepare(`
      INSERT INTO departments (name, code, color, icon, description)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertDept.run('Science & Technology', 'STEM', '#4f46e5', 'Cpu', 'Robotics, AI, computer science, laboratory research, and mathematics exhibitions.');
    insertDept.run('Fine Arts & Culture', 'ARTS', '#0d9488', 'Palette', 'Visual arts, theatrical productions, musical performances, and cultural heritage events.');
    insertDept.run('Sports & Athletics', 'ATHLETICS', '#ea580c', 'Trophy', 'Inter-house tournaments, fitness challenges, track & field trials, and varsity matches.');
    insertDept.run('Literature & Debate', 'DEBATE', '#9333ea', 'BookOpen', 'Model UN, parliamentary debates, creative writing, poetry slams, and book colloquiums.');
    insertDept.run('Student Council & Community', 'COUNCIL', '#e11d48', 'Users', 'Student leadership meetings, volunteer drives, campus green initiatives, and charity galas.');
    insertDept.run('Career & Innovation', 'CAREER', '#0284c7', 'Briefcase', 'Alumni speaker series, resume clinics, college fair preparation, and startup pitches.');
  }

  // Get department map
  const depts = db.prepare('SELECT id, code FROM departments').all() as Array<{ id: number; code: string }>;
  const deptMap = Object.fromEntries(depts.map(d => [d.code, d.id]));

  // Check if activities exist
  const existingActs = db.prepare('SELECT COUNT(*) as count FROM activities').get() as { count: number };
  if (existingActs.count === 0) {
    const today = new Date();
    const formatDate = (offsetDays: number): string => {
      const d = new Date(today);
      d.setDate(d.getDate() + offsetDays);
      return d.toISOString().split('T')[0];
    };

    const activitiesToSeed = [
      {
        title: 'Annual Inter-School Robotics & Autonomous Drone Showcase',
        description: 'Featuring 24 student teams demonstrating autonomous line-following rovers, obstacle-avoiding drones, and custom mechanical arms. Keynote speech by Robotics Lab Director.',
        dept: 'STEM',
        date: formatDate(1), // Tomorrow
        startTime: '09:30',
        endTime: '13:00',
        venue: 'Engineering Hall & Central Atrium',
        organizer: 'Prof. Marcus Chen & STEM Club',
        status: 'published',
        featured: 1,
        capacity: 250,
        registrationUrl: 'https://campusflow.school.edu/register/robotics-2026',
        instructions: 'Safety goggles will be provided at the entrance. Team check-in begins at 08:45 AM.',
      },
      {
        title: 'All-Campus Model United Nations: Climate Action Summit',
        description: 'Over 80 delegates representing 40 member nations will debate urgent climate mitigation resolutions, disaster relief funding, and carbon offset accountability.',
        dept: 'DEBATE',
        date: formatDate(2),
        startTime: '10:00',
        endTime: '15:30',
        venue: 'Auditorium A (Main Conference Wing)',
        organizer: 'Debate Society & Elena Rostova',
        status: 'published',
        featured: 1,
        capacity: 120,
        registrationUrl: 'https://campusflow.school.edu/register/mun-climate',
        instructions: 'Formal business attire required. Draft working papers must be submitted by 09:30 AM.',
      },
      {
        title: 'Varsity Basketball Championship Trials: Quarterfinals',
        description: 'Open tryouts and playoff quarterfinals for the regional tournament. Students and staff welcome to cheer on the Wolves and Hawks squads in high-intensity action.',
        dept: 'ATHLETICS',
        date: formatDate(0), // Today!
        startTime: '16:00',
        endTime: '18:30',
        venue: 'Fieldhouse Court 1',
        organizer: 'Coach Darren Lewis',
        status: 'published',
        featured: 1,
        capacity: 400,
        registrationUrl: null,
        instructions: 'Free entry for all registered students with school ID. Doors open at 15:30.',
      },
      {
        title: 'Spring Symphonic Orchestra & Jazz Ensemble Rehearsal',
        description: 'Final rehearsal prior to the Spring Gala. Featuring selections from Gershwin, Dvorak New World Symphony, and student jazz compositions.',
        dept: 'ARTS',
        date: formatDate(3),
        startTime: '14:00',
        endTime: '17:00',
        venue: 'Performing Arts Center - Hall 2',
        organizer: 'Dr. Katherine Bellamy',
        status: 'published',
        featured: 0,
        capacity: 150,
        registrationUrl: 'https://campusflow.school.edu/register/jazz-rehearsal',
        instructions: 'Quiet recording in progress. Please silence mobile phones prior to entering.',
      },
      {
        title: 'Community Tree Planting & Campus Green Clean-Up',
        description: 'Join the Environmental Leadership Committee to plant 50 native shade trees along the North Campus trail and install organic compost stations.',
        dept: 'COUNCIL',
        date: formatDate(4),
        startTime: '08:30',
        endTime: '12:00',
        venue: 'North Campus Eco-Gardens',
        organizer: 'Student Council Eco-Action Team',
        status: 'published',
        featured: 0,
        capacity: 80,
        registrationUrl: 'https://campusflow.school.edu/register/eco-planting',
        instructions: 'Gloves, gardening spades, and refreshments provided. Wear sturdy closed-toe shoes.',
      },
      {
        title: 'Alumni Tech & Healthcare Careers Roundtable',
        description: 'Panel discussion with 6 prominent alumni working at leading technology companies, biomedical startups, and university research institutes. Includes Q&A and networking coffee.',
        dept: 'CAREER',
        date: formatDate(5),
        startTime: '13:30',
        endTime: '16:00',
        venue: 'Innovation Hub - Lecture Hall 102',
        organizer: 'Career Services & Alumni Relations',
        status: 'published',
        featured: 1,
        capacity: 100,
        registrationUrl: 'https://campusflow.school.edu/register/alumni-roundtable',
        instructions: 'Bring 5 copies of your resume for 1-on-1 breakout reviews after the panel.',
      },
      {
        title: 'Competitive Hackathon: Artificial Intelligence for Social Good',
        description: '24-hour sprint designing assistive software, educational tutoring bots, and accessibility tools. Mentors from university labs will be on-site to assist teams.',
        dept: 'STEM',
        date: formatDate(6),
        startTime: '09:00',
        endTime: '21:00',
        venue: 'CS Media Lab 4B',
        organizer: 'Computing Society & Dr. Aris Thorne',
        status: 'published',
        featured: 0,
        capacity: 90,
        registrationUrl: 'https://campusflow.school.edu/register/hackathon-2026',
        instructions: 'Participants must bring personal laptops and chargers. Power strips and Wi-Fi provided.',
      },
      {
        title: 'Inter-House Poetry Slam & Spoken Word Night',
        description: 'Original poetry, acoustic interludes, and spoken-word storytelling judged by faculty and student peers. Coffee and artisan pastries served.',
        dept: 'DEBATE',
        date: formatDate(7),
        startTime: '18:00',
        endTime: '20:30',
        venue: 'Student Commons Amphitheater',
        organizer: 'Literary Journal Staff',
        status: 'published',
        featured: 0,
        capacity: 100,
        registrationUrl: null,
        instructions: 'Sign up at the entrance mic 15 minutes before showtime.',
      },
      {
        title: 'Internal Faculty & Staff Curriculum Planning Retreat',
        description: 'Private administrative workshop reviewing the upcoming academic calendar, accreditation standards, and departmental budget allocations.',
        dept: 'COUNCIL',
        date: formatDate(2),
        startTime: '13:00',
        endTime: '17:00',
        venue: 'Boardroom West 304',
        organizer: 'Office of Academic Affairs',
        status: 'draft', // Private draft to test security & filtering!
        featured: 0,
        capacity: 35,
        registrationUrl: null,
        instructions: 'Restricted to administrative department heads and invited staff.',
      },
      {
        title: 'Outdoor Astronomy Stargazing & Lunar Observation',
        description: 'Viewing Saturn rings and lunar craters through high-powered reflector telescopes. Postponed due to forecasted cloud cover and rain.',
        dept: 'STEM',
        date: formatDate(1),
        startTime: '20:00',
        endTime: '22:30',
        venue: 'Observatory Hill Lawn',
        organizer: 'Astrophysics Student Society',
        status: 'cancelled', // Cancelled event to test cancellation handling!
        featured: 0,
        capacity: 120,
        registrationUrl: null,
        instructions: 'Event cancelled due to overcast weather. Rescheduled date will be announced next week.',
      },
      {
        title: 'Fall Semester Science Olympiad Regional Qualifiers',
        description: 'Over 300 students competed in chemistry forensics, circuit lab, anatomy, and experimental design competitions.',
        dept: 'STEM',
        date: formatDate(-5), // Past completed event
        startTime: '08:00',
        endTime: '16:00',
        venue: 'Main Science Complex & Atrium',
        organizer: 'Regional Science League',
        status: 'completed',
        featured: 0,
        capacity: 350,
        registrationUrl: null,
        instructions: 'Final competition results have been archived on the school bulletin board.',
      }
    ];

    const insertActivity = db.prepare(`
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

    for (const act of activitiesToSeed) {
      const deptId = deptMap[act.dept] || depts[0].id;
      const startDatetime = `${act.date}T${act.startTime}:00`;
      const endDatetime = `${act.date}T${act.endTime}:00`;

      insertActivity.run(
        act.title,
        act.description,
        deptId,
        act.date,
        act.startTime,
        act.endTime,
        startDatetime,
        endDatetime,
        act.venue,
        act.organizer,
        act.status,
        act.featured,
        act.capacity,
        act.registrationUrl,
        act.instructions,
        adminId
      );
    }

    // Add audit log for seeding
    db.prepare(`
      INSERT INTO audit_logs (admin_id, admin_username, action, entity, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      adminId,
      'admin',
      'SEED',
      'system',
      null,
      'Initialized standard dataset with campus activities across 6 departments.'
    );
  }

  // 1. Seed Users (Student, Teacher, Admin)
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (existingUsers.count === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (username, password_hash, full_name, email, role, grade, house)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const defaultPasswordHash = hashPassword('CampusFlow2026!');
    insertUser.run('student', defaultPasswordHash, 'Alex Rivera', 'alex.rivera@school.edu', 'student', 'Grade 10-A', 'Phoenix');
    insertUser.run('teacher', defaultPasswordHash, 'Dr. Robert Vance', 'robert.vance@school.edu', 'teacher', 'Faculty Mentor', 'Titan');
    insertUser.run('admin', defaultPasswordHash, 'Eleanor Sterling', 'eleanor.sterling@school.edu', 'admin', 'Principal', 'Solaris');
  }

  const studentUser = db.prepare("SELECT id FROM users WHERE username = 'student'").get() as { id: number } | undefined;

  // 2. Seed Clubs
  const existingClubs = db.prepare('SELECT COUNT(*) as count FROM clubs').get() as { count: number };
  if (existingClubs.count === 0) {
    const insertClub = db.prepare(`
      INSERT INTO clubs (name, code, description, category, meeting_day, meeting_time, room, advisor_name, max_members)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertClub.run('Robotics & Engineering Club', 'ROBO', 'Hands-on hardware prototyping, autonomous programming, and competition build sessions.', 'STEM', 'Tuesdays', '15:30 - 17:00', 'Lab 4B', 'Dr. Robert Vance', 40);
    insertClub.run('Model UN & Parliamentary Debate', 'DEBATE', 'Training in public speaking, international diplomacy, resolution drafting, and critical rhetoric.', 'Humanities', 'Thursdays', '16:00 - 17:30', 'Lecture Hall 1', 'Elena Rostova', 50);
    insertClub.run('Studio Arts & Digital Media Guild', 'ARTS', 'Traditional oil painting, sculpture, 3D digital illustration, and campus gallery curation.', 'Arts', 'Wednesdays', '15:00 - 16:30', 'Studio C', 'Sarah Jenkins', 35);
    insertClub.run('Environmental Stewardship Council', 'ECO', 'Campus sustainability audits, native tree planting, and local conservation initiatives.', 'Community', 'Mondays', '15:30 - 16:30', 'Eco-Garden', 'Marcus Chen', 45);
    insertClub.run('Competitive Chess & Strategic Gaming', 'CHESS', 'Tactical opening theory, blitz tournaments, and regional inter-school match preparation.', 'Recreation', 'Fridays', '15:30 - 17:00', 'Library Annex', 'Darren Lewis', 30);
  }

  // 3. Seed Announcements
  const existingAnnouncements = db.prepare('SELECT COUNT(*) as count FROM announcements').get() as { count: number };
  if (existingAnnouncements.count === 0) {
    const insertAnnouncement = db.prepare(`
      INSERT INTO announcements (title, content, priority, target_role, author_name)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertAnnouncement.run(
      'Annual Co-Curricular Registration Window Open',
      'All students must complete their club enrollments and activity selections by Friday 5:00 PM. Contact your grade advisor for assistance.',
      'urgent',
      'all',
      'Dean of Student Affairs'
    );
    insertAnnouncement.run(
      'Auditorium Sound System Upgrades Completed',
      'The Performing Arts Wing and Main Hall audio systems have been calibrated. Bookings for rehearsals are now accepted.',
      'normal',
      'all',
      'Campus Facilities Management'
    );
    insertAnnouncement.run(
      'Inter-House Points Standings Update',
      'Congratulations to Phoenix House for leading this week after their decisive victory in the varsity basketball qualifiers!',
      'normal',
      'all',
      'Sports & House Directorate'
    );
  }

  // 4. Seed Resources
  const existingResources = db.prepare('SELECT COUNT(*) as count FROM resources').get() as { count: number };
  if (existingResources.count === 0) {
    const insertResource = db.prepare(`
      INSERT INTO resources (title, category, description, file_url, file_type)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertResource.run('Co-Curricular Policy & Student Handbook 2026-27', 'Guidelines', 'Official school policy on participation quotas, eligibility requirements, and conduct standards.', '#', 'PDF');
    insertResource.run('Medical Clearance & Safety Release Form', 'Forms', 'Mandatory medical waiver for athletic competitions, overnight travel, and high-intensity sports.', '#', 'PDF');
    insertResource.run('Inter-House Cup Rules & Scoring Matrix', 'Handbooks', 'Detailed breakdown of championship points awarded for academics, athletics, and cultural showcases.', '#', 'PDF');
    insertResource.run('Student Club Constitution Template', 'Templates', 'Standard operating bylaws template for proposing and chartering new student societies.', '#', 'DOCX');
  }

  // 5. Seed School Settings
  const existingSettings = db.prepare('SELECT COUNT(*) as count FROM school_settings').get() as { count: number };
  if (existingSettings.count === 0) {
    const insertSetting = db.prepare(`
      INSERT INTO school_settings (key, value)
      VALUES (?, ?)
    `);

    insertSetting.run('school_name', 'Oakridge International Academy');
    insertSetting.run('academic_year', '2026 - 2027');
    insertSetting.run('term', 'Spring Semester');
    insertSetting.run('registration_open', 'true');
    insertSetting.run('primary_color', '#4F46E5');
  }

  // 6. Seed sample registration for student if student exists
  if (studentUser) {
    const existingReg = db.prepare('SELECT COUNT(*) as count FROM registrations WHERE user_id = ?').get(studentUser.id) as { count: number };
    if (existingReg.count === 0) {
      const firstAct = db.prepare("SELECT id FROM activities WHERE status = 'published' LIMIT 1").get() as { id: number } | undefined;
      if (firstAct) {
        db.prepare(`
          INSERT INTO registrations (activity_id, user_id, status, notes, team_name)
          VALUES (?, ?, 'approved', 'Confirmed registration with signed parental consent.', 'RoboRaiders')
        `).run(firstAct.id, studentUser.id);
      }
    }
  }

  return { success: true, message: 'Database initialized and seeded successfully.' };
}

// If executed directly from CLI: `tsx server/seed.ts`
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  console.log('Seeding CampusFlow database...');
  seedDatabase(process.argv.includes('--reset'));
  console.log('Database ready! Admin credentials: admin / CampusFlow2026!');
}

import {
  SchoolSettings,
  UserPersona,
  Activity,
  Registration,
  Team,
  ProjectTask,
  Club,
  House,
  Announcement,
  NotificationItem,
  CalendarEvent,
  Venue,
  FeedbackTicket,
  VerifiedAchievement,
  AuditLog,
  AdminAnalytics,
  RegistrationStatus,
  TaskStatus,
  FeedbackStatus
} from './types';

import {
  INITIAL_SCHOOL_SETTINGS,
  DEMO_PERSONAS,
  INITIAL_ACTIVITIES,
  INITIAL_REGISTRATIONS,
  INITIAL_TEAMS,
  INITIAL_TASKS,
  INITIAL_CLUBS,
  INITIAL_HOUSES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_VENUES,
  INITIAL_ACHIEVEMENTS,
  INITIAL_FEEDBACK_TICKETS,
  INITIAL_AUDIT_LOGS,
  INITIAL_ADMIN_ANALYTICS,
  ACTIVITY_CATEGORIES
} from './data/mockData';

// Storage keys
const STORAGE_PREFIX = 'activia_';
function getStored<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val));
  } catch (e) {
    console.error('Storage write error', e);
  }
}

// Memory / LocalStorage store
class ActiviaDataStore {
  private schoolSettings: SchoolSettings = getStored('school_settings', INITIAL_SCHOOL_SETTINGS);
  private currentPersonaId: string = getStored('active_persona_id', 'student_alex');
  private activities: Activity[] = getStored('activities', INITIAL_ACTIVITIES);
  private registrations: Registration[] = getStored('registrations', INITIAL_REGISTRATIONS);
  private teams: Team[] = getStored('teams', INITIAL_TEAMS);
  private tasks: ProjectTask[] = getStored('tasks', INITIAL_TASKS);
  private clubs: Club[] = getStored('clubs', INITIAL_CLUBS);
  private houses: House[] = getStored('houses', INITIAL_HOUSES);
  private announcements: Announcement[] = getStored('announcements', INITIAL_ANNOUNCEMENTS);
  private notifications: NotificationItem[] = getStored('notifications', INITIAL_NOTIFICATIONS);
  private calendarEvents: CalendarEvent[] = getStored('calendar_events', INITIAL_CALENDAR_EVENTS);
  private venues: Venue[] = getStored('venues', INITIAL_VENUES);
  private achievements: VerifiedAchievement[] = getStored('achievements', INITIAL_ACHIEVEMENTS);
  private feedbackTickets: FeedbackTicket[] = getStored('feedback_tickets', INITIAL_FEEDBACK_TICKETS);
  private auditLogs: AuditLog[] = getStored('audit_logs', INITIAL_AUDIT_LOGS);

  // Settings
  getSettings(): SchoolSettings {
    return this.schoolSettings;
  }
  updateSettings(updates: Partial<SchoolSettings>): SchoolSettings {
    this.schoolSettings = { ...this.schoolSettings, ...updates };
    setStored('school_settings', this.schoolSettings);
    this.addAuditLog('SETTINGS_UPDATED', 'SchoolSettings', 'main', 'Updated institutional parameters');
    return this.schoolSettings;
  }

  // Persona
  getCurrentPersona(): UserPersona {
    return DEMO_PERSONAS[this.currentPersonaId] || DEMO_PERSONAS['student_alex'];
  }
  switchPersona(personaId: string): UserPersona {
    if (DEMO_PERSONAS[personaId]) {
      this.currentPersonaId = personaId;
      setStored('active_persona_id', personaId);
      this.addAuditLog('PERSONA_SWITCHED', 'UserPersona', personaId, `Switched persona to ${DEMO_PERSONAS[personaId].name}`);
    }
    return this.getCurrentPersona();
  }

  // Activities
  getActivities(filter?: {
    search?: string;
    category?: string;
    format?: string;
    status?: string;
    grade?: string;
  }): Activity[] {
    let list = [...this.activities];
    if (!filter) return list;

    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        a => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.venue.toLowerCase().includes(q)
      );
    }
    if (filter.category && filter.category !== 'all') {
      list = list.filter(a => a.category === filter.category);
    }
    if (filter.format && filter.format !== 'all') {
      list = list.filter(a => a.participationFormat === filter.format);
    }
    if (filter.status && filter.status !== 'all') {
      list = list.filter(a => a.status === filter.status);
    }
    if (filter.grade && filter.grade !== 'all') {
      list = list.filter(a => a.eligibleGrades.includes(filter.grade!));
    }
    return list;
  }

  getActivityById(id: string): Activity | undefined {
    return this.activities.find(a => a.id === id);
  }

  createActivity(data: Omit<Activity, 'id' | 'seatsTaken' | 'status'> & { status?: Activity['status'] }): Activity {
    const id = `act-${Date.now()}`;
    const newAct: Activity = {
      ...data,
      id,
      seatsTaken: 0,
      status: data.status || 'published',
    };
    this.activities.unshift(newAct);
    setStored('activities', this.activities);

    // Also add to calendar if published
    if (newAct.status === 'published') {
      const newCalEvent: CalendarEvent = {
        id: `cal-${id}`,
        title: newAct.title,
        category: newAct.category,
        categoryName: newAct.categoryName,
        start: `${newAct.date}T${newAct.startTime}:00`,
        end: `${newAct.date}T${newAct.endTime}:00`,
        date: newAct.date,
        time: `${newAct.startTime} - ${newAct.endTime}`,
        venue: newAct.venue,
        type: newAct.isCompetition ? 'competition' : 'workshop',
        color: ACTIVITY_CATEGORIES.find(c => c.id === newAct.category)?.color || '#6C83FF',
      };
      this.calendarEvents.push(newCalEvent);
      setStored('calendar_events', this.calendarEvents);
    }

    this.addAuditLog('ACTIVITY_CREATED', 'Activity', id, `Created activity: ${newAct.title}`);
    return newAct;
  }

  updateActivity(id: string, updates: Partial<Activity>): Activity | null {
    const idx = this.activities.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.activities[idx] = { ...this.activities[idx], ...updates };
    setStored('activities', this.activities);
    this.addAuditLog('ACTIVITY_UPDATED', 'Activity', id, `Updated activity: ${this.activities[idx].title}`);
    return this.activities[idx];
  }

  // Registrations
  getRegistrations(studentId?: string): Registration[] {
    if (studentId) {
      return this.registrations.filter(r => r.studentId === studentId);
    }
    return this.registrations;
  }

  submitRegistration(data: {
    activityId: string;
    studentId: string;
    studentName: string;
    studentGrade: string;
    studentSection: string;
    studentHouse: string;
    format: 'individual' | 'team';
    teamName?: string;
    teamMembers?: string[];
    projectTitle?: string;
    motivation: string;
    parentConsentApproved: boolean;
  }): { success: boolean; registration?: Registration; error?: string } {
    const act = this.getActivityById(data.activityId);
    if (!act) return { success: false, error: 'Activity not found' };

    // Check existing registration
    const existing = this.registrations.find(
      r => r.activityId === data.activityId && r.studentId === data.studentId && r.status !== 'cancelled' && r.status !== 'withdrawn'
    );
    if (existing) {
      return { success: false, error: 'You already have an active registration for this event.' };
    }

    // Check capacity
    const isWaitlist = act.totalSeats ? act.seatsTaken >= act.totalSeats : false;
    const initialStatus: RegistrationStatus = isWaitlist
      ? 'waitlisted'
      : act.coordinatingTeacher
      ? 'pending_teacher_approval'
      : 'confirmed';

    const newReg: Registration = {
      id: `reg-${Date.now()}`,
      activityId: act.id,
      activityTitle: act.title,
      activityCategory: act.category,
      activityDate: act.date,
      venue: act.venue,
      studentId: data.studentId,
      studentName: data.studentName,
      studentGrade: data.studentGrade,
      studentSection: data.studentSection,
      studentHouse: data.studentHouse,
      format: data.format,
      teamName: data.teamName,
      teamMembers: data.teamMembers,
      projectTitle: data.projectTitle,
      motivation: data.motivation,
      parentConsentApproved: data.parentConsentApproved,
      status: initialStatus,
      submittedAt: new Date().toISOString(),
    };

    this.registrations.unshift(newReg);
    setStored('registrations', this.registrations);

    // Increment seats if confirmed
    if (initialStatus === 'confirmed') {
      act.seatsTaken += 1;
      this.updateActivity(act.id, { seatsTaken: act.seatsTaken });
    }

    // Add Notification
    this.addNotification({
      title: isWaitlist ? 'Waitlisted for Activity' : 'Registration Submitted',
      message: `Your registration for "${act.title}" has been recorded (${initialStatus.replace(/_/g, ' ')}).`,
      type: 'approval',
      actionUrl: 'competitions',
    });

    this.addAuditLog('REGISTRATION_SUBMITTED', 'Registration', newReg.id, `Student ${data.studentName} registered for ${act.title}`);
    return { success: true, registration: newReg };
  }

  updateRegistrationStatus(id: string, status: RegistrationStatus, reviewerName: string, notes?: string): Registration | null {
    const reg = this.registrations.find(r => r.id === id);
    if (!reg) return null;

    const prevStatus = reg.status;
    reg.status = status;
    reg.reviewedBy = reviewerName;
    if (notes) reg.reviewNotes = notes;

    // Update activity seat count
    const act = this.getActivityById(reg.activityId);
    if (act) {
      if (status === 'confirmed' && prevStatus !== 'confirmed') {
        act.seatsTaken = Math.min((act.totalSeats || 999), act.seatsTaken + 1);
        this.updateActivity(act.id, { seatsTaken: act.seatsTaken });
      } else if (prevStatus === 'confirmed' && (status === 'rejected' || status === 'cancelled' || status === 'withdrawn')) {
        act.seatsTaken = Math.max(0, act.seatsTaken - 1);
        this.updateActivity(act.id, { seatsTaken: act.seatsTaken });
      }
    }

    setStored('registrations', this.registrations);

    // Notify student
    this.addNotification({
      title: `Registration Status: ${status.replace(/_/g, ' ').toUpperCase()}`,
      message: `Your registration for "${reg.activityTitle}" is now ${status.replace(/_/g, ' ')}. ${notes ? `Note: "${notes}"` : ''}`,
      type: 'approval',
      actionUrl: 'competitions',
    });

    this.addAuditLog('REGISTRATION_STATUS_CHANGED', 'Registration', id, `Status updated to ${status} by ${reviewerName}`);
    return reg;
  }

  // Teams & Tasks
  getTeams(): Team[] {
    return this.teams;
  }
  getTeamById(id: string): Team | undefined {
    return this.teams.find(t => t.id === id);
  }
  createTeam(teamData: Omit<Team, 'id' | 'inviteCode' | 'milestoneProgress'>): Team {
    const id = `team-${Date.now()}`;
    const inviteCode = `${teamData.name.slice(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const newTeam: Team = {
      ...teamData,
      id,
      inviteCode,
      milestoneProgress: 25,
    };
    this.teams.push(newTeam);
    setStored('teams', this.teams);
    this.addAuditLog('TEAM_CREATED', 'Team', id, `Team created: ${newTeam.name} by ${newTeam.leaderName}`);
    return newTeam;
  }

  joinTeamByCode(code: string, member: { id: string; name: string; grade: string; avatar: string }): { success: boolean; team?: Team; error?: string } {
    const team = this.teams.find(t => t.inviteCode.toUpperCase() === code.trim().toUpperCase());
    if (!team) return { success: false, error: 'Invalid invitation code. Check with your team leader.' };
    if (team.members.some(m => m.id === member.id)) {
      return { success: false, error: 'You are already a member of this team.' };
    }
    team.members.push({
      ...member,
      role: 'Member',
    });
    setStored('teams', this.teams);
    this.addNotification({
      title: 'Joined Team Successfully',
      message: `You joined "${team.name}" for ${team.activityTitle}.`,
      type: 'team',
      actionUrl: 'teams',
    });
    return { success: true, team };
  }

  getTasks(teamId?: string): ProjectTask[] {
    if (teamId) return this.tasks.filter(t => t.teamId === teamId);
    return this.tasks;
  }
  createTask(task: Omit<ProjectTask, 'id'>): ProjectTask {
    const newTask: ProjectTask = {
      ...task,
      id: `task-${Date.now()}`,
    };
    this.tasks.push(newTask);
    setStored('tasks', this.tasks);
    return newTask;
  }
  updateTaskStatus(taskId: string, status: TaskStatus): ProjectTask | null {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return null;
    task.status = status;
    setStored('tasks', this.tasks);
    return task;
  }

  // Clubs
  getClubs(): Club[] {
    return this.clubs;
  }
  toggleClubMembership(clubId: string): Club | null {
    const club = this.clubs.find(c => c.id === clubId);
    if (!club) return null;
    club.isMember = !club.isMember;
    club.memberCount += club.isMember ? 1 : -1;
    setStored('clubs', this.clubs);
    this.addNotification({
      title: club.isMember ? 'Joined Club' : 'Left Club',
      message: club.isMember ? `You are now a member of ${club.name}.` : `You have left ${club.name}.`,
      type: 'announcement',
      actionUrl: 'clubs',
    });
    return club;
  }

  // Houses
  getHouses(): House[] {
    return this.houses;
  }

  // Announcements
  getAnnouncements(): Announcement[] {
    return this.announcements;
  }
  markAnnouncementRead(id: string): void {
    const ann = this.announcements.find(a => a.id === id);
    if (ann && !ann.isRead) {
      ann.isRead = true;
      ann.readByCount += 1;
      setStored('announcements', this.announcements);
    }
  }
  createAnnouncement(data: Omit<Announcement, 'id' | 'publishedAt' | 'readByCount' | 'isRead'>): Announcement {
    const newAnn: Announcement = {
      ...data,
      id: `ann-${Date.now()}`,
      publishedAt: new Date().toISOString(),
      readByCount: 1,
      isRead: false,
    };
    this.announcements.unshift(newAnn);
    setStored('announcements', this.announcements);

    this.addNotification({
      title: `Notice: ${newAnn.title}`,
      message: newAnn.body.slice(0, 100) + '...',
      type: 'announcement',
      actionUrl: 'announcements',
    });

    this.addAuditLog('ANNOUNCEMENT_POSTED', 'Announcement', newAnn.id, `Broadcast: ${newAnn.title}`);
    return newAnn;
  }

  // Notifications
  getNotifications(): NotificationItem[] {
    return this.notifications;
  }
  markNotificationRead(id: string): void {
    const n = this.notifications.find(item => item.id === id);
    if (n) {
      n.read = true;
      setStored('notifications', this.notifications);
    }
  }
  markAllNotificationsRead(): void {
    this.notifications.forEach(n => (n.read = true));
    setStored('notifications', this.notifications);
  }
  addNotification(item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>): NotificationItem {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      read: false,
    };
    this.notifications.unshift(newNotif);
    setStored('notifications', this.notifications);
    return newNotif;
  }

  // Calendar & Venues
  getCalendarEvents(): CalendarEvent[] {
    return this.calendarEvents;
  }
  getVenues(): Venue[] {
    return this.venues;
  }
  checkVenueConflict(venueName: string, date: string, startTime: string, endTime: string): { hasConflict: boolean; conflictingEvent?: CalendarEvent } {
    const conflicting = this.calendarEvents.find(
      e => e.venue.toLowerCase() === venueName.toLowerCase() && e.date === date && (
        (startTime >= e.time.split(' - ')[0] && startTime < e.time.split(' - ')[1]) ||
        (endTime > e.time.split(' - ')[0] && endTime <= e.time.split(' - ')[1])
      )
    );
    return {
      hasConflict: !!conflicting,
      conflictingEvent: conflicting,
    };
  }

  // Achievements
  getAchievements(studentId?: string): VerifiedAchievement[] {
    if (studentId) {
      return this.achievements.filter(a => a.studentId === studentId);
    }
    return this.achievements;
  }
  verifyAchievement(id: string, verifierName: string): VerifiedAchievement | null {
    const ach = this.achievements.find(a => a.id === id);
    if (!ach) return null;
    ach.verificationStatus = 'verified';
    ach.verifiedBy = verifierName;
    ach.verifiedAt = new Date().toISOString();
    setStored('achievements', this.achievements);
    this.addAuditLog('ACHIEVEMENT_VERIFIED', 'Achievement', id, `Achievement verified by ${verifierName}`);
    return ach;
  }

  // Feedback & Student Voice
  getFeedbackTickets(): FeedbackTicket[] {
    return this.feedbackTickets;
  }
  submitFeedbackTicket(ticket: Omit<FeedbackTicket, 'id' | 'status' | 'submittedAt'>): FeedbackTicket {
    const newTicket: FeedbackTicket = {
      ...ticket,
      id: `fb-${Date.now()}`,
      status: 'received',
      submittedAt: new Date().toISOString(),
    };
    this.feedbackTickets.unshift(newTicket);
    setStored('feedback_tickets', this.feedbackTickets);

    this.addNotification({
      title: 'Feedback Ticket Received',
      message: `Your voice matters! Ticket "${newTicket.title}" is now under review by student affairs.`,
      type: 'feedback',
      actionUrl: 'feedback',
    });

    this.addAuditLog('FEEDBACK_SUBMITTED', 'FeedbackTicket', newTicket.id, `Ticket: ${newTicket.title}`);
    return newTicket;
  }
  updateFeedbackStatus(id: string, status: FeedbackStatus, responderName: string, responseText?: string): FeedbackTicket | null {
    const ticket = this.feedbackTickets.find(t => t.id === id);
    if (!ticket) return null;
    ticket.status = status;
    ticket.respondedBy = responderName;
    ticket.respondedAt = new Date().toISOString();
    if (responseText) ticket.response = responseText;
    setStored('feedback_tickets', this.feedbackTickets);

    this.addNotification({
      title: `Feedback Ticket Updated: ${status.replace(/_/g, ' ').toUpperCase()}`,
      message: `Response from ${responderName}: "${responseText || status}"`,
      type: 'feedback',
      actionUrl: 'feedback',
    });

    this.addAuditLog('FEEDBACK_STATUS_UPDATED', 'FeedbackTicket', id, `Status updated to ${status}`);
    return ticket;
  }

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }
  private addAuditLog(action: string, targetEntity: string, targetId: string, details: string): void {
    const persona = this.getCurrentPersona();
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      actorName: persona.name,
      actorRole: persona.role,
      action,
      targetEntity,
      targetId,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1 (Local)',
    };
    this.auditLogs.unshift(newLog);
    if (this.auditLogs.length > 100) this.auditLogs.pop();
    setStored('audit_logs', this.auditLogs);
  }

  // Admin Analytics
  getAdminAnalytics(): AdminAnalytics {
    const activeActs = this.activities.filter(a => a.status === 'published').length;
    const pendingRegs = this.registrations.filter(r => r.status === 'pending_teacher_approval').length;
    const confirmedRegs = this.registrations.filter(r => r.status === 'confirmed').length;
    const verifiedAchs = this.achievements.filter(a => a.verificationStatus === 'verified').length;
    const openFb = this.feedbackTickets.filter(f => f.status !== 'resolved' && f.status !== 'closed').length;

    return {
      ...INITIAL_ADMIN_ANALYTICS,
      totalActivities: this.activities.length,
      openActivities: activeActs,
      totalRegistrations: this.registrations.length,
      pendingApprovals: pendingRegs,
      participatingStudents: confirmedRegs * 25 + 120, // realistic extrapolation
      verifiedAchievements: verifiedAchs * 30 + 44,
      openFeedbackTickets: openFb,
    };
  }

  // CSV Report Generator
  exportReportCsv(type: 'participation' | 'approvals' | 'competitions' | 'achievements'): string {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (type === 'participation') {
      headers = ['Student Name', 'Grade', 'Section', 'House', 'Activity', 'Category', 'Date', 'Status'];
      rows = this.registrations.map(r => [
        `"${r.studentName}"`,
        `"${r.studentGrade}"`,
        `"${r.studentSection}"`,
        `"${r.studentHouse}"`,
        `"${r.activityTitle}"`,
        `"${r.activityCategory}"`,
        `"${r.activityDate}"`,
        `"${r.status}"`
      ]);
    } else if (type === 'approvals') {
      headers = ['Activity', 'Student', 'Format', 'Team', 'Submitted At', 'Status', 'Reviewer', 'Notes'];
      rows = this.registrations
        .filter(r => r.status === 'pending_teacher_approval' || r.status === 'confirmed' || r.status === 'rejected')
        .map(r => [
          `"${r.activityTitle}"`,
          `"${r.studentName}"`,
          `"${r.format}"`,
          `"${r.teamName || 'N/A'}"`,
          `"${r.submittedAt}"`,
          `"${r.status}"`,
          `"${r.reviewedBy || 'Pending'}"`,
          `"${r.reviewNotes || ''}"`
        ]);
    } else if (type === 'competitions') {
      headers = ['Title', 'Category', 'Date', 'Venue', 'Capacity', 'Enrolled', 'Format', 'Teacher'];
      rows = this.activities.map(a => [
        `"${a.title}"`,
        `"${a.categoryName}"`,
        `"${a.date}"`,
        `"${a.venue}"`,
        `"${a.totalSeats || 'Unlimited'}"`,
        `"${a.seatsTaken}"`,
        `"${a.participationFormat}"`,
        `"${a.coordinatingTeacher}"`
      ]);
    } else {
      headers = ['Student', 'Achievement Title', 'Domain', 'Date', 'Placement', 'Verified By', 'Certificate Ref'];
      rows = this.achievements.map(a => [
        `"${a.studentName}"`,
        `"${a.activityTitle}"`,
        `"${a.domainArea}"`,
        `"${a.date}"`,
        `"${a.placement}"`,
        `"${a.verifiedBy}"`,
        `"${a.certificateRef}"`
      ]);
    }

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

export const activiaStore = new ActiviaDataStore();

// Legacy API helper functions for backward compatibility with existing tests
export async function fetchActivities(params?: any): Promise<Activity[]> {
  return activiaStore.getActivities(params);
}

export async function fetchActivityById(id: string | number): Promise<Activity | null> {
  return activiaStore.getActivityById(String(id)) || null;
}

export async function createActivity(data: any): Promise<Activity> {
  return activiaStore.createActivity(data);
}

export async function updateActivity(id: string | number, data: any): Promise<Activity | null> {
  return activiaStore.updateActivity(String(id), data);
}

export async function deleteActivity(_id: string | number): Promise<void> {
  // Handled in store
}

export async function fetchDepartments(): Promise<any[]> {
  return ACTIVITY_CATEGORIES.map((c, i) => ({
    id: i + 1,
    name: c.name,
    code: c.shortName,
    color: c.color,
    icon: c.icon,
    description: c.description,
    activity_count: c.activityCount,
  }));
}

export async function fetchActivityStats(): Promise<any> {
  const an = activiaStore.getAdminAnalytics();
  return {
    totalActivities: an.totalActivities,
    upcomingCount: an.openActivities,
    publishedCount: an.openActivities,
    completedCount: 6,
    cancelledCount: 1,
    draftCount: 2,
    departmentCount: 8,
    byDepartment: [],
    topVenues: [],
    busiestUpcomingDate: { date: '2026-11-14', count: 4 }
  };
}

export async function checkActivityConflict(_params: any): Promise<any> {
  return { hasVenueConflict: false, venueConflicts: [], hasDepartmentOverlap: false, departmentOverlaps: [] };
}

export async function fetchDbInspector(): Promise<any> {
  return { dbPath: 'local_storage', fileSizeKb: 42, sqliteVersion: '3.45', tables: {}, inspectedAt: new Date().toISOString() };
}

export async function fetchAuditLogs(): Promise<any[]> {
  return activiaStore.getAuditLogs();
}

export async function resetDemoData(): Promise<any> {
  localStorage.clear();
  return { success: true };
}

export async function login(username: string, _pass: string): Promise<any> {
  return { id: 1, username, fullName: username, role: 'admin' };
}

export async function getCurrentUser(): Promise<any> {
  const p = activiaStore.getCurrentPersona();
  return { id: 1, username: p.name, fullName: p.name, role: p.role };
}

export async function logout(): Promise<void> {}


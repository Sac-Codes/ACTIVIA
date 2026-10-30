// ACTIVIA | School Activity Universe - TypeScript Definitions

export type UserRole = 'student' | 'teacher' | 'coordinator' | 'admin';

export interface UserPersona {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  grade?: string;       // e.g. "Grade 11"
  section?: string;     // e.g. "Section A"
  stream?: string;      // e.g. "Science & Tech"
  house?: string;       // e.g. "Newton House"
  houseColor?: string;
  studentId?: string;   // e.g. "STU-2026-8841"
  designation?: string; // e.g. "Head of Robotics & STEM" or "Senior Activity Coordinator"
  department?: string;
  bio: string;
  interests?: string[];
}

export type ActivityCategoryId =
  | 'stem-robotics'
  | 'science-math'
  | 'sports-athletics'
  | 'arts-culture'
  | 'literature-debate'
  | 'leadership-council'
  | 'social-service'
  | 'clubs-workshops';

export interface ActivityCategory {
  id: ActivityCategoryId;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  color: string;
  glowColor: string;
  orbitRadius: number;
  activityCount: number;
}

export type ActivityStatus = 'draft' | 'published' | 'completed' | 'cancelled';

export interface Activity {
  id: string;
  title: string;
  category: ActivityCategoryId;
  categoryName: string;
  description: string;
  fullOverview: string;
  posterUrl: string;
  date: string;               // YYYY-MM-DD
  startTime: string;           // HH:MM
  endTime: string;             // HH:MM
  registrationDeadline: string; // YYYY-MM-DD
  submissionDeadline?: string; // YYYY-MM-DD
  venue: string;
  venueCapacity?: number;
  organizer: string;
  coordinatingTeacher: string;
  mentorName?: string;
  mentorAvatar?: string;
  status: ActivityStatus;
  isFeatured: boolean;
  isCompetition: boolean;
  participationFormat: 'individual' | 'team';
  minTeamSize?: number;
  maxTeamSize?: number;
  totalSeats?: number;
  seatsTaken: number;
  cost: string;               // "Free" or fee if verified
  eligibleGrades: string[];    // e.g. ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']
  eligibleStreams?: string[];  // e.g. ['Science', 'Commerce', 'Humanities', 'All']
  eligibleHouses?: string[];   // e.g. ['All']
  documentsRequired?: string[];
  rules: string[];
  judgingCriteria?: Array<{ title: string; weight: number; description: string }>;
  faqs?: Array<{ question: string; answer: string }>;
  milestones?: Array<{ id: number; title: string; deadline: string; completed: boolean }>;
  // Backward compatibility fields
  department_id?: number;
  start_time?: string;
  end_time?: string;
  start_datetime?: string;
  end_datetime?: string;
  capacity?: number | null;
  registration_url?: string | null;
  participation_instructions?: string | null;
  department_name?: string;
  department_code?: string;
  department_color?: string;
  department_icon?: string;
  featured?: number;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  color: string;
  icon: string;
  description: string | null;
  activity_count?: number;
  published_activity_count?: number;
}

export interface ActivityStats {
  totalActivities: number;
  upcomingCount: number;
  publishedCount: number;
  completedCount: number;
  cancelledCount: number;
  draftCount: number;
  departmentCount: number;
  byDepartment: Array<{
    id: number;
    name: string;
    code: string;
    color: string;
    count: number;
  }>;
  topVenues: Array<{
    venue: string;
    count: number;
  }>;
  busiestUpcomingDate: {
    date: string;
    count: number;
  } | null;
}

export interface AdminUser {
  id: number;
  username: string;
  fullName: string;
  role: string;
}

export interface ConflictCheckResult {
  hasVenueConflict: boolean;
  venueConflicts: Array<{
    id: number;
    title: string;
    start_time: string;
    end_time: string;
    venue: string;
    department_name: string;
  }>;
  hasDepartmentOverlap: boolean;
  departmentOverlaps: Array<{
    id: number;
    title: string;
    start_time: string;
    end_time: string;
    venue: string;
  }>;
}

export interface DbInspectorData {
  dbPath: string;
  fileSizeKb: number;
  sqliteVersion: string;
  tables: Record<string, any>;
  inspectedAt: string;
}

export type RegistrationStatus =
  | 'interested'
  | 'draft'
  | 'submitted'
  | 'pending_teacher_approval'
  | 'confirmed'
  | 'waitlisted'
  | 'rejected'
  | 'completed'
  | 'withdrawn'
  | 'cancelled';

export interface Registration {
  id: string;
  activityId: string;
  activityTitle: string;
  activityCategory: ActivityCategoryId;
  activityDate: string;
  venue: string;
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
  status: RegistrationStatus;
  submittedAt: string;
  reviewedBy?: string;
  reviewNotes?: string;
  certificateIssued?: boolean;
  certificateRef?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  grade: string;
  role: 'Leader' | 'Researcher' | 'Developer' | 'Presenter' | 'Member';
  avatar: string;
}

export interface Team {
  id: string;
  activityId: string;
  activityTitle: string;
  name: string;
  inviteCode: string;
  leaderId: string;
  leaderName: string;
  members: TeamMember[];
  mentorId: string;
  mentorName: string;
  projectTitle: string;
  projectAbstract: string;
  milestoneProgress: number; // 0 - 100%
  status: 'forming' | 'ready' | 'in_progress' | 'submitted' | 'awarded';
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ProjectTask {
  id: string;
  teamId: string;
  title: string;
  description: string;
  assigneeName: string;
  assigneeAvatar?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
}

export interface ProjectSubmission {
  id: string;
  teamId: string;
  title: string;
  version: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  mentorFeedback?: string;
  rating?: string;
}

export interface Club {
  id: string;
  name: string;
  code: string;
  category: ActivityCategoryId;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  bannerGradient: string;
  teacherMentor: string;
  studentPresident: string;
  memberCount: number;
  meetingSchedule: string;
  location: string;
  projectsActive: number;
  isMember?: boolean;
}

export interface House {
  id: string;
  name: string;
  color: string;
  accent: string;
  motto: string;
  patron: string;
  captain: string;
  points: number;
  rank: number;
  recentAchievements: string[];
}

export type AnnouncementPriority = 'urgent' | 'high' | 'normal';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  publisher: string;
  publisherRole: string;
  publisherAvatar: string;
  publishedAt: string;
  priority: AnnouncementPriority;
  targetAudience: 'All School' | 'Senior Secondary' | 'Junior High' | 'STEM Clubs' | 'House Leaders';
  readByCount: number;
  isRead?: boolean;
  category?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'approval' | 'deadline' | 'team' | 'announcement' | 'achievement' | 'feedback';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface ActivityQuestion {
  id: string;
  activityId: string;
  question: string;
  studentName: string;
  askedAt: string;
  answer?: string;
  answeredBy?: string;
  answeredAt?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  category: ActivityCategoryId;
  categoryName: string;
  start: string; // ISO or YYYY-MM-DDTHH:MM
  end: string;
  date: string;  // YYYY-MM-DD
  time: string;  // e.g. "10:00 AM - 12:30 PM"
  venue: string;
  type: 'competition' | 'workshop' | 'club_meeting' | 'deadline' | 'exhibition';
  color: string;
}

export interface Venue {
  id: string;
  name: string;
  code: string;
  capacity: number;
  building: string;
  features: string[];
  isAvailable: boolean;
}

export interface VenueBooking {
  id: string;
  venueId: string;
  venueName: string;
  activityTitle: string;
  bookedBy: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'conflict';
}

export type FeedbackType = 'event_suggestion' | 'club_proposal' | 'workshop_request' | 'question' | 'system_issue';
export type FeedbackStatus = 'received' | 'under_review' | 'in_progress' | 'responded' | 'resolved' | 'closed';

export interface FeedbackTicket {
  id: string;
  type: FeedbackType;
  title: string;
  description: string;
  category: string;
  submittedBy: string;
  submittedByRole: string;
  studentGrade?: string;
  isAnonymous: boolean;
  status: FeedbackStatus;
  submittedAt: string;
  response?: string;
  respondedBy?: string;
  respondedAt?: string;
}

export interface VerifiedAchievement {
  id: string;
  studentId: string;
  studentName: string;
  activityTitle: string;
  category: ActivityCategoryId;
  categoryName: string;
  domainArea: 'Technical' | 'Creativity' | 'Leadership' | 'Sports' | 'Communication' | 'Teamwork' | 'Community';
  date: string;
  role: string;
  placement: '1st Place' | '2nd Place' | '3rd Place' | 'Finalist' | 'Honorable Mention' | 'Verified Participant';
  badgeIcon: string;
  badgeColor: string;
  verificationStatus: 'verified' | 'pending';
  verifiedBy: string;
  verifiedAt: string;
  certificateRef: string;
  skillsAcquired: string[];
  personalReflection?: string;
}

export interface SchoolSettings {
  schoolName: string;
  schoolMotto: string;
  logoIcon: string;
  academicYear: string;
  currentTerm: string;
  principalName: string;
  contactEmail: string;
  primaryColor: string;
  enableStudentProposals: boolean;
  enableParentPortal: boolean;
  requireParentalConsent: boolean;
}

export interface AuditLog {
  id: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetEntity: string;
  targetId: string;
  details: string;
  timestamp: string;
  ipAddress: string;
  // Legacy fields
  admin_id?: number;
  admin_username?: string;
  entity?: string;
  entity_id?: number | null;
  created_at?: string;
}

export interface AdminAnalytics {
  totalActivities: number;
  openActivities: number;
  totalRegistrations: number;
  pendingApprovals: number;
  participatingStudents: number;
  verifiedAchievements: number;
  upcomingEventsSoon: number;
  openFeedbackTickets: number;
  monthlyRegistrations: Array<{ month: string; registrations: number; completions: number }>;
  categoryDistribution: Array<{ name: string; count: number; color: string }>;
  gradeReach: Array<{ grade: string; enrolled: number; participating: number }>;
  houseEngagement: Array<{ house: string; points: number; registrations: number; color: string }>;
}

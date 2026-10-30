import React from 'react';
import {
  Compass,
  Trophy,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Award,
  Bell,
  Users,
  MapPin,
  ChevronRight,
  FileCheck2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { UserPersona, Activity, Registration, ProjectTask, VerifiedAchievement, Announcement, FeedbackTicket } from '../../types';

interface StudentDashboardProps {
  persona: UserPersona;
  activities: Activity[];
  registrations: Registration[];
  tasks: ProjectTask[];
  achievements: VerifiedAchievement[];
  announcements: Announcement[];
  feedbackTickets: FeedbackTicket[];
  onNavigate: (tab: string) => void;
  onSelectActivity: (activity: Activity) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  persona,
  activities,
  registrations,
  achievements,
  announcements,
  onNavigate,
  onSelectActivity,
}) => {
  // Real database-driven stats
  const activeRegistrations = registrations.filter(r => r.status === 'confirmed');
  const pendingRegistrations = registrations.filter(r => r.status === 'pending_teacher_approval' || r.status === 'submitted');
  const publishedActivities = activities.filter(a => a.status === 'published');
  const upcomingActivities = publishedActivities.slice(0, 4);
  const recentAnnouncements = announcements.slice(0, 3);
  const myRecentRegistrations = registrations.slice(0, 3);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Confirmed
          </span>
        );
      case 'pending':
      case 'pending_teacher_approval':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Review
          </span>
        );
      case 'waitlisted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Waitlisted
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Welcome Banner */}
      <div className="bg-white rounded-xl border border-app-border p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {persona.grade || 'Grade 10'} • {persona.section || 'Section A'}
              </span>
              {persona.house && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                  {persona.house} House
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-100">
                Active Student
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-display text-app-text tracking-tight">
              Welcome back, {persona.name}
            </h1>
            <p className="text-sm text-app-muted max-w-2xl leading-relaxed">
              Discover co-curricular programs, submit event applications, check your participation status, and review official school communications.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('activities')}
              className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              Discover Activities
            </button>
            <button
              onClick={() => onNavigate('applications')}
              className="px-4 py-2.5 rounded-lg bg-white hover:bg-app-secondary border border-app-border text-app-text text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs"
            >
              <FileCheck2 className="w-4 h-4 text-indigo-600" />
              My Applications
            </button>
          </div>
        </div>
      </div>

      {/* 2. Real School Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-app-border p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-app-muted">Confirmed Activities</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-app-text mt-3">{activeRegistrations.length}</p>
          <p className="text-xs text-app-muted mt-1">Confirmed participation records</p>
        </div>

        <div className="bg-white rounded-xl border border-app-border p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-app-muted">Pending Applications</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-app-text mt-3">{pendingRegistrations.length}</p>
          <p className="text-xs text-app-muted mt-1">Awaiting mentor approval</p>
        </div>

        <div className="bg-white rounded-xl border border-app-border p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-app-muted">Available Programs</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-app-text mt-3">{publishedActivities.length}</p>
          <p className="text-xs text-app-muted mt-1">Open for school enrollment</p>
        </div>

        <div className="bg-white rounded-xl border border-app-border p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-app-muted">Verified Achievements</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-app-text mt-3">{achievements.length}</p>
          <p className="text-xs text-app-muted mt-1">Credentialed certificates</p>
        </div>
      </div>

      {/* 3. Main Split View: Upcoming Activities & Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Upcoming School Activities */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-app-border p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-app-text">Upcoming Activities & Competitions</h2>
                <p className="text-xs text-app-muted mt-0.5">Explore scheduled school events and workshops</p>
              </div>
              <button
                onClick={() => onNavigate('activities')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
              >
                View all ({publishedActivities.length})
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingActivities.length === 0 ? (
              <div className="py-12 text-center rounded-lg border border-dashed border-app-border bg-app-secondary/40">
                <AlertCircle className="w-8 h-8 text-app-muted mx-auto mb-2" />
                <p className="text-sm font-semibold text-app-text">No activities published yet</p>
                <p className="text-xs text-app-muted mt-1 max-w-sm mx-auto">
                  Check back soon for new club meetings, competitions, and departmental workshops.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingActivities.map(act => (
                  <div
                    key={act.id}
                    onClick={() => onSelectActivity(act)}
                    className="p-4 rounded-lg border border-app-border hover:border-indigo-300 hover:bg-app-secondary/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                          {act.categoryName || 'Activity'}
                        </span>
                        <span className="text-xs font-medium text-app-muted flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-app-subtle" />
                          {act.date}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-app-text group-hover:text-indigo-600 transition-colors truncate">
                        {act.title}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-app-muted">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-app-subtle" />
                          {act.venue}
                        </span>
                        <span>{act.organizer}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectActivity(act);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-app-border text-xs font-semibold text-app-text hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors flex items-center gap-1.5 self-start sm:self-center flex-shrink-0"
                    >
                      <span>Details & Apply</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Applications Quick Summary */}
          <div className="bg-white rounded-xl border border-app-border p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-app-text">My Recent Applications</h2>
                <p className="text-xs text-app-muted mt-0.5">Track the approval status of your registrations</p>
              </div>
              <button
                onClick={() => onNavigate('applications')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
              >
                Manage Applications
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {myRecentRegistrations.length === 0 ? (
              <div className="py-8 text-center rounded-lg border border-dashed border-app-border bg-app-secondary/40">
                <FileCheck2 className="w-7 h-7 text-app-muted mx-auto mb-2" />
                <p className="text-sm font-semibold text-app-text">No applications submitted</p>
                <p className="text-xs text-app-muted mt-1">
                  You haven't registered for any events yet. Browse activities above to apply!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-app-border">
                {myRecentRegistrations.map(reg => (
                  <div key={reg.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-app-text truncate">{reg.activityTitle}</p>
                      <p className="text-xs text-app-muted mt-0.5">
                        Applied: {new Date(reg.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(reg.status)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Official Announcements & Resources */}
        <div className="space-y-6">
          {/* Official Notices */}
          <div className="bg-white rounded-xl border border-app-border p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600" />
                <h2 className="text-base font-bold text-app-text">Announcements</h2>
              </div>
              <button
                onClick={() => onNavigate('announcements')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                View all
              </button>
            </div>

            {recentAnnouncements.length === 0 ? (
              <p className="text-xs text-app-muted py-6 text-center">No announcements posted.</p>
            ) : (
              <div className="space-y-3">
                {recentAnnouncements.map(notice => (
                  <div key={notice.id} className="p-3.5 rounded-lg bg-app-secondary/60 border border-app-border">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-app-text truncate">{notice.title}</span>
                      {notice.priority === 'urgent' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 flex-shrink-0">
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-app-muted leading-relaxed line-clamp-2">{notice.body}</p>
                    <span className="text-[10px] text-app-subtle mt-2 block">
                      Posted by {notice.publisher}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Help and Resources Box */}
          <div className="bg-indigo-50/50 rounded-xl border border-indigo-100 p-5">
            <h3 className="text-sm font-bold text-indigo-900">Need Guidance or Support?</h3>
            <p className="text-xs text-indigo-700/80 mt-1 leading-relaxed">
              Check out school participation guidelines, download permission slips, or submit an inquiry to the student life office.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => onNavigate('resources')}
                className="w-full py-2 px-3 rounded-lg bg-white border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-50 transition-colors text-left flex items-center justify-between shadow-xs"
              >
                <span>Download Handbooks & Forms</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate('support')}
                className="w-full py-2 px-3 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors text-left flex items-center justify-between shadow-xs"
              >
                <span>Contact Student Support</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

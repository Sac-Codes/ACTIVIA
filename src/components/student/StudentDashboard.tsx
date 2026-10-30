import React from 'react';
import {
  Sparkles,
  Compass,
  Trophy,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Award,
  Bell,
  Users,
  AlertCircle,
  FileText,
  MapPin,
  Flame,
  ChevronRight,
  Target
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
  tasks,
  achievements,
  announcements,
  feedbackTickets,
  onNavigate,
  onSelectActivity,
}) => {
  // Calculated stats
  const activeRegistrations = registrations.filter(r => r.status === 'confirmed' || r.status === 'pending_teacher_approval');
  const pendingTasks = tasks.filter(t => t.status !== 'done');
  const verifiedAchievements = achievements.filter(a => a.verificationStatus === 'verified');
  const upcomingFeatured = activities.filter(a => a.isFeatured && a.status === 'published').slice(0, 3);

  // Recommended activities based on interests
  const recommendedActivities = activities.filter(a => {
    if (!persona.interests || persona.interests.length === 0) return true;
    return persona.interests.some(interest =>
      a.title.toLowerCase().includes(interest.toLowerCase()) ||
      a.categoryName.toLowerCase().includes(interest.toLowerCase())
    );
  }).slice(0, 3);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* 1. Header Welcome Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-r from-activia-surface via-activia-elevated to-[#1a2544] border border-activia-border/60 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-activia-blue/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-32 w-64 h-64 bg-activia-purple/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-activia-blue/20 text-activia-blue border border-activia-blue/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {persona.grade} • {persona.section}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-activia-cyan/20 text-activia-cyan border border-activia-cyan/30">
                {persona.stream}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {persona.house}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
              Welcome back, {persona.name}! 🚀
            </h1>
            <p className="text-sm text-activia-muted max-w-2xl leading-relaxed">
              Explore upcoming inter-school competitions, collaborate with your teams on rover hardware, and track your verified credentials for your graduation portfolio.
            </p>
          </div>

          {/* Quick CTA Launchers */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('galaxy')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-activia-blue to-activia-purple text-white text-xs font-bold shadow-lg shadow-activia-blue/30 hover:shadow-glow-blue transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Explore 3D Galaxy
            </button>
            <button
              onClick={() => onNavigate('activities')}
              className="px-5 py-3 rounded-2xl bg-activia-surface hover:bg-white/10 text-white text-xs font-bold border border-activia-border transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-activia-cyan" />
              Discover Activities
            </button>
          </div>
        </div>
      </div>

      {/* 2. Quick Statistics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-activia-surface/80 border border-activia-border hover:border-activia-blue/40 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-activia-muted">Active Registrations</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-activia-blue group-hover:scale-110 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white font-display">{activeRegistrations.length}</p>
          <p className="text-[11px] text-activia-cyan mt-1 flex items-center gap-1 font-medium">
            <span>{registrations.filter(r => r.status === 'confirmed').length} confirmed seats</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-activia-surface/80 border border-activia-border hover:border-activia-purple/40 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-activia-muted">Upcoming Competitions</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-activia-purple group-hover:scale-110 transition-transform">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white font-display">
            {activities.filter(a => a.isCompetition && a.status === 'published').length}
          </p>
          <p className="text-[11px] text-activia-purple mt-1 flex items-center gap-1 font-medium">
            <span>Open for enrollment</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-activia-surface/80 border border-activia-border hover:border-activia-amber/40 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-activia-muted">Pending Team Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-activia-amber group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white font-display">{pendingTasks.length}</p>
          <p className="text-[11px] text-activia-amber mt-1 flex items-center gap-1 font-medium">
            <span>{tasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length} urgent priorities</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-activia-surface/80 border border-activia-border hover:border-activia-mint/40 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-activia-muted">Verified Achievements</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-activia-mint group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white font-display">{verifiedAchievements.length}</p>
          <p className="text-[11px] text-activia-mint mt-1 flex items-center gap-1 font-medium">
            <span>Institutional certificates verified</span>
          </p>
        </div>
      </div>

      {/* 3. Main Split Section: Today's Action Centre + Competition Journey */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Competition Journey & Action Centre */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Action Centre */}
          <div className="p-6 rounded-3xl bg-activia-surface/90 border border-activia-border shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-activia-blue" />
                <h3 className="text-base font-bold text-white font-display">Student Action Centre</h3>
              </div>
              <span className="text-xs text-activia-muted">Priority items requiring attention</span>
            </div>

            <div className="space-y-3">
              {/* Approval status banner */}
              {registrations.some(r => r.status === 'pending_teacher_approval') && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-white">Registration Under Review</h4>
                    <p className="text-xs text-activia-muted mt-0.5">
                      Your registration for &quot;Horizon HackSprint 2026&quot; is awaiting teacher clearance from Dr. Robert Vance.
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('competitions')}
                    className="text-xs text-amber-400 hover:underline font-semibold"
                  >
                    View Status
                  </button>
                </div>
              )}

              {/* Task Due banner */}
              {tasks.filter(t => t.status === 'in_progress').slice(0, 1).map(task => (
                <div key={task.id} className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
                  <Flame className="w-5 h-5 text-activia-blue mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-white">Active Team Task: {task.title}</h4>
                    <p className="text-xs text-activia-muted mt-0.5">
                      Assigned to you for AstroBots Alpha. Target due date: {task.dueDate}.
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('competitions')}
                    className="text-xs text-activia-blue hover:underline font-semibold"
                  >
                    Open Kanban
                  </button>
                </div>
              ))}

              {/* Upcoming Event Alert */}
              <div className="p-4 rounded-2xl bg-activia-elevated/70 border border-activia-border flex items-start gap-3">
                <Calendar className="w-5 h-5 text-activia-cyan mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-white">Upcoming Competition: Horizon Autonomous Rover Challenge</h4>
                  <p className="text-xs text-activia-muted mt-0.5">
                    November 14, 2026 • 09:00 AM at Robotics & AI Innovation Lab. Hardware inspection due Nov 05.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('calendar')}
                  className="text-xs text-activia-cyan hover:underline font-semibold"
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>

          {/* Featured Opportunities Section */}
          <div className="p-6 rounded-3xl bg-activia-surface/90 border border-activia-border shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-activia-amber" />
                  Featured School Competitions & Events
                </h3>
                <p className="text-xs text-activia-muted mt-0.5">
                  High-profile Olympiads, athletic tournaments, and hackathons
                </p>
              </div>
              <button
                onClick={() => onNavigate('activities')}
                className="text-xs text-activia-blue hover:text-activia-cyan font-semibold flex items-center gap-1 transition-colors"
              >
                View Catalog <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingFeatured.map(act => (
                <div
                  key={act.id}
                  onClick={() => onSelectActivity(act)}
                  className="rounded-2xl bg-activia-elevated/80 border border-activia-border hover:border-activia-blue/50 hover:shadow-glow-blue transition-all cursor-pointer group flex flex-col overflow-hidden"
                >
                  <div className="h-32 w-full relative overflow-hidden">
                    <img
                      src={act.posterUrl}
                      alt={act.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/10">
                      {act.categoryName}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-activia-blue transition-colors line-clamp-1">
                        {act.title}
                      </h4>
                      <p className="text-[11px] text-activia-muted mt-1 line-clamp-2 leading-relaxed">
                        {act.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-activia-muted">
                      <span>{act.date}</span>
                      <span className="text-activia-cyan font-semibold flex items-center gap-1">
                        Inspect <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Announcements & Mini Achievements */}
        <div className="space-y-6">
          {/* Recent Official Announcements */}
          <div className="p-6 rounded-3xl bg-activia-surface/90 border border-activia-border shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-activia-rose" />
                <h3 className="text-sm font-bold text-white font-display">Official Notices</h3>
              </div>
              <button
                onClick={() => onNavigate('announcements')}
                className="text-[11px] text-activia-cyan hover:underline"
              >
                All Notices
              </button>
            </div>

            <div className="space-y-3">
              {announcements.slice(0, 3).map(ann => (
                <div key={ann.id} className="p-3.5 rounded-xl bg-activia-elevated/70 border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-activia-rose uppercase">
                      {ann.priority} Priority
                    </span>
                    <span className="text-[10px] text-activia-muted">
                      {new Date(ann.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{ann.title}</h4>
                  <p className="text-[11px] text-activia-muted mt-1 line-clamp-2 leading-relaxed">{ann.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Verified Achievements Mini Board */}
          <div className="p-6 rounded-3xl bg-activia-surface/90 border border-activia-border shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-activia-purple" />
                <h3 className="text-sm font-bold text-white font-display">Recent Credentials</h3>
              </div>
              <button
                onClick={() => onNavigate('achievements')}
                className="text-[11px] text-activia-purple hover:underline"
              >
                Full Portfolio
              </button>
            </div>

            <div className="space-y-2.5">
              {achievements.slice(0, 3).map(ach => (
                <div
                  key={ach.id}
                  onClick={() => onNavigate('achievements')}
                  className="p-3 rounded-xl bg-activia-elevated/60 border border-activia-border hover:border-activia-purple/40 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <h5 className="text-xs font-semibold text-white group-hover:text-activia-purple transition-colors line-clamp-1">
                      {ach.activityTitle}
                    </h5>
                    <p className="text-[10px] text-activia-cyan mt-0.5">
                      {ach.placement} • {ach.domainArea}
                    </p>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-activia-mint flex-shrink-0" />
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('achievements')}
              className="mt-4 w-full py-2 rounded-xl bg-activia-elevated hover:bg-white/10 text-xs font-semibold text-white border border-white/10 transition-all flex items-center justify-center gap-2"
            >
              Open 3D Constellation Sky
              <Sparkles className="w-3.5 h-3.5 text-activia-purple" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

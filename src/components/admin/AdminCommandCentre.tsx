import React, { useState } from 'react';
import {
  Shield,
  FileSpreadsheet,
  Building2,
  SlidersHorizontal,
  ScrollText,
  Users,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
  Send,
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon,
  Search,
  Check,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  AdminAnalytics,
  SchoolSettings,
  AuditLog,
  Venue,
  FeedbackTicket,
  Announcement,
  UserPersona
} from '../../types';

interface AdminCommandCentreProps {
  analytics: AdminAnalytics;
  settings: SchoolSettings;
  auditLogs: AuditLog[];
  venues: Venue[];
  feedbackTickets: FeedbackTicket[];
  persona: UserPersona;
  onUpdateSettings: (settings: Partial<SchoolSettings>) => void;
  onPostAnnouncement: (announcement: Omit<Announcement, 'id' | 'publishedAt' | 'readByCount' | 'isRead'>) => void;
  onUpdateFeedbackStatus: (id: string, status: any, responseText?: string) => void;
  onExportCsv: (type: 'participation' | 'approvals' | 'competitions' | 'achievements') => void;
}

export const AdminCommandCentre: React.FC<AdminCommandCentreProps> = ({
  analytics,
  settings,
  auditLogs,
  venues,
  feedbackTickets,
  persona,
  onUpdateSettings,
  onPostAnnouncement,
  onUpdateFeedbackStatus,
  onExportCsv,
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'settings' | 'venues' | 'broadcast' | 'feedback_queue' | 'audit'>('analytics');

  // Settings form state
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [schoolMotto, setSchoolMotto] = useState(settings.schoolMotto);
  const [academicYear, setAcademicYear] = useState(settings.academicYear);
  const [currentTerm, setCurrentTerm] = useState(settings.currentTerm);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Broadcast state
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annAudience, setAnnAudience] = useState<Announcement['targetAudience']>('All School');
  const [annPriority, setAnnPriority] = useState<Announcement['priority']>('normal');
  const [annSuccess, setAnnSuccess] = useState(false);

  // Feedback reply state
  const [feedbackReplyText, setFeedbackReplyText] = useState<Record<string, string>>({});

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      schoolName,
      schoolMotto,
      academicYear,
      currentTerm,
    });
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3000);
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annBody.trim()) return;

    onPostAnnouncement({
      title: annTitle.trim(),
      body: annBody.trim(),
      publisher: persona.name,
      publisherRole: persona.role === 'admin' ? 'Super Admin Directorate' : 'Activity Coordinator',
      publisherAvatar: persona.avatar,
      priority: annPriority,
      targetAudience: annAudience,
      category: 'Official Directorate Circular',
    });

    setAnnTitle('');
    setAnnBody('');
    setAnnSuccess(true);
    setTimeout(() => setAnnSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-activia-rose flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Executive School Command Centre
          </span>
          <h2 className="text-2xl font-bold font-display text-white mt-0.5">
            Institutional Administration & Intelligence
          </h2>
          <p className="text-xs text-activia-muted mt-1">
            School-wide participation analytics, venue scheduling, parameter configuration, and audit records.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-activia-surface border border-activia-border overflow-x-auto scrollbar-none self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'analytics' ? 'bg-activia-blue text-white shadow' : 'text-activia-muted hover:text-white'
            }`}
          >
            Analytics & Reports
          </button>
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'broadcast' ? 'bg-activia-blue text-white shadow' : 'text-activia-muted hover:text-white'
            }`}
          >
            Global Broadcast
          </button>
          <button
            onClick={() => setActiveTab('venues')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'venues' ? 'bg-activia-blue text-white shadow' : 'text-activia-muted hover:text-white'
            }`}
          >
            Venues ({venues.length})
          </button>
          <button
            onClick={() => setActiveTab('feedback_queue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'feedback_queue' ? 'bg-activia-blue text-white shadow' : 'text-activia-muted hover:text-white'
            }`}
          >
            Student Voice Queue
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'settings' ? 'bg-activia-blue text-white shadow' : 'text-activia-muted hover:text-white'
            }`}
          >
            School Setup
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'audit' ? 'bg-activia-blue text-white shadow' : 'text-activia-muted hover:text-white'
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* Summary Metrics Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-activia-surface border border-activia-border">
          <span className="text-[11px] text-activia-muted">Open Activities</span>
          <p className="text-xl font-extrabold text-white font-display mt-1">{analytics.openActivities}</p>
        </div>
        <div className="p-4 rounded-2xl bg-activia-surface border border-activia-border">
          <span className="text-[11px] text-activia-muted">Registrations</span>
          <p className="text-xl font-extrabold text-activia-blue font-display mt-1">{analytics.totalRegistrations}</p>
        </div>
        <div className="p-4 rounded-2xl bg-activia-surface border border-activia-border">
          <span className="text-[11px] text-activia-muted">Pending Approvals</span>
          <p className="text-xl font-extrabold text-amber-400 font-display mt-1">{analytics.pendingApprovals}</p>
        </div>
        <div className="p-4 rounded-2xl bg-activia-surface border border-activia-border">
          <span className="text-[11px] text-activia-muted">Student Reach</span>
          <p className="text-xl font-extrabold text-activia-cyan font-display mt-1">{analytics.participatingStudents}</p>
        </div>
        <div className="p-4 rounded-2xl bg-activia-surface border border-activia-border">
          <span className="text-[11px] text-activia-muted">Verified Badges</span>
          <p className="text-xl font-extrabold text-activia-mint font-display mt-1">{analytics.verifiedAchievements}</p>
        </div>
        <div className="p-4 rounded-2xl bg-activia-surface border border-activia-border">
          <span className="text-[11px] text-activia-muted">Voice Tickets</span>
          <p className="text-xl font-extrabold text-activia-purple font-display mt-1">{analytics.openFeedbackTickets}</p>
        </div>
      </div>

      {/* 1. ANALYTICS & CSV REPORTS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Export Report CSV Actions Bar */}
          <div className="p-4 rounded-2xl bg-activia-surface border border-activia-border flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-activia-mint" />
                Institutional Data Exports (CSV)
              </h4>
              <p className="text-[11px] text-activia-muted">
                Download filtered audit-compliant reports for accreditation or board review.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onExportCsv('participation')}
                className="px-3 py-1.5 rounded-xl bg-activia-elevated hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Participation Report
              </button>
              <button
                onClick={() => onExportCsv('approvals')}
                className="px-3 py-1.5 rounded-xl bg-activia-elevated hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Approvals Queue
              </button>
              <button
                onClick={() => onExportCsv('competitions')}
                className="px-3 py-1.5 rounded-xl bg-activia-elevated hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Competitions Catalog
              </button>
              <button
                onClick={() => onExportCsv('achievements')}
                className="px-3 py-1.5 rounded-xl bg-activia-elevated hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Credentials Ledger
              </button>
            </div>
          </div>

          {/* Interactive Recharts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Registration Velocity */}
            <div className="p-6 rounded-3xl bg-activia-surface border border-activia-border shadow-xl space-y-3">
              <h4 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-activia-blue" />
                Monthly Registration Velocity vs Completion
              </h4>
              <p className="text-xs text-activia-muted">
                Tracks total sign-ups against verified certificates across recent school terms.
              </p>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.monthlyRegistrations}>
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#10172b', borderColor: '#233055', borderRadius: '12px' }}
                    />
                    <Legend />
                    <Bar dataKey="registrations" name="Registrations" fill="#6C83FF" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="completions" name="Completions" fill="#43C99A" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Grade Reach Distribution */}
            <div className="p-6 rounded-3xl bg-activia-surface border border-activia-border shadow-xl space-y-3">
              <h4 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <Users className="w-4 h-4 text-activia-cyan" />
                Student Participation by Grade Level
              </h4>
              <p className="text-xs text-activia-muted">
                Enrolled class cohort vs students with active registrations.
              </p>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.gradeReach}>
                    <XAxis dataKey="grade" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#10172b', borderColor: '#233055', borderRadius: '12px' }}
                    />
                    <Legend />
                    <Bar dataKey="enrolled" name="Total Enrolled" fill="#233055" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="participating" name="Actively Participating" fill="#46D8F5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Sector Distribution Pie */}
            <div className="p-6 rounded-3xl bg-activia-surface border border-activia-border shadow-xl space-y-3">
              <h4 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-activia-purple" />
                Participation Breakdown by Extracurricular Sector
              </h4>
              <p className="text-xs text-activia-muted">
                Distribution of student engagement across disciplines.
              </p>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.categoryDistribution}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry: any) => `${entry.name || ''} (${entry.count || 0})`}
                    >
                      {analytics.categoryDistribution.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#10172b', borderColor: '#233055', borderRadius: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: House Cup Engagement */}
            <div className="p-6 rounded-3xl bg-activia-surface border border-activia-border shadow-xl space-y-3">
              <h4 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                House Championship Point Momentum
              </h4>
              <p className="text-xs text-activia-muted">
                Overall points standing and competition participation by house.
              </p>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.houseEngagement}>
                    <XAxis dataKey="house" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#10172b', borderColor: '#233055', borderRadius: '12px' }}
                    />
                    <Legend />
                    <Bar dataKey="points" name="Total House Points" fill="#F5B95B" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="registrations" name="Active Registrations" fill="#6C83FF" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. GLOBAL BROADCAST */}
      {activeTab === 'broadcast' && (
        <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-activia-surface border border-activia-border shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white font-display">Broadcast Official Announcement</h3>
            <p className="text-xs text-activia-muted mt-0.5">
              Send priority announcements to the entire student body, specific classes, or clubs.
            </p>
          </div>

          {annSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400">
              Notice broadcasted and added to active notification bells.
            </div>
          )}

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="text-xs text-activia-muted block mb-1">Notice Headline *</label>
              <input
                type="text"
                required
                placeholder="e.g. Schedule Alteration: All Outdoor Sports Suspended Due to Rain"
                value={annTitle}
                onChange={e => setAnnTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-activia-elevated border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-activia-muted block mb-1">Target Audience</label>
                <select
                  value={annAudience}
                  onChange={e => setAnnAudience(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-activia-elevated border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue"
                >
                  <option value="All School">All School (Whole Institution)</option>
                  <option value="Senior Secondary">Senior Secondary (Grades 10-12)</option>
                  <option value="Junior High">Junior High (Grades 6-9)</option>
                  <option value="STEM Clubs">STEM & Robotics Guilds</option>
                  <option value="House Leaders">House Captains & Prefects</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-activia-muted block mb-1">Broadcast Priority</label>
                <select
                  value={annPriority}
                  onChange={e => setAnnPriority(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-activia-elevated border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue"
                >
                  <option value="normal">Normal Bulletin</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent / Emergency Alert</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-activia-muted block mb-1">Circular Body *</label>
              <textarea
                required
                rows={4}
                placeholder="Compose authoritative message content..."
                value={annBody}
                onChange={e => setAnnBody(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-activia-elevated border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-activia-blue hover:bg-activia-blue/90 text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              Dispatch School-Wide Broadcast
            </button>
          </form>
        </div>
      )}

      {/* 3. VENUE MANAGEMENT */}
      {activeTab === 'venues' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h3 className="text-base font-bold text-white font-display">Campus Venues & Capacity Directory</h3>
            <span className="text-xs text-activia-muted">
              Reservations monitored by automated double-booking prevention engine.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues.map(v => (
              <div key={v.id} className="p-5 rounded-2xl bg-activia-surface border border-activia-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/5 text-activia-cyan">
                    {v.code}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                    Operational
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white">{v.name}</h4>
                <p className="text-xs text-activia-muted">{v.building}</p>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-activia-muted">
                  <span>Max Capacity:</span>
                  <span className="text-white font-bold">{v.capacity} seats</span>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {v.features.map(f => (
                    <span key={f} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.03] text-activia-text">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. STUDENT VOICE QUEUE */}
      {activeTab === 'feedback_queue' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h3 className="text-base font-bold text-white font-display">Student Voice Resolution Queue</h3>
            <span className="text-xs text-activia-muted">
              Review proposals, update status, and communicate official responses.
            </span>
          </div>

          <div className="space-y-3">
            {feedbackTickets.map(ticket => (
              <div key={ticket.id} className="p-5 rounded-2xl bg-activia-surface border border-activia-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{ticket.title}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-activia-blue/20 text-activia-blue">
                    {ticket.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-activia-muted">{ticket.description}</p>
                <p className="text-[10px] text-activia-cyan">
                  From: {ticket.submittedBy} • Category: {ticket.category}
                </p>

                {/* Reply section */}
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter official resolution response..."
                    value={feedbackReplyText[ticket.id] || ''}
                    onChange={e => setFeedbackReplyText({ ...feedbackReplyText, [ticket.id]: e.target.value })}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-activia-elevated border border-activia-border text-xs text-white"
                  />
                  <button
                    onClick={() => {
                      const reply = feedbackReplyText[ticket.id] || 'Under active administrative consideration.';
                      onUpdateFeedbackStatus(ticket.id, 'resolved', reply);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-activia-mint/20 hover:bg-activia-mint/30 text-activia-mint border border-activia-mint/40 text-xs font-semibold"
                  >
                    Resolve Ticket
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SCHOOL SETUP */}
      {activeTab === 'settings' && (
        <div className="max-w-xl mx-auto p-6 rounded-3xl bg-activia-surface border border-activia-border shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white font-display">Institution Branding & Parameters</h3>
            <p className="text-xs text-activia-muted mt-0.5">
              Customize institution title, academic calendar parameters, and principal seal.
            </p>
          </div>

          {settingsSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400">
              Institutional configuration updated successfully.
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="text-xs text-activia-muted block mb-1">School Name</label>
              <input
                type="text"
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-activia-elevated border border-activia-border text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs text-activia-muted block mb-1">Institutional Motto</label>
              <input
                type="text"
                value={schoolMotto}
                onChange={e => setSchoolMotto(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-activia-elevated border border-activia-border text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-activia-muted block mb-1">Academic Year</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={e => setAcademicYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-activia-elevated border border-activia-border text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-activia-muted block mb-1">Current Term</label>
                <input
                  type="text"
                  value={currentTerm}
                  onChange={e => setCurrentTerm(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-activia-elevated border border-activia-border text-xs text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-activia-blue hover:bg-activia-blue/90 text-white text-xs font-bold shadow-lg transition-all"
            >
              Update School Settings
            </button>
          </form>
        </div>
      )}

      {/* 6. SECURITY & AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-3xl bg-activia-surface border border-activia-border shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <h3 className="text-base font-bold text-white font-display">System Security & Audit Trail</h3>
              <p className="text-xs text-activia-muted mt-0.5">
                Cryptographic immutable log of administrative and teacher operations.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-activia-muted">
              <thead className="bg-white/5 text-white uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actor</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Entity</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {auditLogs.slice(0, 15).map(log => (
                  <tr key={log.id} className="hover:bg-white/[0.02]">
                    <td className="p-3 font-mono text-[10px] text-activia-muted">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 font-semibold text-white">
                      {log.actorName} ({log.actorRole})
                    </td>
                    <td className="p-3 font-mono text-[10px] text-activia-cyan">
                      {log.action}
                    </td>
                    <td className="p-3">{log.targetEntity}</td>
                    <td className="p-3 text-activia-text">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

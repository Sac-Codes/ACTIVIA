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
  BarChart3,
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
  Cell
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
  const [activeTab, setActiveTab] = useState<'analytics' | 'settings' | 'broadcast' | 'audit'>('analytics');

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
      publisherRole: 'Administrator',
      publisherAvatar: persona.avatar,
      priority: annPriority,
      targetAudience: annAudience,
    });

    setAnnTitle('');
    setAnnBody('');
    setAnnSuccess(true);
    setTimeout(() => setAnnSuccess(false), 3000);
  };

  const chartColors = ['#4F46E5', '#0EA5A4', '#F59E0B', '#16A34A', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl border border-app-border p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-app-text">
            Administrator Command Centre
          </h2>
          <p className="text-xs sm:text-sm text-app-muted mt-1">
            Institutional governance cockpit for co-curricular compliance, analytics, setting controls, and audit trails.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-app-secondary border border-app-border self-start md:self-auto">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-app-muted hover:text-app-text'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'broadcast'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-app-muted hover:text-app-text'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Broadcasts</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-app-muted hover:text-app-text'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>School Settings</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-app-muted hover:text-app-text'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Real Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-app-border p-5 shadow-xs">
          <span className="text-xs font-medium text-app-muted">Total Registered Programs</span>
          <p className="text-2xl font-bold text-app-text mt-2">{analytics.totalActivities}</p>
          <p className="text-xs text-app-muted mt-1">Across 6 academic faculties</p>
        </div>

        <div className="bg-white rounded-xl border border-app-border p-5 shadow-xs">
          <span className="text-xs font-medium text-app-muted">Total Student Enrollments</span>
          <p className="text-2xl font-bold text-app-text mt-2">{analytics.totalRegistrations}</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Active participant records</p>
        </div>

        <div className="bg-white rounded-xl border border-app-border p-5 shadow-xs">
          <span className="text-xs font-medium text-app-muted">Pending Administrative Tasks</span>
          <p className="text-2xl font-bold text-app-text mt-2">{analytics.pendingApprovals}</p>
          <p className="text-xs text-amber-600 font-medium mt-1">Awaiting review</p>
        </div>

        <div className="bg-white rounded-xl border border-app-border p-5 shadow-xs">
          <span className="text-xs font-medium text-app-muted">School Facilities Monitored</span>
          <p className="text-2xl font-bold text-app-text mt-2">{venues.length}</p>
          <p className="text-xs text-app-muted mt-1">Collision-free scheduling</p>
        </div>
      </div>

      {/* TAB 1: ANALYTICS & CSV EXPORT */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-app-border p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-app-text">Monthly Registration Velocity</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.monthlyRegistrations}>
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="registrations" name="Applications" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completions" name="Verified Completions" fill="#0EA5A4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-app-border p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-app-text">Program Category Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.categoryDistribution}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name }) => name}
                    >
                      {analytics.categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* CSV Export Centre */}
          <div className="bg-white rounded-xl border border-app-border p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-app-text">Data Export Centre</h3>
            <p className="text-xs text-app-muted">
              Download clean CSV spreadsheets for institutional reviews, board audits, and accreditation records.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onExportCsv('participation')}
                className="px-3.5 py-2 rounded-lg bg-app-secondary hover:bg-indigo-50 border border-app-border text-xs font-semibold text-app-text hover:text-indigo-700 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>Export Participation Records (CSV)</span>
              </button>
              <button
                onClick={() => onExportCsv('approvals')}
                className="px-3.5 py-2 rounded-lg bg-app-secondary hover:bg-indigo-50 border border-app-border text-xs font-semibold text-app-text hover:text-indigo-700 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-teal-600" />
                <span>Export Applications Ledger (CSV)</span>
              </button>
              <button
                onClick={() => onExportCsv('competitions')}
                className="px-3.5 py-2 rounded-lg bg-app-secondary hover:bg-indigo-50 border border-app-border text-xs font-semibold text-app-text hover:text-indigo-700 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-amber-600" />
                <span>Export Competitions Summary (CSV)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BROADCAST SYSTEM */}
      {activeTab === 'broadcast' && (
        <div className="bg-white rounded-xl border border-app-border p-6 shadow-xs max-w-2xl mx-auto space-y-4">
          <div className="pb-3 border-b border-app-border">
            <h3 className="text-base font-bold text-app-text">School-Wide Announcement Broadcast</h3>
            <p className="text-xs text-app-muted mt-0.5">
              Publish authorized notifications that will appear across all student and teacher dashboards.
            </p>
          </div>

          {annSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Announcement broadcasted successfully!</span>
            </div>
          )}

          <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
            <div>
              <label className="text-app-muted block mb-1 font-medium">Announcement Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Schedule Change for Inter-House Track Trials"
                value={annTitle}
                onChange={e => setAnnTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-app-border bg-white text-app-text focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-app-muted block mb-1 font-medium">Priority Level</label>
                <select
                  value={annPriority}
                  onChange={e => setAnnPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-app-border bg-white text-app-text"
                >
                  <option value="normal">Normal Circular</option>
                  <option value="urgent">Urgent Alert</option>
                  <option value="pinned">Pinned Notice</option>
                </select>
              </div>

              <div>
                <label className="text-app-muted block mb-1 font-medium">Target Audience</label>
                <select
                  value={annAudience}
                  onChange={e => setAnnAudience(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-app-border bg-white text-app-text"
                >
                  <option value="All School">All School (Students & Staff)</option>
                  <option value="Senior Secondary">Senior Secondary Only</option>
                  <option value="Junior High">Junior High Only</option>
                  <option value="STEM Clubs">STEM Clubs</option>
                  <option value="House Leaders">House Captains & Leaders</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-app-muted block mb-1 font-medium">Announcement Body *</label>
              <textarea
                required
                placeholder="Detailed circular text..."
                value={annBody}
                onChange={e => setAnnBody(e.target.value)}
                rows={4}
                className="w-full p-3 rounded-lg border border-app-border bg-white text-app-text focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Announcement</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: INSTITUTIONAL SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl border border-app-border p-6 shadow-xs max-w-2xl mx-auto space-y-4">
          <div className="pb-3 border-b border-app-border">
            <h3 className="text-base font-bold text-app-text">Institutional Parameters</h3>
            <p className="text-xs text-app-muted mt-0.5">
              Configure school branding, academic year parameters, and registration eligibility rules.
            </p>
          </div>

          {settingsSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Institutional parameters saved to database!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="text-app-muted block mb-1 font-medium">Institution Name *</label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-app-border bg-white text-app-text focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="text-app-muted block mb-1 font-medium">School Motto</label>
              <input
                type="text"
                value={schoolMotto}
                onChange={e => setSchoolMotto(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-app-border bg-white text-app-text"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-app-muted block mb-1 font-medium">Academic Session</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={e => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-app-border bg-white text-app-text"
                />
              </div>
              <div>
                <label className="text-app-muted block mb-1 font-medium">Current Term / Semester</label>
                <input
                  type="text"
                  value={currentTerm}
                  onChange={e => setCurrentTerm(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-app-border bg-white text-app-text"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
            >
              Save Settings
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-app-border shadow-xs overflow-hidden">
          <div className="p-5 border-b border-app-border flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-app-text">System Audit Trail</h3>
              <p className="text-xs text-app-muted mt-0.5">
                Immutable chronological ledger of administrative operations and status changes.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-app-text">
              <thead className="bg-app-secondary border-b border-app-border text-[11px] font-semibold text-app-muted uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Actor</th>
                  <th className="px-5 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {auditLogs.slice(0, 20).map(log => (
                  <tr key={log.id} className="hover:bg-app-secondary/40">
                    <td className="px-5 py-3 text-app-muted whitespace-nowrap">
                      {log.timestamp || log.created_at || 'Just now'}
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-indigo-50 text-indigo-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium">
                      {log.actorName || log.admin_username || 'system'}
                    </td>
                    <td className="px-5 py-3 text-app-muted">
                      {log.details}
                    </td>
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

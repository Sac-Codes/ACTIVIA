import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Trophy,
  Plus,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  Send,
  Eye,
  ShieldCheck,
  Building,
  Filter
} from 'lucide-react';
import { Activity, Registration, Team, ProjectTask, UserPersona, RegistrationStatus } from '../../types';
import { ACTIVITY_CATEGORIES } from '../../data/mockData';

interface TeacherDashboardProps {
  persona: UserPersona;
  activities: Activity[];
  registrations: Registration[];
  teams: Team[];
  tasks: ProjectTask[];
  onUpdateRegistrationStatus: (id: string, status: RegistrationStatus, notes?: string) => void;
  onCreateActivity: (activity: any) => void;
  onNavigate: (tab: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  persona,
  activities,
  registrations,
  teams,
  tasks,
  onUpdateRegistrationStatus,
  onCreateActivity,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'approvals' | 'create_activity' | 'teams'>('approvals');
  const [approvalNotes, setApprovalNotes] = useState<Record<string, string>>({});
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // New Activity Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('stem-robotics');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState('2026-11-25');
  const [newStartTime, setNewStartTime] = useState('14:00');
  const [newEndTime, setNewEndTime] = useState('16:30');
  const [newVenue, setNewVenue] = useState('Robotics & AI Innovation Lab');
  const [newCapacity, setNewCapacity] = useState('40');
  const [newFormat, setNewFormat] = useState<'individual' | 'team'>('individual');
  const [newEligibleGrades, setNewEligibleGrades] = useState(['Grade 10', 'Grade 11', 'Grade 12']);

  const pendingRegistrations = registrations.filter(
    r => r.status === 'pending_teacher_approval' || r.status === 'submitted'
  );
  const confirmedRegistrations = registrations.filter(
    r => r.status === 'confirmed'
  );

  const handleApprove = (regId: string) => {
    const note = approvalNotes[regId] || 'Approved by coordinating faculty mentor.';
    onUpdateRegistrationStatus(regId, 'confirmed', note);
    setActionMessage('Registration approved and seat allocated.');
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleReject = (regId: string) => {
    const note = approvalNotes[regId] || 'Prerequisites or team requirements not met.';
    onUpdateRegistrationStatus(regId, 'rejected', note);
    setActionMessage('Registration declined.');
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleCreateActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const categoryObj = ACTIVITY_CATEGORIES.find(c => c.id === newCategory);

    onCreateActivity({
      title: newTitle.trim(),
      category: newCategory,
      categoryName: categoryObj?.name || 'Science & Technology',
      description: newDesc.trim(),
      fullOverview: newDesc.trim(),
      posterUrl: '',
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      venue: newVenue,
      organizer: persona.name,
      coordinatingTeacher: persona.name,
      status: 'published',
      isFeatured: true,
      isCompetition: newFormat === 'team',
      participationFormat: newFormat,
      totalSeats: parseInt(newCapacity, 10) || 50,
      cost: 'Free',
      eligibleGrades: newEligibleGrades,
      rules: ['Adhere to lab safety codes', 'Complete required milestone submissions'],
    });

    setActionMessage(`Activity "${newTitle}" published successfully!`);
    setNewTitle('');
    setNewDesc('');
    setTimeout(() => setActionMessage(null), 3000);
    setActiveTab('approvals');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl border border-app-border p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-app-text">
            Faculty & Mentor Workspace
          </h2>
          <p className="text-xs sm:text-sm text-app-muted mt-1">
            Logged in as <strong>{persona.name}</strong> • {persona.designation || 'Head of Robotics & Physics'}
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-app-secondary border border-app-border self-start md:self-auto">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'approvals'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-app-muted hover:text-app-text'
            }`}
          >
            <span>Approvals Queue</span>
            {pendingRegistrations.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-100 text-red-700 font-bold">
                {pendingRegistrations.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('create_activity')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'create_activity'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-app-muted hover:text-app-text'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Activity</span>
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'teams'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-app-muted hover:text-app-text'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Supervised Teams ({teams.length})</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-app-border p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-app-muted">Pending Applications</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-app-text mt-3">{pendingRegistrations.length}</p>
          <p className="text-xs text-app-muted mt-1">Awaiting mentor clearance</p>
        </div>

        <div className="bg-white rounded-xl border border-app-border p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-app-muted">Approved Registrations</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-app-text mt-3">{confirmedRegistrations.length}</p>
          <p className="text-xs text-app-muted mt-1">Confirmed active participants</p>
        </div>

        <div className="bg-white rounded-xl border border-app-border p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-app-muted">Supervised Activities</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-app-text mt-3">{activities.length}</p>
          <p className="text-xs text-app-muted mt-1">Published departmental events</p>
        </div>

        <div className="bg-white rounded-xl border border-app-border p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-app-muted">Mentored Teams</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-app-text mt-3">{teams.length}</p>
          <p className="text-xs text-app-muted mt-1">Competition squads</p>
        </div>
      </div>

      {/* TAB 1: REGISTRATION APPROVALS QUEUE */}
      {activeTab === 'approvals' && (
        <div className="bg-white rounded-xl border border-app-border shadow-xs overflow-hidden">
          <div className="p-5 border-b border-app-border flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-app-text">Pending Registration Approvals</h3>
              <p className="text-xs text-app-muted mt-0.5">
                Review student applications and allocate event seats.
              </p>
            </div>
          </div>

          {pendingRegistrations.length === 0 ? (
            <div className="p-16 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
              <h4 className="text-base font-semibold text-app-text">All Caught Up!</h4>
              <p className="text-xs text-app-muted mt-1">
                There are no pending registrations requiring faculty review at this time.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-app-border">
              {pendingRegistrations.map(reg => (
                <div key={reg.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-app-secondary/30 transition-colors">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                        {reg.activityTitle}
                      </span>
                      <span className="text-xs text-app-subtle">
                        Applied: {new Date(reg.submittedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-app-text">
                      {reg.studentName} <span className="text-xs font-normal text-app-muted">({reg.studentGrade} • {reg.studentHouse} House)</span>
                    </p>

                    {reg.motivation && (
                      <p className="text-xs text-app-muted leading-relaxed bg-app-secondary p-2.5 rounded-lg border border-app-border">
                        &ldquo;{reg.motivation}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                    <input
                      type="text"
                      placeholder="Mentor note (optional)..."
                      value={approvalNotes[reg.id] || ''}
                      onChange={e => setApprovalNotes({ ...approvalNotes, [reg.id]: e.target.value })}
                      className="px-3 py-1.5 text-xs rounded-lg border border-app-border bg-white text-app-text w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => handleApprove(reg.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(reg.id)}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-red-50 text-red-600 border border-red-200 font-semibold text-xs transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CREATE NEW ACTIVITY */}
      {activeTab === 'create_activity' && (
        <div className="bg-white rounded-xl border border-app-border p-6 shadow-xs max-w-2xl mx-auto space-y-4">
          <div className="pb-3 border-b border-app-border">
            <h3 className="text-base font-bold text-app-text">Publish New Co-Curricular Activity</h3>
            <p className="text-xs text-app-muted mt-0.5">
              Create a sanctioned school workshop, competition, or trial session with verified capacity guards.
            </p>
          </div>

          <form onSubmit={handleCreateActivitySubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-app-muted block mb-1 font-medium">Activity Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Regional Championship Mock Trials"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-app-border bg-white text-app-text focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-app-muted block mb-1 font-medium">Category / Department *</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-app-border bg-white text-app-text focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                >
                  {ACTIVITY_CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-app-muted block mb-1 font-medium">Participation Format</label>
                <select
                  value={newFormat}
                  onChange={e => setNewFormat(e.target.value as 'individual' | 'team')}
                  className="w-full px-3 py-2 rounded-lg border border-app-border bg-white text-app-text"
                >
                  <option value="individual">Individual Participation</option>
                  <option value="team">Team / Squad Collaboration</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-app-muted block mb-1 font-medium">Overview Description *</label>
              <textarea
                required
                placeholder="Comprehensive description of objectives, schedule, prerequisites, and equipment..."
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-lg border border-app-border bg-white text-app-text focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-app-muted block mb-1 font-medium">Date (YYYY-MM-DD) *</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-app-border bg-white text-app-text"
                />
              </div>
              <div>
                <label className="text-app-muted block mb-1 font-medium">Start Time *</label>
                <input
                  type="time"
                  required
                  value={newStartTime}
                  onChange={e => setNewStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-app-border bg-white text-app-text"
                />
              </div>
              <div>
                <label className="text-app-muted block mb-1 font-medium">End Time *</label>
                <input
                  type="time"
                  required
                  value={newEndTime}
                  onChange={e => setNewEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-app-border bg-white text-app-text"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-app-muted block mb-1 font-medium">Venue / Room *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Center Lab 4B"
                  value={newVenue}
                  onChange={e => setNewVenue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-app-border bg-white text-app-text"
                />
              </div>
              <div>
                <label className="text-app-muted block mb-1 font-medium">Participant Capacity</label>
                <input
                  type="number"
                  placeholder="e.g. 40"
                  value={newCapacity}
                  onChange={e => setNewCapacity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-app-border bg-white text-app-text"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-app-border flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('approvals')}
                className="px-4 py-2 rounded-lg border border-app-border text-app-text font-medium hover:bg-app-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
              >
                Publish Activity
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: SUPERVISED TEAMS */}
      {activeTab === 'teams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map(team => (
            <div key={team.id} className="bg-white rounded-xl border border-app-border p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {team.activityTitle}
                </span>
                <span className="text-xs font-mono font-bold text-app-muted">Code: {team.inviteCode}</span>
              </div>

              <div>
                <h4 className="text-base font-bold text-app-text">{team.name}</h4>
                <p className="text-xs text-app-muted mt-0.5">Leader: {team.leaderName}</p>
              </div>

              <div className="pt-2 border-t border-app-border-subtle flex items-center justify-between text-xs text-app-muted">
                <span>Roster: {team.members.length} students</span>
                <span>Progress: {team.milestoneProgress}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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
  Sparkles,
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
  const [activeTab, setActiveTab] = useState<'approvals' | 'create_activity' | 'teams' | 'attendance'>('approvals');
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

  // Attendance simulator state
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, boolean>>({
    'reg-001': true,
    'reg-003': true,
    'reg-005': false,
  });

  const pendingRegistrations = registrations.filter(r => r.status === 'pending_teacher_approval');

  const handleApprove = (regId: string) => {
    const note = approvalNotes[regId] || 'Approved by coordinating faculty mentor.';
    onUpdateRegistrationStatus(regId, 'confirmed', note);
    setActionMessage('Registration approved and seat allocated.');
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleReject = (regId: string) => {
    const note = approvalNotes[regId] || 'Did not meet prerequisites or team criteria.';
    onUpdateRegistrationStatus(regId, 'rejected', note);
    setActionMessage('Registration rejected with notes sent to student.');
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleCreateActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const categoryObj = ACTIVITY_CATEGORIES.find(c => c.id === newCategory);

    onCreateActivity({
      title: newTitle.trim(),
      category: newCategory,
      categoryName: categoryObj?.name || 'STEM, Robotics & Coding',
      description: newDesc.trim(),
      fullOverview: newDesc.trim() + ' Organized under faculty guidance with verified certification.',
      posterUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80',
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      registrationDeadline: newDate,
      venue: newVenue,
      venueCapacity: parseInt(newCapacity) || 50,
      organizer: `${categoryObj?.name || 'Department'} Cell`,
      coordinatingTeacher: persona.name,
      status: 'published',
      isFeatured: false,
      isCompetition: true,
      participationFormat: newFormat,
      totalSeats: parseInt(newCapacity) || 50,
      cost: 'Free',
      eligibleGrades: newEligibleGrades,
      rules: ['Student ID badge required.', 'Punctual attendance mandatory for certificate.'],
    });

    setNewTitle('');
    setNewDesc('');
    setActionMessage(`Activity "${newTitle}" published successfully!`);
    setTimeout(() => setActionMessage(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-activia-purple flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Faculty & Mentor Control Panel
          </span>
          <h2 className="text-2xl font-bold font-display text-white mt-0.5">
            Teacher & Mentor Workspace
          </h2>
          <p className="text-xs text-activia-muted mt-1">
            Logged in as <strong className="text-white">{persona.name}</strong> • {persona.designation}
          </p>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-activia-surface border border-activia-border self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'approvals' ? 'bg-activia-blue text-white shadow' : 'text-activia-muted hover:text-white'
            }`}
          >
            Approvals Queue
            {pendingRegistrations.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-activia-rose text-white">
                {pendingRegistrations.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('create_activity')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'create_activity' ? 'bg-activia-blue text-white shadow' : 'text-activia-muted hover:text-white'
            }`}
          >
            Create Activity
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'teams' ? 'bg-activia-blue text-white shadow' : 'text-activia-muted hover:text-white'
            }`}
          >
            Supervised Teams ({teams.length})
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'attendance' ? 'bg-activia-blue text-white shadow' : 'text-activia-muted hover:text-white'
            }`}
          >
            Attendance & Results
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {actionMessage}
        </div>
      )}

      {/* 1. APPROVALS QUEUE */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h3 className="text-base font-bold text-white font-display">
              Pending Student Applications ({pendingRegistrations.length})
            </h3>
            <span className="text-xs text-activia-muted">
              Approve or reject student registrations before registration deadlines.
            </span>
          </div>

          {pendingRegistrations.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-activia-surface/50 border border-activia-border/50">
              <CheckCircle2 className="w-10 h-10 text-activia-mint mx-auto mb-2 opacity-80" />
              <h4 className="text-base font-bold text-white">All Clear!</h4>
              <p className="text-xs text-activia-muted mt-1">
                No registrations are currently awaiting your faculty authorization.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRegistrations.map(reg => (
                <div
                  key={reg.id}
                  className="p-6 rounded-3xl bg-activia-surface border border-activia-border shadow-xl space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-activia-cyan">
                        {reg.activityCategory} • {reg.format.toUpperCase()} REGISTRATION
                      </span>
                      <h4 className="text-base font-bold text-white mt-0.5">{reg.activityTitle}</h4>
                    </div>
                    <span className="text-[11px] text-activia-muted">
                      Applied: {new Date(reg.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Student Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-activia-elevated/70 text-xs">
                    <div>
                      <span className="text-activia-muted block">Student</span>
                      <strong className="text-white">{reg.studentName}</strong>
                    </div>
                    <div>
                      <span className="text-activia-muted block">Grade / Section</span>
                      <strong className="text-white">{reg.studentGrade} - {reg.studentSection}</strong>
                    </div>
                    <div>
                      <span className="text-activia-muted block">House</span>
                      <strong className="text-white">{reg.studentHouse}</strong>
                    </div>
                    <div>
                      <span className="text-activia-muted block">Parent Consent</span>
                      <strong className="text-activia-mint flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </strong>
                    </div>
                  </div>

                  {reg.teamName && (
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                      <p className="font-semibold text-white">Proposed Squad: {reg.teamName}</p>
                      <p className="text-activia-muted mt-0.5">Roster: {reg.teamMembers?.join(', ')}</p>
                    </div>
                  )}

                  {/* Motivation */}
                  <div className="text-xs">
                    <span className="text-activia-muted font-semibold block mb-1">Student Motivation:</span>
                    <p className="text-activia-text italic bg-white/5 p-3 rounded-xl leading-relaxed">
                      &ldquo;{reg.motivation}&rdquo;
                    </p>
                  </div>

                  {/* Review Notes Input */}
                  <div>
                    <label className="text-[11px] text-activia-muted block mb-1">
                      Faculty Feedback / Endorsement Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Cleared for Lab 3 hardware testing..."
                      value={approvalNotes[reg.id] || ''}
                      onChange={e => setApprovalNotes({ ...approvalNotes, [reg.id]: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-activia-elevated border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue"
                    />
                  </div>

                  {/* Approve / Reject Actions */}
                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    <button
                      onClick={() => handleReject(reg.id)}
                      className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      Decline Registration
                    </button>
                    <button
                      onClick={() => handleApprove(reg.id)}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-activia-blue to-activia-purple hover:opacity-90 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Grant Faculty Approval
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. CREATE NEW ACTIVITY DRAFT */}
      {activeTab === 'create_activity' && (
        <div className="p-6 rounded-3xl bg-activia-surface border border-activia-border shadow-xl max-w-2xl mx-auto space-y-4">
          <div>
            <h3 className="text-base font-bold text-white font-display">Draft & Publish Activity</h3>
            <p className="text-xs text-activia-muted mt-0.5">
              Launch a sanctioned competition, workshop, or inter-house challenge into the ACTIVIA directory.
            </p>
          </div>

          <form onSubmit={handleCreateActivitySubmit} className="space-y-4">
            <div>
              <label className="text-xs text-activia-muted block mb-1">Activity Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Autonomous Drone Racing Invitational"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-activia-elevated border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-activia-muted block mb-1">Sector Category</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-activia-elevated border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue"
                >
                  {ACTIVITY_CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-activia-muted block mb-1">Participation Format</label>
                <select
                  value={newFormat}
                  onChange={e => setNewFormat(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-activia-elevated border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue"
                >
                  <option value="individual">Individual Entry</option>
                  <option value="team">Team Squad Format</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-activia-muted block mb-1">Brief Description *</label>
              <textarea
                required
                rows={3}
                placeholder="Summarize the learning goals, technical requirements, and target outcomes..."
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-activia-elevated border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-activia-muted block mb-1">Event Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-activia-elevated border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue"
                />
              </div>
              <div>
                <label className="text-xs text-activia-muted block mb-1">Start Time</label>
                <input
                  type="time"
                  value={newStartTime}
                  onChange={e => setNewStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-activia-elevated border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue"
                />
              </div>
              <div>
                <label className="text-xs text-activia-muted block mb-1">End Time</label>
                <input
                  type="time"
                  value={newEndTime}
                  onChange={e => setNewEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-activia-elevated border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-activia-muted block mb-1">Campus Venue</label>
                <input
                  type="text"
                  value={newVenue}
                  onChange={e => setNewVenue(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-activia-elevated border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue"
                />
              </div>
              <div>
                <label className="text-xs text-activia-muted block mb-1">Seat Capacity</label>
                <input
                  type="number"
                  value={newCapacity}
                  onChange={e => setNewCapacity(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-activia-elevated border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-activia-blue hover:bg-activia-blue/90 text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              Publish to Activity Universe
            </button>
          </form>
        </div>
      )}

      {/* 3. SUPERVISED TEAMS */}
      {activeTab === 'teams' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teams.map(team => (
              <div key={team.id} className="p-6 rounded-3xl bg-activia-surface border border-activia-border shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-activia-blue">
                    {team.activityTitle}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-activia-mint/20 text-activia-mint">
                    Progress: {team.milestoneProgress}%
                  </span>
                </div>

                <h3 className="text-base font-bold text-white font-display">{team.name}</h3>
                <p className="text-xs text-activia-muted">Project: {team.projectTitle}</p>

                <div className="p-3 rounded-2xl bg-activia-elevated/70 space-y-2 text-xs">
                  <span className="text-white font-semibold">Active Members:</span>
                  <div className="flex flex-wrap gap-2">
                    {team.members.map(m => (
                      <span key={m.id} className="px-2.5 py-1 rounded-lg bg-white/5 text-white text-[11px]">
                        {m.name} ({m.role})
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('competitions')}
                  className="w-full py-2 rounded-xl bg-activia-elevated hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors"
                >
                  Open Team Task Board
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ATTENDANCE & RESULTS LOGGING */}
      {activeTab === 'attendance' && (
        <div className="p-6 rounded-3xl bg-activia-surface border border-activia-border shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <h3 className="text-base font-bold text-white font-display">Event Attendance & Result Roster</h3>
              <p className="text-xs text-activia-muted mt-0.5">
                Mark attendance and submit verified competition outcomes for certificate issuance.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-activia-muted">
              <thead className="bg-white/5 text-white uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Student / Squad</th>
                  <th className="p-3">Activity</th>
                  <th className="p-3">House</th>
                  <th className="p-3">Attendance</th>
                  <th className="p-3">Outcome Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {registrations.filter(r => r.status === 'confirmed').map(reg => {
                  const isPresent = attendanceRecords[reg.id] !== false;
                  return (
                    <tr key={reg.id} className="hover:bg-white/[0.02]">
                      <td className="p-3 font-semibold text-white">
                        {reg.teamName ? `${reg.teamName} (${reg.studentName})` : reg.studentName}
                      </td>
                      <td className="p-3">{reg.activityTitle}</td>
                      <td className="p-3 text-activia-cyan">{reg.studentHouse}</td>
                      <td className="p-3">
                        <button
                          onClick={() => setAttendanceRecords({ ...attendanceRecords, [reg.id]: !isPresent })}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            isPresent
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          }`}
                        >
                          {isPresent ? 'Present' : 'Absent'}
                        </button>
                      </td>
                      <td className="p-3 text-activia-mint font-semibold">
                        Eligible for Verification
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Trophy,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  ShieldCheck,
  FileText,
  Upload,
  Calendar,
  Sparkles,
  MessageSquare,
  AlertCircle,
  Copy,
  Check,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Team, ProjectTask, Registration, Activity, TaskStatus, TaskPriority } from '../../types';

interface CompetitionWorkspaceProps {
  teams: Team[];
  tasks: ProjectTask[];
  registrations: Registration[];
  activities: Activity[];
  studentName: string;
  studentId: string;
  onJoinTeamByCode: (code: string) => { success: boolean; error?: string };
  onCreateTask: (task: Omit<ProjectTask, 'id'>) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onSelectActivity: (act: Activity) => void;
}

const MILESTONES = [
  { id: 1, label: 'Opportunity Discovered', completed: true },
  { id: 2, label: 'Interest Expressed', completed: true },
  { id: 3, label: 'Registration Submitted', completed: true },
  { id: 4, label: 'Required Approvals', completed: true },
  { id: 5, label: 'Team Formation', completed: true },
  { id: 6, label: 'Technical Preparation', completed: true },
  { id: 7, label: 'Internal Review', completed: false },
  { id: 8, label: 'Official Registration', completed: false },
  { id: 9, label: 'Project Submission', completed: false },
  { id: 10, label: 'Competition Day', completed: false },
  { id: 11, label: 'Result Verification', completed: false },
  { id: 12, label: 'Certificate Issued', completed: false },
];

export const CompetitionWorkspace: React.FC<CompetitionWorkspaceProps> = ({
  teams,
  tasks,
  registrations,
  activities,
  studentName,
  studentId,
  onJoinTeamByCode,
  onCreateTask,
  onUpdateTaskStatus,
  onSelectActivity,
}) => {
  const [selectedTeam, setSelectedTeam] = useState<Team>(teams[0] || null);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);

  // New Task Modal State
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignee, setTaskAssignee] = useState(studentName);
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskDueDate, setTaskDueDate] = useState('2026-11-10');

  // Submission simulator state
  const [submittedFile, setSubmittedFile] = useState<{ name: string; size: string; date: string } | null>({
    name: 'AstroBots_Rover_SLAM_Logbook_v2.1.pdf',
    size: '8.4 MB',
    date: '2026-10-27'
  });
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const teamTasks = selectedTeam ? tasks.filter(t => t.teamId === selectedTeam.id) : [];

  const handleCopyCode = () => {
    if (selectedTeam) {
      navigator.clipboard.writeText(selectedTeam.inviteCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    setJoinSuccess(null);
    if (!inviteCodeInput.trim()) return;

    const res = onJoinTeamByCode(inviteCodeInput);
    if (res.success) {
      setJoinSuccess(`Successfully joined team!`);
      setInviteCodeInput('');
    } else {
      setJoinError(res.error || 'Failed to join team.');
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !selectedTeam) return;

    onCreateTask({
      teamId: selectedTeam.id,
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      assigneeName: taskAssignee,
      status: 'todo',
      priority: taskPriority,
      dueDate: taskDueDate,
    });

    setTaskTitle('');
    setTaskDesc('');
    setNewTaskOpen(false);
  };

  const handleSimulateUpload = () => {
    setSubmittedFile({
      name: 'AstroBots_Final_Engineering_Report_v3.pdf',
      size: '12.8 MB',
      date: new Date().toISOString().split('T')[0]
    });
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  const kanbanColumns: Array<{ status: TaskStatus; label: string; color: string }> = [
    { status: 'todo', label: 'To-Do', color: 'text-activia-muted' },
    { status: 'in_progress', label: 'In Progress', color: 'text-activia-blue' },
    { status: 'review', label: 'Under Review', color: 'text-activia-purple' },
    { status: 'done', label: 'Completed', color: 'text-activia-mint' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-activia-amber flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" />
            Competitive Journey & Team Hub
          </span>
          <h2 className="text-2xl font-bold font-display text-white mt-0.5">
            Competition Management Centre
          </h2>
          <p className="text-xs text-activia-muted mt-1">
            Supervise team rosters, track 12-stage milestone progress, and collaborate on task Kanban boards.
          </p>
        </div>

        {/* Join team code pill */}
        <form onSubmit={handleJoinByCode} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Enter Team Invite Code..."
            value={inviteCodeInput}
            onChange={e => setInviteCodeInput(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-activia-surface border border-activia-border text-xs text-white placeholder:text-activia-muted focus:outline-none focus:border-activia-blue uppercase font-mono"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-activia-blue hover:bg-activia-blue/90 text-white text-xs font-semibold shadow-lg transition-all"
          >
            Join Team
          </button>
        </form>
      </div>

      {joinError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
          {joinError}
        </div>
      )}
      {joinSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
          {joinSuccess}
        </div>
      )}

      {/* 1. 12-Stage Competition Milestones Timeline */}
      <div className="p-6 rounded-3xl bg-activia-surface border border-activia-border shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-activia-blue" />
              12-Stage Competition Milestone Tracker
            </h3>
            <p className="text-xs text-activia-muted mt-0.5">
              Active Milestone Progress for {selectedTeam?.name || 'AstroBots Alpha'}: 65% Completed
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-activia-blue/20 text-activia-blue border border-activia-blue/30">
            Phase 6 / 12
          </span>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-2">
          {MILESTONES.map((m, idx) => (
            <div
              key={m.id}
              className={`p-3 rounded-xl border text-left transition-all ${
                m.completed
                  ? 'bg-activia-blue/10 border-activia-blue/30 text-white'
                  : idx === 6
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                  : 'bg-white/[0.02] border-white/5 text-activia-muted'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold">Step {m.id}</span>
                {m.completed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-activia-mint" />
                ) : idx === 6 ? (
                  <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-white/20" />
                )}
              </div>
              <p className="text-[11px] font-semibold leading-tight">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Team Overview & Roster Bar */}
      {selectedTeam && (
        <div className="p-6 rounded-3xl bg-activia-surface border border-activia-border shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-activia-blue/20 text-activia-blue">
                  {selectedTeam.activityTitle}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-activia-mint/20 text-activia-mint">
                  {selectedTeam.status.replace(/_/g, ' ')}
                </span>
              </div>
              <h3 className="text-xl font-bold font-display text-white">{selectedTeam.name}</h3>
              <p className="text-xs text-activia-muted mt-1 max-w-2xl">
                Project: <strong className="text-white">{selectedTeam.projectTitle}</strong>
              </p>
            </div>

            {/* Invite Code & Mentor Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="p-2.5 px-3.5 rounded-xl bg-activia-elevated border border-white/10 flex items-center gap-2 text-xs">
                <span className="text-activia-muted">Team Invite Code:</span>
                <span className="font-mono font-bold text-activia-cyan">{selectedTeam.inviteCode}</span>
                <button
                  onClick={handleCopyCode}
                  className="p-1 rounded hover:bg-white/10 text-activia-muted hover:text-white transition-colors"
                  title="Copy code"
                >
                  {codeCopied ? <Check className="w-3.5 h-3.5 text-activia-mint" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-2.5 px-3.5 rounded-xl bg-activia-elevated border border-white/10 text-xs text-activia-muted flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-activia-purple" />
                <span>Mentor: <strong className="text-white">{selectedTeam.mentorName}</strong></span>
              </div>
            </div>
          </div>

          {/* Member Roster Chips */}
          <div className="pt-4">
            <h4 className="text-xs font-bold text-white mb-3">Team Squad Roster ({selectedTeam.members.length} members)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {selectedTeam.members.map(member => (
                <div key={member.id} className="p-3 rounded-2xl bg-activia-elevated/80 border border-white/5 flex items-center gap-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/10"
                  />
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">{member.name}</p>
                    <p className="text-[10px] text-activia-cyan font-semibold">{member.role} • {member.grade}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Project Kanban Task Board */}
      <div className="p-6 rounded-3xl bg-activia-surface border border-activia-border shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white font-display">Sprint Task Kanban Board</h3>
            <p className="text-xs text-activia-muted mt-0.5">
              Drag, assign, and advance tasks across sprint states.
            </p>
          </div>
          <button
            onClick={() => setNewTaskOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-activia-blue hover:bg-activia-blue/90 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Task
          </button>
        </div>

        {/* 4 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map(col => {
            const colTasks = teamTasks.filter(t => t.status === col.status);
            return (
              <div
                key={col.status}
                className="p-4 rounded-2xl bg-activia-elevated/60 border border-white/5 flex flex-col min-h-[300px]"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
                  <span className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
                    {col.label}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <p className="text-[11px] text-activia-muted/60 text-center py-8">No tasks</p>
                  ) : (
                    colTasks.map(task => (
                      <div
                        key={task.id}
                        className="p-3.5 rounded-xl bg-activia-surface border border-activia-border hover:border-activia-blue/40 transition-all shadow-sm space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              task.priority === 'urgent'
                                ? 'bg-rose-500/20 text-rose-400'
                                : task.priority === 'high'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span className="text-[10px] text-activia-muted">{task.dueDate}</span>
                        </div>

                        <h4 className="text-xs font-bold text-white group-hover:text-activia-blue transition-colors">
                          {task.title}
                        </h4>
                        <p className="text-[11px] text-activia-muted line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                          <span className="text-white font-medium">{task.assigneeName}</span>

                          {/* Quick advance button */}
                          <div className="flex items-center gap-1">
                            {col.status !== 'done' && (
                              <button
                                onClick={() => {
                                  const nextStatus: Record<TaskStatus, TaskStatus> = {
                                    todo: 'in_progress',
                                    in_progress: 'review',
                                    review: 'done',
                                    done: 'done',
                                  };
                                  onUpdateTaskStatus(task.id, nextStatus[col.status]);
                                }}
                                className="px-2 py-0.5 rounded bg-white/5 hover:bg-activia-blue hover:text-white text-activia-cyan font-medium transition-colors"
                              >
                                Advance →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Project Artifact Submissions & Mentor Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Artifact Submissions */}
        <div className="p-6 rounded-3xl bg-activia-surface border border-activia-border shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <FileText className="w-4 h-4 text-activia-cyan" />
              Project Deliverables & Logbook
            </h3>
            <button
              onClick={handleSimulateUpload}
              className="px-3 py-1.5 rounded-xl bg-activia-elevated hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-activia-cyan" />
              Upload Revision
            </button>
          </div>

          {uploadSuccess && (
            <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
              New project file revision successfully uploaded to school storage vault.
            </div>
          )}

          {submittedFile && (
            <div className="p-4 rounded-2xl bg-activia-elevated border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-activia-blue flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{submittedFile.name}</p>
                  <p className="text-[10px] text-activia-muted mt-0.5">
                    {submittedFile.size} • Uploaded {submittedFile.date} • Verified SHA-256
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-activia-mint/20 text-activia-mint">
                Approved Draft
              </span>
            </div>
          )}
        </div>

        {/* Mentor Feedback Thread */}
        <div className="p-6 rounded-3xl bg-activia-surface border border-activia-border shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-activia-purple" />
              Faculty Mentor Directives
            </h3>
            <span className="text-xs text-activia-muted">Dr. Robert Vance</span>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-activia-elevated/70 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-activia-purple">Milestone 2 Feedback</span>
                <span className="text-[10px] text-activia-muted">Oct 26, 2026</span>
              </div>
              <p className="text-xs text-activia-text leading-relaxed">
                &ldquo;Chassis structural rigidity looks solid. Please ensure your ultrasonic filter loops have noise-suppression dampening before our Thursday mock obstacle runs.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* New Task Modal */}
      {newTaskOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-activia-surface border border-activia-border rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white mb-4">Create Project Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-xs text-activia-muted block mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solder Motor Driver Shield"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-activia-elevated border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue"
                />
              </div>
              <div>
                <label className="text-xs text-activia-muted block mb-1">Instructions / Context</label>
                <textarea
                  rows={2}
                  placeholder="Notes on parameters or components..."
                  value={taskDesc}
                  onChange={e => setTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-activia-elevated border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-activia-muted block mb-1">Assignee</label>
                  <select
                    value={taskAssignee}
                    onChange={e => setTaskAssignee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-activia-elevated border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue"
                  >
                    {selectedTeam?.members.map(m => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-activia-muted block mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={e => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 rounded-xl bg-activia-elevated border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-activia-muted block mb-1">Target Due Date</label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={e => setTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-activia-elevated border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewTaskOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-activia-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-activia-blue hover:bg-activia-blue/90 text-white text-xs font-semibold"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

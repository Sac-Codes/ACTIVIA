import React, { useState } from 'react';
import {
  Trophy,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  FileText,
  Upload,
  Calendar,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  ChevronRight,
  Filter,
  User,
  ShieldCheck
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
    name: 'AstroBots_Rover_Autonomous_Design_v2.pdf',
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

    const res = onJoinTeamByCode(inviteCodeInput.trim());
    if (res.success) {
      setJoinSuccess(`Successfully joined team squad!`);
      setInviteCodeInput('');
      setTimeout(() => setJoinSuccess(null), 3500);
    } else {
      setJoinError(res.error || 'Failed to join team. Please verify the 6-character code.');
    }
  };

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
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

  const kanbanColumns: Array<{ status: TaskStatus; label: string; bg: string }> = [
    { status: 'todo', label: 'To-Do', bg: 'bg-app-secondary' },
    { status: 'in_progress', label: 'In Progress', bg: 'bg-indigo-50/50' },
    { status: 'review', label: 'Under Review', bg: 'bg-amber-50/50' },
    { status: 'done', label: 'Completed', bg: 'bg-emerald-50/50' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl border border-app-border p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-app-text">
            Competitions & Team Workspace
          </h2>
          <p className="text-xs sm:text-sm text-app-muted mt-1">
            Collaborate on inter-school competitions, track 12-stage milestone roadmaps, and manage task assignments.
          </p>
        </div>

        {/* Join team by code */}
        <form onSubmit={handleJoinByCode} className="flex items-center gap-2 self-start md:self-auto">
          <input
            type="text"
            placeholder="Team Invite Code..."
            value={inviteCodeInput}
            onChange={e => setInviteCodeInput(e.target.value)}
            className="w-40 sm:w-48 px-3 py-2 rounded-lg bg-app-secondary border border-app-border text-xs text-app-text uppercase font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors whitespace-nowrap"
          >
            Join Team
          </button>
        </form>
      </div>

      {joinError && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{joinError}</span>
        </div>
      )}
      {joinSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{joinSuccess}</span>
        </div>
      )}

      {/* 1. 12-Stage Competition Milestones Roadmap */}
      <div className="bg-white rounded-xl border border-app-border p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-app-text flex items-center gap-2">
              <Trophy className="w-4 h-4 text-indigo-600" />
              12-Stage Competition Milestone Roadmap
            </h3>
            <p className="text-xs text-app-muted mt-0.5">
              Active Milestone Progress for {selectedTeam?.name || 'AstroBots Alpha'}: 50% Completed
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            Phase 6 / 12
          </span>
        </div>

        {/* Milestone Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 pt-1">
          {MILESTONES.map((m, idx) => (
            <div
              key={m.id}
              className={`p-3 rounded-lg border text-left text-xs transition-colors ${
                m.completed
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900 font-medium'
                  : idx === 6
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold'
                  : 'bg-app-secondary/40 border-app-border text-app-muted'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold">Stage {m.id}</span>
                {m.completed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-app-subtle" />
                )}
              </div>
              <p className="line-clamp-2 leading-tight">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Team Roster & Invite Code Banner */}
      {selectedTeam && (
        <div className="bg-white rounded-xl border border-app-border p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Active Squad
            </span>
            <h3 className="text-lg font-bold text-app-text">{selectedTeam.name}</h3>
            <p className="text-xs text-app-muted">
              Competition: <strong>{selectedTeam.activityTitle}</strong> • Faculty Mentor: <strong>{selectedTeam.mentorName}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-app-secondary border border-app-border flex items-center gap-3">
              <span className="text-xs text-app-muted">Invite Code:</span>
              <span className="font-mono font-bold text-sm text-indigo-700 tracking-wider">
                {selectedTeam.inviteCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-1 rounded text-app-muted hover:text-indigo-600"
                title="Copy invite code"
              >
                {codeCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <button
              onClick={() => setNewTaskOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Team Kanban Board */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-app-text">Team Kanban Board</h3>
          <span className="text-xs text-app-muted">{teamTasks.length} active tasks</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map(col => {
            const colTasks = teamTasks.filter(t => t.status === col.status);
            return (
              <div
                key={col.status}
                className="bg-white rounded-xl border border-app-border p-4 shadow-xs flex flex-col justify-between min-h-[280px]"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-app-border mb-3">
                    <span className="text-xs font-bold text-app-text">{col.label}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-app-secondary text-app-muted">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {colTasks.length === 0 ? (
                      <p className="text-xs text-app-subtle text-center py-8 italic">No tasks</p>
                    ) : (
                      colTasks.map(task => (
                        <div
                          key={task.id}
                          className="p-3 rounded-lg bg-app-secondary/60 border border-app-border space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-app-text truncate">{task.title}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase ${
                              task.priority === 'urgent' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {task.priority}
                            </span>
                          </div>

                          {task.description && (
                            <p className="text-app-muted leading-relaxed line-clamp-2">{task.description}</p>
                          )}

                          <div className="pt-2 border-t border-app-border-subtle flex items-center justify-between text-[11px] text-app-subtle">
                            <span>{task.assigneeName}</span>
                            <span>Due: {task.dueDate}</span>
                          </div>

                          {/* Quick status transition dropdown */}
                          <div className="pt-1 flex items-center justify-end gap-1">
                            {col.status !== 'todo' && (
                              <button
                                onClick={() => onUpdateTaskStatus(task.id, 'todo')}
                                className="px-1.5 py-0.5 rounded text-[10px] text-app-muted hover:bg-white"
                              >
                                ← To-Do
                              </button>
                            )}
                            {col.status !== 'in_progress' && (
                              <button
                                onClick={() => onUpdateTaskStatus(task.id, 'in_progress')}
                                className="px-1.5 py-0.5 rounded text-[10px] text-indigo-600 hover:bg-white font-medium"
                              >
                                Progress
                              </button>
                            )}
                            {col.status !== 'done' && (
                              <button
                                onClick={() => onUpdateTaskStatus(task.id, 'done')}
                                className="px-1.5 py-0.5 rounded text-[10px] text-emerald-700 hover:bg-white font-medium"
                              >
                                Done →
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Project Deliverable Submission Card */}
      <div className="bg-white rounded-xl border border-app-border p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-app-text flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            Competition Deliverable Submission
          </h3>
          <p className="text-xs text-app-muted">
            Uploaded file: <strong className="text-app-text">{submittedFile?.name}</strong> ({submittedFile?.size}) • Submitter: <strong>{studentName}</strong>
          </p>
        </div>

        <button
          onClick={handleSimulateUpload}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 self-start md:self-auto"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{uploadSuccess ? 'Document Uploaded!' : 'Upload New Revision'}</span>
        </button>
      </div>

      {/* New Task Modal */}
      {newTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-app-border shadow-dropdown max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-app-text">Create Team Task</h3>
            <form onSubmit={handleCreateTaskSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-app-muted block mb-1 font-medium">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Calibrate LIDAR sensor on rover frame"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-app-border bg-white text-app-text focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-app-muted block mb-1 font-medium">Description</label>
                <textarea
                  placeholder="Specific requirements or checklists..."
                  value={taskDesc}
                  onChange={e => setTaskDesc(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-lg border border-app-border bg-white text-app-text focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-app-muted block mb-1 font-medium">Assignee</label>
                  <input
                    type="text"
                    value={taskAssignee}
                    onChange={e => setTaskAssignee(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-app-border bg-white text-app-text"
                  />
                </div>
                <div>
                  <label className="text-app-muted block mb-1 font-medium">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={e => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 rounded-lg border border-app-border bg-white text-app-text"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-app-border">
                <button
                  type="button"
                  onClick={() => setNewTaskOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-app-border text-app-text font-medium hover:bg-app-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

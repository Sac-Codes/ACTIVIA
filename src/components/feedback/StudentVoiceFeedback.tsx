import React, { useState } from 'react';
import {
  MessageSquarePlus,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Shield,
  EyeOff,
  Filter
} from 'lucide-react';
import { FeedbackTicket, FeedbackType, UserPersona } from '../../types';

interface StudentVoiceFeedbackProps {
  tickets: FeedbackTicket[];
  persona: UserPersona;
  onSubmitTicket: (ticket: Omit<FeedbackTicket, 'id' | 'status' | 'submittedAt'>) => void;
}

export const StudentVoiceFeedback: React.FC<StudentVoiceFeedbackProps> = ({
  tickets,
  persona,
  onSubmitTicket,
}) => {
  const [ticketType, setTicketType] = useState<FeedbackType>('event_suggestion');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('STEM & Robotics');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onSubmitTicket({
      type: ticketType,
      title: title.trim(),
      description: description.trim(),
      category,
      submittedBy: isAnonymous ? 'Anonymous Student' : persona.name,
      submittedByRole: persona.role,
      studentGrade: isAnonymous ? undefined : persona.grade,
      isAnonymous,
    });

    setTitle('');
    setDescription('');
    setSubmittedSuccess(true);
    setTimeout(() => setSubmittedSuccess(false), 4000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">Received</span>;
      case 'under_review':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">Under Review</span>;
      case 'in_progress':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">In Progress</span>;
      case 'resolved':
      case 'closed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Resolved</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-activia-cyan flex items-center gap-1.5">
          <MessageSquarePlus className="w-3.5 h-3.5" />
          Student Senate & Voice Channel
        </span>
        <h2 className="text-2xl font-bold font-display text-white mt-0.5">
          Student Voice & Extracurricular Feedback
        </h2>
        <p className="text-xs text-activia-muted mt-1 max-w-2xl">
          Propose new school competitions, request specialized workshops, suggest new student-led clubs, or report registration difficulties.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Submit New Voice Ticket */}
        <div className="lg:col-span-1 p-6 rounded-3xl bg-activia-surface border border-activia-border shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-activia-blue" />
            Submit Proposal or Feedback
          </h3>

          {submittedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              Ticket registered! You can track resolution below.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs text-activia-muted block mb-1">Feedback Nature *</label>
              <select
                value={ticketType}
                onChange={e => setTicketType(e.target.value as FeedbackType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-activia-elevated border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue"
              >
                <option value="event_suggestion">Suggest a New Competition or Event</option>
                <option value="workshop_request">Request a Technical Workshop / Masterclass</option>
                <option value="club_proposal">Propose a New Student Club / Guild</option>
                <option value="question">Activity Coordination Query</option>
                <option value="system_issue">Report Registration / Platform Problem</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-activia-muted block mb-1">Target Sector</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-activia-elevated border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue"
              >
                <option value="STEM & Robotics">STEM & Robotics</option>
                <option value="Science & Mathematics">Science & Mathematics</option>
                <option value="Sports & Athletics">Sports & Athletics</option>
                <option value="Arts & Culture">Arts & Culture</option>
                <option value="Literature & Debate">Literature & Debate</option>
                <option value="Student Activities">General Student Activities</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-activia-muted block mb-1">Subject / Proposal Headline *</label>
              <input
                type="text"
                required
                placeholder="e.g. Host a National AI Hackathon in Spring"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-activia-elevated border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue"
              />
            </div>

            <div>
              <label className="text-xs text-activia-muted block mb-1">Description & Expected Outcomes *</label>
              <textarea
                required
                rows={4}
                placeholder="Detail what students will learn, potential teachers who could mentor, or specifics of your question..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-activia-elevated border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue resize-none"
              />
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-activia-muted">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                  className="rounded border-activia-border bg-activia-elevated text-activia-blue focus:ring-0"
                />
                <span className="flex items-center gap-1.5">
                  <EyeOff className="w-3.5 h-3.5 text-activia-muted" />
                  Submit anonymously (protect student identity)
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-activia-blue hover:bg-activia-blue/90 text-white text-xs font-bold shadow-lg shadow-activia-blue/30 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              Dispatch to Student Affairs Desk
            </button>
          </form>
        </div>

        {/* Right 2 Cols: Live Feedback Tracker */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-activia-surface border border-activia-border shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <h3 className="text-base font-bold text-white font-display">Active Proposals & Issue Tracker</h3>
              <p className="text-xs text-activia-muted mt-0.5">
                Tracking {tickets.length} student submissions through official administrative review.
              </p>
            </div>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {tickets.map(ticket => (
              <div
                key={ticket.id}
                className="p-5 rounded-2xl bg-activia-elevated/70 border border-white/5 space-y-3 hover:border-activia-blue/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(ticket.status)}
                    <span className="text-[11px] text-activia-cyan font-semibold">
                      {ticket.category}
                    </span>
                  </div>
                  <span className="text-[10px] text-activia-muted">
                    Submitted: {new Date(ticket.submittedAt).toLocaleDateString()} by {ticket.submittedBy}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white font-display">{ticket.title}</h4>
                  <p className="text-xs text-activia-text mt-1 leading-relaxed">
                    {ticket.description}
                  </p>
                </div>

                {/* Faculty Response if Present */}
                {ticket.response && (
                  <div className="p-3.5 rounded-xl bg-activia-surface border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-activia-mint flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Official Resolution from {ticket.respondedBy || 'Activity Coordinator'}
                      </span>
                      <span className="text-[10px] text-activia-muted">{ticket.respondedAt?.split('T')[0]}</span>
                    </div>
                    <p className="text-xs text-activia-muted leading-relaxed pt-1">
                      {ticket.response}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  HelpCircle,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Shield,
  Filter,
  MessageSquare,
  ChevronDown
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
  const [filterType, setFilterType] = useState('all');

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
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Received
          </span>
        );
      case 'under_review':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Under Review
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            In Progress
          </span>
        );
      case 'resolved':
      case 'closed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Resolved
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl border border-app-border p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-app-text">
            Help, Support & Student Voice
          </h2>
          <p className="text-xs sm:text-sm text-app-muted mt-1 max-w-2xl">
            Submit inquiries, request technical assistance, propose new school competitions, or suggest campus club initiatives directly to faculty coordinators.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Submit New Voice Ticket */}
        <div className="lg:col-span-1 p-6 rounded-xl bg-white border border-app-border shadow-xs space-y-4">
          <h3 className="text-base font-bold text-app-text flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            Submit Inquiry or Proposal
          </h3>

          {submittedSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              Ticket submitted successfully! Faculty will review it shortly.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-medium text-app-muted block mb-1">
                Inquiry Type
              </label>
              <select
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value as FeedbackType)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-app-border bg-white text-app-text focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="event_suggestion">Competition / Event Proposal</option>
                <option value="club_proposal">New Club Charter Idea</option>
                <option value="workshop_request">Workshop or Skills Request</option>
                <option value="question">General Extracurricular Question</option>
                <option value="system_issue">Registration Difficulty or Support</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-app-muted block mb-1">
                Relevant Domain / Area
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-app-border bg-white text-app-text focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="STEM & Robotics">STEM & Robotics</option>
                <option value="Athletics & Sports">Athletics & Sports</option>
                <option value="Performing Arts">Performing Arts & Music</option>
                <option value="Debate & Model UN">Debate & Public Speaking</option>
                <option value="Community Service">Community Service & Green Initiatives</option>
                <option value="General Campus Life">General Campus Life</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-app-muted block mb-1">
                Subject Title
              </label>
              <input
                type="text"
                placeholder="e.g. Request for weekend Autonomous Rover workshop"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-app-border bg-white text-app-text focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-app-muted block mb-1">
                Detailed Explanation
              </label>
              <textarea
                placeholder="Provide specific details, expected student interest, suggested venues, or assistance needed..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="w-full p-3 text-xs rounded-lg border border-app-border bg-white text-app-text focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="anon"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-app-border text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="anon" className="text-xs text-app-muted cursor-pointer">
                Submit anonymously (hide your name from peers)
              </label>
            </div>

            <button
              type="submit"
              disabled={!title.trim() || !description.trim()}
              className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Ticket
            </button>
          </form>
        </div>

        {/* Right List: Open Support Tickets & Tracked Responses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-xl bg-white border border-app-border shadow-xs flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-app-text">
              Active Community Tickets ({filteredTickets.length})
            </span>
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-app-muted" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-md border border-app-border bg-white text-app-text"
              >
                <option value="all">All Categories</option>
                <option value="event_suggestion">Event Proposals</option>
                <option value="club_proposal">Club Proposals</option>
                <option value="workshop_request">Workshop Requests</option>
                <option value="system_issue">Support Inquiries</option>
              </select>
            </div>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-white border border-app-border">
              <HelpCircle className="w-8 h-8 text-app-muted mx-auto mb-2" />
              <p className="text-sm font-semibold text-app-text">No tickets found</p>
              <p className="text-xs text-app-muted mt-1">
                Have an idea for a school competition or need assistance? Use the form on the left to submit a ticket.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map(ticket => (
                <div
                  key={ticket.id}
                  className="p-5 rounded-xl bg-white border border-app-border shadow-xs space-y-3 hover:border-indigo-200 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                        {ticket.category}
                      </span>
                      <span className="text-xs text-app-subtle">
                        {new Date(ticket.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {getStatusBadge(ticket.status)}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-app-text">{ticket.title}</h4>
                    <p className="text-xs text-app-muted leading-relaxed mt-1">
                      {ticket.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-app-border-subtle flex items-center justify-between text-[11px] text-app-subtle">
                    <span>Submitted by {ticket.isAnonymous ? 'Anonymous Student' : ticket.submittedBy}</span>
                    {ticket.studentGrade && <span>{ticket.studentGrade}</span>}
                  </div>

                  {ticket.response && (
                    <div className="p-3.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Faculty Response:</span>
                      </div>
                      <p className="text-indigo-800 leading-relaxed">{ticket.response}</p>
                      {ticket.respondedBy && (
                        <p className="text-[10px] text-indigo-600/80 mt-1">
                          Reviewed by {ticket.respondedBy}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

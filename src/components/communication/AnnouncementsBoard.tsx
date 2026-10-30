import React, { useState } from 'react';
import {
  Bell,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  Send,
  User,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { Announcement, ActivityQuestion } from '../../types';

interface AnnouncementsBoardProps {
  announcements: Announcement[];
  onMarkAsRead: (id: string) => void;
  studentName: string;
}

export const AnnouncementsBoard: React.FC<AnnouncementsBoardProps> = ({
  announcements,
  onMarkAsRead,
  studentName,
}) => {
  const [activeTab, setActiveTab] = useState<'notices' | 'qa'>('notices');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Sample Q&A items
  const [questions, setQuestions] = useState<ActivityQuestion[]>([
    {
      id: 'q-01',
      activityId: 'act-001',
      question: 'Will there be testing time slots allocated before the official Autonomous Rover trials?',
      studentName: 'Alex Rivera',
      askedAt: '2026-10-25',
      answer: 'Yes! The arena will be open for dry obstacle runs on Wednesday Nov 12 between 14:00 and 17:30.',
      answeredBy: 'Dr. Robert Vance (Head of STEM)',
      answeredAt: '2026-10-26'
    },
    {
      id: 'q-02',
      activityId: 'act-003',
      question: 'Are digital tablets permitted during formal UN debate caucus sessions?',
      studentName: 'Maya Chen',
      askedAt: '2026-10-24',
      answer: 'Tablets and laptops are allowed during unmoderated caucus for drafting working papers, but must not be used during formal podium speeches.',
      answeredBy: 'Ms. Clara Oswald (Debate Union)',
      answeredAt: '2026-10-25'
    }
  ]);

  const [newQuestion, setNewQuestion] = useState('');
  const [questionSubmitted, setQuestionSubmitted] = useState(false);

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setQuestions(prev => [
      {
        id: `q-${Date.now()}`,
        activityId: 'act-general',
        question: newQuestion.trim(),
        studentName,
        askedAt: new Date().toISOString().split('T')[0],
      },
      ...prev
    ]);

    setNewQuestion('');
    setQuestionSubmitted(true);
    setTimeout(() => setQuestionSubmitted(false), 3000);
  };

  const filteredAnnouncements = announcements.filter(a =>
    priorityFilter === 'all' ? true : a.priority === priorityFilter
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-activia-rose flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5" />
            Official Communications Centre
          </span>
          <h2 className="text-2xl font-bold font-display text-white mt-0.5">
            Announcements & Activity Q&A
          </h2>
          <p className="text-xs text-activia-muted mt-1">
            Authoritative faculty circulars, schedule adjustments, and moderated activity questions.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-activia-surface border border-activia-border self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('notices')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'notices' ? 'bg-activia-blue text-white shadow' : 'text-activia-muted hover:text-white'
            }`}
          >
            Notices ({announcements.length})
          </button>
          <button
            onClick={() => setActiveTab('qa')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'qa' ? 'bg-activia-blue text-white shadow' : 'text-activia-muted hover:text-white'
            }`}
          >
            Activity Q&A ({questions.length})
          </button>
        </div>
      </div>

      {/* NOTICES TAB */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-activia-muted">Filter by Priority:</span>
            {['all', 'urgent', 'high', 'normal'].map(p => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-all ${
                  priorityFilter === p
                    ? 'bg-activia-elevated text-white border border-activia-blue'
                    : 'bg-activia-surface text-activia-muted hover:text-white border border-transparent'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredAnnouncements.map(ann => (
              <div
                key={ann.id}
                className="p-6 rounded-3xl bg-activia-surface border border-activia-border shadow-xl space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <img
                      src={ann.publisherAvatar}
                      alt={ann.publisher}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-white/10"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{ann.publisher}</h4>
                      <p className="text-[10px] text-activia-muted">
                        {ann.publisherRole} • {new Date(ann.publishedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ann.priority === 'urgent'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : ann.priority === 'high'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {ann.priority} Priority
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 text-activia-muted">
                      Audience: {ann.targetAudience}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold font-display text-white">{ann.title}</h3>
                  <p className="text-xs text-activia-text mt-2 leading-relaxed whitespace-pre-line">
                    {ann.body}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-activia-muted">
                  <span>Acknowledged by {ann.readByCount} students</span>
                  {!ann.isRead ? (
                    <button
                      onClick={() => onMarkAsRead(ann.id)}
                      className="px-3 py-1.5 rounded-xl bg-activia-blue/20 hover:bg-activia-blue/30 text-activia-blue border border-activia-blue/40 font-semibold transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark Acknowledged
                    </button>
                  ) : (
                    <span className="text-activia-mint flex items-center gap-1 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Acknowledged
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTIVITY Q&A TAB */}
      {activeTab === 'qa' && (
        <div className="space-y-6">
          {/* Ask question box */}
          <div className="p-6 rounded-3xl bg-activia-surface border border-activia-border shadow-xl">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-activia-cyan" />
              Ask Coordinating Faculty a Question
            </h3>
            <p className="text-xs text-activia-muted mb-4">
              Questions are answered by activity coordinators and published for all eligible participants to prevent repetitive queries.
            </p>

            {questionSubmitted && (
              <div className="mb-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                Your question has been dispatched to faculty mentors. You will be notified once answered.
              </div>
            )}

            <form onSubmit={handleAskQuestion} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask about venue access, equipment rules, kit allocation, team changes..."
                value={newQuestion}
                onChange={e => setNewQuestion(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-activia-elevated border border-activia-border text-xs text-white placeholder:text-activia-muted focus:outline-none focus:border-activia-blue"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-activia-blue hover:bg-activia-blue/90 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Post Question
              </button>
            </form>
          </div>

          {/* Q&A Thread List */}
          <div className="space-y-4">
            {questions.map(q => (
              <div key={q.id} className="p-6 rounded-3xl bg-activia-surface border border-activia-border shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-activia-blue" />
                    {q.studentName} asked:
                  </span>
                  <span className="text-[10px] text-activia-muted">{q.askedAt}</span>
                </div>

                <p className="text-xs text-white font-medium pl-5 border-l-2 border-activia-blue">
                  &ldquo;{q.question}&rdquo;
                </p>

                {q.answer ? (
                  <div className="mt-3 p-4 rounded-2xl bg-activia-elevated/80 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-activia-cyan font-bold">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-activia-mint" />
                        {q.answeredBy}
                      </span>
                      <span className="text-activia-muted">{q.answeredAt}</span>
                    </div>
                    <p className="text-xs text-activia-text leading-relaxed pt-1">
                      {q.answer}
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-amber-400 italic pl-5">
                    Under review by coordinating teacher...
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

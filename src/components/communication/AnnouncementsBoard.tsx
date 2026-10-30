import React, { useState } from 'react';
import {
  Bell,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Filter,
  Send,
  User,
  ShieldCheck,
  Check
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

  const [questions, setQuestions] = useState<ActivityQuestion[]>([
    {
      id: 'q-01',
      activityId: 'act-001',
      question: 'Will testing time slots be allocated before the official Autonomous Rover trials?',
      studentName: 'Alex Rivera',
      askedAt: '2026-10-25',
      answer: 'Yes! The arena will be open for dry obstacle runs on Wednesday between 14:00 and 17:30.',
      answeredBy: 'Dr. Robert Vance (Head of STEM)',
      answeredAt: '2026-10-26'
    },
    {
      id: 'q-02',
      activityId: 'act-003',
      question: 'Are digital tablets permitted during formal Model UN debate caucus sessions?',
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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl border border-app-border p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-app-text">
            School Announcements & Q&A
          </h2>
          <p className="text-xs sm:text-sm text-app-muted mt-1">
            Official circulars from campus administration, faculty mentors, and moderated activity discussions.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-app-secondary border border-app-border self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('notices')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'notices'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-app-muted hover:text-app-text'
            }`}
          >
            Official Circulars ({announcements.length})
          </button>
          <button
            onClick={() => setActiveTab('qa')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'qa'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-app-muted hover:text-app-text'
            }`}
          >
            Activity Q&A ({questions.length})
          </button>
        </div>
      </div>

      {/* NOTICES TAB */}
      {activeTab === 'notices' && (
        <div className="space-y-5">
          {/* Priority Filter Bar */}
          <div className="bg-white rounded-xl border border-app-border p-4 shadow-xs flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-app-muted">
              Displaying {filteredAnnouncements.length} school announcements
            </span>
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-app-muted" />
              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-app-border bg-white text-app-text"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent Circulars</option>
                <option value="normal">Standard Notices</option>
              </select>
            </div>
          </div>

          {filteredAnnouncements.length === 0 ? (
            <div className="p-16 text-center rounded-xl bg-white border border-app-border shadow-xs">
              <Bell className="w-10 h-10 text-app-muted mx-auto mb-3" />
              <h3 className="text-base font-semibold text-app-text">No announcements posted</h3>
              <p className="text-xs text-app-muted mt-1">There are no active notices matching your filter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAnnouncements.map(notice => (
                <div
                  key={notice.id}
                  className={`bg-white rounded-xl border p-6 shadow-xs space-y-3 transition-all ${
                    notice.priority === 'urgent'
                      ? 'border-red-200 bg-red-50/20'
                      : 'border-app-border'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {notice.priority === 'urgent' ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
                          Urgent Announcement
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          General Circular
                        </span>
                      )}
                      <span className="text-xs text-app-subtle">
                        Audience: {notice.targetAudience || 'All School'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-app-subtle">
                        {notice.publishedAt ? new Date(notice.publishedAt).toLocaleDateString() : 'Recent'}
                      </span>
                      {notice.isRead ? (
                        <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Read
                        </span>
                      ) : (
                        <button
                          onClick={() => onMarkAsRead(notice.id)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-app-text">{notice.title}</h3>
                    <p className="text-xs sm:text-sm text-app-muted leading-relaxed mt-2 whitespace-pre-line">
                      {notice.body}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-app-border flex items-center justify-between text-xs text-app-subtle">
                    <span>Authorized by: <strong className="text-app-text">{notice.publisher}</strong> ({notice.publisherRole})</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Q&A TAB */}
      {activeTab === 'qa' && (
        <div className="space-y-6">
          {/* Ask Form */}
          <div className="bg-white rounded-xl border border-app-border p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-app-text flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              Ask a Question About an Activity
            </h3>

            {questionSubmitted && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                Your question has been submitted for faculty review.
              </div>
            )}

            <form onSubmit={handleAskQuestion} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask about rules, rehearsal venues, equipment, or timelines..."
                value={newQuestion}
                onChange={e => setNewQuestion(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-app-border bg-app-secondary focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              <button
                type="submit"
                disabled={!newQuestion.trim()}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Question</span>
              </button>
            </form>
          </div>

          {/* Q&A List */}
          <div className="space-y-4">
            {questions.map(q => (
              <div key={q.id} className="bg-white rounded-xl border border-app-border p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs text-app-subtle">
                  <span>Asked by <strong className="text-app-text">{q.studentName}</strong></span>
                  <span>{q.askedAt}</span>
                </div>
                <h4 className="text-sm font-bold text-app-text">{q.question}</h4>

                {q.answer ? (
                  <div className="p-3.5 rounded-lg bg-indigo-50/60 border border-indigo-100 space-y-1 text-xs">
                    <p className="font-semibold text-indigo-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      Answer from {q.answeredBy}:
                    </p>
                    <p className="text-indigo-900 leading-relaxed pl-5.5">{q.answer}</p>
                  </div>
                ) : (
                  <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                    Awaiting response from faculty coordinator...
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

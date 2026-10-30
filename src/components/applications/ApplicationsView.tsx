import React, { useState } from 'react';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Check,
  X,
  ChevronRight,
  Eye,
  User,
  Calendar,
  MapPin,
  Download
} from 'lucide-react';
import { Registration, RegistrationStatus, UserPersona, Activity } from '../../types';

interface ApplicationsViewProps {
  registrations: Registration[];
  persona: UserPersona;
  activities: Activity[];
  onUpdateStatus: (id: string, status: RegistrationStatus, notes?: string) => void;
  onSelectActivity?: (activity: Activity) => void;
  onNavigate: (tab: string) => void;
}

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  registrations,
  persona,
  activities,
  onUpdateStatus,
  onSelectActivity,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [reviewNoteInput, setReviewNoteInput] = useState('');

  const isStaff = persona.role === 'teacher' || persona.role === 'admin' || persona.role === 'coordinator';

  // Filter registrations
  const filtered = registrations.filter(r => {
    // Role filter
    if (!isStaff && r.studentId !== persona.id) {
      return false;
    }
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.activityTitle.toLowerCase().includes(q);
      const matchStudent = r.studentName.toLowerCase().includes(q);
      const matchTeam = r.teamName?.toLowerCase().includes(q);
      if (!matchTitle && !matchStudent && !matchTeam) return false;
    }
    // Status
    if (statusFilter !== 'all' && r.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status: RegistrationStatus) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Approved
          </span>
        );
      case 'pending_teacher_approval':
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Review
          </span>
        );
      case 'waitlisted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Waitlisted
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5 text-red-600" /> Rejected
          </span>
        );
      case 'cancelled':
      case 'withdrawn':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  const handleAction = (id: string, newStatus: RegistrationStatus) => {
    onUpdateStatus(id, newStatus, reviewNoteInput);
    setReviewNoteInput('');
    setSelectedReg(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-app-border p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-app-text">
            {isStaff ? 'Student Applications & Approvals' : 'My Applications'}
          </h2>
          <p className="text-xs sm:text-sm text-app-muted mt-1">
            {isStaff
              ? 'Review, approve, or waitlist submitted student registrations for co-curricular activities and competitions.'
              : 'Track the real-time status of your activity applications and co-curricular registrations.'}
          </p>
        </div>

        {!isStaff && (
          <button
            onClick={() => onNavigate('activities')}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors self-start md:self-center"
          >
            Apply for Activities
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-app-border p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-app-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isStaff ? "Search by student, activity, or team..." : "Search your applications..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-app-border bg-app-secondary focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-app-muted hidden sm:block" />
          <span className="text-xs text-app-muted hidden sm:inline">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs rounded-lg border border-app-border bg-white text-app-text focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          >
            <option value="all">All Statuses ({registrations.length})</option>
            <option value="pending">Pending Review</option>
            <option value="pending_teacher_approval">Awaiting Mentor</option>
            <option value="confirmed">Approved / Confirmed</option>
            <option value="waitlisted">Waitlisted</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Main Table / List */}
      <div className="bg-white rounded-xl border border-app-border shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FileCheck2 className="w-10 h-10 text-app-muted mx-auto mb-3" />
            <h3 className="text-base font-semibold text-app-text">No applications found</h3>
            <p className="text-xs text-app-muted mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search query or status filter.'
                : isStaff
                ? 'There are currently no student applications in the queue.'
                : 'You have not submitted any applications yet. Explore available activities to register.'}
            </p>
            {!isStaff && (
              <button
                onClick={() => onNavigate('activities')}
                className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors inline-block"
              >
                Browse Activities
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-app-text">
              <thead className="bg-app-secondary border-b border-app-border text-[11px] font-semibold text-app-muted uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Activity & Event</th>
                  {isStaff && <th className="px-5 py-3.5">Student Applicant</th>}
                  <th className="px-5 py-3.5">Date & Venue</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {filtered.map(reg => {
                  const matchingAct = activities.find(a => a.id === reg.activityId);
                  return (
                    <tr key={reg.id} className="hover:bg-app-secondary/50 transition-colors">
                      <td className="px-5 py-4 min-w-[200px]">
                        <p className="font-bold text-app-text">{reg.activityTitle}</p>
                        {reg.teamName && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                            Team: {reg.teamName}
                          </span>
                        )}
                        <p className="text-[11px] text-app-muted mt-0.5">
                          Applied: {new Date(reg.submittedAt).toLocaleDateString()}
                        </p>
                      </td>

                      {isStaff && (
                        <td className="px-5 py-4 min-w-[160px]">
                          <p className="font-semibold text-app-text">{reg.studentName}</p>
                          <p className="text-[11px] text-app-muted">{reg.studentGrade} • {reg.studentHouse} House</p>
                        </td>
                      )}

                      <td className="px-5 py-4 min-w-[150px] text-app-muted">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-app-subtle" />
                          <span>{reg.activityDate || matchingAct?.date || 'Scheduled'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-app-subtle" />
                          <span className="truncate">{reg.venue || matchingAct?.venue || 'Campus Venue'}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        {getStatusBadge(reg.status)}
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {isStaff ? (
                            <>
                              {(reg.status === 'pending_teacher_approval' || reg.status === 'submitted') && (
                                <>
                                  <button
                                    onClick={() => handleAction(reg.id, 'confirmed')}
                                    className="px-2.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1 transition-colors shadow-xs"
                                    title="Approve registration"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    onClick={() => handleAction(reg.id, 'rejected')}
                                    className="px-2.5 py-1.5 rounded-md bg-white hover:bg-red-50 text-red-600 border border-red-200 font-semibold flex items-center gap-1 transition-colors"
                                    title="Decline registration"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Decline</span>
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => setSelectedReg(reg)}
                                className="p-1.5 rounded-md text-app-muted hover:text-app-text hover:bg-app-secondary border border-app-border transition-colors"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              {reg.status !== 'cancelled' && (
                                <button
                                  onClick={() => handleAction(reg.id, 'cancelled')}
                                  className="px-2.5 py-1.5 rounded-md text-app-muted hover:text-red-600 hover:bg-red-50 border border-app-border font-medium transition-colors"
                                >
                                  Withdraw
                                </button>
                              )}
                              {matchingAct && onSelectActivity && (
                                <button
                                  onClick={() => onSelectActivity(matchingAct)}
                                  className="px-2.5 py-1.5 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold transition-colors"
                                >
                                  Event Details
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal for Staff */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-app-border shadow-dropdown max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-app-border">
              <h3 className="text-base font-bold text-app-text">Application Review</h3>
              <button
                onClick={() => setSelectedReg(null)}
                className="p-1 text-app-muted hover:text-app-text rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-app-muted font-medium">Activity:</span>
                <p className="font-bold text-sm text-app-text mt-0.5">{selectedReg.activityTitle}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-app-secondary border border-app-border">
                <div>
                  <span className="text-app-muted font-medium">Student:</span>
                  <p className="font-semibold text-app-text">{selectedReg.studentName}</p>
                  <p className="text-app-muted">{selectedReg.studentGrade}</p>
                </div>
                <div>
                  <span className="text-app-muted font-medium">House:</span>
                  <p className="font-semibold text-app-text">{selectedReg.studentHouse} House</p>
                  <p className="text-app-muted">Applied: {new Date(selectedReg.submittedAt).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedReg.motivation && (
                <div>
                  <span className="text-app-muted font-medium">Student Statement / Notes:</span>
                  <p className="p-3 rounded-lg bg-app-secondary border border-app-border text-app-text leading-relaxed mt-1">
                    "{selectedReg.motivation}"
                  </p>
                </div>
              )}

              <div>
                <label className="text-app-muted font-medium block mb-1">
                  Mentor / Coordinator Review Note (optional):
                </label>
                <textarea
                  value={reviewNoteInput}
                  onChange={(e) => setReviewNoteInput(e.target.value)}
                  placeholder="e.g. Parental consent verified. Eligible for participation."
                  className="w-full p-2.5 rounded-lg border border-app-border bg-white text-app-text text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-app-border">
              <button
                onClick={() => setSelectedReg(null)}
                className="px-3 py-2 rounded-lg border border-app-border text-app-text font-medium hover:bg-app-secondary text-xs"
              >
                Close
              </button>
              <button
                onClick={() => handleAction(selectedReg.id, 'waitlisted')}
                className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold text-xs"
              >
                Waitlist
              </button>
              <button
                onClick={() => handleAction(selectedReg.id, 'rejected')}
                className="px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-semibold text-xs"
              >
                Decline
              </button>
              <button
                onClick={() => handleAction(selectedReg.id, 'confirmed')}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
              >
                Approve Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

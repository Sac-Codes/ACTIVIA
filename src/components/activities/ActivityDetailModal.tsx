import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronRight,
  Send,
  User,
  Sparkles,
  Download
} from 'lucide-react';
import { Activity, Registration, UserPersona } from '../../types';

interface ActivityDetailModalProps {
  activity: Activity | null;
  persona: UserPersona;
  existingRegistration?: Registration;
  onClose: () => void;
  onSubmitRegistration: (data: {
    activityId: string;
    studentId: string;
    studentName: string;
    studentGrade: string;
    studentSection: string;
    studentHouse: string;
    format: 'individual' | 'team';
    teamName?: string;
    teamMembers?: string[];
    projectTitle?: string;
    motivation: string;
    parentConsentApproved: boolean;
  }) => { success: boolean; error?: string };
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  persona,
  existingRegistration,
  onClose,
  onSubmitRegistration,
}) => {
  if (!activity) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'register'>('overview');
  const [format, setFormat] = useState<'individual' | 'team'>(activity.participationFormat || 'individual');
  const [teamName, setTeamName] = useState('');
  const [teamMembersInput, setTeamMembersInput] = useState(`${persona.name} (Lead)`);
  const [projectTitle, setProjectTitle] = useState('');
  const [motivation, setMotivation] = useState('');
  const [parentConsent, setParentConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Eligibility check
  const isEligibleGrade = persona.grade && activity.eligibleGrades && activity.eligibleGrades.length > 0
    ? activity.eligibleGrades.includes(persona.grade)
    : true;
  const isFull = activity.totalSeats ? activity.seatsTaken >= activity.totalSeats : false;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isEligibleGrade) {
      setFormError(`Eligibility restriction: This activity is designated for ${activity.eligibleGrades.join(', ')}.`);
      return;
    }

    if (format === 'team' && !teamName.trim()) {
      setFormError('Please provide a team or squad name.');
      return;
    }

    if (!motivation.trim() || motivation.trim().length < 5) {
      setFormError('Please enter a brief statement of interest or motivation.');
      return;
    }

    if (!parentConsent) {
      setFormError('Parental or guardian acknowledgment is required for co-curricular participation.');
      return;
    }

    setSubmitting(true);
    const members = format === 'team'
      ? teamMembersInput.split(',').map(m => m.trim()).filter(Boolean)
      : [persona.name];

    const result = onSubmitRegistration({
      activityId: activity.id,
      studentId: persona.id,
      studentName: persona.name,
      studentGrade: persona.grade || 'Grade 10',
      studentSection: persona.section || 'A',
      studentHouse: persona.house || 'Phoenix',
      format,
      teamName: format === 'team' ? teamName.trim() : undefined,
      teamMembers: members,
      projectTitle: projectTitle.trim() || undefined,
      motivation: motivation.trim(),
      parentConsentApproved: parentConsent,
    });

    setSubmitting(false);

    if (!result.success) {
      setFormError(result.error || 'Failed to submit registration. Please try again.');
    } else {
      setFormSuccess('Registration successfully submitted! Your application has been logged in the school database.');
    }
  };

  const downloadIcs = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ACTIVIA//School Activity Universe//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${activity.title}`,
      `DESCRIPTION:${activity.description.replace(/\n/g, ' ')}`,
      `LOCATION:${activity.venue}`,
      `DTSTART:${activity.date.replace(/-/g, '')}T${(activity.startTime || '09:00').replace(':', '')}00`,
      `DTEND:${activity.date.replace(/-/g, '')}T${(activity.endTime || '10:00').replace(':', '')}00`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${activity.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-xl border border-app-border shadow-dropdown flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-app-border flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {activity.categoryName || 'Activity'}
              </span>
              <span className="text-xs text-app-subtle capitalize">
                {activity.participationFormat} Participation
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-display text-app-text">
              {activity.title}
            </h2>
            <p className="text-xs text-app-muted">
              Organized by {activity.organizer}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-app-muted hover:text-app-text hover:bg-app-secondary border border-transparent hover:border-app-border transition-colors flex-shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-2 border-b border-app-border bg-app-secondary/50">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'text-indigo-600 border-indigo-600 bg-white'
                : 'text-app-muted hover:text-app-text border-transparent'
            }`}
          >
            Overview & Schedule
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'rules'
                ? 'text-indigo-600 border-indigo-600 bg-white'
                : 'text-app-muted hover:text-app-text border-transparent'
            }`}
          >
            Rules & Eligibility
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`ml-auto px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            {existingRegistration ? 'Registration Status' : 'Register Now'}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs text-app-text">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Key Specs Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg bg-app-secondary border border-app-border">
                <div>
                  <span className="text-app-muted flex items-center gap-1 mb-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Event Date
                  </span>
                  <p className="font-semibold text-app-text">{activity.date}</p>
                </div>
                <div>
                  <span className="text-app-muted flex items-center gap-1 mb-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-teal-600" /> Time
                  </span>
                  <p className="font-semibold text-app-text">{activity.startTime || '09:00'} - {activity.endTime || '11:00'}</p>
                </div>
                <div>
                  <span className="text-app-muted flex items-center gap-1 mb-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" /> Venue
                  </span>
                  <p className="font-semibold text-app-text truncate">{activity.venue}</p>
                </div>
                <div>
                  <span className="text-app-muted flex items-center gap-1 mb-1 font-medium">
                    <Users className="w-3.5 h-3.5 text-emerald-600" /> Seats
                  </span>
                  <p className="font-semibold text-app-text">
                    {activity.totalSeats ? `${activity.seatsTaken} / ${activity.totalSeats}` : 'Open Admission'}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-app-text">Activity Overview</h4>
                <p className="text-app-muted leading-relaxed whitespace-pre-line">
                  {activity.description}
                </p>
              </div>

              {/* Participation Instructions */}
              {activity.participation_instructions && (
                <div className="p-4 rounded-lg bg-indigo-50/60 border border-indigo-100 text-indigo-900 space-y-1">
                  <h5 className="font-bold">Special Instructions for Participants:</h5>
                  <p className="text-indigo-800 leading-relaxed">{activity.participation_instructions}</p>
                </div>
              )}

              {/* Calendar Export */}
              <div className="pt-2 flex items-center justify-between border-t border-app-border">
                <span className="text-app-muted">Sync this activity to your personal calendar:</span>
                <button
                  onClick={downloadIcs}
                  className="px-3 py-1.5 rounded-lg border border-app-border hover:bg-app-secondary font-semibold text-app-text transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Download .ICS File</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-app-secondary border border-app-border space-y-2">
                <h4 className="text-sm font-bold text-app-text">Eligibility Requirements</h4>
                <div className="grid grid-cols-2 gap-3 text-app-muted">
                  <div>
                    <span className="block font-medium">Eligible Grades:</span>
                    <strong className="text-app-text">{activity.eligibleGrades?.join(', ') || 'All Grades'}</strong>
                  </div>
                  <div>
                    <span className="block font-medium">Format:</span>
                    <strong className="text-app-text capitalize">{activity.participationFormat || 'Individual'}</strong>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-app-text">Participation Code & Regulations</h4>
                <ul className="space-y-2 text-app-muted list-disc list-inside leading-relaxed">
                  <li>Punctual attendance at all scheduled briefing sessions and preliminary rounds is mandatory.</li>
                  <li>Students must wear official school uniform or designated athletic attire during competition hours.</li>
                  <li>Parent or guardian acknowledgment must be on file prior to the activity start date.</li>
                  <li>All laboratory, stage, and workshop safety guidelines must be strictly obeyed.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'register' && (
            <div className="space-y-4">
              {existingRegistration ? (
                <div className="p-6 rounded-lg bg-emerald-50/50 border border-emerald-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-app-text">Active Application on Record</h4>
                  <p className="text-app-muted max-w-sm mx-auto">
                    You submitted an application for this activity on {new Date(existingRegistration.submittedAt).toLocaleDateString()}.
                  </p>
                  <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 uppercase">
                    Status: {existingRegistration.status.replace(/_/g, ' ')}
                  </div>
                  {existingRegistration.teamName && (
                    <p className="text-app-muted font-medium">Registered Team: {existingRegistration.teamName}</p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Warnings */}
                  {!isEligibleGrade && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>Notice: This activity is intended for {activity.eligibleGrades.join(', ')}.</span>
                    </div>
                  )}

                  {isFull && (
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>Capacity reached ({activity.totalSeats} seats). Submitting will place you on the waitlist.</span>
                    </div>
                  )}

                  {formError && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {formSuccess && (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>{formSuccess}</span>
                    </div>
                  )}

                  {/* Student Pre-Filled Info */}
                  <div className="p-3.5 rounded-lg bg-app-secondary border border-app-border grid grid-cols-2 gap-2 text-app-muted">
                    <div>Student: <strong className="text-app-text">{persona.name}</strong></div>
                    <div>Grade: <strong className="text-app-text">{persona.grade}</strong></div>
                    <div>House: <strong className="text-app-text">{persona.house} House</strong></div>
                    <div>Email: <strong className="text-app-text">{persona.email}</strong></div>
                  </div>

                  {/* Team Inputs if Team Event */}
                  {activity.participationFormat === 'team' && (
                    <div className="space-y-3 p-3.5 rounded-lg bg-app-secondary border border-app-border">
                      <h5 className="font-bold text-app-text">Team Details</h5>
                      <div>
                        <label className="text-app-muted block mb-1 font-medium">Team or Squad Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. AstroBots Alpha"
                          value={teamName}
                          onChange={e => setTeamName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white border border-app-border text-xs text-app-text focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                        />
                      </div>
                      <div>
                        <label className="text-app-muted block mb-1 font-medium">Team Members (Comma separated)</label>
                        <input
                          type="text"
                          value={teamMembersInput}
                          onChange={e => setTeamMembersInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white border border-app-border text-xs text-app-text focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                        />
                      </div>
                    </div>
                  )}

                  {/* Motivation */}
                  <div>
                    <label className="text-app-muted block mb-1 font-medium">
                      Statement of Interest / Motivation *
                    </label>
                    <textarea
                      required
                      placeholder="Why do you want to participate in this activity? What do you hope to learn or contribute?"
                      value={motivation}
                      onChange={e => setMotivation(e.target.value)}
                      rows={3}
                      className="w-full p-3 rounded-lg bg-white border border-app-border text-xs text-app-text focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>

                  {/* Parent Consent */}
                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="parent_consent"
                      checked={parentConsent}
                      onChange={e => setParentConsent(e.target.checked)}
                      className="mt-0.5 rounded border-app-border text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="parent_consent" className="text-app-muted cursor-pointer leading-relaxed">
                      I confirm that my parent or legal guardian has reviewed the schedule, venue, and safety terms of this activity and consents to my participation.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || formSuccess !== null}
                    className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Submitting Application...' : 'Submit Official Application'}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-app-secondary border-t border-app-border flex items-center justify-between">
          <span className="text-[11px] text-app-subtle">
            ACTIVIA Co-Curricular Management Engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-app-border text-app-text hover:bg-app-secondary font-semibold text-xs transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

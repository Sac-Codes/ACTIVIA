import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  HelpCircle,
  ChevronRight,
  Send,
  User,
  Sparkles,
  Lock,
  Bookmark
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

  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'judging' | 'register'>('overview');
  const [format, setFormat] = useState<'individual' | 'team'>(activity.participationFormat);
  const [teamName, setTeamName] = useState('');
  const [teamMembersInput, setTeamMembersInput] = useState(`${persona.name} (Lead)`);
  const [projectTitle, setProjectTitle] = useState('');
  const [motivation, setMotivation] = useState('');
  const [parentConsent, setParentConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Eligibility check
  const isEligibleGrade = persona.grade ? activity.eligibleGrades.includes(persona.grade) : true;
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

    if (!motivation.trim() || motivation.trim().length < 10) {
      setFormError('Please enter a short statement of motivation or project interest (min 10 characters).');
      return;
    }

    if (!parentConsent) {
      setFormError('Parental or guardian acknowledgment is required for after-school activities.');
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
      studentGrade: persona.grade || 'Grade 11',
      studentSection: persona.section || 'Section A',
      studentHouse: persona.house || 'Newton House',
      format,
      teamName: format === 'team' ? teamName.trim() : undefined,
      teamMembers: members,
      projectTitle: projectTitle.trim() || undefined,
      motivation: motivation.trim(),
      parentConsentApproved: parentConsent,
    });

    setSubmitting(false);

    if (result.success) {
      setFormSuccess('Registration submitted successfully! Your teacher and activity desk have been notified.');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      setFormError(result.error || 'Failed to submit registration. Please verify details.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-activia-surface border border-activia-border rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Banner */}
        <div className="relative h-48 w-full bg-activia-dark overflow-hidden flex-shrink-0">
          <img
            src={activity.posterUrl}
            alt={activity.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-activia-surface via-activia-surface/40 to-black/60" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Category Tag & Format */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-activia-blue/90 text-white backdrop-blur-md">
              {activity.categoryName}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/10">
              {activity.participationFormat}
            </span>
          </div>

          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white drop-shadow-md">
              {activity.title}
            </h2>
            <p className="text-xs text-activia-muted mt-0.5">
              Organized by {activity.organizer} • Mentored by {activity.coordinatingTeacher}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-4 border-b border-activia-border bg-activia-surface">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'overview'
                ? 'text-activia-blue border-activia-blue bg-white/5'
                : 'text-activia-muted hover:text-white border-transparent'
            }`}
          >
            Overview & Schedule
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'rules'
                ? 'text-activia-blue border-activia-blue bg-white/5'
                : 'text-activia-muted hover:text-white border-transparent'
            }`}
          >
            Rules & Requirements
          </button>
          {activity.judgingCriteria && activity.judgingCriteria.length > 0 && (
            <button
              onClick={() => setActiveTab('judging')}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 ${
                activeTab === 'judging'
                  ? 'text-activia-blue border-activia-blue bg-white/5'
                  : 'text-activia-muted hover:text-white border-transparent'
              }`}
            >
              Judging Criteria
            </button>
          )}
          <button
            onClick={() => setActiveTab('register')}
            className={`ml-auto px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-activia-blue text-white shadow-glow-blue'
                : 'bg-activia-blue/20 text-activia-blue hover:bg-activia-blue/30 border border-activia-blue/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {existingRegistration ? 'My Registration Status' : 'Register Now'}
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto max-h-[55vh] space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Specs Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-activia-elevated/70 border border-activia-border text-xs">
                <div>
                  <span className="text-activia-muted flex items-center gap-1 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-activia-cyan" /> Event Date
                  </span>
                  <p className="font-semibold text-white">{activity.date}</p>
                </div>
                <div>
                  <span className="text-activia-muted flex items-center gap-1 mb-1">
                    <Clock className="w-3.5 h-3.5 text-activia-purple" /> Time Slot
                  </span>
                  <p className="font-semibold text-white">{activity.startTime} - {activity.endTime}</p>
                </div>
                <div>
                  <span className="text-activia-muted flex items-center gap-1 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-activia-amber" /> Venue
                  </span>
                  <p className="font-semibold text-white">{activity.venue}</p>
                </div>
                <div>
                  <span className="text-activia-muted flex items-center gap-1 mb-1">
                    <Users className="w-3.5 h-3.5 text-activia-mint" /> Capacity
                  </span>
                  <p className="font-semibold text-white">
                    {activity.totalSeats ? `${activity.seatsTaken}/${activity.totalSeats} seats` : 'Open'}
                  </p>
                </div>
              </div>

              {/* Detailed Description */}
              <div>
                <h4 className="text-sm font-bold text-white mb-2">About This Opportunity</h4>
                <p className="text-xs text-activia-muted leading-relaxed whitespace-pre-line">
                  {activity.fullOverview}
                </p>
              </div>

              {/* Eligibility & Deadlines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                  <h5 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-activia-blue" /> Eligibility Criteria
                  </h5>
                  <ul className="text-xs text-activia-muted space-y-1">
                    <li>• Eligible Grades: <strong className="text-white">{activity.eligibleGrades.join(', ')}</strong></li>
                    {activity.eligibleStreams && (
                      <li>• Eligible Streams: <strong className="text-white">{activity.eligibleStreams.join(', ')}</strong></li>
                    )}
                    <li>• Format: <strong className="text-white">{activity.participationFormat === 'team' ? `Team (${activity.minTeamSize || 2}-${activity.maxTeamSize || 4} members)` : 'Individual'}</strong></li>
                    <li>• Cost: <strong className="text-activia-mint">{activity.cost}</strong></li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                  <h5 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-activia-amber" /> Key Deadlines
                  </h5>
                  <ul className="text-xs text-activia-muted space-y-1">
                    <li>• Registration Deadline: <strong className="text-white">{activity.registrationDeadline}</strong></li>
                    {activity.submissionDeadline && (
                      <li>• Project Submission Deadline: <strong className="text-white">{activity.submissionDeadline}</strong></li>
                    )}
                    <li>• Competition Day: <strong className="text-white">{activity.date}</strong></li>
                  </ul>
                </div>
              </div>

              {/* FAQs */}
              {activity.faqs && activity.faqs.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-white mb-3">Frequently Asked Questions</h4>
                  <div className="space-y-2">
                    {activity.faqs.map((faq, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-activia-elevated/50 border border-white/5">
                        <p className="text-xs font-semibold text-white flex items-center gap-2">
                          <HelpCircle className="w-3.5 h-3.5 text-activia-cyan flex-shrink-0" />
                          {faq.question}
                        </p>
                        <p className="text-xs text-activia-muted mt-1 pl-5 leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white">Official Regulations & Compliance</h4>
              <p className="text-xs text-activia-muted">
                All participants must abide by school extracurricular guidelines and specific event safety standards.
              </p>
              <div className="space-y-2.5">
                {activity.rules.map((rule, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-activia-elevated/60 border border-white/5 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-activia-blue/20 text-activia-blue text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-activia-text leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'judging' && activity.judgingCriteria && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white">Evaluation Matrix & Criteria</h4>
              <div className="space-y-3">
                {activity.judgingCriteria.map((c, i) => (
                  <div key={i} className="p-4 rounded-xl bg-activia-elevated/70 border border-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{c.title}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400">
                        {c.weight}% Weight
                      </span>
                    </div>
                    <p className="text-xs text-activia-muted mt-1 leading-relaxed">{c.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'register' && (
            <div className="space-y-4">
              {/* Existing Registration State */}
              {existingRegistration ? (
                <div className="p-6 rounded-2xl bg-activia-elevated border border-activia-blue/40 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-activia-mint/20 text-activia-mint flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-white">Active Registration Recorded</h4>
                  <p className="text-xs text-activia-muted max-w-md mx-auto">
                    You registered on {new Date(existingRegistration.submittedAt).toLocaleDateString()}. Current state:{' '}
                    <strong className="text-activia-mint uppercase">{existingRegistration.status.replace(/_/g, ' ')}</strong>
                  </p>
                  {existingRegistration.teamName && (
                    <div className="p-3 rounded-xl bg-white/5 max-w-sm mx-auto text-xs text-left">
                      <p className="text-white font-semibold">Team: {existingRegistration.teamName}</p>
                      <p className="text-activia-muted mt-0.5">Members: {existingRegistration.teamMembers?.join(', ')}</p>
                    </div>
                  )}
                  {existingRegistration.reviewNotes && (
                    <p className="text-xs text-activia-cyan italic">
                      Review Note: &ldquo;{existingRegistration.reviewNotes}&rdquo;
                    </p>
                  )}
                </div>
              ) : (
                /* Registration Form */
                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Eligibility Alert if Ineligible */}
                  {!isEligibleGrade && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-activia-rose" />
                      <div>
                        <strong className="font-semibold">Grade Eligibility Notice:</strong> Your profile ({persona.grade}) is not in the eligible grade brackets ({activity.eligibleGrades.join(', ')}). Registration cannot proceed.
                      </div>
                    </div>
                  )}

                  {/* Waitlist Warning if Full */}
                  {isFull && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-300">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                      <div>
                        <strong className="font-semibold">Capacity Reached:</strong> Total capacity of {activity.totalSeats} seats is currently filled. Submitting now will place you on the prioritized waitlist.
                      </div>
                    </div>
                  )}

                  {/* Error & Success Messages */}
                  {formError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
                      {formError}
                    </div>
                  )}
                  {formSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      {formSuccess}
                    </div>
                  )}

                  {/* Student Identity Auto-Filled */}
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-activia-muted grid grid-cols-2 gap-2">
                    <div>
                      <span>Student:</span> <strong className="text-white">{persona.name} ({persona.studentId})</strong>
                    </div>
                    <div>
                      <span>Class / Section:</span> <strong className="text-white">{persona.grade} • {persona.section}</strong>
                    </div>
                    <div>
                      <span>Stream:</span> <strong className="text-white">{persona.stream}</strong>
                    </div>
                    <div>
                      <span>House:</span> <strong className="text-white">{persona.house}</strong>
                    </div>
                  </div>

                  {/* Format Selection if Allowed */}
                  {activity.participationFormat === 'team' && (
                    <div className="space-y-3 p-4 rounded-xl bg-activia-elevated/60 border border-white/5">
                      <h5 className="text-xs font-bold text-white">Team Details</h5>
                      <div>
                        <label className="text-[11px] text-activia-muted block mb-1">Squad or Team Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. AstroBots Alpha"
                          value={teamName}
                          onChange={e => setTeamName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-activia-surface border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-activia-muted block mb-1">Proposed Team Members (Comma separated)</label>
                        <input
                          type="text"
                          value={teamMembersInput}
                          onChange={e => setTeamMembersInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-activia-surface border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue"
                        />
                      </div>
                    </div>
                  )}

                  {/* Project Title / Idea */}
                  {activity.isCompetition && (
                    <div>
                      <label className="text-[11px] text-activia-muted block mb-1">Proposed Project Title / Topic (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Autonomous Maze SLAM Rover with Edge AI"
                        value={projectTitle}
                        onChange={e => setProjectTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-activia-surface border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue"
                      />
                    </div>
                  )}

                  {/* Motivation Statement */}
                  <div>
                    <label className="text-[11px] text-activia-muted block mb-1">
                      Statement of Motivation / Prior Experience *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Explain why you wish to participate and what relevant experience or interests you bring..."
                      value={motivation}
                      onChange={e => setMotivation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-activia-surface border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue resize-none"
                    />
                  </div>

                  {/* Consent & Agreements */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2 cursor-pointer text-xs text-activia-muted">
                      <input
                        type="checkbox"
                        checked={parentConsent}
                        onChange={e => setParentConsent(e.target.checked)}
                        className="mt-0.5 rounded border-activia-border bg-activia-surface text-activia-blue focus:ring-0"
                      />
                      <span>
                        I acknowledge that I have verified parent/guardian consent for school activity commitments, and agree to attend all designated rehearsals/competition rounds.
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={submitting || !isEligibleGrade || !!formSuccess}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-activia-blue to-activia-purple text-white text-xs font-bold shadow-lg shadow-activia-blue/30 hover:shadow-glow-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <span>Submitting Application...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          {isFull ? 'Submit for Prioritized Waitlist' : 'Submit Official Registration'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

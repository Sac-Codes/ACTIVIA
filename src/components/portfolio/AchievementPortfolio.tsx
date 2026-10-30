import React, { useState } from 'react';
import {
  Award,
  ShieldCheck,
  Calendar,
  Download,
  CheckCircle2,
  Filter,
  GraduationCap,
  Sparkles,
  FileCheck
} from 'lucide-react';
import { VerifiedAchievement, UserPersona } from '../../types';

interface AchievementPortfolioProps {
  achievements: VerifiedAchievement[];
  persona: UserPersona;
}

export const AchievementPortfolio: React.FC<AchievementPortfolioProps> = ({
  achievements,
  persona,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  const filteredAchievements = achievements.filter(a =>
    selectedDomain === 'all' ? true : a.domainArea === selectedDomain
  );

  const domains = ['all', 'Technical', 'Creativity', 'Leadership', 'Sports', 'Community'];

  const handlePrintPortfolio = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl border border-app-border p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-app-text">
            Verified Achievement Portfolio
          </h2>
          <p className="text-xs sm:text-sm text-app-muted mt-1">
            Official institutional transcript of approved co-curricular distinctions, competition honors, and leadership milestones.
          </p>
        </div>

        <button
          onClick={handlePrintPortfolio}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Print / Export Transcript (PDF)</span>
        </button>
      </div>

      {/* Domain Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-print">
        <span className="text-xs text-app-muted mr-1 font-medium">Domain Area:</span>
        {domains.map(d => (
          <button
            key={d}
            onClick={() => setSelectedDomain(d)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
              selectedDomain === d
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'bg-white text-app-muted hover:text-app-text hover:bg-app-secondary border border-app-border'
            }`}
          >
            {d === 'all' ? 'All Disciplines' : d}
          </button>
        ))}
      </div>

      {/* Official Printable Transcript Container */}
      <div className="p-6 sm:p-8 rounded-xl bg-white border border-app-border shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Institutional Transcript Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-app-border gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Oakridge International Academy • Office of Student Records
            </div>
            <h3 className="text-2xl font-bold font-display text-app-text">
              Co-Curricular Distinction Transcript
            </h3>
            <p className="text-xs text-app-muted mt-2">
              Student: <strong className="text-app-text">{persona.name}</strong> • Student ID: <strong className="font-mono text-app-text">{persona.studentId || 'STU-2026-8841'}</strong>
            </p>
            <p className="text-xs text-app-muted">
              Class: <strong className="text-app-text">{persona.grade || 'Grade 10'} - {persona.section || 'A'}</strong> • House: <strong className="text-app-text">{persona.house || 'Phoenix'} House</strong> • Academic Year: <strong className="text-app-text">2026 - 2027</strong>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Institutionally Verified
            </span>
            <p className="text-[11px] text-app-subtle mt-2 font-mono">
              Ledger Ref: OAK-EXT-2026-VERIFIED
            </p>
          </div>
        </div>

        {/* Achievement Table / Cards */}
        {filteredAchievements.length === 0 ? (
          <div className="py-16 text-center">
            <Award className="w-10 h-10 text-app-muted mx-auto mb-3" />
            <h4 className="text-base font-semibold text-app-text">No verified records yet</h4>
            <p className="text-xs text-app-muted mt-1 max-w-sm mx-auto">
              Once you complete registered competitions and workshops, your faculty mentors will issue official verification credentials.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAchievements.map((ach, idx) => (
              <div
                key={ach.id}
                className="p-5 rounded-lg bg-app-secondary/50 border border-app-border space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center border border-indigo-100">
                      {idx + 1}
                    </span>
                    <h4 className="text-base font-bold text-app-text">
                      {ach.activityTitle}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      {ach.placement}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-white text-app-muted border border-app-border">
                      {ach.domainArea}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-app-muted pt-1">
                  <div>Role: <strong className="text-app-text">{ach.role}</strong></div>
                  <div>Event Date: <strong className="text-app-text">{ach.date}</strong></div>
                  <div>Verified By: <strong className="text-indigo-700">{ach.verifiedBy}</strong></div>
                </div>

                {ach.skillsAcquired && ach.skillsAcquired.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-xs text-app-muted">Validated Competencies:</span>
                    {ach.skillsAcquired.map(skill => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-white text-app-text border border-app-border"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Institutional Signature & Seal Footprint */}
        <div className="pt-8 border-t border-app-border flex items-center justify-between text-xs text-app-muted">
          <div>
            <p className="font-bold text-app-text">Dr. Eleanor Sterling</p>
            <p className="text-[11px]">Principal & Head of School</p>
            <p className="text-[10px] font-mono text-emerald-600 mt-0.5">Digital Signature: VERIFIED_KEY_ED25519</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-app-text">Dr. Robert Vance</p>
            <p className="text-[11px]">Dean of Co-Curricular Programs</p>
            <p className="text-[10px] text-app-muted">Oakridge International Academy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

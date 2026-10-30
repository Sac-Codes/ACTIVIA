import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  ShieldCheck,
  Calendar,
  Download,
  Share2,
  FileCheck,
  CheckCircle2,
  Compass,
  Layers,
  GraduationCap
} from 'lucide-react';
import { VerifiedAchievement, UserPersona } from '../../types';
import { AchievementConstellation } from '../3d/AchievementConstellation';

interface AchievementPortfolioProps {
  achievements: VerifiedAchievement[];
  persona: UserPersona;
}

export const AchievementPortfolio: React.FC<AchievementPortfolioProps> = ({
  achievements,
  persona,
}) => {
  const [viewMode, setViewMode] = useState<'constellation' | 'list'>('constellation');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  const filteredAchievements = achievements.filter(a =>
    selectedDomain === 'all' ? true : a.domainArea === selectedDomain
  );

  const domains = ['all', 'Technical', 'Creativity', 'Leadership', 'Sports', 'Community'];

  const handlePrintPortfolio = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-activia-purple flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            Verified Extracurricular Transcript
          </span>
          <h2 className="text-2xl font-bold font-display text-white mt-0.5">
            Personal Achievement Portfolio
          </h2>
          <p className="text-xs text-activia-muted mt-1">
            Institutional verification vault of all approved honors, medals, leadership positions, and volunteer service hours.
          </p>
        </div>

        {/* View toggles & PDF export */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-activia-surface border border-activia-border">
            <button
              onClick={() => setViewMode('constellation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'constellation'
                  ? 'bg-activia-purple text-white shadow'
                  : 'text-activia-muted hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              3D Constellation
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-activia-blue text-white shadow'
                  : 'text-activia-muted hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Record Vault
            </button>
          </div>

          <button
            onClick={handlePrintPortfolio}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-activia-blue to-activia-purple text-white text-xs font-bold shadow-lg shadow-activia-blue/30 transition-all flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            Print / Export Official PDF
          </button>
        </div>
      </div>

      {/* 3D CONSTELLATION VIEW */}
      {viewMode === 'constellation' && (
        <div className="no-print">
          <AchievementConstellation
            achievements={filteredAchievements}
            studentName={persona.name}
          />
        </div>
      )}

      {/* PRINT-READY OFFICIAL TRANSCRIPT / RECORD VAULT */}
      <div className={`space-y-6 ${viewMode === 'constellation' ? 'hidden sm:block no-print' : ''}`}>
        {/* Domain Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-print">
          <span className="text-xs text-activia-muted mr-1">Discipline Area:</span>
          {domains.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDomain(d)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                selectedDomain === d
                  ? 'bg-activia-blue text-white'
                  : 'bg-activia-surface hover:bg-activia-elevated text-activia-muted hover:text-white border border-activia-border'
              }`}
            >
              {d === 'all' ? 'All Disciplines' : d}
            </button>
          ))}
        </div>

        {/* Official Printable Transcript Container */}
        <div className="p-6 sm:p-8 rounded-3xl bg-activia-surface border border-activia-border shadow-2xl space-y-6 print:border-none print:shadow-none print:p-0">
          {/* Transcript Institutional Header */}
          <div className="flex items-start justify-between pb-6 border-b border-white/10 print:border-black">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-activia-cyan mb-1">
                <ShieldCheck className="w-4 h-4 text-activia-mint" />
                Horizon International Academy • Office of Student Records
              </div>
              <h3 className="text-2xl font-black font-display text-white">
                Extracurricular Distinction Transcript
              </h3>
              <p className="text-xs text-activia-muted mt-1">
                Student: <strong className="text-white">{persona.name}</strong> • Student ID: <strong className="font-mono text-white">{persona.studentId}</strong>
              </p>
              <p className="text-xs text-activia-muted">
                Class: <strong className="text-white">{persona.grade} - {persona.section}</strong> • House: <strong className="text-white">{persona.house}</strong> • Academic Session: <strong className="text-white">2026-2027</strong>
              </p>
            </div>

            <div className="text-right">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                100% Institutionally Verified
              </span>
              <p className="text-[10px] text-activia-muted mt-2 font-mono">
                Verification Ledger: HZN-EXT-8841-VERIFIED
              </p>
            </div>
          </div>

          {/* Achievement Table / Cards */}
          <div className="space-y-4">
            {filteredAchievements.map((ach, idx) => (
              <div
                key={ach.id}
                className="p-5 rounded-2xl bg-activia-elevated/70 border border-white/5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-activia-blue/20 text-activia-blue text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h4 className="text-base font-bold text-white font-display">
                      {ach.activityTitle}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {ach.placement}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/10 text-white">
                      {ach.domainArea}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-activia-muted pt-1">
                  <div>Role: <strong className="text-white">{ach.role}</strong></div>
                  <div>Event Date: <strong className="text-white">{ach.date}</strong></div>
                  <div>Verified By: <strong className="text-activia-cyan">{ach.verifiedBy}</strong></div>
                </div>

                {/* Skills Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-activia-muted">Validated Skills:</span>
                  {ach.skillsAcquired.map(skill => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/5 text-activia-text border border-white/10"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {ach.personalReflection && (
                  <p className="text-xs text-activia-muted italic pt-1 border-t border-white/5">
                    &ldquo;{ach.personalReflection}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Institutional Signature & Seal Footprint */}
          <div className="pt-8 border-t border-white/10 flex items-center justify-between text-xs text-activia-muted">
            <div>
              <p className="font-bold text-white">Dr. Eleanor Vance</p>
              <p className="text-[10px]">Principal & Chief Administrator</p>
              <p className="text-[10px] font-mono text-activia-mint">Signature Timestamp: Valid Digital Token</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-white">Sarah Jenkins</p>
              <p className="text-[10px]">Head of Extracurricular Coordination</p>
              <p className="text-[10px] text-activia-muted">Horizon International Academy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

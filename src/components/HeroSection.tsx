import React from 'react';
import {
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  Building2,
  BookmarkCheck,
  TrendingUp,
} from 'lucide-react';
import { ActivityStats } from '../types';

interface HeroSectionProps {
  stats: ActivityStats | null;
  onExplore: () => void;
  onViewSchedule: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  stats,
  onExplore,
  onViewSchedule,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
      {/* Subtle grid backdrop pattern */}
      <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* Decorative ambient glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-semibold tracking-wide uppercase mb-5 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>School Activity Coordination Platform</span>
          </div>

          {/* Prompt-mandated Headline */}
          <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Every School Activity. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-indigo-200 to-teal-300">
              One Connected Campus.
            </span>
          </h1>

          {/* Prompt-mandated Supporting Text */}
          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Discover events, explore schedules, and stay informed with a centralized platform for school activities. Powered by real-time conflict detection and persistent records.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={onExplore}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-900/40 hover:shadow-indigo-700/50 transition-all duration-150 transform hover:-translate-y-0.5"
            >
              <span>Explore Activities</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onViewSchedule}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 font-semibold text-sm transition-all duration-150 transform hover:-translate-y-0.5"
            >
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>View Agenda Schedule</span>
            </button>
          </div>
        </div>

        {/* Database-derived live statistics cards */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
          {/* Stat 1: Upcoming Events */}
          <div className="bg-slate-800/60 backdrop-blur-xs border border-slate-700/70 rounded-2xl p-4 sm:p-5 text-center sm:text-left transition-transform hover:border-indigo-500/40">
            <div className="flex items-center justify-center sm:justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Upcoming Events
              </span>
              <Calendar className="w-4 h-4 text-indigo-400 hidden sm:block" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              {stats ? stats.upcomingCount : '—'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Confirmed on calendar</p>
          </div>

          {/* Stat 2: Active Departments */}
          <div className="bg-slate-800/60 backdrop-blur-xs border border-slate-700/70 rounded-2xl p-4 sm:p-5 text-center sm:text-left transition-transform hover:border-indigo-500/40">
            <div className="flex items-center justify-center sm:justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Departments
              </span>
              <BookmarkCheck className="w-4 h-4 text-teal-400 hidden sm:block" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              {stats ? stats.departmentCount : '—'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">STEM, Arts, Athletics & more</p>
          </div>

          {/* Stat 3: Campus Venues in Use */}
          <div className="bg-slate-800/60 backdrop-blur-xs border border-slate-700/70 rounded-2xl p-4 sm:p-5 text-center sm:text-left transition-transform hover:border-indigo-500/40">
            <div className="flex items-center justify-center sm:justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Active Venues
              </span>
              <Building2 className="w-4 h-4 text-amber-400 hidden sm:block" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              {stats ? stats.topVenues.length : '—'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Auditoriums, labs, & courts</p>
          </div>

          {/* Stat 4: Total Published Activities */}
          <div className="bg-slate-800/60 backdrop-blur-xs border border-slate-700/70 rounded-2xl p-4 sm:p-5 text-center sm:text-left transition-transform hover:border-indigo-500/40">
            <div className="flex items-center justify-center sm:justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Published Total
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-400 hidden sm:block" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              {stats ? stats.publishedCount : '—'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Persistent SQLite records</p>
          </div>
        </div>
      </div>
    </div>
  );
};

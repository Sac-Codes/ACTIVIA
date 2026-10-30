import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Compass,
  Trophy,
  Users,
  Building,
  Sparkles,
  ArrowRight,
  Calendar
} from 'lucide-react';
import { Activity, Club, Venue } from '../../types';

interface CommandSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: Activity[];
  clubs: Club[];
  venues: Venue[];
  onSelectActivity: (activity: Activity) => void;
  onNavigate: (tab: string) => void;
}

export const CommandSearchModal: React.FC<CommandSearchModalProps> = ({
  isOpen,
  onClose,
  activities,
  clubs,
  venues,
  onSelectActivity,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchingActivities = q
    ? activities.filter(
        a => a.title.toLowerCase().includes(q) || a.categoryName.toLowerCase().includes(q) || a.venue.toLowerCase().includes(q)
      ).slice(0, 5)
    : activities.slice(0, 3);

  const matchingClubs = q
    ? clubs.filter(
        c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
      ).slice(0, 3)
    : clubs.slice(0, 2);

  const quickPages = [
    { id: 'galaxy', label: '3D Activity Galaxy Hub', icon: Sparkles },
    { id: 'campus', label: '3D School Campus Map', icon: Building },
    { id: 'competitions', label: 'Competition Journey & Tasks', icon: Trophy },
    { id: 'calendar', label: 'Master Academic Calendar', icon: Calendar },
    { id: 'achievements', label: 'Personal Achievement Portfolio', icon: Trophy },
  ].filter(p => !q || p.label.toLowerCase().includes(q));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 p-4">
      <div className="w-full max-w-xl bg-activia-surface border border-activia-border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="relative p-4 border-b border-white/10 flex items-center">
          <Search className="w-5 h-5 text-activia-muted absolute left-5" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, competition, guild, or jump to page..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-transparent text-sm text-white placeholder:text-activia-muted focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-activia-muted hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
          {/* Quick Pages */}
          {quickPages.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-activia-muted block mb-2 px-2">
                Quick Destinations
              </span>
              <div className="space-y-1">
                {quickPages.map(page => {
                  const Icon = page.icon;
                  return (
                    <div
                      key={page.id}
                      onClick={() => {
                        onNavigate(page.id);
                        onClose();
                      }}
                      className="p-2.5 rounded-xl hover:bg-activia-elevated cursor-pointer flex items-center justify-between text-xs text-white transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-activia-blue group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">{page.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-activia-muted group-hover:text-white transition-colors" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Activities */}
          {matchingActivities.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-activia-cyan block mb-2 px-2">
                Activities & Competitions
              </span>
              <div className="space-y-1">
                {matchingActivities.map(act => (
                  <div
                    key={act.id}
                    onClick={() => {
                      onSelectActivity(act);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl hover:bg-activia-elevated cursor-pointer flex items-center justify-between text-xs transition-colors group"
                  >
                    <div>
                      <p className="font-semibold text-white group-hover:text-activia-blue transition-colors">{act.title}</p>
                      <p className="text-[10px] text-activia-muted">{act.categoryName} • {act.date} at {act.venue}</p>
                    </div>
                    <span className="text-[10px] font-bold text-activia-cyan uppercase">{act.participationFormat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clubs */}
          {matchingClubs.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-activia-mint block mb-2 px-2">
                Student Clubs & Societies
              </span>
              <div className="space-y-1">
                {matchingClubs.map(c => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onNavigate('clubs');
                      onClose();
                    }}
                    className="p-2.5 rounded-xl hover:bg-activia-elevated cursor-pointer flex items-center justify-between text-xs transition-colors group"
                  >
                    <div>
                      <p className="font-semibold text-white group-hover:text-activia-mint transition-colors">{c.name}</p>
                      <p className="text-[10px] text-activia-muted">{c.meetingSchedule} • {c.memberCount} Members</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-activia-muted group-hover:text-white" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/5 bg-activia-dark/50 flex items-center justify-between text-[11px] text-activia-muted px-4">
          <span>Navigate with mouse or Esc to dismiss</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">ESC</kbd>
        </div>
      </div>
    </div>
  );
};

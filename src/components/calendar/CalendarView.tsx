import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  AlertTriangle,
  Download,
  Filter,
  Layers,
  Sparkles,
  Trophy,
  Users
} from 'lucide-react';
import { CalendarEvent, Venue } from '../../types';

interface CalendarViewProps {
  events: CalendarEvent[];
  venues: Venue[];
  onSelectEvent?: (eventId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  venues,
  onSelectEvent,
}) => {
  const [currentView, setCurrentView] = useState<'month' | 'agenda'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentMonth, setCurrentMonth] = useState('November 2026');

  // Days in November 2026 for simulation
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  const filteredEvents = events.filter(e =>
    selectedCategory === 'all' ? true : e.category === selectedCategory
  );

  // Detect simulated conflicts (e.g. same venue and date)
  const venueConflicts: Array<{ venue: string; date: string; events: string[] }> = [];
  const eventMap: Record<string, CalendarEvent[]> = {};

  filteredEvents.forEach(e => {
    const key = `${e.date}_${e.venue}`;
    if (!eventMap[key]) eventMap[key] = [];
    eventMap[key].push(e);
  });

  Object.entries(eventMap).forEach(([key, evts]) => {
    if (evts.length > 1) {
      venueConflicts.push({
        venue: evts[0].venue,
        date: evts[0].date,
        events: evts.map(ev => ev.title)
      });
    }
  });

  const exportICS = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ACTIVIA School Universe//EN',
      ...filteredEvents.map(e => [
        'BEGIN:VEVENT',
        `SUMMARY:${e.title}`,
        `LOCATION:${e.venue}`,
        `DESCRIPTION:Category: ${e.categoryName}`,
        `DTSTART:${e.date.replace(/-/g, '')}T090000Z`,
        `DTEND:${e.date.replace(/-/g, '')}T170000Z`,
        'END:VEVENT'
      ].join('\n')),
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'activia_calendar_2026.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-activia-cyan flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5" />
            Institutional Master Timetable
          </span>
          <h2 className="text-2xl font-bold font-display text-white mt-0.5">
            Academic & Event Calendar
          </h2>
          <p className="text-xs text-activia-muted mt-1">
            Real-time schedule for competitions, submission deadlines, club assemblies, and venue bookings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Toggles */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-activia-surface border border-activia-border">
            <button
              onClick={() => setCurrentView('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'month' ? 'bg-activia-blue text-white shadow' : 'text-activia-muted hover:text-white'
              }`}
            >
              Month Grid
            </button>
            <button
              onClick={() => setCurrentView('agenda')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'agenda' ? 'bg-activia-blue text-white shadow' : 'text-activia-muted hover:text-white'
              }`}
            >
              Agenda Feed
            </button>
          </div>

          <button
            onClick={exportICS}
            className="px-3.5 py-2 rounded-xl bg-activia-elevated hover:bg-white/10 text-white text-xs font-semibold border border-activia-border transition-all flex items-center gap-1.5"
            title="Download iCal Feed"
          >
            <Download className="w-3.5 h-3.5 text-activia-cyan" />
            Export .ICS
          </button>
        </div>
      </div>

      {/* Venue Conflict Alert Banner if detected */}
      {venueConflicts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-300">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Schedule Conflict Detected:</strong> Two activities are requesting identical venue slots ({venueConflicts[0].venue} on {venueConflicts[0].date}). The Activity Desk is reviewing alternative staging.
          </div>
        </div>
      )}

      {/* Month Navigator Bar */}
      <div className="p-4 rounded-2xl bg-activia-surface border border-activia-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="p-1.5 rounded-lg hover:bg-white/10 text-activia-muted hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-white font-display">{currentMonth}</span>
          <button className="p-1.5 rounded-lg hover:bg-white/10 text-activia-muted hover:text-white transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-activia-muted hidden sm:inline">Sector:</span>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-activia-elevated border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue"
          >
            <option value="all">All Sectors</option>
            <option value="stem-robotics">STEM & Robotics</option>
            <option value="science-math">Science & Math</option>
            <option value="sports-athletics">Sports & Athletics</option>
            <option value="arts-culture">Arts & Culture</option>
            <option value="literature-debate">Literature & Debate</option>
            <option value="social-service">Social Service</option>
          </select>
        </div>
      </div>

      {/* MONTH GRID VIEW */}
      {currentView === 'month' && (
        <div className="rounded-3xl bg-activia-surface border border-activia-border shadow-xl overflow-hidden p-4 sm:p-6">
          {/* Days of week */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-activia-muted uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Day Tiles */}
          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map(day => {
              const dateStr = `2026-11-${day < 10 ? '0' + day : day}`;
              const dayEvents = filteredEvents.filter(e => e.date === dateStr);

              return (
                <div
                  key={day}
                  className={`min-h-[90px] sm:min-h-[110px] p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                    dayEvents.length > 0
                      ? 'bg-activia-elevated/70 border-white/10 hover:border-activia-blue/40'
                      : 'bg-white/[0.01] border-white/5 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${dayEvents.length > 0 ? 'text-white' : 'text-activia-muted'}`}>
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-activia-blue" />
                    )}
                  </div>

                  {/* Event Badges */}
                  <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                    {dayEvents.map(ev => (
                      <div
                        key={ev.id}
                        className="px-1.5 py-0.5 rounded text-[10px] font-semibold truncate cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: `${ev.color}25`, color: ev.color, border: `1px solid ${ev.color}40` }}
                        title={`${ev.title} (${ev.time}) at ${ev.venue}`}
                      >
                        {ev.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AGENDA FEED VIEW */}
      {currentView === 'agenda' && (
        <div className="space-y-3">
          {filteredEvents.map(ev => (
            <div
              key={ev.id}
              className="p-5 rounded-3xl bg-activia-surface border border-activia-border/70 hover:border-activia-blue/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg group"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center text-center flex-shrink-0"
                  style={{ backgroundColor: `${ev.color}20`, border: `1px solid ${ev.color}40` }}
                >
                  <span className="text-[10px] uppercase font-bold text-activia-muted">Nov</span>
                  <span className="text-base font-extrabold text-white leading-none">
                    {ev.date.split('-')[2]}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                      style={{ backgroundColor: `${ev.color}20`, color: ev.color }}
                    >
                      {ev.categoryName}
                    </span>
                    <span className="text-xs text-activia-muted">{ev.type}</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-activia-blue transition-colors font-display">
                    {ev.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-activia-muted mt-1.5">
                    <span className="flex items-center gap-1 text-white/80">
                      <Clock className="w-3.5 h-3.5 text-activia-purple" />
                      {ev.time}
                    </span>
                    <span className="flex items-center gap-1 text-white/80">
                      <MapPin className="w-3.5 h-3.5 text-activia-amber" />
                      {ev.venue}
                    </span>
                  </div>
                </div>
              </div>

              <span className="self-end sm:self-center px-3.5 py-1.5 rounded-xl bg-activia-elevated border border-white/10 text-xs font-semibold text-white">
                Confirmed Booking
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

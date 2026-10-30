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
  Users,
  Trophy,
  List
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
  const [currentView, setCurrentView] = useState<'month' | 'agenda'>('agenda');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentMonth, setCurrentMonth] = useState('October / November 2026');

  const filteredEvents = events.filter(e =>
    selectedCategory === 'all' ? true : e.category === selectedCategory
  );

  // Group events by date for agenda view
  const eventsByDate = filteredEvents.reduce((acc, evt) => {
    const d = evt.date || 'Upcoming';
    if (!acc[d]) acc[d] = [];
    acc[d].push(evt);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const sortedDates = Object.keys(eventsByDate).sort();

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
        'STATUS:CONFIRMED',
        'END:VEVENT'
      ].join('\n')),
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'school_events_schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl border border-app-border p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-app-text">
            Events & Academic Calendar
          </h2>
          <p className="text-xs sm:text-sm text-app-muted mt-1">
            Track schedules for competitions, department workshops, club assemblies, and facility bookings.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-app-secondary border border-app-border">
            <button
              onClick={() => setCurrentView('agenda')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                currentView === 'agenda'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-app-muted hover:text-app-text'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Agenda Feed</span>
            </button>
            <button
              onClick={() => setCurrentView('month')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                currentView === 'month'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-app-muted hover:text-app-text'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Month Grid</span>
            </button>
          </div>

          {/* ICS Export */}
          <button
            onClick={exportICS}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            title="Download iCalendar format (.ics)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Calendar (.ICS)</span>
          </button>
        </div>
      </div>

      {/* AGENDA FEED VIEW */}
      {currentView === 'agenda' && (
        <div className="space-y-6">
          {sortedDates.length === 0 ? (
            <div className="p-16 text-center rounded-xl bg-white border border-app-border shadow-xs">
              <CalendarIcon className="w-10 h-10 text-app-muted mx-auto mb-3" />
              <h3 className="text-base font-semibold text-app-text">No events scheduled</h3>
              <p className="text-xs text-app-muted mt-1">
                There are currently no events on the academic calendar.
              </p>
            </div>
          ) : (
            sortedDates.map(dateKey => {
              const dayEvents = eventsByDate[dateKey];
              const parsedDate = new Date(dateKey);
              const formattedHeader = isNaN(parsedDate.getTime())
                ? dateKey
                : parsedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

              return (
                <div key={dateKey} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                      {formattedHeader}
                    </span>
                    <span className="h-px bg-app-border flex-1" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dayEvents.map(evt => (
                      <div
                        key={evt.id}
                        onClick={() => onSelectEvent && onSelectEvent(evt.id)}
                        className="bg-white rounded-xl border border-app-border hover:border-indigo-300 p-5 shadow-xs hover:shadow-card-hover transition-all flex flex-col justify-between cursor-pointer group"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {evt.categoryName || 'Activity'}
                            </span>
                            <span className="text-xs font-medium text-app-muted flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-app-subtle" />
                              {evt.time || 'Scheduled Time'}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-app-text group-hover:text-indigo-600 transition-colors">
                            {evt.title}
                          </h3>

                          <div className="flex items-center gap-2 text-xs text-app-muted pt-1">
                            <MapPin className="w-3.5 h-3.5 text-app-subtle flex-shrink-0" />
                            <span className="truncate">{evt.venue}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-app-border flex items-center justify-between text-xs">
                          <span className="text-app-muted capitalize">Type: {evt.type.replace(/_/g, ' ')}</span>
                          <span className="font-semibold text-indigo-600 group-hover:underline">
                            Details & Registration
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MONTH GRID VIEW */}
      {currentView === 'month' && (
        <div className="bg-white rounded-xl border border-app-border p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-app-border">
            <h3 className="text-base font-bold text-app-text">{currentMonth}</h3>
            <span className="text-xs text-app-muted">School Term View</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-app-muted pb-2">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 30 }, (_, i) => {
              const dayNum = i + 1;
              const dateStr = `2026-11-${String(dayNum).padStart(2, '0')}`;
              const dayEvts = events.filter(e => e.date === dateStr);

              return (
                <div
                  key={dayNum}
                  className={`min-h-[90px] p-2 rounded-lg border text-left transition-colors ${
                    dayEvts.length > 0
                      ? 'bg-indigo-50/30 border-indigo-200'
                      : 'bg-app-secondary/30 border-app-border'
                  }`}
                >
                  <span className="text-xs font-bold text-app-text block mb-1">{dayNum}</span>
                  <div className="space-y-1">
                    {dayEvts.slice(0, 2).map(e => (
                      <div
                        key={e.id}
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-600 text-white truncate"
                        title={e.title}
                      >
                        {e.title}
                      </div>
                    ))}
                    {dayEvts.length > 2 && (
                      <span className="text-[10px] text-app-muted font-bold block">
                        +{dayEvts.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

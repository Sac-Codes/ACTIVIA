import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CalendarCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Activity } from '../types';
import { formatDateLabel, formatTimeRange, getStatusBadge } from '../utils';

interface ScheduleViewProps {
  activities: Activity[];
  onSelectActivity: (activity: Activity) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  activities,
  onSelectActivity,
}) => {
  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all');

  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  })();

  const filteredActivities = activities.filter((act) => {
    if (filter === 'today') return act.date === todayStr;
    if (filter === 'week') return act.date >= todayStr && act.date <= nextWeekStr;
    return true;
  });

  // Group activities chronologically by date
  const grouped = filteredActivities.reduce((acc, act) => {
    if (!acc[act.date]) acc[act.date] = [];
    acc[act.date].push(act);
    return acc;
  }, {} as Record<string, Activity[]>);

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h2 className="font-heading text-2xl font-extrabold text-slate-900 tracking-tight">
            Campus Activity Schedule
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Chronological timeline of upcoming school lectures, trials, rehearsals, and tournaments.
          </p>
        </div>

        {/* Quick Filter tabs */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Upcoming
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'today'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today Only
          </button>
          <button
            onClick={() => setFilter('week')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'week'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Next 7 Days
          </button>
        </div>
      </div>

      {/* Empty State */}
      {sortedDates.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 mt-6 p-8">
          <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No scheduled activities found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            There are no events matching the selected schedule filter. Switch to "All Upcoming" to view the full academic agenda.
          </p>
          <button
            onClick={() => setFilter('all')}
            className="mt-4 px-4 py-2 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 hover:bg-indigo-100"
          >
            Reset Filter to All
          </button>
        </div>
      )}

      {/* Chronological Timeline Groups */}
      <div className="mt-8 space-y-8">
        {sortedDates.map((dateKey) => {
          const acts = grouped[dateKey];
          const isToday = dateKey === todayStr;
          const formattedDate = formatDateLabel(dateKey);

          return (
            <div key={dateKey} className="relative">
              {/* Day Section Header */}
              <div className="sticky top-20 z-10 bg-slate-50/95 backdrop-blur-xs py-2 flex items-center gap-3 border-b border-slate-200 mb-4">
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold ${
                    isToday
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formattedDate}</span>
                  {isToday && (
                    <span className="ml-1 px-1.5 py-0.2 bg-white/20 rounded text-[10px] uppercase tracking-wider">
                      Today
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {dateKey} • {acts.length} {acts.length === 1 ? 'event' : 'events'}
                </span>
              </div>

              {/* Activity Timeline List for this Day */}
              <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-indigo-100 ml-4">
                {acts.map((act) => {
                  const statusInfo = getStatusBadge(act.status);
                  const deptColor = act.department_color || '#4f46e5';

                  return (
                    <div
                      key={act.id}
                      onClick={() => onSelectActivity(act)}
                      className="group relative bg-white rounded-xl border border-slate-200/90 hover:border-indigo-400 p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      {/* Left: Time & Core Details */}
                      <div className="flex items-start gap-4">
                        {/* Time box */}
                        <div className="shrink-0 text-center w-20 py-2 px-1 bg-slate-50 border border-slate-200/80 rounded-xl group-hover:border-indigo-200 transition-colors">
                          <span className="block text-xs font-bold text-slate-900">
                            {act.start_time}
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            to {act.end_time}
                          </span>
                        </div>

                        {/* Event title & tags */}
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span
                              className="text-[11px] font-semibold px-2 py-0.5 rounded"
                              style={{
                                backgroundColor: `${deptColor}15`,
                                color: deptColor,
                              }}
                            >
                              {act.department_name || act.department_code}
                            </span>
                            <span
                              className={`text-[10px] font-medium px-2 py-0.2 rounded-full border ${statusInfo.bg}`}
                            >
                              {statusInfo.label}
                            </span>
                          </div>

                          <h4 className="font-heading font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {act.title}
                          </h4>

                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {act.venue}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span>{act.organizer}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Quick action arrow */}
                      <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-indigo-600 transition-colors">
                        <span>Details</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

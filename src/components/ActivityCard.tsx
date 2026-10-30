import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ExternalLink,
  CalendarPlus,
  ArrowUpRight,
  AlertCircle,
  Users,
} from 'lucide-react';
import { Activity } from '../types';
import { formatDateLabel, formatTimeRange, getStatusBadge, downloadIcsFile } from '../utils';

interface ActivityCardProps {
  activity: Activity;
  onSelect: (activity: Activity) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onSelect }) => {
  const statusInfo = getStatusBadge(activity.status);
  const dateFormatted = formatDateLabel(activity.date);
  const timeFormatted = formatTimeRange(activity.start_time || activity.startTime || '09:00', activity.end_time || activity.endTime || '10:00');

  const deptColor = activity.department_color || '#4f46e5';

  return (
    <div
      onClick={() => onSelect(activity)}
      className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      {/* Top Banner: Department & Status Badges */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3.5">
          {/* Department badge with custom color styling */}
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide"
            style={{
              backgroundColor: `${deptColor}15`,
              color: deptColor,
              border: `1px solid ${deptColor}30`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: deptColor }}
            />
            {activity.department_name || activity.department_code || 'General'}
          </span>

          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
            {statusInfo.label}
          </span>
        </div>

        {/* Activity Title */}
        <h3 className="font-heading font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
          {activity.title}
        </h3>

        {/* Description snippet */}
        <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {activity.description}
        </p>

        {/* Cancellation or Special alert if applicable */}
        {activity.status === 'cancelled' && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium">This event has been officially cancelled.</span>
          </div>
        )}

        {/* Metadata info grid */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2 text-xs text-slate-600">
          {/* Date & Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-900">{dateFormatted}</span>
              <span className="text-slate-400">({activity.date})</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{timeFormatted}</span>
          </div>

          {/* Venue */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate font-medium text-slate-700">{activity.venue}</span>
          </div>

          {/* Organizer */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate text-slate-500">Organized by {activity.organizer}</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {/* Calendar Export button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              downloadIcsFile(activity);
            }}
            title="Download .ics file to add to Google/Apple Calendar"
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-colors"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
          </button>

          {/* Optional registration badge */}
          {(activity.registration_url || (activity as any).registration_url) && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <ExternalLink className="w-3 h-3" />
              RSVP Open
            </span>
          )}

          {(activity.capacity || activity.totalSeats) && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              <Users className="w-3 h-3 text-slate-400" />
              Cap: {activity.capacity || activity.totalSeats}
            </span>
          )}
        </div>

        {/* View Details link button */}
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
          View Details
          <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};

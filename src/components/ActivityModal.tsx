import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Share2,
  CalendarPlus,
  ExternalLink,
  Users,
  Check,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Activity } from '../types';
import { formatDateLabel, formatTimeRange, getStatusBadge, downloadIcsFile } from '../utils';

interface ActivityModalProps {
  activity: Activity | null;
  onClose: () => void;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({ activity, onClose }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!activity) return null;

  const statusInfo = getStatusBadge(activity.status);
  const deptColor = activity.department_color || '#4f46e5';

  const handleCopyLink = () => {
    const url = `${window.location.origin}?activity=${activity.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Color Accent Bar */}
        <div
          className="h-3 w-full"
          style={{ backgroundColor: deptColor }}
        />

        {/* Modal Header */}
        <div className="p-6 sm:p-8 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {/* Department badge */}
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold"
                style={{
                  backgroundColor: `${deptColor}15`,
                  color: deptColor,
                  border: `1px solid ${deptColor}30`,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: deptColor }}
                />
                {activity.department_name || activity.department_code || 'General'}
              </span>

              {/* Status badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.bg}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                {statusInfo.label}
              </span>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close activity details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Activity Title */}
          <h2 className="mt-4 font-heading text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
            {activity.title}
          </h2>

          {/* Date & Time pill row */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-700 font-medium">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>{formatDateLabel(activity.date)}</span>
              <span className="text-slate-400">({activity.date})</span>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>{formatTimeRange(activity.start_time || activity.startTime || '09:00', activity.end_time || activity.endTime || '10:00')}</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-6 sm:px-8 py-2 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Event Overview
            </h4>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
              {activity.description}
            </p>
          </div>

          {/* Venue & Organizer Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-200/70 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white border border-slate-200 text-indigo-600 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Venue / Location
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                  {activity.venue}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white border border-slate-200 text-indigo-600 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Lead Organizer
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                  {activity.organizer}
                </p>
              </div>
            </div>
          </div>

          {/* Participation instructions if provided */}
          {activity.participation_instructions && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-amber-900 text-xs sm:text-sm">
              <div className="flex items-center gap-2 font-bold mb-1">
                <FileText className="w-4 h-4 text-amber-700" />
                <span>Participation Instructions & Requirements</span>
              </div>
              <p className="mt-1 leading-relaxed text-amber-800">
                {activity.participation_instructions}
              </p>
            </div>
          )}

          {/* Capacity information */}
          {activity.capacity && (
            <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/60">
              <span className="flex items-center gap-2 font-medium">
                <Users className="w-4 h-4 text-slate-400" />
                Venue Capacity Limit
              </span>
              <span className="font-bold text-slate-900">{activity.capacity} attendees max</span>
            </div>
          )}

          {/* Cancelled notice */}
          {activity.status === 'cancelled' && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-900 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Important Notice:</span> This activity has been cancelled by school administration. Check back for rescheduling announcements.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-6 sm:p-8 pt-4 bg-slate-50/80 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Download .ics button */}
            <button
              onClick={() => downloadIcsFile(activity)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-indigo-600" />
              <span>Add to Calendar (.ics)</span>
            </button>

            {/* Share link button */}
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Share Event</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activity.registration_url && activity.status !== 'cancelled' && (
              <a
                href={activity.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition-colors"
              >
                <span>Register / RSVP</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-200/80 hover:bg-slate-300 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

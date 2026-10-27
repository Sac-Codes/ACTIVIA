import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Building,
  User,
  Link as LinkIcon,
  FileText,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { Activity, Department, ConflictCheckResult } from '../types';
import { createActivity, updateActivity, checkActivityConflict } from '../api';

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityToEdit: Activity | null;
  departments: Department[];
  onSaved: (activity: Activity) => void;
}

export const ActivityFormModal: React.FC<ActivityFormModalProps> = ({
  isOpen,
  onClose,
  activityToEdit,
  departments,
  onSaved,
}) => {
  const isEditing = !!activityToEdit;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState<number>(departments[0]?.id || 1);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  const [venue, setVenue] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [status, setStatus] = useState<Activity['status']>('published');
  const [featured, setFeatured] = useState(false);
  const [capacity, setCapacity] = useState<string>('');
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [instructions, setInstructions] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live conflict state
  const [conflictResult, setConflictResult] = useState<ConflictCheckResult | null>(null);
  const [checkingConflict, setCheckingConflict] = useState(false);

  // Populate state when editing
  useEffect(() => {
    if (activityToEdit) {
      setTitle(activityToEdit.title);
      setDescription(activityToEdit.description);
      setDepartmentId(activityToEdit.department_id);
      setDate(activityToEdit.date);
      setStartTime(activityToEdit.start_time);
      setEndTime(activityToEdit.end_time);
      setVenue(activityToEdit.venue);
      setOrganizer(activityToEdit.organizer);
      setStatus(activityToEdit.status);
      setFeatured(!!activityToEdit.featured);
      setCapacity(activityToEdit.capacity ? String(activityToEdit.capacity) : '');
      setRegistrationUrl(activityToEdit.registration_url || '');
      setInstructions(activityToEdit.participation_instructions || '');
    } else {
      // Default to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      setTitle('');
      setDescription('');
      setDepartmentId(departments[0]?.id || 1);
      setDate(tomorrowStr);
      setStartTime('10:00');
      setEndTime('12:00');
      setVenue('');
      setOrganizer('');
      setStatus('published');
      setFeatured(false);
      setCapacity('');
      setRegistrationUrl('');
      setInstructions('');
    }
    setError(null);
    setConflictResult(null);
  }, [activityToEdit, departments, isOpen]);

  // Live Schedule Conflict Check Debounce
  useEffect(() => {
    if (!date || !startTime || !endTime || !venue.trim()) {
      setConflictResult(null);
      return;
    }

    if (startTime >= endTime) {
      setConflictResult(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setCheckingConflict(true);
        const res = await checkActivityConflict({
          date,
          start_time: startTime,
          end_time: endTime,
          venue: venue.trim(),
          department_id: departmentId,
          exclude_id: activityToEdit?.id,
        });
        setConflictResult(res);
      } catch {
        // Silently handle
      } finally {
        setCheckingConflict(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [date, startTime, endTime, venue, departmentId, activityToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validations
    if (!title.trim() || title.trim().length < 3) {
      setError('Title is required and must be at least 3 characters.');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setError('Description is required and must be at least 10 characters.');
      return;
    }
    if (!date) {
      setError('Date is required.');
      return;
    }
    if (!startTime || !endTime) {
      setError('Both start and end times are required.');
      return;
    }
    if (startTime >= endTime) {
      setError('End time must be later than start time.');
      return;
    }
    if (!venue.trim()) {
      setError('Venue/Location is required.');
      return;
    }
    if (!organizer.trim()) {
      setError('Organizer is required.');
      return;
    }

    if (registrationUrl.trim()) {
      try {
        new URL(registrationUrl.trim());
      } catch {
        setError('Registration URL must be a valid web address starting with http:// or https://');
        return;
      }
    }

    setLoading(true);
    try {
      const payload: Partial<Activity> = {
        title: title.trim(),
        description: description.trim(),
        department_id: Number(departmentId),
        date,
        start_time: startTime,
        end_time: endTime,
        venue: venue.trim(),
        organizer: organizer.trim(),
        status,
        featured: featured ? 1 : 0,
        capacity: capacity ? Number(capacity) : null,
        registration_url: registrationUrl.trim() || null,
        participation_instructions: instructions.trim() || null,
      };

      let savedActivity: Activity;
      if (isEditing && activityToEdit) {
        savedActivity = await updateActivity(activityToEdit.id, payload);
      } else {
        savedActivity = await createActivity(payload);
      }

      onSaved(savedActivity);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save activity record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-heading font-bold text-lg text-slate-900">
              {isEditing ? 'Edit Activity Details' : 'Create New School Activity'}
            </h3>
            <p className="text-xs text-slate-500">
              {isEditing
                ? `Updating database record #${activityToEdit?.id}`
                : 'Centralized activity schedule management'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Schedule Conflict Live Warning Banner */}
          {conflictResult?.hasVenueConflict && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Venue Schedule Conflict Detected!</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                <span className="font-semibold">{venue}</span> is already booked on {date} during this time window:
              </p>
              <ul className="list-disc list-inside text-[11px] font-medium text-amber-950 pl-1">
                {conflictResult.venueConflicts.map((c) => (
                  <li key={c.id}>
                    "{c.title}" ({c.start_time} - {c.end_time})
                  </li>
                ))}
              </ul>
              <p className="text-[10px] text-amber-700 italic">
                Note: Review the schedule or select an alternate venue/time to avoid overlapping campus events.
              </p>
            </div>
          )}

          {/* Basic Info: Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Activity Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Science Olympiad Regional Championship"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              required
            />
          </div>

          {/* Department & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Department / Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Publication Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="published">Published (Visible to Students)</option>
                <option value="draft">Draft (Private to Administrators)</option>
                <option value="completed">Completed (Archived Record)</option>
                <option value="cancelled">Cancelled (Marked with Notice)</option>
              </select>
            </div>
          </div>

          {/* Date, Start Time, End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Start Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                End Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                required
              />
            </div>
          </div>

          {/* Venue & Organizer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Venue / Location <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Auditorium A or Fieldhouse Court 1"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Lead Organizer <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                placeholder="e.g. Prof. Marcus Chen / STEM Club"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide complete event details, schedule expectations, and context for students..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              required
            />
          </div>

          {/* Capacity & Registration URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Attendee Capacity Limit (Optional)
              </label>
              <input
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="e.g. 150"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Registration / RSVP URL (Optional)
              </label>
              <input
                type="url"
                value={registrationUrl}
                onChange={(e) => setRegistrationUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Participation Instructions */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Participation Instructions / Requirements (Optional)
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Safety goggles required. Check-in starts 15 mins prior."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving to Database...' : isEditing ? 'Save Changes' : 'Create Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

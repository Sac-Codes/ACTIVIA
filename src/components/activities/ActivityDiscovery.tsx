import React, { useState } from 'react';
import {
  Search,
  Filter,
  X,
  Calendar,
  Compass,
  Trophy,
  Users,
  MapPin,
  Clock,
  ChevronRight,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  GraduationCap
} from 'lucide-react';
import { Activity, Registration, UserPersona } from '../../types';
import { ACTIVITY_CATEGORIES } from '../../data/mockData';

interface ActivityDiscoveryProps {
  activities: Activity[];
  registrations: Registration[];
  persona: UserPersona;
  onSelectActivity: (activity: Activity) => void;
  selectedCategoryFilter?: string;
  onClearCategoryFilter?: () => void;
}

export const ActivityDiscovery: React.FC<ActivityDiscoveryProps> = ({
  activities,
  registrations,
  persona,
  onSelectActivity,
  selectedCategoryFilter,
  onClearCategoryFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(selectedCategoryFilter || 'all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Filter activities
  const filteredActivities = activities.filter(act => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        act.title.toLowerCase().includes(q) ||
        act.description.toLowerCase().includes(q) ||
        act.venue.toLowerCase().includes(q) ||
        act.categoryName.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Category
    if (selectedCategory !== 'all' && act.category !== selectedCategory) {
      return false;
    }

    // Format
    if (selectedFormat !== 'all' && act.participationFormat !== selectedFormat) {
      return false;
    }

    // Grade
    if (selectedGrade !== 'all' && act.eligibleGrades && !act.eligibleGrades.includes(selectedGrade)) {
      return false;
    }

    // Status
    if (selectedStatus === 'registered') {
      const isReg = registrations.some(r => r.activityId === act.id && r.studentId === persona.id);
      if (!isReg) return false;
    } else if (selectedStatus === 'bookmarked') {
      if (!bookmarkedIds.includes(act.id)) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl border border-app-border p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-app-text">
            Activity Discovery Hub
          </h2>
          <p className="text-xs sm:text-sm text-app-muted mt-1">
            Browse through {activities.length} authorized school activities, inter-school competitions, and co-curricular workshops.
          </p>
        </div>

        {/* Quick Filter Reset */}
        {(selectedCategory !== 'all' || selectedFormat !== 'all' || selectedGrade !== 'all' || selectedStatus !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedFormat('all');
              setSelectedGrade('all');
              setSelectedStatus('all');
              setSearchQuery('');
              if (onClearCategoryFilter) onClearCategoryFilter();
            }}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-app-secondary hover:bg-white text-xs font-medium text-app-muted hover:text-app-text border border-app-border transition-colors flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            Clear Active Filters
          </button>
        )}
      </div>

      {/* Category Filter Pills Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white font-semibold shadow-xs'
              : 'bg-white text-app-muted hover:text-app-text hover:bg-app-secondary border border-app-border'
          }`}
        >
          <span>All Disciplines</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-app-secondary text-app-subtle'}`}>
            {activities.length}
          </span>
        </button>

        {ACTIVITY_CATEGORIES.map(cat => {
          const count = activities.filter(a => a.category === cat.id).length;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'bg-white text-app-muted hover:text-app-text hover:bg-app-secondary border border-app-border'
              }`}
            >
              <span>{cat.shortName}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSelected ? 'bg-white/20 text-white' : 'bg-app-secondary text-app-subtle'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Secondary Filter Bar */}
      <div className="bg-white rounded-xl border border-app-border p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-app-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, teacher, keywords, or location..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-app-secondary focus:bg-white border border-app-border text-xs text-app-text placeholder:text-app-muted focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Format */}
          <select
            value={selectedFormat}
            onChange={e => setSelectedFormat(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white border border-app-border text-xs text-app-text focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          >
            <option value="all">Format: All</option>
            <option value="individual">Individual</option>
            <option value="team">Team Collaboration</option>
          </select>

          {/* Grade Eligibility */}
          <select
            value={selectedGrade}
            onChange={e => setSelectedGrade(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white border border-app-border text-xs text-app-text focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          >
            <option value="all">Grade: All</option>
            <option value="Grade 9">Grade 9</option>
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 12">Grade 12</option>
          </select>

          {/* Participation Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white border border-app-border text-xs text-app-text focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          >
            <option value="all">Filter: All Activities</option>
            <option value="registered">My Registered Events</option>
            <option value="bookmarked">Bookmarked</option>
          </select>
        </div>
      </div>

      {/* Activity Cards Grid */}
      {filteredActivities.length === 0 ? (
        <div className="p-16 text-center rounded-xl bg-white border border-app-border shadow-xs">
          <AlertCircle className="w-10 h-10 text-app-muted mx-auto mb-3" />
          <h3 className="text-base font-semibold text-app-text">No activities match your filters</h3>
          <p className="text-xs text-app-muted mt-1 max-w-sm mx-auto">
            Try broadening your search criteria or resetting filters to view all scheduled events.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedFormat('all');
              setSelectedGrade('all');
              setSelectedStatus('all');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors inline-block"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredActivities.map(act => {
            const isRegistered = registrations.some(
              r => r.activityId === act.id && r.studentId === persona.id && r.status !== 'cancelled'
            );
            const isBookmarked = bookmarkedIds.includes(act.id);
            const seatsRemaining = act.totalSeats ? Math.max(0, act.totalSeats - act.seatsTaken) : null;

            return (
              <div
                key={act.id}
                onClick={() => onSelectActivity(act)}
                className="bg-white rounded-xl border border-app-border hover:border-indigo-300 shadow-xs hover:shadow-card-hover transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div className="p-5 space-y-3">
                  {/* Category & Status Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {act.categoryName || 'Activity'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isRegistered && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Enrolled
                        </span>
                      )}
                      <button
                        onClick={e => toggleBookmark(act.id, e)}
                        className={`p-1.5 rounded-md transition-colors ${
                          isBookmarked ? 'text-amber-500 bg-amber-50' : 'text-app-muted hover:text-app-text hover:bg-app-secondary'
                        }`}
                        title={isBookmarked ? 'Remove bookmark' : 'Bookmark event'}
                      >
                        <Bookmark className="w-3.5 h-3.5" fill={isBookmarked ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-app-text group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {act.title}
                    </h3>
                    <p className="text-xs text-app-muted leading-relaxed line-clamp-2 mt-1.5">
                      {act.description}
                    </p>
                  </div>

                  {/* Date, Time & Location Specs */}
                  <div className="pt-2 border-t border-app-border-subtle space-y-1.5 text-xs text-app-muted">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-app-subtle flex-shrink-0" />
                      <span>{act.date} • {act.startTime || '09:00'} - {act.endTime || '11:00'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-app-subtle flex-shrink-0" />
                      <span className="truncate">{act.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-app-subtle flex-shrink-0" />
                      <span className="capitalize">{act.participationFormat} • Organizer: {act.organizer}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="px-5 py-3.5 bg-app-secondary/50 border-t border-app-border flex items-center justify-between rounded-b-xl">
                  {seatsRemaining !== null ? (
                    <span className="text-[11px] font-medium text-app-muted">
                      <span className="font-bold text-app-text">{seatsRemaining}</span> seats open
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-emerald-700">Open Admission</span>
                  )}

                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:text-indigo-800 transition-colors">
                    <span>View & Apply</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

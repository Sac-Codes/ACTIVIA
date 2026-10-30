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
  Sparkles,
  ChevronRight,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  GraduationCap
} from 'lucide-react';
import { Activity, ActivityCategory, Registration, UserPersona } from '../../types';
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

    // Format (individual vs team)
    if (selectedFormat !== 'all' && act.participationFormat !== selectedFormat) {
      return false;
    }

    // Grade
    if (selectedGrade !== 'all' && !act.eligibleGrades.includes(selectedGrade)) {
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
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-activia-cyan flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            Official Extracurricular Directory
          </span>
          <h2 className="text-2xl font-bold font-display text-white mt-0.5">
            Activity Discovery Centre
          </h2>
          <p className="text-xs text-activia-muted mt-1">
            Browse and filter through {activities.length} authorized school activities, competitions, and workshops.
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
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-activia-surface hover:bg-white/10 text-xs text-activia-muted hover:text-white border border-activia-border transition-colors flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            Clear Active Filters
          </button>
        )}
      </div>

      {/* Category Pills Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedCategory === 'all'
              ? 'bg-activia-blue text-white shadow-lg shadow-activia-blue/30'
              : 'bg-activia-surface hover:bg-activia-elevated text-activia-muted hover:text-white border border-activia-border'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          All Sectors ({activities.length})
        </button>

        {ACTIVITY_CATEGORIES.map(cat => {
          const count = activities.filter(a => a.category === cat.id).length;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-activia-blue text-white shadow-lg shadow-activia-blue/30'
                  : 'bg-activia-surface hover:bg-activia-elevated text-activia-muted hover:text-white border border-activia-border'
              }`}
            >
              <span>{cat.shortName}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSelected ? 'bg-white/20 text-white' : 'bg-white/5 text-activia-muted'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Advanced Filter Controls Bar */}
      <div className="p-4 rounded-2xl bg-activia-surface border border-activia-border/80 shadow-lg flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-activia-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search title, keywords, teacher, venue..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-activia-elevated/70 border border-activia-border text-xs text-white placeholder:text-activia-muted focus:outline-none focus:border-activia-blue"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Format */}
          <select
            value={selectedFormat}
            onChange={e => setSelectedFormat(e.target.value)}
            className="px-3 py-2 rounded-xl bg-activia-elevated/70 border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue"
          >
            <option value="all">Participation: All</option>
            <option value="individual">Individual Only</option>
            <option value="team">Team Only</option>
          </select>

          {/* Grade Eligibility */}
          <select
            value={selectedGrade}
            onChange={e => setSelectedGrade(e.target.value)}
            className="px-3 py-2 rounded-xl bg-activia-elevated/70 border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue"
          >
            <option value="all">Eligible Grade: All</option>
            <option value="Grade 9">Grade 9</option>
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 12">Grade 12</option>
          </select>

          {/* Enrollment status */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-activia-elevated/70 border border-activia-border text-xs text-white focus:outline-none focus:border-activia-blue"
          >
            <option value="all">Status: All Opportunities</option>
            <option value="registered">My Registered Events</option>
            <option value="bookmarked">Bookmarked Events</option>
          </select>
        </div>
      </div>

      {/* Activity Cards Grid */}
      {filteredActivities.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-activia-surface/50 border border-activia-border/50">
          <Compass className="w-10 h-10 text-activia-muted mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-white font-display">No Matching Activities Found</h3>
          <p className="text-xs text-activia-muted mt-1 max-w-md mx-auto">
            Try adjusting your search query, clearing grade filters, or browsing other activity sectors.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map(act => {
            const reg = registrations.find(r => r.activityId === act.id && r.studentId === persona.id);
            const isBookmarked = bookmarkedIds.includes(act.id);
            const isFull = act.totalSeats ? act.seatsTaken >= act.totalSeats : false;

            return (
              <div
                key={act.id}
                onClick={() => onSelectActivity(act)}
                className="group rounded-3xl bg-activia-surface/90 border border-activia-border/70 hover:border-activia-blue/60 hover:shadow-glow-blue transition-all duration-300 flex flex-col overflow-hidden cursor-pointer shadow-lg"
              >
                {/* Poster Image */}
                <div className="h-44 w-full relative overflow-hidden bg-activia-dark">
                  <img
                    src={act.posterUrl}
                    alt={act.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-activia-surface via-transparent to-black/40" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/10">
                      {act.categoryName}
                    </span>
                    <button
                      onClick={e => toggleBookmark(act.id, e)}
                      className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${
                        isBookmarked ? 'bg-amber-500 text-white' : 'bg-black/50 text-white/70 hover:text-white'
                      }`}
                      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Opportunity'}
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>

                  {/* Format & Capacity badge */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-activia-blue/80 backdrop-blur-md text-white">
                      {act.participationFormat}
                    </span>
                    {act.isCompetition && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/80 backdrop-blur-md text-white">
                        Competition
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-activia-blue transition-colors line-clamp-1 font-display">
                      {act.title}
                    </h3>
                    <p className="text-xs text-activia-muted mt-1 line-clamp-2 leading-relaxed">
                      {act.description}
                    </p>
                  </div>

                  {/* Metadata Specs */}
                  <div className="space-y-2 pt-2 border-t border-white/5 text-xs text-activia-muted">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-white/80">
                        <Calendar className="w-3.5 h-3.5 text-activia-cyan" />
                        {act.date}
                      </span>
                      <span className="flex items-center gap-1.5 text-white/80">
                        <Clock className="w-3.5 h-3.5 text-activia-purple" />
                        {act.startTime}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-white/80 truncate max-w-[180px]">
                        <MapPin className="w-3.5 h-3.5 text-activia-amber flex-shrink-0" />
                        {act.venue}
                      </span>
                      <span className="text-[11px] text-activia-muted">
                        {act.cost}
                      </span>
                    </div>

                    {/* Capacity Progress Bar */}
                    {act.totalSeats && (
                      <div className="pt-1">
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span>Seats: {act.seatsTaken}/{act.totalSeats}</span>
                          <span className={isFull ? 'text-activia-rose font-bold' : 'text-activia-mint'}>
                            {isFull ? 'Waitlist Mode' : `${act.totalSeats - act.seatsTaken} Available`}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isFull ? 'bg-activia-rose' : 'bg-activia-blue'
                            }`}
                            style={{ width: `${Math.min(100, (act.seatsTaken / act.totalSeats) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Registration state or CTA */}
                  <div className="pt-2 flex items-center justify-between">
                    {reg ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-activia-mint/20 text-activia-mint border border-activia-mint/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {reg.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-[11px] text-activia-muted">
                        Deadline: {act.registrationDeadline}
                      </span>
                    )}

                    <span className="text-xs text-activia-blue group-hover:text-activia-cyan font-semibold flex items-center gap-1 transition-colors">
                      View Details <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

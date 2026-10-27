import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  X,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  Clock,
  ArrowUpDown,
  CalendarX,
  FileSpreadsheet,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ActivityCard } from './components/ActivityCard';
import { ActivityModal } from './components/ActivityModal';
import { ScheduleView } from './components/ScheduleView';
import { DepartmentDirectory } from './components/DepartmentDirectory';
import { AboutPlatform } from './components/AboutPlatform';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ActivityFormModal } from './components/ActivityFormModal';

import { Activity, Department, ActivityStats, AdminUser } from './types';
import {
  fetchActivities,
  fetchDepartments,
  fetchActivityStats,
  getCurrentUser,
  logout,
  fetchActivityById,
} from './api';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'activities' | 'schedule' | 'departments' | 'about' | 'admin'>('activities');

  const [activities, setActivities] = useState<Activity[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authentication
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Discovery Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('upcoming');
  const [statusFilter, setStatusFilter] = useState<string>('published');
  const [sortOrder, setSortOrder] = useState<string>('date_asc');

  // Modals
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activityFormOpen, setActivityFormOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);

  // Boot check: current user & departments
  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) setCurrentUser(user);
    });

    fetchDepartments()
      .then((depts) => setDepartments(depts))
      .catch((err) => console.error('Failed to load departments', err));
  }, []);

  // Check URL query parameters on load (e.g., ?activity=2)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const actId = params.get('activity');
    if (actId) {
      fetchActivityById(Number(actId))
        .then((act) => setSelectedActivity(act))
        .catch(() => {});
    }
  }, []);

  // Load public activities & stats
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [acts, st] = await Promise.all([
        fetchActivities({
          search: searchQuery,
          department_id: selectedDeptId || undefined,
          date_filter: dateFilter !== 'all' ? dateFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          sort: sortOrder,
        }),
        fetchActivityStats(),
      ]);
      setActivities(acts);
      setStats(st);
    } catch (err: any) {
      setError(err.message || 'Failed to load school activities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, selectedDeptId, dateFilter, statusFilter, sortOrder]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedDeptId('');
    setDateFilter('upcoming');
    setStatusFilter('published');
    setSortOrder('date_asc');
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    if (currentTab === 'admin') {
      setCurrentTab('activities');
    }
    loadData();
  };

  const handleOpenEdit = (act: Activity) => {
    setActivityToEdit(act);
    setActivityFormOpen(true);
  };

  const handleOpenCreate = () => {
    setActivityToEdit(null);
    setActivityFormOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onOpenLogin={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
        upcomingCount={stats?.upcomingCount}
      />

      {/* Main Content Areas */}
      <main className="flex-1">
        {/* TAB: Activities (Discovery Dashboard) */}
        {currentTab === 'activities' && (
          <div>
            {/* Hero Section with Database-Derived Stats */}
            <HeroSection
              stats={stats}
              onExplore={() => {
                const el = document.getElementById('discovery-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onViewSchedule={() => setCurrentTab('schedule')}
            />

            {/* Discovery Section */}
            <div id="discovery-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              {/* Section Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Real-Time Campus Feed</span>
                  </div>
                  <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Activity Discovery
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Filter by faculty, upcoming dates, or search by keywords.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={loadData}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh Feed</span>
                  </button>
                </div>
              </div>

              {/* Filter Controls Bar */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs mb-8 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by activity title, venue, lead organizer, or description..."
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-2.5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filter Pills Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* Department Select */}
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={selectedDeptId}
                        onChange={(e) => setSelectedDeptId(e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-indigo-600"
                      >
                        <option value="">All Departments</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Date Filter Select */}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-indigo-600"
                      >
                        <option value="upcoming">Upcoming Only</option>
                        <option value="today">Today</option>
                        <option value="this_week">Next 7 Days</option>
                        <option value="all">All Dates</option>
                        <option value="past">Past Events</option>
                      </select>
                    </div>

                    {/* Status Select */}
                    <div className="flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-indigo-600"
                      >
                        <option value="published">Published</option>
                        <option value="all">All Statuses</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    {/* Sort Order */}
                    <div className="flex items-center gap-1.5">
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-indigo-600"
                      >
                        <option value="date_asc">Date (Earliest First)</option>
                        <option value="date_desc">Date (Latest First)</option>
                        <option value="title_asc">Title (A-Z)</option>
                      </select>
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  {(searchQuery || selectedDeptId || dateFilter !== 'upcoming' || statusFilter !== 'published') && (
                    <button
                      onClick={handleClearFilters}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Activity Cards Grid */}
              {loading ? (
                <div className="py-24 text-center">
                  <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-sm font-medium text-slate-500">Querying database records...</p>
                </div>
              ) : activities.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-2xs">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                    <CalendarX className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading font-bold text-base text-slate-900">
                    No matching activities found
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    We couldn't find any activities matching your selected filters or search keyword. Try clearing some filters.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="mt-5 px-4 py-2 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-200"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activities.map((act) => (
                    <ActivityCard
                      key={act.id}
                      activity={act}
                      onSelect={(activity) => setSelectedActivity(activity)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Schedule (Timeline Agenda View) */}
        {currentTab === 'schedule' && (
          <ScheduleView
            activities={activities}
            onSelectActivity={(activity) => setSelectedActivity(activity)}
          />
        )}

        {/* TAB: Departments Directory */}
        {currentTab === 'departments' && (
          <DepartmentDirectory
            departments={departments}
            onSelectDepartment={(deptId) => {
              setSelectedDeptId(String(deptId));
              setCurrentTab('activities');
              window.scrollTo({ top: 500, behavior: 'smooth' });
            }}
          />
        )}

        {/* TAB: Platform Info & Architecture */}
        {currentTab === 'about' && <AboutPlatform />}

        {/* TAB: Protected Administrator Dashboard */}
        {currentTab === 'admin' && (
          currentUser ? (
            <AdminDashboard
              currentUser={currentUser}
              departments={departments}
              onOpenCreate={handleOpenCreate}
              onOpenEdit={handleOpenEdit}
              onRefreshData={() => {
                loadData();
              }}
            />
          ) : (
            <div className="max-w-md mx-auto px-4 py-20 text-center">
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
                <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">
                  Administrator Access Required
                </h3>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  The management dashboard requires authorized staff credentials. Please sign in to manage activities, resolve schedule conflicts, and inspect the database.
                </p>
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs"
                >
                  Sign In to Admin Portal
                </button>
              </div>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-heading font-extrabold text-slate-900">CampusFlow</span>
            <span>•</span>
            <span>Competition-Ready School Activity Coordination Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentTab('about')}
              className="hover:text-indigo-600 transition-colors"
            >
              Architecture & Judging Notes
            </button>
            <span>•</span>
            <a
              href="/api/activities/export/csv"
              className="inline-flex items-center gap-1 hover:text-indigo-600"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ActivityModal
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />

      <AdminLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setCurrentTab('admin');
          loadData();
        }}
      />

      <ActivityFormModal
        isOpen={activityFormOpen}
        onClose={() => setActivityFormOpen(false)}
        activityToEdit={activityToEdit}
        departments={departments}
        onSaved={async () => {
          await loadData();
        }}
      />
    </div>
  );
};

export default App;

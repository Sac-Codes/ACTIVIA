import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Database,
  History,
  TrendingUp,
  Layers,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Server,
} from 'lucide-react';
import {
  Activity,
  Department,
  ActivityStats,
  DbInspectorData,
  AuditLog,
  AdminUser,
} from '../types';
import {
  fetchActivities,
  deleteActivity,
  fetchActivityStats,
  fetchDbInspector,
  fetchAuditLogs,
  resetDemoData,
} from '../api';
import { formatDateLabel, formatTimeRange, getStatusBadge } from '../utils';

interface AdminDashboardProps {
  currentUser: AdminUser;
  departments: Department[];
  onOpenCreate: () => void;
  onOpenEdit: (activity: Activity) => void;
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  departments,
  onOpenCreate,
  onOpenEdit,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'activities' | 'conflicts' | 'inspector' | 'audit'>('activities');

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('date_asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Stats
  const [stats, setStats] = useState<ActivityStats | null>(null);

  // DB Inspector & Audit state
  const [inspectorData, setInspectorData] = useState<DbInspectorData | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [inspectorLoading, setInspectorLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string>('activities');

  // Deletion modal state
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Reset confirmation state
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Load activities & stats
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [acts, st] = await Promise.all([
        fetchActivities({
          search: searchTerm,
          department_id: selectedDept || undefined,
          status: selectedStatus || undefined,
          sort: sortOrder,
        }),
        fetchActivityStats(),
      ]);
      setActivities(acts);
      setStats(st);
    } catch (err: any) {
      setError(err.message || 'Failed to load administrator data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, selectedDept, selectedStatus, sortOrder]);

  // Load inspector when switching to inspector tab
  useEffect(() => {
    if (activeTab === 'inspector') {
      setInspectorLoading(true);
      fetchDbInspector()
        .then((data) => setInspectorData(data))
        .catch((err) => setError(err.message))
        .finally(() => setInspectorLoading(false));
    } else if (activeTab === 'audit') {
      fetchAuditLogs()
        .then((logs) => setAuditLogs(logs))
        .catch((err) => setError(err.message));
    }
  }, [activeTab]);

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!activityToDelete) return;
    setDeleting(true);
    try {
      await deleteActivity(activityToDelete.id);
      setActivityToDelete(null);
      await loadData();
      onRefreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete activity');
    } finally {
      setDeleting(false);
    }
  };

  // Handle Demo Reset
  const handleResetDemo = async () => {
    setResetting(true);
    try {
      await resetDemoData();
      setShowResetConfirm(false);
      await loadData();
      onRefreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to reset demo dataset');
    } finally {
      setResetting(false);
    }
  };

  // Pagination calculation
  const totalPages = Math.ceil(activities.length / itemsPerPage) || 1;
  const paginatedActivities = activities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Top Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Protected Administrator Console
            </span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Activity Management Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Logged in as <span className="font-semibold text-slate-800">{currentUser.fullName}</span> ({currentUser.username}) • Role: {currentUser.role}
          </p>
        </div>

        {/* Action Buttons: Add Activity & Reset Demo */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
            title="Reset to fresh competition seed data"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={onOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs shadow-indigo-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Activity</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('activities')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'activities'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Activity Records & Table ({activities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inspector')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'inspector'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Database Inspector (SQLite Engine)</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Log Trail</span>
        </button>
      </div>

      {/* TAB 1: Activity Records Table & CRUD */}
      {activeTab === 'activities' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Records</span>
                <span className="text-xl font-extrabold text-slate-900">{stats.totalActivities}</span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-emerald-600 block">Published</span>
                <span className="text-xl font-extrabold text-emerald-700">{stats.publishedCount}</span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-indigo-600 block">Upcoming</span>
                <span className="text-xl font-extrabold text-indigo-700">{stats.upcomingCount}</span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-amber-600 block">Private Drafts</span>
                <span className="text-xl font-extrabold text-amber-700">{stats.draftCount}</span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Completed</span>
                <span className="text-xl font-extrabold text-slate-700">{stats.completedCount}</span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-rose-600 block">Cancelled</span>
                <span className="text-xl font-extrabold text-rose-700">{stats.cancelledCount}</span>
              </div>
            </div>
          )}

          {/* Table Controls / Filters */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search activities by title, venue, organizer..."
                className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Department */}
              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-700 font-medium"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>

              {/* Status */}
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-700 font-medium"
              >
                <option value="all">All Statuses (inc. Drafts)</option>
                <option value="published">Published Only</option>
                <option value="draft">Drafts Only</option>
                <option value="completed">Completed Only</option>
                <option value="cancelled">Cancelled Only</option>
              </select>

              {/* Sort */}
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-700 font-medium"
              >
                <option value="date_asc">Date (Earliest First)</option>
                <option value="date_desc">Date (Latest First)</option>
                <option value="title_asc">Title (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Activity Data Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Title & Details</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Schedule</th>
                    <th className="py-3 px-4">Venue</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        Loading database records...
                      </td>
                    </tr>
                  ) : paginatedActivities.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        No activities match the selected search criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedActivities.map((act) => {
                      const statusInfo = getStatusBadge(act.status);
                      const deptColor = act.department_color || '#4f46e5';

                      return (
                        <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Title */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <span className="font-bold text-slate-900 block truncate">
                              {act.title}
                            </span>
                            <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                              {act.organizer}
                            </span>
                          </td>

                          {/* Department */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold"
                              style={{
                                backgroundColor: `${deptColor}15`,
                                color: deptColor,
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: deptColor }}
                              />
                              {act.department_name || act.department_code}
                            </span>
                          </td>

                          {/* Schedule */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-semibold text-slate-800 block">
                              {act.date}
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              {act.start_time} - {act.end_time}
                            </span>
                          </td>

                          {/* Venue */}
                          <td className="py-3.5 px-4 max-w-[160px] truncate">
                            <span className="text-slate-800">{act.venue}</span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusInfo.bg}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                              {statusInfo.label}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onOpenEdit(act)}
                                title="Edit Activity Record"
                                className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-slate-200"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setActivityToDelete(act)}
                                title="Delete Activity Record"
                                className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
                <span>
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, activities.length)} of {activities.length} entries
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 font-semibold">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Database Inspector (Section 11 requirement) */}
      {activeTab === 'inspector' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-heading font-bold text-lg text-slate-900">
                    Live Read-Only Database Inspector
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Direct inspection of persistent SQLite database. All administrator password hashes are masked for demonstration safety.
                </p>
              </div>

              {inspectorData && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-mono">
                    File: {inspectorData.fileSizeKb} KB
                  </span>
                  <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-700 font-semibold">
                    SQLite v{inspectorData.sqliteVersion}
                  </span>
                </div>
              )}
            </div>

            {/* Table Selection Pills */}
            {inspectorData && (
              <div className="mt-4 flex flex-wrap gap-2">
                {Object.keys(inspectorData.tables).map((tableName) => {
                  const tableInfo = inspectorData.tables[tableName];
                  const isSelected = selectedTable === tableName;

                  return (
                    <button
                      key={tableName}
                      onClick={() => setSelectedTable(tableName)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>{tableName}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        isSelected ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {tableInfo.rowCount} rows
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Table Schema & Sample Rows */}
            {inspectorLoading ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Querying database schema...
              </div>
            ) : inspectorData && inspectorData.tables[selectedTable] ? (
              <div className="mt-6 space-y-4">
                {/* Columns schema info */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Table Schema: {selectedTable}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {inspectorData.tables[selectedTable].columns.map((col: any) => (
                      <span
                        key={col.name}
                        className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono text-slate-700"
                      >
                        {col.isPk && <span className="text-amber-600 font-bold mr-1">PK</span>}
                        <span className="font-semibold text-slate-900">{col.name}</span>: {col.type}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sample records table */}
                <div className="border border-slate-200 rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-500">
                      <tr>
                        {inspectorData.tables[selectedTable].columns.map((col: any) => (
                          <th key={col.name} className="py-2 px-3 whitespace-nowrap">
                            {col.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inspectorData.tables[selectedTable].sampleRows.map((row: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          {inspectorData.tables[selectedTable].columns.map((col: any) => (
                            <td key={col.name} className="py-2 px-3 whitespace-nowrap max-w-[200px] truncate text-slate-700">
                              {col.name === 'password_hash' ? (
                                <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-sans text-[10px]">
                                  [PROTECTED_SCRYPT_HASH]
                                </span>
                              ) : row[col.name] !== null && row[col.name] !== undefined ? (
                                String(row[col.name])
                              ) : (
                                <span className="text-slate-300 italic">NULL</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB 3: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900">
                Administrative Audit Log
              </h3>
              <p className="text-xs text-slate-500">
                Immutable record of administrative mutations, logins, and schema modifications.
              </p>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-500 font-bold">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Admin</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Entity</th>
                  <th className="py-2.5 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-500">
                      {log.created_at}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-semibold text-slate-800">
                      {log.admin_username}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action === 'CREATE'
                          ? 'bg-emerald-50 text-emerald-700'
                          : log.action === 'UPDATE'
                          ? 'bg-indigo-50 text-indigo-700'
                          : log.action === 'DELETE'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 font-medium">
                      {log.entity}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 max-w-md truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {activityToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900">
                Delete Activity Record?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <span className="font-bold text-slate-900">"{activityToDelete.title}"</span>? This will remove the record from the database and public agenda.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                disabled={deleting}
                onClick={() => setActivityToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Demo Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900">
                Reset Demonstration Dataset?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                This will reset the SQLite database back to the fresh, calibrated competition dataset containing 11 curated activities across all school departments.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                disabled={resetting}
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={resetting}
                onClick={handleResetDemo}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {resetting ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

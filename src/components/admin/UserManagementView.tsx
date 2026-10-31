import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Shield,
  Briefcase,
  UserCheck,
  CheckCircle2,
  Clock,
  Ban,
  Trash2,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  UserX,
  Mail,
  GraduationCap
} from 'lucide-react';
import { UserRole, UserAccountStatus, ROLE_LABELS } from '../../types';

interface ManagedUser {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: UserRole;
  status: UserAccountStatus;
  grade?: string;
  class_name?: string;
  stream?: string;
  student_id?: string;
  house?: string;
  created_at: string;
}

interface UserManagementViewProps {
  currentAdminId?: number | string;
  onNavigate?: (tab: string) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentAdminId
}) => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'role' | 'status' | 'delete';
    userId: number;
    userName: string;
    newVal?: string;
    promptText: string;
  } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await fetch(`/api/users?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to load user accounts.');
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to connect to users service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setActionMessage(data.message || 'Role updated successfully.');
      setTimeout(() => setActionMessage(null), 3000);
      fetchUsers();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update role.');
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setConfirmModal(null);
    }
  };

  const handleStatusChange = async (userId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setActionMessage(data.message || 'Status updated successfully.');
      setTimeout(() => setActionMessage(null), 3000);
      fetchUsers();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update status.');
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setConfirmModal(null);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setActionMessage(data.message || 'User deleted successfully.');
      setTimeout(() => setActionMessage(null), 3000);
      fetchUsers();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete user.');
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setConfirmModal(null);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    if (role === 'admin' || role === 'coordinator') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Shield className="w-3 h-3 text-indigo-600" /> Admin — Principal
        </span>
      );
    }
    if (role === 'editor' || role === 'teacher') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
          <Briefcase className="w-3 h-3 text-teal-600" /> Editor — Teacher
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        <UserCheck className="w-3 h-3 text-blue-600" /> Viewer — Student
      </span>
    );
  };

  const getStatusBadge = (status: UserAccountStatus) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
        </span>
      );
    }
    if (status === 'pending_approval') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" /> Pending Approval
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
        <Ban className="w-3 h-3 text-red-600" /> Suspended
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-app-border p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-app-brand flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-app-text">
              User & Identity Management
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-app-muted mt-1">
            Principal control panel to manage staff and student accounts, assign roles, approve pending enrollments, and audit permissions.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchUsers}
          className="px-3.5 py-2 rounded-xl border border-app-border bg-app-secondary hover:bg-gray-100 text-xs font-semibold text-app-text flex items-center gap-1.5 transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Action / Error Banners */}
      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-app-border p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-app-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student/staff name, username, email, or Student ID..."
            className="w-full pl-9 pr-24 py-2 bg-app-secondary border border-app-border rounded-xl text-xs sm:text-sm text-app-text placeholder:text-app-subtle focus:outline-none focus:border-app-brand focus:ring-1 focus:ring-indigo-100"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-app-brand text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-app-border bg-app-secondary text-xs font-medium text-app-text focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin — Principal</option>
            <option value="editor">Editor — Teacher</option>
            <option value="viewer">Viewer — Student</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-app-border bg-app-secondary text-xs font-medium text-app-text focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-app-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-app-secondary border-b border-app-border text-[11px] font-bold text-app-muted uppercase tracking-wider">
                <th className="px-5 py-3.5">User & Identity</th>
                <th className="px-4 py-3.5">Assigned Role</th>
                <th className="px-4 py-3.5">Account Status</th>
                <th className="px-4 py-3.5">Academic Cohort</th>
                <th className="px-4 py-3.5">Registered Date</th>
                <th className="px-5 py-3.5 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-app-muted">
                    <div className="w-6 h-6 border-2 border-app-brand/30 border-t-app-brand rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading institutional user registry...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-app-muted">
                    <Users className="w-10 h-10 text-app-subtle mx-auto mb-2" />
                    <p className="font-semibold text-app-text">No user accounts found</p>
                    <p className="text-xs text-app-muted mt-0.5">Try adjusting your search criteria or role filters.</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelf = currentAdminId && String(u.id) === String(currentAdminId);
                  const isRootAdmin = u.username === 'admin';

                  return (
                    <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Name & Contact */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-app-secondary border border-app-border flex items-center justify-center font-bold text-app-brand text-xs">
                            {u.full_name ? u.full_name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-app-text flex items-center gap-1.5">
                              <span>{u.full_name}</span>
                              {isSelf && (
                                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-semibold">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-app-muted flex items-center gap-2">
                              <span>@{u.username}</span>
                              <span>•</span>
                              <span>{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getRoleBadge(u.role)}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getStatusBadge(u.status)}
                      </td>

                      {/* Academic Cohort */}
                      <td className="px-4 py-4 whitespace-nowrap text-xs text-app-muted">
                        <div>{u.grade || u.class_name || 'Staff Member'}</div>
                        {u.student_id && <div className="text-[11px] text-app-subtle font-mono">{u.student_id}</div>}
                      </td>

                      {/* Registered Date */}
                      <td className="px-4 py-4 whitespace-nowrap text-xs text-app-muted">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Active'}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Approve Button (if pending) */}
                          {u.status === 'pending_approval' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(u.id, 'active')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 shadow-xs transition-colors"
                              title="Approve student enrollment"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                          )}

                          {/* Role Change: Promote/Demote */}
                          {!isRootAdmin && !isSelf && (
                            <select
                              value={u.role === 'teacher' ? 'editor' : u.role === 'student' ? 'viewer' : u.role}
                              onChange={(e) => {
                                const targetRole = e.target.value;
                                setConfirmModal({
                                  isOpen: true,
                                  type: 'role',
                                  userId: u.id,
                                  userName: u.full_name,
                                  newVal: targetRole,
                                  promptText: `Change ${u.full_name}'s role to ${ROLE_LABELS[targetRole] || targetRole}?`
                                });
                              }}
                              className="px-2 py-1 rounded-lg border border-app-border text-xs bg-white text-app-text hover:border-gray-300 focus:outline-none cursor-pointer"
                              title="Change user role"
                            >
                              <option value="viewer">Viewer — Student</option>
                              <option value="editor">Editor — Teacher</option>
                              <option value="admin">Admin — Principal</option>
                            </select>
                          )}

                          {/* Suspend / Reactivate */}
                          {!isRootAdmin && !isSelf && (
                            u.status === 'suspended' ? (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(u.id, 'active')}
                                className="px-2 py-1 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs font-medium transition-colors"
                                title="Reactivate user"
                              >
                                Reactivate
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmModal({
                                    isOpen: true,
                                    type: 'status',
                                    userId: u.id,
                                    userName: u.full_name,
                                    newVal: 'suspended',
                                    promptText: `Suspend account for ${u.full_name}? The user will be barred from signing in until reactivated.`
                                  });
                                }}
                                className="p-1.5 rounded-lg text-app-muted hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                title="Suspend account"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )
                          )}

                          {/* Delete Account */}
                          {!isRootAdmin && !isSelf && (
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmModal({
                                  isOpen: true,
                                  type: 'delete',
                                  userId: u.id,
                                  userName: u.full_name,
                                  promptText: `Permanently delete ${u.full_name}'s account? This action cannot be reversed.`
                                });
                              }}
                              className="p-1.5 rounded-lg text-app-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-app-border space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-app-text font-display">
                Confirm Administrative Action
              </h3>
              <p className="text-xs text-app-muted mt-2">
                {confirmModal.promptText}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2 px-3 rounded-xl border border-app-border text-xs font-semibold text-app-muted hover:text-app-text bg-app-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmModal.type === 'role' && confirmModal.newVal) {
                    handleRoleChange(confirmModal.userId, confirmModal.newVal);
                  } else if (confirmModal.type === 'status' && confirmModal.newVal) {
                    handleStatusChange(confirmModal.userId, confirmModal.newVal);
                  } else if (confirmModal.type === 'delete') {
                    handleDeleteUser(confirmModal.userId);
                  }
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-white shadow-xs transition-colors ${
                  confirmModal.type === 'delete'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-app-brand hover:bg-indigo-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

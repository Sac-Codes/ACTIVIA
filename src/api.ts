import {
  Activity,
  Department,
  ActivityStats,
  AdminUser,
  ConflictCheckResult,
  DbInspectorData,
  AuditLog,
} from './types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('cf_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchHealth(): Promise<{ status: string; database: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchDepartments(): Promise<Department[]> {
  const res = await fetch(`${API_BASE}/departments`);
  if (!res.ok) throw new Error('Failed to fetch departments');
  const data = await res.json();
  return data.departments;
}

export async function fetchActivities(params?: {
  search?: string;
  department_id?: number | string;
  date_filter?: string;
  date?: string;
  status?: string;
  sort?: string;
}): Promise<Activity[]> {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.department_id) query.append('department_id', String(params.department_id));
  if (params?.date_filter) query.append('date_filter', params.date_filter);
  if (params?.date) query.append('date', params.date);
  if (params?.status) query.append('status', params.status);
  if (params?.sort) query.append('sort', params.sort);

  const res = await fetch(`${API_BASE}/activities?${query.toString()}`, {
    headers: {
      ...getAuthHeader(),
    },
  });
  if (!res.ok) throw new Error('Failed to fetch activities');
  const data = await res.json();
  return data.activities;
}

export async function fetchActivityById(id: number): Promise<Activity> {
  const res = await fetch(`${API_BASE}/activities/${id}`, {
    headers: {
      ...getAuthHeader(),
    },
  });
  if (!res.ok) throw new Error('Activity not found or inaccessible');
  const data = await res.json();
  return data.activity;
}

export async function fetchActivityStats(): Promise<ActivityStats> {
  const res = await fetch(`${API_BASE}/activities/stats`, {
    headers: {
      ...getAuthHeader(),
    },
  });
  if (!res.ok) throw new Error('Failed to load dashboard statistics');
  return res.json();
}

export async function checkActivityConflict(payload: {
  date: string;
  start_time: string;
  end_time: string;
  venue: string;
  department_id?: number;
  exclude_id?: number;
}): Promise<ConflictCheckResult> {
  const res = await fetch(`${API_BASE}/activities/check-conflict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Conflict check failed');
  return res.json();
}

export async function createActivity(payload: Partial<Activity>): Promise<Activity> {
  const res = await fetch(`${API_BASE}/activities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create activity');
  }
  return data.activity;
}

export async function updateActivity(id: number, payload: Partial<Activity>): Promise<Activity> {
  const res = await fetch(`${API_BASE}/activities/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update activity');
  }
  return data.activity;
}

export async function deleteActivity(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/activities/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeader(),
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete activity');
  }
}

// Authentication
export async function login(username: string, password: string): Promise<AdminUser> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Invalid credentials');
  }
  localStorage.setItem('cf_auth_token', data.token);
  return data.user;
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
  });
  localStorage.removeItem('cf_auth_token');
}

export async function getCurrentUser(): Promise<AdminUser | null> {
  const token = localStorage.getItem('cf_auth_token');
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) {
      localStorage.removeItem('cf_auth_token');
      return null;
    }
    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
}

// Admin diagnostics & DB Inspector
export async function fetchDbInspector(): Promise<DbInspectorData> {
  const res = await fetch(`${API_BASE}/admin/db-inspector`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Failed to load database inspector');
  return res.json();
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const res = await fetch(`${API_BASE}/admin/audit-logs`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error('Failed to load audit logs');
  const data = await res.json();
  return data.logs;
}

export async function resetDemoData(): Promise<string> {
  const res = await fetch(`${API_BASE}/admin/reset-demo`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Reset failed');
  return data.message;
}

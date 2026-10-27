export type ActivityStatus = 'draft' | 'published' | 'completed' | 'cancelled';

export interface Department {
  id: number;
  name: string;
  code: string;
  color: string;
  icon: string;
  description: string | null;
  activity_count?: number;
  published_activity_count?: number;
}

export interface Activity {
  id: number;
  title: string;
  description: string;
  department_id: number;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  start_datetime: string;
  end_datetime: string;
  venue: string;
  organizer: string;
  status: ActivityStatus;
  featured: number;
  capacity: number | null;
  registration_url: string | null;
  participation_instructions: string | null;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
  department_name?: string;
  department_code?: string;
  department_color?: string;
  department_icon?: string;
}

export interface ActivityStats {
  totalActivities: number;
  upcomingCount: number;
  publishedCount: number;
  completedCount: number;
  cancelledCount: number;
  draftCount: number;
  departmentCount: number;
  byDepartment: Array<{
    id: number;
    name: string;
    code: string;
    color: string;
    count: number;
  }>;
  topVenues: Array<{
    venue: string;
    count: number;
  }>;
  busiestUpcomingDate: {
    date: string;
    count: number;
  } | null;
}

export interface AdminUser {
  id: number;
  username: string;
  fullName: string;
  role: string;
}

export interface ConflictCheckResult {
  hasVenueConflict: boolean;
  venueConflicts: Array<{
    id: number;
    title: string;
    start_time: string;
    end_time: string;
    venue: string;
    department_name: string;
  }>;
  hasDepartmentOverlap: boolean;
  departmentOverlaps: Array<{
    id: number;
    title: string;
    start_time: string;
    end_time: string;
    venue: string;
  }>;
}

export interface TableInspection {
  tableName: string;
  rowCount: number;
  columns: Array<{
    name: string;
    type: string;
    notNull: boolean;
    isPk: boolean;
  }>;
  sampleRows: any[];
}

export interface DbInspectorData {
  dbPath: string;
  fileSizeKb: number;
  sqliteVersion: string;
  tables: Record<string, TableInspection>;
  inspectedAt: string;
}

export interface AuditLog {
  id: number;
  admin_id: number;
  admin_username: string;
  action: string;
  entity: string;
  entity_id: number | null;
  details: string;
  created_at: string;
}

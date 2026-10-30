import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Building,
  Compass,
  Trophy,
  Users,
  Calendar,
  Bell,
  MessageSquarePlus,
  Award,
  CheckCircle,
  FileSpreadsheet,
  SlidersHorizontal,
  Shield,
  Layers,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Building2,
  ScrollText,
  Activity as ActivityIcon
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  onNavigate: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  pendingApprovalsCount?: number;
  unreadAnnouncementsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  activeTab,
  onNavigate,
  collapsed,
  onToggleCollapse,
  pendingApprovalsCount = 0,
  unreadAnnouncementsCount = 0,
}) => {
  // Navigation sections based on active role
  const studentNavItems = [
    { id: 'dashboard', label: 'Student Home', icon: LayoutDashboard },
    { id: 'galaxy', label: '3D Activity Galaxy', icon: Sparkles, highlight: true },
    { id: 'campus', label: '3D Campus Map', icon: Building },
    { id: 'activities', label: 'Activity Discovery', icon: Compass },
    { id: 'competitions', label: 'My Competitions & Teams', icon: Trophy },
    { id: 'clubs', label: 'Clubs & House Standings', icon: Users },
    { id: 'calendar', label: 'Academic Calendar', icon: Calendar },
    { id: 'announcements', label: 'Announcements & Q&A', icon: Bell, badge: unreadAnnouncementsCount },
    { id: 'feedback', label: 'Student Voice & Ideas', icon: MessageSquarePlus },
    { id: 'achievements', label: 'Achievement Portfolio', icon: Award },
  ];

  const teacherNavItems = [
    { id: 'staff_overview', label: 'Mentor Workspace', icon: LayoutDashboard },
    { id: 'staff_approvals', label: 'Registration Approvals', icon: CheckCircle, badge: pendingApprovalsCount },
    { id: 'staff_activities', label: 'Manage Activities', icon: ActivityIcon },
    { id: 'staff_teams', label: 'Supervised Teams', icon: Users },
    { id: 'staff_attendance', label: 'Attendance & Results', icon: UserCheck },
    { id: 'calendar', label: 'Master Schedule', icon: Calendar },
    { id: 'announcements', label: 'Staff Notices', icon: Bell },
  ];

  const adminNavItems = [
    { id: 'admin_command', label: 'Command Centre', icon: Shield },
    { id: 'admin_analytics', label: 'Participation Analytics', icon: FileSpreadsheet },
    { id: 'staff_approvals', label: 'School Approval Queue', icon: CheckCircle, badge: pendingApprovalsCount },
    { id: 'admin_venues', label: 'Venue Bookings & Conflicts', icon: Building2 },
    { id: 'admin_settings', label: 'School Setup & Roles', icon: SlidersHorizontal },
    { id: 'admin_audit', label: 'Security & Audit Logs', icon: ScrollText },
    { id: 'galaxy', label: 'Explore 3D Galaxy', icon: Sparkles },
    { id: 'campus', label: 'Explore 3D Campus', icon: Building },
  ];

  let currentItems = studentNavItems;
  if (role === 'teacher') currentItems = teacherNavItems;
  else if (role === 'coordinator' || role === 'admin') currentItems = adminNavItems;

  return (
    <aside
      className={`relative z-30 flex flex-col border-r border-activia-border/60 bg-activia-dark transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Role Context Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        {!collapsed && (
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-activia-muted">
              Active Workspace
            </span>
            <p className="text-xs font-bold text-white capitalize mt-0.5">
              {role === 'admin' ? 'Administrator Directorate' : role === 'teacher' ? 'Faculty & Mentor Desk' : 'Student Life Portal'}
            </p>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg bg-activia-surface hover:bg-activia-elevated text-activia-muted hover:text-white border border-activia-border transition-colors mx-auto"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {currentItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-activia-blue text-white shadow-lg shadow-activia-blue/30 font-bold'
                  : item.highlight
                  ? 'bg-gradient-to-r from-activia-blue/10 to-activia-purple/10 text-activia-cyan hover:bg-activia-surface border border-activia-blue/20'
                  : 'text-activia-muted hover:text-white hover:bg-activia-surface'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 ${
                  isActive ? 'text-white' : item.highlight ? 'text-activia-blue animate-pulse' : 'text-activia-muted group-hover:text-white'
                }`}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-activia-rose text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Role Switch Hint */}
      {!collapsed && (
        <div className="p-4 border-t border-white/5 bg-activia-surface/40">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-activia-mint animate-pulse" />
            <span className="text-[11px] text-activia-muted">Demonstration Mode Active</span>
          </div>
          <p className="text-[10px] text-activia-muted/70 mt-1">
            Switch persona in top navbar to view different roles.
          </p>
        </div>
      )}
    </aside>
  );
};

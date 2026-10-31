import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Trophy,
  Users,
  Calendar,
  Bell,
  Award,
  FileCheck2,
  FileText,
  HelpCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Briefcase,
  GraduationCap,
  Sparkles,
  BarChart3,
  ScrollText,
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
  schoolName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  activeTab,
  onNavigate,
  collapsed,
  onToggleCollapse,
  pendingApprovalsCount = 0,
  unreadAnnouncementsCount = 0,
  schoolName = 'ACTIVIA Hub',
}) => {
  // Navigation structure adhering strictly to specification
  const viewerNavItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'activities', label: 'Discover Activities', icon: Compass },
    { id: 'competitions', label: 'Competitions', icon: Trophy },
    { id: 'calendar', label: 'Events Calendar', icon: Calendar },
    { id: 'announcements', label: 'Announcements', icon: Bell, badge: unreadAnnouncementsCount },
    { id: 'applications', label: 'My Applications', icon: FileCheck2 },
    { id: 'achievements', label: 'My Achievements', icon: Award },
    { id: 'settings', label: 'My Profile', icon: Settings },
  ];

  const editorNavItems = [
    { id: 'staff_overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'activities', label: 'Manage Activities', icon: Compass },
    { id: 'competitions', label: 'Manage Competitions', icon: Trophy },
    { id: 'calendar', label: 'Events', icon: Calendar },
    { id: 'clubs', label: 'Clubs', icon: Users },
    { id: 'announcements', label: 'Announcements', icon: Bell },
    { id: 'applications', label: 'Student Applications', icon: FileCheck2, badge: pendingApprovalsCount },
    { id: 'settings', label: 'My Profile', icon: Settings },
  ];

  const adminNavItems = [
    { id: 'admin_command', label: 'Overview', icon: LayoutDashboard },
    { id: 'admin_users', label: 'User Management', icon: Users },
    { id: 'activities', label: 'Activities', icon: Compass },
    { id: 'competitions', label: 'Competitions', icon: Trophy },
    { id: 'clubs', label: 'Clubs and Events', icon: Users },
    { id: 'announcements', label: 'Announcements', icon: Bell },
    { id: 'applications', label: 'Registrations & Applications', icon: FileCheck2, badge: pendingApprovalsCount },
    { id: 'admin_analytics', label: 'Reports and Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'admin_audit', label: 'Audit Logs', icon: ScrollText },
  ];

  let currentItems = viewerNavItems;
  if (role === 'editor' || role === 'teacher') currentItems = editorNavItems;
  else if (role === 'admin' || role === 'coordinator') currentItems = adminNavItems;

  const getRoleBadge = () => {
    if (role === 'admin' || role === 'coordinator') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
          <Shield className="w-3 h-3" /> Admin — Principal
        </span>
      );
    }
    if (role === 'editor' || role === 'teacher') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-100">
          <Briefcase className="w-3 h-3" /> Editor — Teacher
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
        <GraduationCap className="w-3 h-3" /> Viewer — Student
      </span>
    );
  };

  return (
    <aside
      className={`relative z-30 flex flex-col bg-white border-r border-app-border transition-all duration-300 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-app-border">
        {!collapsed ? (
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate(currentItems[0].id)}>
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="overflow-hidden">
              <span className="font-display font-bold text-base text-app-text tracking-tight block truncate">
                ACTIVIA
              </span>
              <span className="text-[11px] text-app-muted block truncate -mt-0.5">
                School Activity Hub
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-md text-app-muted hover:text-app-text hover:bg-app-secondary border border-transparent hover:border-app-border transition-colors ml-auto"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Role Pill Header */}
      {!collapsed && (
        <div className="px-4 py-3 bg-app-secondary/60 border-b border-app-border/80 flex items-center justify-between">
          <span className="text-[11px] font-medium text-app-muted">Portal Workspace</span>
          {getRoleBadge()}
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {currentItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                  : 'text-app-text hover:bg-app-secondary hover:text-indigo-600'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-app-muted group-hover:text-indigo-600'
                }`}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="ml-auto px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Institutional Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-app-border bg-app-secondary/40">
          <div className="px-2 py-1.5 rounded-md bg-white border border-app-border shadow-xs">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-app-subtle block">
              Institution
            </span>
            <p className="text-xs font-medium text-app-text truncate mt-0.5">
              {schoolName}
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};

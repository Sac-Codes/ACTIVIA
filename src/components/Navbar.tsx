import React, { useState } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  Shield,
  GraduationCap,
  Briefcase,
  Check,
  Plus,
  LogOut,
  Settings as SettingsIcon,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import { UserPersona, SchoolSettings, NotificationItem } from '../types';
import { DEMO_PERSONAS } from '../data/mockData';

interface NavbarProps {
  currentPersona: UserPersona;
  onSwitchPersona: (personaId: string) => void;
  settings: SchoolSettings;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  activeTab: string;
  onNavigate: (tab: string) => void;
  onOpenCreateActivity?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPersona,
  onSwitchPersona,
  settings,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onOpenSearch,
  activeTab,
  onNavigate,
  onOpenCreateActivity,
}) => {
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getPageTitle = (tab: string): { category: string; title: string } => {
    switch (tab) {
      case 'dashboard':
      case 'staff_overview':
      case 'admin_command':
        return { category: 'Overview', title: 'Dashboard' };
      case 'activities':
        return { category: 'Programs', title: 'Discover Activities' };
      case 'competitions':
        return { category: 'Programs', title: 'Competitions & Teams' };
      case 'clubs':
        return { category: 'Campus Life', title: 'Clubs & Societies' };
      case 'calendar':
        return { category: 'Schedule', title: 'Events Calendar' };
      case 'announcements':
        return { category: 'Communication', title: 'Announcements' };
      case 'achievements':
        return { category: 'Records', title: 'My Achievements' };
      case 'applications':
        return { category: 'Registration', title: currentPersona.role === 'student' ? 'My Applications' : 'Review Applications' };
      case 'resources':
        return { category: 'Documentation', title: 'Resources & Handbooks' };
      case 'support':
        return { category: 'Helpdesk', title: 'Help & Support' };
      case 'admin_analytics':
        return { category: 'Governance', title: 'Participation Analytics' };
      case 'admin_audit':
        return { category: 'Security', title: 'Audit Trail' };
      case 'settings':
        return { category: 'Setup', title: 'Institutional Settings' };
      default:
        return { category: 'Portal', title: 'School Activity Universe' };
    }
  };

  const pageInfo = getPageTitle(activeTab);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'student':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <GraduationCap className="w-3 h-3 text-blue-600" /> Student
          </span>
        );
      case 'teacher':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-teal-50 text-teal-700 border border-teal-200">
            <Briefcase className="w-3 h-3 text-teal-600" /> Teacher / Mentor
          </span>
        );
      case 'coordinator':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <SlidersHorizontal className="w-3 h-3 text-amber-600" /> Coordinator
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Shield className="w-3 h-3 text-indigo-600" /> Administrator
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-app-border transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Current Page Breadcrumb & Title */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-medium text-app-muted hidden sm:inline">
            {pageInfo.category}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-app-subtle hidden sm:inline flex-shrink-0" />
          <h1 className="text-base sm:text-lg font-bold text-app-text truncate">
            {pageInfo.title}
          </h1>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={onOpenSearch}
            className="w-full py-2 px-3.5 rounded-lg bg-app-secondary hover:bg-white border border-app-border text-xs text-app-muted hover:text-app-text flex items-center justify-between transition-all shadow-xs group"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-4 h-4 text-app-muted group-hover:text-indigo-600 transition-colors flex-shrink-0" />
              <span className="truncate">Search activities, competitions, clubs, venues...</span>
            </div>
            <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono bg-white rounded border border-app-border text-app-muted shadow-xs">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right Navigation & Context Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search icon */}
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 rounded-lg text-app-muted hover:text-app-text hover:bg-app-secondary border border-app-border transition-colors"
            title="Search"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Contextual Action: Add Activity for Teacher / Admin */}
          {(currentPersona.role === 'admin' || currentPersona.role === 'teacher') && onOpenCreateActivity && (
            <button
              onClick={onOpenCreateActivity}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Activity</span>
            </button>
          )}

          {/* Notifications Drawer */}
          <div className="relative">
            <button
              onClick={() => setNotifDrawerOpen(!notifDrawerOpen)}
              className="relative p-2 rounded-lg text-app-muted hover:text-app-text hover:bg-app-secondary border border-app-border transition-colors"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-[10px] font-bold text-white flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {notifDrawerOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-app-border shadow-dropdown p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-app-border">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-bold text-app-text">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllNotificationsRead}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-app-border-subtle py-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-app-muted text-center py-6">No notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          onMarkNotificationRead(n.id);
                          if (n.actionUrl) onNavigate(n.actionUrl);
                          setNotifDrawerOpen(false);
                        }}
                        className={`p-3 text-left cursor-pointer transition-colors ${
                          n.read ? 'hover:bg-app-secondary opacity-75' : 'bg-indigo-50/50 hover:bg-indigo-50/80 font-medium'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-app-text truncate">{n.title}</span>
                          <span className="text-[10px] text-app-subtle">{n.timestamp}</span>
                        </div>
                        <p className="text-xs text-app-muted leading-relaxed line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
              className="flex items-center gap-2.5 p-1.5 pl-2 rounded-lg bg-white hover:bg-app-secondary border border-app-border transition-all shadow-xs group"
              aria-label="User profile menu"
            >
              <img
                src={currentPersona.avatar}
                alt={currentPersona.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-app-border"
              />
              <div className="text-left hidden lg:block pr-1">
                <p className="text-xs font-semibold text-app-text leading-tight flex items-center gap-1.5">
                  {currentPersona.name}
                </p>
                <p className="text-[10px] text-app-muted leading-tight mt-0.5">
                  {currentPersona.grade ? `${currentPersona.grade} • ${currentPersona.house}` : currentPersona.designation}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-app-muted group-hover:text-app-text transition-colors" />
            </button>

            {/* Profile Menu Dropdown */}
            {personaMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-app-border shadow-dropdown p-3 z-50">
                {/* User Info Header */}
                <div className="p-2 bg-app-secondary/60 rounded-lg border border-app-border mb-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={currentPersona.avatar}
                      alt={currentPersona.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-app-text truncate">{currentPersona.name}</p>
                      <p className="text-[11px] text-app-muted truncate">{currentPersona.email}</p>
                      <div className="mt-1">{getRoleBadge(currentPersona.role)}</div>
                    </div>
                  </div>
                </div>

                {/* Role Switcher for School Demonstration */}
                <div className="pb-2 mb-2 border-b border-app-border">
                  <div className="flex items-center justify-between mb-1.5 px-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-app-muted">
                      Role / Account Switcher
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      LIVE ROLES
                    </span>
                  </div>

                  <div className="space-y-1">
                    {Object.values(DEMO_PERSONAS).map(p => {
                      const isActive = p.id === currentPersona.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            onSwitchPersona(p.id);
                            setPersonaMenuOpen(false);
                          }}
                          className={`p-2 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                            isActive
                              ? 'bg-indigo-50 border border-indigo-200 font-semibold'
                              : 'hover:bg-app-secondary border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={p.avatar}
                              alt={p.name}
                              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs text-app-text truncate">{p.name}</p>
                              <p className="text-[10px] text-app-muted truncate capitalize">{p.role}</p>
                            </div>
                          </div>
                          {isActive && <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Profile Links */}
                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      onNavigate('settings');
                      setPersonaMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-app-text hover:bg-app-secondary transition-colors text-left"
                  >
                    <SettingsIcon className="w-3.5 h-3.5 text-app-muted" />
                    <span>Account & Institutional Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('support');
                      setPersonaMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-app-text hover:bg-app-secondary transition-colors text-left"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-app-muted" />
                    <span>Help & Knowledgebase</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

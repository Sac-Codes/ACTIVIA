import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User,
  Shield,
  GraduationCap,
  Briefcase,
  Check,
  X,
  ExternalLink,
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
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPersona,
  onSwitchPersona,
  settings,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  isDarkMode,
  onToggleTheme,
  onOpenSearch,
  onNavigate,
}) => {
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'student':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1"><GraduationCap className="w-3 h-3" /> Student</span>;
      case 'teacher':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1"><Briefcase className="w-3 h-3" /> Staff / Mentor</span>;
      case 'coordinator':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1"><SlidersHorizontal className="w-3 h-3" /> Coordinator</span>;
      case 'admin':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1"><Shield className="w-3 h-3" /> Administrator</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-activia-border/60 bg-activia-dark/80 backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & School Context */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-activia-blue via-activia-purple to-activia-cyan p-0.5 shadow-glow-blue flex items-center justify-center">
            <div className="w-full h-full bg-activia-dark rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-activia-blue" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-lg text-white tracking-tight">
                ACTIVIA
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-activia-blue/10 text-activia-blue border border-activia-blue/20">
                Universe
              </span>
            </div>
            <p className="text-[11px] text-activia-muted truncate max-w-[200px] sm:max-w-none">
              {settings.schoolName} • {settings.academicYear}
            </p>
          </div>
        </div>

        {/* Global Quick Search Shortcut */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={onOpenSearch}
            className="w-full py-2 px-3.5 rounded-xl bg-activia-surface/80 hover:bg-activia-surface border border-activia-border text-xs text-activia-muted flex items-center justify-between transition-all group shadow-inner"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-activia-muted group-hover:text-activia-blue transition-colors" />
              <span>Search activities, competitions, clubs, locations...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-activia-elevated rounded border border-activia-border text-activia-muted">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search on Mobile */}
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 rounded-xl text-activia-muted hover:text-white hover:bg-activia-surface border border-activia-border transition-colors"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-activia-muted hover:text-white hover:bg-activia-surface border border-activia-border transition-colors"
            title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Midnight Theme'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-activia-blue" />}
          </button>

          {/* Notification Centre Bell */}
          <div className="relative">
            <button
              onClick={() => setNotifDrawerOpen(!notifDrawerOpen)}
              className="relative p-2 rounded-xl text-activia-muted hover:text-white hover:bg-activia-surface border border-activia-border transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-activia-rose text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Drawer */}
            {notifDrawerOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-activia-elevated/95 backdrop-blur-xl border border-activia-border shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-activia-blue" />
                    <span className="text-xs font-bold text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-activia-blue/20 text-activia-blue font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllNotificationsRead}
                      className="text-[11px] text-activia-cyan hover:underline font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 py-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-activia-muted text-center py-6">No notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          onMarkNotificationRead(n.id);
                          if (n.actionUrl) onNavigate(n.actionUrl);
                          setNotifDrawerOpen(false);
                        }}
                        className={`p-2.5 rounded-xl text-left cursor-pointer transition-colors ${
                          n.read ? 'bg-white/[0.02] hover:bg-white/5 opacity-70' : 'bg-activia-blue/10 border border-activia-blue/20 hover:bg-activia-blue/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-white truncate">{n.title}</span>
                          <span className="text-[10px] text-activia-muted">{n.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-activia-muted leading-relaxed line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Demo Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
              className="flex items-center gap-2.5 p-1.5 pl-2 rounded-xl bg-activia-surface hover:bg-activia-elevated border border-activia-border transition-all shadow-sm group"
            >
              <img
                src={currentPersona.avatar}
                alt={currentPersona.name}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-white/10"
              />
              <div className="text-left hidden lg:block pr-1">
                <p className="text-xs font-semibold text-white leading-none flex items-center gap-1.5">
                  {currentPersona.name}
                </p>
                <p className="text-[10px] text-activia-muted leading-tight mt-0.5">
                  {currentPersona.grade ? `${currentPersona.grade} • ${currentPersona.house}` : currentPersona.designation}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-activia-muted group-hover:text-white transition-colors" />
            </button>

            {/* Persona Switcher Dropdown */}
            {personaMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-activia-elevated/95 backdrop-blur-xl border border-activia-border shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="pb-2.5 mb-2 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-activia-cyan">
                      Demo Persona Switcher
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      DEMO MODE
                    </span>
                  </div>
                  <p className="text-[11px] text-activia-muted mt-1">
                    Instantly simulate Student, Teacher, Coordinator, or Administrator workflows.
                  </p>
                </div>

                <div className="space-y-1.5">
                  {Object.values(DEMO_PERSONAS).map(persona => {
                    const isActive = persona.id === currentPersona.id;
                    return (
                      <div
                        key={persona.id}
                        onClick={() => {
                          onSwitchPersona(persona.id);
                          setPersonaMenuOpen(false);
                        }}
                        className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                          isActive
                            ? 'bg-activia-blue/20 border border-activia-blue/40 shadow-glow-blue'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={persona.avatar}
                            alt={persona.name}
                            className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/10"
                          />
                          <div>
                            <p className="text-xs font-semibold text-white">{persona.name}</p>
                            <p className="text-[10px] text-activia-muted truncate max-w-[140px]">
                              {persona.grade ? `${persona.grade} • ${persona.house}` : persona.designation}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {getRoleBadge(persona.role)}
                          {isActive && <Check className="w-3.5 h-3.5 text-activia-blue" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

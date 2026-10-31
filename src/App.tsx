import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { StudentDashboard } from './components/student/StudentDashboard';
import { ActivityDiscovery } from './components/activities/ActivityDiscovery';
import { ActivityDetailModal } from './components/activities/ActivityDetailModal';
import { CompetitionWorkspace } from './components/competitions/CompetitionWorkspace';
import { ClubsDirectory } from './components/clubs/ClubsDirectory';
import { CalendarView } from './components/calendar/CalendarView';
import { AnnouncementsBoard } from './components/communication/AnnouncementsBoard';
import { StudentVoiceFeedback } from './components/feedback/StudentVoiceFeedback';
import { AchievementPortfolio } from './components/portfolio/AchievementPortfolio';
import { TeacherDashboard } from './components/staff/TeacherDashboard';
import { AdminCommandCentre } from './components/admin/AdminCommandCentre';
import { CommandSearchModal } from './components/common/CommandSearchModal';
import { ApplicationsView } from './components/applications/ApplicationsView';
import { ResourcesView } from './components/resources/ResourcesView';
import { SettingsView } from './components/settings/SettingsView';
import { UserManagementView } from './components/admin/UserManagementView';

// Auth Pages
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { AccessDeniedPage } from './components/auth/AccessDeniedPage';
import { PendingApprovalPage } from './components/auth/PendingApprovalPage';

// Firebase Auth Observer
import { onAuthStateChange, firebaseLogout } from './lib/firebaseAuth';

import { activiaStore } from './api';
import {
  UserPersona,
  SchoolSettings,
  Activity,
  Registration,
  Team,
  ProjectTask,
  Club,
  House,
  Announcement,
  NotificationItem,
  CalendarEvent,
  Venue,
  VerifiedAchievement,
  FeedbackTicket,
  AuditLog,
  AdminAnalytics,
  RegistrationStatus,
  TaskStatus,
  FeedbackStatus,
  AuthUser,
  UserRole
} from './types';

export const App: React.FC = () => {
  // 1. Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('activia_current_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [authPage, setAuthPage] = useState<'login' | 'register' | 'forgot_password' | 'reset_password' | 'pending_approval' | null>(() => {
    try {
      const stored = localStorage.getItem('activia_current_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.status === 'pending_approval') return 'pending_approval';
        return null; // Authenticated
      }
      return 'login';
    } catch {
      return 'login';
    }
  });

  const [resetParams, setResetParams] = useState<{ identifier?: string; code?: string }>({});

  // 2. Core State
  const [persona, setPersona] = useState<UserPersona>(activiaStore.getCurrentPersona());
  const [settings, setSettings] = useState<SchoolSettings>(activiaStore.getSettings());
  const [activities, setActivities] = useState<Activity[]>(activiaStore.getActivities());
  const [registrations, setRegistrations] = useState<Registration[]>(activiaStore.getRegistrations());
  const [teams, setTeams] = useState<Team[]>(activiaStore.getTeams());
  const [tasks, setTasks] = useState<ProjectTask[]>(activiaStore.getTasks());
  const [clubs, setClubs] = useState<Club[]>(activiaStore.getClubs());
  const [houses, setHouses] = useState<House[]>(activiaStore.getHouses());
  const [announcements, setAnnouncements] = useState<Announcement[]>(activiaStore.getAnnouncements());
  const [notifications, setNotifications] = useState<NotificationItem[]>(activiaStore.getNotifications());
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(activiaStore.getCalendarEvents());
  const [venues, setVenues] = useState<Venue[]>(activiaStore.getVenues());
  const [achievements, setAchievements] = useState<VerifiedAchievement[]>(activiaStore.getAchievements(persona.id));
  const [feedbackTickets, setFeedbackTickets] = useState<FeedbackTicket[]>(activiaStore.getFeedbackTickets());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(activiaStore.getAuditLogs());
  const [analytics, setAnalytics] = useState<AdminAnalytics>(activiaStore.getAdminAnalytics());

  // 3. Navigation & UI State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [categoryFilterForDiscovery, setCategoryFilterForDiscovery] = useState<string>('all');

  // Sync theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  // Handle active user persona sync
  useEffect(() => {
    if (currentUser) {
      let mappedPersona = 'student_alex';
      if (currentUser.role === 'admin' || currentUser.role === 'coordinator') {
        mappedPersona = 'admin_eleanor';
      } else if (currentUser.role === 'editor' || currentUser.role === 'teacher') {
        mappedPersona = 'teacher_robert';
      }

      const p = activiaStore.switchPersona(mappedPersona);
      p.name = currentUser.fullName;
      p.email = currentUser.email;
      p.role = currentUser.role;
      p.id = String(currentUser.id);
      setPersona({ ...p });
    }
  }, [currentUser]);

  // Auth Handler: Login Success & Role Redirection
  const handleLoginSuccess = (user: AuthUser, token?: string) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('activia_current_user', JSON.stringify(user));
      if (token) localStorage.setItem('activia_auth_token', token);
    } catch {}

    if (user.status === 'pending_approval') {
      setAuthPage('pending_approval');
      return;
    }

    setAuthPage(null);

    // Role-based redirection:
    // Admin -> Admin dashboard ('admin_command')
    // Editor -> Teacher dashboard ('staff_overview')
    // Viewer -> Student dashboard ('dashboard')
    if (user.role === 'admin' || user.role === 'coordinator') {
      setActiveTab('admin_command');
    } else if (user.role === 'editor' || user.role === 'teacher') {
      setActiveTab('staff_overview');
    } else {
      setActiveTab('dashboard');
    }
  };

  // Auth Handler: Logout
  const handleLogout = async () => {
    const authMode = (import.meta.env.VITE_AUTH_MODE as string) || 'firebase';
    try {
      if (authMode === 'firebase') {
        await firebaseLogout();
      } else {
        await fetch('/api/auth/logout', { method: 'POST' });
      }
    } catch {}
    try {
      localStorage.removeItem('activia_current_user');
      localStorage.removeItem('activia_auth_token');
    } catch {}
    setCurrentUser(null);
    setAuthPage('login');
  };

  // Re-check status for pending approval
  const handleRefreshApprovalStatus = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user && data.user.status === 'active') {
          handleLoginSuccess(data.user);
        }
      }
    } catch {}
  };

  // Sync persona updates
  const handleSwitchPersona = (personaId: string) => {
    const updated = activiaStore.switchPersona(personaId);
    setPersona(updated);
    setAchievements(activiaStore.getAchievements(updated.id));
    setAuditLogs(activiaStore.getAuditLogs());

    // Switch default tab appropriately
    if (updated.role === 'admin' || updated.role === 'coordinator') {
      setActiveTab('admin_command');
    } else if (updated.role === 'editor' || updated.role === 'teacher') {
      setActiveTab('staff_overview');
    } else {
      setActiveTab('dashboard');
    }
  };

  // Re-fetch all data helper
  const reloadStoreData = () => {
    setActivities([...activiaStore.getActivities()]);
    setRegistrations([...activiaStore.getRegistrations()]);
    setTeams([...activiaStore.getTeams()]);
    setTasks([...activiaStore.getTasks()]);
    setClubs([...activiaStore.getClubs()]);
    setAnnouncements([...activiaStore.getAnnouncements()]);
    setNotifications([...activiaStore.getNotifications()]);
    setCalendarEvents([...activiaStore.getCalendarEvents()]);
    setAchievements([...activiaStore.getAchievements(persona.id)]);
    setFeedbackTickets([...activiaStore.getFeedbackTickets()]);
    setAuditLogs([...activiaStore.getAuditLogs()]);
    setAnalytics({ ...activiaStore.getAdminAnalytics() });
    setSettings({ ...activiaStore.getSettings() });
  };

  // Submit registration handler
  const handleSubmitRegistration = (data: any) => {
    const res = activiaStore.submitRegistration(data);
    if (res.success) {
      reloadStoreData();
    }
    return res;
  };

  // Approve / Reject registration
  const handleUpdateRegistrationStatus = (id: string, status: RegistrationStatus, notes?: string) => {
    activiaStore.updateRegistrationStatus(id, status, persona.name, notes);
    reloadStoreData();
  };

  // Create activity handler
  const handleCreateActivity = (actData: any) => {
    activiaStore.createActivity(actData);
    reloadStoreData();
  };

  // Join team by code
  const handleJoinTeamByCode = (code: string) => {
    const res = activiaStore.joinTeamByCode(code, {
      id: persona.id,
      name: persona.name,
      grade: persona.grade || 'Grade 11',
      avatar: persona.avatar,
    });
    if (res.success) {
      reloadStoreData();
    }
    return res;
  };

  // Create task
  const handleCreateTask = (task: Omit<ProjectTask, 'id'>) => {
    activiaStore.createTask(task);
    reloadStoreData();
  };

  // Update task status
  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
    activiaStore.updateTaskStatus(taskId, status);
    reloadStoreData();
  };

  // Toggle club membership
  const handleToggleClubMembership = (clubId: string) => {
    activiaStore.toggleClubMembership(clubId);
    reloadStoreData();
  };

  // Mark notification read
  const handleMarkNotificationRead = (id: string) => {
    activiaStore.markNotificationRead(id);
    setNotifications([...activiaStore.getNotifications()]);
  };

  const handleMarkAllNotificationsRead = () => {
    activiaStore.markAllNotificationsRead();
    setNotifications([...activiaStore.getNotifications()]);
  };

  // Mark announcement read
  const handleMarkAnnouncementRead = (id: string) => {
    activiaStore.markAnnouncementRead(id);
    setAnnouncements([...activiaStore.getAnnouncements()]);
  };

  // Submit feedback ticket
  const handleSubmitFeedback = (ticket: any) => {
    activiaStore.submitFeedbackTicket(ticket);
    reloadStoreData();
  };

  // Update feedback ticket
  const handleUpdateFeedbackStatus = (id: string, status: FeedbackStatus, responseText?: string) => {
    activiaStore.updateFeedbackStatus(id, status, persona.name, responseText);
    reloadStoreData();
  };

  // Post broadcast announcement
  const handlePostAnnouncement = (ann: any) => {
    activiaStore.createAnnouncement(ann);
    reloadStoreData();
  };

  // Update school settings
  const handleUpdateSettings = (newSettings: Partial<SchoolSettings>) => {
    activiaStore.updateSettings(newSettings);
    reloadStoreData();
  };

  // Export CSV helper
  const handleExportCsv = (type: 'participation' | 'approvals' | 'competitions' | 'achievements') => {
    const csvData = activiaStore.exportReportCsv(type);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `activia_${type}_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pendingApprovalsCount = registrations.filter(r => r.status === 'pending_teacher_approval').length;
  const unreadAnnouncementsCount = announcements.filter(a => !a.isRead).length;

  // Active user role
  const userRole: UserRole = currentUser?.role || persona.role;
  const isAdmin = userRole === 'admin' || userRole === 'coordinator';
  const isEditor = userRole === 'editor' || userRole === 'teacher';
  const isViewer = !isAdmin && !isEditor;

  // Check role authorization for current tab
  const isTabAuthorized = (): boolean => {
    // Admin only tabs
    if (['admin_command', 'admin_users', 'admin_analytics', 'admin_audit', 'admin_settings'].includes(activeTab)) {
      return isAdmin;
    }
    // Teacher/Editor only tabs
    if (['staff_overview', 'staff_approvals', 'staff_activities', 'staff_teams', 'staff_attendance'].includes(activeTab)) {
      return isAdmin || isEditor;
    }
    return true; // General tabs (dashboard, activities, competitions, calendar, announcements, applications, achievements, settings)
  };

  // ----------------------------------------------------
  // UN-AUTHENTICATED ROUTING: Authentication Pages
  // ----------------------------------------------------
  if (authPage === 'register') {
    return (
      <RegisterPage
        onRegisterSuccess={() => setAuthPage('login')}
        onNavigateToLogin={() => setAuthPage('login')}
        schoolName={settings.schoolName}
      />
    );
  }

  if (authPage === 'forgot_password') {
    return (
      <ForgotPasswordPage
        onNavigateToLogin={() => setAuthPage('login')}
        onNavigateToReset={(id, code) => {
          setResetParams({ identifier: id, code });
          setAuthPage('reset_password');
        }}
        schoolName={settings.schoolName}
      />
    );
  }

  if (authPage === 'reset_password') {
    return (
      <ResetPasswordPage
        initialIdentifier={resetParams.identifier}
        initialCode={resetParams.code}
        onNavigateToLogin={() => setAuthPage('login')}
        schoolName={settings.schoolName}
      />
    );
  }

  if (authPage === 'pending_approval' || (currentUser && currentUser.status === 'pending_approval')) {
    return (
      <PendingApprovalPage
        user={currentUser || undefined}
        onRefresh={handleRefreshApprovalStatus}
        onLogout={handleLogout}
        schoolName={settings.schoolName}
      />
    );
  }

  if (authPage === 'login' || !currentUser) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onNavigateToRegister={() => setAuthPage('register')}
        onNavigateToForgotPassword={() => setAuthPage('forgot_password')}
        schoolName={settings.schoolName}
      />
    );
  }

  // ----------------------------------------------------
  // AUTHENTICATED DASHBOARD APPLICATION SHELL
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172033] flex flex-col font-sans transition-colors duration-200">
      {/* 1. Global Navbar */}
      <Navbar
        currentPersona={persona}
        onSwitchPersona={handleSwitchPersona}
        settings={settings}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onOpenSearch={() => setSearchModalOpen(true)}
        activeTab={activeTab}
        onNavigate={setActiveTab}
        onLogout={handleLogout}
      />

      {/* 2. Main Dashboard Shell (Sidebar + Content View) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Role-Aware Sidebar */}
        <Sidebar
          role={userRole}
          activeTab={activeTab}
          onNavigate={setActiveTab}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          pendingApprovalsCount={pendingApprovalsCount}
          unreadAnnouncementsCount={unreadAnnouncementsCount}
          schoolName={settings.schoolName}
        />

        {/* Dynamic Main Workspace Container */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
          {/* Authorization Guard: Access Denied check */}
          {!isTabAuthorized() ? (
            <AccessDeniedPage
              currentRole={userRole}
              requiredRole={
                ['admin_command', 'admin_users', 'admin_analytics', 'admin_audit', 'admin_settings'].includes(activeTab)
                  ? 'Admin — Principal'
                  : 'Editor — Teacher'
              }
              attemptedSection={activeTab.replace('_', ' ')}
              onReturnToDashboard={() => {
                if (isAdmin) setActiveTab('admin_command');
                else if (isEditor) setActiveTab('staff_overview');
                else setActiveTab('dashboard');
              }}
            />
          ) : (
            <>
              {/* TAB: Home / Overview Dashboard View (Role Adaptive) */}
              {(activeTab === 'dashboard' || activeTab === 'home') && (
                isAdmin ? (
                  <AdminCommandCentre
                    analytics={analytics}
                    settings={settings}
                    auditLogs={auditLogs}
                    venues={venues}
                    feedbackTickets={feedbackTickets}
                    persona={persona}
                    onUpdateSettings={handleUpdateSettings}
                    onPostAnnouncement={handlePostAnnouncement}
                    onUpdateFeedbackStatus={handleUpdateFeedbackStatus}
                    onExportCsv={handleExportCsv}
                  />
                ) : isEditor ? (
                  <TeacherDashboard
                    persona={persona}
                    activities={activities}
                    registrations={registrations}
                    teams={teams}
                    tasks={tasks}
                    onUpdateRegistrationStatus={handleUpdateRegistrationStatus}
                    onCreateActivity={handleCreateActivity}
                    onNavigate={setActiveTab}
                  />
                ) : (
                  <StudentDashboard
                    persona={persona}
                    activities={activities}
                    registrations={registrations}
                    tasks={tasks}
                    achievements={achievements}
                    announcements={announcements}
                    feedbackTickets={feedbackTickets}
                    onNavigate={setActiveTab}
                    onSelectActivity={setSelectedActivity}
                  />
                )
              )}

              {/* TAB: Admin User Management (Principal Only) */}
              {activeTab === 'admin_users' && isAdmin && (
                <UserManagementView
                  currentAdminId={currentUser.id}
                  onNavigate={setActiveTab}
                />
              )}

              {/* TAB: Activity Discovery Centre */}
              {activeTab === 'activities' && (
                <ActivityDiscovery
                  activities={activities}
                  registrations={registrations}
                  persona={persona}
                  onSelectActivity={setSelectedActivity}
                  selectedCategoryFilter={categoryFilterForDiscovery}
                  onClearCategoryFilter={() => setCategoryFilterForDiscovery('all')}
                />
              )}

              {/* TAB: Competitions & Teams */}
              {activeTab === 'competitions' && (
                <CompetitionWorkspace
                  teams={teams}
                  tasks={tasks}
                  registrations={registrations}
                  activities={activities}
                  studentName={persona.name}
                  studentId={persona.id}
                  onJoinTeamByCode={handleJoinTeamByCode}
                  onCreateTask={handleCreateTask}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  onSelectActivity={setSelectedActivity}
                />
              )}

              {/* TAB: Clubs & House Standings */}
              {activeTab === 'clubs' && (
                <ClubsDirectory
                  clubs={clubs}
                  houses={houses}
                  onToggleMembership={handleToggleClubMembership}
                  onNavigate={setActiveTab}
                />
              )}

              {/* TAB: Academic & Event Calendar */}
              {activeTab === 'calendar' && (
                <CalendarView
                  events={calendarEvents}
                  venues={venues}
                  onSelectEvent={() => {}}
                />
              )}

              {/* TAB: Announcements & Q&A */}
              {activeTab === 'announcements' && (
                <AnnouncementsBoard
                  announcements={announcements}
                  onMarkAsRead={handleMarkAnnouncementRead}
                  studentName={persona.name}
                />
              )}

              {/* TAB: Applications & Approvals */}
              {activeTab === 'applications' && (
                <ApplicationsView
                  registrations={registrations}
                  persona={persona}
                  activities={activities}
                  onUpdateStatus={handleUpdateRegistrationStatus}
                  onSelectActivity={setSelectedActivity}
                  onNavigate={setActiveTab}
                />
              )}

              {/* TAB: Achievement Portfolio (Viewer) */}
              {activeTab === 'achievements' && (
                <AchievementPortfolio
                  achievements={achievements}
                  persona={persona}
                />
              )}

              {/* TAB: Institutional Resources */}
              {activeTab === 'resources' && (
                <ResourcesView />
              )}

              {/* TAB: Help and Support */}
              {(activeTab === 'support' || activeTab === 'feedback') && (
                <StudentVoiceFeedback
                  tickets={feedbackTickets}
                  persona={persona}
                  onSubmitTicket={handleSubmitFeedback}
                />
              )}

              {/* TAB: Settings & My Profile */}
              {activeTab === 'settings' && (
                <SettingsView
                  persona={persona}
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                />
              )}

              {/* TAB: Staff / Faculty Workspace (Editor & Admin) */}
              {(activeTab === 'staff_overview' ||
                activeTab === 'staff_approvals' ||
                activeTab === 'staff_activities' ||
                activeTab === 'staff_teams' ||
                activeTab === 'staff_attendance') && (
                <TeacherDashboard
                  persona={persona}
                  activities={activities}
                  registrations={registrations}
                  teams={teams}
                  tasks={tasks}
                  onUpdateRegistrationStatus={handleUpdateRegistrationStatus}
                  onCreateActivity={handleCreateActivity}
                  onNavigate={setActiveTab}
                />
              )}

              {/* TAB: Administrator Directorate & Reports (Admin Only) */}
              {(activeTab === 'admin_command' ||
                activeTab === 'admin_analytics' ||
                activeTab === 'admin_venues' ||
                activeTab === 'admin_settings' ||
                activeTab === 'admin_audit') && (
                <AdminCommandCentre
                  analytics={analytics}
                  settings={settings}
                  auditLogs={auditLogs}
                  venues={venues}
                  feedbackTickets={feedbackTickets}
                  persona={persona}
                  onUpdateSettings={handleUpdateSettings}
                  onPostAnnouncement={handlePostAnnouncement}
                  onUpdateFeedbackStatus={handleUpdateFeedbackStatus}
                  onExportCsv={handleExportCsv}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* 3. Global Activity Detail & Registration Modal */}
      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          persona={persona}
          existingRegistration={registrations.find(
            r => r.activityId === selectedActivity.id && r.studentId === persona.id
          )}
          onClose={() => setSelectedActivity(null)}
          onSubmitRegistration={handleSubmitRegistration}
        />
      )}

      {/* 4. Global Command Search Modal (Ctrl+K) */}
      <CommandSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        activities={activities}
        clubs={clubs}
        venues={venues}
        onSelectActivity={setSelectedActivity}
        onNavigate={setActiveTab}
      />
    </div>
  );
};

export default App;

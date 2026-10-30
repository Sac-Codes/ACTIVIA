import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ActivityGalaxy } from './components/3d/ActivityGalaxy';
import { CampusView } from './components/3d/CampusView';
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
  FeedbackStatus
} from './types';

export const App: React.FC = () => {
  // 1. Core State
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

  // 2. Navigation & UI State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [categoryFilterForDiscovery, setCategoryFilterForDiscovery] = useState<string>('all');

  // Sync theme with html document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  // Sync persona updates
  const handleSwitchPersona = (personaId: string) => {
    const updated = activiaStore.switchPersona(personaId);
    setPersona(updated);
    setAchievements(activiaStore.getAchievements(updated.id));
    setAuditLogs(activiaStore.getAuditLogs());

    // Switch default tab appropriately
    if (updated.role === 'student') {
      setActiveTab('dashboard');
    } else if (updated.role === 'teacher') {
      setActiveTab('staff_overview');
    } else {
      setActiveTab('admin_command');
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

  // Activity click from 3D Galaxy
  const handleGalaxySelectCategory = (categoryId: string) => {
    setCategoryFilterForDiscovery(categoryId);
    setActiveTab('activities');
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
      />

      {/* 2. Main Dashboard Shell (Sidebar + Content View) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Role-Aware Sidebar */}
        <Sidebar
          role={persona.role}
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
          {/* TAB: Dashboard View (Role Adaptive) */}
          {activeTab === 'dashboard' && (
            persona.role === 'teacher' ? (
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
            ) : persona.role === 'admin' ? (
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

          {/* TAB: 3D Activity Galaxy */}
          {activeTab === 'galaxy' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-app-border p-5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-app-brand">
                  Signature 3D Environment
                </span>
                <h2 className="text-xl font-bold font-display text-app-text mt-0.5">
                  Activity Galaxy Hub
                </h2>
                <p className="text-xs text-app-muted mt-1">
                  Explore 8 planetary sectors representing STEM, Science, Sports, Arts, Debate, Leadership, Community Service, and Clubs.
                </p>
              </div>

              <ActivityGalaxy
                activities={activities}
                onSelectCategory={handleGalaxySelectCategory}
                onSelectActivity={setSelectedActivity}
              />
            </div>
          )}

          {/* TAB: 3D Miniature Campus Map */}
          {activeTab === 'campus' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-app-border p-5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-app-accent">
                  Interactive Campus Geography
                </span>
                <h2 className="text-xl font-bold font-display text-app-text mt-0.5">
                  3D Miniature School Campus
                </h2>
                <p className="text-xs text-app-muted mt-1">
                  Click on campus buildings to inspect resident clubs, scheduled events, and facility capacity.
                </p>
              </div>

              <CampusView
                activities={activities}
                clubs={clubs}
                onSelectActivity={setSelectedActivity}
              />
            </div>
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

          {/* TAB: My Applications & Review Applications */}
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

          {/* TAB: Achievement Portfolio */}
          {activeTab === 'achievements' && (
            <AchievementPortfolio
              achievements={achievements}
              persona={persona}
            />
          )}

          {/* TAB: Institutional Resources & Handbooks */}
          {activeTab === 'resources' && (
            <ResourcesView />
          )}

          {/* TAB: Help & Support / Student Voice */}
          {(activeTab === 'support' || activeTab === 'feedback') && (
            <StudentVoiceFeedback
              tickets={feedbackTickets}
              persona={persona}
              onSubmitTicket={handleSubmitFeedback}
            />
          )}

          {/* TAB: Settings */}
          {activeTab === 'settings' && (
            <SettingsView
              persona={persona}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
            />
          )}

          {/* TAB: Staff / Faculty Workspace */}
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

          {/* TAB: Administrator Directorate */}
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

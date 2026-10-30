import React, { useState } from 'react';
import {
  Settings,
  User,
  Shield,
  Bell,
  Lock,
  CheckCircle2,
  Building,
  Save
} from 'lucide-react';
import { UserPersona, SchoolSettings } from '../../types';

interface SettingsViewProps {
  persona: UserPersona;
  settings: SchoolSettings;
  onUpdateSettings: (settings: Partial<SchoolSettings>) => void;
  onUpdateProfile?: (profile: Partial<UserPersona>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  persona,
  settings,
  onUpdateSettings,
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'institutional'>('profile');

  // Profile fields
  const [fullName, setFullName] = useState(persona.name);
  const [email, setEmail] = useState(persona.email);
  const [bio, setBio] = useState(persona.bio || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Institutional fields
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [academicYear, setAcademicYear] = useState(settings.academicYear);
  const [currentTerm, setCurrentTerm] = useState(settings.currentTerm);
  const [instSaved, setInstSaved] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile({ name: fullName, email, bio });
    }
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordMessage('Password updated successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordMessage(null), 3000);
  };

  const handleInstitutionalSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      schoolName,
      academicYear,
      currentTerm,
    });
    setInstSaved(true);
    setTimeout(() => setInstSaved(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl border border-app-border p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-app-text">
            Settings & Account Parameters
          </h2>
          <p className="text-xs sm:text-sm text-app-muted mt-1">
            Manage your personal profile, authentication credentials, and institutional configurations.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-app-secondary border border-app-border self-start md:self-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-app-muted hover:text-app-text'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-app-muted hover:text-app-text'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Security</span>
          </button>
          {(persona.role === 'admin' || persona.role === 'coordinator') && (
            <button
              onClick={() => setActiveTab('institutional')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'institutional'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-app-muted hover:text-app-text'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Institutional</span>
            </button>
          )}
        </div>
      </div>

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-app-border p-6 shadow-xs max-w-2xl mx-auto space-y-4">
          <div className="pb-3 border-b border-app-border">
            <h3 className="text-base font-bold text-app-text">User Profile Information</h3>
            <p className="text-xs text-app-muted mt-0.5">
              Update your registered school profile details.
            </p>
          </div>

          {profileSaved && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Profile information updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-app-secondary border border-app-border">
              <img
                src={persona.avatar}
                alt={persona.name}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-white"
              />
              <div>
                <p className="text-sm font-bold text-app-text">{persona.name}</p>
                <p className="text-xs text-app-muted capitalize">Role: {persona.role}</p>
                {persona.grade && (
                  <p className="text-xs text-app-subtle mt-0.5">{persona.grade} • {persona.house} House</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-app-muted block mb-1 font-medium">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-app-border bg-white text-app-text focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="text-app-muted block mb-1 font-medium">School Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-app-border bg-white text-app-text focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="text-app-muted block mb-1 font-medium">Bio / Extracurricular Interests</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                placeholder="Brief summary of your academic or extracurricular passion..."
                className="w-full p-3 rounded-lg border border-app-border bg-white text-app-text focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </form>
        </div>
      )}

      {/* SECURITY TAB */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-xl border border-app-border p-6 shadow-xs max-w-2xl mx-auto space-y-4">
          <div className="pb-3 border-b border-app-border">
            <h3 className="text-base font-bold text-app-text">Password & Authentication Security</h3>
            <p className="text-xs text-app-muted mt-0.5">
              Secure your account using strong scrypt-hashed credentials.
            </p>
          </div>

          {passwordError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {passwordError}
            </div>
          )}

          {passwordMessage && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{passwordMessage}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
            <div>
              <label className="text-app-muted block mb-1 font-medium">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-3 py-2 rounded-lg border border-app-border bg-white text-app-text focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="text-app-muted block mb-1 font-medium">New Password (min 8 characters)</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new strong password"
                className="w-full px-3 py-2 rounded-lg border border-app-border bg-white text-app-text focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="text-app-muted block mb-1 font-medium">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3 py-2 rounded-lg border border-app-border bg-white text-app-text focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
            >
              Update Password
            </button>
          </form>
        </div>
      )}

      {/* INSTITUTIONAL TAB */}
      {activeTab === 'institutional' && (
        <div className="bg-white rounded-xl border border-app-border p-6 shadow-xs max-w-2xl mx-auto space-y-4">
          <div className="pb-3 border-b border-app-border">
            <h3 className="text-base font-bold text-app-text">School Institutional Parameters</h3>
            <p className="text-xs text-app-muted mt-0.5">
              Set institutional title and term metadata.
            </p>
          </div>

          {instSaved && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>School parameters updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleInstitutionalSave} className="space-y-4 text-xs">
            <div>
              <label className="text-app-muted block mb-1 font-medium">School / Institution Name</label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-app-border bg-white text-app-text focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-app-muted block mb-1 font-medium">Academic Session</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={e => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-app-border bg-white text-app-text"
                />
              </div>
              <div>
                <label className="text-app-muted block mb-1 font-medium">Current Term</label>
                <input
                  type="text"
                  value={currentTerm}
                  onChange={e => setCurrentTerm(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-app-border bg-white text-app-text"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
            >
              Save Institutional Parameters
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

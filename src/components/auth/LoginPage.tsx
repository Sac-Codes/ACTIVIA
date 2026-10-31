import React, { useState } from 'react';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Shield,
  Briefcase,
  UserCheck
} from 'lucide-react';
import { AuthUser, ROLE_LABELS } from '../../types';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser, token?: string) => void;
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
  schoolName?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
  onNavigateToForgotPassword,
  schoolName = 'ACTIVIA Hub'
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setErrorMessage('Please enter your school email or assigned username.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanIdentifier,
          password,
          rememberMe
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Authentication failed. Please verify your credentials.');
        setLoading(false);
        return;
      }

      if (data.user) {
        onLoginSuccess(data.user, data.token);
      }
    } catch (err: any) {
      setErrorMessage('Unable to connect to authentication server. Please check your network or contact school IT.');
    } finally {
      setLoading(false);
    }
  };

  // Quick credentials filler for evaluators and test workflows
  const handleQuickFill = (roleKey: 'admin' | 'editor' | 'viewer') => {
    if (roleKey === 'admin') {
      setIdentifier('admin');
      setPassword('CampusFlow2026!');
    } else if (roleKey === 'editor') {
      setIdentifier('teacher');
      setPassword('CampusFlow2026!');
    } else {
      setIdentifier('student');
      setPassword('CampusFlow2026!');
    }
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex justify-center items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-app-brand text-white flex items-center justify-center shadow-md">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-app-text tracking-tight">
              {schoolName}
            </h1>
            <p className="text-xs text-app-muted">School Activity & Engagement Portal</p>
          </div>
        </div>

        <h2 className="mt-6 text-center text-xl sm:text-2xl font-bold font-display text-app-text">
          Sign In to Your Account
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-app-muted">
          Access your role-specific dashboard, activities, and school records
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xs border border-app-border rounded-2xl">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username or Email */}
            <div>
              <label htmlFor="identifier" className="block text-xs font-semibold text-app-text uppercase tracking-wider mb-1.5">
                Email or Username
              </label>
              <div className="relative rounded-xl border border-app-border focus-within:border-app-brand focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-app-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. alex.rivera@school.edu or student"
                  className="block w-full pl-10 pr-3 py-2.5 text-sm bg-transparent text-app-text placeholder:text-app-subtle focus:outline-none rounded-xl"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-app-text uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={onNavigateToForgotPassword}
                  className="text-xs text-app-brand hover:text-indigo-700 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative rounded-xl border border-app-border focus-within:border-app-brand focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-app-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="block w-full pl-10 pr-10 py-2.5 text-sm bg-transparent text-app-text placeholder:text-app-subtle focus:outline-none rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-app-muted hover:text-app-text focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-app-brand border-app-border focus:ring-app-brand"
                />
                <span className="text-xs text-app-muted font-medium">Keep me signed in</span>
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-app-brand hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Registration link for students */}
          <div className="mt-6 pt-5 border-t border-app-border text-center">
            <p className="text-xs text-app-muted">
              New student joining this academic term?{' '}
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="font-semibold text-app-brand hover:text-indigo-700 transition-colors ml-1"
              >
                Create Student Account
              </button>
            </p>
          </div>

          {/* Quick-Access Test Accounts for Evaluators */}
          <div className="mt-6 p-4 rounded-xl bg-app-secondary border border-app-border">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-app-text uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-app-brand" />
              <span>Institutional Test Profiles (1-Click Fill)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="p-2 rounded-lg bg-white border border-app-border hover:border-indigo-300 text-left transition-colors text-xs"
              >
                <div className="flex items-center gap-1 font-semibold text-indigo-700 text-[11px]">
                  <Shield className="w-3 h-3" /> Admin
                </div>
                <div className="text-[10px] text-app-muted truncate">Principal Vance</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('editor')}
                className="p-2 rounded-lg bg-white border border-app-border hover:border-teal-300 text-left transition-colors text-xs"
              >
                <div className="flex items-center gap-1 font-semibold text-teal-700 text-[11px]">
                  <Briefcase className="w-3 h-3" /> Editor
                </div>
                <div className="text-[10px] text-app-muted truncate">Teacher Vance</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('viewer')}
                className="p-2 rounded-lg bg-white border border-app-border hover:border-blue-300 text-left transition-colors text-xs"
              >
                <div className="flex items-center gap-1 font-semibold text-blue-700 text-[11px]">
                  <UserCheck className="w-3 h-3" /> Viewer
                </div>
                <div className="text-[10px] text-app-muted truncate">Student Alex</div>
              </button>
            </div>
            <p className="text-[10px] text-app-subtle mt-2 text-center">
              Password for all seeded accounts: <code className="font-mono bg-white px-1 py-0.5 rounded border border-gray-200">CampusFlow2026!</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

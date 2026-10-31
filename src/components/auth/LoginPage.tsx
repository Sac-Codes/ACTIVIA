import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Shield,
  Briefcase,
  UserCheck,
  Wifi,
  WifiOff
} from 'lucide-react';
import { AuthUser, ROLE_LABELS } from '../../types';
import { firebaseLogin } from '../../lib/firebaseAuth';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser, token?: string) => void;
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
  schoolName?: string;
}

type AuthMode = 'firebase' | 'express';

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
  const [authMode, setAuthMode] = useState<AuthMode>('firebase');

  // Detect if we're in Firebase mode
  useEffect(() => {
    const mode = (import.meta.env.VITE_AUTH_MODE as AuthMode) || 'firebase';
    setAuthMode(mode);
  }, []);

  // ── Firebase Auth Login ───────────────────────────────────────────────────
  const handleFirebaseLogin = async () => {
    try {
      const { user } = await firebaseLogin({
        identifier: identifier.trim(),
        password,
      });
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
      setLoading(false);
    }
  };

  // ── Express/SQLite API Login (fallback) ───────────────────────────────────
  const handleExpressLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: identifier.trim(),
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
      setLoading(false);
    }
  };

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
      if (authMode === 'firebase') {
        await handleFirebaseLogin();
      } else {
        await handleExpressLogin();
      }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-100/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex justify-center items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-app-text tracking-tight">
              {schoolName}
            </h1>
            <p className="text-xs text-app-muted">School Activity &amp; Engagement Portal</p>
          </div>
        </div>

        <h2 className="mt-6 text-center text-xl sm:text-2xl font-bold font-display text-app-text">
          Welcome back
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-app-muted">
          Sign in to access your role-specific dashboard and school records
        </p>
      </div>

      <div className="relative mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white/80 backdrop-blur-sm py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/60 border border-white/60 rounded-2xl">

          {/* Auth Mode Badge */}
          <div className="flex items-center justify-center gap-1.5 mb-5">
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              authMode === 'firebase'
                ? 'bg-orange-50 text-orange-700 border border-orange-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {authMode === 'firebase' ? (
                <><Wifi className="w-2.5 h-2.5" /> Firebase Auth</>
              ) : (
                <><WifiOff className="w-2.5 h-2.5" /> Local Server Auth</>
              )}
            </span>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5" role="alert">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Username or Email */}
            <div>
              <label htmlFor="login-identifier" className="block text-xs font-semibold text-app-text uppercase tracking-wider mb-1.5">
                Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-app-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. alex.rivera@school.edu or student"
                  className="block w-full pl-10 pr-3 py-2.5 text-sm bg-white text-[#172033] placeholder:text-slate-400 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-semibold text-app-text uppercase tracking-wider">
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
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-app-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="block w-full pl-10 pr-10 py-2.5 text-sm bg-white text-[#172033] placeholder:text-slate-400 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-app-muted hover:text-app-text focus:outline-none transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="login-remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-app-brand border-[#CBD5E1] focus:ring-app-brand"
                />
                <span className="text-xs text-app-muted font-medium">Keep me signed in</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="login-submit-btn"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:from-indigo-800 active:to-violet-800 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 hover:shadow-indigo-300 flex items-center justify-center gap-2 transition-all duration-200"
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
          </form>

          {/* Registration link for students */}
          <div className="mt-6 pt-5 border-t border-app-border text-center">
            <p className="text-xs text-app-muted">
              New student joining this academic term?{' '}
              <button
                type="button"
                id="login-goto-register"
                onClick={onNavigateToRegister}
                className="font-semibold text-app-brand hover:text-indigo-700 transition-colors ml-1"
              >
                Create Student Account
              </button>
            </p>
          </div>

          {/* Quick-Access Test Accounts for Evaluators (Express mode only) */}
          {authMode === 'express' && (
            <div className="mt-6 p-4 rounded-xl bg-app-secondary border border-app-border">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-app-text uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-app-brand" />
                <span>Institutional Test Profiles (1-Click Fill)</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  id="quick-fill-admin"
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
                  id="quick-fill-editor"
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
                  id="quick-fill-viewer"
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
          )}

          {/* Firebase mode info */}
          {authMode === 'firebase' && (
            <div className="mt-5 p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-[11px] text-indigo-700 text-center">
              🔐 Secured by Firebase Authentication — Project: <strong>activia-f36ee</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

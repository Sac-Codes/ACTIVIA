import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { AuthUser } from '../../types';
import { firebaseLogin } from '../../lib/firebaseAuth';
import { AuthIllustration } from './AuthIllustration';
import './auth.css';

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
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('express');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mode = (import.meta.env.VITE_AUTH_MODE as AuthMode) || 'express';
    setAuthMode(mode);
  }, []);

  const handleFirebaseLogin = async () => {
    const { user } = await firebaseLogin({ identifier: email.trim(), password });
    onLoginSuccess(user);
  };

  const handleExpressLogin = async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email.trim(), password, rememberMe: true }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Authentication failed. Please check your credentials.');
    if (data.user) onLoginSuccess(data.user, data.token);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) { setError('Please enter your email or username.'); return; }
    if (!password) { setError('Please enter your password.'); return; }

    setLoading(true);
    try {
      if (authMode === 'firebase') {
        await handleFirebaseLogin();
      } else {
        await handleExpressLogin();
      }
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick-fill for Express/demo mode
  const quickFill = (role: 'admin' | 'editor' | 'viewer') => {
    const map = { admin: 'admin', editor: 'teacher', viewer: 'student' };
    setEmail(map[role]);
    setPassword('CampusFlow2026!');
    setError(null);
  };

  return (
    <div className={`auth-page-root ${mounted ? 'auth-mounted' : ''}`}>

      {/* ── LEFT PANEL ─────────────────────────────────────────────────────── */}
      <div className="auth-left-panel">
        <div className="auth-left-content">

          {/* Logo */}
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
                <circle cx="16" cy="16" r="14" fill="white" opacity="0.2"/>
                <path d="M16 4 L20 13 L30 13 L22 19 L25 28 L16 22 L7 28 L10 19 L2 13 L12 13 Z" fill="white"/>
              </svg>
            </div>
            <span className="auth-logo-text">ACTIVIA</span>
          </div>

          {/* Headline */}
          <div className="auth-left-headline">
            <h1>Your School.<br />Your Opportunities.</h1>
            <p>
              ACTIVIA connects students, teachers, and activities in one unified school engagement platform.
            </p>
          </div>

          {/* Illustration */}
          <div className="auth-illustration-wrap">
            <AuthIllustration variant="login" />
          </div>

          {/* Feature pills */}
          <div className="auth-feature-pills">
            <span className="auth-pill auth-pill-indigo">🏆 Competitions</span>
            <span className="auth-pill auth-pill-teal">🎯 Activities</span>
            <span className="auth-pill auth-pill-purple">⭐ Achievements</span>
          </div>

          {/* Tagline */}
          <p className="auth-tagline">Discover. Participate. Achieve.</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────────────── */}
      <div className="auth-right-panel">
        <div className="auth-form-container">

          {/* Form header */}
          <div className="auth-form-header">
            <h2 className="auth-form-title">Welcome back</h2>
            <p className="auth-form-subtitle">Sign in to continue to your ACTIVIA dashboard.</p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="auth-error-alert" role="alert">
              <AlertCircle className="auth-error-icon" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form" noValidate>

            {/* Email / Username */}
            <div className="auth-field-group">
              <label htmlFor="login-email" className="auth-label">
                Email or Username
              </label>
              <input
                id="login-email"
                type="text"
                autoComplete="username"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. alex@school.edu or student"
                className="auth-input"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="auth-field-group">
              <div className="auth-label-row">
                <label htmlFor="login-password" className="auth-label">Password</label>
                <button
                  type="button"
                  onClick={onNavigateToForgotPassword}
                  className="auth-link-sm"
                  tabIndex={0}
                >
                  Forgot password?
                </button>
              </div>
              <div className="auth-input-wrap">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="auth-input auth-input-padded-right"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="auth-eye-btn"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-submit-btn"
              disabled={loading}
              className="auth-btn-primary"
            >
              {loading ? (
                <><Loader2 size={18} className="auth-spinner" /><span>Signing in…</span></>
              ) : (
                <><span>Sign In</span><ArrowRight size={17} /></>
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="auth-switch-text">
            New student?{' '}
            <button
              type="button"
              id="login-goto-register"
              onClick={onNavigateToRegister}
              className="auth-link"
            >
              Create a student account
            </button>
          </p>

          {/* Demo accounts — Express mode only */}
          {authMode === 'express' && (
            <div className="auth-demo-block">
              <span className="auth-demo-label">Quick access — demo accounts</span>
              <div className="auth-demo-grid">
                {(['admin', 'editor', 'viewer'] as const).map(role => (
                  <button
                    key={role}
                    type="button"
                    id={`quick-fill-${role}`}
                    onClick={() => quickFill(role)}
                    className={`auth-demo-btn auth-demo-${role}`}
                  >
                    <span className="auth-demo-role">
                      {role === 'admin' ? '🛡 Admin' : role === 'editor' ? '✏️ Teacher' : '👤 Student'}
                    </span>
                    <span className="auth-demo-hint">
                      {role === 'admin' ? 'Principal' : role === 'editor' ? 'Editor' : 'Viewer'}
                    </span>
                  </button>
                ))}
              </div>
              <p className="auth-demo-pw">Password: <code>CampusFlow2026!</code></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

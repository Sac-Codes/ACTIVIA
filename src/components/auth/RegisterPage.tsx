import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, Loader2, Check, X } from 'lucide-react';
import { firebaseRegisterStudent } from '../../lib/firebaseAuth';
import { AuthIllustration } from './AuthIllustration';
import './auth.css';

interface RegisterPageProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
  schoolName?: string;
}

type AuthMode = 'firebase' | 'express';

function getPasswordStrength(pw: string) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const PW_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
const PW_COLORS = ['', '#DC2626', '#EA580C', '#D97706', '#16A34A', '#15803D'];

interface FieldProps {
  id: string;
  label: string;
  children: React.ReactNode;
  hint?: string;
  optional?: boolean;
}

const Field: React.FC<FieldProps> = ({ id, label, children, hint, optional }) => (
  <div className="auth-field-group">
    <label htmlFor={id} className="auth-label">
      {label}
      {optional && <span className="auth-label-opt"> — optional</span>}
    </label>
    {children}
    {hint && <p className="auth-hint">{hint}</p>}
  </div>
);

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [className, setClassName] = useState('Grade 10');
  const [stream, setStream] = useState('Science & Technology');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ message: string } | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('express');
  const [mounted, setMounted] = useState(false);

  const pwStrength = getPasswordStrength(password);
  const pwMatch = confirmPassword.length > 0 && password === confirmPassword;
  const pwMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const pwChecks = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
  ];

  useEffect(() => {
    setMounted(true);
    setAuthMode((import.meta.env.VITE_AUTH_MODE as AuthMode) || 'express');
  }, []);

  const handleFirebaseRegister = async () => {
    const result = await firebaseRegisterStudent({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      username: username.trim().toLowerCase(),
      password,
      className,
      stream,
      grade: className,
    });
    setSuccess({ message: result.message });
  };

  const handleExpressRegister = async () => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        username: username.trim().toLowerCase(),
        password,
        confirmPassword,
        className,
        stream,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed. Please check your details.');
    setSuccess({ message: data.message || 'Account created successfully!' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) { setError('Please enter your full name.'); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid school email address.'); return;
    }
    if (!username.trim() || username.trim().length < 3) {
      setError('Username must be at least 3 characters.'); return;
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(username.trim())) {
      setError('Username can only contain letters, numbers, dots, underscores, and hyphens.'); return;
    }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      if (authMode === 'firebase') {
        await handleFirebaseRegister();
      } else {
        await handleExpressRegister();
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="auth-success-page">
        <div className="auth-success-card">
          <div className="auth-success-icon-wrap">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="auth-success-title">You're all set!</h2>
          <p className="auth-success-msg">{success.message}</p>
          <div className="auth-success-checklist">
            <div className="auth-success-item">
              <Check size={14} /> Account created with <strong>Viewer (Student)</strong> role
            </div>
            <div className="auth-success-item">
              <Check size={14} /> You can now register for activities and competitions
            </div>
            <div className="auth-success-item">
              <Check size={14} /> Track your achievements and portfolio
            </div>
          </div>
          <button
            type="button"
            id="register-success-signin"
            onClick={onNavigateToLogin}
            className="auth-btn-primary"
          >
            <span>Continue to Sign In</span>
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    );
  }

  // ── Registration form ──────────────────────────────────────────────────────
  return (
    <div className={`auth-page-root ${mounted ? 'auth-mounted' : ''}`}>

      {/* ── LEFT PANEL ───────────────────────────────────────────────────── */}
      <div className="auth-left-panel">
        <div className="auth-left-content">

          <div className="auth-logo">
            <div className="auth-logo-icon">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
                <circle cx="16" cy="16" r="14" fill="white" opacity="0.2"/>
                <path d="M16 4 L20 13 L30 13 L22 19 L25 28 L16 22 L7 28 L10 19 L2 13 L12 13 Z" fill="white"/>
              </svg>
            </div>
            <span className="auth-logo-text">ACTIVIA</span>
          </div>

          <div className="auth-left-headline">
            <h1>Your journey<br />starts here.</h1>
            <p>
              Join thousands of students exploring activities,
              winning competitions, and building an achievement portfolio that lasts.
            </p>
          </div>

          <div className="auth-illustration-wrap">
            <AuthIllustration variant="register" />
          </div>

          {/* Benefit list */}
          <div className="auth-benefits">
            {[
              { icon: '🎯', text: 'Discover school activities & clubs' },
              { icon: '🏆', text: 'Enter competitions & win recognition' },
              { icon: '📋', text: 'Build a verified achievement portfolio' },
              { icon: '📢', text: 'Stay updated with announcements' },
            ].map(b => (
              <div key={b.text} className="auth-benefit-item">
                <span className="auth-benefit-icon">{b.icon}</span>
                <span>{b.text}</span>
              </div>
            ))}
          </div>

          <p className="auth-tagline">Discover. Participate. Achieve.</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ──────────────────────────────────────────────────── */}
      <div className="auth-right-panel auth-right-panel--scroll">
        <div className="auth-form-container auth-form-container--register">

          {/* Header */}
          <div className="auth-form-header">
            <h2 className="auth-form-title">Create your account</h2>
            <p className="auth-form-subtitle">
              Student self-registration. Your account will receive <strong>Viewer</strong> (Student) access.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="auth-error-alert" role="alert">
              <AlertCircle className="auth-error-icon" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>

            {/* ── Section 1: Personal ──────────────────────────────────── */}
            <div className="auth-section-label">Personal Information</div>

            <Field id="reg-full-name" label="Full Name">
              <input
                id="reg-full-name"
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Jordan Lee"
                className="auth-input"
                disabled={loading}
              />
            </Field>

            <div className="auth-two-col">
              <Field id="reg-email" label="School Email">
                <input
                  id="reg-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jordan@school.edu"
                  className="auth-input"
                  disabled={loading}
                />
              </Field>
              <Field id="reg-username" label="Username" hint="Letters, numbers, dots, underscores">
                <input
                  id="reg-username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. jordan.lee"
                  className="auth-input"
                  disabled={loading}
                />
              </Field>
            </div>

            {/* ── Section 2: Academic ──────────────────────────────────── */}
            <div className="auth-section-label">Academic Information</div>

            <div className="auth-two-col">
              <Field id="reg-class" label="Class / Grade">
                <select
                  id="reg-class"
                  value={className}
                  onChange={e => setClassName(e.target.value)}
                  className="auth-input auth-select"
                  disabled={loading}
                >
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>
              </Field>
              <Field id="reg-stream" label="Academic Stream">
                <select
                  id="reg-stream"
                  value={stream}
                  onChange={e => setStream(e.target.value)}
                  className="auth-input auth-select"
                  disabled={loading}
                >
                  <option value="Science & Technology">Science &amp; Technology</option>
                  <option value="Commerce & Economics">Commerce &amp; Economics</option>
                  <option value="Humanities & Arts">Humanities &amp; Arts</option>
                  <option value="General Studies">General Studies</option>
                </select>
              </Field>
            </div>

            {/* ── Section 3: Security ──────────────────────────────────── */}
            <div className="auth-section-label">Account Security</div>

            <div className="auth-two-col">
              <div className="auth-field-group">
                <label htmlFor="reg-password" className="auth-label">Password</label>
                <div className="auth-input-wrap">
                  <input
                    id="reg-password"
                    type={showPw ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="auth-input auth-input-padded-right"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="auth-eye-btn"
                    aria-label="Toggle password"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {/* Strength bar */}
                {password && (
                  <div className="auth-pw-strength">
                    <div className="auth-pw-bar">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div
                          key={i}
                          className="auth-pw-segment"
                          style={{ backgroundColor: i <= pwStrength ? PW_COLORS[pwStrength] : '#E2E8F0' }}
                        />
                      ))}
                    </div>
                    <span style={{ color: PW_COLORS[pwStrength], fontSize: '11px', fontWeight: 600 }}>
                      {PW_LABELS[pwStrength]}
                    </span>
                  </div>
                )}
              </div>

              <div className="auth-field-group">
                <label htmlFor="reg-confirm-pw" className="auth-label">Confirm Password</label>
                <div className="auth-input-wrap">
                  <input
                    id="reg-confirm-pw"
                    type={showCPw ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className={`auth-input auth-input-padded-right ${pwMismatch ? 'auth-input--error' : pwMatch ? 'auth-input--success' : ''}`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCPw(v => !v)}
                    className="auth-eye-btn"
                    aria-label="Toggle confirm password"
                    tabIndex={-1}
                  >
                    {showCPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {confirmPassword && (
                  <div className={`auth-pw-match ${pwMatch ? 'auth-pw-match--ok' : 'auth-pw-match--err'}`}>
                    {pwMatch ? <Check size={12} /> : <X size={12} />}
                    <span>{pwMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Password requirements checklist */}
            <div className="auth-pw-checks">
              {pwChecks.map(c => (
                <div key={c.label} className={`auth-pw-check ${c.met ? 'auth-pw-check--met' : ''}`}>
                  <div className="auth-pw-check-dot" />
                  <span>{c.label}</span>
                </div>
              ))}
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="register-submit-btn"
              disabled={loading}
              className="auth-btn-primary"
            >
              {loading ? (
                <><Loader2 size={18} className="auth-spinner" /><span>Creating account…</span></>
              ) : (
                <><span>Create Account</span><ArrowRight size={17} /></>
              )}
            </button>
          </form>

          {/* Back to login */}
          <p className="auth-switch-text">
            Already have an account?{' '}
            <button
              type="button"
              id="register-back-to-login"
              onClick={onNavigateToLogin}
              className="auth-link"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

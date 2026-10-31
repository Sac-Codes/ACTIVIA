import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle, Loader2, Inbox, Send } from 'lucide-react';
import { firebaseSendPasswordReset } from '../../lib/firebaseAuth';
import './auth.css';

interface ForgotPasswordPageProps {
  onNavigateToLogin: () => void;
  onNavigateToReset: (identifier: string, code?: string) => void;
  schoolName?: string;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onNavigateToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [authMode, setAuthMode] = useState<'firebase' | 'express'>('express');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setAuthMode((import.meta.env.VITE_AUTH_MODE as 'firebase' | 'express') || 'express');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) { setError('Please enter your school email address.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.'); return;
    }

    setLoading(true);
    try {
      if (authMode === 'firebase') {
        await firebaseSendPasswordReset(cleanEmail);
        setSent(true);
      } else {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emailOrUsername: cleanEmail }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to send reset instructions.');
        setSent(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="auth-success-page">
        <div className="auth-success-card">
          <div className="auth-success-icon-wrap">
            <Inbox size={32} />
          </div>
          <h2 className="auth-success-title">Check your inbox</h2>
          <p className="auth-success-msg">
            We've sent password reset instructions to{' '}
            <strong style={{ color: '#172033' }}>{email}</strong>.
            Click the link in the email to set a new password.
          </p>
          <p style={{ fontSize: 13, color: '#64748B', marginBottom: 24 }}>
            Didn't receive it? Check your spam folder or contact school IT.
          </p>
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="auth-btn-primary"
          >
            <ArrowLeft size={16} />
            <span>Back to Sign In</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`auth-success-page`} style={{ background: '#F8FAFC' }}>
      <div className="auth-success-card" style={{ textAlign: 'left' }}>

        {/* Logo */}
        <div className="auth-logo" style={{ marginBottom: 28 }}>
          <div className="auth-logo-icon" style={{ background: '#4F46E5', border: 'none' }}>
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
              <path d="M16 4 L20 13 L30 13 L22 19 L25 28 L16 22 L7 28 L10 19 L2 13 L12 13 Z" fill="white"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20, color: '#172033', letterSpacing: '0.03em' }}>ACTIVIA</span>
        </div>

        <h2 className="auth-form-title" style={{ marginBottom: 8 }}>Reset your password</h2>
        <p className="auth-form-subtitle" style={{ marginBottom: 24 }}>
          Enter your school email and we'll send instructions to reset your password.
        </p>

        {error && (
          <div className="auth-error-alert" role="alert">
            <AlertCircle className="auth-error-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-field-group">
            <label htmlFor="forgot-email" className="auth-label">School Email Address</label>
            <input
              id="forgot-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your.name@school.edu"
              className="auth-input"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-btn-primary"
          >
            {loading ? (
              <><Loader2 size={18} className="auth-spinner" /><span>Sending…</span></>
            ) : (
              <><Send size={16} /><span>Send Reset Instructions</span></>
            )}
          </button>
        </form>

        <p className="auth-switch-text" style={{ marginTop: 20 }}>
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="auth-link"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <ArrowLeft size={13} />
            Back to Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

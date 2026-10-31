import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ResetPasswordPageProps {
  initialIdentifier?: string;
  initialCode?: string;
  onNavigateToLogin: () => void;
  schoolName?: string;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  initialIdentifier = '',
  initialCode = '',
  onNavigateToLogin,
  schoolName = 'ACTIVIA Hub'
}) => {
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [token, setToken] = useState(initialCode);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim() || !token.trim() || !newPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrUsername: identifier.trim(),
          token: token.trim(),
          newPassword,
          confirmPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Password reset failed. Please check the code and try again.');
        setLoading(false);
        return;
      }

      setSuccessMessage(data.message || 'Your password has been successfully updated.');
    } catch (err: any) {
      setErrorMessage('Connection failed. Please check your network and retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-app-brand text-white flex items-center justify-center shadow-md">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-app-text tracking-tight">
              {schoolName}
            </h1>
            <p className="text-xs text-app-muted">Password Security Center</p>
          </div>
        </div>

        <h2 className="mt-6 text-center text-xl sm:text-2xl font-bold font-display text-app-text">
          Set New Password
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-app-muted">
          Enter your verification code and choose a secure replacement password
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xs border border-app-border rounded-2xl">
          {successMessage ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-app-text font-display">
                Password Successfully Reset!
              </h3>
              <p className="text-xs text-app-muted">
                {successMessage}
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-app-brand hover:bg-indigo-700 shadow-xs transition-all inline-flex items-center justify-center gap-2"
                >
                  <span>Sign In with New Password</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{errorMessage}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Identifier */}
                <div>
                  <label className="block text-xs font-semibold text-app-text uppercase tracking-wider mb-1">
                    Email or Username
                  </label>
                  <div className="relative rounded-xl border border-app-border focus-within:border-app-brand focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-app-muted">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. alex.rivera@school.edu"
                      className="block w-full pl-10 pr-3 py-2 text-sm bg-transparent text-app-text placeholder:text-app-subtle focus:outline-none rounded-xl"
                    />
                  </div>
                </div>

                {/* Verification Code */}
                <div>
                  <label className="block text-xs font-semibold text-app-text uppercase tracking-wider mb-1">
                    6-Digit Verification Code
                  </label>
                  <div className="relative rounded-xl border border-app-border focus-within:border-app-brand focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-app-muted">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="123456"
                      className="block w-full pl-10 pr-3 py-2 text-sm font-mono tracking-widest bg-transparent text-app-text placeholder:text-app-subtle focus:outline-none rounded-xl"
                    />
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-app-text uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <div className="relative rounded-xl border border-app-border focus-within:border-app-brand focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-app-muted">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="block w-full pl-10 pr-10 py-2 text-sm bg-transparent text-app-text placeholder:text-app-subtle focus:outline-none rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-app-muted hover:text-app-text"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-semibold text-app-text uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative rounded-xl border border-app-border focus-within:border-app-brand focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-app-muted">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="block w-full pl-10 pr-3 py-2 text-sm bg-transparent text-app-text placeholder:text-app-subtle focus:outline-none rounded-xl"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-app-brand hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 shadow-xs flex items-center justify-center gap-2 transition-all"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <span>Save New Password</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 pt-5 border-t border-app-border text-center">
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="inline-flex items-center gap-1.5 text-xs text-app-muted hover:text-app-brand font-medium transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

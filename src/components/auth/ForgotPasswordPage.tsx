import React, { useState } from 'react';
import {
  GraduationCap,
  Mail,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigateToLogin: () => void;
  onNavigateToReset: (identifier: string, code?: string) => void;
  schoolName?: string;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onNavigateToLogin,
  onNavigateToReset,
  schoolName = 'ACTIVIA Hub'
}) => {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setErrorMessage('Please enter your school email or username.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername: cleanIdentifier }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Failed to initiate password recovery.');
        setLoading(false);
        return;
      }

      if (data.recoveryCode) {
        setRecoveryCode(data.recoveryCode);
      }
    } catch (err: any) {
      setErrorMessage('Failed to connect to authentication server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (recoveryCode) {
      navigator.clipboard.writeText(recoveryCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
            <p className="text-xs text-app-muted">Account Recovery Service</p>
          </div>
        </div>

        <h2 className="mt-6 text-center text-xl sm:text-2xl font-bold font-display text-app-text">
          Reset Your Password
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-app-muted">
          Enter your registered school email address or username to receive a verification code
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xs border border-app-border rounded-2xl">
          {recoveryCode ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-emerald-900 font-display">
                  Verification Code Generated
                </h3>
                <p className="text-xs text-emerald-700 mt-1">
                  Use this 6-digit code to securely establish your new account password:
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="font-mono text-2xl font-bold tracking-widest text-emerald-900 bg-white px-4 py-1.5 rounded-lg border border-emerald-300">
                    {recoveryCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors"
                    title="Copy code"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateToReset(identifier, recoveryCode)}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-app-brand hover:bg-indigo-700 shadow-xs flex items-center justify-center gap-2 transition-all"
                >
                  <span>Proceed to Set New Password</span>
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

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="identifier" className="block text-xs font-semibold text-app-text uppercase tracking-wider mb-1.5">
                    School Email or Username
                  </label>
                  <div className="relative rounded-xl border border-app-border focus-within:border-app-brand focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-app-muted">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="identifier"
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. alex.rivera@school.edu or student"
                      className="block w-full pl-10 pr-3 py-2.5 text-sm bg-transparent text-app-text placeholder:text-app-subtle focus:outline-none rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-app-brand hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 shadow-xs flex items-center justify-center gap-2 transition-all"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <span>Generate Recovery Code</span>
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

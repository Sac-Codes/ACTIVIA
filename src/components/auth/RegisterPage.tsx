import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Layers,
  IdCard,
  Shield,
  CheckCheck,
  XCircle
} from 'lucide-react';
import { firebaseRegisterStudent } from '../../lib/firebaseAuth';

interface RegisterPageProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
  schoolName?: string;
}

type AuthMode = 'firebase' | 'express';

// ── Password strength indicator helper ────────────────────────────────────────
function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 2) return { score, label: 'Fair', color: 'bg-amber-500' };
  if (score <= 3) return { score, label: 'Good', color: 'bg-yellow-500' };
  if (score <= 4) return { score, label: 'Strong', color: 'bg-emerald-500' };
  return { score, label: 'Excellent', color: 'bg-green-600' };
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
  schoolName = 'ACTIVIA Hub'
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [className, setClassName] = useState('Grade 10');
  const [stream, setStream] = useState('Science & Technology');
  const [studentId, setStudentId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ message: string; status: string } | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('firebase');

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  useEffect(() => {
    const mode = (import.meta.env.VITE_AUTH_MODE as AuthMode) || 'firebase';
    setAuthMode(mode);
  }, []);

  // ── Firebase Registration ────────────────────────────────────────────────
  const handleFirebaseRegister = async () => {
    try {
      const result = await firebaseRegisterStudent({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        username: username.trim().toLowerCase(),
        password,
        className,
        stream,
        studentId: studentId.trim() || undefined,
        grade: className,
      });
      setSuccessInfo({ message: result.message, status: result.status });
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  // ── Express API Registration (fallback) ─────────────────────────────────
  const handleExpressRegister = async () => {
    try {
      const response = await fetch('/api/auth/register', {
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
          studentId: studentId.trim() || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Registration failed. Please check your information.');
        setLoading(false);
        return;
      }

      setSuccessInfo({
        message: data.message || 'Student account created successfully.',
        status: data.status || 'active'
      });
    } catch (err: any) {
      setErrorMessage('Unable to contact the school server. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!fullName.trim() || !email.trim() || !username.trim() || !password) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Password and confirmation password do not match.');
      return;
    }

    if (username.trim().length < 3) {
      setErrorMessage('Username must be at least 3 characters long.');
      return;
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(username.trim())) {
      setErrorMessage('Username can only contain letters, numbers, dots, underscores, and hyphens.');
      return;
    }

    setLoading(true);

    if (authMode === 'firebase') {
      await handleFirebaseRegister();
    } else {
      await handleExpressRegister();
    }
  };

  // ── Success Screen ────────────────────────────────────────────────────────
  if (successInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex flex-col justify-center items-center py-12 px-4 font-sans">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/60 shadow-xl shadow-slate-200/60 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-200 mb-4">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h3 className="text-xl font-bold text-app-text font-display mb-2">
            {successInfo.status === 'pending_approval' ? 'Enrollment Pending Approval' : 'Registration Complete!'}
          </h3>
          <p className="text-sm text-app-muted mb-6 leading-relaxed">{successInfo.message}</p>
          <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4 mb-6 text-left space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-emerald-700">
              <CheckCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Account created with <strong>Viewer (Student)</strong> permissions</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-700">
              <CheckCheck className="w-3.5 h-3.5 shrink-0" />
              <span>You can discover and register for activities</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-700">
              <CheckCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Track your achievements and portfolio</span>
            </div>
          </div>
          <button
            type="button"
            id="register-success-signin"
            onClick={onNavigateToLogin}
            className="w-full px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-200 transition-all inline-flex items-center justify-center gap-2"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── Registration Form ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans">

      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-100/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-xl">
        {/* Brand Header */}
        <div className="flex justify-center items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-app-text tracking-tight">{schoolName}</h1>
            <p className="text-xs text-app-muted">Student Registration &amp; Co-Curricular Enrollment</p>
          </div>
        </div>

        <h2 className="mt-6 text-center text-xl sm:text-2xl font-bold font-display text-app-text">
          Create Student Account
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-app-muted">
          Register to participate in school activities, competitions, clubs, and track achievements
        </p>
      </div>

      <div className="relative mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white/80 backdrop-blur-sm py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/60 border border-white/60 rounded-2xl">

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5" role="alert">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Security notice */}
          <div className="mb-6 p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              Self-registration automatically grants <strong>Viewer (Student)</strong> role permissions.
              Staff and admin accounts are provisioned directly by the Principal.
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-0" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Full Name — spans full width */}
              <div className="sm:col-span-2">
                <label htmlFor="reg-full-name" className="block text-xs font-semibold text-[#172033] uppercase tracking-wider mb-1.5">
                  Full Legal Name <span className="text-red-500 normal-case font-normal">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-full-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Jordan Lee"
                    className="block w-full pl-10 pr-3 py-2.5 text-sm bg-white text-[#172033] placeholder:text-slate-400 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>

              {/* School Email */}
              <div>
                <label htmlFor="reg-email" className="block text-xs font-semibold text-[#172033] uppercase tracking-wider mb-1.5">
                  School Email <span className="text-red-500 normal-case font-normal">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jordan.lee@school.edu"
                    className="block w-full pl-10 pr-3 py-2.5 text-sm bg-white text-[#172033] placeholder:text-slate-400 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label htmlFor="reg-username" className="block text-xs font-semibold text-[#172033] uppercase tracking-wider mb-1.5">
                  Username <span className="text-red-500 normal-case font-normal">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. jordan.lee"
                    className="block w-full pl-10 pr-3 py-2.5 text-sm bg-white text-[#172033] placeholder:text-slate-400 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-500">Letters, numbers, dots, underscores only. Min 3 characters.</p>
              </div>

              {/* Class / Grade */}
              <div>
                <label htmlFor="reg-class" className="block text-xs font-semibold text-[#172033] uppercase tracking-wider mb-1.5">
                  Class / Grade <span className="text-red-500 normal-case font-normal">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <select
                    id="reg-class"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 text-sm bg-white text-[#172033] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100 transition-all appearance-none"
                  >
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>
              </div>

              {/* Academic Stream */}
              <div>
                <label htmlFor="reg-stream" className="block text-xs font-semibold text-[#172033] uppercase tracking-wider mb-1.5">
                  Academic Stream
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <select
                    id="reg-stream"
                    value={stream}
                    onChange={(e) => setStream(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 text-sm bg-white text-[#172033] border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100 transition-all appearance-none"
                  >
                    <option value="Science & Technology">Science &amp; Technology (STEM)</option>
                    <option value="Commerce & Economics">Commerce &amp; Economics</option>
                    <option value="Humanities & Arts">Humanities &amp; Arts</option>
                    <option value="General Studies">General Studies</option>
                  </select>
                </div>
              </div>

              {/* Student ID — spans full width */}
              <div className="sm:col-span-2">
                <label htmlFor="reg-student-id" className="block text-xs font-semibold text-[#172033] uppercase tracking-wider mb-1.5">
                  Student ID Number <span className="text-slate-400 normal-case font-normal text-[10px]">(Optional — auto-generated if blank)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <IdCard className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-student-id"
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. STU-2026-9042"
                    className="block w-full pl-10 pr-3 py-2.5 text-sm bg-white text-[#172033] placeholder:text-slate-400 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="reg-password" className="block text-xs font-semibold text-[#172033] uppercase tracking-wider mb-1.5">
                  Password <span className="text-red-500 normal-case font-normal">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="block w-full pl-10 pr-10 py-2.5 text-sm bg-white text-[#172033] placeholder:text-slate-400 border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Password strength bar */}
                {password && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            i <= passwordStrength.score ? passwordStrength.color : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-[10px] font-medium ${
                      passwordStrength.score <= 1 ? 'text-red-600' :
                      passwordStrength.score <= 2 ? 'text-amber-600' :
                      passwordStrength.score <= 3 ? 'text-yellow-600' :
                      'text-emerald-600'
                    }`}>{passwordStrength.label}</p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="reg-confirm-password" className="block text-xs font-semibold text-[#172033] uppercase tracking-wider mb-1.5">
                  Confirm Password <span className="text-red-500 normal-case font-normal">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className={`block w-full pl-10 pr-10 py-2.5 text-sm bg-white text-[#172033] placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 transition-all border ${
                      passwordsMismatch
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                        : passwordsMatch
                        ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-100'
                        : 'border-[#CBD5E1] focus:border-[#4F46E5] focus:ring-indigo-100'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Match indicator */}
                {confirmPassword && (
                  <div className={`mt-1.5 flex items-center gap-1 text-[10px] font-medium ${
                    passwordsMatch ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {passwordsMatch
                      ? <><CheckCheck className="w-3 h-3" /> Passwords match</>
                      : <><XCircle className="w-3 h-3" /> Passwords do not match</>
                    }
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-5">
              <button
                type="submit"
                id="register-submit-btn"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:from-indigo-800 active:to-violet-800 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 hover:shadow-indigo-300 flex items-center justify-center gap-2 transition-all duration-200"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Back to Login */}
          <div className="mt-5 pt-4 border-t border-app-border text-center flex items-center justify-center gap-2">
            <button
              type="button"
              id="register-back-to-login"
              onClick={onNavigateToLogin}
              className="inline-flex items-center gap-1.5 text-xs text-app-muted hover:text-app-brand font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>

          {/* Firebase Mode Badge */}
          {authMode === 'firebase' && (
            <div className="mt-4 p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-[11px] text-indigo-700 text-center">
              🔐 Secured by Firebase Authentication — Project: <strong>activia-f36ee</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

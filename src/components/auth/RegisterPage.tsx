import React, { useState } from 'react';
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
  Shield
} from 'lucide-react';

interface RegisterPageProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
  schoolName?: string;
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
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ message: string; status: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!fullName.trim() || !email.trim() || !username.trim() || !password) {
      setErrorMessage('Please complete all required fields.');
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

    setLoading(true);

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

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        {/* Brand Header */}
        <div className="flex justify-center items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-app-brand text-white flex items-center justify-center shadow-md">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-app-text tracking-tight">
              {schoolName}
            </h1>
            <p className="text-xs text-app-muted">Student Registration & Co-Curricular Enrollment</p>
          </div>
        </div>

        <h2 className="mt-6 text-center text-xl sm:text-2xl font-bold font-display text-app-text">
          Create Student Account
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-app-muted">
          Register to participate in school activities, competitions, clubs, and track achievements
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xs border border-app-border rounded-2xl">
          {successInfo ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-app-text font-display">
                {successInfo.status === 'pending_approval' ? 'Enrollment Pending Approval' : 'Registration Complete!'}
              </h3>
              <p className="text-xs sm:text-sm text-app-muted max-w-md mx-auto">
                {successInfo.message}
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-app-brand hover:bg-indigo-700 shadow-xs transition-all inline-flex items-center gap-2"
                >
                  <span>Proceed to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{errorMessage}</div>
                </div>
              )}

              {/* Security notice */}
              <div className="mb-5 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Self-registration automatically grants <strong>Viewer (Student)</strong> role permissions. Staff accounts are provisioned directly by the Principal.
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-app-text uppercase tracking-wider mb-1">
                      Full Legal Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative rounded-xl border border-app-border focus-within:border-app-brand focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-app-muted">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Jordan Lee"
                        className="block w-full pl-10 pr-3 py-2 text-sm bg-transparent text-app-text placeholder:text-app-subtle focus:outline-none rounded-xl"
                      />
                    </div>
                  </div>

                  {/* School Email */}
                  <div>
                    <label className="block text-xs font-semibold text-app-text uppercase tracking-wider mb-1">
                      School Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative rounded-xl border border-app-border focus-within:border-app-brand focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-app-muted">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jordan.lee@school.edu"
                        className="block w-full pl-10 pr-3 py-2 text-sm bg-transparent text-app-text placeholder:text-app-subtle focus:outline-none rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-xs font-semibold text-app-text uppercase tracking-wider mb-1">
                      Chosen Username <span className="text-red-500">*</span>
                    </label>
                    <div className="relative rounded-xl border border-app-border focus-within:border-app-brand focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-app-muted">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. jordan.lee"
                        className="block w-full pl-10 pr-3 py-2 text-sm bg-transparent text-app-text placeholder:text-app-subtle focus:outline-none rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Class / Grade */}
                  <div>
                    <label className="block text-xs font-semibold text-app-text uppercase tracking-wider mb-1">
                      Class / Grade <span className="text-red-500">*</span>
                    </label>
                    <div className="relative rounded-xl border border-app-border focus-within:border-app-brand transition-all">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-app-muted">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <select
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 text-sm bg-transparent text-app-text focus:outline-none rounded-xl"
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
                    <label className="block text-xs font-semibold text-app-text uppercase tracking-wider mb-1">
                      Academic Stream
                    </label>
                    <div className="relative rounded-xl border border-app-border focus-within:border-app-brand transition-all">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-app-muted">
                        <Layers className="w-4 h-4" />
                      </div>
                      <select
                        value={stream}
                        onChange={(e) => setStream(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 text-sm bg-transparent text-app-text focus:outline-none rounded-xl"
                      >
                        <option value="Science & Technology">Science & Technology (STEM)</option>
                        <option value="Commerce & Economics">Commerce & Economics</option>
                        <option value="Humanities & Arts">Humanities & Arts</option>
                        <option value="General Studies">General Studies</option>
                      </select>
                    </div>
                  </div>

                  {/* Student ID */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-app-text uppercase tracking-wider mb-1">
                      Student ID Number <span className="text-app-muted font-normal">(Optional)</span>
                    </label>
                    <div className="relative rounded-xl border border-app-border focus-within:border-app-brand focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-app-muted">
                        <IdCard className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="e.g. STU-2026-9042 (Will be generated if left blank)"
                        className="block w-full pl-10 pr-3 py-2 text-sm bg-transparent text-app-text placeholder:text-app-subtle focus:outline-none rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-app-text uppercase tracking-wider mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative rounded-xl border border-app-border focus-within:border-app-brand focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-app-muted">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold text-app-text uppercase tracking-wider mb-1">
                      Confirm Password <span className="text-red-500">*</span>
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
                        placeholder="Re-enter password"
                        className="block w-full pl-10 pr-3 py-2 text-sm bg-transparent text-app-text placeholder:text-app-subtle focus:outline-none rounded-xl"
                      />
                    </div>
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
                        <span>Enrolling Student Account...</span>
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

              <div className="mt-5 pt-4 border-t border-app-border text-center flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="inline-flex items-center gap-1.5 text-xs text-app-muted hover:text-app-brand font-medium transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

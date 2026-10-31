import React from 'react';
import { Clock, LogOut, RefreshCw, Mail, GraduationCap } from 'lucide-react';
import { AuthUser } from '../../types';

interface PendingApprovalPageProps {
  user?: AuthUser;
  onRefresh: () => void;
  onLogout: () => void;
  schoolName?: string;
}

export const PendingApprovalPage: React.FC<PendingApprovalPageProps> = ({
  user,
  onRefresh,
  onLogout,
  schoolName = 'ACTIVIA Hub'
}) => {
  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-app-brand text-white flex items-center justify-center shadow-md">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold font-display text-app-text tracking-tight">
              {schoolName}
            </h1>
            <p className="text-xs text-app-muted">Student Registration Review</p>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xs border border-app-border rounded-2xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Clock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold font-display text-app-text">
            Enrollment Pending Approval
          </h2>

          <p className="text-xs sm:text-sm text-app-muted leading-relaxed">
            Welcome, <strong>{user?.fullName || 'Student'}</strong>. Your account has been registered, but institutional security requires administrative verification before co-curricular access is unlocked.
          </p>

          <div className="p-3.5 rounded-xl bg-app-secondary border border-app-border text-left text-xs space-y-1.5 text-app-muted">
            <div className="flex justify-between">
              <span>Account Username:</span>
              <span className="font-semibold text-app-text">{user?.username}</span>
            </div>
            <div className="flex justify-between">
              <span>Registered Email:</span>
              <span className="font-semibold text-app-text">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                Awaiting Principal Approval
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onRefresh}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-app-brand hover:bg-indigo-700 shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Check Verification Status</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-app-muted hover:text-app-text bg-app-secondary hover:bg-gray-100 border border-app-border flex items-center justify-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out to Login Page</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

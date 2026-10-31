import React from 'react';
import { ShieldX, ArrowLeft, Home, Lock } from 'lucide-react';
import { UserRole, ROLE_LABELS } from '../../types';

interface AccessDeniedPageProps {
  currentRole: UserRole;
  requiredRole?: string;
  onReturnToDashboard: () => void;
  attemptedSection?: string;
}

export const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({
  currentRole,
  requiredRole = 'Admin or Editor',
  onReturnToDashboard,
  attemptedSection = 'restricted administrative area'
}) => {
  const currentRoleLabel = ROLE_LABELS[currentRole] || currentRole;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-2xl border border-app-border p-8 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-5 border border-red-100">
          <ShieldX className="w-8 h-8" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 mb-3">
          <Lock className="w-3.5 h-3.5" /> Access Restricted
        </span>

        <h2 className="text-xl font-bold font-display text-app-text">
          Permission Denied
        </h2>

        <p className="text-xs sm:text-sm text-app-muted mt-2 leading-relaxed">
          Your active account is registered as <strong className="text-app-text">{currentRoleLabel}</strong>. 
          You do not possess the necessary authorization credentials to access this {attemptedSection}.
        </p>

        <div className="mt-4 p-3 rounded-xl bg-app-secondary border border-app-border text-left text-xs text-app-muted space-y-1">
          <div className="flex justify-between">
            <span>Your Current Role:</span>
            <span className="font-semibold text-app-text">{currentRoleLabel}</span>
          </div>
          <div className="flex justify-between">
            <span>Required Authorization:</span>
            <span className="font-semibold text-indigo-700">{requiredRole}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onReturnToDashboard}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-app-brand hover:bg-indigo-700 shadow-xs flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to My Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

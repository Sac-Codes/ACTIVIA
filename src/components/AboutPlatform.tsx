import React from 'react';
import {
  ShieldCheck,
  Database,
  Cpu,
  Layers,
  CheckCircle2,
  Lock,
  Calendar,
  AlertTriangle,
  Award,
  Terminal,
} from 'lucide-react';

export const AboutPlatform: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Platform Title */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3">
          <Award className="w-3.5 h-3.5" />
          <span>Competition Architecture & Documentation</span>
        </div>
        <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          CampusFlow — Technical Deep Dive
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
          Engineered as a production-grade, self-contained school activity coordination platform. Built to solve real coordination challenges with persistent database storage, zero external cloud dependencies, and instant local execution.
        </p>
      </div>

      {/* 10-Minute Presentation Agenda */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <h3 className="font-heading text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          Official 10-Minute Competition Presentation Roadmap
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
              Min 0–2 (Problem)
            </span>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Coordination Crisis</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Decentralized flyers, conflicting sports/arts bookings, missed student opportunities, and uncoordinated staff schedules.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
              Min 2–5 (Solution)
            </span>
            <h4 className="text-sm font-bold text-slate-900 mb-1">CampusFlow Platform</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Student discovery dashboard, live filtering, chronological agenda, iCal export, and responsive mobile layout.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
              Min 5–8 (Tech Deep-Dive)
            </span>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Architecture & Data</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Persistent SQLite database, scrypt password hashing, session tokens, strict validation, conflict engine & DB inspector.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
              Min 8–10 (Impact)
            </span>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Impact & Future</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Streamlined student engagement, zero double-booking errors, and modular roadmap for attendance & push notifications.
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mb-4">
            <Cpu className="w-5 h-5" />
          </div>
          <h4 className="font-heading font-bold text-base text-slate-900 mb-2">
            Frontend Architecture
          </h4>
          <ul className="text-xs text-slate-600 space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>React 18 with TypeScript</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Vite 6 Fast Bundler & Proxy</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Tailwind CSS with Custom Tokens</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Lucide Iconography & Accessible ARIA</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4">
            <Terminal className="w-5 h-5" />
          </div>
          <h4 className="font-heading font-bold text-base text-slate-900 mb-2">
            Backend API & Engine
          </h4>
          <ul className="text-xs text-slate-600 space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Node.js 25 + Express REST API</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Cryptographic Scrypt Hashing & HMAC</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Real-Time Schedule Conflict Engine</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Automated 12-Test Verification Suite</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4">
            <Database className="w-5 h-5" />
          </div>
          <h4 className="font-heading font-bold text-base text-slate-900 mb-2">
            Database & Persistence
          </h4>
          <ul className="text-xs text-slate-600 space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>SQLite with WAL mode enabled</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Foreign Key Constraints Enforcement</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Parameterized Queries (SQLi Proof)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Live DB Inspector with Hash Masking</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Security & Validation Highlights */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="w-6 h-6 text-teal-400" />
          <h3 className="font-heading font-bold text-lg text-white">
            Security & Data Protection Standards
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <h4 className="font-bold text-white mb-1">Zero Plaintext Credentials</h4>
            <p className="leading-relaxed">
              Passwords are salted and hashed with 64-byte derived keys using Node's cryptographic <code className="text-teal-300">scrypt</code> algorithm with timing-safe validation.
            </p>
          </div>
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <h4 className="font-bold text-white mb-1">Enforced Draft Privacy</h4>
            <p className="leading-relaxed">
              Draft events are strictly isolated on the server level. Public endpoints automatically filter out any unpublished records.
            </p>
          </div>
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <h4 className="font-bold text-white mb-1">Time Range & Input Validation</h4>
            <p className="leading-relaxed">
              The API verifies date formats, prevents events where <code className="text-teal-300">end_time &le; start_time</code>, and sanitizes all inputs.
            </p>
          </div>
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <h4 className="font-bold text-white mb-1">Full Administrative Audit Trail</h4>
            <p className="leading-relaxed">
              Every insert, update, deletion, and login is recorded in the persistent <code className="text-teal-300">audit_logs</code> table with timestamps and actor IDs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

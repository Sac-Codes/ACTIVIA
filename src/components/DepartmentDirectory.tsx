import React from 'react';
import {
  Layers,
  ArrowRight,
  BookOpen,
  Cpu,
  Palette,
  Trophy,
  Users,
  Briefcase,
} from 'lucide-react';
import { Department } from '../types';

interface DepartmentDirectoryProps {
  departments: Department[];
  onSelectDepartment: (deptId: number) => void;
}

export const DepartmentDirectory: React.FC<DepartmentDirectoryProps> = ({
  departments,
  onSelectDepartment,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu':
        return Cpu;
      case 'Palette':
        return Palette;
      case 'Trophy':
        return Trophy;
      case 'Users':
        return Users;
      case 'Briefcase':
        return Briefcase;
      default:
        return BookOpen;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3">
          <Layers className="w-3.5 h-3.5" />
          <span>Campus Organizations</span>
        </div>
        <h2 className="font-heading text-3xl font-extrabold text-slate-900 tracking-tight">
          School Departments & Co-Curriculars
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Explore upcoming initiatives, tournaments, and workshops curated by specialized academic faculties and student organizations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => {
          const Icon = getIcon(dept.icon);
          const color = dept.color || '#4f46e5';

          return (
            <div
              key={dept.id}
              onClick={() => onSelectDepartment(dept.id)}
              className="group bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-400 p-6 shadow-2xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  {/* Department Icon Box */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: `${color}15`,
                      color: color,
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Activity Count Badge */}
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: `${color}15`,
                      color: color,
                    }}
                  >
                    {dept.published_activity_count ?? dept.activity_count ?? 0} Active Events
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <h3 className="font-heading font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {dept.name}
                  </h3>
                  <span className="text-xs font-semibold text-slate-400">
                    ({dept.code})
                  </span>
                </div>

                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                  {dept.description || 'Dedicated campus division coordinating school-wide activities and competitions.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                <span>Filter activities for {dept.code}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

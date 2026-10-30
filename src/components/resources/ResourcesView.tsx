import React, { useState } from 'react';
import {
  FileText,
  Download,
  Search,
  Filter,
  FileCheck,
  Shield,
  BookOpen,
  FolderOpen,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface ResourceItem {
  id: number;
  title: string;
  category: string;
  description: string;
  file_url: string;
  file_type: string;
}

const DEFAULT_RESOURCES: ResourceItem[] = [
  {
    id: 1,
    title: 'Co-Curricular Policy & Student Handbook 2026-27',
    category: 'Guidelines',
    description: 'Official school regulations on attendance quotas, activity credits, academic eligibility thresholds, and student code of conduct during school events.',
    file_url: '#',
    file_type: 'PDF'
  },
  {
    id: 2,
    title: 'Student Medical Clearance & Safety Release Waiver',
    category: 'Forms',
    description: 'Mandatory annual health declaration and parent signature document required prior to participating in athletics, off-campus travel, or outdoor workshops.',
    file_url: '#',
    file_type: 'PDF'
  },
  {
    id: 3,
    title: 'Inter-House Championship Cup Regulations & Scoring Rubric',
    category: 'Handbooks',
    description: 'Complete points distribution matrix for Phoenix, Solaris, Titan, and Aquila across academic Olympiads, debate tournaments, and varsity sports.',
    file_url: '#',
    file_type: 'PDF'
  },
  {
    id: 4,
    title: 'Student Society Charter Proposal Template',
    category: 'Templates',
    description: 'Standard institutional application form, faculty advisor endorsement letter, and constitution bylaws template for chartering a new student organization.',
    file_url: '#',
    file_type: 'DOCX'
  },
  {
    id: 5,
    title: 'Competition Travel & Overnight Event Permission Slip',
    category: 'Forms',
    description: 'Official consent form for regional robotics tournaments, Model UN delegations, and state-wide academic decathlons.',
    file_url: '#',
    file_type: 'PDF'
  },
  {
    id: 6,
    title: 'Campus Laboratory & Engineering Workshop Safety Protocol',
    category: 'Guidelines',
    description: 'Laboratory safety standards, chemical hazard classifications, 3D printer usage policies, and machine shop equipment clearance.',
    file_url: '#',
    file_type: 'PDF'
  }
];

export const ResourcesView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'Guidelines', 'Forms', 'Handbooks', 'Templates'];

  const filtered = DEFAULT_RESOURCES.filter(r => {
    if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl border border-app-border p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-app-text">
            School Resources & Handbooks
          </h2>
          <p className="text-xs sm:text-sm text-app-muted mt-1">
            Access official school guidelines, downloadable parent consent forms, club constitution templates, and compliance handbooks.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-xl border border-app-border p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-app-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents and guidelines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-app-border bg-app-secondary focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                selectedCategory === cat
                  ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200'
                  : 'bg-white text-app-muted hover:bg-app-secondary border border-app-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(res => (
          <div
            key={res.id}
            className="bg-white rounded-xl border border-app-border p-5 shadow-xs hover:border-indigo-200 hover:shadow-card-hover transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {res.category}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-app-secondary text-app-muted font-bold border border-app-border">
                  {res.file_type}
                </span>
              </div>

              <h3 className="text-sm font-bold text-app-text mt-1">
                {res.title}
              </h3>
              <p className="text-xs text-app-muted leading-relaxed">
                {res.description}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-app-border flex items-center justify-between">
              <span className="text-[11px] text-app-subtle">Verified Institutional Document</span>
              <a
                href={res.file_url}
                onClick={(e) => {
                  e.preventDefault();
                  alert(`Downloading: ${res.title} (${res.file_type})`);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Document</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

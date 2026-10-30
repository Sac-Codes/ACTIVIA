import React, { useState } from 'react';
import {
  Users,
  Shield,
  Trophy,
  Calendar,
  MapPin,
  Check,
  Plus,
  Award,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Club, House } from '../../types';

interface ClubsDirectoryProps {
  clubs: Club[];
  houses: House[];
  onToggleMembership: (clubId: string) => void;
  onNavigate: (tab: string) => void;
}

export const ClubsDirectory: React.FC<ClubsDirectoryProps> = ({
  clubs,
  houses,
  onToggleMembership,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'clubs' | 'houses'>('clubs');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredClubs = clubs.filter(c =>
    selectedCategory === 'all' ? true : c.category === selectedCategory
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-xl border border-app-border p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-app-text">
            Clubs, Societies & House Standings
          </h2>
          <p className="text-xs sm:text-sm text-app-muted mt-1">
            Join recognized student organizations, explore meeting agendas, and inspect inter-house championship points.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-app-secondary border border-app-border self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('clubs')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'clubs'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-app-muted hover:text-app-text'
            }`}
          >
            Clubs & Societies ({clubs.length})
          </button>
          <button
            onClick={() => setActiveTab('houses')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'houses'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-app-muted hover:text-app-text'
            }`}
          >
            House Championship ({houses.length})
          </button>
        </div>
      </div>

      {/* CLUBS TAB */}
      {activeTab === 'clubs' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredClubs.map(club => (
              <div
                key={club.id}
                className="bg-white rounded-xl border border-app-border hover:border-indigo-300 shadow-xs hover:shadow-card-hover transition-all p-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                      {club.code}
                    </span>
                    <button
                      onClick={() => onToggleMembership(club.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                        club.isMember
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                      }`}
                    >
                      {club.isMember ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Member</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Join Club</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-app-text">{club.name}</h3>
                    <p className="text-xs text-app-muted leading-relaxed line-clamp-2 mt-1">
                      {club.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-app-border-subtle space-y-1 text-xs text-app-muted">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-app-subtle flex-shrink-0" />
                      <span>{club.meetingSchedule}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-app-subtle flex-shrink-0" />
                      <span>Room {club.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-app-subtle flex-shrink-0" />
                      <span>Advisor: {club.teacherMentor}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-app-border flex items-center justify-between text-[11px] text-app-muted">
                  <span>Roster: <strong className="text-app-text">{club.memberCount} active members</strong></span>
                  <button
                    onClick={() => onNavigate('activities')}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <span>Activities</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HOUSES TAB */}
      {activeTab === 'houses' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {houses.map(house => (
              <div
                key={house.id}
                className="bg-white rounded-xl border border-app-border p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-app-muted">
                    Rank #{house.rank}
                  </span>
                  <Trophy className="w-4 h-4 text-amber-500" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-app-text">{house.name}</h3>
                  <p className="text-xs text-app-muted italic mt-0.5">&ldquo;{house.motto}&rdquo;</p>
                </div>

                <div className="p-3 rounded-lg bg-app-secondary border border-app-border text-center">
                  <span className="text-2xl font-bold text-indigo-700">{house.points}</span>
                  <span className="text-xs text-app-muted block font-medium">Championship Points</span>
                </div>

                <div className="text-xs text-app-muted space-y-1">
                  <p>Captain: <strong className="text-app-text">{house.captain}</strong></p>
                  <p>Patron: <strong className="text-app-text">{house.patron}</strong></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

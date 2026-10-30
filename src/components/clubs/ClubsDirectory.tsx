import React, { useState } from 'react';
import {
  Users,
  Shield,
  Trophy,
  Calendar,
  MapPin,
  Sparkles,
  Check,
  Plus,
  Flame,
  Award,
  BookOpen,
  ArrowRight,
  ChevronRight
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
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-activia-mint flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Student Guilds & House Cup Standings
          </span>
          <h2 className="text-2xl font-bold font-display text-white mt-0.5">
            Clubs & House Championship
          </h2>
          <p className="text-xs text-activia-muted mt-1">
            Join recognized student societies, track weekly schedules, and inspect House Points standings.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-activia-surface border border-activia-border self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('clubs')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'clubs'
                ? 'bg-activia-blue text-white shadow-md'
                : 'text-activia-muted hover:text-white'
            }`}
          >
            Student Clubs ({clubs.length})
          </button>
          <button
            onClick={() => setActiveTab('houses')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'houses'
                ? 'bg-activia-blue text-white shadow-md'
                : 'text-activia-muted hover:text-white'
            }`}
          >
            House Cup Standings ({houses.length})
          </button>
        </div>
      </div>

      {/* CLUBS TAB */}
      {activeTab === 'clubs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map(club => (
              <div
                key={club.id}
                className="rounded-3xl bg-activia-surface border border-activia-border/70 hover:border-activia-blue/50 transition-all p-6 shadow-xl flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-activia-elevated border border-white/10 text-activia-cyan">
                      {club.code}
                    </span>
                    <button
                      onClick={() => onToggleMembership(club.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        club.isMember
                          ? 'bg-activia-mint/20 text-activia-mint border border-activia-mint/40 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/40'
                          : 'bg-activia-blue/20 text-activia-blue border border-activia-blue/30 hover:bg-activia-blue hover:text-white'
                      }`}
                    >
                      {club.isMember ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Member
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" /> Join Club
                        </>
                      )}
                    </button>
                  </div>

                  <h3 className="text-lg font-bold font-display text-white group-hover:text-activia-blue transition-colors">
                    {club.name}
                  </h3>
                  <p className="text-xs text-activia-cyan font-medium mt-0.5">{club.tagline}</p>
                  <p className="text-xs text-activia-muted mt-2 leading-relaxed">
                    {club.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 space-y-2 text-xs text-activia-muted">
                  <div className="flex items-center justify-between">
                    <span>Mentor:</span>
                    <span className="text-white font-medium">{club.teacherMentor}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>President:</span>
                    <span className="text-white font-medium">{club.studentPresident}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Schedule:</span>
                    <span className="text-activia-text font-medium">{club.meetingSchedule}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Meeting Venue:</span>
                    <span className="text-activia-cyan font-medium">{club.location}</span>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] font-semibold text-white/80">
                    <span>{club.memberCount} Registered Members</span>
                    <span>{club.projectsActive} Active Initiatives</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HOUSES TAB */}
      {activeTab === 'houses' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {houses.map(house => (
              <div
                key={house.id}
                className="rounded-3xl bg-activia-surface border border-activia-border/70 p-6 shadow-xl flex flex-col justify-between relative overflow-hidden"
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-20"
                  style={{ backgroundColor: house.color }}
                />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: `${house.color}20`, color: house.color }}
                    >
                      Rank #{house.rank}
                    </span>
                    <Trophy className="w-5 h-5 text-amber-400" />
                  </div>

                  <h3 className="text-xl font-extrabold font-display text-white">{house.name}</h3>
                  <p className="text-xs text-activia-muted italic mt-0.5">&ldquo;{house.motto}&rdquo;</p>

                  <div className="my-5 p-4 rounded-2xl bg-activia-elevated/80 border border-white/5 text-center">
                    <span className="text-[10px] text-activia-muted uppercase tracking-wider block">
                      Total House Standings
                    </span>
                    <span className="text-3xl font-black font-display text-white mt-1 block">
                      {house.points} pts
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-activia-muted">
                    <p>Patron: <strong className="text-white">{house.patron}</strong></p>
                    <p>Captain: <strong className="text-white">{house.captain}</strong></p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5">
                  <h4 className="text-[11px] font-bold text-white mb-2">Recent Victories</h4>
                  <ul className="text-[11px] text-activia-muted space-y-1">
                    {house.recentAchievements.map((ach, i) => (
                      <li key={i} className="flex items-center gap-1.5 truncate">
                        <Award className="w-3 h-3 text-amber-400 flex-shrink-0" />
                        <span className="truncate">{ach}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

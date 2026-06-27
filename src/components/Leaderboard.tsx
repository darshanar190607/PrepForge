import React, { useState } from 'react';
import { User } from '../types';
import { Flame, Award, Calendar, Search, ArrowUpRight, CheckCircle } from 'lucide-react';

interface LeaderboardProps {
  users: User[];
  currentUser: User;
}

type Timeframe = 'allTime' | 'thisMonth' | 'thisWeek';

export default function Leaderboard({ users, currentUser }: LeaderboardProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('allTime');
  const [searchQuery, setSearchQuery] = useState('');

  // Generate deterministic consistency and active time for mock users
  const getConsistency = (u: User) => {
    if (u.id === 'user-admin') return 96;
    if (u.id === 'user-priya') return 92;
    if (u.id === 'user-aman') return 88;
    if (u.id === 'user-vikram') return 81;
    if (u.id === 'user-sneha') return 85;
    return 40;
  };

  const getLastActive = (u: User) => {
    if (u.id === 'user-admin') return '2 hours ago';
    if (u.id === 'user-priya') return '10 mins ago';
    if (u.id === 'user-aman') return '1 day ago';
    if (u.id === 'user-vikram') return '5 hours ago';
    if (u.id === 'user-sneha') return 'Just now';
    return '3 days ago';
  };

  // Filter and rank active members
  const activeMembers = users.filter(u => u.status === 'active');

  // Let's adjust values based on timeframe filter to make the UI interactive
  const getDisplayStats = (u: User) => {
    const consistency = getConsistency(u);
    const lastActive = getLastActive(u);
    
    if (timeframe === 'thisWeek') {
      // Scale down values slightly for weekly view
      return {
        solved: Math.max(1, Math.round(u.solvedCount * 0.15)),
        streak: Math.min(u.streak, 7),
        consistency: Math.max(50, consistency - 5),
        lastActive
      };
    } else if (timeframe === 'thisMonth') {
      return {
        solved: Math.max(1, Math.round(u.solvedCount * 0.6)),
        streak: Math.min(u.streak, 30),
        consistency: Math.max(50, consistency - 2),
        lastActive
      };
    }
    return {
      solved: u.solvedCount,
      streak: u.streak,
      consistency,
      lastActive
    };
  };

  // Sort by solved count, then streak
  const rankedMembers = [...activeMembers]
    .map(u => ({ ...u, stats: getDisplayStats(u) }))
    .sort((a, b) => {
      if (b.stats.solved !== a.stats.solved) {
        return b.stats.solved - a.stats.solved;
      }
      return b.stats.streak - a.stats.streak;
    });

  // Filter by search query
  const filteredRankings = rankedMembers.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" id="leaderboard-root">
      {/* Page Header */}
      <div className="bg-[#FFFFFF] border border-[#E2E2E2] p-5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4" id="leaderboard-header">
        <div>
          <h2 className="text-xl font-display font-bold text-[#111111]" id="leaderboard-title">
            PrepForge Leaderboard — Alpha Batch · June 2025
          </h2>
          <p className="text-[#888888] text-xs mt-1">
            Real-time standing of cohort participants based on consistency, streak levels, and verified solved coding problems.
          </p>
        </div>
        
        {/* Timeframe Filter Tabs */}
        <div className="flex bg-[#F7F7F7] p-1 rounded-lg border border-[#E2E2E2]" id="leaderboard-timeframe-selector">
          <button
            onClick={() => setTimeframe('allTime')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              timeframe === 'allTime' 
                ? 'bg-[#111111] text-[#FFFFFF]' 
                : 'text-[#888888] hover:text-[#111111]'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setTimeframe('thisMonth')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              timeframe === 'thisMonth' 
                ? 'bg-[#111111] text-[#FFFFFF]' 
                : 'text-[#888888] hover:text-[#111111]'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeframe('thisWeek')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              timeframe === 'thisWeek' 
                ? 'bg-[#111111] text-[#FFFFFF]' 
                : 'text-[#888888] hover:text-[#111111]'
            }`}
          >
            This Week
          </button>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {filteredRankings.length >= 3 && searchQuery === '' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="leaderboard-podium">
          {/* 2nd Place */}
          <div className="bg-[#F7F7F7] border border-[#E2E2E2] rounded-lg p-5 flex flex-col items-center justify-between text-center relative hover:shadow-md transition duration-150 order-2 md:order-1" id="podium-2nd">
            <span className="absolute top-4 left-4 text-xs font-mono font-bold text-[#888888]">#2</span>
            <div className="space-y-3 flex flex-col items-center mt-2">
              <div className="relative">
                <img 
                  src={filteredRankings[1].avatarUrl} 
                  alt={filteredRankings[1].name} 
                  className="w-16 h-16 rounded-full object-cover border border-[#E2E2E2]"
                />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-300 rounded-full border border-white flex items-center justify-center text-xs">🥈</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-[#111111] text-sm">{filteredRankings[1].name}</h3>
                <span className="text-[10px] text-[#888888] font-mono">{filteredRankings[1].email}</span>
              </div>
            </div>
            <div className="w-full grid grid-cols-2 gap-2 border-t border-[#E2E2E2] pt-3.5 mt-4 text-xs font-mono">
              <div className="text-left">
                <span className="text-[#888888] text-[10px] block uppercase font-bold">Solved</span>
                <span className="text-[#111111] font-bold mt-0.5 block">{filteredRankings[1].stats.solved}</span>
              </div>
              <div className="text-right">
                <span className="text-[#888888] text-[10px] block uppercase font-bold">Streak</span>
                <span className="text-[#EF4444] font-bold mt-0.5 block flex items-center justify-end gap-0.5">
                  <Flame size={12} className="inline" /> {filteredRankings[1].stats.streak}d
                </span>
              </div>
            </div>
          </div>

          {/* 1st Place */}
          <div className="bg-[#F7F7F7] border border-[#111111] rounded-lg p-6 flex flex-col items-center justify-between text-center relative shadow-sm hover:shadow-md transition duration-150 order-1 md:order-2 scale-105 z-10" id="podium-1st">
            <span className="absolute top-4 left-4 text-xs font-mono font-bold text-[#111111]">#1</span>
            <div className="space-y-3 flex flex-col items-center mt-2">
              <div className="relative">
                <img 
                  src={filteredRankings[0].avatarUrl} 
                  alt={filteredRankings[0].name} 
                  className="w-20 h-20 rounded-full object-cover border-2 border-[#22C55E]"
                />
                <span className="absolute -bottom-1 -right-1 w-7 h-7 bg-amber-400 rounded-full border border-white flex items-center justify-center text-sm shadow-sm">🥇</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-[#111111] text-base">{filteredRankings[0].name}</h3>
                <span className="text-xs text-[#22C55E] font-bold uppercase tracking-wider font-mono">Top Performer</span>
              </div>
            </div>
            <div className="w-full grid grid-cols-2 gap-2 border-t border-[#E2E2E2] pt-3.5 mt-4 text-xs font-mono">
              <div className="text-left">
                <span className="text-[#888888] text-[10px] block uppercase font-bold">Solved</span>
                <span className="text-[#111111] font-extrabold mt-0.5 block">{filteredRankings[0].stats.solved}</span>
              </div>
              <div className="text-right">
                <span className="text-[#888888] text-[10px] block uppercase font-bold">Streak</span>
                <span className="text-[#EF4444] font-extrabold mt-0.5 block flex items-center justify-end gap-0.5">
                  <Flame size={12} className="inline" /> {filteredRankings[0].stats.streak}d
                </span>
              </div>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="bg-[#F7F7F7] border border-[#E2E2E2] rounded-lg p-5 flex flex-col items-center justify-between text-center relative hover:shadow-md transition duration-150 order-3 md:order-3" id="podium-3rd">
            <span className="absolute top-4 left-4 text-xs font-mono font-bold text-[#888888]">#3</span>
            <div className="space-y-3 flex flex-col items-center mt-2">
              <div className="relative">
                <img 
                  src={filteredRankings[2].avatarUrl} 
                  alt={filteredRankings[2].name} 
                  className="w-16 h-16 rounded-full object-cover border border-[#E2E2E2]"
                />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-700 rounded-full border border-white flex items-center justify-center text-xs">🥉</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-[#111111] text-sm">{filteredRankings[2].name}</h3>
                <span className="text-[10px] text-[#888888] font-mono">{filteredRankings[2].email}</span>
              </div>
            </div>
            <div className="w-full grid grid-cols-2 gap-2 border-t border-[#E2E2E2] pt-3.5 mt-4 text-xs font-mono">
              <div className="text-left">
                <span className="text-[#888888] text-[10px] block uppercase font-bold">Solved</span>
                <span className="text-[#111111] font-bold mt-0.5 block">{filteredRankings[2].stats.solved}</span>
              </div>
              <div className="text-right">
                <span className="text-[#888888] text-[10px] block uppercase font-bold">Streak</span>
                <span className="text-[#EF4444] font-bold mt-0.5 block flex items-center justify-end gap-0.5">
                  <Flame size={12} className="inline" /> {filteredRankings[2].stats.streak}d
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Ranks Table */}
      <div className="bg-[#FFFFFF] border border-[#E2E2E2] rounded-lg shadow-sm overflow-hidden" id="leaderboard-table-panel">
        <div className="p-4 border-b border-[#E2E2E2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F7F7F7]">
          <span className="text-xs font-display font-bold text-[#111111] uppercase tracking-wider">Cohort Rankings List</span>
          
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2 text-[#888888]" size={14} />
            <input
              type="text"
              placeholder="Filter by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#E2E2E2] text-[#111111] pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none focus:border-[#5C6FFF] transition font-sans"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E2E2] text-[10px] text-[#888888] uppercase tracking-wider font-mono bg-[#F7F7F7]">
                <th className="py-3 px-4 font-bold text-center w-16">Rank</th>
                <th className="py-3 px-4 font-bold">Developer</th>
                <th className="py-3 px-4 font-bold text-center">Problems Solved</th>
                <th className="py-3 px-4 font-bold text-center">Current Streak</th>
                <th className="py-3 px-4 font-bold text-center">Consistency</th>
                <th className="py-3 px-4 font-bold">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E2E2]">
              {filteredRankings.map((member, index) => {
                const rankNum = index + 1;
                const isMe = member.id === currentUser.id;
                
                return (
                  <tr 
                    key={member.id} 
                    className={`hover:bg-[#F7F7F7]/50 transition-colors ${
                      isMe ? 'border-l-4 border-l-[#5C6FFF] bg-indigo-50/10 font-medium' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-[#111111] font-bold">
                      {rankNum === 1 ? '🥇' : rankNum === 2 ? '🥈' : rankNum === 3 ? '🥉' : `${rankNum}`}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={member.avatarUrl} 
                          alt={member.name} 
                          className="w-8 h-8 rounded-full border border-[#E2E2E2] object-cover" 
                        />
                        <div>
                          <span className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                            {member.name}
                            {isMe && (
                              <span className="bg-[#5C6FFF]/10 text-[#5C6FFF] border border-[#5C6FFF]/20 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">
                                YOU
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-[#888888] font-mono block">{member.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs font-bold text-[#111111]">
                      {member.stats.solved} solved
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-0.5 bg-rose-50 border border-rose-100 text-[#EF4444] text-[11px] font-bold px-2 py-0.5 rounded font-mono">
                        🔥 {member.stats.streak} days
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-[#E2E2E2] h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-[#22C55E] h-1.5 rounded-full" 
                            style={{ width: `${member.stats.consistency}%` }} 
                          />
                        </div>
                        <span className="text-xs font-mono text-[#111111] font-bold">{member.stats.consistency}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#888888] font-mono">
                      {member.stats.lastActive}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

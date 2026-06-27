import React, { useState } from 'react';
import { LeaderboardEntry, User } from '../types';
import { Award, Flame, Target, Clock, ChevronUp, ChevronDown, Minus } from 'lucide-react';

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
  currentUser: User;
}

const BADGE_ICONS: Record<string, string> = {
  weekly_winner: '🏆', monthly_winner: '🥇', top_performer: '⭐',
  fastest_solver: '⚡', accuracy_king: '🎯', consistency_master: '📈',
  streak_7: '🔥', streak_30: '🌟', perfect_score: '💯',
  problem_crusher: '💪', placement_ready: '🚀', ai_learner: '🤖',
};

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl">🥇</span>;
  if (rank === 2) return <span className="text-xl">🥈</span>;
  if (rank === 3) return <span className="text-xl">🥉</span>;
  return <span className="text-sm font-bold text-slate-500">#{rank}</span>;
}

function formatSeconds(s: number) {
  if (!s) return '—';
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m` : `${s}s`;
}

export default function Leaderboard({ leaderboard, currentUser }: LeaderboardProps) {
  const [tab, setTab] = useState<'all'>('all');

  const myEntry = leaderboard.find(e => e.id === currentUser.id);
  const myRank = myEntry?.rank ?? null;

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Award size={22} className="text-amber-500" />
          Department Leaderboard
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Ranking based on total score, accuracy, and consistency</p>
      </div>

      {/* My rank card (if not in top 10) */}
      {myRank && myRank > 3 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-4">
          <img src={currentUser.avatarUrl} alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-indigo-300" />
          <div className="flex-1">
            <p className="font-semibold text-slate-900 text-sm">Your Ranking</p>
            <p className="text-xs text-indigo-600 mt-0.5">
              #{myRank} · {currentUser.totalScore.toFixed(1)} pts · {currentUser.accuracy.toFixed(1)}% accuracy
            </p>
          </div>
          <span className="text-2xl font-black text-indigo-600">#{myRank}</span>
        </div>
      )}

      {/* Podium top 3 */}
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-3 py-4">
          {/* 2nd */}
          {top3[1] && (
            <div className="flex flex-col items-center gap-2 w-28">
              <div className="relative">
                <img src={top3[1].avatarUrl} alt={top3[1].name} className="w-14 h-14 rounded-full object-cover border-4 border-slate-300" />
                <span className="absolute -bottom-1 -right-1 text-lg">🥈</span>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-900 truncate w-full">{top3[1].name}</p>
                <p className="text-xs text-slate-500">{top3[1].totalScore.toFixed(1)} pts</p>
              </div>
              <div className="w-full h-16 bg-slate-200 rounded-t-lg flex items-center justify-center">
                <span className="text-sm font-black text-slate-500">2</span>
              </div>
            </div>
          )}
          {/* 1st */}
          {top3[0] && (
            <div className="flex flex-col items-center gap-2 w-32">
              <div className="relative">
                <img src={top3[0].avatarUrl} alt={top3[0].name} className="w-16 h-16 rounded-full object-cover border-4 border-yellow-400 ring-2 ring-yellow-200" />
                <span className="absolute -bottom-1 -right-1 text-xl">🥇</span>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-900 truncate w-full">{top3[0].name}</p>
                <p className="text-xs font-semibold text-amber-600">{top3[0].totalScore.toFixed(1)} pts</p>
              </div>
              <div className="w-full h-24 bg-amber-400 rounded-t-lg flex items-center justify-center">
                <span className="text-lg font-black text-white">1</span>
              </div>
            </div>
          )}
          {/* 3rd */}
          {top3[2] && (
            <div className="flex flex-col items-center gap-2 w-28">
              <div className="relative">
                <img src={top3[2].avatarUrl} alt={top3[2].name} className="w-14 h-14 rounded-full object-cover border-4 border-amber-700/40" />
                <span className="absolute -bottom-1 -right-1 text-lg">🥉</span>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-900 truncate w-full">{top3[2].name}</p>
                <p className="text-xs text-slate-500">{top3[2].totalScore.toFixed(1)} pts</p>
              </div>
              <div className="w-full h-10 bg-amber-700/30 rounded-t-lg flex items-center justify-center">
                <span className="text-sm font-black text-amber-800">3</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full leaderboard table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-[2rem_1fr_5rem_5rem_5rem] gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          <span>#</span>
          <span>Student</span>
          <span className="text-right">Score</span>
          <span className="text-right">Accuracy</span>
          <span className="text-right hidden sm:block">Streak</span>
        </div>

        <div className="divide-y divide-slate-100">
          {leaderboard.map((entry, i) => {
            const isMe = entry.id === currentUser.id;
            return (
              <div key={entry.id}
                className={`grid grid-cols-[2rem_1fr_5rem_5rem_5rem] gap-2 px-4 py-3.5 items-center transition ${
                  isMe ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : 'hover:bg-slate-50'
                }`}
              >
                {/* Rank */}
                <div className="flex items-center justify-center">
                  <RankBadge rank={entry.rank} />
                </div>

                {/* Student info */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={entry.avatarUrl} alt={entry.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0" />
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${isMe ? 'text-indigo-800' : 'text-slate-900'}`}>
                      {entry.name} {isMe && <span className="text-[10px] text-indigo-500 font-normal">(You)</span>}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">{entry.department} · {entry.year}</span>
                      {entry.badges?.slice(0, 3).map(b => (
                        <span key={b} title={b} className="text-[11px]">{BADGE_ICONS[b] || ''}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{entry.totalScore.toFixed(1)}</p>
                  <p className="text-[10px] text-slate-400">{entry.attemptCount} quizzes</p>
                </div>

                {/* Accuracy */}
                <div className="text-right">
                  <p className={`text-sm font-bold ${entry.accuracy >= 70 ? 'text-green-600' : entry.accuracy >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                    {entry.accuracy.toFixed(1)}%
                  </p>
                </div>

                {/* Streak */}
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-orange-500 flex items-center justify-end gap-1">
                    <Flame size={13} /> {entry.streak}
                  </p>
                </div>
              </div>
            );
          })}

          {leaderboard.length === 0 && (
            <div className="p-10 text-center text-slate-400">
              <Award size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No rankings yet. Complete quizzes to appear here!</p>
            </div>
          )}
        </div>
      </div>

      {/* Ranking formula */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Ranking Formula</p>
        <p className="text-xs text-slate-500 leading-relaxed">
          <span className="font-mono text-slate-700">Rank Score = Total Quiz Score + Accuracy Bonus − Negative Mark Penalties</span>
          <br />Students with same score are ranked by accuracy, then by number of quizzes attempted.
        </p>
      </div>
    </div>
  );
}

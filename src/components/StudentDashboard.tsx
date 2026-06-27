import React from 'react';
import { Quiz, QuizAttempt, User, LeaderboardEntry, StudentAnalytics } from '../types';
import { BookOpen, Clock, CheckCircle2, TrendingUp, Flame, Award, ChevronRight, Sparkles, Target } from 'lucide-react';

interface StudentDashboardProps {
  user: User;
  quizzes: Quiz[];
  myAttempts: QuizAttempt[];
  leaderboard: LeaderboardEntry[];
  studentAnalytics: StudentAnalytics | null;
  onStartQuiz: (quiz: Quiz) => void;
  onViewResults: (attempt: QuizAttempt) => void;
  onNavigate: (tab: string) => void;
}

const BADGE_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  weekly_winner: { label: 'Weekly Winner', emoji: '🏆', color: 'bg-yellow-100 text-yellow-800' },
  top_performer: { label: 'Top Performer', emoji: '⭐', color: 'bg-indigo-100 text-indigo-800' },
  accuracy_king: { label: 'Accuracy King', emoji: '🎯', color: 'bg-green-100 text-green-800' },
  streak_7: { label: '7-Day Streak', emoji: '🔥', color: 'bg-orange-100 text-orange-800' },
  streak_30: { label: '30-Day Streak', emoji: '🌟', color: 'bg-purple-100 text-purple-800' },
  perfect_score: { label: 'Perfect Score', emoji: '💯', color: 'bg-emerald-100 text-emerald-800' },
  fastest_solver: { label: 'Speed Demon', emoji: '⚡', color: 'bg-blue-100 text-blue-800' },
  placement_ready: { label: 'Placement Ready', emoji: '🚀', color: 'bg-rose-100 text-rose-800' },
  ai_learner: { label: 'AI Learner', emoji: '🤖', color: 'bg-violet-100 text-violet-800' },
  consistency_master: { label: 'Consistent', emoji: '📈', color: 'bg-teal-100 text-teal-800' },
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function StudentDashboard({
  user, quizzes, myAttempts, leaderboard, studentAnalytics, onStartQuiz, onViewResults, onNavigate
}: StudentDashboardProps) {
  const myRank = leaderboard.find(e => e.id === user.id)?.rank || '--';
  const submittedAttempts = myAttempts.filter(a => a.status === 'submitted');
  const availableQuizzes = quizzes.filter(q => {
    const attempted = myAttempts.filter(a => a.quiz_id === q.id && a.status === 'submitted').length;
    return q.status === 'published' && attempted < q.max_attempts;
  });
  const recentAttempts = submittedAttempts.slice(0, 5);

  const avgAccuracy = submittedAttempts.length > 0
    ? submittedAttempts.reduce((s, a) => s + a.accuracy, 0) / submittedAttempts.length
    : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-indigo-200 text-sm font-medium">Welcome back,</p>
            <h1 className="text-2xl font-bold mt-0.5">{user.name}</h1>
            <p className="text-indigo-200 text-sm mt-1">{user.department} · {user.year} Year</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1.5">
              <Flame size={14} className="text-orange-300" />
              <span className="text-sm font-bold">{user.streak} day streak</span>
            </div>
            <p className="text-indigo-200 text-xs mt-1.5">Rank #{myRank}</p>
          </div>
        </div>

        {/* Badges */}
        {user.badges?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {user.badges.slice(0, 4).map(b => {
              const info = BADGE_LABELS[b];
              if (!info) return null;
              return (
                <span key={b} className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {info.emoji} {info.label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Quizzes Taken', value: submittedAttempts.length, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Avg Accuracy', value: `${avgAccuracy.toFixed(1)}%`, icon: Target, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Score', value: user.totalScore.toFixed(1), icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Department Rank', value: `#${myRank}`, icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Available Quizzes */}
        <div className="md:col-span-3 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <BookOpen size={16} className="text-indigo-500" />
              Available Quizzes
            </h2>
            <button onClick={() => onNavigate('quizzes')}
              className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer">
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {availableQuizzes.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No quizzes available right now.</p>
                <p className="text-xs mt-1">Check back later or ask your admin.</p>
              </div>
            ) : (
              availableQuizzes.slice(0, 5).map(quiz => (
                <div key={quiz.id} className="px-5 py-4 hover:bg-slate-50 transition flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        quiz.quiz_type === 'placement' ? 'bg-rose-100 text-rose-700' :
                        quiz.quiz_type === 'weekly' ? 'bg-blue-100 text-blue-700' :
                        quiz.quiz_type === 'monthly' ? 'bg-purple-100 text-purple-700' :
                        'bg-slate-100 text-slate-600'
                      } uppercase tracking-wide`}>
                        {quiz.quiz_type}
                      </span>
                      <span className="text-[10px] text-slate-400">{quiz.question_count} Qs</span>
                    </div>
                    <p className="font-medium text-slate-900 text-sm truncate">{quiz.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{quiz.subject} · {quiz.time_limit} min · {quiz.marks_per_question}M each</p>
                  </div>
                  <button
                    onClick={() => onStartQuiz(quiz)}
                    className="shrink-0 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                  >
                    Start
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="md:col-span-2 space-y-4">
          {/* Subject performance */}
          {studentAnalytics && studentAnalytics.subjectPerformance.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                <Sparkles size={14} className="text-violet-500" />
                Subject Performance
              </h3>
              <div className="space-y-2.5">
                {studentAnalytics.subjectPerformance.slice(0, 4).map(s => (
                  <div key={s.subject}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-700 font-medium truncate">{s.subject}</span>
                      <span className="text-slate-500 ml-2 shrink-0">{s.accuracy.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full">
                      <div
                        className={`h-full rounded-full ${s.accuracy >= 70 ? 'bg-green-500' : s.accuracy >= 50 ? 'bg-amber-500' : 'bg-red-400'}`}
                        style={{ width: `${Math.min(s.accuracy, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent results */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle2 size={14} className="text-green-500" />
                Recent Results
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {recentAttempts.length === 0 ? (
                <p className="p-4 text-xs text-slate-400 text-center">No attempts yet. Take your first quiz!</p>
              ) : (
                recentAttempts.map(a => (
                  <button
                    key={a.id}
                    onClick={() => onViewResults(a)}
                    className="w-full px-4 py-3 hover:bg-slate-50 transition text-left"
                  >
                    <div className="flex justify-between items-center">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-900 truncate">{a.quiz_name || 'Quiz'}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {a.score.toFixed(1)}/{a.total_marks} · {a.accuracy.toFixed(1)}% · {formatTime(a.time_taken)}
                        </p>
                      </div>
                      <span className={`text-xs font-bold ml-2 ${a.accuracy >= 70 ? 'text-green-600' : a.accuracy >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                        {a.accuracy.toFixed(0)}%
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { AdminAnalytics } from '../types';
import { BarChart3, Users, BookOpen, TrendingUp, Target, AlertCircle, Award, Percent } from 'lucide-react';

interface AdminAnalyticsPageProps {
  analytics: AdminAnalytics;
}

export default function AdminAnalyticsPage({ analytics }: AdminAnalyticsPageProps) {
  const [tab, setTab] = useState<'overview' | 'questions' | 'students'>('overview');

  const {
    totalStudents, totalQuizzes, totalAttempts, avgScorePct,
    mostMissedQuestions, subjectPerformance, topPerformers, quizStats
  } = analytics;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 size={20} className="text-indigo-500" />
          Analytics Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Department-wide quiz performance insights</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Students', value: totalStudents, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Published Quizzes', value: totalQuizzes, icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Attempts', value: totalAttempts, icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Avg Score', value: `${avgScorePct.toFixed(1)}%`, icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
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

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(['overview', 'questions', 'students'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition cursor-pointer ${tab === t ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === 'overview' && (
        <div className="space-y-5">
          {/* Subject performance */}
          {subjectPerformance?.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Percent size={15} className="text-indigo-500" />
                Subject Performance (all students)
              </h2>
              <div className="space-y-4">
                {subjectPerformance.map(s => (
                  <div key={s.subject}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-slate-800">{s.subject}</span>
                      <span className="text-slate-500">
                        {s.correct_count}/{s.total_responses} correct · <span className={`font-bold ${Number(s.accuracy_pct) >= 70 ? 'text-green-600' : Number(s.accuracy_pct) >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                          {parseFloat(String(s.accuracy_pct)).toFixed(1)}%
                        </span>
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${Number(s.accuracy_pct) >= 70 ? 'bg-green-500' : Number(s.accuracy_pct) >= 50 ? 'bg-amber-500' : 'bg-red-400'}`}
                        style={{ width: `${Math.min(parseFloat(String(s.accuracy_pct)), 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quiz participation stats */}
          {quizStats?.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <BookOpen size={15} className="text-indigo-500" />
                  Quiz Participation
                </h2>
              </div>
              <div className="divide-y divide-slate-100">
                {quizStats.map(q => (
                  <div key={q.id} className="px-5 py-3.5 grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center text-sm">
                    <div>
                      <p className="font-medium text-slate-900 truncate">{q.name}</p>
                      <p className="text-xs text-slate-400">{q.subject}</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-slate-900">{q.participants || 0}</p>
                      <p className="text-[10px] text-slate-400">students</p>
                    </div>
                    <div className="text-center">
                      <p className={`font-semibold ${Number(q.avg_pct) >= 70 ? 'text-green-600' : Number(q.avg_pct) >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                        {q.avg_pct ? parseFloat(String(q.avg_pct)).toFixed(1) : '—'}%
                      </p>
                      <p className="text-[10px] text-slate-400">avg score</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-slate-700">
                        {q.avg_time ? `${Math.floor(Number(q.avg_time) / 60)}m` : '—'}
                      </p>
                      <p className="text-[10px] text-slate-400">avg time</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Questions tab */}
      {tab === 'questions' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <AlertCircle size={15} className="text-red-500" />
              Most Missed Questions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Questions with the lowest accuracy across all attempts</p>
          </div>
          {!mostMissedQuestions?.length ? (
            <p className="p-8 text-center text-sm text-slate-400">No question data yet</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {mostMissedQuestions.map((q, i) => (
                <div key={i} className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      Number(q.accuracy_pct) < 30 ? 'bg-red-100 text-red-700' :
                      Number(q.accuracy_pct) < 50 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 line-clamp-2">{q.question_text}</p>
                      <div className="flex gap-3 mt-2 text-xs text-slate-500">
                        <span>{q.subject}</span>
                        {q.topic && <span>· {q.topic}</span>}
                        <span>· {q.attempts} attempts</span>
                        <span className={`font-bold ${Number(q.accuracy_pct) < 40 ? 'text-red-600' : 'text-amber-600'}`}>
                          {q.accuracy_pct}% correct
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 bg-slate-100 rounded-full">
                        <div className="h-full bg-red-400 rounded-full" style={{ width: `${q.accuracy_pct}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Students tab */}
      {tab === 'students' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Award size={15} className="text-amber-500" />
              Top Performers
            </h2>
          </div>
          {!topPerformers?.length ? (
            <p className="p-8 text-center text-sm text-slate-400">No attempt data yet</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {topPerformers.map((p, i) => (
                <div key={p.id} className="px-5 py-4 flex items-center gap-4">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-slate-100 text-slate-600' : 'bg-orange-100 text-orange-700'}`}>
                    {i + 1}
                  </span>
                  <img src={p.avatarUrl} alt={p.name} className="w-9 h-9 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.quizzesTaken} quizzes · {p.streak} day streak</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-indigo-600">{p.totalScore.toFixed(1)} pts</p>
                    <p className="text-xs text-green-600">{p.accuracy.toFixed(1)}% accuracy</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

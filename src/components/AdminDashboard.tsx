import React from 'react';
import { AdminAnalytics, Quiz, User } from '../types';
import { Users, BookOpen, TrendingUp, Target, AlertTriangle, Award, Plus, BarChart3, ChevronRight } from 'lucide-react';

interface AdminDashboardProps {
  users: User[];
  quizzes: Quiz[];
  adminAnalytics: AdminAnalytics | null;
  onNavigate: (tab: string) => void;
}

export default function AdminDashboard({ users, quizzes, adminAnalytics, onNavigate }: AdminDashboardProps) {
  const pendingUsers = users.filter(u => u.status === 'pending');
  const publishedQuizzes = quizzes.filter(q => q.status === 'published');
  const draftQuizzes = quizzes.filter(q => q.status === 'draft');

  const stats = [
    { label: 'Active Students', value: adminAnalytics?.totalStudents ?? users.filter(u=>u.status==='active').length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Published Quizzes', value: publishedQuizzes.length, icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Attempts', value: adminAnalytics?.totalAttempts ?? 0, icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Avg Score %', value: `${(adminAnalytics?.avgScorePct ?? 0).toFixed(1)}%`, icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Platform overview and quick actions</p>
      </div>

      {/* Pending approval alert */}
      {pendingUsers.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-900">{pendingUsers.length} pending enrollment request{pendingUsers.length > 1 ? 's' : ''}</p>
              <p className="text-xs text-amber-700 mt-0.5">{pendingUsers.map(u => u.name).join(', ')}</p>
            </div>
          </div>
          <button onClick={() => onNavigate('members')}
            className="shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer">
            Review Now
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Create Quiz', tab: 'create-quiz', icon: Plus, color: 'bg-indigo-600 text-white hover:bg-indigo-700' },
          { label: 'Manage Students', tab: 'members', icon: Users, color: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' },
          { label: 'View Analytics', tab: 'analytics', icon: BarChart3, color: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' },
          { label: 'Leaderboard', tab: 'leaderboard', icon: Award, color: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' },
        ].map(({ label, tab, icon: Icon, color }) => (
          <button key={tab} onClick={() => onNavigate(tab)}
            className={`${color} rounded-xl p-4 flex items-center gap-3 transition cursor-pointer text-left font-medium text-sm`}>
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Quiz list */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <BookOpen size={15} className="text-indigo-500" />
              Quizzes
            </h2>
            <button onClick={() => onNavigate('quizzes')}
              className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer">
              View all <ChevronRight size={12} />
            </button>
          </div>
          {quizzes.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <BookOpen size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No quizzes yet.</p>
              <button onClick={() => onNavigate('create-quiz')}
                className="mt-3 px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg font-semibold cursor-pointer">
                Create First Quiz
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {quizzes.slice(0, 5).map(q => (
                <div key={q.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{q.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{q.subject} · {q.question_count ?? 0} Qs · {q.time_limit}m</p>
                  </div>
                  <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                    q.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {q.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top performers */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Award size={15} className="text-amber-500" />
              Top Performers
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {!adminAnalytics?.topPerformers?.length ? (
              <p className="p-6 text-center text-sm text-slate-400">No data yet</p>
            ) : (
              adminAnalytics.topPerformers.map((p, i) => (
                <div key={p.id} className="px-5 py-3.5 flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' :
                    i === 1 ? 'bg-slate-100 text-slate-600' :
                    i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-500'
                  }`}>{i + 1}</span>
                  <img src={p.avatarUrl} alt={p.name} className="w-7 h-7 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.accuracy.toFixed(1)}% accuracy · {p.quizzesTaken} quizzes</p>
                  </div>
                  <span className="text-sm font-bold text-indigo-600">{p.totalScore.toFixed(1)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Subject performance */}
        {adminAnalytics?.subjectPerformance?.length > 0 && (
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 size={15} className="text-violet-500" />
              Subject Performance (Department-wide)
            </h2>
            <div className="space-y-3">
              {adminAnalytics.subjectPerformance.slice(0, 6).map(s => (
                <div key={s.subject}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium">{s.subject}</span>
                    <span className="text-slate-500">{parseFloat(String(s.accuracy_pct)).toFixed(1)}% · {s.total_responses} responses</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full">
                    <div
                      className={`h-full rounded-full ${Number(s.accuracy_pct) >= 70 ? 'bg-green-500' : Number(s.accuracy_pct) >= 50 ? 'bg-amber-500' : 'bg-red-400'}`}
                      style={{ width: `${Math.min(parseFloat(String(s.accuracy_pct)), 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

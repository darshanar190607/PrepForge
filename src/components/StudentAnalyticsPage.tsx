import React, { useState } from 'react';
import { StudentAnalytics, User } from '../types';
import { TrendingUp, Target, Sparkles, BookOpen, CheckCircle2, XCircle } from 'lucide-react';

interface StudentAnalyticsPageProps {
  user: User;
  analytics: StudentAnalytics;
}

export default function StudentAnalyticsPage({ user, analytics }: StudentAnalyticsPageProps) {
  const { subjectPerformance, topicPerformance, trend, strongSubjects, weakSubjects } = analytics;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp size={20} className="text-indigo-500" />
          My Analytics
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Your personal performance breakdown</p>
      </div>

      {/* Strong / Weak subjects */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h3 className="font-semibold text-green-800 flex items-center gap-2 mb-3">
            <CheckCircle2 size={15} /> Strong Subjects
          </h3>
          {strongSubjects.length === 0 ? (
            <p className="text-sm text-green-700 opacity-70">Keep practicing to identify your strengths!</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {strongSubjects.map(s => (
                <span key={s} className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">{s}</span>
              ))}
            </div>
          )}
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-semibold text-red-800 flex items-center gap-2 mb-3">
            <XCircle size={15} /> Needs Improvement
          </h3>
          {weakSubjects.length === 0 ? (
            <p className="text-sm text-red-700 opacity-70">Great! No weak subjects identified yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {weakSubjects.map(s => (
                <span key={s} className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">{s}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Subject Performance */}
      {subjectPerformance.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Target size={15} className="text-indigo-500" />
            Subject Accuracy
          </h2>
          <div className="space-y-4">
            {subjectPerformance.map(s => (
              <div key={s.subject}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-800">{s.subject}</span>
                  <span className="text-slate-500">
                    {s.correct}/{s.total} correct ·{' '}
                    <span className={`font-bold ${s.accuracy >= 70 ? 'text-green-600' : s.accuracy >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                      {s.accuracy.toFixed(1)}%
                    </span>
                  </span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
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

      {/* Topic Performance */}
      {topicPerformance.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <BookOpen size={15} className="text-violet-500" />
            Topic Breakdown
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {topicPerformance.slice(0, 12).map(t => (
              <div key={t.topic} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className={`w-2 h-8 rounded-full shrink-0 ${t.accuracy >= 70 ? 'bg-green-500' : t.accuracy >= 50 ? 'bg-amber-500' : 'bg-red-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{t.topic}</p>
                  <p className="text-[10px] text-slate-500">{t.correct}/{t.total} correct</p>
                </div>
                <span className={`text-sm font-bold ${t.accuracy >= 70 ? 'text-green-600' : t.accuracy >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                  {t.accuracy.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Score Trend */}
      {trend.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-green-500" />
            Score Trend
          </h2>
          <div className="space-y-2">
            {trend.slice(-8).map((t, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="text-xs text-slate-400 w-20 shrink-0">{new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                <span className="text-slate-600 flex-1 truncate text-xs">{t.quizName}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${t.accuracy >= 70 ? 'bg-green-500' : t.accuracy >= 50 ? 'bg-amber-500' : 'bg-red-400'}`}
                      style={{ width: `${Math.min(t.accuracy, 100)}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold w-12 text-right ${t.accuracy >= 70 ? 'text-green-600' : t.accuracy >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                    {t.accuracy.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {subjectPerformance.length === 0 && trend.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
          <Sparkles size={32} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium">No analytics data yet</p>
          <p className="text-xs mt-1">Complete quizzes to see your performance breakdown here.</p>
        </div>
      )}
    </div>
  );
}

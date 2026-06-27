import React, { useState } from 'react';
import { Quiz, QuizAttempt } from '../types';
import { BookOpen, Clock, Award, Search, Filter, ChevronRight, CheckCircle2, Lock, RotateCcw } from 'lucide-react';

interface QuizListProps {
  quizzes: Quiz[];
  myAttempts: QuizAttempt[];
  currentUserId: string;
  isAdmin: boolean;
  onStartQuiz: (quiz: Quiz) => void;
  onViewResults: (attempt: QuizAttempt) => void;
  onNavigateCreate?: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  practice: 'bg-slate-100 text-slate-600',
  weekly: 'bg-blue-100 text-blue-700',
  monthly: 'bg-purple-100 text-purple-700',
  placement: 'bg-rose-100 text-rose-700',
};

export default function QuizList({ quizzes, myAttempts, currentUserId, isAdmin, onStartQuiz, onViewResults, onNavigateCreate }: QuizListProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const published = quizzes.filter(q => q.status === 'published' || isAdmin);

  const getQuizStatus = (quiz: Quiz) => {
    const attempts = myAttempts.filter(a => a.quiz_id === quiz.id && a.status === 'submitted');
    const inProgress = myAttempts.find(a => a.quiz_id === quiz.id && a.status === 'in_progress');
    const maxed = attempts.length >= quiz.max_attempts;
    return { attempts, inProgress, maxed, lastAttempt: attempts[0] };
  };

  const filtered = published.filter(q => {
    const matchSearch = !search || q.name.toLowerCase().includes(search.toLowerCase()) || q.subject?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || q.quiz_type === typeFilter;
    const { attempts, maxed } = getQuizStatus(q);
    const matchStatus =
      statusFilter === 'all' ? true :
      statusFilter === 'completed' ? maxed || attempts.length > 0 :
      statusFilter === 'available' ? !maxed :
      statusFilter === 'draft' ? q.status === 'draft' : true;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quiz Library</h1>
          <p className="text-sm text-slate-500 mt-0.5">{published.length} quiz{published.length !== 1 ? 'zes' : ''} available</p>
        </div>
        {isAdmin && onNavigateCreate && (
          <button onClick={onNavigateCreate}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition cursor-pointer">
            + Create Quiz
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search quizzes..."
            className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-indigo-500">
          <option value="all">All Types</option>
          <option value="practice">Practice</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="placement">Placement</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-indigo-500">
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="completed">Attempted</option>
          {isAdmin && <option value="draft">Drafts</option>}
        </select>
      </div>

      {/* Quiz cards */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
          <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No quizzes found</p>
          <p className="text-xs mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(quiz => {
            const { attempts, inProgress, maxed, lastAttempt } = getQuizStatus(quiz);
            const canAttempt = !maxed && quiz.status === 'published';

            return (
              <div key={quiz.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Tags row */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${TYPE_COLORS[quiz.quiz_type] || TYPE_COLORS.practice}`}>
                        {quiz.quiz_type}
                      </span>
                      {quiz.status === 'draft' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase">Draft</span>
                      )}
                      {attempts.length > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                          <CheckCircle2 size={9} /> Attempted {attempts.length}×
                        </span>
                      )}
                      {maxed && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 flex items-center gap-1">
                          <Lock size={9} /> Max attempts reached
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-slate-900 text-base leading-snug">{quiz.name}</h3>
                    {quiz.description && <p className="text-sm text-slate-500 mt-1 line-clamp-1">{quiz.description}</p>}

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><BookOpen size={12} /> {quiz.question_count ?? '?'} Questions</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {quiz.time_limit} min</span>
                      <span className="flex items-center gap-1"><Award size={12} /> {quiz.marks_per_question}M each</span>
                      {quiz.negative_marks > 0 && <span className="text-red-500">-{quiz.negative_marks} negative</span>}
                      <span className="text-slate-400">{quiz.subject}</span>
                    </div>

                    {/* Last attempt score */}
                    {lastAttempt && (
                      <div className="mt-3 flex items-center gap-3">
                        <div className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                          Last score: <span className="font-bold text-slate-800">{lastAttempt.score.toFixed(1)}/{lastAttempt.total_marks}</span>
                          <span className="text-slate-400 ml-1">({lastAttempt.accuracy.toFixed(1)}%)</span>
                        </div>
                        <button onClick={() => onViewResults(lastAttempt)}
                          className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer">
                          View Results →
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Action button */}
                  <div className="shrink-0">
                    {quiz.status === 'draft' && isAdmin ? (
                      <span className="text-xs text-amber-600 font-medium">Draft</span>
                    ) : inProgress ? (
                      <button onClick={() => onStartQuiz(quiz)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition cursor-pointer">
                        <RotateCcw size={14} /> Resume
                      </button>
                    ) : canAttempt ? (
                      <button onClick={() => onStartQuiz(quiz)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition cursor-pointer">
                        Start <ChevronRight size={14} />
                      </button>
                    ) : (
                      <button onClick={() => lastAttempt && onViewResults(lastAttempt)}
                        disabled={!lastAttempt}
                        className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-500 text-sm font-medium rounded-lg hover:bg-slate-50 transition disabled:opacity-40 cursor-pointer">
                        Results
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

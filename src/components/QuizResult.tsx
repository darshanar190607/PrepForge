import React, { useState } from 'react';
import { QuizAttempt, QuestionResponse, AIExplanation, Quiz } from '../types';
import { CheckCircle2, XCircle, Minus, Sparkles, ChevronDown, ChevronUp, Brain, Target, BookOpen, Zap, TrendingUp, RotateCcw } from 'lucide-react';

interface QuizResultProps {
  attempt: QuizAttempt;
  responses: QuestionResponse[];
  quiz: Quiz;
  onGetExplanation: (questionId: string) => Promise<AIExplanation>;
  onRetake?: () => void;
  onBack: () => void;
}

export default function QuizResult({ attempt, responses, quiz, onGetExplanation, onRetake, onBack }: QuizResultProps) {
  const [explanations, setExplanations] = useState<Record<string, AIExplanation>>({});
  const [loadingExp, setLoadingExp] = useState<Record<string, boolean>>({});
  const [expandedQ, setExpandedQ] = useState<string | null>(null);

  const scorePercent = attempt.total_marks > 0
    ? (attempt.score / attempt.total_marks) * 100
    : 0;

  const getGrade = (pct: number) => {
    if (pct >= 90) return { label: 'Excellent!', color: 'text-green-600', bg: 'bg-green-50 border-green-200' };
    if (pct >= 75) return { label: 'Great Job!', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' };
    if (pct >= 60) return { label: 'Good', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' };
    if (pct >= 40) return { label: 'Needs Improvement', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };
    return { label: 'Keep Practicing', color: 'text-red-600', bg: 'bg-red-50 border-red-200' };
  };

  const grade = getGrade(scorePercent);
  const timeTakenMin = Math.floor(attempt.time_taken / 60);
  const timeTakenSec = attempt.time_taken % 60;

  const handleExplain = async (questionId: string) => {
    if (explanations[questionId]) {
      setExpandedQ(prev => prev === questionId ? null : questionId);
      return;
    }
    setLoadingExp(prev => ({ ...prev, [questionId]: true }));
    try {
      const exp = await onGetExplanation(questionId);
      setExplanations(prev => ({ ...prev, [questionId]: exp }));
      setExpandedQ(questionId);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingExp(prev => ({ ...prev, [questionId]: false }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Score Card */}
      <div className={`border-2 rounded-2xl p-6 text-center ${grade.bg}`}>
        <p className={`text-sm font-bold uppercase tracking-widest mb-2 ${grade.color}`}>{grade.label}</p>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-5xl font-black text-slate-900">{attempt.score.toFixed(1)}</span>
          <span className="text-xl text-slate-400 font-medium">/ {attempt.total_marks}</span>
        </div>
        <p className="text-3xl font-bold mt-1" style={{ color: scorePercent >= 60 ? '#16a34a' : scorePercent >= 40 ? '#d97706' : '#dc2626' }}>
          {scorePercent.toFixed(1)}%
        </p>
        <p className="text-slate-500 text-sm mt-3">{quiz.name}</p>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mt-5">
          {[
            { label: 'Correct', value: attempt.correct_count, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
            { label: 'Wrong', value: attempt.wrong_count, icon: XCircle, color: 'text-red-500', bg: 'bg-red-100' },
            { label: 'Skipped', value: attempt.skipped_count, icon: Minus, color: 'text-slate-500', bg: 'bg-slate-100' },
            { label: 'Accuracy', value: `${attempt.accuracy.toFixed(1)}%`, icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-100' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white/70 rounded-xl p-3">
              <div className={`w-7 h-7 ${bg} rounded-full flex items-center justify-center mx-auto mb-1`}>
                <Icon size={14} className={color} />
              </div>
              <p className="text-lg font-bold text-slate-900">{value}</p>
              <p className="text-[10px] text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-400 mt-3">
          Time taken: {timeTakenMin}m {timeTakenSec}s · {quiz.time_limit} min allowed
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 flex-wrap">
        <button onClick={onBack}
          className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition cursor-pointer">
          ← Back
        </button>
        {onRetake && (
          <button onClick={onRetake}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition cursor-pointer">
            <RotateCcw size={14} /> Retake Quiz
          </button>
        )}
      </div>

      {/* Per-question breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <BookOpen size={16} className="text-indigo-500" />
            Question-by-Question Review
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Click "Explain Answer" for AI-powered explanations</p>
        </div>

        <div className="divide-y divide-slate-100">
          {responses.map((r, idx) => {
            const isCorrect = r.is_correct;
            const isSkipped = r.selected_answer === null;
            const exp = explanations[r.question_id];
            const isExpanded = expandedQ === r.question_id;

            return (
              <div key={r.id || idx} className="p-5">
                {/* Question row */}
                <div className="flex gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    isSkipped ? 'bg-slate-100' : isCorrect ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {isSkipped ? <Minus size={13} className="text-slate-400" /> :
                     isCorrect ? <CheckCircle2 size={13} className="text-green-600" /> :
                     <XCircle size={13} className="text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 leading-snug">
                      <span className="text-slate-400 mr-1.5">Q{idx + 1}.</span>
                      {r.question_text}
                    </p>

                    {/* Answer display */}
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {!isSkipped && (
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${
                          isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          Your answer: {r.selected_answer}
                          {r.options?.find(o => o.id === r.selected_answer) &&
                            ` — ${r.options.find(o => o.id === r.selected_answer)!.text}`}
                        </span>
                      )}
                      {isSkipped && <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Skipped</span>}
                      {!isCorrect && r.correct_answer && (
                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">
                          Correct: {r.correct_answer}
                          {r.options?.find(o => o.id === r.correct_answer) &&
                            ` — ${r.options.find(o => o.id === r.correct_answer)!.text}`}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full ${r.marks_awarded > 0 ? 'bg-indigo-100 text-indigo-700' : r.marks_awarded < 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                        {r.marks_awarded > 0 ? '+' : ''}{r.marks_awarded} marks
                      </span>
                      {r.difficulty && (
                        <span className={`px-2 py-0.5 rounded-full ${r.difficulty === 'Easy' ? 'bg-green-50 text-green-600' : r.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                          {r.difficulty}
                        </span>
                      )}
                    </div>

                    {/* Explain button */}
                    <button
                      onClick={() => handleExplain(r.question_id)}
                      disabled={loadingExp[r.question_id]}
                      className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles size={13} />
                      {loadingExp[r.question_id] ? 'Generating AI Explanation...' :
                       exp ? (isExpanded ? 'Hide Explanation' : 'Show Explanation') : 'Explain Answer'}
                      {exp && (isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                    </button>

                    {/* AI Explanation Panel */}
                    {exp && isExpanded && (
                      <div className="mt-4 space-y-4">
                        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain size={14} className="text-indigo-600" />
                            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">AI Explanation</span>
                            {exp.interview_frequency && (
                              <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                exp.interview_frequency === 'High' ? 'bg-red-100 text-red-700' :
                                exp.interview_frequency === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {exp.interview_frequency} frequency
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">{exp.short_explanation}</p>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                          <p className="text-xs font-bold text-green-700 mb-1.5 flex items-center gap-1.5">
                            <CheckCircle2 size={13} /> Why the correct answer is right
                          </p>
                          <p className="text-sm text-slate-700 leading-relaxed">{exp.why_correct}</p>
                        </div>

                        {Object.keys(exp.why_options_wrong || {}).length > 0 && (
                          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <p className="text-xs font-bold text-red-700 mb-2 flex items-center gap-1.5">
                              <XCircle size={13} /> Why other options are wrong
                            </p>
                            <div className="space-y-2">
                              {Object.entries(exp.why_options_wrong).map(([opt, reason]) => (
                                <div key={opt} className="flex gap-2">
                                  <span className="text-xs font-bold text-red-500 w-5 shrink-0">{opt})</span>
                                  <p className="text-xs text-slate-700 leading-relaxed">{reason}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {exp.interview_concepts && (
                          <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                            <p className="text-xs font-bold text-violet-700 mb-1.5 flex items-center gap-1.5">
                              <Zap size={13} /> Key Interview Concepts
                            </p>
                            <p className="text-sm text-slate-700 leading-relaxed">{exp.interview_concepts}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          {exp.reference_topic && (
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                              <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Study Topic</p>
                              <p className="text-sm font-medium text-slate-800">{exp.reference_topic}</p>
                            </div>
                          )}
                          {exp.memory_trick && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                              <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Memory Trick 🧠</p>
                              <p className="text-sm text-slate-800">{exp.memory_trick}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

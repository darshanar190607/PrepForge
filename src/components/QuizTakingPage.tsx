import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Quiz, Question, QuizAttempt, QuestionResponse } from '../types';
import { Clock, Flag, ChevronLeft, ChevronRight, Send, X, AlertTriangle, CheckCircle2, Bookmark } from 'lucide-react';

interface QuizTakingPageProps {
  quiz: Quiz;
  attemptData: {
    attempt: QuizAttempt;
    questions: Question[];
    responses: QuestionResponse[];
    quiz: { timeLimit: number; marksPerQuestion: number; negativeMarks: number };
    resumed: boolean;
  };
  onSaveResponse: (attemptId: string, questionId: string, selectedAnswer: string | null, flagged: boolean, timeSpent: number) => Promise<any>;
  onSubmit: (attemptId: string, timeTaken: number) => Promise<any>;
  onClose: () => void;
}

export default function QuizTakingPage({ quiz, attemptData, onSaveResponse, onSubmit, onClose }: QuizTakingPageProps) {
  const { attempt, questions, responses: initialResponses, quiz: quizMeta } = attemptData;
  const totalTime = quizMeta.timeLimit * 60; // seconds

  const [currentIdx, setCurrentIdx] = useState(0);
  const [responses, setResponses] = useState<Record<string, { answer: string | null; flagged: boolean }>>(() => {
    const map: Record<string, { answer: string | null; flagged: boolean }> = {};
    for (const r of initialResponses) {
      map[r.question_id] = { answer: r.selected_answer, flagged: r.flagged_for_review };
    }
    return map;
  });
  const [timeLeft, setTimeLeft] = useState(() => {
    if (attemptData.resumed && attempt.started_at) {
      const elapsed = Math.floor((Date.now() - new Date(attempt.started_at).getTime()) / 1000);
      return Math.max(0, totalTime - elapsed);
    }
    return totalTime;
  });
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const questionStartTime = useRef(Date.now());
  const questionTimeSpent = useRef<Record<string, number>>({});

  const currentQ = questions[currentIdx];

  // ---- Timer ----
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const id = setInterval(() => setTimeLeft(t => {
      if (t <= 1) { clearInterval(id); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(id);
  }, []);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0) handleSubmit();
  }, [timeLeft]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const isUrgent = timeLeft <= 120; // < 2 min

  // ---- Track question time ----
  const trackTime = useCallback(() => {
    if (!currentQ) return;
    const spent = Math.floor((Date.now() - questionStartTime.current) / 1000);
    questionTimeSpent.current[currentQ.id] = (questionTimeSpent.current[currentQ.id] || 0) + spent;
    questionStartTime.current = Date.now();
  }, [currentQ]);

  const goTo = (idx: number) => {
    trackTime();
    setCurrentIdx(idx);
    questionStartTime.current = Date.now();
  };

  // ---- Select answer ----
  const selectAnswer = async (optionId: string) => {
    if (!currentQ) return;
    const current = responses[currentQ.id];
    const newAnswer = current?.answer === optionId ? null : optionId;
    setResponses(prev => ({ ...prev, [currentQ.id]: { answer: newAnswer, flagged: prev[currentQ.id]?.flagged || false } }));
    try {
      await onSaveResponse(attempt.id, currentQ.id, newAnswer, responses[currentQ.id]?.flagged || false, questionTimeSpent.current[currentQ.id] || 0);
    } catch { /* silently fail */ }
  };

  // ---- Flag for review ----
  const toggleFlag = async () => {
    if (!currentQ) return;
    const newFlagged = !(responses[currentQ.id]?.flagged);
    setResponses(prev => ({ ...prev, [currentQ.id]: { answer: prev[currentQ.id]?.answer || null, flagged: newFlagged } }));
    try {
      await onSaveResponse(attempt.id, currentQ.id, responses[currentQ.id]?.answer || null, newFlagged, questionTimeSpent.current[currentQ.id] || 0);
    } catch { /* silently fail */ }
  };

  // ---- Submit ----
  const handleSubmit = async () => {
    setSubmitting(true);
    trackTime();
    const timeTaken = totalTime - timeLeft;
    try {
      await onSubmit(attempt.id, timeTaken);
    } catch (e) {
      console.error(e);
      setSubmitting(false);
    }
  };

  const answeredCount = Object.values(responses).filter(r => r.answer !== null).length;
  const flaggedCount = Object.values(responses).filter(r => r.flagged).length;
  const skippedCount = questions.length - answeredCount;

  const getNavBtnClass = (idx: number) => {
    const q = questions[idx];
    if (!q) return 'q-nav-unanswered';
    const r = responses[q.id];
    if (idx === currentIdx) return 'q-nav-btn q-nav-active';
    if (r?.flagged) return 'q-nav-btn q-nav-flagged';
    if (r?.answer) return 'q-nav-btn q-nav-answered';
    return 'q-nav-btn q-nav-unanswered';
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col" id="quiz-taking-page">
      {/* Top bar */}
      <div className="h-14 border-b border-slate-200 flex items-center justify-between px-6 shrink-0 bg-white">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => setShowSubmitModal(true)}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition cursor-pointer">
            <X size={18} />
          </button>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{quiz.name}</p>
            <p className="text-xs text-slate-500">Q{currentIdx + 1} of {questions.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Stats */}
          <div className="hidden md:flex items-center gap-4 text-xs">
            <span className="text-green-600 font-semibold">{answeredCount} answered</span>
            <span className="text-amber-600 font-semibold">{flaggedCount} flagged</span>
            <span className="text-slate-400">{skippedCount} skipped</span>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-bold text-sm ${
            isUrgent ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-700'
          }`}>
            <Clock size={14} />
            {formatTime(timeLeft)}
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5"
          >
            <Send size={13} /> Submit
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Question header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    Q{currentIdx + 1}
                  </span>
                  {currentQ?.difficulty && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      currentQ.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                      currentQ.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>{currentQ.difficulty}</span>
                  )}
                  {currentQ?.topic && <span className="text-xs text-slate-400">{currentQ.topic}</span>}
                </div>
                <p className="text-base md:text-lg font-medium text-slate-900 leading-relaxed">
                  {currentQ?.question_text}
                </p>
              </div>
              <button
                onClick={toggleFlag}
                className={`shrink-0 p-2 rounded-lg transition cursor-pointer ${
                  responses[currentQ?.id]?.flagged
                    ? 'bg-amber-100 text-amber-600'
                    : 'text-slate-300 hover:text-amber-500 hover:bg-amber-50'
                }`}
                title="Flag for review"
              >
                <Bookmark size={18} fill={responses[currentQ?.id]?.flagged ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQ?.options?.map(opt => {
                const selected = responses[currentQ.id]?.answer === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => selectAnswer(opt.id)}
                    className={`option-card w-full ${selected ? 'option-selected' : 'option-default'}`}
                  >
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 font-bold text-xs transition-all ${
                      selected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300 text-slate-500'
                    }`}>
                      {opt.id}
                    </div>
                    <span className={`text-sm leading-relaxed text-left ${selected ? 'text-indigo-900 font-medium' : 'text-slate-700'}`}>
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Navigation arrows */}
            <div className="flex justify-between pt-4">
              <button
                onClick={() => goTo(currentIdx - 1)}
                disabled={currentIdx === 0}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={() => goTo(currentIdx + 1)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition cursor-pointer"
                >
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition cursor-pointer"
                >
                  <Send size={14} /> Submit Quiz
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question Navigator Sidebar */}
        <div className={`hidden md:flex flex-col w-64 border-l border-slate-200 bg-slate-50 shrink-0`}>
          <div className="p-4 border-b border-slate-200">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Question Navigator</p>
            <div className="flex gap-3 mt-2 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-200 border border-green-400 rounded-sm inline-block" />Answered</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-100 border border-amber-300 rounded-sm inline-block" />Flagged</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-white border border-slate-300 rounded-sm inline-block" />Skipped</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={getNavBtnClass(idx)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-slate-200 space-y-2">
            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex justify-between"><span>Answered:</span><span className="font-semibold text-green-600">{answeredCount}/{questions.length}</span></div>
              <div className="flex justify-between"><span>Flagged:</span><span className="font-semibold text-amber-600">{flaggedCount}</span></div>
              <div className="flex justify-between"><span>Marks:</span><span className="font-semibold">{quizMeta.marksPerQuestion} each</span></div>
              {quizMeta.negativeMarks > 0 && (
                <div className="flex justify-between"><span>Negative:</span><span className="font-semibold text-red-500">-{quizMeta.negativeMarks}</span></div>
              )}
            </div>
            <button onClick={() => setShowSubmitModal(true)}
              className="w-full py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5">
              <Send size={13} /> Submit Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center">Submit Quiz?</h3>
            <div className="mt-4 bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Answered:</span><span className="font-semibold text-green-600">{answeredCount} / {questions.length}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Skipped:</span><span className="font-semibold text-slate-700">{skippedCount}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Flagged:</span><span className="font-semibold text-amber-600">{flaggedCount}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Time left:</span><span className={`font-semibold font-mono ${isUrgent ? 'text-red-600' : 'text-slate-700'}`}>{formatTime(timeLeft)}</span></div>
            </div>
            {skippedCount > 0 && (
              <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 text-center">
                You have {skippedCount} unanswered question{skippedCount > 1 ? 's' : ''}. They will be marked as skipped.
              </p>
            )}
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowSubmitModal(false)} disabled={submitting}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition cursor-pointer">
                Continue
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-2">
                {submitting ? 'Submitting...' : <><Send size={14} /> Confirm</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

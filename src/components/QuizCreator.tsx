import React, { useState, useRef } from 'react';
import { Quiz, ParsedQuestion, QuizFormData, QuizType } from '../types';
import { Upload, Sparkles, CheckCircle2, Edit3, Trash2, ChevronRight, ChevronLeft, Settings, Eye, BookOpen, AlertCircle, Plus } from 'lucide-react';

interface QuizCreatorProps {
  onCreateQuiz: (formData: QuizFormData) => Promise<{ id: string }>;
  onPublishQuiz: (quizId: string) => Promise<void>;
  onParseQuestions: (rawText: string, subject: string) => Promise<ParsedQuestion[]>;
  onClose: () => void;
}

const STEPS = ['Paste & Parse', 'Edit Questions', 'Configure', 'Preview & Publish'];

export default function QuizCreator({ onCreateQuiz, onPublishQuiz, onParseQuestions, onClose }: QuizCreatorProps) {
  const [step, setStep] = useState(0);
  const [rawText, setRawText] = useState('');
  const [subject, setSubject] = useState('Computer Networks');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [questions, setQuestions] = useState<ParsedQuestion[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [createdQuizId, setCreatedQuizId] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  const [formData, setFormData] = useState<Omit<QuizFormData, 'questions'>>({
    name: '',
    description: '',
    timeLimit: 30,
    startTime: '',
    endTime: '',
    marksPerQuestion: 1,
    negativeMarks: 0.25,
    shuffleQuestions: true,
    shuffleOptions: true,
    maxAttempts: 1,
    quizType: 'practice',
    subject: 'Computer Networks',
  });

  // ---- Step 1: Parse ----
  const handleParse = async () => {
    if (!rawText.trim()) { setParseError('Paste some question text first.'); return; }
    try {
      setParsing(true); setParseError('');
      const parsed = await onParseQuestions(rawText, subject);
      if (!parsed?.length) throw new Error('No questions found. Try pasting clearer text.');
      setQuestions(parsed);
      setFormData(f => ({ ...f, subject }));
      setStep(1);
    } catch (e: any) {
      setParseError(e.message || 'Parsing failed. Check your Groq API key.');
    } finally { setParsing(false); }
  };

  // ---- Step 2: Edit questions ----
  const updateQuestion = (idx: number, field: keyof ParsedQuestion, value: any) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const updateOption = (qIdx: number, optIdx: number, text: string) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const opts = [...q.options];
      opts[optIdx] = { ...opts[optIdx], text };
      return { ...q, options: opts };
    }));
  };

  const removeQuestion = (idx: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
    if (editingIdx === idx) setEditingIdx(null);
  };

  const addBlankQuestion = () => {
    setQuestions(prev => [...prev, {
      questionText: 'New question text here',
      options: [
        { id: 'A', text: 'Option A' }, { id: 'B', text: 'Option B' },
        { id: 'C', text: 'Option C' }, { id: 'D', text: 'Option D' },
      ],
      correctAnswer: 'A',
      difficulty: 'Medium',
      subject: formData.subject || subject,
      topic: '',
    }]);
    setEditingIdx(questions.length);
  };

  // ---- Step 4: Create + Publish ----
  const handleCreate = async (andPublish: boolean) => {
    if (!formData.name.trim()) { alert('Quiz name is required.'); return; }
    if (!questions.length) { alert('At least 1 question is required.'); return; }
    try {
      setSaving(true);
      const result = await onCreateQuiz({ ...formData, questions });
      setCreatedQuizId(result.id);
      if (andPublish) {
        await onPublishQuiz(result.id);
        setPublished(true);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to create quiz');
    } finally { setSaving(false); }
  };

  if (createdQuizId) {
    return (
      <div className="max-w-lg mx-auto text-center py-12 space-y-5">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{published ? 'Quiz Published!' : 'Quiz Saved as Draft!'}</h2>
        <p className="text-slate-500 text-sm">
          {published
            ? 'The quiz is now live. Students will be notified and can start taking it.'
            : 'The quiz has been saved as draft. Publish it when ready.'}
        </p>
        {!published && (
          <button onClick={async () => { setSaving(true); await onPublishQuiz(createdQuizId); setPublished(true); setSaving(false); }}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition cursor-pointer">
            {saving ? 'Publishing...' : 'Publish Now'}
          </button>
        )}
        <button onClick={onClose}
          className="block mx-auto px-4 py-2 border border-slate-200 text-sm text-slate-700 rounded-lg hover:bg-slate-50 transition cursor-pointer">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((label, i) => (
          <React.Fragment key={i}>
            <div className={`flex items-center gap-2 ${i <= step ? 'text-indigo-600' : 'text-slate-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                i < step ? 'bg-indigo-600 border-indigo-600 text-white' :
                i === step ? 'border-indigo-600 text-indigo-600' :
                'border-slate-200 text-slate-400'
              }`}>{i < step ? '✓' : i + 1}</div>
              <span className="text-xs font-medium hidden sm:block">{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-indigo-600' : 'bg-slate-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 0: Paste & Parse */}
      {step === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Upload size={18} className="text-indigo-500" />
              Paste Question Bank
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Paste text from PDF, Word, Google Docs, books, or previous year papers. AI will parse and structure the questions automatically.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Subject</label>
            <input value={subject} onChange={e => setSubject(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="e.g. Computer Networks, DBMS, OS..." />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
              Paste Raw Questions
            </label>
            <textarea
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              rows={14}
              className="w-full border border-slate-200 rounded-lg px-3 py-3 text-sm font-mono outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
              placeholder={`Paste questions in any format, for example:\n\n1. What does TCP stand for?\nA) Transfer Control Protocol\nB) Transmission Control Protocol\nC) Transport Communication Protocol\nD) Transaction Control Protocol\nAnswer: B\n\nor\n\nWhich layer handles routing?\nA. Data Link\nB. Network\nC. Transport\nD. Application\nCorrect: B`}
            />
            <p className="text-xs text-slate-400 mt-1.5">
              {rawText.length} characters · AI handles inconsistent formats automatically
            </p>
          </div>

          {parseError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              {parseError}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={handleParse} disabled={parsing || !rawText.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition cursor-pointer">
              <Sparkles size={16} />
              {parsing ? 'Parsing with AI...' : 'Parse with AI'}
            </button>
            <button onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition cursor-pointer">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Edit Questions */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit3 size={18} className="text-indigo-500" />
                Review & Edit Questions
                <span className="text-sm font-normal text-slate-500">({questions.length} parsed)</span>
              </h2>
              <button onClick={addBlankQuestion}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition cursor-pointer">
                <Plus size={14} /> Add Question
              </button>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {questions.map((q, idx) => (
                <div key={idx} className={`border rounded-xl overflow-hidden ${editingIdx === idx ? 'border-indigo-300' : 'border-slate-200'}`}>
                  {/* Collapsed view */}
                  {editingIdx !== idx ? (
                    <div className="p-4 flex items-start gap-3 hover:bg-slate-50 cursor-pointer" onClick={() => setEditingIdx(idx)}>
                      <span className="w-6 h-6 bg-slate-100 text-slate-600 rounded text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-900 line-clamp-2">{q.questionText}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-green-600 font-semibold">✓ {q.correctAnswer}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                            q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>{q.difficulty}</span>
                          {q.topic && <span className="text-xs text-slate-400">{q.topic}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={e => { e.stopPropagation(); setEditingIdx(idx); }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition cursor-pointer">
                          <Edit3 size={13} />
                        </button>
                        <button onClick={e => { e.stopPropagation(); removeQuestion(idx); }}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition cursor-pointer">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Expanded edit */
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Q{idx + 1}</span>
                        <button onClick={() => setEditingIdx(null)}
                          className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer">Done</button>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Question Text</label>
                        <textarea
                          value={q.questionText}
                          onChange={e => updateQuestion(idx, 'questionText', e.target.value)}
                          rows={3}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((opt, oi) => (
                          <div key={opt.id} className={`flex items-center gap-2 p-2 rounded-lg border ${q.correctAnswer === opt.id ? 'border-green-400 bg-green-50' : 'border-slate-200'}`}>
                            <button
                              onClick={() => updateQuestion(idx, 'correctAnswer', opt.id)}
                              className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center cursor-pointer ${q.correctAnswer === opt.id ? 'border-green-500 bg-green-500' : 'border-slate-300 hover:border-green-400'}`}
                            >
                              {q.correctAnswer === opt.id && <span className="text-white text-[8px] font-bold">✓</span>}
                            </button>
                            <span className="text-xs font-bold text-slate-500 shrink-0">{opt.id}</span>
                            <input
                              value={opt.text}
                              onChange={e => updateOption(idx, oi, e.target.value)}
                              className="flex-1 min-w-0 text-xs bg-transparent outline-none"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Difficulty</label>
                          <select value={q.difficulty} onChange={e => updateQuestion(idx, 'difficulty', e.target.value as any)}
                            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none">
                            <option>Easy</option><option>Medium</option><option>Hard</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Topic</label>
                          <input value={q.topic} onChange={e => updateQuestion(idx, 'topic', e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none"
                            placeholder="e.g. TCP/IP" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
                          <input value={q.subject} onChange={e => updateQuestion(idx, 'subject', e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(0)}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition cursor-pointer">
              <ChevronLeft size={16} /> Back
            </button>
            <button onClick={() => setStep(2)} disabled={!questions.length}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition cursor-pointer">
              Configure Quiz <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Configure */}
      {step === 2 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Settings size={18} className="text-indigo-500" />
            Configure Quiz Settings
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Quiz Name *</label>
              <input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="e.g. Computer Networks — Unit 1 Test" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Description</label>
              <textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
                placeholder="Brief description for students" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Quiz Type</label>
              <select value={formData.quizType} onChange={e => setFormData(f => ({ ...f, quizType: e.target.value as QuizType }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500">
                <option value="practice">Practice</option>
                <option value="weekly">Weekly Quiz</option>
                <option value="monthly">Monthly Quiz</option>
                <option value="placement">Placement Quiz</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Subject</label>
              <input value={formData.subject} onChange={e => setFormData(f => ({ ...f, subject: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Time Limit (minutes)</label>
              <input type="number" min={5} max={180} value={formData.timeLimit}
                onChange={e => setFormData(f => ({ ...f, timeLimit: parseInt(e.target.value) || 30 }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Max Attempts</label>
              <input type="number" min={1} max={5} value={formData.maxAttempts}
                onChange={e => setFormData(f => ({ ...f, maxAttempts: parseInt(e.target.value) || 1 }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Marks per Question</label>
              <input type="number" min={0.5} step={0.5} value={formData.marksPerQuestion}
                onChange={e => setFormData(f => ({ ...f, marksPerQuestion: parseFloat(e.target.value) || 1 }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Negative Marks</label>
              <input type="number" min={0} step={0.25} value={formData.negativeMarks}
                onChange={e => setFormData(f => ({ ...f, negativeMarks: parseFloat(e.target.value) || 0 }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Start Time (optional)</label>
              <input type="datetime-local" value={formData.startTime}
                onChange={e => setFormData(f => ({ ...f, startTime: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">End Time (optional)</label>
              <input type="datetime-local" value={formData.endTime}
                onChange={e => setFormData(f => ({ ...f, endTime: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>

          <div className="flex gap-6 pt-2">
            {[
              { key: 'shuffleQuestions', label: 'Shuffle Question Order' },
              { key: 'shuffleOptions', label: 'Shuffle Answer Options' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setFormData(f => ({ ...f, [key]: !f[key as keyof typeof f] }))}
                  className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${(formData as any)[key] ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${(formData as any)[key] ? 'left-4' : 'left-0.5'}`} />
                </div>
                <span className="text-sm text-slate-700">{label}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition cursor-pointer">
              <ChevronLeft size={16} /> Back
            </button>
            <button onClick={() => setStep(3)} disabled={!formData.name.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition cursor-pointer">
              Preview & Publish <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview & Publish */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-5">
              <Eye size={18} className="text-indigo-500" />
              Preview & Publish
            </h2>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Quiz Details</p>
                <p className="font-semibold text-slate-900">{formData.name}</p>
                {formData.description && <p className="text-sm text-slate-600">{formData.description}</p>}
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">{formData.quizType}</span>
                  <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">{formData.subject}</span>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Settings</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-700">
                  <span className="text-slate-500">Questions:</span><span className="font-medium">{questions.length}</span>
                  <span className="text-slate-500">Time limit:</span><span className="font-medium">{formData.timeLimit} min</span>
                  <span className="text-slate-500">Marks each:</span><span className="font-medium">{formData.marksPerQuestion}</span>
                  <span className="text-slate-500">Negative marks:</span><span className="font-medium">{formData.negativeMarks}</span>
                  <span className="text-slate-500">Max attempts:</span><span className="font-medium">{formData.maxAttempts}</span>
                  <span className="text-slate-500">Shuffle:</span><span className="font-medium">{formData.shuffleQuestions ? 'Yes' : 'No'}</span>
                  <span className="text-slate-500">Total marks:</span><span className="font-bold text-indigo-600">{questions.length * formData.marksPerQuestion}</span>
                </div>
              </div>
            </div>

            {/* Sample questions preview */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Sample Questions</p>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {questions.slice(0, 3).map((q, i) => (
                  <div key={i} className="border border-slate-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-slate-900 mb-3">Q{i + 1}. {q.questionText}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map(opt => (
                        <div key={opt.id} className={`text-xs px-3 py-2 rounded-lg border ${q.correctAnswer === opt.id ? 'border-green-400 bg-green-50 text-green-800 font-semibold' : 'border-slate-200 text-slate-600'}`}>
                          <span className="font-bold">{opt.id})</span> {opt.text}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{q.difficulty}</span>
                      {q.topic && <span className="text-[10px] text-slate-400">{q.topic}</span>}
                    </div>
                  </div>
                ))}
                {questions.length > 3 && <p className="text-xs text-slate-400 text-center">... and {questions.length - 3} more questions</p>}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition cursor-pointer">
              <ChevronLeft size={16} /> Back
            </button>
            <button onClick={() => handleCreate(false)} disabled={saving}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition cursor-pointer disabled:opacity-50">
              {saving ? 'Saving...' : 'Save as Draft'}
            </button>
            <button onClick={() => handleCreate(true)} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition cursor-pointer">
              <BookOpen size={16} />
              {saving ? 'Publishing...' : 'Publish Quiz'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

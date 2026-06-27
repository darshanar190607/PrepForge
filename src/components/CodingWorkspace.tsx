import React, { useState, useEffect } from 'react';
import { Problem, Submission } from '../types';
import { 
  Play, 
  Send, 
  CheckCircle, 
  Code2, 
  Terminal, 
  ChevronLeft, 
  ExternalLink, 
  Sparkles,
  Award,
  BookOpen,
  X,
  FileCode2,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Editor from '@monaco-editor/react';

interface CodingWorkspaceProps {
  problem: Problem;
  userId: string;
  userName: string;
  userAvatar: string;
  onSubmitSuccess: (submission: Submission) => void;
  onClose: () => void;
  existingSubmission?: Submission;
}

export default function CodingWorkspace({
  problem,
  userId,
  userName,
  userAvatar,
  onSubmitSuccess,
  onClose,
  existingSubmission
}: CodingWorkspaceProps) {
  const [language, setLanguage] = useState<string>('python');
  const [code, setCode] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<'idle' | 'success' | 'running' | 'error'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'resources'>('description');
  const [runLogs, setRunLogs] = useState<string[]>([]);
  const [editorTheme, setEditorTheme] = useState<'one-dark' | 'monokai' | 'nord'>('one-dark');
  const [submittedAt, setSubmittedAt] = useState<string | null>(existingSubmission ? existingSubmission.submittedAt : null);

  // Load starter code or existing submission
  useEffect(() => {
    if (existingSubmission) {
      setCode(existingSubmission.code);
      setLanguage(existingSubmission.language);
      setExplanation(existingSubmission.explanation);
      setSubmittedAt(existingSubmission.submittedAt);
    } else {
      setCode(problem.starterCode[language] || '');
      setExplanation('');
      setSubmittedAt(null);
    }
  }, [problem, language, existingSubmission]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (!existingSubmission) {
      setCode(problem.starterCode[newLang] || '');
    }
  };

  const handleRunTests = () => {
    setIsRunningTests(true);
    setTestResults('running');
    setRunLogs(['$ compiling code...', '$ running initial test cases...']);

    // Simulate running tests step by step
    setTimeout(() => {
      setRunLogs(prev => [...prev, `[TEST 1] Input: ${problem.testCases[0]?.input || 'N/A'}`]);
    }, 600);

    setTimeout(() => {
      setRunLogs(prev => [...prev, `🟢 Test 1 Passed. Output matches: ${problem.testCases[0]?.output || 'N/A'}`]);
    }, 1200);

    setTimeout(() => {
      if (problem.testCases.length > 1) {
        setRunLogs(prev => [...prev, `[TEST 2] Input: ${problem.testCases[1]?.input || 'N/A'}`]);
      }
    }, 1800);

    setTimeout(() => {
      if (problem.testCases.length > 1) {
        setRunLogs(prev => [...prev, `🟢 Test 2 Passed. Output matches: ${problem.testCases[1]?.output || 'N/A'}`]);
      }
      setRunLogs(prev => [...prev, '', '🎉 STATUS: Success (All basic tests passed!)']);
      setIsRunningTests(false);
      setTestResults('success');
    }, 2400);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate submission delay
    setTimeout(() => {
      const newSubmission: Submission = {
        id: `sub-${Date.now()}`,
        problemId: problem.id,
        userId: userId,
        userName: userName,
        userAvatar: userAvatar,
        code: code,
        language: language,
        status: 'Accepted',
        submittedAt: new Date().toISOString(),
        runtime: `${Math.floor(Math.random() * 80) + 10} ms`,
        memory: `${(Math.random() * 5 + 12).toFixed(1)} MB`,
        explanation: explanation || 'Used sliding window pattern to optimize time complexity.'
      };

      setSubmittedAt(newSubmission.submittedAt);
      onSubmitSuccess(newSubmission);
      setIsSubmitting(false);
      setShowSuccessModal(true);
    }, 1500);
  };

  const themeClasses = {
    'one-dark': 'bg-[#1e1e24] text-gray-200 border-slate-700 focus:ring-sky-500',
    'monokai': 'bg-[#272822] text-[#f8f8f2] border-amber-600 focus:ring-amber-500',
    'nord': 'bg-[#2e3440] text-[#d8dee9] border-cyan-800 focus:ring-cyan-500'
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 flex flex-col h-full overflow-hidden font-sans" id="workspace-container">
      {/* Workspace Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0" id="workspace-header">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            id="back-to-dashboard-btn"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                problem.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                problem.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-rose-50 text-rose-700 border-rose-200'
              }`} id="workspace-problem-difficulty">
                {problem.difficulty}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {problem.topic} • {problem.pattern}
              </span>
            </div>
            <h1 className="text-base font-bold text-slate-850 mt-1" id="workspace-problem-title">{problem.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 font-mono" id="workspace-timer">
            <Clock size={14} className="text-amber-550" />
            <span>Deadline: {new Date(problem.deadline).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            id="close-workspace-btn"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Workspace Body */}
      <div className="flex-1 flex overflow-hidden lg:flex-row flex-col" id="workspace-body">
        {/* Left Panel: Problem Statement & Resources */}
        <div className="w-full lg:w-[45%] bg-slate-50 border-r border-slate-200 flex flex-col h-full overflow-hidden" id="workspace-left-panel">
          <div className="border-b border-slate-200 flex bg-slate-100/70 px-4" id="workspace-left-tabs">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-4 py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                activeTab === 'description' 
                  ? 'border-indigo-600 text-slate-850' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
              id="tab-description-btn"
            >
              Problem Description
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-4 py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                activeTab === 'resources' 
                  ? 'border-indigo-600 text-slate-850' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
              id="tab-resources-btn"
            >
              Resources & Hints ({problem.resources.length})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6" id="workspace-left-content">
            {activeTab === 'description' ? (
              <div className="space-y-6 text-slate-700">
                {/* Description Text */}
                <div className="prose max-w-none text-slate-600 text-sm leading-relaxed whitespace-pre-line p-5 bg-white rounded-xl border border-slate-200 shadow-sm" id="problem-markdown-desc">
                  {problem.description}
                </div>

                {/* Company Tags */}
                {problem.companyTags && problem.companyTags.length > 0 && (
                  <div className="pt-4 border-t border-slate-200" id="company-tags-section">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Frequently Asked In</h4>
                    <div className="flex flex-wrap gap-2">
                      {problem.companyTags.map(tag => (
                        <span 
                          key={tag} 
                          className="bg-white text-slate-600 text-xs px-2.5 py-1 rounded-lg border border-slate-200 font-mono shadow-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Test Cases display */}
                <div className="pt-4 border-t border-slate-200" id="testcases-info-section">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Example Test Cases</h4>
                  <div className="space-y-3">
                    {problem.testCases.map((tc, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-xs shadow-sm">
                        <div className="text-slate-500 mb-1.5 font-bold">Test Case {idx + 1}:</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <span className="text-indigo-600 font-bold">Input:</span> <code className="text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded">{tc.input}</code>
                          </div>
                          <div>
                            <span className="text-emerald-600 font-bold">Expected Output:</span> <code className="text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded">{tc.output}</code>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6" id="problem-resources-section">
                <div>
                  <h3 className="text-slate-800 font-bold text-base mb-1">Recommended Study Resources</h3>
                  <p className="text-slate-500 text-xs mb-4">
                    Stuck? Revise the pattern or look at step-by-step problem-solving tutorials before writing code.
                  </p>
                  <div className="space-y-3">
                    {problem.resources.map((resource, idx) => (
                      <a
                        key={idx}
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-slate-50 transition group shadow-sm cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className="text-indigo-500" size={18} />
                          <div>
                            <div className="text-slate-800 text-sm font-semibold group-hover:text-indigo-600 transition">
                              {resource.name}
                            </div>
                            <div className="text-slate-400 text-xs mt-0.5 truncate max-w-xs md:max-w-md font-mono">
                              {resource.url}
                            </div>
                          </div>
                        </div>
                        <ExternalLink size={14} className="text-slate-400 group-hover:text-slate-800 transition" />
                      </a>
                    ))}
                  </div>
                </div>

                <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-lg space-y-2">
                  <h4 className="text-indigo-600 font-bold text-sm flex items-center gap-2">
                    <Sparkles size={16} /> Help Tip
                  </h4>
                  <p className="text-slate-650 text-xs leading-relaxed">
                    Try solving this first on paper using the **{problem.pattern}** logic. Write down your test-cases, track your bounds/pointers, then start coding. Remember to write a brief explanation of your approach when submitting to help your team!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Code Editor, Logs, and Actions */}
        <div className="flex-1 flex flex-col h-full bg-[#FFFFFF] overflow-hidden" id="workspace-right-panel">
          {/* Editor Header controls */}
          <div className="bg-[#F7F7F7] px-4 py-3 flex items-center justify-between border-b border-[#E2E2E2] text-xs flex-shrink-0" id="editor-controls-bar">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Code2 size={14} className="text-[#5C6FFF]" />
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="bg-[#FFFFFF] border border-[#E2E2E2] rounded text-[#111111] py-1 px-2.5 font-bold outline-none cursor-pointer focus:border-[#5C6FFF]"
                  id="editor-language-selector"
                  disabled={!!existingSubmission}
                >
                  <option value="python">Python 3</option>
                  <option value="javascript">JavaScript (ES6)</option>
                  <option value="cpp">C++ (GCC 17)</option>
                  <option value="java">Java 17</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#888888] font-semibold">Compiler:</span>
                <span className="text-[#111111] font-mono font-bold">v1.12.0-secure</span>
              </div>
            </div>

            {/* Submitted status banner */}
            {(existingSubmission || submittedAt) ? (
              <div className="flex items-center gap-1.5 bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] px-2.5 py-1 rounded font-bold uppercase text-[9px] font-mono">
                <CheckCircle size={11} />
                <span>✓ Submitted at {new Date(existingSubmission?.submittedAt || submittedAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ) : (
              <div className="text-[#888888] font-mono flex items-center gap-1.5 text-[10px]">
                <FileCode2 size={13} />
                <span>Workspace Active</span>
              </div>
            )}
          </div>

          {/* Monaco Editor embedded */}
          <div className="flex-1 min-h-[220px] relative border-b border-[#E2E2E2]" id="editor-container">
            <Editor
              height="100%"
              language={language === 'python' ? 'python' : language === 'javascript' ? 'javascript' : language === 'cpp' ? 'cpp' : 'java'}
              theme="vs"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                fontSize: 13,
                fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                automaticLayout: true,
                readOnly: !!existingSubmission,
                padding: { top: 12 },
              }}
            />
          </div>

          {/* Add approach notes area */}
          <div className="p-4 bg-[#FFFFFF] border-t border-[#E2E2E2] flex-shrink-0" id="approach-explanation-container">
            <label className="block text-[10px] font-bold text-[#111111] uppercase tracking-wider mb-2 flex items-center gap-2 font-mono">
              <Award size={14} className="text-[#5C6FFF]" />
              Add approach notes (optional)
            </label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full bg-[#F7F7F7] border border-[#E2E2E2] rounded text-xs text-[#111111] p-2.5 font-sans outline-none focus:border-[#5C6FFF] focus:bg-[#FFFFFF] transition"
              placeholder="e.g. Optimized with a single hash-map lookup. Time complexity is O(N) and space complexity is O(N). This is preferred over brute force..."
              rows={2}
              disabled={!!existingSubmission}
              id="approach-explanation-textarea"
            />
          </div>

          {/* Test run Logs or status bar */}
          <div className="bg-[#111111] flex flex-col max-h-[140px] overflow-hidden flex-shrink-0" id="test-logs-panel">
            <div className="bg-[#18181c] px-4 py-2 border-b border-[#26262b] flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5"><Terminal size={12} /> Test Console</span>
              {testResults === 'success' && <span className="text-[#22C55E] font-bold">Passed</span>}
              {testResults === 'running' && <span className="text-indigo-400 animate-pulse">Running tests...</span>}
            </div>
            <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] text-[#F5F5F5] bg-[#111111] min-h-[60px]">
              {runLogs.length === 0 ? (
                <span className="text-slate-500 italic">No logs. Click 'Run Tests' to execute code against cases.</span>
              ) : (
                <div className="space-y-1">
                  {runLogs.map((log, idx) => (
                    <div key={idx} className={
                      log.startsWith('🟢') || log.includes('Passed') ? 'text-[#22C55E] font-medium' :
                      log.startsWith('🎉') ? 'text-[#22C55E] font-bold' :
                      log.startsWith('$') ? 'text-slate-500' : 'text-slate-300'
                    }>
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons footer */}
          <footer className="bg-[#FFFFFF] border-t border-[#E2E2E2] px-6 py-4 flex items-center justify-between flex-shrink-0" id="workspace-footer">
            <div className="text-xs text-[#888888] font-sans">
              Press submit once your solution passes all test cases.
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRunTests}
                disabled={isRunningTests || isSubmitting || !!existingSubmission}
                className="flex items-center gap-2 text-[#111111] bg-[#F7F7F7] hover:bg-[#E2E2E2]/60 border border-[#E2E2E2] disabled:opacity-50 px-4 py-2 rounded text-xs font-semibold transition cursor-pointer"
                id="run-tests-btn"
              >
                <Play size={15} className={isRunningTests ? 'animate-spin' : ''} />
                <span>Run Tests</span>
              </button>

              <button
                onClick={handleSubmit}
                disabled={isRunningTests || isSubmitting || !code.trim() || !!existingSubmission}
                className="flex items-center gap-2 text-white bg-[#5C6FFF] hover:bg-[#5C6FFF]/90 disabled:opacity-50 px-5 py-2 rounded text-xs font-semibold transition cursor-pointer shadow-sm"
                id="submit-solution-btn"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Submit Solution</span>
                  </>
                )}
              </button>
            </div>
          </footer>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowSuccessModal(false);
                onClose();
              }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
              id="success-modal-overlay"
            />
            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 text-center shadow-lg relative z-10"
              id="success-modal-box"
            >
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-150 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={36} />
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-2" id="success-modal-title">Challenge Submitted Successfully!</h3>
              <p className="text-slate-500 text-xs mb-6 leading-relaxed" id="success-modal-message">
                Excellent job! Your code passed all {problem.testCases.length + 3} automated tests. Your learning analytics have been updated.
              </p>

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-left space-y-2 mb-6" id="submission-meta-summary">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Runtime:</span>
                  <span className="font-mono text-emerald-600 font-bold">Accepted (45ms)</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Memory:</span>
                  <span className="font-mono text-slate-700">14.6 MB</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Coding Streak:</span>
                  <span className="text-amber-600 font-bold">🔥 Updated!</span>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    onClose();
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer w-full"
                  id="go-back-btn"
                >
                  Return to Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

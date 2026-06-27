import React, { useState, useEffect } from 'react';
import { Problem, Submission } from '../types';
import { 
  Columns, 
  ChevronRight, 
  Sparkles, 
  ArrowLeftRight, 
  CheckCircle,
  Copy,
  Terminal,
  User,
  Activity,
  Cpu,
  BookOpen,
  CornerDownRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface CodeCompareProps {
  problems: Problem[];
  submissions: Submission[];
  initialProblemId?: string;
  onClose?: () => void;
}

export default function CodeCompare({
  problems,
  submissions,
  initialProblemId,
  onClose
}: CodeCompareProps) {
  const [selectedProblemId, setSelectedProblemId] = useState<string>('');
  const [columnCount, setColumnCount] = useState<number>(2); // 2 or 3 columns
  const [selectedSubs, setSelectedSubs] = useState<Record<number, string>>({
    0: '', // Submission ID for column 1
    1: '', // Submission ID for column 2
    2: '', // Submission ID for column 3
  });
  const [copiedCol, setCopiedCol] = useState<number | null>(null);

  // Initialize selected problem
  useEffect(() => {
    if (initialProblemId) {
      setSelectedProblemId(initialProblemId);
    } else if (problems.length > 0) {
      setSelectedProblemId(problems[0].id);
    }
  }, [initialProblemId, problems]);

  // Filter submissions for current problem
  const problemSubmissions = submissions.filter(s => s.problemId === selectedProblemId && s.status === 'Accepted');
  const currentProblem = problems.find(p => p.id === selectedProblemId);

  // Auto-populate columns when problem selection changes
  useEffect(() => {
    if (problemSubmissions.length > 0) {
      const nextSubs: Record<number, string> = { 0: '', 1: '', 2: '' };
      problemSubmissions.forEach((sub, index) => {
        if (index < 3) {
          nextSubs[index] = sub.id;
        }
      });
      setSelectedSubs(nextSubs);
    } else {
      setSelectedSubs({ 0: '', 1: '', 2: '' });
    }
  }, [selectedProblemId, submissions]);

  const handleSubChange = (colIndex: number, subId: string) => {
    setSelectedSubs(prev => ({
      ...prev,
      [colIndex]: subId
    }));
  };

  const handleCopyCode = (colIndex: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCol(colIndex);
    setTimeout(() => setCopiedCol(null), 1800);
  };

  return (
    <div className="space-y-6" id="code-compare-root">
      {/* Top Bar / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm" id="compare-top-bar">
        <div>
          <h2 className="text-lg font-bold text-slate-850 flex items-center gap-2" id="compare-heading">
            <ArrowLeftRight className="text-indigo-500" size={22} />
            Code Comparison Workspace
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Analyze different coding approaches, optimizations, time complexities, and coding styles side-by-side.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Problem Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs font-bold uppercase">Problem:</span>
            <select
              value={selectedProblemId}
              onChange={(e) => setSelectedProblemId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg text-slate-700 py-1.5 px-3 text-xs outline-none focus:border-indigo-500 cursor-pointer max-w-xs"
              id="compare-problem-selector"
            >
              {problems.map(prob => (
                <option key={prob.id} value={prob.id}>
                  {prob.title} ({prob.difficulty})
                </option>
              ))}
            </select>
          </div>

          {/* Layout Columns Switcher */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-lg" id="column-switcher">
            <button
              onClick={() => setColumnCount(2)}
              className={`p-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                columnCount === 2 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              id="columns-2-btn"
            >
              <Columns size={13} />
              <span>2-Way</span>
            </button>
            <button
              onClick={() => setColumnCount(3)}
              className={`p-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                columnCount === 3 ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              id="columns-3-btn"
            >
              <Columns size={13} />
              <span>3-Way</span>
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-600 hover:text-slate-800 bg-slate-100 border border-slate-200 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-xs transition font-bold cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Problem Meta Card */}
      {currentProblem && (
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm" id="compare-problem-meta">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                currentProblem.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                currentProblem.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {currentProblem.difficulty}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {currentProblem.topic} • Pattern: {currentProblem.pattern}
              </span>
            </div>
            <h3 className="text-slate-850 font-bold text-base mt-1">{currentProblem.title}</h3>
          </div>

          <div className="flex items-center gap-2 bg-indigo-50/50 border border-indigo-100 p-3.5 rounded-lg text-xs max-w-md">
            <Sparkles className="text-indigo-500 flex-shrink-0" size={16} />
            <p className="text-slate-650 leading-relaxed">
              Comparing other students' submissions is the fastest way to learn optimizations, alternative syntax, and space-saving tips.
            </p>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Columns Grid */}
      <div 
        className={`grid gap-4 ${
          columnCount === 2 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 xl:grid-cols-3'
        }`}
        id="compare-grid"
      >
        {Array.from({ length: columnCount }).map((_, colIdx) => {
          const currentSubId = selectedSubs[colIdx];
          const currentSub = problemSubmissions.find(s => s.id === currentSubId);

          return (
            <div 
              key={colIdx} 
              className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col h-[650px] shadow-sm"
              id={`compare-column-${colIdx}`}
            >
              {/* Column Dropdown Selector */}
              <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded">Col {colIdx + 1}</span>
                  <select
                    value={currentSubId || ''}
                    onChange={(e) => handleSubChange(colIdx, e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg text-slate-700 py-1.5 px-2.5 text-xs outline-none focus:border-indigo-400 cursor-pointer flex-1"
                    id={`sub-selector-col-${colIdx}`}
                  >
                    <option value="">-- Select Solution --</option>
                    {problemSubmissions.map(sub => (
                      <option key={sub.id} value={sub.id}>
                        {sub.userName} ({sub.language.toUpperCase()}) - {sub.runtime}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Column Body */}
              {currentSub ? (
                <div className="flex-1 flex flex-col overflow-hidden text-slate-700">
                  {/* Student Info Bar */}
                  <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={currentSub.userAvatar} 
                        alt={currentSub.userName} 
                        className="w-8 h-8 rounded-full border border-slate-200 object-cover" 
                      />
                      <div>
                        <div className="text-slate-800 text-xs font-semibold">{currentSub.userName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(currentSub.submittedAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} at {new Date(currentSub.submittedAt).toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'})}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="bg-slate-50 text-slate-600 font-mono text-[10px] px-2 py-1 rounded border border-slate-200 font-bold">
                        {currentSub.language.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Code Performance Metrics */}
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-around gap-2 text-center text-xs font-mono">
                    <div className="flex items-center gap-1 text-slate-500">
                      <Activity size={12} className="text-indigo-500" />
                      <span>Runtime:</span>
                      <span className="text-slate-800 font-bold">{currentSub.runtime}</span>
                    </div>
                    <div className="h-4 w-px bg-slate-200" />
                    <div className="flex items-center gap-1 text-slate-500">
                      <Cpu size={12} className="text-indigo-500" />
                      <span>Memory:</span>
                      <span className="text-slate-800 font-bold">{currentSub.memory}</span>
                    </div>
                  </div>

                  {/* Scrollable Code Box */}
                  <div className="flex-1 overflow-auto bg-[#141416] p-4 font-mono text-xs leading-5 relative group border-b border-slate-200">
                    <button
                      onClick={() => handleCopyCode(colIdx, currentSub.code)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      title="Copy Code"
                    >
                      {copiedCol === colIdx ? <CheckCircle size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                    
                    <pre className="text-slate-300 tab-size-4">
                      {currentSub.code.split('\n').map((line, lineIdx) => (
                        <div key={lineIdx} className="table-row">
                          <span className="table-cell text-slate-600 text-right pr-4 select-none w-6">{lineIdx + 1}</span>
                          <span className="table-cell whitespace-pre">{line}</span>
                        </div>
                      ))}
                    </pre>
                  </div>

                  {/* Student's Explanation */}
                  <div className="p-4 bg-slate-50/50 max-h-[160px] overflow-y-auto text-xs" id={`explanation-box-col-${colIdx}`}>
                    <h5 className="font-bold text-[10px] uppercase text-indigo-600 tracking-wider mb-1.5 flex items-center gap-1">
                      <BookOpen size={11} /> Author's Explanation
                    </h5>
                    <div className="text-slate-600 leading-relaxed font-sans pl-2 border-l-2 border-indigo-400 whitespace-pre-wrap">
                      {currentSub.explanation}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-450">
                  <User size={36} className="text-slate-300 mb-3" />
                  <p className="text-xs font-semibold text-slate-500">No peer solution selected</p>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
                    Use the dropdown above to load a classmate's code.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparison Bottom Tips */}
      <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-xs text-slate-600 flex items-start gap-2.5 shadow-xs">
        <Terminal size={15} className="text-indigo-500 mt-0.5 font-mono" />
        <div>
          <span className="font-bold text-indigo-700">Tip:</span> Look for how memory is saved by avoiding unnecessary object instantiation (e.g. static primitive arrays vs. standard sets), or how runtime is lowered by shortening traversal paths (sliding window vs nested loops). Try to rewrite your own solution if you find a better approach!
        </div>
      </div>
    </div>
  );
}

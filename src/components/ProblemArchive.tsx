import React, { useState } from 'react';
import { Problem, Submission } from '../types';
import { 
  Search, 
  Filter, 
  Tag, 
  Layers, 
  BookOpen, 
  ExternalLink, 
  CheckCircle2, 
  ArrowRight,
  Code,
  ArrowLeftRight,
  Sparkles
} from 'lucide-react';

interface ProblemArchiveProps {
  problems: Problem[];
  submissions: Submission[];
  userId: string;
  onSolveProblem: (problem: Problem) => void;
  onCompareProblem: (problemId: string) => void;
}

export default function ProblemArchive({
  problems,
  submissions,
  userId,
  onSolveProblem,
  onCompareProblem
}: ProblemArchiveProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [expandedProblemId, setExpandedProblemId] = useState<string | null>(null);

  // Extract all topics, patterns, and companies for filtering
  const topics = ['All', ...Array.from(new Set(problems.map(p => p.topic)))];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
  
  const allCompanies = Array.from(new Set(problems.flatMap(p => p.companyTags || [])));
  const companies = ['All', ...allCompanies];

  // Check if a problem has been solved by the current user
  const isProblemSolvedByUser = (problemId: string) => {
    return submissions.some(s => s.problemId === problemId && s.userId === userId && s.status === 'Accepted');
  };

  // Filter problems
  const filteredProblems = problems.filter(prob => {
    const matchesSearch = prob.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prob.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prob.pattern.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = selectedTopic === 'All' || prob.topic === selectedTopic;
    const matchesDifficulty = selectedDifficulty === 'All' || prob.difficulty === selectedDifficulty;
    const matchesCompany = selectedCompany === 'All' || (prob.companyTags && prob.companyTags.includes(selectedCompany));
    
    return matchesSearch && matchesTopic && matchesDifficulty && matchesCompany;
  });

  return (
    <div className="space-y-6" id="problem-archive-root">
      {/* Search and Filters Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4" id="archive-filter-panel">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="text-indigo-500" size={22} />
              Problem Archive
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Browse through all historical coding challenges. Filter by topic, difficulty, patterns, or company tags to revise efficiently.
            </p>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2" id="filters-grid">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search problem, pattern..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 pl-9 pr-4 py-2 rounded-lg text-xs outline-none placeholder-slate-400 focus:border-indigo-500 focus:bg-white transition"
              id="search-input"
            />
          </div>

          {/* Topic Selector */}
          <div className="flex items-center gap-2">
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-2 px-3 rounded-lg text-xs outline-none focus:border-indigo-500 cursor-pointer focus:bg-white transition"
              id="topic-filter-selector"
            >
              <option disabled>Select Topic</option>
              {topics.map(t => (
                <option key={t} value={t}>{t === 'All' ? 'All Topics' : t}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Selector */}
          <div className="flex items-center gap-2">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-2 px-3 rounded-lg text-xs outline-none focus:border-indigo-500 cursor-pointer focus:bg-white transition"
              id="difficulty-filter-selector"
            >
              <option disabled>Select Difficulty</option>
              {difficulties.map(d => (
                <option key={d} value={d}>{d === 'All' ? 'All Difficulties' : d}</option>
              ))}
            </select>
          </div>

          {/* Company Tag Selector */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-2 px-3 rounded-lg text-xs outline-none focus:border-indigo-500 cursor-pointer focus:bg-white transition"
              id="company-filter-selector"
            >
              <option disabled>Select Company</option>
              {companies.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Companies' : c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Problems List Grid */}
      <div className="space-y-4" id="problems-archive-list">
        {filteredProblems.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 text-center text-slate-500" id="no-problems-fallback">
            <Layers size={40} className="text-slate-400 mx-auto mb-3" />
            <h3 className="text-slate-800 font-semibold text-sm">No Problems Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              We couldn't find any problems matching your filters. Try checking your spelling or adjusting topics.
            </p>
          </div>
        ) : (
          filteredProblems.map(prob => {
            const solved = isProblemSolvedByUser(prob.id);
            const totalGroupSolves = submissions.filter(s => s.problemId === prob.id && s.status === 'Accepted');
            const isExpanded = expandedProblemId === prob.id;

            return (
              <div 
                key={prob.id} 
                className={`bg-white border transition-all rounded-xl shadow-sm overflow-hidden ${
                  isExpanded ? 'border-indigo-400 ring-1 ring-indigo-50/30' : 'border-slate-200 hover:border-slate-300'
                }`}
                id={`archive-item-${prob.id}`}
              >
                {/* Main Accordion Header */}
                <div 
                  onClick={() => setExpandedProblemId(isExpanded ? null : prob.id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                  id={`archive-item-header-${prob.id}`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Status Checkmark */}
                    <div className="mt-1">
                      {solved ? (
                        <CheckCircle2 className="text-emerald-500 animate-fade-in" size={20} title="You Solved This" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-300 hover:border-indigo-400 transition" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-slate-800 font-bold text-base hover:text-indigo-600 transition">
                          {prob.title}
                        </h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          prob.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          prob.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {prob.difficulty}
                        </span>
                        <span className="text-slate-500 text-xs font-mono">
                          {prob.topic}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-mono">
                        <span>Pattern: <strong className="text-slate-700 font-medium">{prob.pattern}</strong></span>
                        <span>•</span>
                        <span>Group Submissions: <strong className="text-indigo-600 font-semibold">{totalGroupSolves.length} members</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Company and expand trigger */}
                  <div className="flex items-center justify-between md:justify-end gap-4" id={`archive-item-meta-${prob.id}`}>
                    <div className="flex flex-wrap gap-1">
                      {prob.companyTags && prob.companyTags.slice(0, 2).map(tag => (
                        <span key={tag} className="bg-slate-50 text-slate-600 text-[10px] px-2 py-0.5 rounded border border-slate-200 font-mono">
                          {tag}
                        </span>
                      ))}
                      {prob.companyTags && prob.companyTags.length > 2 && (
                        <span className="text-[10px] text-slate-400 px-1 py-0.5 font-mono">+{prob.companyTags.length - 2}</span>
                      )}
                    </div>

                    <button 
                      className="text-xs text-indigo-700 hover:text-indigo-800 font-semibold flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedProblemId(isExpanded ? null : prob.id);
                      }}
                    >
                      <span>{isExpanded ? 'Collapse' : 'Details'}</span>
                      <ArrowRight size={13} className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-6 space-y-6" id={`archive-item-details-${prob.id}`}>
                    {/* Inner Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Description column */}
                      <div className="lg:col-span-7 space-y-4">
                        <div className="prose max-w-none text-slate-700 text-xs leading-relaxed whitespace-pre-line p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                          {prob.description}
                        </div>

                        {/* Resource links */}
                        <div className="space-y-2">
                          <h4 className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Helpful Study Materials</h4>
                          <div className="flex flex-wrap gap-2">
                            {prob.resources.map((res, i) => (
                              <a
                                key={i}
                                href={res.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-indigo-400 text-xs text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg transition shadow-sm"
                              >
                                <Tag size={12} />
                                <span>{res.name}</span>
                                <ExternalLink size={10} />
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Submissions comparison list column */}
                      <div className="lg:col-span-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-slate-500 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Code size={13} className="text-indigo-500" />
                            Classmate Submissions
                          </h4>

                          {/* Quick Compare shortcut */}
                          {totalGroupSolves.length >= 2 && (
                            <button
                              onClick={() => onCompareProblem(prob.id)}
                              className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1 px-2.5 rounded-md flex items-center gap-1 transition cursor-pointer"
                              id={`quick-compare-btn-${prob.id}`}
                            >
                              <ArrowLeftRight size={10} />
                              <span>Compare Solutions</span>
                            </button>
                          )}
                        </div>

                        <div className="space-y-2 max-h-[180px] overflow-y-auto font-sans" id={`sub-members-list-${prob.id}`}>
                          {totalGroupSolves.length === 0 ? (
                            <div className="text-center p-6 bg-white rounded-lg border border-slate-200 text-slate-400 text-xs italic">
                              No submissions yet. Be the first to solve!
                            </div>
                          ) : (
                            totalGroupSolves.map(sub => (
                              <div 
                                key={sub.id} 
                                className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-200 transition shadow-sm"
                              >
                                <div className="flex items-center gap-2.5">
                                  <img 
                                    src={sub.userAvatar} 
                                    alt={sub.userName} 
                                    className="w-6 h-6 rounded-full border border-slate-200 object-cover" 
                                  />
                                  <div>
                                    <span className="text-slate-800 text-xs font-semibold block leading-none">{sub.userName}</span>
                                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                                      {sub.language.toUpperCase()} • {sub.runtime}
                                    </span>
                                  </div>
                                </div>

                                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-150 font-mono">
                                  Accepted
                                </span>
                              </div>
                            ))
                          )}
                        </div>

                        {totalGroupSolves.length >= 2 && (
                          <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 flex items-start gap-2">
                            <Sparkles size={14} className="text-indigo-500 mt-0.5" />
                            <p className="text-[10px] text-slate-600 leading-normal">
                              There are <strong>{totalGroupSolves.length}</strong> solutions available for side-by-side comparison. You can click 'Compare Solutions' to study their optimized algorithms!
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Panel Footer */}
                    <div className="pt-4 border-t border-slate-200/80 flex justify-end gap-3" id={`archive-item-actions-${prob.id}`}>
                      {totalGroupSolves.length >= 2 && (
                        <button
                          onClick={() => onCompareProblem(prob.id)}
                          className="px-4 py-2 bg-white border border-slate-200 hover:border-indigo-400 text-indigo-600 hover:text-indigo-850 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                        >
                          <ArrowLeftRight size={13} />
                          <span>Compare Implementations</span>
                        </button>
                      )}

                      <button
                        onClick={() => onSolveProblem(prob)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm shadow-indigo-600/10"
                        id={`solve-btn-${prob.id}`}
                      >
                        <Code size={13} />
                        <span>{solved ? 'Re-solve Problem' : 'Solve Challenge'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

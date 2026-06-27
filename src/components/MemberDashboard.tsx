import React from 'react';
import { User, Problem, Submission, Announcement } from '../types';
import { 
  Flame, 
  Award, 
  CheckCircle, 
  Clock, 
  Calendar, 
  Code2, 
  Megaphone, 
  TrendingUp, 
  BookOpen, 
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface MemberDashboardProps {
  user: User;
  problems: Problem[];
  submissions: Submission[];
  announcements: Announcement[];
  onSolveProblem: (prob: Problem) => void;
  onCompareProblem: (problemId: string) => void;
  onNavigateToTab: (tab: 'archive') => void;
}

export default function MemberDashboard({
  user,
  problems,
  submissions,
  announcements,
  onSolveProblem,
  onCompareProblem,
  onNavigateToTab
}: MemberDashboardProps) {
  // Filter current student's data
  const mySubmissions = submissions.filter(s => s.userId === user.id && s.status === 'Accepted');
  
  // Find Today's Challenge (The latest problem, e.g. "Invert Binary Tree" - prob-4)
  const todaysChallenge = problems.find(p => p.id === 'prob-4') || problems[problems.length - 1];
  
  const hasSolvedTodaysChallenge = todaysChallenge
    ? mySubmissions.some(s => s.problemId === todaysChallenge.id)
    : false;

  // Personal analytics calculations
  const totalSolved = mySubmissions.length;
  
  // Difficulty distribution
  let easyCount = 0;
  let mediumCount = 0;
  let hardCount = 0;
  mySubmissions.forEach(sub => {
    const prob = problems.find(p => p.id === sub.problemId);
    if (prob) {
      if (prob.difficulty === 'Easy') easyCount++;
      else if (prob.difficulty === 'Medium') mediumCount++;
      else if (prob.difficulty === 'Hard') hardCount++;
    }
  });

  const diffChartData = [
    { name: 'Easy', value: easyCount || 1, color: '#10b981' },
    { name: 'Medium', value: mediumCount || 0, color: '#f59e0b' },
    { name: 'Hard', value: hardCount || 0, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Topic Progress
  const topicCounts: Record<string, number> = {};
  mySubmissions.forEach(sub => {
    const prob = problems.find(p => p.id === sub.problemId);
    if (prob) {
      topicCounts[prob.topic] = (topicCounts[prob.topic] || 0) + 1;
    }
  });

  const topicChartData = Object.keys(topicCounts).map(topic => ({
    name: topic,
    Solved: topicCounts[topic]
  }));

  // Pattern Progress
  const patternCounts: Record<string, number> = {};
  mySubmissions.forEach(sub => {
    const prob = problems.find(p => p.id === sub.problemId);
    if (prob) {
      patternCounts[prob.pattern.split('/')[0].trim()] = (patternCounts[prob.pattern.split('/')[0].trim()] || 0) + 1;
    }
  });

  const patternChartData = Object.keys(patternCounts).map(pattern => ({
    name: pattern,
    Completions: patternCounts[pattern]
  }));

  return (
    <div className="space-y-6" id="member-dashboard-root">
      {/* Top Welcome Banner */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm" id="welcome-banner">
        <div className="flex items-center gap-4">
          <img 
            src={user.avatarUrl} 
            alt={user.name} 
            className="w-16 h-16 rounded-full border-2 border-indigo-500 object-cover" 
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800" id="welcome-message">Hello, {user.name}!</h2>
              <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono">
                Member Student
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Your placement preparation target is active. Track your progress, solve problems, and compare logic!
            </p>
          </div>
        </div>

        {/* Dynamic Streak Card */}
        <div className="flex gap-4" id="banner-quick-stats">
          <div className="bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-xl flex items-center justify-center">
              <Flame size={20} className="animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block leading-none">Coding Streak</span>
              <span className="text-slate-800 text-base font-bold mt-1 block font-mono">{user.streak} Days</span>
            </div>
          </div>

          <div className="bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 rounded-xl flex items-center justify-center">
              <Award size={20} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block leading-none">Solved Problems</span>
              <span className="text-slate-800 text-base font-bold mt-1 block font-mono">{totalSolved} Questions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Challenge & Announcements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-action-row">
        {/* Daily Challenge Card */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between" id="daily-challenge-panel">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={14} className="text-indigo-500" />
                Assigned Daily Challenge
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono">Status:</span>
                {hasSolvedTodaysChallenge ? (
                  <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded">Completed</span>
                ) : (
                  <span className="bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">Incomplete</span>
                )}
              </div>
            </div>

            {!todaysChallenge ? (
              <div className="text-center py-10 text-slate-400 italic text-xs" id="empty-challenge-state">
                No challenge today — check back soon
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-slate-800 font-bold text-base">{todaysChallenge.title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      todaysChallenge.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      todaysChallenge.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {todaysChallenge.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-500 mt-1 font-mono">
                    <span>Topic: {todaysChallenge.topic}</span>
                    <span>•</span>
                    <span>Pattern: {todaysChallenge.pattern}</span>
                  </div>
                </div>

                <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {todaysChallenge.description.replace(/###|`|```/g, '')}
                </p>

                {/* Deadline indicators */}
                <div className="flex items-center gap-2 bg-indigo-50 p-3 rounded-lg border border-indigo-100 text-[11px] text-indigo-900">
                  <Clock size={13} className="text-indigo-500 flex-shrink-0" />
                  <span>Submission window closes tonight. Solve to preserve your streak!</span>
                </div>
              </div>
            )}
          </div>

          {todaysChallenge && (
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-end mt-4">
              {/* If solved, allow comparison immediately */}
              {hasSolvedTodaysChallenge && (
                <button
                  onClick={() => onCompareProblem(todaysChallenge.id)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-indigo-600 border border-slate-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  id="compare-today-challenge-btn"
                >
                  <Code2 size={13} />
                  <span>Compare Peer Solutions</span>
                </button>
              )}

              <button
                onClick={() => onSolveProblem(todaysChallenge)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm shadow-indigo-600/10"
                id="solve-today-challenge-btn"
              >
                <Code2 size={13} />
                <span>{hasSolvedTodaysChallenge ? 'Re-Solve Code' : 'Open Workspace & Code'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Announcement Bulletin Panel */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between" id="bulletin-announcements">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Megaphone size={14} className="text-indigo-500" />
                Active Notices Bulletin
              </span>
            </div>

            <div className="space-y-4 max-h-[195px] overflow-y-auto pr-1" id="notices-list">
              {announcements.length === 0 ? (
                <div className="text-center p-6 text-slate-400 italic text-xs">
                  No bulletins posted. Have a great day!
                </div>
              ) : (
                announcements.map(ann => (
                  <div 
                    key={ann.id} 
                    className={`p-3 rounded-lg border space-y-1.5 ${
                      ann.category === 'important' ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        ann.category === 'important' ? 'bg-rose-100 text-rose-700' :
                        ann.category === 'resource' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-slate-200 text-slate-600'
                      }`}>
                        {ann.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(ann.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-slate-800 text-xs font-bold leading-tight">{ann.title}</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">{ann.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between mt-4">
            <span>Posted by College Coordinator reps</span>
            <span className="hover:underline cursor-pointer text-indigo-500 flex items-center gap-0.5">
              Refresher guides
            </span>
          </div>
        </div>
      </div>

      {/* Personal Analytics Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="personal-analytics-grid">
        {/* Chart 1: Topic Mastery */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between" id="chart-topic-mastery">
          <div>
            <h3 className="text-slate-800 font-bold text-sm">Topic Solve Mastery</h3>
            <p className="text-slate-500 text-xs mb-4">Completions grouped by coding domain.</p>
          </div>

          <div className="h-[150px]">
            {topicChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-400 italic text-xs">
                Solve a question to compile statistics!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '10px', color: '#0f172a' }}
                  />
                  <Bar dataKey="Solved" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Pattern Coverage */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between" id="chart-pattern-coverage">
          <div>
            <h3 className="text-slate-800 font-bold text-sm">Pattern-wise Progress</h3>
            <p className="text-slate-500 text-xs mb-4">Core algorithm patterns mastered.</p>
          </div>

          <div className="h-[150px]">
            {patternChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-400 italic text-xs">
                Solve a question to compile patterns!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={patternChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '10px', color: '#0f172a' }}
                  />
                  <Bar dataKey="Completions" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Difficulty Distribution */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between" id="chart-difficulty-dist">
          <div>
            <h3 className="text-slate-800 font-bold text-sm">Difficulty Ratio</h3>
            <p className="text-slate-500 text-xs mb-2">My Easy/Medium solve breakdown.</p>
          </div>

          <div className="h-[120px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={diffChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {diffChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '10px', color: '#0f172a' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
              <span className="text-[9px] text-slate-400 uppercase font-bold">Solved</span>
              <span className="text-sm font-black text-slate-800">{totalSolved}</span>
            </div>
          </div>

          <div className="flex justify-around items-center text-[10px] pt-2 border-t border-slate-100">
            {diffChartData.map(d => (
              <div key={d.name} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-slate-600 font-semibold">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Personal Submissions logs */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden" id="personal-submissions-log">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-slate-800 font-bold text-sm">My Placement Submission Logs</h3>
            <p className="text-slate-500 text-xs">A comprehensive log of solutions accepted by compiler checks.</p>
          </div>
          <button 
            onClick={() => onNavigateToTab('archive')}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>Browse Full Archive</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          {mySubmissions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 italic text-xs">
              No solutions submitted yet. Open the daily challenge or visit the Archive to write some code!
            </div>
          ) : (
            <table className="w-full text-left text-slate-600 text-xs">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-5">Challenge Name</th>
                  <th className="py-2.5 px-5">Language</th>
                  <th className="py-2.5 px-5 text-center">Runtime</th>
                  <th className="py-2.5 px-5 text-center">Memory</th>
                  <th className="py-2.5 px-5 text-right">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mySubmissions.map(sub => {
                  const prob = problems.find(p => p.id === sub.problemId);
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-5 font-semibold text-slate-800">
                        {prob?.title || 'Unknown Problem'}
                      </td>
                      <td className="py-3 px-5 font-mono text-[11px] uppercase text-indigo-600">
                        {sub.language}
                      </td>
                      <td className="py-3 px-5 text-center font-mono text-emerald-600 font-bold">
                        {sub.runtime}
                      </td>
                      <td className="py-3 px-5 text-center font-mono">
                        {sub.memory}
                      </td>
                      <td className="py-3 px-5 text-right text-slate-400 font-mono">
                        {new Date(sub.submittedAt).toLocaleDateString()} at {new Date(sub.submittedAt).toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'})}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

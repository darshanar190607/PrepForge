import React from 'react';
import { User, Problem, Submission } from '../types';
import { 
  Users, 
  Flame, 
  Award, 
  AlertCircle, 
  TrendingUp, 
  CheckCircle, 
  HelpCircle,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
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

interface AdminDashboardProps {
  users: User[];
  problems: Problem[];
  submissions: Submission[];
  onNavigateToTab: (tab: 'archive' | 'members') => void;
  onSolveProblem: (prob: Problem) => void;
}

export default function AdminDashboard({
  users,
  problems,
  submissions,
  onNavigateToTab,
  onSolveProblem
}: AdminDashboardProps) {
  const activeMembers = users.filter(u => u.status === 'active');
  const pendingRequests = users.filter(u => u.status === 'pending');
  
  // Stats
  const totalActiveUsers = activeMembers.length;
  const totalSolvedAcrossGroup = submissions.filter(s => s.status === 'Accepted').length;
  
  // Average streak
  const avgStreak = Math.round(
    activeMembers.reduce((sum, u) => sum + u.streak, 0) / (totalActiveUsers || 1)
  );

  // Group solved percentage (Assuming standard set of 4 questions is the goal)
  const maxPossibleSolves = totalActiveUsers * problems.length;
  const solvePercentage = Math.round((totalSolvedAcrossGroup / (maxPossibleSolves || 1)) * 100);

  // Recharts: Daily submissions rate over last week
  // Let's create mock timeline data based on submissions
  const submissionTrendData = [
    { date: 'Jun 19', Submissions: 8 },
    { date: 'Jun 20', Submissions: 12 },
    { date: 'Jun 21', Submissions: 15 },
    { date: 'Jun 22', Submissions: 11 },
    { date: 'Jun 23', Submissions: 19 },
    { date: 'Jun 24', Submissions: 14 },
    { date: 'Jun 25', Submissions: submissions.length }, // Current count
  ];

  // Recharts: Solves by Topic
  const topicStats: Record<string, number> = {};
  problems.forEach(p => {
    topicStats[p.topic] = 0;
  });
  submissions.forEach(sub => {
    const prob = problems.find(p => p.id === sub.problemId);
    if (prob && sub.status === 'Accepted') {
      topicStats[prob.topic] = (topicStats[prob.topic] || 0) + 1;
    }
  });
  const topicData = Object.keys(topicStats).map(topic => ({
    name: topic.length > 15 ? `${topic.substring(0, 12)}...` : topic,
    Completed: topicStats[topic]
  }));

  // Recharts: Solved Difficulty distribution
  let easyCount = 0;
  let mediumCount = 0;
  let hardCount = 0;
  submissions.forEach(sub => {
    const prob = problems.find(p => p.id === sub.problemId);
    if (prob && sub.status === 'Accepted') {
      if (prob.difficulty === 'Easy') easyCount++;
      else if (prob.difficulty === 'Medium') mediumCount++;
      else if (prob.difficulty === 'Hard') hardCount++;
    }
  });

  const difficultyData = [
    { name: 'Easy', value: easyCount || 1, color: '#10b981' },
    { name: 'Medium', value: mediumCount || 1, color: '#f59e0b' },
    { name: 'Hard', value: hardCount || 0, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Leaderboard ranking: sort by total solved, then streak
  const sortedLeaderboard = [...activeMembers].sort((a, b) => {
    if (b.solvedCount !== a.solvedCount) {
      return b.solvedCount - a.solvedCount;
    }
    return b.streak - a.streak;
  });

  // Recent Activity Feed
  const recentSubmissions = [...submissions]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6" id="admin-dashboard-root">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="admin-stats-grid">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Active Cohort</span>
            <span className="text-2xl font-bold text-slate-800 block">{totalActiveUsers}</span>
            <span className="text-[10px] text-indigo-600 font-medium block">Verified college students</span>
          </div>
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 text-indigo-500 rounded-xl flex items-center justify-center">
            <Users size={22} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Collective Solve Rate</span>
            <span className="text-2xl font-bold text-slate-800 block">{solvePercentage}%</span>
            <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-2">
              <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${solvePercentage}%` }} />
            </div>
          </div>
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
            <CheckCircle size={22} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Average Group Streak</span>
            <span className="text-2xl font-bold text-slate-800 block">{avgStreak} Days</span>
            <span className="text-[10px] text-amber-600 font-semibold block">🔥 High consistency level</span>
          </div>
          <div className="w-12 h-12 bg-amber-50 border border-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
            <Flame size={22} />
          </div>
        </div>

        {/* Metric 4 */}
        <div 
          onClick={() => onNavigateToTab('members')}
          className={`bg-white border p-5 rounded-xl flex items-center justify-between shadow-sm cursor-pointer transition ${
            pendingRequests.length > 0 ? 'border-rose-300 hover:border-rose-400 bg-rose-50' : 'border-slate-200 hover:border-slate-300'
          }`}
          id="pending-requests-stat-card"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Enrollment Requests</span>
            <span className={`text-2xl font-bold block ${pendingRequests.length > 0 ? 'text-rose-600 font-extrabold' : 'text-slate-800'}`}>
              {pendingRequests.length} Pending
            </span>
            <span className="text-[10px] text-slate-500 block hover:underline flex items-center gap-1">
              Click to approve requests <ArrowRight size={10} />
            </span>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            pendingRequests.length > 0 ? 'bg-rose-100 border border-rose-200 text-rose-600' : 'bg-slate-100 border border-slate-200 text-slate-500'
          }`}>
            <AlertCircle size={22} className={pendingRequests.length > 0 ? 'animate-bounce' : ''} />
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="admin-charts-grid">
        {/* Chart 1: Daily Participation Trend */}
        <div className="lg:col-span-8 bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between" id="chart-participation">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-slate-800 font-bold text-sm">Batch Participation Rates</h3>
              <p className="text-slate-500 text-xs">Dynamic linear check of daily coding completions over the last 7 days.</p>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-2 py-0.5 rounded border border-indigo-100">Timeline Weekly</span>
          </div>

          <div className="h-[200px]" id="participation-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={submissionTrendData}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }}
                  labelStyle={{ color: '#0f172a', fontSize: '11px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#4f46e5', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="Submissions" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorSub)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Difficulty Coverage */}
        <div className="lg:col-span-4 bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between" id="chart-difficulty">
          <div className="mb-4">
            <h3 className="text-slate-800 font-bold text-sm">Difficulty solved ratio</h3>
            <p className="text-slate-500 text-xs">Total Easy vs Medium solutions submitted.</p>
          </div>

          <div className="h-[160px] flex items-center justify-center relative" id="difficulty-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={difficultyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '11px', color: '#0f172a' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Inner Absolute Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Completed</span>
              <span className="text-base font-bold text-slate-800">{totalSolvedAcrossGroup} Solves</span>
            </div>
          </div>

          {/* Difficulty Legend */}
          <div className="flex justify-around items-center text-[10px] pt-3 border-t border-slate-100">
            {difficultyData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-slate-600 font-semibold">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Group Topic Completion reports */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm" id="topic-completions-panel">
        <h3 className="text-slate-800 font-bold text-sm mb-1.5">Solve Volume by Topic Segment</h3>
        <p className="text-slate-500 text-xs mb-6">Total number of approved classmate solutions logged across core topics.</p>
        
        <div className="h-[180px]">
          {topicData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-slate-400 italic text-xs">
              No solutions processed yet. Graphs will display once students submit codes.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '11px', color: '#0f172a' }}
                />
                <Bar dataKey="Completed" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Leaderboard and Recent Activity split layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="dashboard-tables-grid">
        {/* Leaderboard */}
        <div className="xl:col-span-7 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden" id="leaderboard-panel">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-slate-800 font-bold text-sm flex items-center gap-1.5">
                <Award className="text-indigo-500" size={16} />
                Batch Leaderboard Ranking
              </h3>
              <p className="text-slate-500 text-[11px]">Rankings updated in real-time as solutions pass test-suites.</p>
            </div>
            <button 
              onClick={() => onNavigateToTab('members')}
              className="text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
            >
              Manage Cohort
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-600 text-xs">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-4 text-center w-12">Rank</th>
                  <th className="py-2.5 px-4">Student Name</th>
                  <th className="py-2.5 px-4 text-center">Problems Solved</th>
                  <th className="py-2.5 px-4 text-center">Consistency Streak</th>
                  <th className="py-2.5 px-4 text-right">Join Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedLeaderboard.map((user, idx) => {
                  const rank = idx + 1;
                  return (
                    <tr key={user.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 text-center font-bold">
                        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                      </td>
                      <td className="py-3 px-4 flex items-center gap-2.5">
                        <img 
                          src={user.avatarUrl} 
                          alt={user.name} 
                          className="w-6 h-6 rounded-full border border-slate-200 object-cover" 
                        />
                        <span className="text-slate-800 font-semibold">{user.name}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                        {user.solvedCount} Solves
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-0.5 text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-100 font-mono">
                          🔥 {user.streak} days
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 font-mono">
                        {new Date(user.joinDate).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Submissions Feed */}
        <div className="xl:col-span-5 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full" id="activity-feed-panel">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-slate-800 font-bold text-sm">Real-time Batch Submissions</h3>
            <p className="text-slate-500 text-[11px]">Recent codes processed by members of the placement program.</p>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
            {recentSubmissions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 italic text-xs">
                No submissions logged. Solutions will appear as soon as students code!
              </div>
            ) : (
              recentSubmissions.map(sub => {
                const prob = problems.find(p => p.id === sub.problemId);
                return (
                  <div key={sub.id} className="p-4 flex items-start gap-3 hover:bg-slate-50 transition">
                    <img 
                      src={sub.userAvatar} 
                      alt={sub.userName} 
                      className="w-7 h-7 rounded-full border border-slate-200 object-cover mt-0.5" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-800 font-semibold text-xs truncate">{sub.userName}</span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {new Date(sub.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs mt-0.5 truncate">
                        Solved: <strong className="text-slate-800 font-semibold">{prob?.title || 'Unknown Problem'}</strong>
                      </p>
                      <div className="flex items-center justify-between mt-2 flex-wrap gap-1.5">
                        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500">
                          <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 font-bold">
                            {sub.language.toUpperCase()}
                          </span>
                          <span>•</span>
                          <span>{sub.runtime}</span>
                        </div>
                        
                        <span className="bg-emerald-50 text-emerald-600 font-bold border border-emerald-100 px-1.5 py-0.5 rounded text-[9px] font-mono">
                          Accepted
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { User, Problem, Submission } from '../types';
import { Users, CheckCircle, Flame, Calendar, Award, Send, AlertCircle, BellRing } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsPageProps {
  users: User[];
  problems: Problem[];
  submissions: Submission[];
}

export default function AnalyticsPage({ users, problems, submissions }: AnalyticsPageProps) {
  const activeMembers = users.filter(u => u.status === 'active');
  const pendingRequests = users.filter(u => u.status === 'pending');
  
  // 1. Overview cards data
  const totalMembersCount = activeMembers.length;
  // Simulating active today (e.g., activeMembers with streak > 0 or 80% of members)
  const activeTodayCount = Math.min(totalMembersCount, activeMembers.filter(u => u.streak > 0).length + 1);
  const pendingApprovalsCount = pendingRequests.length;
  const challengesThisMonthCount = problems.filter(p => p.id.startsWith('prob-')).length;

  // 2. Today's Participation progress bar calculations
  // Today's challenge is "Invert Binary Tree" (prob-4)
  const todaysChallengeId = 'prob-4';
  const todaysSubmissions = submissions.filter(s => s.problemId === todaysChallengeId && s.status === 'Accepted');
  const submittedUserIds = new Set(todaysSubmissions.map(s => s.userId));
  
  const totalEligibleMembers = activeMembers.filter(u => u.role === 'member');
  const submittedCount = Math.min(totalEligibleMembers.length, submittedUserIds.size);
  const totalMemberCount = totalEligibleMembers.length;
  const participationPercentage = Math.round((submittedCount / (totalMemberCount || 1)) * 100);

  // List of members who haven't submitted
  const unsubmittedMembers = totalEligibleMembers.filter(m => !submittedUserIds.has(m.id));

  // Simulating Nudge notification states
  const [nudgedUsers, setNudgedUsers] = useState<Record<string, boolean>>({});
  const handleNudge = (userId: string) => {
    setNudgedUsers(prev => ({ ...prev, [userId]: true }));
    setTimeout(() => {
      setNudgedUsers(prev => ({ ...prev, [userId]: false }));
    }, 2000);
  };

  // 3. Topic Completion Heatmap Setup
  const topicsList = ['Arrays & Hashing', 'Sliding Window', 'Intervals', 'Trees'];
  // Calculate completed problems per user per topic
  const getTopicCompletionCount = (userId: string, topicName: string) => {
    const userSubs = submissions.filter(s => s.userId === userId && s.status === 'Accepted');
    const solvedProblemIds = new Set(userSubs.map(s => s.problemId));
    
    // Count how many solved problems are in this topic
    return problems.filter(p => p.topic === topicName && solvedProblemIds.has(p.id)).length;
  };

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-[#FFFFFF] text-[#888888]';
    if (count === 1) return 'bg-[#22C55E]/20 text-[#22C55E] font-bold border-[#22C55E]/30';
    return 'bg-[#22C55E] text-[#FFFFFF] font-bold border-[#22C55E]';
  };

  // 4. Submission Timeline: past 30 days
  const dailySubmissionData = [
    { day: '1', count: 3 },
    { day: '3', count: 5 },
    { day: '5', count: 8 },
    { day: '7', count: 4 },
    { day: '9', count: 12 },
    { day: '11', count: 9 },
    { day: '13', count: 15 },
    { day: '15', count: 11 },
    { day: '17', count: 18 },
    { day: '19', count: 14 },
    { day: '21', count: 22 },
    { day: '23', count: 16 },
    { day: '25', count: 19 },
    { day: '27', count: 25 },
    { day: '29', count: 21 },
    { day: '30', count: submissions.length + 5 },
  ];

  return (
    <div className="space-y-6" id="analytics-page-root">
      {/* Overview Cards (4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="overview-metrics">
        {/* Card 1: Total Members */}
        <div className="bg-[#FFFFFF] border border-[#E2E2E2] p-5 rounded-lg flex items-center justify-between hover:shadow-md transition">
          <div className="space-y-1">
            <span className="text-[10px] text-[#888888] font-bold uppercase tracking-wider block">Total Members</span>
            <span className="text-2xl font-display font-bold text-[#111111] block">{totalMembersCount}</span>
            <span className="text-[10px] text-[#22C55E] font-bold block">Cohort Registry Active</span>
          </div>
          <div className="w-11 h-11 bg-[#F7F7F7] border border-[#E2E2E2] rounded-lg flex items-center justify-center text-[#111111]">
            <Users size={20} />
          </div>
        </div>

        {/* Card 2: Active Today */}
        <div className="bg-[#FFFFFF] border border-[#E2E2E2] p-5 rounded-lg flex items-center justify-between hover:shadow-md transition">
          <div className="space-y-1">
            <span className="text-[10px] text-[#888888] font-bold uppercase tracking-wider block">Active Today</span>
            <span className="text-2xl font-display font-bold text-[#111111] block">{activeTodayCount}</span>
            <span className="text-[10px] text-amber-500 font-bold block">🔥 Working on streaking</span>
          </div>
          <div className="w-11 h-11 bg-[#F7F7F7] border border-[#E2E2E2] rounded-lg flex items-center justify-center text-[#111111]">
            <Flame size={20} />
          </div>
        </div>

        {/* Card 3: Pending Approvals with red badge */}
        <div className="bg-[#FFFFFF] border border-[#E2E2E2] p-5 rounded-lg flex items-center justify-between hover:shadow-md transition relative overflow-hidden">
          {pendingApprovalsCount > 0 && (
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EF4444]"></span>
            </span>
          )}
          <div className="space-y-1">
            <span className="text-[10px] text-[#888888] font-bold uppercase tracking-wider block">Pending Approvals</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-display font-bold text-[#111111] block">{pendingApprovalsCount}</span>
              {pendingApprovalsCount > 0 && (
                <span className="bg-[#EF4444] text-[#FFFFFF] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono tracking-wider">
                  Action Required
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#888888] font-mono block">Admissions queue</span>
          </div>
          <div className="w-11 h-11 bg-[#F7F7F7] border border-[#E2E2E2] rounded-lg flex items-center justify-center text-[#111111]">
            <AlertCircle size={20} className={pendingApprovalsCount > 0 ? 'text-[#EF4444]' : 'text-[#888888]'} />
          </div>
        </div>

        {/* Card 4: Challenges This Month */}
        <div className="bg-[#FFFFFF] border border-[#E2E2E2] p-5 rounded-lg flex items-center justify-between hover:shadow-md transition">
          <div className="space-y-1">
            <span className="text-[10px] text-[#888888] font-bold uppercase tracking-wider block">Challenges Issued</span>
            <span className="text-2xl font-display font-bold text-[#111111] block">{challengesThisMonthCount}</span>
            <span className="text-[10px] text-[#5C6FFF] font-bold block">Placement problems published</span>
          </div>
          <div className="w-11 h-11 bg-[#F7F7F7] border border-[#E2E2E2] rounded-lg flex items-center justify-center text-[#111111]">
            <Calendar size={20} />
          </div>
        </div>
      </div>

      {/* Today's Participation Bar */}
      <div className="bg-[#FFFFFF] border border-[#E2E2E2] rounded-lg p-5 shadow-sm space-y-4" id="todays-participation-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E2E2] pb-3">
          <div>
            <h3 className="text-sm font-display font-bold text-[#111111]">Today's Batch Participation</h3>
            <p className="text-[#888888] text-[11px]">Today's Task: <strong>Invert Binary Tree</strong></p>
          </div>
          <span className="text-xs font-mono font-bold text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-2.5 py-1 rounded">
            {submittedCount} / {totalMemberCount} Submitted ({participationPercentage}%)
          </span>
        </div>

        {/* Real Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-[#F7F7F7] h-3 rounded-full overflow-hidden border border-[#E2E2E2]">
            <div 
              className="bg-[#22C55E] h-full rounded-full transition-all duration-500" 
              style={{ width: `${participationPercentage}%` }} 
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#888888] font-mono">
            <span>0% Solved</span>
            <span>Current Goal (100% Student Submission)</span>
          </div>
        </div>

        {/* Nudge list of members who have not submitted yet */}
        <div className="pt-2">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-3">Pending Submissions ({unsubmittedMembers.length} Members)</h4>
          {unsubmittedMembers.length === 0 ? (
            <p className="text-xs text-[#22C55E] font-medium flex items-center gap-1.5">
              <CheckCircle size={14} /> All eligible active members have submitted today's coding task! Great job.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5" id="unsubmitted-list">
              {unsubmittedMembers.map(member => (
                <div 
                  key={member.id} 
                  className="bg-[#F7F7F7] border border-[#E2E2E2] p-2.5 rounded-lg flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img 
                      src={member.avatarUrl} 
                      alt={member.name} 
                      className="w-7 h-7 rounded-full object-cover border border-[#E2E2E2]" 
                    />
                    <div className="min-w-0">
                      <span className="text-[#111111] font-bold block truncate">{member.name}</span>
                      <span className="text-[9px] text-[#888888] font-mono block">Streak: {member.streak}d</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNudge(member.id)}
                    className={`text-[10px] font-bold px-2 py-1 rounded transition duration-150 cursor-pointer border ${
                      nudgedUsers[member.id] 
                        ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]' 
                        : 'bg-[#111111] hover:bg-[#111111]/80 text-[#FFFFFF] border-[#111111]'
                    }`}
                  >
                    {nudgedUsers[member.id] ? 'Nudged ✓' : 'Nudge'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid: Heatmap + Timeline Area Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="heatmap-timeline-row">
        {/* Left column: Topic Completion Heatmap */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E2E2E2] rounded-lg p-5 shadow-sm space-y-4" id="heatmap-panel">
          <div>
            <h3 className="text-sm font-display font-bold text-[#111111]">Topic Completion Heatmap</h3>
            <p className="text-[#888888] text-[11px] mt-0.5">
              Visualizes verified problem completions across topics for each active student.
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[480px]" id="heatmap-grid-inner">
              {/* Grid Header (Topics) */}
              <div className="grid grid-cols-5 border-b border-[#E2E2E2] pb-2 text-[9px] text-[#888888] uppercase font-mono tracking-wider font-bold">
                <div className="col-span-1 text-left">Student</div>
                {topicsList.map(topic => (
                  <div key={topic} className="text-center truncate pr-1" title={topic}>
                    {topic.length > 12 ? `${topic.substring(0, 10)}..` : topic}
                  </div>
                ))}
              </div>

              {/* Grid Rows */}
              <div className="divide-y divide-[#E2E2E2] max-h-[220px] overflow-y-auto pt-2">
                {activeMembers.filter(m => m.role === 'member').map(member => (
                  <div key={member.id} className="grid grid-cols-5 items-center py-2 text-xs font-sans">
                    {/* Student identity */}
                    <div className="col-span-1 flex items-center gap-1.5 min-w-0 pr-2">
                      <img 
                        src={member.avatarUrl} 
                        alt={member.name} 
                        className="w-5 h-5 rounded-full object-cover border border-[#E2E2E2] shrink-0" 
                      />
                      <span className="text-[#111111] font-bold truncate text-[11px]" title={member.name}>
                        {member.name.split(' ')[0]}
                      </span>
                    </div>

                    {/* Completion Blocks */}
                    {topicsList.map(topic => {
                      const count = getTopicCompletionCount(member.id, topic);
                      return (
                        <div key={topic} className="flex justify-center px-2">
                          <div 
                            className={`w-full py-1 text-center rounded border text-[10px] font-mono leading-none ${getHeatmapColor(count)}`}
                            title={`${member.name}: ${count} problems solved in ${topic}`}
                          >
                            {count}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 pt-1 text-[10px] text-[#888888] font-mono border-t border-[#E2E2E2]">
            <span className="font-bold">Legend:</span>
            <div className="flex items-center gap-1">
              <div className="w-3.5 h-3.5 bg-[#FFFFFF] border border-[#E2E2E2] rounded" />
              <span>0 Solved</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3.5 h-3.5 bg-[#22C55E]/20 border border-[#22C55E]/30 rounded" />
              <span>1 Solved</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3.5 h-3.5 bg-[#22C55E] border border-[#22C55E] rounded" />
              <span>2+ Solved</span>
            </div>
          </div>
        </div>

        {/* Right column: Submission Timeline Chart */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#E2E2E2] rounded-lg p-5 shadow-sm space-y-4" id="timeline-panel">
          <div>
            <h3 className="text-sm font-display font-bold text-[#111111]">Daily Submission Rate</h3>
            <p className="text-[#888888] text-[11px] mt-0.5">
              Accumulated code verification requests submitted by students over the past 30 days.
            </p>
          </div>

          <div className="h-[210px]" id="submission-timeline-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySubmissionData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorSubmit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E2E2" vertical={false} />
                <XAxis dataKey="day" stroke="#888888" fontSize={9} tickLine={false} label={{ value: 'Days of Month', position: 'insideBottom', offset: -5, fill: '#888888', fontSize: 9 }} />
                <YAxis stroke="#888888" fontSize={9} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111111', color: '#FFFFFF', borderRadius: '4px', border: 'none', fontSize: '10px' }}
                  labelFormatter={(lbl) => `Day ${lbl} of Month`}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#22C55E" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSubmit)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

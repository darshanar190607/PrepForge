import React, { useState } from 'react';
import { User, Problem, Submission, Announcement, Notification } from './types';
import MemberDashboard from './components/MemberDashboard';
import AdminDashboard from './components/AdminDashboard';
import CodingWorkspace from './components/CodingWorkspace';
import CodeCompare from './components/CodeCompare';
import ProblemArchive from './components/ProblemArchive';
import MemberManagement from './components/MemberManagement';
import PublishChallenge from './components/PublishChallenge';
import Leaderboard from './components/Leaderboard';
import NotificationsPage from './components/NotificationsPage';
import AnalyticsPage from './components/AnalyticsPage';
import AuthPages from './components/AuthPages';
import VideoContributions from './components/VideoContributions';
import { useAppData } from './hooks/useAppData';
import { 
  Users, 
  Flame, 
  Award, 
  Layers, 
  BookOpen, 
  ArrowLeftRight, 
  Megaphone, 
  Bell, 
  Sparkles, 
  Code, 
  Terminal, 
  UserCheck, 
  ShieldCheck, 
  Plus, 
  CheckSquare, 
  FileEdit,
  UserX,
  X,
  Hammer,
  Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const {
    currentUser,
    users,
    problems,
    submissions,
    announcements,
    notifications,
    loading,
    authChecking,
    login,
    register,
    logout,
    approveUser,
    rejectUser,
    toggleAdminRole,
    removeUser,
    publishChallenge,
    submitSolution,
    postAnnouncement,
    deleteAnnouncement,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    contributions,
    postVideoContribution,
  } = useAppData();
  
  // Navigation & Workspace states
  const [activeTab, setActiveTab] = useState<'dashboard' | 'archive' | 'compare' | 'leaderboard' | 'notifications' | 'analytics' | 'members' | 'publish' | 'contributions'>('dashboard');
  const [selectedProblemForWorkspace, setSelectedProblemForWorkspace] = useState<Problem | null>(null);
  const [selectedProblemIdForComparison, setSelectedProblemIdForComparison] = useState<string | null>(null);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
  };

  const handleClearNotifications = () => {
    clearNotifications();
  };

  // Handler: Code Submission
  const handleSubmissionSuccess = async (newSub: Submission) => {
    await submitSolution(newSub.problemId, newSub.code, newSub.language, newSub.explanation);
  };

  // Handler: Approve Student Request
  const handleApproveUser = async (userId: string) => {
    await approveUser(userId);
  };

  // Handler: Reject Request
  const handleRejectUser = async (userId: string) => {
    await rejectUser(userId);
  };

  // Handler: Toggle coordinator / admin status
  const handleToggleAdmin = async (userId: string) => {
    await toggleAdminRole(userId);
  };

  // Handler: Delete member completely
  const handleRemoveUser = async (userId: string) => {
    await removeUser(userId);
  };

  // Handler: Create Announcement
  const handlePostAnnouncement = async (newAnn: Announcement) => {
    await postAnnouncement({
      title: newAnn.title,
      content: newAnn.content,
      category: newAnn.category
    });
  };

  // Handler: Delete Announcement
  const handleDeleteAnnouncement = async (annId: string) => {
    await deleteAnnouncement(annId);
  };

  // Handler: Publish problem challenge
  const handlePublishChallenge = async (newProblem: Problem) => {
    await publishChallenge({
      title: newProblem.title,
      description: newProblem.description,
      topic: newProblem.topic,
      pattern: newProblem.pattern,
      difficulty: newProblem.difficulty,
      deadline: newProblem.deadline,
      starterCode: newProblem.starterCode,
      testCases: newProblem.testCases,
      companyTags: newProblem.companyTags
    });
    setActiveTab('dashboard');
  };

  // Helper to mark notifications as read
  const handleMarkAllNotificationsRead = () => {
    markAllNotificationsAsRead();
  };

  // Shortcut routing to Code Compare
  const handleCompareProblemShortcut = (problemId: string) => {
    setSelectedProblemIdForComparison(problemId);
    setActiveTab('compare');
  };

  const activeNotifsCount = notifications.filter(n => !n.read).length;

  // Session verification loader
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center font-sans p-6 text-slate-800">
        <div className="space-y-4 text-center">
          <div className="w-10 h-10 bg-[#5C6FFF] rounded-lg flex items-center justify-center font-bold text-white mx-auto animate-pulse">
            <Hammer size={20} className="text-white" />
          </div>
          <div className="text-sm font-semibold tracking-wider font-mono uppercase text-[#888888]">
            Verifying Session...
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated redirect to Auth Pages
  if (!currentUser) {
    return (
      <AuthPages 
        onLogin={login}
        onRegisterRequest={register}
      />
    );
  }

  // Pending user waiting room
  if (currentUser.status === 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" id="waiting-room-container">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-6 shadow-sm relative overflow-hidden text-slate-800">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 to-indigo-500" />
          
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <Users size={32} className="animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 font-display">Waiting for Coordinator Approval</h2>
            <p className="text-slate-650 text-xs leading-relaxed">
              Hi <strong className="text-slate-900">{currentUser.name}</strong>, your request to join the PrepForge Placement Group has been logged. 
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left space-y-3">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Verification Record</span>
            <div className="space-y-1.5 text-xs text-slate-600 font-mono">
              <div>Email: <span className="text-slate-800 font-medium">{currentUser.email}</span></div>
              <div>Status: <span className="text-amber-600 font-bold">Pending Approval</span></div>
              <div>Requested: <span className="text-slate-700">{new Date(currentUser.joinDate).toLocaleDateString()}</span></div>
            </div>
          </div>

          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-start gap-3 text-left">
            <Sparkles size={16} className="text-indigo-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-indigo-900 leading-normal">
              <strong>Info:</strong> Please wait for a coordinator to approve your account. You can log in using the admin account <strong className="text-indigo-950">darshan.ar2024cce@sece.ac.in</strong> (password: <strong className="text-indigo-950">admin123</strong>) to approve requests.
            </p>
          </div>
          
          <button
            onClick={logout}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded transition cursor-pointer"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Active Cohort Portal
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans" id="prepforge-application">
      <div className="flex-1 flex overflow-hidden relative bg-slate-50" id="portal-workspace">
          
          {/* SIDEBAR NAVIGATION RAIL */}
          <aside className="w-60 bg-slate-900 text-slate-300 flex flex-col justify-between hidden md:flex shrink-0" id="app-sidebar">
            <div className="space-y-4">
              {/* Logotype */}
              <div className="p-6 border-b border-slate-850">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center font-bold text-white">
                    <Hammer size={16} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight font-display">PrepForge</h2>
                    <span className="text-[9px] text-slate-400 font-semibold tracking-wider font-mono">BATCH COHORT</span>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="px-3 space-y-1" id="sidebar-nav">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Main Menu</div>
                
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-xs transition cursor-pointer border-l-4 ${
                    activeTab === 'dashboard' 
                      ? 'bg-slate-800 text-white border-indigo-500 font-medium' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800 border-transparent font-normal'
                  }`}
                  id="nav-dashboard"
                >
                  <div className="flex items-center gap-3">
                    <Layers size={15} />
                    <span>Dashboard Hub</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('archive')}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-xs transition cursor-pointer border-l-4 ${
                    activeTab === 'archive' 
                      ? 'bg-slate-800 text-white border-indigo-500 font-medium' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800 border-transparent font-normal'
                  }`}
                  id="nav-archive"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen size={15} />
                    <span>Problem Archive</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('compare')}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-xs transition cursor-pointer border-l-4 ${
                    activeTab === 'compare' 
                      ? 'bg-slate-800 text-white border-indigo-500 font-medium' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800 border-transparent font-normal'
                  }`}
                  id="nav-compare"
                >
                  <div className="flex items-center gap-3">
                    <ArrowLeftRight size={15} />
                    <span>Code Comparison</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-xs transition cursor-pointer border-l-4 ${
                    activeTab === 'leaderboard' 
                      ? 'bg-slate-800 text-white border-indigo-500 font-medium' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800 border-transparent font-normal'
                  }`}
                  id="nav-leaderboard"
                >
                  <div className="flex items-center gap-3">
                    <Award size={15} />
                    <span>Leaderboard</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('contributions')}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-xs transition cursor-pointer border-l-4 ${
                    activeTab === 'contributions' 
                      ? 'bg-slate-800 text-white border-indigo-500 font-medium' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800 border-transparent font-normal'
                  }`}
                  id="nav-contributions"
                >
                  <div className="flex items-center gap-3">
                    <Video size={15} />
                    <span>Video Vault</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-xs transition cursor-pointer border-l-4 ${
                    activeTab === 'notifications' 
                      ? 'bg-slate-800 text-white border-indigo-500 font-medium' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800 border-transparent font-normal'
                  }`}
                  id="nav-notifications"
                >
                  <div className="flex items-center gap-3">
                    <Bell size={15} />
                    <span>Notifications</span>
                  </div>
                  {activeNotifsCount > 0 && (
                    <span className="bg-[#EF4444] text-[#FFFFFF] text-[9px] font-bold px-1.5 py-0.2 rounded-full font-mono animate-pulse">
                      {activeNotifsCount}
                    </span>
                  )}
                </button>

                {/* COORDINATOR ONLY LINKS */}
                {currentUser.role === 'admin' && (
                  <>
                    <div className="pt-4 pb-1.5 px-3">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold font-mono">Coordinator Hub</span>
                    </div>

                    <button
                      onClick={() => setActiveTab('analytics')}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-xs transition cursor-pointer border-l-4 ${
                        activeTab === 'analytics' 
                          ? 'bg-slate-800 text-white border-indigo-500 font-medium' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-800 border-transparent font-normal'
                      }`}
                      id="nav-analytics"
                    >
                      <div className="flex items-center gap-3">
                        <Flame size={15} />
                        <span>Analytics</span>
                      </div>
                      <span className="bg-[#EF4444] text-[#FFFFFF] text-[9px] font-bold px-1.5 py-0.2 rounded font-mono uppercase tracking-widest scale-90">
                        Admin
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('publish')}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs transition cursor-pointer border-l-4 ${
                        activeTab === 'publish' 
                          ? 'bg-slate-800 text-white border-indigo-500 font-medium' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-800 border-transparent font-normal'
                      }`}
                      id="nav-publish"
                    >
                      <Plus size={15} />
                      <span>Assign Challenge</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('members')}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs transition cursor-pointer border-l-4 ${
                        activeTab === 'members' 
                          ? 'bg-slate-800 text-white border-indigo-500 font-medium' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-800 border-transparent font-normal'
                      }`}
                      id="nav-members"
                    >
                      <Users size={15} />
                      <span>Manage Cohort</span>
                    </button>
                  </>
                )}
              </nav>
            </div>

            {/* User Profile Card Footer with Sign Out */}
            <div className="p-4 bg-slate-950 border-t border-slate-850 space-y-3" id="sidebar-footer-profile">
              <div className="flex items-center gap-3">
                <img 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.name} 
                  className="w-8 h-8 rounded-full border border-slate-750 object-cover" 
                />
                <div className="min-w-0 flex-1">
                  <div className="text-white text-xs font-semibold truncate leading-none">{currentUser.name}</div>
                  <div className="text-[9px] text-slate-400 truncate mt-1 font-mono">
                    {currentUser.role === 'admin' ? 'Coordinator View' : 'Member View'}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full py-1.5 px-3 bg-slate-900 hover:bg-rose-950 hover:text-rose-200 text-slate-400 hover:border-rose-900 border border-slate-850 rounded text-[10px] font-bold font-mono transition flex items-center justify-center gap-1.5 cursor-pointer"
                id="sign-out-btn"
              >
                Sign Out
              </button>
            </div>
          </aside>

          {/* MAIN PAGE CONTAINER */}
          <main className="flex-1 flex flex-col h-full overflow-hidden" id="app-main-content">
            
            {/* PORTAL TOP BAR */}
            <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 text-slate-800" id="portal-header">
              <div>
                <h2 className="text-base font-bold text-slate-800 tracking-tight" id="main-view-header-title">
                  {activeTab === 'dashboard' && `${currentUser.role === 'admin' ? 'Cohort' : 'My'} Preparation Dashboard`}
                  {activeTab === 'archive' && 'Placement Problem Archive'}
                  {activeTab === 'compare' && 'Peer Solution Comparison'}
                  {activeTab === 'leaderboard' && 'PrepForge Leaderboard'}
                  {activeTab === 'notifications' && 'Alert Logs & Notifications'}
                  {activeTab === 'analytics' && 'Coordinators Analytics Workspace'}
                  {activeTab === 'members' && 'Cohort Management'}
                  {activeTab === 'publish' && 'Publish Coding Challenge'}
                  {activeTab === 'contributions' && 'Peer Learning Video Vault'}
                </h2>
              </div>

              {/* Notification Bell & Switch Mobile menu */}
              <div className="flex items-center gap-4">
                {/* Bell notification */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowNotifMenu(!showNotifMenu);
                      if (!showNotifMenu) handleMarkAllNotificationsRead();
                    }}
                    className="relative p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                    id="notif-bell-btn"
                  >
                    <Bell size={18} />
                    {activeNotifsCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                    )}
                  </button>

                  {/* Dropdown notification menu */}
                  <AnimatePresence>
                    {showNotifMenu && (
                      <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden text-slate-800" id="notif-dropdown">
                        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                          <span>Notifications Log</span>
                          <button 
                            onClick={() => setShowNotifMenu(false)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        <div className="divide-y divide-slate-100 max-h-[250px] overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-6 text-center text-xs text-slate-500 italic">No notifications logs.</div>
                          ) : (
                            notifications.map(notif => (
                              <div key={notif.id} className="p-3 hover:bg-slate-50 transition">
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className="text-slate-800 text-xs font-bold leading-tight">{notif.title}</h4>
                                  <span className="text-[8px] text-slate-400 font-mono mt-0.5">
                                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-slate-600 text-[11px] mt-1 leading-normal">{notif.content}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile tab navigations menu */}
                <div className="flex md:hidden bg-slate-100 rounded-lg p-1 border border-slate-200 overflow-x-auto max-w-[250px]" id="mobile-nav">
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-[#5C6FFF] text-white' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={() => setActiveTab('archive')}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold whitespace-nowrap ${activeTab === 'archive' ? 'bg-[#5C6FFF] text-white' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Archive
                  </button>
                  <button 
                    onClick={() => setActiveTab('compare')}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold whitespace-nowrap ${activeTab === 'compare' ? 'bg-[#5C6FFF] text-white' : 'text-slate-500 hover:text-slate-850'}`}
                  >
                    Compare
                  </button>
                  <button 
                    onClick={() => setActiveTab('leaderboard')}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold whitespace-nowrap ${activeTab === 'leaderboard' ? 'bg-[#5C6FFF] text-white' : 'text-slate-500 hover:text-slate-850'}`}
                  >
                    Leaderboard
                  </button>
                  <button 
                    onClick={() => setActiveTab('contributions')}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold whitespace-nowrap ${activeTab === 'contributions' ? 'bg-[#5C6FFF] text-white' : 'text-slate-500 hover:text-slate-850'}`}
                  >
                    Video Vault
                  </button>
                  <button 
                    onClick={() => setActiveTab('notifications')}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold whitespace-nowrap ${activeTab === 'notifications' ? 'bg-[#5C6FFF] text-white' : 'text-slate-500 hover:text-slate-850'}`}
                  >
                    Notifications
                  </button>
                </div>
              </div>
            </header>

            {/* TAB PANES */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50" id="portal-content-body">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeTab}-${currentUser.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="h-full"
                >
                  {/* Dashboard Tab */}
                  {activeTab === 'dashboard' && (
                    currentUser.role === 'admin' ? (
                      <AdminDashboard 
                        users={users}
                        problems={problems}
                        submissions={submissions}
                        onNavigateToTab={(tab) => setActiveTab(tab)}
                        onSolveProblem={(prob) => setSelectedProblemForWorkspace(prob)}
                      />
                    ) : (
                      <MemberDashboard 
                        user={currentUser}
                        problems={problems}
                        submissions={submissions}
                        announcements={announcements}
                        onSolveProblem={(prob) => setSelectedProblemForWorkspace(prob)}
                        onCompareProblem={handleCompareProblemShortcut}
                        onNavigateToTab={(tab) => setActiveTab(tab)}
                      />
                    )
                  )}

                  {/* Problem Archive Tab */}
                  {activeTab === 'archive' && (
                    <ProblemArchive 
                      problems={problems}
                      submissions={submissions}
                      userId={currentUser.id}
                      onSolveProblem={(prob) => setSelectedProblemForWorkspace(prob)}
                      onCompareProblem={handleCompareProblemShortcut}
                    />
                  )}

                  {/* Leaderboard Tab */}
                  {activeTab === 'leaderboard' && (
                    <Leaderboard 
                      users={users}
                      currentUser={currentUser}
                    />
                  )}

                  {/* Notifications Page Tab */}
                  {activeTab === 'notifications' && (
                    <NotificationsPage 
                      notifications={notifications}
                      onMarkAsRead={handleMarkAsRead}
                      onMarkAllAsRead={handleMarkAllNotificationsRead}
                      onClearNotifications={handleClearNotifications}
                    />
                  )}

                  {/* Analytics Page Tab (Admin Only) */}
                  {activeTab === 'analytics' && currentUser.role === 'admin' && (
                    <AnalyticsPage 
                      users={users}
                      problems={problems}
                      submissions={submissions}
                    />
                  )}

                  {/* Code Comparison Workspace Tab */}
                  {activeTab === 'compare' && (
                    <CodeCompare 
                      problems={problems}
                      submissions={submissions}
                      initialProblemId={selectedProblemIdForComparison || undefined}
                      onClose={() => {
                        setSelectedProblemIdForComparison(null);
                        setActiveTab('dashboard');
                      }}
                    />
                  )}

                  {/* Video Contributions Tab */}
                  {activeTab === 'contributions' && (
                    <VideoContributions 
                      contributions={contributions}
                      currentUserId={currentUser.id}
                      onPostContribution={postVideoContribution}
                    />
                  )}

                  {/* Publish Challenge Tab (Admin Only) */}
                  {activeTab === 'publish' && currentUser.role === 'admin' && (
                    <PublishChallenge 
                      onPublish={handlePublishChallenge}
                      onClose={() => setActiveTab('dashboard')}
                    />
                  )}

                  {/* Member Cohort Settings Tab (Admin Only) */}
                  {activeTab === 'members' && currentUser.role === 'admin' && (
                    <MemberManagement 
                      users={users}
                      announcements={announcements}
                      onApproveUser={handleApproveUser}
                      onRejectUser={handleRejectUser}
                      onToggleAdminRole={handleToggleAdmin}
                      onRemoveUser={handleRemoveUser}
                      onPostAnnouncement={handlePostAnnouncement}
                      onDeleteAnnouncement={handleDeleteAnnouncement}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>

      {/* 💻 FULL SPLIT-PANE INTERACTIVE CODING IDE WORKSPACE */}
      <AnimatePresence>
        {selectedProblemForWorkspace && (
          <CodingWorkspace 
            problem={selectedProblemForWorkspace}
            userId={currentUser.id}
            userName={currentUser.name}
            userAvatar={currentUser.avatarUrl}
            existingSubmission={submissions.find(s => s.problemId === selectedProblemForWorkspace.id && s.userId === currentUser.id)}
            onSubmitSuccess={handleSubmissionSuccess}
            onClose={() => setSelectedProblemForWorkspace(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

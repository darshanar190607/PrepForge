import React, { useState } from 'react';
import { User, Quiz, QuizAttempt, QuestionResponse, AIExplanation } from './types';
import { useAppData } from './hooks/useAppData';

import AuthPages from './components/AuthPages';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import QuizList from './components/QuizList';
import QuizCreator from './components/QuizCreator';
import QuizTakingPage from './components/QuizTakingPage';
import QuizResult from './components/QuizResult';
import Leaderboard from './components/Leaderboard';
import MemberManagement from './components/MemberManagement';
import NotificationsPage from './components/NotificationsPage';
import AdminAnalyticsPage from './components/AdminAnalyticsPage';
import StudentAnalyticsPage from './components/StudentAnalyticsPage';

import {
  BookOpen, LayoutDashboard, Award, Bell, Users, BarChart3,
  Plus, LogOut, Hammer, X, ChevronDown
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

type Tab = 'dashboard' | 'quizzes' | 'create-quiz' | 'leaderboard' |
           'notifications' | 'analytics' | 'members';

interface ActiveQuizState {
  quiz: Quiz;
  attemptData: any;
}

interface ResultState {
  attempt: QuizAttempt;
  responses: QuestionResponse[];
  quiz: Quiz;
}

export default function App() {
  const {
    currentUser, users, quizzes, myAttempts, notifications,
    leaderboard, studentAnalytics, adminAnalytics,
    loading, authChecking,
    login, register, logout,
    approveUser, rejectUser, toggleAdminRole, removeUser,
    createQuiz, publishQuiz, deleteQuiz,
    parseQuestionsWithAI, getExplanation,
    startQuiz, saveResponse, submitQuiz, getAttemptDetail,
    markNotificationAsRead, markAllNotificationsAsRead, clearNotifications,
    refetch,
  } = useAppData();

  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuizState | null>(null);
  const [resultState, setResultState] = useState<ResultState | null>(null);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [startingQuiz, setStartingQuiz] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const isAdmin = currentUser?.role === 'admin';

  // ---- Auth loading ----
  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md animate-pulse mb-4">
          <BookOpen size={20} className="text-white" />
        </div>
        <p className="text-sm font-semibold text-slate-500 font-mono tracking-widest uppercase">Loading...</p>
      </div>
    );
  }

  // ---- Not logged in ----
  if (!currentUser) {
    return <AuthPages onLogin={login} onRegisterRequest={register} />;
  }

  // ---- Pending approval ----
  if (currentUser.status === 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-6 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 to-indigo-500" />
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto">
            <span className="text-2xl">⏳</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Awaiting Approval</h2>
            <p className="text-slate-500 text-sm mt-1">
              Hi <strong>{currentUser.name}</strong>, your enrollment request is pending admin review.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs text-slate-600 space-y-1.5">
            <p><span className="text-slate-400">Email:</span> <strong>{currentUser.email}</strong></p>
            <p><span className="text-slate-400">Department:</span> <strong>{currentUser.department}</strong></p>
            <p><span className="text-slate-400">Status:</span> <span className="text-amber-600 font-bold">Pending Approval</span></p>
          </div>
          <button onClick={logout}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition cursor-pointer">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // ---- Quiz Taking (full screen) ----
  if (activeQuiz) {
    return (
      <QuizTakingPage
        quiz={activeQuiz.quiz}
        attemptData={activeQuiz.attemptData}
        onSaveResponse={saveResponse}
        onSubmit={async (attemptId, timeTaken) => {
          const result = await submitQuiz(attemptId, timeTaken);
          // Fetch the full attempt detail for results page
          const detail = await getAttemptDetail(attemptId);
          setResultState({
            attempt: detail.attempt,
            responses: detail.responses,
            quiz: activeQuiz.quiz,
          });
          setActiveQuiz(null);
        }}
        onClose={() => setActiveQuiz(null)}
      />
    );
  }

  // ---- Quiz Result (full content) ----
  if (resultState) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <QuizResult
            attempt={resultState.attempt}
            responses={resultState.responses}
            quiz={resultState.quiz}
            onGetExplanation={getExplanation}
            onRetake={async () => {
              setResultState(null);
              await handleStartQuiz(resultState.quiz);
            }}
            onBack={() => {
              setResultState(null);
              setActiveTab('quizzes');
            }}
          />
        </div>
      </div>
    );
  }

  // ---- Start quiz handler ----
  const handleStartQuiz = async (quiz: Quiz) => {
    try {
      setStartingQuiz(true);
      const data = await startQuiz(quiz.id);
      setActiveQuiz({ quiz, attemptData: data });
    } catch (e: any) {
      alert(e.message || 'Failed to start quiz');
    } finally {
      setStartingQuiz(false);
    }
  };

  const handleViewResults = async (attempt: QuizAttempt) => {
    try {
      const detail = await getAttemptDetail(attempt.id);
      const quiz = quizzes.find(q => q.id === attempt.quiz_id);
      if (!quiz) return;
      setResultState({ attempt: detail.attempt, responses: detail.responses, quiz });
    } catch (e: any) {
      alert(e.message || 'Failed to load results');
    }
  };

  // ---- Sidebar nav config ----
  const studentNav = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'quizzes' as Tab, label: 'Quizzes', icon: BookOpen },
    { id: 'leaderboard' as Tab, label: 'Leaderboard', icon: Award },
    { id: 'analytics' as Tab, label: 'My Analytics', icon: BarChart3 },
    { id: 'notifications' as Tab, label: 'Notifications', icon: Bell, badge: unreadCount },
  ];

  const adminNav = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'quizzes' as Tab, label: 'Quiz Library', icon: BookOpen },
    { id: 'create-quiz' as Tab, label: 'Create Quiz', icon: Plus },
    { id: 'leaderboard' as Tab, label: 'Leaderboard', icon: Award },
    { id: 'analytics' as Tab, label: 'Analytics', icon: BarChart3 },
    { id: 'members' as Tab, label: 'Students', icon: Users },
    { id: 'notifications' as Tab, label: 'Notifications', icon: Bell, badge: unreadCount },
  ];

  const navItems = isAdmin ? adminNav : studentNav;

  const PAGE_TITLES: Record<Tab, string> = {
    dashboard: isAdmin ? 'Admin Dashboard' : 'My Dashboard',
    quizzes: 'Quiz Library',
    'create-quiz': 'Create Quiz',
    leaderboard: 'Department Leaderboard',
    notifications: 'Notifications',
    analytics: isAdmin ? 'Analytics' : 'My Analytics',
    members: 'Student Management',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex" id="prepforge-app">
      {/* ---- SIDEBAR ---- */}
      <aside className="w-56 bg-slate-900 text-slate-300 hidden md:flex flex-col shrink-0" id="sidebar">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">PrepForge CCE</h2>
              <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">
                {isAdmin ? 'Admin' : 'Student'} Portal
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition cursor-pointer ${
                activeTab === id
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800 font-medium'
              }`}
              id={`nav-${id}`}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={15} />
                <span>{label}</span>
              </div>
              {badge && badge > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-2.5 mb-3">
            <img src={currentUser.avatarUrl} alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-700" />
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-semibold truncate">{currentUser.name}</p>
              <p className="text-slate-500 text-[9px] truncate">{currentUser.email}</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 border border-slate-800 rounded-lg text-[10px] font-semibold transition cursor-pointer"
            id="logout-btn">
            <LogOut size={12} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ---- MAIN ---- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0" id="topbar">
          <h1 className="text-sm font-bold text-slate-900">{PAGE_TITLES[activeTab]}</h1>

          <div className="flex items-center gap-3">
            {startingQuiz && (
              <span className="text-xs text-indigo-600 font-semibold animate-pulse">Starting quiz...</span>
            )}

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifMenu(!showNotifMenu); if (!showNotifMenu) markAllNotificationsAsRead(); }}
                className="relative p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                id="notif-bell">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>

              <AnimatePresence>
                {showNotifMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden"
                    id="notif-dropdown"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                      <span className="text-xs font-bold text-slate-700">Notifications</span>
                      <button onClick={() => setShowNotifMenu(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                        <X size={14} />
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <p className="p-6 text-center text-xs text-slate-400">No notifications</p>
                      ) : notifications.slice(0, 8).map(n => (
                        <div key={n.id} className={`px-4 py-3 ${!n.read ? 'bg-indigo-50/50' : ''}`}>
                          <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.content}</p>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
                      <button onClick={() => { setActiveTab('notifications'); setShowNotifMenu(false); }}
                        className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer">
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile nav */}
            <div className="flex md:hidden gap-1">
              {navItems.slice(0, 4).map(({ id, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`p-2 rounded-lg transition cursor-pointer ${activeTab === id ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:text-slate-700'}`}>
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6" id="main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {/* Dashboard */}
              {activeTab === 'dashboard' && isAdmin && adminAnalytics && (
                <AdminDashboard
                  users={users}
                  quizzes={quizzes}
                  adminAnalytics={adminAnalytics}
                  onNavigate={t => setActiveTab(t as Tab)}
                />
              )}
              {activeTab === 'dashboard' && !isAdmin && (
                <StudentDashboard
                  user={currentUser}
                  quizzes={quizzes}
                  myAttempts={myAttempts}
                  leaderboard={leaderboard}
                  studentAnalytics={studentAnalytics}
                  onStartQuiz={handleStartQuiz}
                  onViewResults={handleViewResults}
                  onNavigate={t => setActiveTab(t as Tab)}
                />
              )}

              {/* Quiz Library */}
              {activeTab === 'quizzes' && (
                <QuizList
                  quizzes={quizzes}
                  myAttempts={myAttempts}
                  currentUserId={currentUser.id}
                  isAdmin={isAdmin}
                  onStartQuiz={handleStartQuiz}
                  onViewResults={handleViewResults}
                  onNavigateCreate={() => setActiveTab('create-quiz')}
                />
              )}

              {/* Create Quiz (admin) */}
              {activeTab === 'create-quiz' && isAdmin && (
                <QuizCreator
                  onCreateQuiz={createQuiz}
                  onPublishQuiz={publishQuiz}
                  onParseQuestions={parseQuestionsWithAI}
                  onClose={() => setActiveTab('dashboard')}
                />
              )}

              {/* Leaderboard */}
              {activeTab === 'leaderboard' && (
                <Leaderboard
                  leaderboard={leaderboard}
                  currentUser={currentUser}
                />
              )}

              {/* Analytics */}
              {activeTab === 'analytics' && isAdmin && adminAnalytics && (
                <AdminAnalyticsPage analytics={adminAnalytics} />
              )}
              {activeTab === 'analytics' && !isAdmin && studentAnalytics && (
                <StudentAnalyticsPage user={currentUser} analytics={studentAnalytics} />
              )}
              {activeTab === 'analytics' && !isAdmin && !studentAnalytics && (
                <div className="text-center py-16 text-slate-400">
                  <p className="text-sm">Complete at least one quiz to see your analytics.</p>
                </div>
              )}

              {/* Members (admin) */}
              {activeTab === 'members' && isAdmin && (
                <MemberManagement
                  users={users}
                  onApproveUser={approveUser}
                  onRejectUser={rejectUser}
                  onToggleAdminRole={toggleAdminRole}
                  onRemoveUser={removeUser}
                />
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <NotificationsPage
                  notifications={notifications}
                  onMarkAsRead={markNotificationAsRead}
                  onMarkAllAsRead={markAllNotificationsAsRead}
                  onClearNotifications={clearNotifications}
                />
              )}

              {/* Loading state */}
              {loading && activeTab === 'dashboard' && (
                <div className="flex items-center justify-center py-20 text-slate-400">
                  <div className="w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mr-3" />
                  Loading your workspace...
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

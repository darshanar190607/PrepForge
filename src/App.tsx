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
  Plus, LogOut, X, Menu, ChevronRight
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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
            <span className="text-2xl">&#x23F3;</span>
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

  // ---- Quiz Result ----
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

  // ---- Nav config ----
  const studentNav = [
    { id: 'dashboard' as Tab, label: 'Home', icon: LayoutDashboard },
    { id: 'quizzes' as Tab, label: 'Quizzes', icon: BookOpen },
    { id: 'leaderboard' as Tab, label: 'Ranks', icon: Award },
    { id: 'analytics' as Tab, label: 'Analytics', icon: BarChart3 },
    { id: 'notifications' as Tab, label: 'Alerts', icon: Bell, badge: unreadCount },
  ];

  const adminNav = [
    { id: 'dashboard' as Tab, label: 'Home', icon: LayoutDashboard },
    { id: 'quizzes' as Tab, label: 'Quizzes', icon: BookOpen },
    { id: 'create-quiz' as Tab, label: 'Create', icon: Plus },
    { id: 'leaderboard' as Tab, label: 'Ranks', icon: Award },
    { id: 'analytics' as Tab, label: 'Stats', icon: BarChart3 },
    { id: 'members' as Tab, label: 'Students', icon: Users },
    { id: 'notifications' as Tab, label: 'Alerts', icon: Bell, badge: unreadCount },
  ];

  const navItems = isAdmin ? adminNav : studentNav;
  // On mobile: show first 4 + "More" for admin; all 5 for student
  const bottomNavItems = isAdmin ? navItems.slice(0, 4) : navItems;
  const moreItems = isAdmin ? navItems.slice(4) : [];

  const PAGE_TITLES: Record<Tab, string> = {
    dashboard: isAdmin ? 'Admin Dashboard' : 'My Dashboard',
    quizzes: 'Quiz Library',
    'create-quiz': 'Create Quiz',
    leaderboard: 'Leaderboard',
    notifications: 'Notifications',
    analytics: isAdmin ? 'Analytics' : 'My Analytics',
    members: 'Student Management',
  };

  const navigate = (tab: Tab) => {
    setActiveTab(tab);
    setShowMobileMenu(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex" id="prepforge-app">

      {/* ======== DESKTOP SIDEBAR ======== */}
      <aside className="w-56 bg-slate-900 text-slate-300 hidden md:flex flex-col shrink-0" id="sidebar">
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
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ id, label, icon: Icon, badge }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition cursor-pointer ${
                activeTab === id ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800 font-medium'
              }`} id={`nav-${id}`}>
              <div className="flex items-center gap-2.5">
                <Icon size={15} />
                <span>{label}</span>
              </div>
              {badge && badge > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">{badge}</span>
              )}
            </button>
          ))}
        </nav>
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

      {/* ======== MAIN CONTENT AREA ======== */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* === MOBILE HEADER === */}
        <header className="md:hidden h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900 truncate max-w-[160px]">{PAGE_TITLES[activeTab]}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {startingQuiz && <span className="text-[10px] text-indigo-600 font-semibold animate-pulse">Starting...</span>}
            {/* Bell */}
            <div className="relative">
              <button onClick={() => { setShowNotifMenu(!showNotifMenu); if (!showNotifMenu) markAllNotificationsAsRead(); }}
                className="relative p-2 text-slate-400 hover:text-slate-700 rounded-lg transition cursor-pointer">
                <Bell size={18} />
                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />}
              </button>
              <AnimatePresence>
                {showNotifMenu && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                      <span className="text-xs font-bold text-slate-700">Notifications</span>
                      <button onClick={() => setShowNotifMenu(false)} className="text-slate-400 cursor-pointer"><X size={14} /></button>
                    </div>
                    <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
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
                      <button onClick={() => { navigate('notifications'); setShowNotifMenu(false); }}
                        className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer">View all</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Avatar */}
            <img src={currentUser.avatarUrl} alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover border border-slate-200" />
          </div>
        </header>

        {/* === DESKTOP HEADER === */}
        <header className="hidden md:flex h-14 bg-white border-b border-slate-200 items-center justify-between px-6 shrink-0" id="topbar">
          <h1 className="text-sm font-bold text-slate-900">{PAGE_TITLES[activeTab]}</h1>
          <div className="flex items-center gap-3">
            {startingQuiz && <span className="text-xs text-indigo-600 font-semibold animate-pulse">Starting quiz...</span>}
            <div className="relative">
              <button onClick={() => { setShowNotifMenu(!showNotifMenu); if (!showNotifMenu) markAllNotificationsAsRead(); }}
                className="relative p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer" id="notif-bell">
                <Bell size={18} />
                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />}
              </button>
              <AnimatePresence>
                {showNotifMenu && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden" id="notif-dropdown">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                      <span className="text-xs font-bold text-slate-700">Notifications</span>
                      <button onClick={() => setShowNotifMenu(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={14} /></button>
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
                        className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer">View all notifications</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* === PAGE CONTENT === */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6" id="main-content">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
              {activeTab === 'dashboard' && isAdmin && adminAnalytics && (
                <AdminDashboard users={users} quizzes={quizzes} adminAnalytics={adminAnalytics} onNavigate={t => setActiveTab(t as Tab)} />
              )}
              {activeTab === 'dashboard' && !isAdmin && (
                <StudentDashboard user={currentUser} quizzes={quizzes} myAttempts={myAttempts} leaderboard={leaderboard}
                  studentAnalytics={studentAnalytics} onStartQuiz={handleStartQuiz} onViewResults={handleViewResults} onNavigate={t => setActiveTab(t as Tab)} />
              )}
              {activeTab === 'quizzes' && (
                <QuizList quizzes={quizzes} myAttempts={myAttempts} currentUserId={currentUser.id} isAdmin={isAdmin}
                  onStartQuiz={handleStartQuiz} onViewResults={handleViewResults} onNavigateCreate={() => setActiveTab('create-quiz')} />
              )}
              {activeTab === 'create-quiz' && isAdmin && (
                <QuizCreator onCreateQuiz={createQuiz} onPublishQuiz={publishQuiz} onParseQuestions={parseQuestionsWithAI} onClose={() => setActiveTab('dashboard')} />
              )}
              {activeTab === 'leaderboard' && (
                <Leaderboard leaderboard={leaderboard} currentUser={currentUser} />
              )}
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
              {activeTab === 'members' && isAdmin && (
                <MemberManagement users={users} onApproveUser={approveUser} onRejectUser={rejectUser}
                  onToggleAdminRole={toggleAdminRole} onRemoveUser={removeUser} />
              )}
              {activeTab === 'notifications' && (
                <NotificationsPage notifications={notifications} onMarkAsRead={markNotificationAsRead}
                  onMarkAllAsRead={markAllNotificationsAsRead} onClearNotifications={clearNotifications} />
              )}
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

      {/* ======== MOBILE BOTTOM NAV ======== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40" id="bottom-nav"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-stretch">
          {bottomNavItems.map(({ id, label, icon: Icon, badge }) => (
            <button key={id} onClick={() => navigate(id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition cursor-pointer relative ${
                activeTab === id ? 'text-indigo-600' : 'text-slate-400'
              }`}>
              {activeTab === id && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-600 rounded-b-full" />
              )}
              <div className="relative">
                <Icon size={20} strokeWidth={activeTab === id ? 2.5 : 1.8} />
                {badge && badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[8px] font-bold px-1 rounded-full min-w-[14px] text-center leading-tight">
                    {badge}
                  </span>
                )}
              </div>
              <span className={`text-[9px] font-semibold tracking-wide ${activeTab === id ? 'text-indigo-600' : 'text-slate-400'}`}>
                {label}
              </span>
            </button>
          ))}

          {/* "More" overflow for admin */}
          {moreItems.length > 0 && (
            <button onClick={() => setShowMobileMenu(true)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition cursor-pointer ${
                moreItems.some(i => i.id === activeTab) ? 'text-indigo-600' : 'text-slate-400'
              }`}>
              <Menu size={20} strokeWidth={1.8} />
              <span className="text-[9px] font-semibold tracking-wide">More</span>
            </button>
          )}
        </div>
      </nav>

      {/* ======== MOBILE "MORE" BOTTOM SHEET ======== */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 md:hidden"
              onClick={() => setShowMobileMenu(false)} />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 md:hidden overflow-hidden"
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-900">More</span>
                <button onClick={() => setShowMobileMenu(false)} className="text-slate-400 cursor-pointer"><X size={18} /></button>
              </div>
              <div className="p-3 space-y-1">
                {moreItems.map(({ id, label, icon: Icon, badge }) => (
                  <button key={id} onClick={() => navigate(id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition cursor-pointer ${
                      activeTab === id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}>
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {badge && badge > 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>
                      )}
                      <ChevronRight size={14} className="text-slate-400" />
                    </div>
                  </button>
                ))}
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <img src={currentUser.avatarUrl} alt={currentUser.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                    </div>
                  </div>
                  <button onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer">
                    <LogOut size={18} />
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
              <div className="h-4" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

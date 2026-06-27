import { useState, useEffect, useCallback } from 'react';
import {
  User, Quiz, QuizAttempt, QuestionResponse, Notification,
  LeaderboardEntry, StudentAnalytics, AdminAnalytics, StudyCoach,
  AIExplanation, Question, ParsedQuestion, QuizFormData
} from '../types';
import { api, getAuthToken, setAuthToken } from '../api';

export function useAppData() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [myAttempts, setMyAttempts] = useState<QuizAttempt[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [studentAnalytics, setStudentAnalytics] = useState<StudentAnalytics | null>(null);
  const [adminAnalytics, setAdminAnalytics] = useState<AdminAnalytics | null>(null);

  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ------------------------------------------------------------------
  // Core data fetch
  // ------------------------------------------------------------------
  const fetchMainData = useCallback(async (role: 'admin' | 'student', userId: string) => {
    try {
      setLoading(true);
      const [quizzesData, attemptsData, notifsData, lbData] = await Promise.all([
        api.get('/api/quizzes'),
        api.get('/api/attempts'),
        api.get('/api/notifications'),
        api.get('/api/leaderboard'),
      ]);
      setQuizzes(quizzesData);
      setMyAttempts(attemptsData);
      setNotifications(notifsData);
      setLeaderboard(lbData);

      if (role === 'admin') {
        const [usersData, adminAnalyticsData] = await Promise.all([
          api.get('/api/users'),
          api.get('/api/analytics/admin'),
        ]);
        setUsers(usersData);
        setAdminAnalytics(adminAnalyticsData);
      } else {
        const analyticsData = await api.get(`/api/analytics/student/${userId}`);
        setStudentAnalytics(analyticsData);
      }
      setError(null);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  // ------------------------------------------------------------------
  // Auth check on mount
  // ------------------------------------------------------------------
  const checkAuth = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setCurrentUser(null);
      setAuthChecking(false);
      setLoading(false);
      return;
    }
    try {
      setAuthChecking(true);
      const res = await api.get('/api/auth/me');
      setCurrentUser(res.user);
      if (res.user.status === 'active') {
        await fetchMainData(res.user.role, res.user.id);
      }
    } catch {
      setAuthToken(null);
      setCurrentUser(null);
    } finally {
      setAuthChecking(false);
    }
  }, [fetchMainData]);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  // ------------------------------------------------------------------
  // Auth mutations
  // ------------------------------------------------------------------
  const login = async (email: string, password: string): Promise<User> => {
    const data = await api.post('/api/auth/login', { email, password });
    setAuthToken(data.token);
    setCurrentUser(data.user);
    if (data.user.status === 'active') {
      await fetchMainData(data.user.role, data.user.id);
    }
    return data.user;
  };

  const register = async (
    name: string, email: string, password: string,
    groupCode: string, department?: string, year?: string
  ): Promise<void> => {
    await api.post('/api/auth/register', { name, email, password, groupCode, department, year });
  };

  const logout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setUsers([]);
    setQuizzes([]);
    setMyAttempts([]);
    setNotifications([]);
    setLeaderboard([]);
    setStudentAnalytics(null);
    setAdminAnalytics(null);
  };

  // ------------------------------------------------------------------
  // User management (admin)
  // ------------------------------------------------------------------
  const approveUser = async (userId: string) => {
    await api.patch(`/api/users/${userId}/approve`);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'active' } : u));
    if (currentUser) await fetchMainData(currentUser.role, currentUser.id);
  };

  const rejectUser = async (userId: string) => {
    await api.patch(`/api/users/${userId}/reject`);
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const toggleAdminRole = async (userId: string) => {
    await api.patch(`/api/users/${userId}/role`);
    setUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, role: u.role === 'admin' ? 'student' : 'admin' } : u
    ));
  };

  const removeUser = async (userId: string) => {
    await api.delete(`/api/users/${userId}`);
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  // ------------------------------------------------------------------
  // Quiz management (admin)
  // ------------------------------------------------------------------
  const createQuiz = async (formData: QuizFormData): Promise<{ id: string }> => {
    const result = await api.post('/api/quizzes', formData);
    if (currentUser) await fetchMainData(currentUser.role, currentUser.id);
    return result;
  };

  const publishQuiz = async (quizId: string) => {
    await api.patch(`/api/quizzes/${quizId}/publish`);
    setQuizzes(prev => prev.map(q => q.id === quizId ? { ...q, status: 'published' } : q));
  };

  const deleteQuiz = async (quizId: string) => {
    await api.delete(`/api/quizzes/${quizId}`);
    setQuizzes(prev => prev.filter(q => q.id !== quizId));
  };

  const updateQuiz = async (quizId: string, data: Partial<QuizFormData>) => {
    await api.patch(`/api/quizzes/${quizId}`, data);
    if (currentUser) await fetchMainData(currentUser.role, currentUser.id);
  };

  // ------------------------------------------------------------------
  // AI parsing
  // ------------------------------------------------------------------
  const parseQuestionsWithAI = async (rawText: string, subject: string): Promise<ParsedQuestion[]> => {
    const result = await api.post('/api/ai/parse-questions', { rawText, subject });
    return result.questions;
  };

  // ------------------------------------------------------------------
  // Quiz taking
  // ------------------------------------------------------------------
  const startQuiz = async (quizId: string) => {
    return await api.post('/api/attempts', { quizId });
  };

  const saveResponse = async (
    attemptId: string,
    questionId: string,
    selectedAnswer: string | null,
    flaggedForReview: boolean,
    timeSpent: number
  ) => {
    return await api.patch(`/api/attempts/${attemptId}/response`, {
      questionId, selectedAnswer, flaggedForReview, timeSpent
    });
  };

  const submitQuiz = async (attemptId: string, timeTaken: number) => {
    const result = await api.post(`/api/attempts/${attemptId}/submit`, { timeTaken });
    if (currentUser) await fetchMainData(currentUser.role, currentUser.id);
    return result;
  };

  const getAttemptDetail = async (attemptId: string) => {
    return await api.get(`/api/attempts/${attemptId}/detail`);
  };

  // ------------------------------------------------------------------
  // AI Explanation (cached)
  // ------------------------------------------------------------------
  const getExplanation = async (questionId: string): Promise<AIExplanation> => {
    const result = await api.get(`/api/explanations/${questionId}`);
    return result.explanation;
  };

  // ------------------------------------------------------------------
  // Study Coach
  // ------------------------------------------------------------------
  const getStudyCoach = async (userId: string): Promise<StudyCoach> => {
    const result = await api.get(`/api/analytics/study-coach/${userId}`);
    return result.studyCoach;
  };

  // ------------------------------------------------------------------
  // Notifications
  // ------------------------------------------------------------------
  const markNotificationAsRead = async (notifId: string) => {
    await api.patch(`/api/notifications/${notifId}/read`);
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = async () => {
    await api.patch('/api/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = async () => {
    await api.delete('/api/notifications');
    setNotifications([]);
  };

  const refetch = () => currentUser && fetchMainData(currentUser.role, currentUser.id);

  return {
    // State
    currentUser, users, quizzes, myAttempts, notifications,
    leaderboard, studentAnalytics, adminAnalytics,
    loading, authChecking, error,
    // Auth
    login, register, logout,
    // User management
    approveUser, rejectUser, toggleAdminRole, removeUser,
    // Quiz management
    createQuiz, publishQuiz, deleteQuiz, updateQuiz,
    // AI
    parseQuestionsWithAI, getExplanation, getStudyCoach,
    // Quiz taking
    startQuiz, saveResponse, submitQuiz, getAttemptDetail,
    // Notifications
    markNotificationAsRead, markAllNotificationsAsRead, clearNotifications,
    // Util
    refetch,
  };
}

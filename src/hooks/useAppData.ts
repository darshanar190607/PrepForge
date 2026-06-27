import { useState, useEffect, useCallback } from 'react';
import { User, Problem, Submission, Announcement, Notification, Contribution } from '../types';
import { api, getAuthToken, setAuthToken } from '../api';

export function useAppData() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMainData = useCallback(async (role: 'admin' | 'member') => {
    try {
      setLoading(true);
      
      // Fetch problems, submissions, announcements, notifications, contributions in parallel
      const [probsData, subsData, annsData, notifsData, contribsData] = await Promise.all([
        api.get('/api/problems'),
        api.get('/api/submissions'),
        api.get('/api/announcements'),
        api.get('/api/notifications'),
        api.get('/api/contributions'),
      ]);

      setProblems(probsData);
      setSubmissions(subsData);
      setAnnouncements(annsData);
      setNotifications(notifsData);
      setContributions(contribsData);

      // Fetch all users list if admin
      if (role === 'admin') {
        const usersData = await api.get('/api/users');
        setUsers(usersData);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load workspace data');
    } finally {
      setLoading(false);
    }
  }, []);

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
      
      // Load workspace data for active users
      if (res.user.status === 'active') {
        await fetchMainData(res.user.role);
      }
    } catch (err) {
      console.error('Auth verification failed, clearing session:', err);
      setAuthToken(null);
      setCurrentUser(null);
    } finally {
      setAuthChecking(false);
    }
  }, [fetchMainData]);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // -------------------------------------------------------------
  // MUTATION WORKFLOWS
  // -------------------------------------------------------------

  const login = async (email: string, password: string): Promise<User> => {
    setError(null);
    try {
      const data = await api.post('/api/auth/login', { email, password });
      setAuthToken(data.token);
      setCurrentUser(data.user);
      
      if (data.user.status === 'active') {
        await fetchMainData(data.user.role);
      }
      return data.user;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string, groupCode: string): Promise<void> => {
    setError(null);
    try {
      await api.post('/api/auth/register', { name, email, password, groupCode });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setUsers([]);
    setProblems([]);
    setSubmissions([]);
    setAnnouncements([]);
    setNotifications([]);
    setContributions([]);
  };

  const approveUser = async (userId: string) => {
    try {
      await api.patch(`/api/users/${userId}/approve`);
      
      // Update local users status
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'active', streak: 1 } : u));
      
      // Fetch latest submissions, notifications, etc.
      if (currentUser) {
        await fetchMainData(currentUser.role);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to approve user');
      throw err;
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      await api.delete(`/api/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err: any) {
      setError(err.message || 'Failed to reject user');
      throw err;
    }
  };

  const toggleAdminRole = async (userId: string) => {
    try {
      await api.patch(`/api/users/${userId}/role`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: u.role === 'admin' ? 'member' : 'admin' } : u));
    } catch (err: any) {
      setError(err.message || 'Failed to toggle admin role');
      throw err;
    }
  };

  const removeUser = async (userId: string) => {
    try {
      await api.delete(`/api/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err: any) {
      setError(err.message || 'Failed to remove user');
      throw err;
    }
  };

  const publishChallenge = async (problemData: {
    title: string;
    description: string;
    topic: string;
    pattern: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    deadline: string;
    starterCode: Record<string, string>;
    testCases: any[];
    companyTags: string[];
  }) => {
    try {
      await api.post('/api/problems', problemData);
      if (currentUser) {
        await fetchMainData(currentUser.role);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to publish challenge');
      throw err;
    }
  };

  const submitSolution = async (problemId: string, code: string, language: string, explanation: string) => {
    try {
      const newSub = await api.post('/api/submissions', { problemId, code, language, explanation });
      
      // Update local submissions list
      setSubmissions(prev => [newSub, ...prev]);

      // Refresh data to update solved counts and streaks
      if (currentUser) {
        // Refetch user profile to get updated solvedCount/streak
        const res = await api.get('/api/auth/me');
        setCurrentUser(res.user);
        
        await fetchMainData(currentUser.role);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit solution');
      throw err;
    }
  };

  const postAnnouncement = async (announcementData: {
    title: string;
    content: string;
    category: 'important' | 'general' | 'resource';
  }) => {
    try {
      await api.post('/api/announcements', announcementData);
      if (currentUser) {
        await fetchMainData(currentUser.role);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to post announcement');
      throw err;
    }
  };

  const deleteAnnouncement = async (annId: string) => {
    try {
      await api.delete(`/api/announcements/${annId}`);
      setAnnouncements(prev => prev.filter(a => a.id !== annId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete announcement');
      throw err;
    }
  };

  const markNotificationAsRead = async (notifId: string) => {
    try {
      await api.patch(`/api/notifications/${notifId}/read`);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await api.patch('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err: any) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const clearNotifications = async () => {
    try {
      await api.delete('/api/notifications');
      setNotifications([]);
    } catch (err: any) {
      console.error('Failed to clear notifications:', err);
    }
  };

  const postVideoContribution = async (contribData: {
    topic: string;
    title: string;
    videoUrl: string;
    description: string;
  }) => {
    try {
      const newContrib = await api.post('/api/contributions/video', contribData);
      setContributions(prev => [newContrib, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Failed to post video contribution');
      throw err;
    }
  };

  return {
    currentUser,
    users,
    problems,
    submissions,
    announcements,
    notifications,
    contributions,
    loading,
    authChecking,
    error,
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
    postVideoContribution,
    refetch: () => currentUser && fetchMainData(currentUser.role),
  };
}

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { username: string; email: string; password: string; full_name: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data),
  
  logout: () => api.post('/auth/logout'),
  
  refreshToken: () => api.post('/auth/refresh'),
  
  getProfile: () => api.get('/auth/profile'),
  
  updateProfile: (data: any) => api.put('/auth/profile', data),
  
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.put('/auth/change-password', data),
  
  deleteAccount: () => api.delete('/auth/account'),
};

// Problems API
export const problemsAPI = {
  getAll: (params?: { page?: number; limit?: number; difficulty?: string; topics?: string[]; search?: string }) =>
    api.get('/problems', { params }),
  getById: (id: string) => api.get(`/problems/${id}`),
  getTestCases: (id: string) => api.get(`/problems/${id}/test-cases`),
  submit: (id: string, data: { code: string; language: string }) =>
    api.post(`/problems/${id}/submit`, data),
  test: (id: string, data: { code: string; language: string }) =>
    api.post(`/problems/${id}/test`, data),
  testWithLLM: (id: string, data: { code: string; language: string }) =>
    api.post(`/problems/${id}/test-llm`, data),
  run: (id: string, data: { code: string; language: string }) =>
    api.post(`/problems/${id}/run`, data),
  delete: (id: string) => api.delete(`/admin/problems/${id}`),
  getAvailableTopics: () => api.get('/problems/topics/available'),
};

// Submissions API
export const submissionsAPI = {
  getAll: (params?: { page?: number; limit?: number; problem_id?: string; status?: string }) =>
    api.get('/submissions', { params }),
  
  getById: (id: string) => api.get(`/submissions/${id}`),
  
  getMySubmissions: (params?: { page?: number; limit?: number }) =>
    api.get(`/users/${localStorage.getItem('userId') || 'me'}/submissions`, { params }),
};

// Contests API
export const contestsAPI = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/contests', { params }),
  getById: (id: string) => api.get(`/contests/${id}`),
  register: (id: string) => api.post(`/contests/${id}/register`),
  getLeaderboard: (id: string) => api.get(`/contests/${id}/leaderboard`),
  getProblems: (id: string) => api.get(`/contests/${id}/problems`),
  submit: (contestId: string, problemId: string, data: { code: string; language: string }) =>
    api.post(`/contests/${contestId}/problems/${problemId}/submit`, data),
  delete: (id: string) => api.delete(`/contests/${id}`),
};

// Users API
export const usersAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/users', { params }),
  
  getLeaderboard: (params?: { page?: number; limit?: number; timeFrame?: 'all' | 'weekly' | 'monthly' }) =>
    api.get('/users/leaderboard/global', { params }),
  
  getStats: (username: string) => api.get(`/users/${username}/stats`),
  
  getProfile: (id: string) => api.get(`/users/${id}`),
  
  updateUser: (id: string, data: any) => api.put(`/users/${id}`, data),
};

// Admin API
export const adminAPI = {
  // Problems
  getAllProblems: (params?: { page?: number; limit?: number; search?: string; difficulty?: string; status?: string }) =>
    api.get('/admin/problems', { params }),
  createProblem: (data: any) => api.post('/admin/problems', data),
  updateProblem: (id: string, data: any) => api.put(`/admin/problems/${id}`, data),
  deleteProblem: (id: string) => api.delete(`/admin/problems/${id}`),
  
              // LeetCode Suggestions
            getLeetCodeSuggestions: (params?: { page?: number; limit?: number; search?: string; difficulty?: string; topics?: string[] }) =>
              api.get('/admin/problems/leetcode-suggestions', { params }),
            addLeetCodeSuggestion: (id: number) => api.post(`/admin/problems/add-leetcode-suggestion/${id}`),
            getLeetCodeTopics: () => api.get('/admin/problems/leetcode-topics'),
  
  // Contests
  createContest: (data: any) => api.post('/admin/contests', data),
  updateContest: (id: string, data: any) => api.put(`/admin/contests/${id}`, data),
  deleteContest: (id: string) => api.delete(`/admin/contests/${id}`),
  
  // Users
  getAllUsers: (params?: { page?: number; limit?: number; search?: string; role?: string }) =>
    api.get('/admin/users', { params }),
  createUser: (data: any) => api.post('/admin/users', data),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  
  // System
  getSystemStats: () => api.get('/admin/stats'),
  getSystemSettings: () => api.get('/admin/settings'),
  updateSystemSettings: (data: any) => api.put('/admin/settings', data),
};

// Gamification API
export const gamificationAPI = {
  // Stats and XP
  getStats: () => api.get('/gamification/stats'),
  getLeaderboard: (params?: { limit?: number }) => api.get('/gamification/leaderboard', { params }),
  getXPHistory: (params?: { limit?: number }) => api.get('/gamification/xp-history', { params }),
  
  // Achievements and Badges
  getAchievements: () => api.get('/gamification/achievements'),
  getBadges: () => api.get('/gamification/badges'),
  
  // Daily Challenges
  getDailyChallenge: (params?: { date?: string }) => api.get('/gamification/daily-challenge', { params }),
  completeDailyChallenge: (challengeId: number) => api.post(`/gamification/daily-challenge/${challengeId}/complete`),
  
  // Code Reviews
  createCodeReview: (submissionId: number, reviewText: string, rating: number) =>
    api.post('/gamification/code-reviews', { submissionId, reviewText, rating }),
  getCodeReviews: (submissionId: number) => api.get(`/gamification/submissions/${submissionId}/reviews`),
  voteCodeReview: (reviewId: number, helpful: boolean) =>
    api.post(`/gamification/code-reviews/${reviewId}/vote`, { helpful }),
  
  // Mentorship
  requestMentorship: (mentorId: number, problemId: number, requestMessage: string) =>
    api.post('/gamification/mentorship/request', { mentorId, problemId, requestMessage }),
  getMentorshipRequests: (params?: { role?: 'mentor' | 'mentee'; status?: string }) =>
    api.get('/gamification/mentorship/requests', { params }),
  updateMentorshipRequest: (requestId: number, data: { status: string; responseMessage?: string }) =>
    api.patch(`/gamification/mentorship/requests/${requestId}`, data),
  
  // Study Groups
  createStudyGroup: (name: string, description: string, maxMembers: number, isPublic: boolean) =>
    api.post('/gamification/study-groups', { name, description, maxMembers, isPublic }),
  getStudyGroups: (params?: { type?: 'my' | 'public' | 'joined' }) =>
    api.get('/gamification/study-groups', { params }),
  getStudyGroupDetails: (groupId: number) => api.get(`/gamification/study-groups/${groupId}`),
  joinStudyGroup: (groupId: number) => api.post(`/gamification/study-groups/${groupId}/join`),
  createStudySession: (groupId: number, data: any) =>
    api.post(`/gamification/study-groups/${groupId}/sessions`, data),
  joinStudySession: (sessionId: number) => api.post(`/gamification/study-sessions/${sessionId}/join`),
  
  // Initialize user XP (internal use)
  initializeUserXP: () => api.post('/gamification/initialize-xp'),
  
  // Add XP
  addXP: (amount: number, type: string, description: string) =>
    api.post('/gamification/add-xp', { amount, type, description }),
};

export default api;

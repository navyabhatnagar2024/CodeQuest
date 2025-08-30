import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI, submissionsAPI } from '../services/api';
import GamifiedDashboard from '../components/GamifiedDashboard';

interface UserStats {
  total_problems_solved: number;
  total_submissions: number;
  correct_submissions: number;
  accuracy_percentage: number;
  rank: number;
}

interface RecentSubmission {
  id: number;
  problem_title: string;
  language: string;
  status: string;
  submitted_at: string;
  score: number;
}

interface RecentProblem {
  id: number;
  title: string;
  difficulty_level: string;
  is_solved: boolean;
}

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
  const [recentProblems, setRecentProblems] = useState<RecentProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch user profile (which includes basic stats)
      const statsResponse = await usersAPI.getProfile(user!.id.toString());
      const userData = statsResponse.data.user;

      // Create stats object from user data with fallbacks
      const userStats = {
        total_problems_solved: userData?.total_problems_solved || 0,
        total_submissions: userData?.total_submissions || 0,
        correct_submissions: userData?.correct_submissions || 0,
        accuracy_percentage: userData?.total_submissions > 0 ?
          Math.round((userData.correct_submissions / userData.total_submissions) * 100) : 0,
        rank: userData?.rank || 1
      };
      setStats(userStats);

      // Fetch recent submissions
      try {
        const submissionsResponse = await submissionsAPI.getAll({ limit: 5 });
        const submissions = submissionsResponse.data.submissions || submissionsResponse.data || [];
        setRecentSubmissions(Array.isArray(submissions) ? submissions : []);
      } catch (submissionErr) {
        console.error('Failed to fetch submissions:', submissionErr);
        setRecentSubmissions([]);
      }

      // Fetch recent problems (you might need to implement this endpoint)
      // For now, we'll use a placeholder
      setRecentProblems([]);

    } catch (err) {
      console.error('Dashboard error:', err);
      // Set default stats if profile fetch fails
      setStats({
        total_problems_solved: 0,
        total_submissions: 0,
        correct_submissions: 0,
        accuracy_percentage: 0,
        rank: 1
      });
      setRecentSubmissions([]);
      setRecentProblems([]);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
      case 'correct':
        return 'text-green-600 bg-green-100';
      case 'wrong answer':
      case 'incorrect':
        return 'text-red-600 bg-red-100';
      case 'time limit exceeded':
        return 'text-yellow-600 bg-yellow-100';
      case 'runtime error':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-purple-200 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="btn-primary inline-flex items-center glow-purple hover-lift"
          >
            <span className="mr-2">🔄</span>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show welcome message for non-authenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Header */}
          <div className="gamified-card border-b border-purple-200 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">🚀 Welcome to CodeQuest!</h1>
                <p className="text-purple-200">Your journey to coding mastery starts here</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="xp-counter">
                  <div className="text-sm text-purple-200">Join Now</div>
                  <div className="text-2xl font-bold">Free</div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="interactive-card hover-lift">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Practice Problems</h3>
                  <p className="text-purple-200">Solve coding challenges and improve your skills</p>
                </div>
              </div>
              <div className="mt-4">
                <Link to="/practice" className="text-blue-400 hover:text-blue-300 font-medium">Start Practicing →</Link>
              </div>
            </div>

            <div className="interactive-card hover-lift">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Code Games</h3>
                  <p className="text-purple-200">Learn through interactive games and challenges</p>
                </div>
              </div>
              <div className="mt-4">
                <Link to="/code-games" className="text-green-400 hover:text-green-300 font-medium">Play Games →</Link>
              </div>
            </div>

            <div className="interactive-card hover-lift">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Study Groups</h3>
                  <p className="text-purple-200">Join study groups and learn with others</p>
                </div>
              </div>
              <div className="mt-4">
                <Link to="/study-groups" className="text-purple-400 hover:text-purple-300 font-medium">Join Groups →</Link>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="gamified-card text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Start Your Coding Journey?</h2>
            <p className="text-purple-200 mb-6">Create an account to track your progress, earn XP, and unlock achievements!</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary inline-flex items-center glow-purple hover-lift">
                <span className="mr-2">🚀</span>
                Get Started
              </Link>
              <Link to="/login" className="border-2 border-purple-400 text-purple-200 px-8 py-3 rounded-xl font-semibold hover:bg-purple-400 hover:text-white transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="gamified-card border-b border-purple-200 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">🎉 Welcome back, {user?.username}!</h1>
              <p className="text-purple-200">Here's your competitive programming progress</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="xp-counter">
                <div className="text-sm text-purple-200">Current Rank</div>
                <div className="text-2xl font-bold">#{stats?.rank || 1}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Gamified Dashboard */}
        <GamifiedDashboard />

        {/* Statistics Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="interactive-card hover-lift">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-200">Problems Solved</p>
                  <p className="text-2xl font-bold text-white">{stats.total_problems_solved}</p>
                </div>
              </div>
            </div>

            <div className="interactive-card hover-lift">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-200">Total Submissions</p>
                  <p className="text-2xl font-bold text-white">{stats.total_submissions}</p>
                </div>
              </div>
            </div>

            <div className="interactive-card hover-lift">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-200">Accuracy</p>
                  <p className="text-2xl font-bold text-white">{stats.accuracy_percentage}%</p>
                </div>
              </div>
            </div>

            <div className="interactive-card hover-lift">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-200">Rank</p>
                  <p className="text-2xl font-bold text-white">{stats.rank}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="gamified-card mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <span className="mr-2">⚡</span>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/practice"
              className="interactive-card hover-lift p-4"
            >
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white mr-3 shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white">Practice Problems</h3>
                  <p className="text-sm text-purple-200">Solve coding challenges</p>
                </div>
              </div>
            </Link>

            <Link
              to="/contests"
              className="interactive-card hover-lift p-4"
            >
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white mr-3 shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white">Join Contests</h3>
                  <p className="text-sm text-purple-200">Compete with others</p>
                </div>
              </div>
            </Link>

            <Link
              to="/submissions"
              className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 hover:bg-primary-50 dark:hover:border-primary-700 dark:hover:bg-primary-900 transition-colors"
            >
              <div className="p-2 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200 mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">View Submissions</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Check your progress</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Submissions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Submissions</h2>
            {recentSubmissions.length > 0 ? (
              <div className="space-y-3">
                {recentSubmissions.map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{submission.problem_title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {submission.language} • {formatDate(submission.submitted_at)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>{submission.status}</span>
                      {submission.score > 0 && (
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{submission.score}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent submissions</p>
            )}
            <div className="mt-4">
              <Link
                to="/submissions"
                className="text-primary-600 hover:text-primary-700 font-medium text-sm dark:text-primary-400 dark:hover:text-primary-300"
              >
                View all submissions →
              </Link>
            </div>
          </div>

          {/* Recent Problems */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Problems</h2>
            {recentProblems.length > 0 ? (
              <div className="space-y-3">
                {recentProblems.map((problem) => (
                  <div key={problem.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{problem.title}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty_level)}`}>{problem.difficulty_level}</span>
                    </div>
                    <div className="flex items-center">
                      {problem.is_solved ? (
                        <span className="text-green-600 dark:text-green-400 text-sm">✓ Solved</span>
                      ) : (
                        <Link
                          to={`/problems/${problem.id}`}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          Solve →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent problems</p>
            )}
            <div className="mt-4">
              <Link
                to="/practice"
                className="text-primary-600 hover:text-primary-700 font-medium text-sm dark:text-primary-400 dark:hover:text-primary-300"
              >
                Browse all practice problems →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

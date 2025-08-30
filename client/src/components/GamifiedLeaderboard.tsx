import React, { useState, useEffect } from 'react';
import { useGamification } from '../contexts/GamificationContext';
import {
  TrophyIcon,
  UserIcon,
  ChartBarIcon,
  SparklesIcon,
  HeartIcon,
  GiftIcon
} from '@heroicons/react/24/outline';

const GamifiedLeaderboard: React.FC = () => {
  const { leaderboard, leaderboardLoading, refreshLeaderboard } = useGamification();
  const [timeFrame, setTimeFrame] = useState<'all' | 'weekly' | 'monthly'>('all');
  const [showTopUsers, setShowTopUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load leaderboard data once on component mount
  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setError(null);
        await refreshLeaderboard();
      } catch (err) {
        setError('Failed to load leaderboard data');
        console.error('Leaderboard loading error:', err);
      }
    };
    
    loadLeaderboard();
  }, [refreshLeaderboard]); // Include refreshLeaderboard in dependencies

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <SparklesIcon className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <HeartIcon className="h-6 w-6 text-gray-400" />;
      case 3:
        return <GiftIcon className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600 dark:text-gray-400">#{rank}</span>;
    }
  };

  const getLevelColor = (level: number) => {
    if (level >= 50) return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
    if (level >= 30) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
    if (level >= 20) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    if (level >= 10) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
  };

  const getStreakText = (streak: number) => {
    if (streak >= 30) return '30+';
    if (streak >= 14) return '14+';
    if (streak >= 7) return '7+';
    if (streak >= 3) return '3+';
    return '1';
  };

  const handleRefresh = async () => {
    try {
      setError(null);
      await refreshLeaderboard();
    } catch (err) {
      setError('Failed to refresh leaderboard');
      console.error('Leaderboard refresh error:', err);
    }
  };

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-4">⚠️ {error}</div>
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (leaderboardLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading leaderboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-gray-500 text-lg mb-4">📊 No leaderboard data available</div>
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Leaderboard</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTopUsers(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showTopUsers
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Top Users
            </button>
            <button
              onClick={() => setShowTopUsers(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !showTopUsers
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              All Users
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Time</option>
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
          </select>
          
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Top 3 Users Highlight */}
      {showTopUsers && leaderboard.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 2nd Place */}
          <div className="order-2 md:order-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <HeartIcon className="h-12 w-12 text-gray-400" />
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {leaderboard[1]?.full_name || leaderboard[1]?.username}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  @{leaderboard[1]?.username}
                </p>
                <div className="text-2xl font-bold text-gray-400 mb-2">
                  Level {leaderboard[1]?.current_level}
                </div>
                <div className="text-sm text-gray-500">
                  {leaderboard[1]?.current_xp} XP
                </div>
              </div>
            </div>
          </div>

          {/* 1st Place */}
          <div className="order-1 md:order-2">
            <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-lg shadow-lg p-6 text-center relative transform scale-105">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <SparklesIcon className="h-16 w-16 text-white" />
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  {leaderboard[0]?.full_name || leaderboard[0]?.username}
                </h3>
                <p className="text-sm text-yellow-100 mb-3">
                  @{leaderboard[0]?.username}
                </p>
                <div className="text-3xl font-bold text-white mb-2">
                  Level {leaderboard[0]?.current_level}
                </div>
                <div className="text-sm text-yellow-100">
                  {leaderboard[0]?.current_xp} XP
                </div>
              </div>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="order-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <GiftIcon className="h-12 w-12 text-amber-600" />
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {leaderboard[2]?.full_name || leaderboard[2]?.username}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  @{leaderboard[2]?.username}
                </p>
                <div className="text-2xl font-bold text-amber-600 mb-2">
                  Level {leaderboard[2]?.current_level}
                </div>
                <div className="text-sm text-gray-500">
                  {leaderboard[2]?.current_xp} XP
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {showTopUsers ? 'Top Users' : 'All Users'} - {timeFrame === 'all' ? 'All Time' : timeFrame === 'weekly' ? 'This Week' : 'This Month'}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  XP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Streak
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Achievements
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {leaderboard.map((user, index) => (
                <tr key={user.username} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      {getRankIcon(index + 1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <UserIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {user.full_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(user.current_level)}`}>
                      Level {user.current_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {user.current_xp.toLocaleString()} XP
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {getStreakText(user.streak_days)} days
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <TrophyIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {user.achievements_count}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {leaderboard.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {leaderboard[0]?.current_level || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Highest Level</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {leaderboard[0]?.current_xp.toLocaleString() || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Highest XP</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {leaderboard[0]?.streak_days || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</div>
        </div>
      </div>
    </div>
  );
};

export default GamifiedLeaderboard;

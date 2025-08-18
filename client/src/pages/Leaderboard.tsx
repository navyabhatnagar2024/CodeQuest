import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../services/api';

interface LeaderboardUser {
  id: number;
  username: string;
  full_name: string;
  total_problems_solved: number;
  last_login: string;
}

const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFrame, setTimeFrame] = useState<'all' | 'weekly' | 'monthly'>('all');

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getLeaderboard({ timeFrame });
      
      if (response && response.data && response.data.success) {
        const usersArray = response.data.users || [];
        // Sort by problems solved (descending)
        const sortedUsers = usersArray.sort((a: LeaderboardUser, b: LeaderboardUser) => 
          (b.total_problems_solved || 0) - (a.total_problems_solved || 0)
        );
        setUsers(sortedUsers);
        setError(null);
      } else {
        console.error('Unexpected leaderboard API response format:', response);
        setUsers([]);
        setError('Received unexpected data format from API');
      }
    } catch (err: any) {
      console.error('Error fetching leaderboard:', err);
      setUsers([]);
      setError('Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  }, [timeFrame]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getTimeFrameLabel = (timeFrame: string) => {
    switch (timeFrame) {
      case 'weekly': return 'This Week';
      case 'monthly': return 'This Month';
      default: return 'All Time';
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-600 bg-yellow-100';
    if (rank === 2) return 'text-gray-600 bg-gray-100';
    if (rank === 3) return 'text-orange-600 bg-orange-100';
    return 'text-gray-600 bg-gray-50';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'Never') return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Leaderboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchLeaderboard}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show empty state if no users and no error
  if (!loading && !error && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
            <p className="text-gray-600">See how you rank among other coders</p>
          </div>

          <div className="text-center py-20">
            <div className="text-gray-400 text-8xl mb-6">🏆</div>
            <h3 className="text-2xl font-medium text-gray-900 mb-4">Leaderboard is Empty</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              No users have solved practice problems yet. Start solving practice problems to appear on the leaderboard!
            </p>
            <Link
              to="/practice"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              Browse Practice Problems
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
          <p className="text-gray-600">See how you rank among other coders</p>
        </div>

        {/* Time Frame Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Time' },
                { key: 'monthly', label: 'Monthly' },
                { key: 'weekly', label: 'Weekly' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTimeFrame(key as 'all' | 'weekly' | 'monthly')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    timeFrame === key
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RANK
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    USER
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PROBLEMS SOLVED
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    LAST LOGIN
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user, index) => {
                  const rank = index + 1;
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${getRankColor(rank)}`}>
                            {getRankIcon(rank)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.full_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-2xl font-bold text-gray-900">
                          {user.total_problems_solved || 0}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getTimeFrameLabel(timeFrame)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.last_login)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No users match your filter</h3>
              <p className="text-gray-600">Try adjusting your time frame or check back later.</p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {users.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-2xl font-bold text-gray-900">{users.length}</div>
              <div className="text-sm text-gray-600">Total Participants</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-2xl font-bold text-green-600">
                {users.reduce((sum, user) => sum + (user.total_problems_solved || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Problems Solved</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {users.length > 0 ? Math.round(users.reduce((sum, user) => sum + (user.total_problems_solved || 0), 0) / users.length) : 0}
              </div>
              <div className="text-sm text-gray-600">Average Problems Solved</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;

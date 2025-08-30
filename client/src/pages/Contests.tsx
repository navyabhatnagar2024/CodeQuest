import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { contestsAPI } from '../services/api';

interface Contest {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_active: boolean;
  is_public: boolean;
  max_participants: number;
  current_participants: number;
  status: 'upcoming' | 'ongoing' | 'ended';
}

const Contests: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  const fetchContests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await contestsAPI.getAll();

      // Handle the correct API response structure
      if (response && response.data && response.data.success) {
        const contestsArray = response.data.contests || [];
        const contestsWithStatus = contestsArray.map((contest: Contest) => ({
          ...contest,
          status: getContestStatus(contest.start_time, contest.end_time)
        }));
        setContests(contestsWithStatus);
        setError(null);
      } else {
        console.error('Unexpected contests API response format:', response);
        setContests([]);
        setError('Received unexpected data format from API');
      }
    } catch (err) {
      setError('Failed to fetch contests');
      console.error('Error fetching contests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContests();
  }, [fetchContests]);

  const getContestStatus = (startTime: string, endTime: string): 'upcoming' | 'ongoing' | 'ended' => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'ongoing';
    return 'ended';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600 bg-blue-100';
      case 'ongoing': return 'text-green-600 bg-green-100';
      case 'ended': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const filteredContests = contests.filter(contest => {
    if (filter === 'all') return true;
    return contest.status === filter;
  });

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
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Contests</h2>
          <p className="text-purple-200 mb-4">{error}</p>
          <button
            onClick={fetchContests}
            className="btn-primary inline-flex items-center glow-purple hover-lift"
          >
            <span className="mr-2">🔄</span>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="gamified-card border-b border-purple-200 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">🏆 Programming Contests</h1>
              <p className="text-purple-200">Compete with other programmers in timed challenges</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="xp-counter">
                <div className="text-sm text-purple-200">Total Contests</div>
                <div className="text-2xl font-bold">{contests.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Contests' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'ongoing', label: 'Ongoing' },
            { key: 'ended', label: 'Ended' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover-lift ${
                filter === key
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg glow-purple'
                  : 'bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 hover:text-white border border-purple-300/30'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Contests Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredContests.map((contest) => (
            <Link
              key={contest.id}
              to={`/contests/${contest.id}`}
              className="block interactive-card hover-lift overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white line-clamp-2 flex-1 mr-3">
                    {contest.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    contest.status === 'upcoming' ? 'text-blue-600 bg-blue-100' :
                    contest.status === 'ongoing' ? 'text-green-600 bg-green-100' :
                    'text-gray-600 bg-gray-100'
                  }`}>
                    {contest.status.charAt(0).toUpperCase() + contest.status.slice(1)}
                  </span>
                </div>

                <p className="text-purple-200 text-sm mb-4 line-clamp-3">
                  {contest.description || 'No description available.'}
                </p>

                <div className="space-y-2 text-sm text-purple-200">
                  <div className="flex items-center justify-between">
                    <span>Start:</span>
                    <span className="font-medium">{formatDate(contest.start_time)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">{formatDuration(contest.duration_minutes)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Participants:</span>
                    <span className="font-medium">
                      {contest.current_participants}/{contest.max_participants}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-purple-300/30">
                  <span className="text-purple-300 font-medium hover:text-white transition-colors">
                    View Contest →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredContests.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No contests found</h3>
            <p className="text-gray-600">Try adjusting your filters or check back later for new contests.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contests;

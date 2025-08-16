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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Contests</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchContests}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Programming Contests</h1>
          <p className="text-gray-600">Compete with other programmers in timed challenges</p>
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
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === key
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
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
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 mr-3">
                    {contest.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contest.status)}`}>
                    {contest.status.charAt(0).toUpperCase() + contest.status.slice(1)}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {contest.description || 'No description available.'}
                </p>

                <div className="space-y-2 text-sm text-gray-600">
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

                <div className="mt-4 pt-3 border-t border-gray-200">
                  <span className="text-primary-600 font-medium hover:text-primary-700">
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

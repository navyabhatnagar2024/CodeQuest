import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { contestsAPI } from '../../services/api';

interface AdminContest {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_public: boolean;
  is_active: boolean;
  created_at: string;
}

const AdminContests: React.FC = () => {
  const [contests, setContests] = useState<AdminContest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingContest, setEditingContest] = useState<AdminContest | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingContest, setDeletingContest] = useState<AdminContest | null>(null);

  const fetchContests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await contestsAPI.getAll();
      
      if (response && response.data && response.data.success) {
        const contestsArray = response.data.contests || [];
        setContests(contestsArray);
        setError(null);
      } else {
        console.error('Unexpected contests API response format:', response);
        setContests([]);
        setError('Received unexpected data format from API');
      }
    } catch (err: any) {
      console.error('Error fetching contests:', err);
      setContests([]);
      setError('Failed to fetch contests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContests();
  }, [fetchContests]);

  const handleCreateContest = () => {
    setShowCreateModal(true);
  };

  const handleEditContest = (contest: AdminContest) => {
    setEditingContest(contest);
    setShowEditModal(true);
  };

  const handleDeleteContest = (contest: AdminContest) => {
    setDeletingContest(contest);
    setShowDeleteModal(true);
  };

  const confirmDeleteContest = async () => {
    if (!deletingContest) return;
    
    try {
      await contestsAPI.delete(deletingContest.id.toString());
      await fetchContests();
      setShowDeleteModal(false);
      setDeletingContest(null);
    } catch (err: any) {
      console.error('Error deleting contest:', err);
      alert('Failed to delete contest');
    }
  };

  const filteredContests = contests.filter(contest => {
    if (filter === 'all') return true;
    if (filter === 'active') return contest.is_active;
    if (filter === 'inactive') return !contest.is_active;
    if (filter === 'public') return contest.is_public;
    if (filter === 'private') return !contest.is_public;
    return true;
  });

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

  const getVisibilityColor = (isPublic: boolean) => {
    return isPublic 
      ? 'text-green-600 bg-green-100' 
      : 'text-purple-600 bg-purple-100';
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Contests</h1>
              <p className="text-gray-600">Create and manage programming contests</p>
            </div>
            <button 
              onClick={handleCreateContest}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              + Create Contest
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Contests' },
            { key: 'active', label: 'Active' },
            { key: 'inactive', label: 'Inactive' },
            { key: 'public', label: 'Public' },
            { key: 'private', label: 'Private' }
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

        {/* Contests Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visibility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContests.length > 0 ? (
                  filteredContests.map((contest) => {
                    const status = getContestStatus(contest.start_time, contest.end_time);
                    return (
                      <tr key={contest.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{contest.title}</div>
                            <div className="text-sm text-gray-500">{contest.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVisibilityColor(contest.is_public)}`}>
                            {contest.is_public ? 'Public' : 'Private'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDuration(contest.duration_minutes)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(contest.start_time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEditContest(contest)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteContest(contest)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="text-gray-400 text-6xl mb-4">🏆</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No contests found</h3>
                      <p className="text-gray-600">Create your first contest to get started!</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {filteredContests.length === 0 && contests.length > 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No contests match your filter</h3>
            <p className="text-gray-600">Try adjusting your filter criteria</p>
          </div>
        )}

        {/* Create Contest Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create Contest</h3>
                <p className="text-sm text-gray-500 mb-4">Contest creation functionality coming soon!</p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Contest Modal */}
        {showEditModal && editingContest && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Contest</h3>
                <p className="text-sm text-gray-500 mb-4">Editing contest: {editingContest.title}</p>
                <p className="text-sm text-gray-500 mb-4">Edit functionality coming soon!</p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Contest Modal */}
        {showDeleteModal && deletingContest && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Contest</h3>
                <p className="text-sm text-gray-500 mb-4">Are you sure you want to delete "{deletingContest.title}"?</p>
                <p className="text-sm text-red-500 mb-4">This action cannot be undone.</p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteContest}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContests;

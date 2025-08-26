import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { submissionsAPI } from '../services/api';

interface Submission {
  id: number;
  problem_title: string;
  language: string;
  status: string;
  submitted_at: string;
  score: number;
  execution_time: number;
  memory_used: number;
  test_cases_passed: number;
  total_test_cases: number;
}

const Submissions: React.FC = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch recent submissions
      const submissionsResponse = await submissionsAPI.getMySubmissions();

      // Handle the correct API response structure
      if (submissionsResponse && submissionsResponse.data && submissionsResponse.data.success) {
        const submissionsArray = submissionsResponse.data.submissions || [];
        setSubmissions(submissionsArray);
        setTotalPages(Math.ceil(submissionsArray.length / itemsPerPage));
        setError(null);
      } else if (submissionsResponse && submissionsResponse.data) {
        // Handle case where data is directly in response.data
        const submissionsArray = Array.isArray(submissionsResponse.data) ? submissionsResponse.data : [];
        setSubmissions(submissionsArray);
        setTotalPages(Math.ceil(submissionsArray.length / itemsPerPage));
        setError(null);
      } else {
        // No submissions found - this is not an error, just empty state
        setSubmissions([]);
        setTotalPages(1);
        setError(null);
      }
    } catch (err: any) {
      console.error('Submissions fetch error:', err);
      // Check if it's a 404 or no submissions error
      if (err.response?.status === 404 || err.message?.includes('not found')) {
        setSubmissions([]);
        setTotalPages(1);
        setError(null);
      } else {
        setSubmissions([]);
        setTotalPages(1);
        setError('Failed to fetch submissions');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user, currentPage, filter, fetchSubmissions]);

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
      case 'compilation error':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getLanguageColor = (language: string) => {
    switch (language.toLowerCase()) {
      case 'cpp': return 'text-blue-600 bg-blue-100';
      case 'java': return 'text-orange-600 bg-orange-100';
      case 'python': return 'text-green-600 bg-green-100';
      case 'javascript': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatExecutionTime = (time: number) => {
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  const formatMemory = (memory: number) => {
    if (memory < 1024) return `${memory}KB`;
    return `${(memory / 1024).toFixed(2)}MB`;
  };

  const filteredSubmissions = submissions.filter(submission => {
    if (filter === 'all') return true;
    return submission.status.toLowerCase().includes(filter.toLowerCase());
  });

  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Show empty state if no submissions and no error
  if (!loading && !error && submissions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Submissions</h1>
            <p className="text-gray-600">Track your coding progress and submission history</p>
          </div>

          <div className="text-center py-20">
            <div className="text-gray-400 text-8xl mb-6">📝</div>
            <h3 className="text-2xl font-medium text-gray-900 mb-4">No Submissions Yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven't submitted any solutions yet. Start solving practice problems to see your submission history here!
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Submissions</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSubmissions}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Submissions</h1>
          <p className="text-gray-600">Track your coding progress and submission history</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Submissions' },
            { key: 'accepted', label: 'Accepted' },
            { key: 'wrong answer', label: 'Wrong Answer' },
            { key: 'time limit exceeded', label: 'Time Limit' },
            { key: 'runtime error', label: 'Runtime Error' },
            { key: 'compilation error', label: 'Compilation Error' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === key
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Problem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Language
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test Cases
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Memory
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/problems/${submission.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {submission.problem_title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getLanguageColor(submission.language)}`}>
                        {submission.language}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission.status)}`}>
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {submission.score > 0 ? submission.score : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {submission.test_cases_passed}/{submission.total_test_cases}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {submission.execution_time ? formatExecutionTime(submission.execution_time) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {submission.memory_used ? formatMemory(submission.memory_used) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(submission.submitted_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paginatedSubmissions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No submissions found</h3>
              <p className="text-gray-600">Try adjusting your filters or start solving practice problems to see submissions here.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredSubmissions.length)} of {filteredSubmissions.length} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 border rounded-md text-sm font-medium ${currentPage === page
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {submissions.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-2xl font-bold text-gray-900">{submissions.length}</div>
              <div className="text-sm text-gray-600">Total Submissions</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-2xl font-bold text-green-600">
                {submissions.filter(s => s.status.toLowerCase() === 'accepted').length}
              </div>
              <div className="text-sm text-gray-600">Accepted</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-2xl font-bold text-red-600">
                {submissions.filter(s => s.status.toLowerCase() !== 'accepted').length}
              </div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {submissions.length > 0 ? Math.round((submissions.filter(s => s.status.toLowerCase() === 'accepted').length / submissions.length) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Submissions;

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { problemsAPI } from '../services/api';

interface Problem {
  id: number;
  title: string;
  difficulty_level: string;
  time_limit_ms: number;
  memory_limit_mb: number;
  total_problems_solved: number;
  is_active: boolean;
}

const Problems: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  const fetchProblems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await problemsAPI.getAll();
      console.log("Problems API response:", response);
      
      // Handle the correct API response structure
      if (response && response.data && response.data.success) {
        if (Array.isArray(response.data.problems)) {
          setProblems(response.data.problems);
          setError(null);
        } else {
          console.error('Problems array not found in response:', response.data);
          setProblems([]);
          setError('No problems data found in API response');
        }
      } else {
        console.error('Unexpected API response format:', response);
        setProblems([]);
        setError('Received unexpected data format from API');
      }
    } catch (err) {
      console.error('Error fetching problems:', err);
      setProblems([]);
      setError('Failed to fetch problems. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Ensure problems is always an array before filtering
  const filteredProblems = Array.isArray(problems) ? problems.filter(problem => {
    if (filter === 'all') return true;
    return problem.difficulty_level.toLowerCase() === filter;
  }) : [];

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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Problems</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchProblems}
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Coding Problems</h1>
          <p className="text-gray-600">Practice with our collection of programming challenges</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['all', 'easy', 'medium', 'hard'].map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => setFilter(difficulty)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === difficulty
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </button>
          ))}
        </div>

        {/* Problems Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProblems.map((problem) => (
            <Link
              key={problem.id}
              to={`/problems/${problem.id}`}
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {problem.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty_level)}`}>
                    {problem.difficulty_level}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="w-20">Time:</span>
                    <span className="font-medium">{problem.time_limit_ms}ms</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-20">Memory:</span>
                    <span className="font-medium">{problem.memory_limit_mb}MB</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-20">Solved:</span>
                    <span className="font-medium">{problem.total_problems_solved}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200">
                  <span className="text-primary-600 font-medium hover:text-primary-700">
                    View Problem →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredProblems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No problems found</h3>
            <p className="text-gray-600">Try adjusting your filters or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Problems;

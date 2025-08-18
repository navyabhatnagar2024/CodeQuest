import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../services/api';

interface LeetCodeSuggestion {
  id: number;
  title: string;
  description: string;
  difficulty_level: string;
  topic_tags: string[];
  problem_statement: string;
  input_format: string;
  output_format: string;
  constraints: string;
  examples: string[];
  hints: string;
  source_problem_id: string;
  time_limit_ms: number;
  memory_limit_mb: number;
  created_at: string;
  isAlreadyAdded?: boolean;
}

interface LeetCodeSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProblemAdded: () => void;
}

const LeetCodeSuggestionsModal: React.FC<LeetCodeSuggestionsModalProps> = ({
  isOpen,
  onClose,
  onProblemAdded
}) => {
  const [suggestions, setSuggestions] = useState<LeetCodeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [topics, setTopics] = useState<string[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSuggestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page,
        limit: 20,
        search: search || undefined,
        difficulty: difficulty !== 'all' ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase() : undefined,
        topics: topics.length > 0 ? topics.join(',') : undefined
      };

      const response = await adminAPI.getLeetCodeSuggestions(params);
      
      if (response.data.success) {
        setSuggestions(response.data.suggestions);
        setTotalPages(response.data.pagination.pages);
      } else {
        setError('Failed to fetch suggestions');
      }
    } catch (err: any) {
      console.error('Error fetching suggestions:', err);
      setError(err.response?.data?.message || 'Failed to fetch suggestions');
    } finally {
      setLoading(false);
    }
  }, [search, difficulty, topics, page]);

  const fetchTopics = useCallback(async () => {
    try {
      const response = await adminAPI.getLeetCodeTopics();
      if (response.data.success) {
        setAvailableTopics(response.data.topics);
      }
    } catch (err) {
      console.error('Error fetching topics:', err);
    }
  }, []);



  const addSuggestion = async (suggestionId: number) => {
    try {
      setAdding(suggestionId);
      setError(null);
      
      const response = await adminAPI.addLeetCodeSuggestion(suggestionId);
      
      if (response.data.success) {
        alert(`Successfully added "${response.data.message}" to problems!`);
        await fetchSuggestions();
        onProblemAdded();
      } else {
        setError('Failed to add problem');
      }
    } catch (err: any) {
      console.error('Error adding suggestion:', err);
      setError(err.response?.data?.message || 'Failed to add problem');
    } finally {
      setAdding(null);
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

  const toggleTopic = (topic: string) => {
    setTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
    setPage(1);
  };

  useEffect(() => {
    if (isOpen) {
      fetchSuggestions();
      fetchTopics();
    }
  }, [isOpen, fetchSuggestions, fetchTopics]);

  // Removed auto-search useEffect - now only searches when button is clicked

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">LeetCode Problem Suggestions</h3>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="mb-6 space-y-4">
            {/* Search */}
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search problems by title or description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && fetchSuggestions()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={fetchSuggestions}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    🔍
                  </button>
                </div>
              </div>
              <button
                onClick={() => setSearch('')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
            </div>

            {/* Difficulty Filter */}
            <div className="flex gap-2">
              {['all', 'easy', 'medium', 'hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    difficulty === diff
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {diff === 'all' ? 'All Difficulties' : diff.charAt(0).toUpperCase() + diff.slice(1)}
                </button>
              ))}
            </div>

            {/* Topic Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Topics:</label>
              <div className="flex flex-wrap gap-2">
                {availableTopics.slice(0, 20).map((topic) => (
                  <button
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      topics.includes(topic)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
                {topics.length > 0 && (
                  <button
                    onClick={() => setTopics([])}
                    className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Suggestions List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No suggestions found</h3>
                             <p className="text-gray-600 mb-4">
                 {search || difficulty !== 'all' || topics.length > 0 
                   ? 'Try adjusting your filter criteria'
                   : 'Run the manual script to populate suggestions from LeetCode'
                 }
               </p>
                             {!search && difficulty === 'all' && topics.length === 0 && (
                 <div className="text-center">
                   <p className="text-gray-500 mb-2">
                     Run the manual script to populate suggestions
                   </p>
                   <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                     python manual_leetscrape.py
                   </code>
                 </div>
               )}
            </div>
          ) : (
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${
                    suggestion.isAlreadyAdded ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{suggestion.title}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(suggestion.difficulty_level)}`}>
                          {suggestion.difficulty_level}
                        </span>
                        <span className="text-sm text-gray-500">#{suggestion.source_problem_id}</span>
                        {suggestion.isAlreadyAdded && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Added
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">{suggestion.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {suggestion.topic_tags?.slice(0, 5).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                        {suggestion.topic_tags && suggestion.topic_tags.length > 5 && (
                          <span className="text-xs text-gray-500">
                            +{suggestion.topic_tags.length - 5} more
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-gray-500">
                        <span>Time: {suggestion.time_limit_ms}ms</span>
                        <span className="mx-2">•</span>
                        <span>Memory: {suggestion.memory_limit_mb}MB</span>
                      </div>
                    </div>

                    <button
                      onClick={() => addSuggestion(suggestion.id)}
                      disabled={adding === suggestion.id || suggestion.isAlreadyAdded}
                      className={`ml-4 px-4 py-2 rounded-lg transition-colors ${
                        suggestion.isAlreadyAdded
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      } disabled:opacity-50`}
                    >
                      {suggestion.isAlreadyAdded 
                        ? 'Already Added' 
                        : adding === suggestion.id 
                          ? 'Adding...' 
                          : 'Add Problem'
                      }
                    </button>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <span className="px-3 py-2 text-gray-700">
                    Page {page} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeetCodeSuggestionsModal;

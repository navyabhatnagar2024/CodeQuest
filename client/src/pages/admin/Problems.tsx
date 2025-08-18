import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import LeetCodeSuggestionsModal from '../../components/LeetCodeSuggestionsModal';

interface AdminProblem {
  id: number;
  title: string;
  description: string;
  difficulty_level: string;
  topic_tags: string[];
  time_limit_ms: number;
  memory_limit_mb: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  author_id: number;
  source_platform: string;
  source_problem_id: string;
}

interface CreateProblemForm {
  title: string;
  description: string;
  difficulty_level: string;
  problem_statement: string;
  input_format: string;
  output_format: string;
  constraints: string;
  examples: string;
  hints: string;
  time_limit_ms: number;
  memory_limit_mb: number;
  topic_tags: string[];
}

const AdminProblems: React.FC = () => {
  const [problems, setProblems] = useState<AdminProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLeetCodeModal, setShowLeetCodeModal] = useState(false);
  const [editingProblem, setEditingProblem] = useState<AdminProblem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProblem, setDeletingProblem] = useState<AdminProblem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [createForm, setCreateForm] = useState<CreateProblemForm>({
    title: '',
    description: '',
    difficulty_level: 'Easy',
    problem_statement: '',
    input_format: '',
    output_format: '',
    constraints: '',
    examples: '',
    hints: '',
    time_limit_ms: 1000,
    memory_limit_mb: 256,
    topic_tags: []
  });



  const fetchProblems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllProblems({
        search: search || undefined,
        difficulty: filter !== 'all' ? filter : undefined,
        status: filter === 'active' ? 'active' : filter === 'inactive' ? 'inactive' : undefined
      });
      
      if (response && response.data && response.data.success) {
        setProblems(response.data.problems || []);
        setError(null);
      } else {
        console.error('Unexpected problems API response format:', response);
        setProblems([]);
        setError('Received unexpected data format from API');
      }
    } catch (err: any) {
      console.error('Error fetching problems:', err);
      setProblems([]);
      setError('Failed to fetch problems');
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies - only runs when explicitly called

  useEffect(() => {
    fetchProblems();
  }, []); // Empty dependency array - only runs once on mount

  const handleCreateProblem = () => {
    setShowCreateModal(true);
    setCreateForm({
      title: '',
      description: '',
      difficulty_level: 'Easy',
      problem_statement: '',
      input_format: '',
      output_format: '',
      constraints: '',
      examples: '',
      hints: '',
      time_limit_ms: 1000,
      memory_limit_mb: 256,
      topic_tags: []
    });
  };

  const handleEditProblem = (problem: AdminProblem) => {
    setEditingProblem(problem);
    setCreateForm({
      title: problem.title,
      description: problem.description,
      difficulty_level: problem.difficulty_level,
      problem_statement: problem.description, // Using description as problem statement
      input_format: '',
      output_format: '',
      constraints: '',
      examples: '',
      hints: '',
      time_limit_ms: problem.time_limit_ms,
      memory_limit_mb: problem.memory_limit_mb,
      topic_tags: problem.topic_tags || []
    });
    setShowEditModal(true);
  };

  const handleDeleteProblem = (problem: AdminProblem) => {
    setDeletingProblem(problem);
    setShowDeleteModal(true);
  };

  const handleDeactivateProblem = async (problem: AdminProblem) => {
    try {
      setSubmitting(true);
      const newActiveState = !problem.is_active;
      
      await adminAPI.updateProblem(problem.id.toString(), {
        ...problem,
        is_active: newActiveState
      });
      
      await fetchProblems();
      alert(`Problem ${newActiveState ? 'activated' : 'deactivated'} successfully`);
    } catch (err: any) {
      console.error('Error updating problem status:', err);
      alert(err.response?.data?.message || 'Failed to update problem status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShowLeetCodeModal = () => {
    setShowLeetCodeModal(true);
  };

  const confirmDeleteProblem = async () => {
    if (!deletingProblem) return;
    
    try {
      setSubmitting(true);
      const response = await adminAPI.deleteProblem(deletingProblem.id.toString());
      
      // Check if deletion was successful
      if (response.data.success) {
        await fetchProblems();
        setShowDeleteModal(false);
        setDeletingProblem(null);
        alert(`Problem "${deletingProblem.title}" and all related data deleted successfully!`);
      } else {
        // Handle case where deletion failed but API didn't throw error
        alert(response.data.message || 'Failed to delete problem');
      }
    } catch (err: any) {
      console.error('Error deleting problem:', err);
      alert(err.response?.data?.message || 'Failed to delete problem');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      if (showEditModal && editingProblem) {
        // Update existing problem
        await adminAPI.updateProblem(editingProblem.id.toString(), createForm);
        setShowEditModal(false);
        setEditingProblem(null);
      } else {
        // Create new problem
        await adminAPI.createProblem(createForm);
        setShowCreateModal(false);
      }
      
      // Reset form
      setCreateForm({
        title: '',
        description: '',
        difficulty_level: 'Easy',
        problem_statement: '',
        input_format: '',
        output_format: '',
        constraints: '',
        examples: '',
        hints: '',
        time_limit_ms: 1000,
        memory_limit_mb: 256,
        topic_tags: []
      });
      
      // Refresh problems list
      await fetchProblems();
      
    } catch (err: any) {
      console.error('Error saving problem:', err);
      alert(err.response?.data?.message || 'Failed to save problem');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearch = () => {
    fetchProblems();
  };


  const filteredProblems = problems.filter(problem => {
    if (filter === 'all') return true;
    if (filter === 'active') return problem.is_active;
    if (filter === 'inactive') return !problem.is_active;
    if (['easy', 'medium', 'hard'].includes(filter)) {
      return problem.difficulty_level.toLowerCase() === filter;
    }
    return true;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'text-green-600 bg-green-100' 
      : 'text-red-600 bg-red-100';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const addTopicTag = () => {
    const newTag = prompt('Enter new topic tag:');
    if (newTag && newTag.trim()) {
      setCreateForm(prev => ({
        ...prev,
        topic_tags: [...prev.topic_tags, newTag.trim()]
      }));
    }
  };

  const removeTopicTag = (index: number) => {
    setCreateForm(prev => ({
      ...prev,
      topic_tags: prev.topic_tags.filter((_, i) => i !== index)
    }));
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Problems</h1>
              <p className="text-gray-600">Create, edit, and manage coding problems</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleShowLeetCodeModal}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                + Add More (LeetCode)
              </button>
              <button 
                onClick={handleCreateProblem}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                + Create Problem
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
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
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
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

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Problems' },
              { key: 'active', label: 'Active' },
              { key: 'inactive', label: 'Inactive' },
              { key: 'easy', label: 'Easy' },
              { key: 'medium', label: 'Medium' },
              { key: 'hard', label: 'Hard' }
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
        </div>

        {/* Problems Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Problem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProblems.length > 0 ? (
                  filteredProblems.map((problem) => (
                    <tr key={problem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{problem.title}</div>
                          <div className="text-sm text-gray-500">ID: {problem.id}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {problem.topic_tags?.slice(0, 3).join(', ')}
                            {problem.topic_tags && problem.topic_tags.length > 3 && '...'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty_level)}`}>
                          {problem.difficulty_level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {problem.source_platform || 'Manual'}
                        </div>
                        {problem.source_problem_id && (
                          <div className="text-xs text-gray-500">
                            ID: {problem.source_problem_id}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(problem.is_active)}`}>
                          {problem.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(problem.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditProblem(problem)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Edit
                          </button>
                                                     <button 
                             onClick={() => handleDeactivateProblem(problem)}
                             className={problem.is_active ? "text-yellow-600 hover:text-yellow-900" : "text-green-600 hover:text-green-900"}
                             title={problem.is_active ? "Deactivate problem (hide from users)" : "Activate problem (show to users)"}
                           >
                             {problem.is_active ? 'Deactivate' : 'Activate'}
                           </button>
                          <button 
                            onClick={() => handleDeleteProblem(problem)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="text-gray-400 text-6xl mb-4">📝</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No problems found</h3>
                      <p className="text-gray-600">Create your first coding problem to get started!</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {filteredProblems.length === 0 && problems.length > 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No problems match your filter</h3>
            <p className="text-gray-600">Try adjusting your filter criteria</p>
          </div>
        )}

        {/* Create/Edit Problem Modal */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {showEditModal ? 'Edit Problem' : 'Create New Problem'}
                </h3>
                
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                      <input
                        type="text"
                        required
                        value={createForm.title}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty *</label>
                      <select
                        required
                        value={createForm.difficulty_level}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, difficulty_level: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                      required
                      rows={3}
                      value={createForm.description}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Problem Statement *</label>
                    <textarea
                      required
                      rows={6}
                      value={createForm.problem_statement}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, problem_statement: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Detailed problem description, examples, and constraints..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (ms) *</label>
                      <input
                        type="number"
                        required
                        min="100"
                        max="10000"
                        value={createForm.time_limit_ms}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, time_limit_ms: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Memory Limit (MB) *</label>
                      <input
                        type="number"
                        required
                        min="16"
                        max="1024"
                        value={createForm.memory_limit_mb}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, memory_limit_mb: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Topic Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {createForm.topic_tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTopicTag(index)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={addTopicTag}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add Topic Tag
                    </button>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setShowEditModal(false);
                        setEditingProblem(null);
                      }}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
                    >
                      {submitting ? 'Saving...' : (showEditModal ? 'Update Problem' : 'Create Problem')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

                {/* LeetCode Suggestions Modal */}
        <LeetCodeSuggestionsModal
          isOpen={showLeetCodeModal}
          onClose={() => setShowLeetCodeModal(false)}
          onProblemAdded={fetchProblems}
        />

        {/* Delete Problem Modal */}
        {showDeleteModal && deletingProblem && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Problem</h3>
                <p className="text-sm text-gray-500 mb-4">Are you sure you want to delete "{deletingProblem.title}"?</p>
                <p className="text-sm text-red-500 mb-4">This action cannot be undone.</p>
                                 <p className="text-xs text-red-500 mb-4">
                   ⚠️ WARNING: This will permanently delete the problem and ALL related data including test cases and submissions!
                 </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteProblem}
                    disabled={submitting}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {submitting ? 'Deleting...' : 'Delete'}
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

export default AdminProblems;

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { problemsAPI } from '../services/api';
import CodeEditor from '../components/CodeEditor';

interface Problem {
  id: number;
  title: string;
  problem_statement: string;
  difficulty_level: string;
  time_limit_ms: number;
  memory_limit_mb: number;
  total_problems_solved: number;
  is_active: boolean;
}

interface TestCase {
  id: number;
  input: string;
  expected_output: string;
  weight: number;
  is_sample: boolean;
}

const ProblemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  const languages = [
    { id: 'cpp', name: 'C++', extension: '.cpp' },
    { id: 'java', name: 'Java', extension: '.java' },
    { id: 'python', name: 'Python', extension: '.py' },
    { id: 'javascript', name: 'JavaScript', extension: '.js' },
  ];

  const fetchProblem = useCallback(async () => {
    try {
      const response = await problemsAPI.getById(id!);
      setProblem(response.data);
    } catch (err) {
      setError('Failed to fetch problem');
      console.error('Error fetching problem:', err);
    }
  }, [id]);

  const fetchTestCases = useCallback(async () => {
    try {
      // For now, we'll use sample test cases from the problem
      // In a real implementation, you'd fetch test cases from the backend
      setTestCases([
        {
          id: 1,
          input: "5\n1 2 3 4 5",
          expected_output: "15",
          weight: 1,
          is_sample: true
        }
      ]);
    } catch (err) {
      console.error('Error fetching test cases:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchProblem();
      fetchTestCases();
    }
  }, [id, fetchProblem, fetchTestCases]);

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert('Please write some code before submitting');
      return;
    }

    try {
      setSubmitting(true);
      setSubmissionResult(null);

      const response = await problemsAPI.submit(id!, {
        language,
        code: code
      });

      setSubmissionResult(response.data);
      
      // Show success message
      alert('Solution submitted successfully! Check your submissions for results.');
      
    } catch (err: any) {
      console.error('Submission error:', err);
      alert(err.response?.data?.message || 'Failed to submit solution');
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string | undefined) => {
    if (!difficulty) return 'text-gray-600 bg-gray-100';
    
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Problem Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The problem you are looking for does not exist.'}</p>
          <button 
            onClick={() => navigate('/problems')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Problems
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Problem Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{problem.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className={`px-3 py-1 rounded-full font-medium ${getDifficultyColor(problem.difficulty_level)}`}>
                  {problem.difficulty_level}
                </span>
                <span>Time Limit: {problem.time_limit_ms}ms</span>
                <span>Memory Limit: {problem.memory_limit_mb}MB</span>
                <span>Solved: {problem.total_problems_solved}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/problems')}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back to Problems
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problem Description */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Problem Description</h2>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-700">
                {problem.problem_statement || 'No problem statement available.'}
              </div>
            </div>

            {/* Sample Test Cases */}
            {testCases.filter(tc => tc.is_sample).length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Sample Test Cases</h3>
                {testCases.filter(tc => tc.is_sample).map((testCase, index) => (
                  <div key={testCase.id} className="bg-gray-50 rounded-lg p-4 mb-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Input {index + 1}:</h4>
                        <pre className="bg-white p-3 rounded border text-sm overflow-x-auto">
                          {testCase.input}
                        </pre>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Expected Output:</h4>
                        <pre className="bg-white p-3 rounded border text-sm overflow-x-auto">
                          {testCase.expected_output}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Code Editor */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Your Solution</h2>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {languages.map(lang => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="border border-gray-300 rounded-lg overflow-hidden mb-4">
              <CodeEditor
                language={language}
                value={code}
                onChange={setCode}
                height="400px"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Solution'}
              </button>
              <button
                onClick={() => setCode('')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>

            {submissionResult && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <div className="text-green-600 mr-2">✅</div>
                  <span className="text-green-800 font-medium">Solution submitted successfully!</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  Check your submissions page for detailed results.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;

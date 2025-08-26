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
  constraints?: string;
  topic_tags?: string[];
}

const ProblemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [submitting, setSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const languages = [
    { id: 'c', name: 'C', extension: '.c' },
    { id: 'cpp', name: 'C++', extension: '.cpp' },
    { id: 'java', name: 'Java', extension: '.java' },
    { id: 'python', name: 'Python', extension: '.py' },
    { id: 'javascript', name: 'JavaScript', extension: '.js' }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);

  const startTimer = () => {
    setTimerActive(true);
    setTimerSeconds(0);
  };

  const stopTimer = () => {
    setTimerActive(false);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (id && !timerActive) {
      startTimer();
    }
  }, [id, timerActive]);

  const fetchProblem = useCallback(async () => {
    try {
      const response = await problemsAPI.getById(id!);
      if (response.data && response.data.success) {
        setProblem(response.data.problem);
      } else {
        setError('Invalid problem data received');
      }
    } catch (err) {
      setError('Failed to fetch problem');
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProblem();
    }
  }, [id, fetchProblem]);

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert('Please write some code before submitting');
      return;
    }
    try {
      setSubmitting(true);
      const response = await problemsAPI.submit(id!, {
        language,
        code: code
      });
      if (response.data.results) {
        setTestResults(response.data.results.test_cases);
      }
      alert(`Solution submitted successfully! Status: ${response.data.status}. Passed: ${response.data.results?.passed || 0}/${response.data.results?.total || 0} test cases.`);
    } catch (err: any) {
      alert('Failed to submit solution');
    } finally {
      setSubmitting(false);
    }
  };

  // UI rendering
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
            onClick={() => navigate('/practice')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Problems
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Problem Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{problem.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                <span className="px-3 py-1 rounded-full font-medium bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-100">
                  {problem.difficulty_level}
                </span>
                <span>Time Limit: {problem.time_limit_ms}ms</span>
                <span>Memory Limit: {problem.memory_limit_mb}MB</span>
                {Array.isArray(problem.topic_tags) && problem.topic_tags.length > 0 && (
                  <span>Topics: {problem.topic_tags.join(', ')}</span>
                )}
                <span>Solved: {problem.total_problems_solved || 0}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/practice')}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back to Practice
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problem Description */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">Problem Description</h2>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div
                className="problem-content text-base text-gray-800 dark:text-white"
                dangerouslySetInnerHTML={{
                  __html: problem.problem_statement || 'No problem statement available.'
                }}
              />
            </div>
          </div>

          {/* Code Editor */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Solution</h2>
              <div className="flex items-center gap-4">
                {/* Timer Display */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 border border-blue-200 dark:border-gray-700 rounded-lg px-4 py-3 shadow-sm">
                  <div className="text-center">
                    <div className="text-xs text-blue-600 dark:text-blue-300 font-medium mb-1">Timer</div>
                    <div className="text-lg font-mono text-blue-800 dark:text-blue-200 font-bold">
                      {formatTime(timerSeconds)}
                    </div>
                    <div className="flex gap-1 mt-2">
                      {timerActive ? (
                        <button
                          onClick={stopTimer}
                          className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 px-3 py-1.5 rounded-md hover:bg-red-200 dark:hover:bg-red-800 transition-colors font-medium"
                        >
                          Stop
                        </button>
                      ) : (
                        <button
                          onClick={startTimer}
                          className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 px-3 py-1.5 rounded-md hover:bg-green-200 dark:hover:bg-green-800 transition-colors font-medium"
                        >
                          Start
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 dark:text-white"
                >
                  {languages.map(lang => (
                    <option key={lang.id} value={lang.id}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden mb-6 shadow-sm">
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
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              >
                {submitting ? 'Submitting...' : 'Submit Solution'}
              </button>
              <button
                onClick={() => setCode('')}
                className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-white rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;
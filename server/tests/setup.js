const path = require('path');
const fs = require('fs');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_PATH = ':memory:'; // Use in-memory database for tests
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.REFRESH_TOKEN_EXPIRES_IN = '7d';

// Create test data directory if it doesn't exist
const testDataDir = path.join(__dirname, '..', '..', 'test-data');
if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir, { recursive: true });
}

// Global test utilities
global.testUtils = {
    // Generate test user data
    generateTestUser: (overrides = {}) => ({
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'testpassword123',
        role: 'user',
        ...overrides
    }),

    // Generate test problem data
    generateTestProblem: (overrides = {}) => ({
        title: `Test Problem ${Date.now()}`,
        description: 'This is a test problem description.',
        difficulty: 'easy',
        time_limit: 1000,
        memory_limit: 256,
        topic_tags: JSON.stringify(['array', 'test']),
        examples: JSON.stringify([
            {
                input: '[1,2,3]\n6',
                output: '[0,2]',
                explanation: 'Test explanation'
            }
        ]),
        constraints: JSON.stringify(['1 <= n <= 100']),
        solution_template: JSON.stringify({
            'javascript': 'function solution(nums, target) { return []; }'
        }),
        is_published: true,
        ...overrides
    }),

    // Generate test contest data
    generateTestContest: (overrides = {}) => ({
        title: `Test Contest ${Date.now()}`,
        description: 'This is a test contest description.',
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        duration: 60,
        max_participants: 100,
        registration_deadline: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
        is_published: true,
        scoring_rules: JSON.stringify({
            penalty_per_wrong_submission: 10,
            points_per_problem: 100
        }),
        ...overrides
    }),

    // Generate test submission data
    generateTestSubmission: (overrides = {}) => ({
        user_id: 1,
        problem_id: 1,
        contest_id: null,
        language: 'javascript',
        source_code: 'function solution(nums, target) { return [0, 1]; }',
        status: 'pending',
        execution_time: null,
        memory_used: null,
        score: null,
        ...overrides
    }),

    // Wait for a specified time
    wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

    // Clean up test data
    cleanupTestData: async (database) => {
        const tables = [
            'notifications', 'user_sessions', 'leaderboards', 'submissions',
            'contest_registrations', 'contest_problems', 'test_cases',
            'contests', 'problems', 'user_statistics', 'problem_statistics',
            'users', 'system_settings'
        ];

        for (const table of tables) {
            await database.run(`DELETE FROM ${table}`);
        }
    }
};

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
beforeAll(() => {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
});

afterAll(() => {
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
});

// Global test timeout
jest.setTimeout(10000);

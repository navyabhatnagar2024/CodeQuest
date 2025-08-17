const express = require('express');
const { query, validationResult } = require('express-validator');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const externalProblemsService = require('../services/externalProblemsService');

const router = express.Router();

// Validation middleware
const validateProblemQuery = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('difficulty')
        .optional()
        .isIn(['Easy', 'Medium', 'Hard'])
        .withMessage('Difficulty must be Easy, Medium, or Hard'),
    query('topics')
        .optional()
        .isString()
        .withMessage('Topics must be a string'),
    query('search')
        .optional()
        .isLength({ min: 1 })
        .withMessage('Search term must not be empty')
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            message: 'Please check your input',
            details: errors.array()
        });
    }
    next();
};

// Get all problems with filtering
router.get('/', optionalAuth, validateProblemQuery, handleValidationErrors, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            difficulty,
            topics,
            search
        } = req.query;

        // Parse topics if provided
        let parsedTopics = [];
        if (topics) {
            try {
                parsedTopics = JSON.parse(topics);
            } catch (e) {
                parsedTopics = topics.split(',').map(t => t.trim());
            }
        }

        const filters = {
            page: parseInt(page),
            limit: parseInt(limit),
            difficulty,
            topics: parsedTopics,
            search
        };

        const result = await externalProblemsService.getProblems(filters);
        
        // Add test cases to each problem
        if (result.success && result.problems) {
            for (const problem of result.problems) {
                try {
                    const testCases = await req.app.locals.database.all(
                        'SELECT * FROM test_cases WHERE problem_id = ? ORDER BY is_sample DESC, id ASC',
                        [problem.id]
                    );
                    problem.test_cases = testCases;
                } catch (error) {
                    console.error(`Error fetching test cases for problem ${problem.id}:`, error);
                    problem.test_cases = [];
                }
            }
        }

        res.json(result);

    } catch (error) {
        console.error('Get problems error:', error);
        res.status(500).json({
            error: 'Failed to get problems',
            message: error.message
        });
    }
});

// Get problem by ID
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const problem = await req.app.locals.database.get(
            'SELECT * FROM problems WHERE id = ? AND is_active = 1',
            [id]
        );

        if (!problem) {
            return res.status(404).json({
                error: 'Problem not found',
                message: 'The requested problem does not exist'
            });
        }

        // Parse topic tags
        try {
            problem.topic_tags = JSON.parse(problem.topic_tags);
        } catch (e) {
            problem.topic_tags = [];
        }

        // Parse examples
        try {
            problem.examples = JSON.parse(problem.examples);
        } catch (e) {
            problem.examples = [];
        }

        res.json({
            success: true,
            problem
        });

    } catch (error) {
        console.error('Get problem error:', error);
        res.status(500).json({
            error: 'Failed to get problem',
            message: error.message
        });
    }
});

// Get available topics
router.get('/topics/available', optionalAuth, async (req, res) => {
    try {
        const topics = await externalProblemsService.getAvailableTopics();
        res.json({
            success: true,
            topics
        });
    } catch (error) {
        console.error('Get topics error:', error);
        res.status(500).json({
            error: 'Failed to get topics',
            message: error.message
        });
    }
});

// Sync external problems (admin only)
router.post('/sync', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.is_admin) {
            return res.status(403).json({
                error: 'Access denied',
                message: 'Admin privileges required'
            });
        }

        const result = await externalProblemsService.syncProblemsToDatabase();
        res.json({
            success: true,
            message: 'Problems synced successfully',
            ...result
        });

    } catch (error) {
        console.error('Sync problems error:', error);
        res.status(500).json({
            error: 'Failed to sync problems',
            message: error.message
        });
    }
});

// Submit solution to problem
router.post('/:id/submit', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { code, language } = req.body;

        if (!code || !language) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'Code and language are required'
            });
        }

        // Check if problem exists
        const problem = await req.app.locals.database.get(
            'SELECT * FROM problems WHERE id = ? AND is_active = 1',
            [id]
        );

        if (!problem) {
            return res.status(404).json({
                error: 'Problem not found',
                message: 'The requested problem does not exist'
            });
        }

        // Get test cases for the problem
        const testCases = await req.app.locals.database.all(
            'SELECT * FROM test_cases WHERE problem_id = ? ORDER BY is_sample DESC, id ASC',
            [id]
        );

        if (!testCases || testCases.length === 0) {
            return res.status(400).json({
                error: 'No test cases available',
                message: 'This problem has no test cases to validate against'
            });
        }

        // Create submission record
        const result = await req.app.locals.database.run(
            `INSERT INTO submissions (
                user_id, problem_id, language_id, source_code, submission_time, status
            ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, 'Processing')`,
            [req.user.userId, id, language, code]
        );

        const submissionId = result.lastID;

        try {
            // Import Judge0 service
            const judge0Service = require('../services/judge0Service');
            
            // Execute code against test cases
            const executionResults = await judge0Service.executeTestCases(code, language, testCases);
            
            // Calculate overall status
            const passedTests = executionResults.filter(r => r.status === 'PASSED').length;
            const totalTests = executionResults.length;
            const overallStatus = passedTests === totalTests ? 'AC' : 'WA';
            
            // Update submission status
            await req.app.locals.database.run(
                'UPDATE submissions SET status = ? WHERE id = ?',
                [overallStatus, submissionId]
            );

            // Store execution results
            for (const execResult of executionResults) {
                await req.app.locals.database.run(
                    `INSERT INTO submission_results (
                        submission_id, test_case_id, status, output, expected_output,
                        execution_time, memory_used, error_message
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        submissionId,
                        execResult.testCase.id,
                        execResult.status,
                        execResult.output,
                        execResult.expected,
                        execResult.executionTime,
                        execResult.memory,
                        execResult.error
                    ]
                );
            }

            res.json({
                success: true,
                message: 'Submission processed successfully',
                submission_id: submissionId,
                status: overallStatus,
                results: {
                    passed: passedTests,
                    total: totalTests,
                    test_cases: executionResults
                }
            });

        } catch (executionError) {
            console.error('Code execution error:', executionError);
            
            // Update submission status to error
            await req.app.locals.database.run(
                'UPDATE submissions SET status = ? WHERE id = ?',
                ['RE', submissionId]
            );

            res.json({
                success: false,
                message: 'Code execution failed',
                submission_id: submissionId,
                status: 'RE',
                error: executionError.message
            });
        }

    } catch (error) {
        console.error('Submit solution error:', error);
        res.status(500).json({
            error: 'Failed to submit solution',
            message: error.message
        });
    }
});

// Get test cases for problem
router.get('/:id/test-cases', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const testCases = await req.app.locals.database.all(
            'SELECT * FROM test_cases WHERE problem_id = ? AND is_sample = 1 ORDER BY id',
            [id]
        );

        res.json({
            success: true,
            test_cases: testCases
        });

    } catch (error) {
        console.error('Get test cases error:', error);
        res.status(500).json({
            error: 'Failed to get test cases',
            message: error.message
        });
    }
});

module.exports = router;

const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { authenticateToken, requireAdmin, optionalAuth, requireProblemAccess } = require('../middleware/auth');
const judge0Service = require('../services/judge0Service');

const router = express.Router();

// Validation middleware
const validateProblemCreation = [
    body('title')
        .isLength({ min: 5, max: 200 })
        .withMessage('Title must be between 5 and 200 characters')
        .trim()
        .escape(),
    body('description')
        .isLength({ min: 10 })
        .withMessage('Description must be at least 10 characters long')
        .trim(),
    body('problem_statement')
        .isLength({ min: 10 })
        .withMessage('Problem statement must be at least 10 characters long')
        .trim(),
    body('difficulty_level')
        .isIn(['Easy', 'Medium', 'Hard'])
        .withMessage('Difficulty level must be Easy, Medium, or Hard'),
    body('time_limit_ms')
        .optional()
        .isInt({ min: 100, max: 30000 })
        .withMessage('Time limit must be between 100 and 30000 milliseconds'),
    body('memory_limit_mb')
        .optional()
        .isInt({ min: 16, max: 1024 })
        .withMessage('Memory limit must be between 16 and 1024 MB'),
    body('topic_tags')
        .optional()
        .isArray()
        .withMessage('Topic tags must be an array'),
    body('input_format')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Input format too long'),
    body('output_format')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Output format too long'),
    body('constraints')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Constraints too long'),
    body('examples')
        .optional()
        .isArray()
        .withMessage('Examples must be an array'),
    body('hints')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Hints too long')
];

const validateTestCase = [
    body('input_data')
        .notEmpty()
        .withMessage('Input data is required'),
    body('expected_output')
        .notEmpty()
        .withMessage('Expected output is required'),
    body('is_sample')
        .optional()
        .isBoolean()
        .withMessage('is_sample must be a boolean'),
    body('weight')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Weight must be between 1 and 100'),
    body('is_hidden')
        .optional()
        .isBoolean()
        .withMessage('is_hidden must be a boolean')
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

// Get all problems with filtering and pagination
router.get('/', optionalAuth, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            difficulty,
            topic,
            search,
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        const conditions = ['is_active = 1'];
        const params = [];

        // Add filters
        if (difficulty) {
            conditions.push('difficulty_level = ?');
            params.push(difficulty);
        }

        if (topic) {
            conditions.push('topic_tags LIKE ?');
            params.push(`%${topic}%`);
        }

        if (search) {
            conditions.push('(title LIKE ? OR description LIKE ? OR problem_statement LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        // Validate sort parameters
        const allowedSortFields = ['created_at', 'title', 'difficulty_level', 'id'];
        const allowedSortOrders = ['ASC', 'DESC'];
        
        if (!allowedSortFields.includes(sortBy)) {
            sortBy = 'created_at';
        }
        if (!allowedSortOrders.includes(sortOrder.toUpperCase())) {
            sortOrder = 'DESC';
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        
        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM problems ${whereClause}`;
        const countResult = await req.app.locals.database.get(countQuery, params);
        const total = countResult.total;

        // Get problems
        const problemsQuery = `
            SELECT 
                p.*,
                ps.total_submissions,
                ps.accepted_submissions,
                ps.success_rate,
                ps.difficulty_rating
            FROM problems p
            LEFT JOIN problem_statistics ps ON p.id = ps.problem_id
            ${whereClause}
            ORDER BY p.${sortBy} ${sortOrder}
            LIMIT ? OFFSET ?
        `;
        
        const problems = await req.app.locals.database.all(problemsQuery, [...params, parseInt(limit), offset]);

        // Parse JSON fields
        problems.forEach(problem => {
            if (problem.topic_tags) {
                try {
                    problem.topic_tags = JSON.parse(problem.topic_tags);
                } catch (error) {
                    problem.topic_tags = [];
                }
            }
            if (problem.examples) {
                try {
                    problem.examples = JSON.parse(problem.examples);
                } catch (error) {
                    problem.examples = [];
                }
            }
        });

        res.json({
            success: true,
            problems,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get problems error:', error);
        res.status(500).json({
            error: 'Failed to get problems',
            message: error.message
        });
    }
});

// Get problem by ID
router.get('/:id', optionalAuth, requireProblemAccess, async (req, res) => {
    try {
        const problem = req.problem;

        // Get test cases (only sample cases for non-admin users)
        const testCasesQuery = req.user?.is_admin 
            ? 'SELECT * FROM test_cases WHERE problem_id = ? ORDER BY is_sample DESC, id ASC'
            : 'SELECT * FROM test_cases WHERE problem_id = ? AND is_sample = 1 ORDER BY id ASC';
        
        const testCases = await req.app.locals.database.all(testCasesQuery, [problem.id]);

        // Parse JSON fields
        if (problem.topic_tags) {
            try {
                problem.topic_tags = JSON.parse(problem.topic_tags);
            } catch (error) {
                problem.topic_tags = [];
            }
        }
        if (problem.examples) {
            try {
                problem.examples = JSON.parse(problem.examples);
            } catch (error) {
                problem.examples = [];
            }
        }

        // Get problem statistics
        const stats = await req.app.locals.database.get(
            'SELECT * FROM problem_statistics WHERE problem_id = ?',
            [problem.id]
        );

        // Get user's submission history for this problem
        let userSubmissions = [];
        if (req.user) {
            userSubmissions = await req.app.locals.database.all(
                `SELECT id, status, submission_time, language_id, execution_time_ms, memory_used_kb 
                 FROM submissions 
                 WHERE user_id = ? AND problem_id = ? 
                 ORDER BY submission_time DESC 
                 LIMIT 10`,
                [req.user.id, problem.id]
            );
        }

        res.json({
            success: true,
            problem: {
                ...problem,
                testCases,
                statistics: stats,
                userSubmissions
            }
        });
    } catch (error) {
        console.error('Get problem error:', error);
        res.status(500).json({
            error: 'Failed to get problem',
            message: error.message
        });
    }
});

// Submit solution
router.post('/:id/submit', authenticateToken, requireProblemAccess, async (req, res) => {
    try {
        const { sourceCode, language } = req.body;
        const problem = req.problem;

        // Validate input
        if (!sourceCode || !language) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'Source code and language are required'
            });
        }

        // Validate code
        try {
            judge0Service.validateCode(sourceCode, language);
        } catch (error) {
            return res.status(400).json({
                error: 'Invalid code',
                message: error.message
            });
        }

        // Get all test cases for the problem
        const testCases = await req.app.locals.database.all(
            'SELECT * FROM test_cases WHERE problem_id = ? ORDER BY is_sample DESC, id ASC',
            [problem.id]
        );

        if (testCases.length === 0) {
            return res.status(500).json({
                error: 'No test cases available',
                message: 'This problem has no test cases configured'
            });
        }

        // Create submission record
        const submissionResult = await req.app.locals.database.run(
            `INSERT INTO submissions (user_id, problem_id, language_id, source_code, status) 
             VALUES (?, ?, ?, ?, 'Processing')`,
            [req.user.id, problem.id, judge0Service.getLanguageId(language), sourceCode]
        );

        const submissionId = submissionResult.id;

        // Execute code with test cases
        const executionResult = await judge0Service.executeWithTestCases(
            sourceCode,
            language,
            testCases,
            problem.time_limit_ms,
            problem.memory_limit_mb
        );

        // Update submission with results
        await req.app.locals.database.run(
            `UPDATE submissions 
             SET status = ?, execution_time_ms = ?, memory_used_kb = ?, 
                 test_cases_passed = ?, total_test_cases = ?, score = ?
             WHERE id = ?`,
            [
                executionResult.status,
                executionResult.executionTime,
                executionResult.memoryUsed,
                executionResult.passedTests,
                executionResult.totalTests,
                executionResult.totalScore,
                submissionId
            ]
        );

        // Update problem statistics
        await updateProblemStatistics(req.app.locals.database, problem.id);

        // Update user statistics
        await updateUserStatistics(req.app.locals.database, req.user.id);

        // Emit real-time update if in contest
        if (req.app.locals.io) {
            req.app.locals.io.emit('submission-updated', {
                submissionId,
                status: executionResult.status,
                userId: req.user.id,
                problemId: problem.id,
                timestamp: new Date().toISOString()
            });
        }

        res.json({
            success: true,
            message: 'Submission processed successfully',
            submission: {
                id: submissionId,
                status: executionResult.status,
                executionTime: executionResult.executionTime,
                memoryUsed: executionResult.memoryUsed,
                passedTests: executionResult.passedTests,
                totalTests: executionResult.totalTests,
                score: executionResult.totalScore,
                results: executionResult.results
            }
        });
    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({
            error: 'Submission failed',
            message: error.message
        });
    }
});

// Get supported languages
router.get('/languages/supported', (req, res) => {
    try {
        const languages = judge0Service.getSupportedLanguages();
        res.json({
            success: true,
            languages
        });
    } catch (error) {
        console.error('Get languages error:', error);
        res.status(500).json({
            error: 'Failed to get supported languages',
            message: error.message
        });
    }
});

// Admin routes
// Create new problem
router.post('/', authenticateToken, requireAdmin, validateProblemCreation, handleValidationErrors, async (req, res) => {
    try {
        const problemData = {
            ...req.body,
            topic_tags: req.body.topic_tags ? JSON.stringify(req.body.topic_tags) : null,
            examples: req.body.examples ? JSON.stringify(req.body.examples) : null,
            author_id: req.user.id
        };

        const result = await req.app.locals.database.run(
            `INSERT INTO problems (
                title, description, problem_statement, difficulty_level, topic_tags,
                time_limit_ms, memory_limit_mb, input_format, output_format,
                constraints, examples, hints, author_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                problemData.title,
                problemData.description,
                problemData.problem_statement,
                problemData.difficulty_level,
                problemData.topic_tags,
                problemData.time_limit_ms || 1000,
                problemData.memory_limit_mb || 256,
                problemData.input_format,
                problemData.output_format,
                problemData.constraints,
                problemData.examples,
                problemData.hints,
                problemData.author_id
            ]
        );

        // Create problem statistics record
        await req.app.locals.database.run(
            'INSERT INTO problem_statistics (problem_id) VALUES (?)',
            [result.id]
        );

        res.status(201).json({
            success: true,
            message: 'Problem created successfully',
            problemId: result.id
        });
    } catch (error) {
        console.error('Create problem error:', error);
        res.status(500).json({
            error: 'Failed to create problem',
            message: error.message
        });
    }
});

// Update problem
router.put('/:id', authenticateToken, requireAdmin, validateProblemCreation, handleValidationErrors, async (req, res) => {
    try {
        const { id } = req.params;
        const problemData = {
            ...req.body,
            topic_tags: req.body.topic_tags ? JSON.stringify(req.body.topic_tags) : null,
            examples: req.body.examples ? JSON.stringify(req.body.examples) : null
        };

        await req.app.locals.database.run(
            `UPDATE problems SET
                title = ?, description = ?, problem_statement = ?, difficulty_level = ?,
                topic_tags = ?, time_limit_ms = ?, memory_limit_mb = ?, input_format = ?,
                output_format = ?, constraints = ?, examples = ?, hints = ?,
                updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
                problemData.title,
                problemData.description,
                problemData.problem_statement,
                problemData.difficulty_level,
                problemData.topic_tags,
                problemData.time_limit_ms || 1000,
                problemData.memory_limit_mb || 256,
                problemData.input_format,
                problemData.output_format,
                problemData.constraints,
                problemData.examples,
                problemData.hints,
                id
            ]
        );

        res.json({
            success: true,
            message: 'Problem updated successfully'
        });
    } catch (error) {
        console.error('Update problem error:', error);
        res.status(500).json({
            error: 'Failed to update problem',
            message: error.message
        });
    }
});

// Add test case
router.post('/:id/testcases', authenticateToken, requireAdmin, validateTestCase, handleValidationErrors, async (req, res) => {
    try {
        const { id } = req.params;
        const testCaseData = req.body;

        const result = await req.app.locals.database.run(
            `INSERT INTO test_cases (problem_id, input_data, expected_output, is_sample, weight, is_hidden)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                id,
                testCaseData.input_data,
                testCaseData.expected_output,
                testCaseData.is_sample || false,
                testCaseData.weight || 1,
                testCaseData.is_hidden || false
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Test case added successfully',
            testCaseId: result.id
        });
    } catch (error) {
        console.error('Add test case error:', error);
        res.status(500).json({
            error: 'Failed to add test case',
            message: error.message
        });
    }
});

// Helper functions
async function updateProblemStatistics(database, problemId) {
    try {
        const stats = await database.get(
            `SELECT 
                COUNT(*) as total_submissions,
                SUM(CASE WHEN status = 'AC' THEN 1 ELSE 0 END) as accepted_submissions,
                AVG(CASE WHEN status = 'AC' THEN execution_time_ms END) as avg_time,
                AVG(CASE WHEN status = 'AC' THEN memory_used_kb END) as avg_memory
             FROM submissions 
             WHERE problem_id = ?`,
            [problemId]
        );

        const successRate = stats.total_submissions > 0 
            ? (stats.accepted_submissions / stats.total_submissions) * 100 
            : 0;

        await database.run(
            `INSERT OR REPLACE INTO problem_statistics 
             (problem_id, total_submissions, accepted_submissions, average_time_ms, 
              average_memory_kb, success_rate, last_updated)
             VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [
                problemId,
                stats.total_submissions,
                stats.accepted_submissions,
                Math.round(stats.avg_time || 0),
                Math.round(stats.avg_memory || 0),
                successRate
            ]
        );
    } catch (error) {
        console.error('Error updating problem statistics:', error);
    }
}

async function updateUserStatistics(database, userId) {
    try {
        const stats = await database.get(
            `SELECT 
                COUNT(*) as total_submissions,
                SUM(CASE WHEN status = 'AC' THEN 1 ELSE 0 END) as accepted_submissions,
                AVG(CASE WHEN status = 'AC' THEN execution_time_ms END) as avg_time
             FROM submissions 
             WHERE user_id = ?`,
            [userId]
        );

        // Get problems solved by difficulty
        const difficultyStats = await database.all(
            `SELECT p.difficulty_level, COUNT(DISTINCT s.problem_id) as solved
             FROM submissions s
             JOIN problems p ON s.problem_id = p.id
             WHERE s.user_id = ? AND s.status = 'AC'
             GROUP BY p.difficulty_level`,
            [userId]
        );

        const problemsSolvedByDifficulty = {};
        difficultyStats.forEach(stat => {
            problemsSolvedByDifficulty[stat.difficulty_level] = stat.solved;
        });

        // Get favorite language
        const languageStats = await database.get(
            `SELECT language_id, COUNT(*) as count
             FROM submissions
             WHERE user_id = ? AND status = 'AC'
             GROUP BY language_id
             ORDER BY count DESC
             LIMIT 1`,
            [userId]
        );

        await database.run(
            `INSERT OR REPLACE INTO user_statistics 
             (user_id, total_submissions, accepted_submissions, problems_solved_by_difficulty,
              favorite_language, average_submission_time, last_updated)
             VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [
                userId,
                stats.total_submissions,
                stats.accepted_submissions,
                JSON.stringify(problemsSolvedByDifficulty),
                languageStats ? languageStats.language_id : null,
                Math.round(stats.avg_time || 0)
            ]
        );
    } catch (error) {
        console.error('Error updating user statistics:', error);
    }
}

module.exports = router;

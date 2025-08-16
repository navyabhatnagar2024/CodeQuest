const express = require('express');
const { query, validationResult } = require('express-validator');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateSubmissionQuery = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('status')
        .optional()
        .isIn(['Pending', 'AC', 'WA', 'TLE', 'MLE', 'CE', 'RE', 'Processing'])
        .withMessage('Invalid status filter'),
    query('language')
        .optional()
        .isString()
        .withMessage('Language must be a string')
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

// Get submission by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const submission = await req.app.locals.database.get(
            `SELECT 
                s.*,
                p.title as problem_title,
                p.difficulty_level,
                u.username,
                u.full_name
             FROM submissions s
             JOIN problems p ON s.problem_id = p.id
             JOIN users u ON s.user_id = u.id
             WHERE s.id = ?`,
            [id]
        );

        if (!submission) {
            return res.status(404).json({
                error: 'Submission not found',
                message: 'The requested submission does not exist'
            });
        }

        // Check if user has permission to view this submission
        if (!req.user.is_admin && submission.user_id !== req.user.id) {
            return res.status(403).json({
                error: 'Access denied',
                message: 'You do not have permission to view this submission'
            });
        }

        // Get test case results if available
        let testCaseResults = [];
        if (submission.status !== 'Pending' && submission.status !== 'Processing') {
            // In a real implementation, you might store detailed test case results
            // For now, we'll return basic information
            testCaseResults = {
                passed: submission.test_cases_passed,
                total: submission.total_test_cases,
                score: submission.score
            };
        }

        res.json({
            success: true,
            submission: {
                ...submission,
                testCaseResults
            }
        });
    } catch (error) {
        console.error('Get submission error:', error);
        res.status(500).json({
            error: 'Failed to get submission',
            message: error.message
        });
    }
});

// Get user's submissions
router.get('/user/:userId', authenticateToken, validateSubmissionQuery, handleValidationErrors, async (req, res) => {
    try {
        const { userId } = req.params;
        const {
            page = 1,
            limit = 20,
            status,
            language,
            problemId
        } = req.query;

        // Check if user has permission to view these submissions
        if (!req.user.is_admin && req.user.id !== parseInt(userId)) {
            return res.status(403).json({
                error: 'Access denied',
                message: 'You do not have permission to view these submissions'
            });
        }

        const offset = (page - 1) * limit;
        const conditions = ['s.user_id = ?'];
        const params = [userId];

        // Add filters
        if (status) {
            conditions.push('s.status = ?');
            params.push(status);
        }

        if (language) {
            conditions.push('s.language_id = ?');
            params.push(language);
        }

        if (problemId) {
            conditions.push('s.problem_id = ?');
            params.push(problemId);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM submissions s 
            ${whereClause}
        `;
        const countResult = await req.app.locals.database.get(countQuery, params);
        const total = countResult.total;

        // Get submissions
        const submissionsQuery = `
            SELECT 
                s.*,
                p.title as problem_title,
                p.difficulty_level,
                c.title as contest_title
            FROM submissions s
            JOIN problems p ON s.problem_id = p.id
            LEFT JOIN contests c ON s.contest_id = c.id
            ${whereClause}
            ORDER BY s.submission_time DESC
            LIMIT ? OFFSET ?
        `;

        const submissions = await req.app.locals.database.all(submissionsQuery, [...params, parseInt(limit), offset]);

        res.json({
            success: true,
            submissions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get user submissions error:', error);
        res.status(500).json({
            error: 'Failed to get submissions',
            message: error.message
        });
    }
});

// Get problem submissions
router.get('/problem/:problemId', optionalAuth, validateSubmissionQuery, handleValidationErrors, async (req, res) => {
    try {
        const { problemId } = req.params;
        const {
            page = 1,
            limit = 20,
            status,
            language
        } = req.query;

        const offset = (page - 1) * limit;
        const conditions = ['s.problem_id = ?'];
        const params = [problemId];

        // Add filters
        if (status) {
            conditions.push('s.status = ?');
            params.push(status);
        }

        if (language) {
            conditions.push('s.language_id = ?');
            params.push(language);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM submissions s 
            ${whereClause}
        `;
        const countResult = await req.app.locals.database.get(countQuery, params);
        const total = countResult.total;

        // Get submissions (limit sensitive information for non-admin users)
        const selectFields = req.user?.is_admin 
            ? 's.*, u.username, u.full_name'
            : 's.id, s.status, s.submission_time, s.language_id, s.execution_time_ms, s.memory_used_kb, s.test_cases_passed, s.total_test_cases, u.username';

        const submissionsQuery = `
            SELECT 
                ${selectFields}
            FROM submissions s
            JOIN users u ON s.user_id = u.id
            ${whereClause}
            ORDER BY s.submission_time DESC
            LIMIT ? OFFSET ?
        `;

        const submissions = await req.app.locals.database.all(submissionsQuery, [...params, parseInt(limit), offset]);

        res.json({
            success: true,
            submissions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get problem submissions error:', error);
        res.status(500).json({
            error: 'Failed to get submissions',
            message: error.message
        });
    }
});

// Get contest submissions
router.get('/contest/:contestId', authenticateToken, validateSubmissionQuery, handleValidationErrors, async (req, res) => {
    try {
        const { contestId } = req.params;
        const {
            page = 1,
            limit = 20,
            status,
            language,
            userId
        } = req.query;

        // Check if user is registered for the contest
        const registration = await req.app.locals.database.get(
            'SELECT * FROM contest_registrations WHERE contest_id = ? AND user_id = ?',
            [contestId, req.user.id]
        );

        if (!registration && !req.user.is_admin) {
            return res.status(403).json({
                error: 'Access denied',
                message: 'You are not registered for this contest'
            });
        }

        const offset = (page - 1) * limit;
        const conditions = ['s.contest_id = ?'];
        const params = [contestId];

        // Add filters
        if (status) {
            conditions.push('s.status = ?');
            params.push(status);
        }

        if (language) {
            conditions.push('s.language_id = ?');
            params.push(language);
        }

        if (userId) {
            conditions.push('s.user_id = ?');
            params.push(userId);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM submissions s 
            ${whereClause}
        `;
        const countResult = await req.app.locals.database.get(countQuery, params);
        const total = countResult.total;

        // Get submissions
        const submissionsQuery = `
            SELECT 
                s.*,
                p.title as problem_title,
                p.difficulty_level,
                u.username,
                u.full_name
            FROM submissions s
            JOIN problems p ON s.problem_id = p.id
            JOIN users u ON s.user_id = u.id
            ${whereClause}
            ORDER BY s.submission_time DESC
            LIMIT ? OFFSET ?
        `;

        const submissions = await req.app.locals.database.all(submissionsQuery, [...params, parseInt(limit), offset]);

        res.json({
            success: true,
            submissions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get contest submissions error:', error);
        res.status(500).json({
            error: 'Failed to get submissions',
            message: error.message
        });
    }
});

// Get recent submissions (global)
router.get('/', optionalAuth, validateSubmissionQuery, handleValidationErrors, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            language
        } = req.query;

        const offset = (page - 1) * limit;
        const conditions = [];
        const params = [];

        // Add filters
        if (status) {
            conditions.push('s.status = ?');
            params.push(status);
        }

        if (language) {
            conditions.push('s.language_id = ?');
            params.push(language);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM submissions s 
            ${whereClause}
        `;
        const countResult = await req.app.locals.database.get(countQuery, params);
        const total = countResult.total;

        // Get submissions (limit sensitive information for non-admin users)
        const selectFields = req.user?.is_admin 
            ? 's.*, p.title as problem_title, p.difficulty_level, u.username, u.full_name'
            : 's.id, s.status, s.submission_time, s.language_id, s.execution_time_ms, s.memory_used_kb, s.test_cases_passed, s.total_test_cases, p.title as problem_title, p.difficulty_level, u.username';

        const submissionsQuery = `
            SELECT 
                ${selectFields}
            FROM submissions s
            JOIN problems p ON s.problem_id = p.id
            JOIN users u ON s.user_id = u.id
            ${whereClause}
            ORDER BY s.submission_time DESC
            LIMIT ? OFFSET ?
        `;

        const submissions = await req.app.locals.database.all(submissionsQuery, [...params, parseInt(limit), offset]);

        res.json({
            success: true,
            submissions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get recent submissions error:', error);
        res.status(500).json({
            error: 'Failed to get submissions',
            message: error.message
        });
    }
});

// Admin routes
// Get all submissions (admin only)
router.get('/admin/all', authenticateToken, requireAdmin, validateSubmissionQuery, handleValidationErrors, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            status,
            language,
            userId,
            problemId,
            contestId
        } = req.query;

        const offset = (page - 1) * limit;
        const conditions = [];
        const params = [];

        // Add filters
        if (status) {
            conditions.push('s.status = ?');
            params.push(status);
        }

        if (language) {
            conditions.push('s.language_id = ?');
            params.push(language);
        }

        if (userId) {
            conditions.push('s.user_id = ?');
            params.push(userId);
        }

        if (problemId) {
            conditions.push('s.problem_id = ?');
            params.push(problemId);
        }

        if (contestId) {
            conditions.push('s.contest_id = ?');
            params.push(contestId);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM submissions s 
            ${whereClause}
        `;
        const countResult = await req.app.locals.database.get(countQuery, params);
        const total = countResult.total;

        // Get submissions
        const submissionsQuery = `
            SELECT 
                s.*,
                p.title as problem_title,
                p.difficulty_level,
                u.username,
                u.full_name,
                u.email,
                c.title as contest_title
            FROM submissions s
            JOIN problems p ON s.problem_id = p.id
            JOIN users u ON s.user_id = u.id
            LEFT JOIN contests c ON s.contest_id = c.id
            ${whereClause}
            ORDER BY s.submission_time DESC
            LIMIT ? OFFSET ?
        `;

        const submissions = await req.app.locals.database.all(submissionsQuery, [...params, parseInt(limit), offset]);

        res.json({
            success: true,
            submissions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get all submissions error:', error);
        res.status(500).json({
            error: 'Failed to get submissions',
            message: error.message
        });
    }
});

// Delete submission (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await req.app.locals.database.run(
            'DELETE FROM submissions WHERE id = ?',
            [id]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                error: 'Submission not found',
                message: 'The requested submission does not exist'
            });
        }

        res.json({
            success: true,
            message: 'Submission deleted successfully'
        });
    } catch (error) {
        console.error('Delete submission error:', error);
        res.status(500).json({
            error: 'Failed to delete submission',
            message: error.message
        });
    }
});

module.exports = router;

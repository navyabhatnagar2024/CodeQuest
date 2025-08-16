const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { authenticateToken, requireAdmin, optionalAuth, requireContestAccess, validateContestTime } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateContestCreation = [
    body('title')
        .isLength({ min: 5, max: 200 })
        .withMessage('Title must be between 5 and 200 characters')
        .trim()
        .escape(),
    body('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Description too long')
        .trim()
        .escape(),
    body('start_time')
        .isISO8601()
        .withMessage('Start time must be a valid ISO 8601 date')
        .custom((value) => {
            const startTime = new Date(value);
            const now = new Date();
            if (startTime <= now) {
                throw new Error('Start time must be in the future');
            }
            return true;
        }),
    body('duration_minutes')
        .isInt({ min: 30, max: 1440 })
        .withMessage('Duration must be between 30 minutes and 24 hours'),
    body('max_participants')
        .optional()
        .isInt({ min: 1, max: 10000 })
        .withMessage('Max participants must be between 1 and 10000'),
    body('contest_type')
        .isIn(['Rated', 'Unrated', 'Practice'])
        .withMessage('Contest type must be Rated, Unrated, or Practice'),
    body('difficulty_range')
        .optional()
        .isObject()
        .withMessage('Difficulty range must be an object'),
    body('prizes_description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Prizes description too long'),
    body('rules')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Rules too long')
];

const validateContestQuery = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50'),
    query('status')
        .optional()
        .isIn(['upcoming', 'ongoing', 'completed', 'all'])
        .withMessage('Invalid status filter'),
    query('type')
        .optional()
        .isIn(['Rated', 'Unrated', 'Practice'])
        .withMessage('Invalid contest type')
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

// Get all contests with filtering and pagination
router.get('/', optionalAuth, validateContestQuery, handleValidationErrors, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status = 'all',
            type
        } = req.query;

        const offset = (page - 1) * limit;
        const conditions = [];
        const params = [];

        // Add status filter
        const now = new Date().toISOString();
        if (status === 'upcoming') {
            conditions.push('start_time > ?');
            params.push(now);
        } else if (status === 'ongoing') {
            conditions.push('start_time <= ? AND end_time > ?');
            params.push(now, now);
        } else if (status === 'completed') {
            conditions.push('end_time <= ?');
            params.push(now);
        }

        // Add type filter
        if (type) {
            conditions.push('contest_type = ?');
            params.push(type);
        }

        // Show only public contests for non-admin users
        if (!req.user?.is_admin) {
            conditions.push('is_public = 1');
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM contests ${whereClause}`;
        const countResult = await req.app.locals.database.get(countQuery, params);
        const total = countResult.total;

        // Get contests
        const contestsQuery = `
            SELECT 
                c.*,
                u.username as creator_username,
                COUNT(cr.user_id) as registered_participants
            FROM contests c
            LEFT JOIN users u ON c.created_by_admin_id = u.id
            LEFT JOIN contest_registrations cr ON c.id = cr.contest_id
            ${whereClause}
            GROUP BY c.id
            ORDER BY c.start_time DESC
            LIMIT ? OFFSET ?
        `;

        const contests = await req.app.locals.database.all(contestsQuery, [...params, parseInt(limit), offset]);

        // Parse JSON fields and add status
        contests.forEach(contest => {
            if (contest.difficulty_range) {
                try {
                    contest.difficulty_range = JSON.parse(contest.difficulty_range);
                } catch (error) {
                    contest.difficulty_range = {};
                }
            }

            // Add contest status
            const startTime = new Date(contest.start_time);
            const endTime = new Date(contest.end_time);
            if (now < startTime) {
                contest.status = 'upcoming';
            } else if (now >= startTime && now < endTime) {
                contest.status = 'ongoing';
            } else {
                contest.status = 'completed';
            }

            // Check if user is registered
            if (req.user) {
                contest.is_registered = false; // Will be updated below
            }
        });

        // Check registration status for authenticated users
        if (req.user) {
            const contestIds = contests.map(c => c.id);
            if (contestIds.length > 0) {
                const registrations = await req.app.locals.database.all(
                    'SELECT contest_id FROM contest_registrations WHERE user_id = ? AND contest_id IN (' + contestIds.map(() => '?').join(',') + ')',
                    [req.user.id, ...contestIds]
                );
                
                const registeredContestIds = new Set(registrations.map(r => r.contest_id));
                contests.forEach(contest => {
                    contest.is_registered = registeredContestIds.has(contest.id);
                });
            }
        }

        res.json({
            success: true,
            contests,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get contests error:', error);
        res.status(500).json({
            error: 'Failed to get contests',
            message: error.message
        });
    }
});

// Get contest by ID
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const contest = await req.app.locals.database.get(
            `SELECT 
                c.*,
                u.username as creator_username,
                u.full_name as creator_full_name
             FROM contests c
             LEFT JOIN users u ON c.created_by_admin_id = u.id
             WHERE c.id = ?`,
            [id]
        );

        if (!contest) {
            return res.status(404).json({
                error: 'Contest not found',
                message: 'The requested contest does not exist'
            });
        }

        // Check if user can access this contest
        if (!contest.is_public && !req.user?.is_admin) {
            return res.status(403).json({
                error: 'Access denied',
                message: 'This contest is not public'
            });
        }

        // Parse JSON fields
        if (contest.difficulty_range) {
            try {
                contest.difficulty_range = JSON.parse(contest.difficulty_range);
            } catch (error) {
                contest.difficulty_range = {};
            }
        }

        // Add contest status
        const now = new Date();
        const startTime = new Date(contest.start_time);
        const endTime = new Date(contest.end_time);
        if (now < startTime) {
            contest.status = 'upcoming';
        } else if (now >= startTime && now < endTime) {
            contest.status = 'ongoing';
        } else {
            contest.status = 'completed';
        }

        // Get contest problems
        const problems = await req.app.locals.database.all(
            `SELECT 
                cp.*,
                p.title,
                p.difficulty_level,
                p.topic_tags
             FROM contest_problems cp
             JOIN problems p ON cp.problem_id = p.id
             WHERE cp.contest_id = ?
             ORDER BY cp.problem_order`,
            [id]
        );

        // Parse problem topic tags
        problems.forEach(problem => {
            if (problem.topic_tags) {
                try {
                    problem.topic_tags = JSON.parse(problem.topic_tags);
                } catch (error) {
                    problem.topic_tags = [];
                }
            }
        });

        // Get registration count
        const registrationCount = await req.app.locals.database.get(
            'SELECT COUNT(*) as count FROM contest_registrations WHERE contest_id = ?',
            [id]
        );

        // Check if user is registered
        let isRegistered = false;
        if (req.user) {
            const registration = await req.app.locals.database.get(
                'SELECT * FROM contest_registrations WHERE contest_id = ? AND user_id = ?',
                [id, req.user.id]
            );
            isRegistered = !!registration;
        }

        res.json({
            success: true,
            contest: {
                ...contest,
                problems,
                registrationCount: registrationCount.count,
                isRegistered
            }
        });
    } catch (error) {
        console.error('Get contest error:', error);
        res.status(500).json({
            error: 'Failed to get contest',
            message: error.message
        });
    }
});

// Register for contest
router.post('/:id/register', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Get contest details
        const contest = await req.app.locals.database.get(
            'SELECT * FROM contests WHERE id = ?',
            [id]
        );

        if (!contest) {
            return res.status(404).json({
                error: 'Contest not found',
                message: 'The requested contest does not exist'
            });
        }

        // Check if contest is public
        if (!contest.is_public && !req.user.is_admin) {
            return res.status(403).json({
                error: 'Access denied',
                message: 'This contest is not public'
            });
        }

        // Check if registration is still open
        const now = new Date();
        const registrationDeadline = contest.registration_deadline 
            ? new Date(contest.registration_deadline)
            : new Date(contest.start_time);
        
        if (now > registrationDeadline) {
            return res.status(400).json({
                error: 'Registration closed',
                message: 'Registration for this contest has closed'
            });
        }

        // Check if contest has started
        if (now >= new Date(contest.start_time)) {
            return res.status(400).json({
                error: 'Contest started',
                message: 'Cannot register for a contest that has already started'
            });
        }

        // Check if user is already registered
        const existingRegistration = await req.app.locals.database.get(
            'SELECT * FROM contest_registrations WHERE contest_id = ? AND user_id = ?',
            [id, req.user.id]
        );

        if (existingRegistration) {
            return res.status(400).json({
                error: 'Already registered',
                message: 'You are already registered for this contest'
            });
        }

        // Check participant limit
        if (contest.max_participants) {
            const currentParticipants = await req.app.locals.database.get(
                'SELECT COUNT(*) as count FROM contest_registrations WHERE contest_id = ?',
                [id]
            );

            if (currentParticipants.count >= contest.max_participants) {
                return res.status(400).json({
                    error: 'Contest full',
                    message: 'This contest has reached its maximum number of participants'
                });
            }
        }

        // Register user
        await req.app.locals.database.run(
            'INSERT INTO contest_registrations (contest_id, user_id) VALUES (?, ?)',
            [id, req.user.id]
        );

        // Update user's contests participated count
        await req.app.locals.database.run(
            'UPDATE users SET contests_participated = contests_participated + 1 WHERE id = ?',
            [req.user.id]
        );

        res.json({
            success: true,
            message: 'Successfully registered for contest'
        });
    } catch (error) {
        console.error('Contest registration error:', error);
        res.status(500).json({
            error: 'Registration failed',
            message: error.message
        });
    }
});

// Unregister from contest
router.delete('/:id/register', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user is registered
        const registration = await req.app.locals.database.get(
            'SELECT * FROM contest_registrations WHERE contest_id = ? AND user_id = ?',
            [id, req.user.id]
        );

        if (!registration) {
            return res.status(400).json({
                error: 'Not registered',
                message: 'You are not registered for this contest'
            });
        }

        // Check if contest has started
        const contest = await req.app.locals.database.get(
            'SELECT * FROM contests WHERE id = ?',
            [id]
        );

        if (contest && new Date() >= new Date(contest.start_time)) {
            return res.status(400).json({
                error: 'Contest started',
                message: 'Cannot unregister from a contest that has already started'
            });
        }

        // Remove registration
        await req.app.locals.database.run(
            'DELETE FROM contest_registrations WHERE contest_id = ? AND user_id = ?',
            [id, req.user.id]
        );

        // Update user's contests participated count
        await req.app.locals.database.run(
            'UPDATE users SET contests_participated = contests_participated - 1 WHERE id = ?',
            [req.user.id]
        );

        res.json({
            success: true,
            message: 'Successfully unregistered from contest'
        });
    } catch (error) {
        console.error('Contest unregistration error:', error);
        res.status(500).json({
            error: 'Unregistration failed',
            message: error.message
        });
    }
});

// Get contest leaderboard
router.get('/:id/leaderboard', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        // Get contest details
        const contest = await req.app.locals.database.get(
            'SELECT * FROM contests WHERE id = ?',
            [id]
        );

        if (!contest) {
            return res.status(404).json({
                error: 'Contest not found',
                message: 'The requested contest does not exist'
            });
        }

        // Check if user can access this contest
        if (!contest.is_public && !req.user?.is_admin) {
            return res.status(403).json({
                error: 'Access denied',
                message: 'This contest is not public'
            });
        }

        // Get leaderboard
        const leaderboard = await req.app.locals.database.all(
            `SELECT 
                l.*,
                u.username,
                u.full_name,
                u.elo_rating
             FROM leaderboards l
             JOIN users u ON l.user_id = u.id
             WHERE l.contest_id = ?
             ORDER BY l.rank ASC, l.penalty_time ASC`,
            [id]
        );

        res.json({
            success: true,
            leaderboard,
            contest: {
                id: contest.id,
                title: contest.title,
                start_time: contest.start_time,
                end_time: contest.end_time,
                status: contest.status
            }
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({
            error: 'Failed to get leaderboard',
            message: error.message
        });
    }
});

// Get contest participants
router.get('/:id/participants', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 50 } = req.query;

        const offset = (page - 1) * limit;

        // Get contest details
        const contest = await req.app.locals.database.get(
            'SELECT * FROM contests WHERE id = ?',
            [id]
        );

        if (!contest) {
            return res.status(404).json({
                error: 'Contest not found',
                message: 'The requested contest does not exist'
            });
        }

        // Check if user can access this contest
        if (!contest.is_public && !req.user?.is_admin) {
            return res.status(403).json({
                error: 'Access denied',
                message: 'This contest is not public'
            });
        }

        // Get total count
        const countResult = await req.app.locals.database.get(
            'SELECT COUNT(*) as total FROM contest_registrations WHERE contest_id = ?',
            [id]
        );

        // Get participants
        const participants = await req.app.locals.database.all(
            `SELECT 
                cr.registration_time,
                u.id,
                u.username,
                u.full_name,
                u.elo_rating,
                u.country
             FROM contest_registrations cr
             JOIN users u ON cr.user_id = u.id
             WHERE cr.contest_id = ?
             ORDER BY cr.registration_time ASC
             LIMIT ? OFFSET ?`,
            [id, parseInt(limit), offset]
        );

        res.json({
            success: true,
            participants,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult.total,
                pages: Math.ceil(countResult.total / limit)
            }
        });
    } catch (error) {
        console.error('Get participants error:', error);
        res.status(500).json({
            error: 'Failed to get participants',
            message: error.message
        });
    }
});

// Admin routes
// Create new contest
router.post('/', authenticateToken, requireAdmin, validateContestCreation, handleValidationErrors, async (req, res) => {
    try {
        const contestData = {
            ...req.body,
            difficulty_range: req.body.difficulty_range ? JSON.stringify(req.body.difficulty_range) : null,
            end_time: new Date(new Date(req.body.start_time).getTime() + req.body.duration_minutes * 60000).toISOString()
        };

        const result = await req.app.locals.database.run(
            `INSERT INTO contests (
                title, description, start_time, end_time, duration_minutes,
                created_by_admin_id, max_participants, registration_deadline,
                contest_type, difficulty_range, prizes_description, rules
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                contestData.title,
                contestData.description,
                contestData.start_time,
                contestData.end_time,
                contestData.duration_minutes,
                req.user.id,
                contestData.max_participants,
                contestData.registration_deadline,
                contestData.contest_type,
                contestData.difficulty_range,
                contestData.prizes_description,
                contestData.rules
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Contest created successfully',
            contestId: result.id
        });
    } catch (error) {
        console.error('Create contest error:', error);
        res.status(500).json({
            error: 'Failed to create contest',
            message: error.message
        });
    }
});

// Update contest
router.put('/:id', authenticateToken, requireAdmin, validateContestCreation, handleValidationErrors, async (req, res) => {
    try {
        const { id } = req.params;
        const contestData = {
            ...req.body,
            difficulty_range: req.body.difficulty_range ? JSON.stringify(req.body.difficulty_range) : null,
            end_time: new Date(new Date(req.body.start_time).getTime() + req.body.duration_minutes * 60000).toISOString()
        };

        await req.app.locals.database.run(
            `UPDATE contests SET
                title = ?, description = ?, start_time = ?, end_time = ?, duration_minutes = ?,
                max_participants = ?, registration_deadline = ?, contest_type = ?,
                difficulty_range = ?, prizes_description = ?, rules = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
                contestData.title,
                contestData.description,
                contestData.start_time,
                contestData.end_time,
                contestData.duration_minutes,
                contestData.max_participants,
                contestData.registration_deadline,
                contestData.contest_type,
                contestData.difficulty_range,
                contestData.prizes_description,
                contestData.rules,
                id
            ]
        );

        res.json({
            success: true,
            message: 'Contest updated successfully'
        });
    } catch (error) {
        console.error('Update contest error:', error);
        res.status(500).json({
            error: 'Failed to update contest',
            message: error.message
        });
    }
});

// Add problem to contest
router.post('/:id/problems', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { problemId, problemOrder, pointsValue, partialScoringEnabled, timePenaltyMinutes } = req.body;

        // Validate input
        if (!problemId || !problemOrder || !pointsValue) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'Problem ID, order, and points are required'
            });
        }

        // Check if problem exists
        const problem = await req.app.locals.database.get(
            'SELECT * FROM problems WHERE id = ? AND is_active = 1',
            [problemId]
        );

        if (!problem) {
            return res.status(404).json({
                error: 'Problem not found',
                message: 'The specified problem does not exist or is not active'
            });
        }

        // Check if problem is already in contest
        const existingProblem = await req.app.locals.database.get(
            'SELECT * FROM contest_problems WHERE contest_id = ? AND problem_id = ?',
            [id, problemId]
        );

        if (existingProblem) {
            return res.status(400).json({
                error: 'Problem already in contest',
                message: 'This problem is already part of the contest'
            });
        }

        // Add problem to contest
        await req.app.locals.database.run(
            `INSERT INTO contest_problems (
                contest_id, problem_id, problem_order, points_value,
                partial_scoring_enabled, time_penalty_minutes
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                id,
                problemId,
                problemOrder,
                pointsValue,
                partialScoringEnabled || false,
                timePenaltyMinutes || 10
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Problem added to contest successfully'
        });
    } catch (error) {
        console.error('Add problem to contest error:', error);
        res.status(500).json({
            error: 'Failed to add problem to contest',
            message: error.message
        });
    }
});

// Remove problem from contest
router.delete('/:id/problems/:problemId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id, problemId } = req.params;

        const result = await req.app.locals.database.run(
            'DELETE FROM contest_problems WHERE contest_id = ? AND problem_id = ?',
            [id, problemId]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                error: 'Problem not found in contest',
                message: 'The specified problem is not part of this contest'
            });
        }

        res.json({
            success: true,
            message: 'Problem removed from contest successfully'
        });
    } catch (error) {
        console.error('Remove problem from contest error:', error);
        res.status(500).json({
            error: 'Failed to remove problem from contest',
            message: error.message
        });
    }
});

module.exports = router;

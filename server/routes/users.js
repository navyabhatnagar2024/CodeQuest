const express = require('express');
const { query, validationResult } = require('express-validator');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateUserQuery = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('search')
        .optional()
        .isLength({ min: 2 })
        .withMessage('Search term must be at least 2 characters long'),
    query('sortBy')
        .optional()
        .isIn(['elo_rating', 'total_problems_solved', 'contests_participated', 'username', 'registration_date'])
        .withMessage('Invalid sort field'),
    query('sortOrder')
        .optional()
        .isIn(['ASC', 'DESC'])
        .withMessage('Sort order must be ASC or DESC')
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

// Get all users (admin only)
router.get('/', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.is_admin) {
            return res.status(403).json({
                error: 'Access denied',
                message: 'Admin privileges required'
            });
        }

        const { page = 1, limit = 20, search, sortBy = 'username', sortOrder = 'ASC' } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereClause = '';
        let params = [];

        if (search) {
            whereClause = 'WHERE username LIKE ? OR full_name LIKE ? OR email LIKE ?';
            params = [`%${search}%`, `%${search}%`, `%${search}%`];
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
        const countResult = await req.app.locals.database.get(countQuery, params);
        const total = countResult.total;

        // Get users with pagination and sorting
        const usersQuery = `
            SELECT 
                id, username, full_name, email, is_admin, 
                CASE WHEN account_status = 'active' THEN 1 ELSE 0 END as is_active,
                elo_rating, total_problems_solved, created_at, last_login
            FROM users 
            ${whereClause}
            ORDER BY ${sortBy} ${sortOrder}
            LIMIT ? OFFSET ?
        `;
        
        const users = await req.app.locals.database.all(usersQuery, [...params, parseInt(limit), offset]);

        res.json({
            success: true,
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            error: 'Failed to get users',
            message: error.message
        });
    }
});

// Get user profile by ID
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        let user = await req.app.locals.database.get(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'The requested user does not exist'
            });
        }

        // Remove sensitive information for non-admin users
        if (!req.user?.is_admin && req.user?.id !== parseInt(id)) {
            const { password_hash, email, is_admin, is_verified, account_status, ...publicUser } = user;
            user = publicUser;
        } else {
            const { password_hash, ...userWithoutPassword } = user;
            user = userWithoutPassword;
        }

        // Get user statistics
        const stats = await req.app.locals.database.get(
            'SELECT * FROM user_statistics WHERE user_id = ?',
            [id]
        );

        // Parse JSON fields
        if (stats) {
            try {
                if (stats.problems_solved_by_difficulty) {
                    stats.problems_solved_by_difficulty = JSON.parse(stats.problems_solved_by_difficulty);
                }
                if (stats.weekly_activity) {
                    stats.weekly_activity = JSON.parse(stats.weekly_activity);
                }
                if (stats.monthly_progress) {
                    stats.monthly_progress = JSON.parse(stats.monthly_progress);
                }
            } catch (error) {
                console.error('Error parsing user statistics JSON:', error);
            }
        }

        // Get recent submissions
        const recentSubmissions = await req.app.locals.database.all(
            `SELECT 
                s.id, s.status, s.submission_time, s.language_id,
                p.title as problem_title, p.difficulty_level
             FROM submissions s
             JOIN problems p ON s.problem_id = p.id
             WHERE s.user_id = ?
             ORDER BY s.submission_time DESC
             LIMIT 10`,
            [id]
        );

        // Get recent contests participated
        const recentContests = await req.app.locals.database.all(
            `SELECT 
                c.id, c.title, c.start_time, c.end_time,
                l.rank, l.total_score, l.problems_solved
             FROM contest_registrations cr
             JOIN contests c ON cr.contest_id = c.id
             LEFT JOIN leaderboards l ON c.id = l.contest_id AND cr.user_id = l.user_id
             WHERE cr.user_id = ?
             ORDER BY c.start_time DESC
             LIMIT 10`,
            [id]
        );

        res.json({
            success: true,
            user: {
                ...user,
                statistics: stats,
                recentSubmissions,
                recentContests
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            error: 'Failed to get user',
            message: error.message
        });
    }
});

// Get user submissions
router.get('/:id/submissions', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            page = 1,
            limit = 20,
            status,
            language,
            problemId
        } = req.query;

        // Check if user exists
        const user = await req.app.locals.database.get(
            'SELECT id, username FROM users WHERE id = ?',
            [id]
        );

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'The requested user does not exist'
            });
        }

        const offset = (page - 1) * limit;
        const conditions = ['s.user_id = ?'];
        const params = [id];

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
            user: {
                id: user.id,
                username: user.username
            },
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
            error: 'Failed to get user submissions',
            message: error.message
        });
    }
});

// Get user contests
router.get('/:id/contests', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20 } = req.query;

        // Check if user exists
        const user = await req.app.locals.database.get(
            'SELECT id, username FROM users WHERE id = ?',
            [id]
        );

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'The requested user does not exist'
            });
        }

        const offset = (page - 1) * limit;

        // Get total count
        const countResult = await req.app.locals.database.get(
            'SELECT COUNT(*) as total FROM contest_registrations WHERE user_id = ?',
            [id]
        );

        // Get contests
        const contests = await req.app.locals.database.all(
            `SELECT 
                c.*,
                cr.registration_time,
                l.rank, l.total_score, l.problems_solved, l.penalty_time
             FROM contest_registrations cr
             JOIN contests c ON cr.contest_id = c.id
             LEFT JOIN leaderboards l ON c.id = l.contest_id AND cr.user_id = l.user_id
             WHERE cr.user_id = ?
             ORDER BY c.start_time DESC
             LIMIT ? OFFSET ?`,
            [id, parseInt(limit), offset]
        );

        // Add contest status
        const now = new Date();
        contests.forEach(contest => {
            const startTime = new Date(contest.start_time);
            const endTime = new Date(contest.end_time);
            if (now < startTime) {
                contest.status = 'upcoming';
            } else if (now >= startTime && now < endTime) {
                contest.status = 'ongoing';
            } else {
                contest.status = 'completed';
            }
        });

        res.json({
            success: true,
            contests,
            user: {
                id: user.id,
                username: user.username
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult.total,
                pages: Math.ceil(countResult.total / limit)
            }
        });
    } catch (error) {
        console.error('Get user contests error:', error);
        res.status(500).json({
            error: 'Failed to get user contests',
            message: error.message
        });
    }
});

// Search users
router.get('/search', optionalAuth, validateUserQuery, handleValidationErrors, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search,
            sortBy = 'elo_rating',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        const conditions = [];
        const params = [];

        // Add search filter
        if (search) {
            conditions.push('(username LIKE ? OR full_name LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        // Show only active users
        conditions.push('account_status = "active"');

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
        const countResult = await req.app.locals.database.get(countQuery, params);
        const total = countResult.total;

        // Get users
        const usersQuery = `
            SELECT 
                id, username, full_name, elo_rating, total_problems_solved,
                contests_participated, registration_date, country
             FROM users 
             ${whereClause}
             ORDER BY ${sortBy} ${sortOrder}
             LIMIT ? OFFSET ?
        `;

        const users = await req.app.locals.database.all(usersQuery, [...params, parseInt(limit), offset]);

        res.json({
            success: true,
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({
            error: 'Failed to search users',
            message: error.message
        });
    }
});

// Get global leaderboard
router.get('/leaderboard/global', optionalAuth, async (req, res) => {
    try {
        const { page = 1, limit = 50, timeFrame = 'all' } = req.query;
        const offset = (page - 1) * limit;

        let timeFilter = '';
        let timeParams = [];

        // Apply time-based filtering
        if (timeFrame === 'weekly') {
            timeFilter = 'AND DATE(submissions.submission_time) >= DATE("now", "-7 days")';
        } else if (timeFrame === 'monthly') {
            timeFilter = 'AND DATE(submissions.submission_time) >= DATE("now", "-30 days")';
        }

        // Get total count
        const countResult = await req.app.locals.database.get(
            'SELECT COUNT(*) as total FROM users'
        );

        // Get leaderboard with time-based problem solving
        let leaderboardQuery = '';
        if (timeFrame === 'all') {
            // All-time leaderboard - use total_problems_solved from users table
            leaderboardQuery = `
                SELECT 
                    u.id, u.username, u.full_name, u.total_problems_solved,
                    u.created_at, u.country, u.last_login
                FROM users u
                ORDER BY u.total_problems_solved DESC, u.username ASC
                LIMIT ? OFFSET ?
            `;
            timeParams = [parseInt(limit), offset];
        } else {
            // Weekly/Monthly leaderboard - count problems solved in time period
            leaderboardQuery = `
                SELECT 
                    u.id, u.username, u.full_name,
                    COUNT(DISTINCT s.problem_id) as total_problems_solved,
                    u.created_at, u.country, u.last_login
                FROM users u
                LEFT JOIN submissions s ON u.id = s.user_id 
                    AND s.status = 'AC' ${timeFilter}
                GROUP BY u.id, u.username, u.full_name, u.created_at, u.country, u.last_login
                ORDER BY total_problems_solved DESC, u.username ASC
                LIMIT ? OFFSET ?
            `;
            timeParams = [parseInt(limit), offset];
        }

        const leaderboard = await req.app.locals.database.all(leaderboardQuery, timeParams);

        // Add ranks
        leaderboard.forEach((user, index) => {
            user.rank = offset + index + 1;
            // Ensure total_problems_solved is a number
            user.total_problems_solved = parseInt(user.total_problems_solved) || 0;
        });

        res.json({
            success: true,
            leaderboard,
            timeFrame,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult.total,
                pages: Math.ceil(countResult.total / limit)
            }
        });
    } catch (error) {
        console.error('Get global leaderboard error:', error);
        res.status(500).json({
            error: 'Failed to get leaderboard',
            message: error.message
        });
    }
});

// Get top users by category
router.get('/leaderboard/top', optionalAuth, async (req, res) => {
    try {
        const { category = 'total_problems_solved', limit = 10 } = req.query;

        // Validate category
        const validCategories = ['total_problems_solved', 'created_at'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                error: 'Invalid category',
                message: 'Category must be one of: total_problems_solved, created_at'
            });
        }

        // Get top users
        const topUsers = await req.app.locals.database.all(
            `SELECT 
                id, username, full_name, total_problems_solved,
                created_at, country, last_login
             FROM users 
             ORDER BY ${category} DESC
             LIMIT ?`,
            [parseInt(limit)]
        );

        // Add ranks
        topUsers.forEach((user, index) => {
            user.rank = index + 1;
        });

        res.json({
            success: true,
            category,
            topUsers
        });
    } catch (error) {
        console.error('Get top users error:', error);
        res.status(500).json({
            error: 'Failed to get top users',
            message: error.message
        });
    }
});

// Get user achievements
router.get('/:id/achievements', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const user = await req.app.locals.database.get(
            'SELECT id, username, elo_rating, total_problems_solved, contests_participated FROM users WHERE id = ?',
            [id]
        );

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'The requested user does not exist'
            });
        }

        // Calculate achievements based on user stats
        const achievements = [];

        // Elo rating achievements
        if (user.elo_rating >= 2000) {
            achievements.push({
                name: 'Grandmaster',
                description: 'Reached 2000+ Elo rating',
                icon: '🏆',
                unlocked: true,
                unlockedAt: user.registration_date
            });
        } else if (user.elo_rating >= 1800) {
            achievements.push({
                name: 'Master',
                description: 'Reached 1800+ Elo rating',
                icon: '🥇',
                unlocked: true,
                unlockedAt: user.registration_date
            });
        } else if (user.elo_rating >= 1600) {
            achievements.push({
                name: 'Expert',
                description: 'Reached 1600+ Elo rating',
                icon: '🥈',
                unlocked: true,
                unlockedAt: user.registration_date
            });
        } else if (user.elo_rating >= 1400) {
            achievements.push({
                name: 'Specialist',
                description: 'Reached 1400+ Elo rating',
                icon: '🥉',
                unlocked: true,
                unlockedAt: user.registration_date
            });
        }

        // Problem solving achievements
        if (user.total_problems_solved >= 1000) {
            achievements.push({
                name: 'Problem Solver Extraordinaire',
                description: 'Solved 1000+ problems',
                icon: '💡',
                unlocked: true,
                unlockedAt: user.registration_date
            });
        } else if (user.total_problems_solved >= 500) {
            achievements.push({
                name: 'Dedicated Solver',
                description: 'Solved 500+ problems',
                icon: '📚',
                unlocked: true,
                unlockedAt: user.registration_date
            });
        } else if (user.total_problems_solved >= 100) {
            achievements.push({
                name: 'Problem Solver',
                description: 'Solved 100+ problems',
                icon: '✅',
                unlocked: true,
                unlockedAt: user.registration_date
            });
        }

        // Contest participation achievements
        if (user.contests_participated >= 50) {
            achievements.push({
                name: 'Contest Veteran',
                description: 'Participated in 50+ contests',
                icon: '🏁',
                unlocked: true,
                unlockedAt: user.registration_date
            });
        } else if (user.contests_participated >= 20) {
            achievements.push({
                name: 'Contest Enthusiast',
                description: 'Participated in 20+ contests',
                icon: '🎯',
                unlocked: true,
                unlockedAt: user.registration_date
            });
        } else if (user.contests_participated >= 5) {
            achievements.push({
                name: 'Contest Participant',
                description: 'Participated in 5+ contests',
                icon: '🎪',
                unlocked: true,
                unlockedAt: user.registration_date
            });
        }

        // Get contest wins
        const contestWins = await req.app.locals.database.get(
            'SELECT COUNT(*) as count FROM leaderboards WHERE user_id = ? AND rank = 1',
            [id]
        );

        if (contestWins.count >= 10) {
            achievements.push({
                name: 'Champion',
                description: 'Won 10+ contests',
                icon: '👑',
                unlocked: true,
                unlockedAt: user.registration_date
            });
        } else if (contestWins.count >= 5) {
            achievements.push({
                name: 'Winner',
                description: 'Won 5+ contests',
                icon: '🏅',
                unlocked: true,
                unlockedAt: user.registration_date
            });
        } else if (contestWins.count >= 1) {
            achievements.push({
                name: 'First Victory',
                description: 'Won your first contest',
                icon: '🎉',
                unlocked: true,
                unlockedAt: user.registration_date
            });
        }

        res.json({
            success: true,
            achievements,
            totalAchievements: achievements.length
        });
    } catch (error) {
        console.error('Get user achievements error:', error);
        res.status(500).json({
            error: 'Failed to get user achievements',
            message: error.message
        });
    }
});

// Get user activity
router.get('/:id/activity', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { days = 30 } = req.query;

        // Check if user exists
        const user = await req.app.locals.database.get(
            'SELECT id, username FROM users WHERE id = ?',
            [id]
        );

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'The requested user does not exist'
            });
        }

        // Get submissions in the last N days
        const submissions = await req.app.locals.database.all(
            `SELECT 
                DATE(s.submission_time) as date,
                COUNT(*) as total_submissions,
                SUM(CASE WHEN s.status = 'AC' THEN 1 ELSE 0 END) as accepted_submissions
             FROM submissions s
             WHERE s.user_id = ? AND s.submission_time >= DATE('now', '-${days} days')
             GROUP BY DATE(s.submission_time)
             ORDER BY date DESC`,
            [id]
        );

        // Get contest participations in the last N days
        const contests = await req.app.locals.database.all(
            `SELECT 
                DATE(c.start_time) as date,
                c.title,
                l.rank,
                l.total_score
             FROM contest_registrations cr
             JOIN contests c ON cr.contest_id = c.id
             LEFT JOIN leaderboards l ON c.id = l.contest_id AND cr.user_id = l.user_id
             WHERE cr.user_id = ? AND c.start_time >= DATE('now', '-${days} days')
             ORDER BY c.start_time DESC`,
            [id]
        );

        res.json({
            success: true,
            activity: {
                submissions,
                contests
            },
            period: `${days} days`
        });
    } catch (error) {
        console.error('Get user activity error:', error);
        res.status(500).json({
            error: 'Failed to get user activity',
            message: error.message
        });
    }
});

module.exports = router;

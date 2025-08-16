const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateAdminQuery = [
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
        .withMessage('Search term must be at least 2 characters long')
];

const validateUserUpdate = [
    body('is_admin')
        .optional()
        .isBoolean()
        .withMessage('is_admin must be a boolean'),
    body('is_verified')
        .optional()
        .isBoolean()
        .withMessage('is_verified must be a boolean'),
    body('account_status')
        .optional()
        .isIn(['active', 'suspended', 'banned'])
        .withMessage('Account status must be active, suspended, or banned'),
    body('elo_rating')
        .optional()
        .isInt({ min: 0, max: 3000 })
        .withMessage('Elo rating must be between 0 and 3000')
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

// Get system statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // Get database statistics
        const dbStats = await req.app.locals.database.getStats();

        // Get user statistics
        const userStats = await req.app.locals.database.all(
            `SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN is_admin = 1 THEN 1 ELSE 0 END) as admin_users,
                SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END) as verified_users,
                SUM(CASE WHEN account_status = 'active' THEN 1 ELSE 0 END) as active_users,
                SUM(CASE WHEN account_status = 'suspended' THEN 1 ELSE 0 END) as suspended_users,
                SUM(CASE WHEN account_status = 'banned' THEN 1 ELSE 0 END) as banned_users,
                AVG(elo_rating) as avg_elo_rating,
                AVG(total_problems_solved) as avg_problems_solved
             FROM users`
        );

        // Get problem statistics
        const problemStats = await req.app.locals.database.all(
            `SELECT 
                COUNT(*) as total_problems,
                SUM(CASE WHEN difficulty_level = 'Easy' THEN 1 ELSE 0 END) as easy_problems,
                SUM(CASE WHEN difficulty_level = 'Medium' THEN 1 ELSE 0 END) as medium_problems,
                SUM(CASE WHEN difficulty_level = 'Hard' THEN 1 ELSE 0 END) as hard_problems,
                SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_problems
             FROM problems`
        );

        // Get contest statistics
        const contestStats = await req.app.locals.database.all(
            `SELECT 
                COUNT(*) as total_contests,
                SUM(CASE WHEN contest_type = 'Rated' THEN 1 ELSE 0 END) as rated_contests,
                SUM(CASE WHEN contest_type = 'Unrated' THEN 1 ELSE 0 END) as unrated_contests,
                SUM(CASE WHEN contest_type = 'Practice' THEN 1 ELSE 0 END) as practice_contests,
                SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_contests
             FROM contests`
        );

        // Get submission statistics
        const submissionStats = await req.app.locals.database.all(
            `SELECT 
                COUNT(*) as total_submissions,
                SUM(CASE WHEN status = 'AC' THEN 1 ELSE 0 END) as accepted_submissions,
                SUM(CASE WHEN status = 'WA' THEN 1 ELSE 0 END) as wrong_answer_submissions,
                SUM(CASE WHEN status = 'TLE' THEN 1 ELSE 0 END) as time_limit_submissions,
                SUM(CASE WHEN status = 'MLE' THEN 1 ELSE 0 END) as memory_limit_submissions,
                SUM(CASE WHEN status = 'CE' THEN 1 ELSE 0 END) as compilation_error_submissions,
                SUM(CASE WHEN status = 'RE' THEN 1 ELSE 0 END) as runtime_error_submissions,
                AVG(execution_time_ms) as avg_execution_time,
                AVG(memory_used_kb) as avg_memory_used
             FROM submissions`
        );

        // Get recent activity (last 7 days)
        const recentActivity = await req.app.locals.database.all(
            `SELECT 
                DATE(created_at) as date,
                COUNT(*) as new_users
             FROM users 
             WHERE created_at >= DATE('now', '-7 days')
             GROUP BY DATE(created_at)
             ORDER BY date DESC`
        );

        // Get top problems by submissions
        const topProblems = await req.app.locals.database.all(
            `SELECT 
                p.title,
                p.difficulty_level,
                COUNT(s.id) as submission_count,
                SUM(CASE WHEN s.status = 'AC' THEN 1 ELSE 0 END) as accepted_count
             FROM problems p
             LEFT JOIN submissions s ON p.id = s.problem_id
             GROUP BY p.id
             ORDER BY submission_count DESC
             LIMIT 10`
        );

        res.json({
            success: true,
            statistics: {
                database: dbStats,
                users: userStats[0],
                problems: problemStats[0],
                contests: contestStats[0],
                submissions: submissionStats[0],
                recentActivity,
                topProblems
            }
        });
    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({
            error: 'Failed to get system statistics',
            message: error.message
        });
    }
});

// Get all users (admin only)
router.get('/users', authenticateToken, requireAdmin, validateAdminQuery, handleValidationErrors, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            search,
            status,
            role
        } = req.query;

        const offset = (page - 1) * limit;
        const conditions = [];
        const params = [];

        // Add search filter
        if (search) {
            conditions.push('(username LIKE ? OR email LIKE ? OR full_name LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        // Add status filter
        if (status) {
            conditions.push('account_status = ?');
            params.push(status);
        }

        // Add role filter
        if (role === 'admin') {
            conditions.push('is_admin = 1');
        } else if (role === 'user') {
            conditions.push('is_admin = 0');
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
        const countResult = await req.app.locals.database.get(countQuery, params);
        const total = countResult.total;

        // Get users
        const usersQuery = `
            SELECT 
                id, username, email, full_name, elo_rating, total_problems_solved,
                contests_participated, registration_date, last_login, is_admin,
                is_verified, account_status, preferred_language, timezone, country
             FROM users 
             ${whereClause}
             ORDER BY registration_date DESC
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
        console.error('Get admin users error:', error);
        res.status(500).json({
            error: 'Failed to get users',
            message: error.message
        });
    }
});

// Update user (admin only)
router.put('/users/:id', authenticateToken, requireAdmin, validateUserUpdate, handleValidationErrors, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check if user exists
        const user = await req.app.locals.database.get(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'The requested user does not exist'
            });
        }

        // Build update query
        const updates = [];
        const values = [];

        for (const [field, value] of Object.entries(updateData)) {
            if (value !== undefined) {
                updates.push(`${field} = ?`);
                values.push(value);
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({
                error: 'No fields to update',
                message: 'Please provide at least one field to update'
            });
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        await req.app.locals.database.run(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        // Get updated user
        const updatedUser = await req.app.locals.database.get(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );

        const { password_hash, ...userWithoutPassword } = updatedUser;

        res.json({
            success: true,
            message: 'User updated successfully',
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            error: 'Failed to update user',
            message: error.message
        });
    }
});

// Delete user (admin only)
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const user = await req.app.locals.database.get(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'The requested user does not exist'
            });
        }

        // Prevent deleting admin users
        if (user.is_admin) {
            return res.status(400).json({
                error: 'Cannot delete admin user',
                message: 'Admin users cannot be deleted'
            });
        }

        // Delete user (cascade will handle related data)
        await req.app.locals.database.run(
            'DELETE FROM users WHERE id = ?',
            [id]
        );

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            error: 'Failed to delete user',
            message: error.message
        });
    }
});

// Get system logs
router.get('/logs', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 100, level, startDate, endDate } = req.query;
        const offset = (page - 1) * limit;

        // In a real implementation, you would have a logs table
        // For now, we'll return a mock response
        const logs = [
            {
                id: 1,
                level: 'INFO',
                message: 'Server started successfully',
                timestamp: new Date().toISOString(),
                userId: null,
                ip: '127.0.0.1'
            },
            {
                id: 2,
                level: 'INFO',
                message: 'User registered: john_doe',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                userId: 1,
                ip: '192.168.1.1'
            }
        ];

        res.json({
            success: true,
            logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: logs.length,
                pages: 1
            }
        });
    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({
            error: 'Failed to get logs',
            message: error.message
        });
    }
});

// Get system health
router.get('/health', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // Check database health
        const dbHealth = await req.app.locals.database.healthCheck();

        // Check Judge0 health
        const judge0Health = await req.app.locals.judge0Service?.healthCheck() || false;

        // Get system information
        const systemInfo = {
            nodeVersion: process.version,
            platform: process.platform,
            memoryUsage: process.memoryUsage(),
            uptime: process.uptime(),
            database: dbHealth,
            judge0: judge0Health
        };

        res.json({
            success: true,
            health: systemInfo,
            status: dbHealth && judge0Health ? 'healthy' : 'unhealthy'
        });
    } catch (error) {
        console.error('Get health error:', error);
        res.status(500).json({
            error: 'Failed to get system health',
            message: error.message
        });
    }
});

// Get platform analytics
router.get('/analytics', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { period = '30' } = req.query;

        // Get user growth over time
        const userGrowth = await req.app.locals.database.all(
            `SELECT 
                DATE(registration_date) as date,
                COUNT(*) as new_users
             FROM users 
             WHERE registration_date >= DATE('now', '-${period} days')
             GROUP BY DATE(registration_date)
             ORDER BY date ASC`
        );

        // Get submission activity over time
        const submissionActivity = await req.app.locals.database.all(
            `SELECT 
                DATE(submission_time) as date,
                COUNT(*) as total_submissions,
                SUM(CASE WHEN status = 'AC' THEN 1 ELSE 0 END) as accepted_submissions
             FROM submissions 
             WHERE submission_time >= DATE('now', '-${period} days')
             GROUP BY DATE(submission_time)
             ORDER BY date ASC`
        );

        // Get contest participation over time
        const contestParticipation = await req.app.locals.database.all(
            `SELECT 
                DATE(c.start_time) as date,
                COUNT(DISTINCT c.id) as contests_started,
                COUNT(cr.user_id) as total_participations
             FROM contests c
             LEFT JOIN contest_registrations cr ON c.id = cr.contest_id
             WHERE c.start_time >= DATE('now', '-${period} days')
             GROUP BY DATE(c.start_time)
             ORDER BY date ASC`
        );

        // Get top languages used
        const topLanguages = await req.app.locals.database.all(
            `SELECT 
                language_id,
                COUNT(*) as usage_count,
                SUM(CASE WHEN status = 'AC' THEN 1 ELSE 0 END) as success_count
             FROM submissions 
             WHERE submission_time >= DATE('now', '-${period} days')
             GROUP BY language_id
             ORDER BY usage_count DESC
             LIMIT 10`
        );

        // Get problem difficulty distribution
        const problemDifficulty = await req.app.locals.database.all(
            `SELECT 
                p.difficulty_level,
                COUNT(s.id) as submission_count,
                SUM(CASE WHEN s.status = 'AC' THEN 1 ELSE 0 END) as accepted_count,
                AVG(s.execution_time_ms) as avg_execution_time
             FROM problems p
             LEFT JOIN submissions s ON p.id = s.problem_id
             WHERE s.submission_time >= DATE('now', '-${period} days')
             GROUP BY p.difficulty_level`
        );

        res.json({
            success: true,
            analytics: {
                period: `${period} days`,
                userGrowth,
                submissionActivity,
                contestParticipation,
                topLanguages,
                problemDifficulty
            }
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            error: 'Failed to get analytics',
            message: error.message
        });
    }
});

// Get system settings
router.get('/settings', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const settings = await req.app.locals.database.all(
            'SELECT * FROM system_settings ORDER BY setting_key'
        );

        res.json({
            success: true,
            settings
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            error: 'Failed to get system settings',
            message: error.message
        });
    }
});

// Update system settings
router.put('/settings', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { settings } = req.body;

        if (!Array.isArray(settings)) {
            return res.status(400).json({
                error: 'Invalid settings format',
                message: 'Settings must be an array'
            });
        }

        // Update each setting
        for (const setting of settings) {
            if (setting.key && setting.value !== undefined) {
                await req.app.locals.database.run(
                    'UPDATE system_settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?',
                    [setting.value, setting.key]
                );
            }
        }

        res.json({
            success: true,
            message: 'Settings updated successfully'
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({
            error: 'Failed to update settings',
            message: error.message
        });
    }
});

// Backup database
router.post('/backup', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // In a real implementation, you would create a database backup
        // For now, we'll return a mock response
        const backupInfo = {
            filename: `backup_${new Date().toISOString().split('T')[0]}.db`,
            size: '2.5 MB',
            timestamp: new Date().toISOString(),
            status: 'completed'
        };

        res.json({
            success: true,
            message: 'Database backup created successfully',
            backup: backupInfo
        });
    } catch (error) {
        console.error('Backup error:', error);
        res.status(500).json({
            error: 'Failed to create backup',
            message: error.message
        });
    }
});

// Get notifications
router.get('/notifications', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        // Get total count
        const countResult = await req.app.locals.database.get(
            'SELECT COUNT(*) as total FROM notifications'
        );

        // Get notifications
        const notifications = await req.app.locals.database.all(
            `SELECT 
                n.*,
                u.username
             FROM notifications n
             LEFT JOIN users u ON n.user_id = u.id
             ORDER BY n.created_at DESC
             LIMIT ? OFFSET ?`,
            [parseInt(limit), offset]
        );

        res.json({
            success: true,
            notifications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult.total,
                pages: Math.ceil(countResult.total / limit)
            }
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            error: 'Failed to get notifications',
            message: error.message
        });
    }
});

// Send notification to user
router.post('/notifications', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { userId, title, message, type = 'info' } = req.body;

        if (!userId || !title || !message) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'User ID, title, and message are required'
            });
        }

        // Check if user exists
        const user = await req.app.locals.database.get(
            'SELECT id FROM users WHERE id = ?',
            [userId]
        );

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'The specified user does not exist'
            });
        }

        // Create notification
        await req.app.locals.database.run(
            'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
            [userId, title, message, type]
        );

        res.status(201).json({
            success: true,
            message: 'Notification sent successfully'
        });
    } catch (error) {
        console.error('Send notification error:', error);
        res.status(500).json({
            error: 'Failed to send notification',
            message: error.message
        });
    }
});

module.exports = router;

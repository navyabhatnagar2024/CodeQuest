const express = require('express');
const { body, validationResult } = require('express-validator');
const authService = require('../services/authService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateRegistration = [
    body('username')
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    body('full_name')
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters')
        .trim()
        .escape(),
    body('country')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Country name too long'),
    body('timezone')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Timezone name too long')
];

const validateLogin = [
    body('username')
        .notEmpty()
        .withMessage('Username or email is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

const validateProfileUpdate = [
    body('full_name')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters')
        .trim()
        .escape(),
    body('bio')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Bio must be less than 500 characters')
        .trim()
        .escape(),
    body('country')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Country name too long'),
    body('timezone')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Timezone name too long'),
    body('github_url')
        .optional()
        .isURL()
        .withMessage('Please provide a valid GitHub URL'),
    body('website_url')
        .optional()
        .isURL()
        .withMessage('Please provide a valid website URL'),
    body('preferred_language')
        .optional()
        .isIn(['javascript', 'python', 'cpp', 'c', 'java', 'csharp', 'r', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'scala', 'typescript'])
        .withMessage('Invalid preferred language')
];

const validatePasswordChange = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
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

// Register new user
router.post('/register', validateRegistration, handleValidationErrors, async (req, res) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json({
            success: true,
            message: result.message,
            user: result.user
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({
            error: 'Registration failed',
            message: error.message
        });
    }
});

// Login user
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
    try {
        const result = await authService.login(req.body);
        res.json({
            success: true,
            message: 'Login successful',
            user: result.user,
            token: result.token,
            refreshToken: result.refreshToken,
            expiresIn: result.expiresIn
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({
            error: 'Login failed',
            message: error.message
        });
    }
});

// Logout user
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        const result = await authService.logout(token);
        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            error: 'Logout failed',
            message: error.message
        });
    }
});

// Refresh token
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({
                error: 'Refresh token required',
                message: 'Please provide a refresh token'
            });
        }

        const result = await authService.refreshToken(refreshToken);
        res.json({
            success: true,
            message: 'Token refreshed successfully',
            token: result.token,
            refreshToken: result.refreshToken,
            expiresIn: result.expiresIn
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({
            error: 'Token refresh failed',
            message: error.message
        });
    }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await authService.getUserById(req.user.id);
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User profile not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            error: 'Failed to get profile',
            message: error.message
        });
    }
});

// Update user profile
router.put('/profile', authenticateToken, validateProfileUpdate, handleValidationErrors, async (req, res) => {
    try {
        const updatedUser = await authService.updateProfile(req.user.id, req.body);
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(400).json({
            error: 'Profile update failed',
            message: error.message
        });
    }
});

// Change password
router.put('/change-password', authenticateToken, validatePasswordChange, handleValidationErrors, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
        
        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(400).json({
            error: 'Password change failed',
            message: error.message
        });
    }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const stats = await authService.getUserStats(req.user.id);
        if (!stats) {
            return res.status(404).json({
                error: 'Statistics not found',
                message: 'User statistics not found'
            });
        }

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            error: 'Failed to get statistics',
            message: error.message
        });
    }
});

// Verify token (for frontend token validation)
router.post('/verify', async (req, res) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({
                error: 'Token required',
                message: 'Please provide a token'
            });
        }

        const user = await authService.validateSession(token);
        if (!user) {
            return res.status(401).json({
                error: 'Invalid token',
                message: 'Token is invalid or expired'
            });
        }

        res.json({
            success: true,
            message: 'Token is valid',
            user
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({
            error: 'Token verification failed',
            message: error.message
        });
    }
});

// Get user by username (public endpoint)
router.get('/user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await authService.getUserByUsername(username);
        
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User does not exist'
            });
        }

        // Remove sensitive information
        const { email, is_admin, is_verified, account_status, ...publicUser } = user;
        
        res.json({
            success: true,
            user: publicUser
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            error: 'Failed to get user',
            message: error.message
        });
    }
});

module.exports = router;

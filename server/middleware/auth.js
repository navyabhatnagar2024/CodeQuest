const authService = require('../services/authService');

// Authentication middleware
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ 
                error: 'Access token required',
                message: 'Please provide a valid authentication token' 
            });
        }

        // Verify token and get user
        const user = await authService.validateSession(token);
        if (!user) {
            return res.status(401).json({ 
                error: 'Invalid token',
                message: 'Token is invalid or expired' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ 
            error: 'Authentication failed',
            message: 'Invalid authentication token' 
        });
    }
};

// Admin authorization middleware
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            error: 'Authentication required',
            message: 'Please log in to access this resource' 
        });
    }

    if (!req.user.is_admin) {
        return res.status(403).json({ 
            error: 'Admin access required',
            message: 'You do not have permission to access this resource' 
        });
    }

    next();
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const user = await authService.validateSession(token);
            if (user) {
                req.user = user;
            }
        }
        
        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

// Rate limiting middleware for submissions
const submissionRateLimit = (req, res, next) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ 
            error: 'Authentication required',
            message: 'Please log in to submit code' 
        });
    }

    // Simple in-memory rate limiting (in production, use Redis)
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxSubmissions = 10; // Max 10 submissions per minute

    if (!req.app.locals.submissionRateLimit) {
        req.app.locals.submissionRateLimit = new Map();
    }

    const userSubmissions = req.app.locals.submissionRateLimit.get(userId) || [];
    
    // Remove old submissions outside the window
    const recentSubmissions = userSubmissions.filter(time => now - time < windowMs);
    
    if (recentSubmissions.length >= maxSubmissions) {
        return res.status(429).json({ 
            error: 'Rate limit exceeded',
            message: 'Too many submissions. Please wait before submitting again.' 
        });
    }

    // Add current submission
    recentSubmissions.push(now);
    req.app.locals.submissionRateLimit.set(userId, recentSubmissions);

    next();
};

// Contest access middleware
const requireContestAccess = async (req, res, next) => {
    try {
        const { contestId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ 
                error: 'Authentication required',
                message: 'Please log in to access contest' 
            });
        }

        // Check if user is registered for the contest
        const registration = await req.app.locals.database.get(
            'SELECT * FROM contest_registrations WHERE contest_id = ? AND user_id = ?',
            [contestId, userId]
        );

        if (!registration) {
            return res.status(403).json({ 
                error: 'Contest access denied',
                message: 'You are not registered for this contest' 
            });
        }

        req.contestRegistration = registration;
        next();
    } catch (error) {
        console.error('Contest access check error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to verify contest access' 
        });
    }
};

// Problem access middleware
const requireProblemAccess = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        // Get problem details
        const problem = await req.app.locals.database.get(
            'SELECT * FROM problems WHERE id = ? AND is_active = 1',
            [id]
        );

        if (!problem) {
            return res.status(404).json({ 
                error: 'Problem not found',
                message: 'The requested problem does not exist or is not active' 
            });
        }

        req.problem = problem;
        next();
    } catch (error) {
        console.error('Problem access check error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to verify problem access' 
        });
    }
};

// Contest time validation middleware
const validateContestTime = async (req, res, next) => {
    try {
        const { contestId } = req.params;
        
        const contest = await req.app.locals.database.get(
            'SELECT * FROM contests WHERE id = ?',
            [contestId]
        );

        if (!contest) {
            return res.status(404).json({ 
                error: 'Contest not found',
                message: 'The requested contest does not exist' 
            });
        }

        const now = new Date();
        const startTime = new Date(contest.start_time);
        const endTime = new Date(contest.end_time);

        if (now < startTime) {
            return res.status(403).json({ 
                error: 'Contest not started',
                message: 'This contest has not started yet' 
            });
        }

        if (now > endTime) {
            return res.status(403).json({ 
                error: 'Contest ended',
                message: 'This contest has already ended' 
            });
        }

        req.contest = contest;
        next();
    } catch (error) {
        console.error('Contest time validation error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to validate contest time' 
        });
    }
};

// Input validation middleware
const validateSubmission = (req, res, next) => {
    const { sourceCode, language, problemId } = req.body;

    if (!sourceCode || !language || !problemId) {
        return res.status(400).json({ 
            error: 'Missing required fields',
            message: 'Source code, language, and problem ID are required' 
        });
    }

    if (typeof sourceCode !== 'string' || sourceCode.trim().length === 0) {
        return res.status(400).json({ 
            error: 'Invalid source code',
            message: 'Source code cannot be empty' 
        });
    }

    const maxLength = parseInt(process.env.MAX_SUBMISSION_LENGTH) || 50000;
    if (sourceCode.length > maxLength) {
        return res.status(400).json({ 
            error: 'Source code too long',
            message: `Source code cannot exceed ${maxLength} characters` 
        });
    }

    // Validate language
    const supportedLanguages = ['javascript', 'python', 'cpp', 'c', 'java', 'csharp', 'r', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'scala', 'typescript'];
    if (!supportedLanguages.includes(language.toLowerCase())) {
        return res.status(400).json({ 
            error: 'Unsupported language',
            message: `Language '${language}' is not supported` 
        });
    }

    next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    if (err.name === 'ValidationError') {
        return res.status(400).json({ 
            error: 'Validation error',
            message: err.message 
        });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ 
            error: 'Unauthorized',
            message: 'Invalid authentication token' 
        });
    }

    if (err.name === 'ForbiddenError') {
        return res.status(403).json({ 
            error: 'Forbidden',
            message: 'You do not have permission to access this resource' 
        });
    }

    // Default error
    res.status(500).json({ 
        error: 'Internal server error',
        message: 'Something went wrong on the server' 
    });
};

// CORS middleware
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
};

module.exports = {
    authenticateToken,
    requireAdmin,
    optionalAuth,
    submissionRateLimit,
    requireContestAccess,
    requireProblemAccess,
    validateContestTime,
    validateSubmission,
    errorHandler,
    corsOptions
};

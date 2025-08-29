const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config();

// Import services and middleware
const database = require('./database/connection');
const authService = require('./services/authService');
const judge0Service = require('./services/judge0Service');
const llmService = require('./services/llmService');
const { 
    authenticateToken, 
    requireAdmin, 
    optionalAuth, 
    submissionRateLimit,
    errorHandler, 
    corsOptions 
} = require('./middleware/auth');

// Import route handlers
const authRoutes = require('./routes/auth');
const problemRoutes = require('./routes/problems');
const submissionRoutes = require('./routes/submissions');
const contestRoutes = require('./routes/contests');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const gamificationRoutes = require('./routes/gamification');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Store database instance in app locals for middleware access
app.locals.database = database;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Compression middleware
app.use(compression());

// CORS middleware
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests',
        message: 'Too many requests from this IP, please try again later.'
    }
});

const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // allow 50 requests per 15 minutes, then...
    delayMs: 500 // begin adding 500ms of delay per request above 50
});

app.use('/api/', limiter);
app.use('/api/', speedLimiter);

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const dbHealth = await database.healthCheck();
        const judge0Health = await judge0Service.healthCheck();
        const llmHealth = await llmService.healthCheck();
        
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                database: dbHealth ? 'healthy' : 'unhealthy',
                judge0: judge0Health ? 'healthy' : 'unhealthy',
                llm: llmHealth ? 'healthy' : 'unhealthy'
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/gamification', gamificationRoutes);

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });
}

// Error handling middleware
app.use(errorHandler);

// WebSocket connection handling
const connectedUsers = new Map();
const contestRooms = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Authenticate user
    socket.on('authenticate', async (token) => {
        try {
            const user = await authService.validateSession(token);
            if (user) {
                socket.userId = user.id;
                socket.username = user.username;
                connectedUsers.set(user.id, socket.id);
                
                socket.emit('authenticated', { 
                    success: true, 
                    user: { id: user.id, username: user.username } 
                });
                
                console.log(`User ${user.username} authenticated via WebSocket`);
            } else {
                socket.emit('authenticated', { success: false, error: 'Invalid token' });
            }
        } catch (error) {
            socket.emit('authenticated', { success: false, error: 'Authentication failed' });
        }
    });

    // Join contest room
    socket.on('join-contest', (contestId) => {
        if (!socket.userId) {
            socket.emit('error', { message: 'Authentication required' });
            return;
        }

        socket.join(`contest-${contestId}`);
        contestRooms.set(socket.id, contestId);
        
        socket.emit('joined-contest', { contestId });
        console.log(`User ${socket.username} joined contest ${contestId}`);
    });

    // Leave contest room
    socket.on('leave-contest', (contestId) => {
        socket.leave(`contest-${contestId}`);
        contestRooms.delete(socket.id);
        
        socket.emit('left-contest', { contestId });
        console.log(`User ${socket.username} left contest ${contestId}`);
    });

    // Handle submission updates
    socket.on('submission-update', (data) => {
        const { contestId, submissionId, status, userId } = data;
        
        if (contestId) {
            io.to(`contest-${contestId}`).emit('submission-updated', {
                submissionId,
                status,
                userId,
                timestamp: new Date().toISOString()
            });
        }
    });

    // Handle leaderboard updates
    socket.on('leaderboard-update', (data) => {
        const { contestId, leaderboard } = data;
        
        if (contestId) {
            io.to(`contest-${contestId}`).emit('leaderboard-updated', {
                leaderboard,
                timestamp: new Date().toISOString()
            });
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        if (socket.userId) {
            connectedUsers.delete(socket.userId);
            contestRooms.delete(socket.id);
            console.log(`User ${socket.username} disconnected`);
        }
    });
});

// Store io instance in app locals for route access
app.locals.io = io;

// Scheduled tasks
const cron = require('node-cron');

// Clean expired sessions every hour
cron.schedule('0 * * * *', async () => {
    try {
        const cleaned = await authService.cleanExpiredSessions();
        console.log(`Cleaned ${cleaned} expired sessions`);
    } catch (error) {
        console.error('Error cleaning expired sessions:', error);
    }
});

// Update contest status every minute
cron.schedule('* * * * *', async () => {
    try {
        // Update ongoing contests
        await database.run(`
            UPDATE contests 
            SET is_active = 0 
            WHERE end_time <= CURRENT_TIMESTAMP AND is_active = 1
        `);
        
        // Start contests that should have started
        await database.run(`
            UPDATE contests 
            SET is_active = 1 
            WHERE start_time <= CURRENT_TIMESTAMP AND end_time > CURRENT_TIMESTAMP AND is_active = 0
        `);
    } catch (error) {
        console.error('Error updating contest status:', error);
    }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    
    try {
        await database.close();
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    
    try {
        await database.close();
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Database: ${database.dbPath}`);
    console.log(`Judge0 API: ${judge0Service.apiUrl}`);
});

module.exports = { app, server, io };

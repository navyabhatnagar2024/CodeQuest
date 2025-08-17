const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const database = require('../database/connection');

class AuthService {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
        this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
        this.refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
        this.saltRounds = 12;
    }

    // Hash password
    async hashPassword(password) {
        return await bcrypt.hash(password, this.saltRounds);
    }

    // Compare password with hash
    async comparePassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }

    // Generate JWT token
    generateToken(payload) {
        return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
    }

    // Generate refresh token
    generateRefreshToken() {
        return uuidv4();
    }

    // Verify JWT token
    verifyToken(token) {
        try {
            return jwt.verify(token, this.jwtSecret);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    // Register new user
    async register(userData) {
        const { username, email, password, full_name, country, timezone } = userData;

        // Validate input
        if (!username || !email || !password || !full_name) {
            throw new Error('Missing required fields');
        }

        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        // Check if username or email already exists
        const existingUser = await database.get(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUser) {
            throw new Error('Username or email already exists');
        }

        // Hash password
        const passwordHash = await this.hashPassword(password);

        // Insert new user
        const result = await database.run(
            `INSERT INTO users (username, email, password_hash, full_name, country, timezone) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [username, email, passwordHash, full_name, country || null, timezone || 'UTC']
        );

        // Create user statistics record
        await database.run(
            'INSERT INTO user_statistics (user_id) VALUES (?)',
            [result.id]
        );

        // Get created user (without password)
        const user = await this.getUserById(result.id);
        
        return {
            user,
            message: 'User registered successfully'
        };
    }

    // Login user
    async login(credentials) {
        const { username, password } = credentials;

        if (!username || !password) {
            throw new Error('Username and password are required');
        }

        // Find user by username or email
        const user = await database.get(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, username]
        );

        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        const isValidPassword = await this.comparePassword(password, user.password_hash);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        // Update last login
        await database.run(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [user.id]
        );

        // Generate tokens
        const token = this.generateToken({
            userId: user.id,
            username: user.username,
            isAdmin: user.is_admin
        });

        const refreshToken = this.generateRefreshToken();

        // Store refresh token
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await database.run(
            `INSERT INTO user_sessions (user_id, session_token, refresh_token, expires_at) 
             VALUES (?, ?, ?, ?)`,
            [user.id, token, refreshToken, expiresAt.toISOString()]
        );

        // Remove password from user object
        const { password_hash, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            token,
            refreshToken,
            expiresIn: this.jwtExpiresIn
        };
    }

    // Logout user
    async logout(token) {
        try {
            await database.run(
                'DELETE FROM user_sessions WHERE session_token = ?',
                [token]
            );
            return { message: 'Logged out successfully' };
        } catch (error) {
            console.error('Error during logout:', error);
            throw new Error('Logout failed');
        }
    }

    // Refresh token
    async refreshToken(refreshToken) {
        const session = await database.get(
            'SELECT * FROM user_sessions WHERE refresh_token = ? AND expires_at > CURRENT_TIMESTAMP',
            [refreshToken]
        );

        if (!session) {
            throw new Error('Invalid refresh token');
        }

        // Get user
        const user = await this.getUserById(session.user_id);
        if (!user) {
            throw new Error('User not found');
        }

        // Generate new tokens
        const newToken = this.generateToken({
            userId: user.id,
            username: user.username,
            isAdmin: user.is_admin
        });

        const newRefreshToken = this.generateRefreshToken();

        // Update session
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await database.run(
            `UPDATE user_sessions 
             SET session_token = ?, refresh_token = ?, expires_at = ? 
             WHERE refresh_token = ?`,
            [newToken, newRefreshToken, expiresAt.toISOString(), refreshToken]
        );

        return {
            token: newToken,
            refreshToken: newRefreshToken,
            expiresIn: this.jwtExpiresIn
        };
    }

    // Get user by ID
    async getUserById(userId) {
        const user = await database.get(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );

        if (!user) {
            return null;
        }

        // Remove password from user object
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    // Get user by username
    async getUserByUsername(username) {
        const user = await database.get(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (!user) {
            return null;
        }

        // Remove password from user object
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    // Update user profile
    async updateProfile(userId, updateData) {
        const allowedFields = ['full_name', 'bio', 'country', 'timezone', 'github_url', 'website_url', 'preferred_language'];
        const updates = [];
        const values = [];

        for (const [field, value] of Object.entries(updateData)) {
            if (allowedFields.includes(field) && value !== undefined) {
                updates.push(`${field} = ?`);
                values.push(value);
            }
        }

        if (updates.length === 0) {
            throw new Error('No valid fields to update');
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(userId);

        await database.run(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        return await this.getUserById(userId);
    }

    // Change password
    async changePassword(userId, currentPassword, newPassword) {
        if (newPassword.length < 6) {
            throw new Error('New password must be at least 6 characters long');
        }

        // Get current user
        const user = await database.get(
            'SELECT password_hash FROM users WHERE id = ?',
            [userId]
        );

        if (!user) {
            throw new Error('User not found');
        }

        // Verify current password
        const isValidPassword = await this.comparePassword(currentPassword, user.password_hash);
        if (!isValidPassword) {
            throw new Error('Current password is incorrect');
        }

        // Hash new password
        const newPasswordHash = await this.hashPassword(newPassword);

        // Update password
        await database.run(
            'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newPasswordHash, userId]
        );

        // Invalidate all sessions
        await database.run(
            'DELETE FROM user_sessions WHERE user_id = ?',
            [userId]
        );

        return { message: 'Password changed successfully' };
    }

    // Validate session
    async validateSession(token) {
        const session = await database.get(
            'SELECT * FROM user_sessions WHERE session_token = ? AND expires_at > CURRENT_TIMESTAMP',
            [token]
        );

        if (!session) {
            return null;
        }

        return await this.getUserById(session.user_id);
    }

    // Clean expired sessions
    async cleanExpiredSessions() {
        try {
            const result = await database.run(
                'DELETE FROM user_sessions WHERE expires_at <= CURRENT_TIMESTAMP'
            );
            console.log(`Cleaned ${result.changes} expired sessions`);
            return result.changes;
        } catch (error) {
            console.error('Error cleaning expired sessions:', error);
            return 0;
        }
    }

    // Get user statistics
    async getUserStats(userId) {
        const stats = await database.get(
            'SELECT * FROM user_statistics WHERE user_id = ?',
            [userId]
        );

        if (!stats) {
            return null;
        }

        // Parse JSON fields
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

        return stats;
    }

    // Update user statistics
    async updateUserStats(userId, statsData) {
        const allowedFields = [
            'total_submissions', 'accepted_submissions', 'problems_solved_by_difficulty',
            'favorite_language', 'average_submission_time', 'best_rank', 'contests_won',
            'weekly_activity', 'monthly_progress'
        ];

        const updates = [];
        const values = [];

        for (const [field, value] of Object.entries(statsData)) {
            if (allowedFields.includes(field) && value !== undefined) {
                if (typeof value === 'object') {
                    updates.push(`${field} = ?`);
                    values.push(JSON.stringify(value));
                } else {
                    updates.push(`${field} = ?`);
                    values.push(value);
                }
            }
        }

        if (updates.length === 0) {
            return;
        }

        updates.push('last_updated = CURRENT_TIMESTAMP');
        values.push(userId);

        await database.run(
            `UPDATE user_statistics SET ${updates.join(', ')} WHERE user_id = ?`,
            values
        );
    }
}

module.exports = new AuthService();

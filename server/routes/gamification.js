const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const gamificationService = require('../services/gamificationService');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Validation middleware
const codeReview = [
    body('review').isString().isLength({ min: 10, max: 1000 }),
    body('rating').isInt({ min: 1, max: 5 })
];

const studyGroup = [
    body('name').isString().isLength({ min: 3, max: 100 }),
    body('description').isString().isLength({ min: 10, max: 500 }),
    body('maxMembers').isInt({ min: 2, max: 50 })
];

const mentorshipRequest = [
    body('title').isString().isLength({ min: 5, max: 100 }),
    body('description').isString().isLength({ min: 20, max: 1000 }),
    body('preferredLanguage').isString().isLength({ min: 1, max: 50 })
];

// Get user gamification stats
router.get('/stats', async (req, res) => {
    try {
        const stats = await gamificationService.getUserGamificationStats(req.user.id);
        res.json(stats);
    } catch (error) {
        console.error('Error getting user stats:', error);
        res.status(500).json({ error: 'Failed to get user stats' });
    }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const { timeFrame = 'all', limit = 50 } = req.query;
        const leaderboard = await gamificationService.getLeaderboard(timeFrame, parseInt(limit));
        res.json(leaderboard);
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        res.status(500).json({ error: 'Failed to get leaderboard' });
    }
});

// Get daily challenge
router.get('/daily-challenge', async (req, res) => {
    try {
        const challenge = await gamificationService.getDailyChallenge();
        res.json(challenge);
    } catch (error) {
        console.error('Error getting daily challenge:', error);
        res.status(500).json({ error: 'Failed to get daily challenge' });
    }
});

// Complete daily challenge
router.post('/daily-challenge/:challengeId/complete', async (req, res) => {
    try {
        const { challengeId } = req.params;
        const result = await gamificationService.completeDailyChallenge(req.user.id, parseInt(challengeId));
        res.json(result);
    } catch (error) {
        console.error('Error completing daily challenge:', error);
        res.status(400).json({ error: error.message });
    }
});

// Get user achievements
router.get('/achievements', async (req, res) => {
    try {
        const db = require('../database/connection');
        const achievements = await db.all(`
            SELECT 
                a.*,
                CASE WHEN ua.user_id IS NOT NULL THEN 1 ELSE 0 END as earned,
                ua.earned_date
            FROM achievements a
            LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
            ORDER BY a.trigger_value ASC
        `, [req.user.id]);
        
        res.json(achievements);
    } catch (error) {
        console.error('Error getting achievements:', error);
        res.status(500).json({ error: 'Failed to get achievements' });
    }
});

// Get user badges
router.get('/badges', async (req, res) => {
    try {
        const db = require('../database/connection');
        const badges = await db.all(`
            SELECT 
                b.*,
                CASE WHEN ub.user_id IS NOT NULL THEN 1 ELSE 0 END as earned,
                ub.earned_date
            FROM badges b
            LEFT JOIN user_badges ub ON b.id = ub.badge_id AND ub.user_id = ?
            ORDER BY b.trigger_value ASC
        `, [req.user.id]);
        
        res.json(badges);
    } catch (error) {
        console.error('Error getting badges:', error);
        res.status(500).json({ error: 'Failed to get badges' });
    }
});

// Get XP history
router.get('/xp-history', async (req, res) => {
    try {
        const db = require('../database/connection');
        const { limit = 20, offset = 0 } = req.query;
        
        const transactions = await db.all(`
            SELECT * FROM xp_transactions 
            WHERE user_id = ? 
            ORDER BY timestamp DESC 
            LIMIT ? OFFSET ?
        `, [req.user.id, parseInt(limit), parseInt(offset)]);
        
        res.json(transactions);
    } catch (error) {
        console.error('Error getting XP history:', error);
        res.status(500).json({ error: 'Failed to get XP history' });
    }
});

// Code Review Routes
router.get('/code-reviews', async (req, res) => {
    try {
        const db = require('../database/connection');
        const { limit = 20, offset = 0 } = req.query;
        
        const reviews = await db.all(`
            SELECT 
                cr.*,
                u.username as reviewer_name,
                s.title as submission_title
            FROM code_reviews cr
            JOIN users u ON cr.reviewer_id = u.id
            JOIN submissions s ON cr.submission_id = s.id
            ORDER BY cr.created_at DESC
            LIMIT ? OFFSET ?
        `, [parseInt(limit), parseInt(offset)]);
        
        res.json(reviews);
    } catch (error) {
        console.error('Error getting code reviews:', error);
        res.status(500).json({ error: 'Failed to get code reviews' });
    }
});

// Get reviews for a specific submission
router.get('/submissions/:submissionId/reviews', async (req, res) => {
    try {
        const { submissionId } = req.params;
        const db = require('../database/connection');
        
        const reviews = await db.all(`
            SELECT 
                cr.*,
                u.username as reviewer_name
            FROM code_reviews cr
            JOIN users u ON cr.reviewer_id = u.id
            WHERE cr.submission_id = ?
            ORDER BY cr.created_at DESC
        `, [submissionId]);
        
        res.json(reviews);
    } catch (error) {
        console.error('Error getting submission reviews:', error);
        res.status(500).json({ error: 'Failed to get submission reviews' });
    }
});

// Vote on a code review
router.post('/code-reviews/:reviewId/vote', async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { vote } = req.body; // 'up' or 'down'
        
        if (!['up', 'down'].includes(vote)) {
            return res.status(400).json({ error: 'Invalid vote value' });
        }
        
        const db = require('../database/connection');
        
        // For now, just acknowledge the vote
        // In a full implementation, you'd store votes and calculate helpfulness
        res.json({ message: 'Vote recorded successfully' });
    } catch (error) {
        console.error('Error voting on review:', error);
        res.status(500).json({ error: 'Failed to record vote' });
    }
});

// Mentorship Routes
router.post('/mentorship/request', mentorshipRequest, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, preferredLanguage } = req.body;
        const result = await gamificationService.createMentorshipRequest(
            req.user.id, title, description, preferredLanguage
        );
        
        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating mentorship request:', error);
        res.status(500).json({ error: 'Failed to create mentorship request' });
    }
});

router.get('/mentorship/requests', async (req, res) => {
    try {
        const db = require('../database/connection');
        const { status = 'open', limit = 20, offset = 0 } = req.query;
        
        const requests = await db.all(`
            SELECT 
                mr.*,
                u.username as mentee_name
            FROM mentorship_requests mr
            JOIN users u ON mr.mentee_id = u.id
            WHERE mr.status = ?
            ORDER BY mr.created_at DESC
            LIMIT ? OFFSET ?
        `, [status, parseInt(limit), parseInt(offset)]);
        
        res.json(requests);
    } catch (error) {
        console.error('Error getting mentorship requests:', error);
        res.status(500).json({ error: 'Failed to get mentorship requests' });
    }
});

router.put('/mentorship/requests/:requestId', async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, mentorId } = req.body;
        
        const db = require('../database/connection');
        
        if (status === 'accepted' && mentorId) {
            await db.run(
                'UPDATE mentorship_requests SET status = ?, mentor_id = ?, accepted_at = ? WHERE id = ?',
                [status, mentorId, new Date().toISOString(), requestId]
            );
        } else {
            await db.run(
                'UPDATE mentorship_requests SET status = ? WHERE id = ?',
                [status, requestId]
            );
        }
        
        res.json({ message: 'Mentorship request updated successfully' });
    } catch (error) {
        console.error('Error updating mentorship request:', error);
        res.status(500).json({ error: 'Failed to update mentorship request' });
    }
});

// Study Group Routes
router.post('/study-groups', studyGroup, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, description, maxMembers } = req.body;
        const result = await gamificationService.createStudyGroup(
            req.user.id, name, description, maxMembers
        );
        
        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating study group:', error);
        res.status(500).json({ error: 'Failed to create study group' });
    }
});

router.get('/study-groups', async (req, res) => {
    try {
        const db = require('../database/connection');
        const { limit = 20, offset = 0 } = req.query;
        
        const groups = await db.all(`
            SELECT 
                sg.*,
                u.username as creator_name,
                (SELECT COUNT(*) FROM study_group_members sgm WHERE sgm.group_id = sg.id) as member_count
            FROM study_groups sg
            JOIN users u ON sg.creator_id = u.id
            ORDER BY sg.created_at DESC
            LIMIT ? OFFSET ?
        `, [parseInt(limit), parseInt(offset)]);
        
        res.json(groups);
    } catch (error) {
        console.error('Error getting study groups:', error);
        res.status(500).json({ error: 'Failed to get study groups' });
    }
});

router.get('/study-groups/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;
        const db = require('../database/connection');
        
        const group = await db.get(`
            SELECT 
                sg.*,
                u.username as creator_name
            FROM study_groups sg
            JOIN users u ON sg.creator_id = u.id
            WHERE sg.id = ?
        `, [groupId]);
        
        if (!group) {
            return res.status(404).json({ error: 'Study group not found' });
        }
        
        const members = await db.all(`
            SELECT 
                sgm.*,
                u.username
            FROM study_group_members sgm
            JOIN users u ON sgm.user_id = u.id
            WHERE sgm.group_id = ?
            ORDER BY sgm.joined_at ASC
        `, [groupId]);
        
        res.json({ ...group, members });
    } catch (error) {
        console.error('Error getting study group details:', error);
        res.status(500).json({ error: 'Failed to get study group details' });
    }
});

router.post('/study-groups/:groupId/join', async (req, res) => {
    try {
        const { groupId } = req.params;
        const result = await gamificationService.joinStudyGroup(req.user.id, parseInt(groupId));
        res.json(result);
    } catch (error) {
        console.error('Error joining study group:', error);
        res.status(400).json({ error: error.message });
    }
});

// Study Session Routes
router.post('/study-groups/:groupId/sessions', async (req, res) => {
    try {
        const { groupId } = req.params;
        const { title, description, scheduledAt, duration } = req.body;
        
        const db = require('../database/connection');
        
        const result = await db.run(`
            INSERT INTO study_group_sessions (group_id, title, description, scheduled_at, duration, created_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [groupId, title, description, scheduledAt, duration, req.user.id, new Date().toISOString()]);
        
        res.status(201).json({ id: result.id, message: 'Study session created successfully' });
    } catch (error) {
        console.error('Error creating study session:', error);
        res.status(500).json({ error: 'Failed to create study session' });
    }
});

router.post('/study-sessions/:sessionId/join', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const db = require('../database/connection');
        
        // Check if already joined
        const existing = await db.get(
            'SELECT * FROM session_participants WHERE session_id = ? AND user_id = ?',
            [sessionId, req.user.id]
        );
        
        if (existing) {
            return res.status(400).json({ error: 'Already joined this session' });
        }
        
        await db.run(
            'INSERT INTO session_participants (session_id, user_id, joined_at) VALUES (?, ?, ?)',
            [sessionId, req.user.id, new Date().toISOString()]
        );
        
        res.json({ message: 'Joined study session successfully' });
    } catch (error) {
        console.error('Error joining study session:', error);
        res.status(500).json({ error: 'Failed to join study session' });
    }
});

// Initialize user XP (for new users)
router.post('/initialize-xp', async (req, res) => {
    try {
        const result = await gamificationService.initializeUserXP(req.user.id);
        res.json(result);
    } catch (error) {
        console.error('Error initializing user XP:', error);
        res.status(500).json({ error: 'Failed to initialize user XP' });
    }
});

// Add XP to user
router.post('/add-xp', async (req, res) => {
    try {
        const { amount, type, description } = req.body;
        
        if (!amount || !type || !description) {
            return res.status(400).json({ error: 'Amount, type, and description are required' });
        }
        
        const result = await gamificationService.addXP(req.user.id, amount, description, type);
        res.json(result);
    } catch (error) {
        console.error('Error adding XP:', error);
        res.status(500).json({ error: 'Failed to add XP' });
    }
});

module.exports = router;

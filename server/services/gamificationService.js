const db = require('../database/connection');

class GamificationService {
    // XP and Level Management
    async initializeUserXP(userId) {
        try {
            // Check if user already has XP record
            const existingXP = await db.get('SELECT * FROM user_xp WHERE user_id = ?', [userId]);
            
            if (existingXP) {
                return existingXP;
            }

            // Create new XP record
            const result = await db.run(
                'INSERT INTO user_xp (user_id, current_xp, current_level, total_xp, streak_days, last_activity_date) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, 0, 1, 0, 0, new Date().toISOString()]
            );

            return {
                user_id: userId,
                current_xp: 0,
                current_level: 1,
                total_xp: 0,
                streak_days: 0,
                last_activity_date: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error initializing user XP:', error);
            throw error;
        }
    }

    async addXP(userId, amount, reason = 'general', source = null) {
        try {
            // Get current XP
            const currentXP = await db.get('SELECT * FROM user_xp WHERE user_id = ?', [userId]);
            if (!currentXP) {
                throw new Error('User XP not initialized');
            }

            const newTotalXP = currentXP.total_xp + amount;
            const newCurrentXP = currentXP.current_xp + amount;

            // Update XP
            await db.run(
                'UPDATE user_xp SET current_xp = ?, total_xp = ? WHERE user_id = ?',
                [newCurrentXP, newTotalXP, userId]
            );

            // Record transaction
            const transactionResult = await db.run(
                'INSERT INTO xp_transactions (user_id, amount, reason, source, timestamp) VALUES (?, ?, ?, ?, ?)',
                [userId, amount, reason, source, new Date().toISOString()]
            );

            // Get the created transaction for return
            const transaction = await db.get(
                'SELECT * FROM xp_transactions WHERE id = ?',
                [transactionResult.lastID]
            );

            // Check for level up
            const levelUpResult = await this.checkAndProcessLevelUp(userId, newCurrentXP);

            return {
                newXP: newCurrentXP,
                newTotalXP: newTotalXP,
                levelUp: levelUpResult.levelUp,
                newLevel: levelUpResult.newLevel,
                xpEarned: amount,
                transaction: {
                    id: transaction.id,
                    xp_amount: transaction.amount,
                    transaction_type: transaction.reason,
                    description: transaction.source || reason,
                    created_at: transaction.timestamp
                }
            };
        } catch (error) {
            console.error('Error adding XP:', error);
            throw error;
        }
    }

    async checkAndProcessLevelUp(userId, currentXP) {
        try {
            const userXP = await db.get('SELECT * FROM user_xp WHERE user_id = ?', [userId]);
            if (!userXP) return { levelUp: false, newLevel: userXP.current_level };

            const requiredXP = this.calculateXPForLevel(userXP.current_level + 1);
            
            if (currentXP >= requiredXP) {
                const newLevel = userXP.current_level + 1;
                
                await db.run(
                    'UPDATE user_xp SET current_level = ? WHERE user_id = ?',
                    [newLevel, userId]
                );

                return { levelUp: true, newLevel };
            }

            return { levelUp: false, newLevel: userXP.current_level };
        } catch (error) {
            console.error('Error checking level up:', error);
            throw error;
        }
    }

    calculateXPForLevel(level) {
        // Exponential growth: each level requires more XP
        return Math.floor(100 * Math.pow(1.5, level - 1));
    }

    async updateActivityStreak(userId) {
        try {
            const userXP = await db.get('SELECT * FROM user_xp WHERE user_id = ?', [userId]);
            if (!userXP) return;

            const today = new Date().toDateString();
            const lastActivity = userXP.last_activity_date ? new Date(userXP.last_activity_date).toDateString() : null;
            
            if (lastActivity === today) return; // Already updated today

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();

            let newStreak = userXP.streak_days;
            
            if (lastActivity === yesterdayStr) {
                newStreak += 1;
            } else if (lastActivity !== today) {
                newStreak = 1; // Reset streak
            }

            await db.run(
                'UPDATE user_xp SET streak_days = ?, last_activity_date = ? WHERE user_id = ?',
                [newStreak, new Date().toISOString(), userId]
            );

            return newStreak;
        } catch (error) {
            console.error('Error updating activity streak:', error);
            throw error;
        }
    }

    // Achievement Management
    async checkAndAwardAchievements(userId, action, value = null) {
        try {
            const achievements = await db.all('SELECT * FROM achievements');
            const userAchievements = await db.all('SELECT achievement_id FROM user_achievements WHERE user_id = ?', [userId]);
            const userAchievementIds = userAchievements.map(ua => ua.achievement_id);

            for (const achievement of achievements) {
                if (userAchievementIds.includes(achievement.id)) continue;

                let shouldAward = false;

                switch (achievement.trigger_type) {
                    case 'level':
                        shouldAward = await this.checkLevelBasedAchievements(userId, achievement, value);
                        break;
                    case 'streak':
                        shouldAward = await this.checkStreakBasedAchievements(userId, achievement, value);
                        break;
                    case 'problems_solved':
                        shouldAward = await this.checkProblemSolvedAchievements(userId, achievement, value);
                        break;
                }

                if (shouldAward) {
                    await this.awardAchievement(userId, achievement.id);
                }
            }
        } catch (error) {
            console.error('Error checking achievements:', error);
            throw error;
        }
    }

    async checkLevelBasedAchievements(userId, achievement, level) {
        if (achievement.trigger_type !== 'level') return false;
        
        const userXP = await db.get('SELECT current_level FROM user_xp WHERE user_id = ?', [userId]);
        return userXP && userXP.current_level >= achievement.trigger_value;
    }

    async checkStreakBasedAchievements(userId, achievement, streak) {
        if (achievement.trigger_type !== 'streak') return false;
        
        const userXP = await db.get('SELECT streak_days FROM user_xp WHERE user_id = ?', [userId]);
        return userXP && userXP.streak_days >= achievement.trigger_value;
    }

    async checkProblemSolvedAchievements(userId, achievement, problemsSolved) {
        if (achievement.trigger_type !== 'problems_solved') return false;
        
        const result = await db.get('SELECT COUNT(*) as count FROM submissions WHERE user_id = ? AND status = "Accepted"', [userId]);
        return result && result.count >= achievement.trigger_value;
    }

    async awardAchievement(userId, achievementId) {
        try {
            await db.run(
                'INSERT INTO user_achievements (user_id, achievement_id, earned_date) VALUES (?, ?, ?)',
                [userId, achievementId, new Date().toISOString()]
            );

            // Award XP for achievement
            const achievement = await db.get('SELECT * FROM achievements WHERE id = ?', [achievementId]);
            if (achievement && achievement.xp_reward > 0) {
                await this.addXP(userId, achievement.xp_reward, 'achievement', `achievement_${achievementId}`);
            }

            return true;
        } catch (error) {
            console.error('Error awarding achievement:', error);
            throw error;
        }
    }

    // Collaborative Features
    async createCodeReview(userId, submissionId, review, rating) {
        try {
            const result = await db.run(
                'INSERT INTO code_reviews (reviewer_id, submission_id, review_text, rating, created_at) VALUES (?, ?, ?, ?, ?)',
                [userId, submissionId, review, rating, new Date().toISOString()]
            );

            // Award XP for helping others
            await this.addXP(userId, 10, 'code_review', `submission_${submissionId}`);

            return result;
        } catch (error) {
            console.error('Error creating code review:', error);
            throw error;
        }
    }

    async createMentorshipRequest(userId, title, description, preferredLanguage) {
        try {
            const result = await db.run(
                'INSERT INTO mentorship_requests (mentee_id, title, description, preferred_language, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, title, description, preferredLanguage, 'open', new Date().toISOString()]
            );

            return result;
        } catch (error) {
            console.error('Error creating mentorship request:', error);
            throw error;
        }
    }

    async createStudyGroup(userId, name, description, maxMembers) {
        try {
            const result = await db.run(
                'INSERT INTO study_groups (creator_id, name, description, max_members, created_at) VALUES (?, ?, ?, ?, ?)',
                [userId, name, description, maxMembers, new Date().toISOString()]
            );

            // Auto-join creator to group
            await db.run(
                'INSERT INTO study_group_members (group_id, user_id, joined_at, role) VALUES (?, ?, ?, ?)',
                [result.id, userId, new Date().toISOString(), 'creator']
            );

            return result;
        } catch (error) {
            console.error('Error creating study group:', error);
            throw error;
        }
    }

    async joinStudyGroup(userId, groupId) {
        try {
            // Check if group is full
            const group = await db.get('SELECT * FROM study_groups WHERE id = ?', [groupId]);
            const memberCount = await db.get('SELECT COUNT(*) as count FROM study_group_members WHERE group_id = ?', [groupId]);
            
            if (memberCount.count >= group.max_members) {
                throw new Error('Study group is full');
            }

            // Check if already a member
            const existingMember = await db.get('SELECT * FROM study_group_members WHERE group_id = ? AND user_id = ?', [groupId, userId]);
            if (existingMember) {
                throw new Error('Already a member of this group');
            }

            const result = await db.run(
                'INSERT INTO study_group_members (group_id, user_id, joined_at, role) VALUES (?, ?, ?, ?)',
                [groupId, userId, new Date().toISOString(), 'member']
            );

            return result;
        } catch (error) {
            console.error('Error joining study group:', error);
            throw error;
        }
    }

    // Daily Challenges
    async getDailyChallenge() {
        try {
            const today = new Date().toDateString();
            const challenge = await db.get('SELECT * FROM daily_challenges WHERE DATE(created_at) = DATE(?)', [today]);
            
            if (!challenge) {
                // Create a new daily challenge if none exists for today
                const challenges = [
                    { title: 'Solve 3 Problems', description: 'Complete any 3 coding problems today', xp_reward: 50, difficulty: 'easy' },
                    { title: 'Perfect Score', description: 'Get a perfect score on any problem', xp_reward: 100, difficulty: 'medium' },
                    { title: 'Streak Master', description: 'Maintain your activity streak', xp_reward: 75, difficulty: 'easy' },
                    { title: 'Language Explorer', description: 'Solve problems in 2 different programming languages', xp_reward: 125, difficulty: 'hard' },
                    { title: 'Help Others', description: 'Review 2 code submissions from other users', xp_reward: 80, difficulty: 'medium' }
                ];

                const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
                
                const result = await db.run(
                    'INSERT INTO daily_challenges (title, description, xp_reward, difficulty, created_at) VALUES (?, ?, ?, ?, ?)',
                    [randomChallenge.title, randomChallenge.description, randomChallenge.xp_reward, randomChallenge.difficulty, new Date().toISOString()]
                );

                return { ...randomChallenge, id: result.id };
            }

            return challenge;
        } catch (error) {
            console.error('Error getting daily challenge:', error);
            throw error;
        }
    }

    async completeDailyChallenge(userId, challengeId) {
        try {
            // Check if already completed today
            const today = new Date().toDateString();
            const existingCompletion = await db.get(
                'SELECT * FROM user_daily_challenges WHERE user_id = ? AND challenge_id = ? AND DATE(completed_at) = DATE(?)',
                [userId, challengeId, today]
            );

            if (existingCompletion) {
                throw new Error('Daily challenge already completed today');
            }

            // Mark as completed
            await db.run(
                'INSERT INTO user_daily_challenges (user_id, challenge_id, completed_at) VALUES (?, ?, ?)',
                [userId, challengeId, new Date().toISOString()]
            );

            // Get challenge details and award XP
            const challenge = await db.get('SELECT * FROM daily_challenges WHERE id = ?', [challengeId]);
            
            // Award XP with potential bonus for streak
            const userXP = await db.get('SELECT streak_days FROM user_xp WHERE user_id = ?', [userId]);
            const baseXP = challenge.xp_reward;
            const streakBonus = Math.min(userXP.streak_days * 2, 50); // Max 50 bonus XP
            const totalXP = baseXP + streakBonus;

            await this.addXP(userId, totalXP, 'daily_challenge', `challenge_${challengeId}`);

            return {
                xpEarned: totalXP,
                bonusEarned: streakBonus > 0,
                bonusAmount: streakBonus
            };
        } catch (error) {
            console.error('Error completing daily challenge:', error);
            throw error;
        }
    }

    // User Stats and Leaderboard
    async getUserGamificationStats(userId) {
        try {
            const userXP = await db.get('SELECT * FROM user_xp WHERE user_id = ?', [userId]);
            if (!userXP) {
                throw new Error('User XP not initialized');
            }

            const achievementCount = await db.get('SELECT COUNT(*) as count FROM user_achievements WHERE user_id = ?', [userId]);
            const badgeCount = await db.get('SELECT COUNT(*) as count FROM user_badges WHERE user_id = ?', [userId]);
            const problemsSolved = await db.get('SELECT COUNT(*) as count FROM submissions WHERE user_id = ? AND status = "Accepted"', [userId]);

            return {
                xp: userXP,
                achievements: achievementCount.count,
                badges: badgeCount.count,
                problemsSolved: problemsSolved.count
            };
        } catch (error) {
            console.error('Error getting user gamification stats:', error);
            throw error;
        }
    }

    async getLeaderboard(timeFrame = 'all', limit = 50) {
        try {
            // Ensure all users have XP records
            await this.ensureAllUsersHaveXP();
            
            let dateFilter = '';
            let params = [];

            if (timeFrame === 'weekly') {
                dateFilter = 'WHERE DATE(ux.last_activity_date) >= DATE("now", "-7 days")';
            } else if (timeFrame === 'monthly') {
                dateFilter = 'WHERE DATE(ux.last_activity_date) >= DATE("now", "-30 days")';
            }

            const query = `
                SELECT 
                    u.username,
                    u.full_name,
                    ux.current_level,
                    ux.current_xp,
                    ux.total_xp,
                    ux.streak_days,
                    COALESCE((SELECT COUNT(*) FROM user_achievements ua WHERE ua.user_id = u.id), 0) as achievements_count
                FROM users u
                JOIN user_xp ux ON u.id = ux.user_id
                ${dateFilter}
                ORDER BY ux.current_level DESC, ux.current_xp DESC, ux.streak_days DESC
                LIMIT ?
            `;

            params = timeFrame === 'all' ? [limit] : [limit];
            const leaderboard = await db.all(query, params);

            return leaderboard.map((user, index) => ({
                rank: index + 1,
                username: user.username,
                full_name: user.full_name || user.username,
                current_level: user.current_level || 0,
                current_xp: user.current_xp || 0,
                total_xp: user.total_xp || 0,
                streak_days: user.streak_days || 0,
                achievements_count: user.achievements_count || 0
            }));
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            throw error;
        }
    }

    async ensureAllUsersHaveXP() {
        try {
            // Get all users who don't have XP records
            const usersWithoutXP = await db.all(`
                SELECT u.id FROM users u 
                LEFT JOIN user_xp ux ON u.id = ux.user_id 
                WHERE ux.user_id IS NULL
            `);
            
            // Initialize XP for users who don't have it
            for (const user of usersWithoutXP) {
                await this.initializeUserXP(user.id);
            }
        } catch (error) {
            console.error('Error ensuring all users have XP:', error);
            // Don't throw error, just log it
        }
    }

    // Badge Management
    async awardBadge(userId, badgeId) {
        try {
            const existingBadge = await db.get('SELECT * FROM user_badges WHERE user_id = ? AND badge_id = ?', [userId, badgeId]);
            if (existingBadge) {
                return false; // Already has this badge
            }

            await db.run(
                'INSERT INTO user_badges (user_id, badge_id, earned_date) VALUES (?, ?, ?)',
                [userId, badgeId, new Date().toISOString()]
            );

            // Award XP for badge
            const badge = await db.get('SELECT * FROM badges WHERE id = ?', [badgeId]);
            if (badge && badge.xp_reward > 0) {
                await this.addXP(userId, badge.xp_reward, 'badge', `badge_${badgeId}`);
            }

            return true;
        } catch (error) {
            console.error('Error awarding badge:', error);
            throw error;
        }
    }

    async getBadgeXPReward(badgeId) {
        try {
            const badge = await db.get('SELECT xp_reward FROM badges WHERE id = ?', [badgeId]);
            return badge ? badge.xp_reward : 0;
        } catch (error) {
            console.error('Error getting badge XP reward:', error);
            throw error;
        }
    }

    async checkAndAwardBadges(userId, action, value = null) {
        try {
            const badges = await db.all('SELECT * FROM badges');
            const userBadges = await db.all('SELECT badge_id FROM user_badges WHERE user_id = ?', [userId]);
            const userBadgeIds = userBadges.map(ub => ub.badge_id);

            for (const badge of badges) {
                if (userBadgeIds.includes(badge.id)) continue;

                let shouldAward = false;

                switch (badge.trigger_type) {
                    case 'level':
                        const userXP = await db.get('SELECT current_level FROM user_xp WHERE user_id = ?', [userId]);
                        shouldAward = userXP && userXP.current_level >= badge.trigger_value;
                        break;
                    case 'streak':
                        const userStreak = await db.get('SELECT streak_days FROM user_xp WHERE user_id = ?', [userId]);
                        shouldAward = userStreak && userStreak.streak_days >= badge.trigger_value;
                        break;
                    case 'problems_solved':
                        const problemsSolved = await db.get('SELECT COUNT(*) as count FROM submissions WHERE user_id = ? AND status = "Accepted"', [userId]);
                        shouldAward = problemsSolved && problemsSolved.count >= badge.trigger_value;
                        break;
                }

                if (shouldAward) {
                    await this.awardBadge(userId, badge.id);
                }
            }
        } catch (error) {
            console.error('Error checking badges:', error);
            throw error;
        }
    }
}

module.exports = new GamificationService();

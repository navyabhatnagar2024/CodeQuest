const database = require('../database/connection');

class LeetCodeSuggestionsService {





    /**
     * Check if a suggestion is already added to problems table
     */
    async isSuggestionAdded(sourceProblemId) {
        try {
            const result = await database.get(
                'SELECT id FROM problems WHERE source_problem_id = ?',
                [sourceProblemId]
            );
            return !!result;
        } catch (error) {
            console.error('Error checking if suggestion is added:', error);
            return false;
        }
    }

    /**
     * Get all LeetCode suggestions with filtering
     */
    async getSuggestions(filters = {}) {
        try {
            const {
                page = 1,
                limit = 50,
                difficulty,
                topics,
                search
            } = filters;

            const offset = (page - 1) * limit;
            const conditions = [];
            const params = [];

            if (difficulty) {
                conditions.push('LOWER(difficulty_level) = LOWER(?)');
                params.push(difficulty);
            }

            if (topics && topics.length > 0) {
                const topicConditions = topics.map(() => 'topic_tags LIKE ?');
                conditions.push(`(${topicConditions.join(' OR ')})`);
                topics.forEach(topic => params.push(`%${topic}%`));
            }

            if (search) {
                conditions.push('(title LIKE ? OR description LIKE ?)');
                params.push(`%${search}%`, `%${search}%`);
            }

            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

            // Get total count
            const countQuery = `SELECT COUNT(*) as total FROM leetcode_suggestions ${whereClause}`;
            const countResult = await database.get(countQuery, params);
            const total = countResult.total;

            // Get suggestions
            const suggestionsQuery = `
                SELECT id, title, description, difficulty_level, topic_tags, 
                       problem_statement, input_format, output_format, constraints,
                       examples, hints, source_problem_id, time_limit_ms, memory_limit_mb,
                       created_at
                FROM leetcode_suggestions 
                ${whereClause}
                ORDER BY difficulty_level ASC, title ASC
                LIMIT ? OFFSET ?
            `;

            const suggestions = await database.all(suggestionsQuery, [...params, parseInt(limit), offset]);

            // Parse JSON fields and check if already added
            for (const suggestion of suggestions) {
                try {
                    suggestion.topic_tags = JSON.parse(suggestion.topic_tags);
                } catch (e) {
                    suggestion.topic_tags = [];
                }
                try {
                    suggestion.examples = JSON.parse(suggestion.examples);
                } catch (e) {
                    suggestion.examples = [];
                }
                
                // Check if this suggestion is already added to problems table
                suggestion.isAlreadyAdded = await this.isSuggestionAdded(suggestion.source_problem_id);
            }

            return {
                success: true,
                suggestions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            };

        } catch (error) {
            console.error('Error getting LeetCode suggestions:', error);
            throw error;
        }
    }

    /**
     * Get a specific suggestion by ID
     */
    async getSuggestionById(id) {
        try {
            const suggestion = await database.get(
                'SELECT * FROM leetcode_suggestions WHERE id = ?',
                [id]
            );

            if (!suggestion) {
                return null;
            }

            // Parse JSON fields
            try {
                suggestion.topic_tags = JSON.parse(suggestion.topic_tags);
            } catch (e) {
                suggestion.topic_tags = [];
            }
            try {
                suggestion.examples = JSON.parse(suggestion.examples);
            } catch (e) {
                suggestion.examples = [];
            }
            try {
                suggestion.test_cases = JSON.parse(suggestion.test_cases);
            } catch (e) {
                suggestion.test_cases = [];
            }

            return suggestion;
        } catch (error) {
            console.error('Error getting suggestion by ID:', error);
            throw error;
        }
    }

    /**
     * Remove a suggestion (when it's added to problems)
     */
    async removeSuggestion(id) {
        try {
            const result = await database.run(
                'DELETE FROM leetcode_suggestions WHERE id = ?',
                [id]
            );
            return result.changes > 0;
        } catch (error) {
            console.error('Error removing suggestion:', error);
            throw error;
        }
    }

    /**
     * Add a suggestion back (when problem is deleted)
     */
    async addSuggestionBack(problemData) {
        try {
            const topicTags = Array.isArray(problemData.topic_tags) ? JSON.stringify(problemData.topic_tags) : '[]';
            const examples = Array.isArray(problemData.examples) ? JSON.stringify(problemData.examples) : '[]';
            const testCases = Array.isArray(problemData.test_cases) ? JSON.stringify(problemData.test_cases) : '[]';

            await database.run(
                `INSERT INTO leetcode_suggestions (
                    title, description, difficulty_level, topic_tags,
                    problem_statement, input_format, output_format,
                    constraints, examples, hints, source_problem_id,
                    time_limit_ms, memory_limit_mb, test_cases
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    problemData.title,
                    problemData.description,
                    problemData.difficulty_level,
                    topicTags,
                    problemData.problem_statement,
                    problemData.input_format || '',
                    problemData.output_format || '',
                    problemData.constraints || '',
                    examples,
                    problemData.hints || '',
                    problemData.source_problem_id,
                    problemData.time_limit_ms || 1000,
                    problemData.memory_limit_mb || 256,
                    testCases
                ]
            );

            return true;
        } catch (error) {
            console.error('Error adding suggestion back:', error);
            throw error;
        }
    }

    /**
     * Get available topics from suggestions
     */
    async getAvailableTopics() {
        try {
            const result = await database.all('SELECT topic_tags FROM leetcode_suggestions');
            const allTags = new Set();
            
            result.forEach(row => {
                try {
                    const tags = JSON.parse(row.topic_tags);
                    if (Array.isArray(tags)) {
                        tags.forEach(tag => allTags.add(tag));
                    }
                } catch (e) {
                    // Skip invalid JSON
                }
            });
            
            return Array.from(allTags).sort();
        } catch (error) {
            console.error('Error getting available topics:', error);
            return [];
        }
    }
}

module.exports = new LeetCodeSuggestionsService();

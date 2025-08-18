-- Migration: Create leetcode_suggestions table
-- Date: 2024-01-01

-- Create LeetCode Problem Suggestions Table
CREATE TABLE IF NOT EXISTS leetcode_suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    difficulty_level VARCHAR(20) NOT NULL CHECK (difficulty_level IN ('Easy', 'Medium', 'Hard')),
    topic_tags TEXT, -- JSON array of topics
    problem_statement TEXT NOT NULL,
    input_format TEXT,
    output_format TEXT,
    constraints TEXT,
    examples TEXT, -- JSON array of examples
    hints TEXT,
    source_problem_id VARCHAR(100) UNIQUE NOT NULL,
    time_limit_ms INTEGER DEFAULT 1000,
    memory_limit_mb INTEGER DEFAULT 256,
    test_cases TEXT, -- JSON array of test cases
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index on source_problem_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_leetcode_suggestions_source_id ON leetcode_suggestions(source_problem_id);

-- Create index on difficulty_level for filtering
CREATE INDEX IF NOT EXISTS idx_leetcode_suggestions_difficulty ON leetcode_suggestions(difficulty_level);

-- Create index on topic_tags for topic filtering
CREATE INDEX IF NOT EXISTS idx_leetcode_suggestions_topics ON leetcode_suggestions(topic_tags);

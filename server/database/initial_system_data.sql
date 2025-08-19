-- System Settings Data for Coding Platform
-- This file contains system configuration settings
-- Generated on: 2025-08-18T18:08:59.652Z
-- 
-- To use this file:
-- 1. Run setup.js first to create database and import content
-- 2. Add your .env file with proper configuration
-- 3. Run setup_final.js to import these system settings

-- Insert system settings (these will work because database already exists)
INSERT INTO system_settings (id, setting_key, setting_value, description, updated_at) VALUES 
(233, 'platform_name', 'Competitive Programming Platform', 'Name of the platform', '2025-08-17 18:31:17');

INSERT INTO system_settings (id, setting_key, setting_value, description, updated_at) VALUES 
(234, 'platform_description', 'A comprehensive platform for competitive programming contests', 'Platform description', '2025-08-17 18:31:17');

INSERT INTO system_settings (id, setting_key, setting_value, description, updated_at) VALUES 
(235, 'enable_registration', 'true', 'Whether user registration is enabled', '2025-08-17 18:31:17');

INSERT INTO system_settings (id, setting_key, setting_value, description, updated_at) VALUES 
(236, 'enable_public_problems', 'true', 'Whether problems are publicly visible', '2025-08-17 18:31:17');

INSERT INTO system_settings (id, setting_key, setting_value, description, updated_at) VALUES 
(237, 'maintenance_mode', 'false', 'Whether the platform is in maintenance mode', '2025-08-17 18:31:17');

INSERT INTO system_settings (id, setting_key, setting_value, description, updated_at) VALUES 
(238, 'version', '1.0.0', 'Platform version', '2025-08-17 18:31:17');

INSERT INTO system_settings (id, setting_key, setting_value, description, updated_at) VALUES 
(239, 'judge0_api_url', 'https://judge0-ce.p.rapidapi.com', 'Judge0 API endpoint', '2025-08-17 18:31:24');

INSERT INTO system_settings (id, setting_key, setting_value, description, updated_at) VALUES 
(240, 'judge0_api_key', '', 'Judge0 API key for RapidAPI', '2025-08-17 18:31:24');

INSERT INTO system_settings (id, setting_key, setting_value, description, updated_at) VALUES 
(241, 'max_submission_length', '50000', 'Maximum characters allowed in code submission', '2025-08-17 18:31:24');

INSERT INTO system_settings (id, setting_key, setting_value, description, updated_at) VALUES 
(242, 'default_time_limit', '1000', 'Default time limit in milliseconds', '2025-08-17 18:31:24');

INSERT INTO system_settings (id, setting_key, setting_value, description, updated_at) VALUES 
(243, 'default_memory_limit', '256', 'Default memory limit in MB', '2025-08-17 18:31:24');

INSERT INTO system_settings (id, setting_key, setting_value, description, updated_at) VALUES 
(244, 'contest_registration_deadline_hours', '24', 'Hours before contest start when registration closes', '2025-08-17 18:31:24');

INSERT INTO system_settings (id, setting_key, setting_value, description, updated_at) VALUES 
(245, 'max_concurrent_submissions', '5', 'Maximum concurrent submissions per user', '2025-08-17 18:31:24');

INSERT INTO system_settings (id, setting_key, setting_value, description, updated_at) VALUES 
(246, 'rate_limit_submissions_per_minute', '10', 'Rate limit for submissions per minute per user', '2025-08-17 18:31:24');

-- Initial Database Data for Coding Platform
-- This file contains all the data from the original database
-- Generated on: 2025-08-18T18:08:59.652Z
-- 
-- To use this file:
-- 1. Create a fresh database using schema.sql
-- 2. Run this file to populate with initial data
-- 3. The platform will be ready to use with real problems and test cases

BEGIN TRANSACTION;

INSERT INTO users (id, username, email, password_hash, full_name, country, timezone, is_admin, is_verified, total_problems_solved, created_at, updated_at, last_login) VALUES (7, 'admin', 'admin@competitiveplatform.com', '$2a$12$iSNHFi9i.hZiA5CF0QFiEuFjscvdbmlo7qGQCk06SJ2MxlMJXjWDa', 'Administrator', 'Global', 'Asia/Kolkata', 1, 1, 0, '2025-08-17 18:31:17', '2025-08-17 20:13:22', '2025-08-18 08:42:56');
INSERT INTO problems (id, title, description, difficulty_level, topic_tags, time_limit_ms, memory_limit_mb, source_platform, source_problem_id, created_at, updated_at, is_active, author_id, problem_statement, input_format, output_format, constraints, examples, hints) VALUES (127, 'Two Sum', 'LeetCode Problem 1: Two Sum - Easy level problem', 'Easy', '["array","hash-table"]', 1000, 256, 'LeetCode', '1', '2025-08-18 09:27:06', '2025-08-18 09:27:06', 1, NULL, '<p>Given an array of integers <code>nums</code>&nbsp;and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p>

<p>You may assume that each input would have <strong><em>exactly</em> one solution</strong>, and you may not use the <em>same</em> element twice.</p>

<p>You can return the answer in any order.</p>

<p>&nbsp;</p>
<p><strong class="example">Example 1:</strong></p>

<pre>
<strong>Input:</strong> nums = [2,7,11,15], target = 9
<strong>Output:</strong> [0,1]
<strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].
</pre>

<p><strong class="example">Example 2:</strong></p>

<pre>
<strong>Input:</strong> nums = [3,2,4], target = 6
<strong>Output:</strong> [1,2]
</pre>

<p><strong class="example">Example 3:</strong></p>

<pre>
<strong>Input:</strong> nums = [3,3], target = 6
<strong>Output:</strong> [0,1]
</pre>

<p>&nbsp;</p>
<p><strong>Constraints:</strong></p>

<ul>
	<li><code>2 &lt;= nums.length &lt;= 10<sup>4</sup></code></li>
	<li><code>-10<sup>9</sup> &lt;= nums[i] &lt;= 10<sup>9</sup></code></li>
	<li><code>-10<sup>9</sup> &lt;= target &lt;= 10<sup>9</sup></code></li>
	<li><strong>Only one valid answer exists.</strong></li>
</ul>

<p>&nbsp;</p>
<strong>Follow-up:&nbsp;</strong>Can you come up with an algorithm that is less than <code>O(n<sup>2</sup>)</code><font face="monospace">&nbsp;</font>time complexity?', 'Standard input format for this problem type', 'Expected output format for this problem type', 'Standard constraints for easy level problems', NULL, NULL);
INSERT INTO problems (id, title, description, difficulty_level, topic_tags, time_limit_ms, memory_limit_mb, source_platform, source_problem_id, created_at, updated_at, is_active, author_id, problem_statement, input_format, output_format, constraints, examples, hints) VALUES (128, 'Median of Two Sorted Arrays', 'LeetCode Problem 4: Median of Two Sorted Arrays - Hard level problem', 'Hard', '["array","binary-search","divide-and-conquer"]', 1000, 256, 'LeetCode', '4', '2025-08-18 10:23:26', '2025-08-18 10:23:26', 1, NULL, '<p>Given two sorted arrays <code>nums1</code> and <code>nums2</code> of size <code>m</code> and <code>n</code> respectively, return <strong>the median</strong> of the two sorted arrays.</p>

<p>The overall run time complexity should be <code>O(log (m+n))</code>.</p>

<p>&nbsp;</p>
<p><strong class="example">Example 1:</strong></p>

<pre>
<strong>Input:</strong> nums1 = [1,3], nums2 = [2]
<strong>Output:</strong> 2.00000
<strong>Explanation:</strong> merged array = [1,2,3] and median is 2.
</pre>

<p><strong class="example">Example 2:</strong></p>

<pre>
<strong>Input:</strong> nums1 = [1,2], nums2 = [3,4]
<strong>Output:</strong> 2.50000
<strong>Explanation:</strong> merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.
</pre>

<p>&nbsp;</p>
<p><strong>Constraints:</strong></p>

<ul>
	<li><code>nums1.length == m</code></li>
	<li><code>nums2.length == n</code></li>
	<li><code>0 &lt;= m &lt;= 1000</code></li>
	<li><code>0 &lt;= n &lt;= 1000</code></li>
	<li><code>1 &lt;= m + n &lt;= 2000</code></li>
	<li><code>-10<sup>6</sup> &lt;= nums1[i], nums2[i] &lt;= 10<sup>6</sup></code></li>
</ul>
', 'Standard input format for this problem type', 'Expected output format for this problem type', 'Standard constraints for hard level problems', NULL, NULL);
INSERT INTO test_cases (id, problem_id, input_data, expected_output, is_sample, weight, is_hidden, created_at, test_case_group) VALUES (630, 128, 'nums1 = [1,3], nums2 = [2]', '2.0', 1, 1, 0, '2025-08-18 10:23:26', 'examples');
INSERT INTO test_cases (id, problem_id, input_data, expected_output, is_sample, weight, is_hidden, created_at, test_case_group) VALUES (631, 128, 'nums1 = [1,2], nums2 = [3,4]', '2.5', 1, 1, 0, '2025-08-18 10:23:26', 'examples');
INSERT INTO contests (id, title, description, start_time, end_time, duration_minutes, created_by_admin_id, max_participants, registration_deadline, contest_type, difficulty_range, prizes_description, rules, is_active, is_public, created_at, updated_at) VALUES (7, 'Beginner Contest #1', 'A beginner-friendly contest with easy problems', '2025-08-18T18:31:17.929Z', '2025-08-18T19:31:17.931Z', 60, 7, 1000, '2025-08-18T17:31:17.931Z', 'Practice', '{"min":"Easy","max":"Easy"}', 'Practice contest - no prizes', 'Standard competitive programming rules apply', 1, 1, '2025-08-17 18:31:17', '2025-08-17 18:31:17');
INSERT INTO contests (id, title, description, start_time, end_time, duration_minutes, created_by_admin_id, max_participants, registration_deadline, contest_type, difficulty_range, prizes_description, rules, is_active, is_public, created_at, updated_at) VALUES (8, 'Weekly Challenge #1', 'Weekly programming challenge with mixed difficulty problems', '2025-08-24T18:31:17.931Z', '2025-08-24T20:31:17.931Z', 120, 7, 500, '2025-08-23T18:31:17.931Z', 'Rated', '{"min":"Easy","max":"Medium"}', 'Rating points and bragging rights', 'Rated contest - affects your rating', 1, 1, '2025-08-17 18:31:17', '2025-08-17 18:31:17');
INSERT INTO contests (id, title, description, start_time, end_time, duration_minutes, created_by_admin_id, max_participants, registration_deadline, contest_type, difficulty_range, prizes_description, rules, is_active, is_public, created_at, updated_at) VALUES (9, 'Beginner Contest #1', 'A beginner-friendly contest with easy problems', '2025-08-18T18:34:43.131Z', '2025-08-18T19:34:43.132Z', 60, 7, 1000, '2025-08-18T17:34:43.132Z', 'Practice', '{"min":"Easy","max":"Easy"}', 'Practice contest - no prizes', 'Standard competitive programming rules apply', 1, 1, '2025-08-17 18:34:43', '2025-08-17 18:34:43');
INSERT INTO contests (id, title, description, start_time, end_time, duration_minutes, created_by_admin_id, max_participants, registration_deadline, contest_type, difficulty_range, prizes_description, rules, is_active, is_public, created_at, updated_at) VALUES (10, 'Weekly Challenge #1', 'Weekly programming challenge with mixed difficulty problems', '2025-08-24T18:34:43.132Z', '2025-08-24T20:34:43.132Z', 120, 7, 500, '2025-08-23T18:34:43.132Z', 'Rated', '{"min":"Easy","max":"Medium"}', 'Rating points and bragging rights', 'Rated contest - affects your rating', 1, 1, '2025-08-17 18:34:43', '2025-08-17 18:34:43');

INSERT INTO user_sessions (id, user_id, session_token, refresh_token, expires_at, created_at) VALUES (5, 7, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInVzZXJuYW1lIjoiYWRtaW4iLCJpc0FkbWluIjoxLCJpYXQiOjE3NTU0NTcyNjQsImV4cCI6MTc1NTU0MzY2NH0.KXfAgb2oki0vXir0chA0L2rl0USgsgkbMF5BHTHbS7I', 'd0d8d866-e041-4587-91b6-44100dbe4b64', '2025-08-24T19:01:04.568Z', '2025-08-17 19:01:04');
INSERT INTO user_sessions (id, user_id, session_token, refresh_token, expires_at, created_at) VALUES (6, 7, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInVzZXJuYW1lIjoiYWRtaW4iLCJpc0FkbWluIjoxLCJpYXQiOjE3NTU0NjE3NTQsImV4cCI6MTc1NTU0ODE1NH0.SVe31oeYNwv4RUCCb6ANvSJ2inry_8wfHnpiKYSzDR0', '6a0e26b9-85d7-4001-b372-a9065e51be69', '2025-08-24T20:15:54.318Z', '2025-08-17 20:15:54');
INSERT INTO user_sessions (id, user_id, session_token, refresh_token, expires_at, created_at) VALUES (7, 7, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInVzZXJuYW1lIjoiYWRtaW4iLCJpc0FkbWluIjoxLCJpYXQiOjE3NTU0NjI4ODIsImV4cCI6MTc1NTU0OTI4Mn0.FEudxWGFeX4Y31bP6dZZPR00_9vJ1deLMdOn76N7Lnc', '2bfd307e-0bdf-40b1-b076-e9789c9bb91d', '2025-08-24T20:34:42.999Z', '2025-08-17 20:34:42');
INSERT INTO user_sessions (id, user_id, session_token, refresh_token, expires_at, created_at) VALUES (8, 7, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInVzZXJuYW1lIjoiYWRtaW4iLCJpc0FkbWluIjoxLCJpYXQiOjE3NTU0OTk1NzcsImV4cCI6MTc1NTU4NTk3N30.q7jRap4FNADMqMxh1AoXBU8z-cgz111rumPsGMWq5EU', '1d1a5c27-8707-4b54-9e50-e69d2d3828c5', '2025-08-25T06:46:17.464Z', '2025-08-18 06:46:17');
INSERT INTO user_sessions (id, user_id, session_token, refresh_token, expires_at, created_at) VALUES (9, 7, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInVzZXJuYW1lIjoiYWRtaW4iLCJpc0FkbWluIjoxLCJpYXQiOjE3NTU1MDY1NzYsImV4cCI6MTc1NTU5Mjk3Nn0.hdMyfLHZxOM4dh-wB_IVH1Erx_GU7v4GdyMqm1Sxdnc', '300efc4a-140d-4c15-a618-ffa6503a81f6', '2025-08-25T08:42:56.390Z', '2025-08-18 08:42:56');
INSERT INTO leetcode_suggestions (id, title, description, difficulty_level, topic_tags, problem_statement, input_format, output_format, constraints, examples, hints, source_problem_id, time_limit_ms, memory_limit_mb, test_cases, created_at, updated_at) VALUES (261, 'Add Two Numbers', 'LeetCode Problem 2: Add Two Numbers - Medium level problem', 'Medium', '["linked-list", "math", "recursion"]', '<p>You are given two <strong>non-empty</strong> linked lists representing two non-negative integers. The digits are stored in <strong>reverse order</strong>, and each of their nodes contains a single digit. Add the two numbers and return the sum&nbsp;as a linked list.</p>

<p>You may assume the two numbers do not contain any leading zero, except the number 0 itself.</p>

<p>&nbsp;</p>
<p><strong class="example">Example 1:</strong></p>
<img alt="" src="https://assets.leetcode.com/uploads/2020/10/02/addtwonumber1.jpg" style="width: 483px; height: 342px;" />
<pre>
<strong>Input:</strong> l1 = [2,4,3], l2 = [5,6,4]
<strong>Output:</strong> [7,0,8]
<strong>Explanation:</strong> 342 + 465 = 807.
</pre>

<p><strong class="example">Example 2:</strong></p>

<pre>
<strong>Input:</strong> l1 = [0], l2 = [0]
<strong>Output:</strong> [0]
</pre>

<p><strong class="example">Example 3:</strong></p>

<pre>
<strong>Input:</strong> l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]
<strong>Output:</strong> [8,9,9,9,0,0,0,1]
</pre>

<p>&nbsp;</p>
<p><strong>Constraints:</strong></p>

<ul>
	<li>The number of nodes in each linked list is in the range <code>[1, 100]</code>.</li>
	<li><code>0 &lt;= Node.val &lt;= 9</code></li>
	<li>It is guaranteed that the list represents a number that does not have leading zeros.</li>
</ul>
', 'Standard input format for this problem type', 'Expected output format for this problem type', 'Standard constraints for medium level problems', '["Example 2: Add Two Numbers case"]', 'Think step by step', '2', 1000, 256, '[{"input_data": "l1,\n                l2,", "expected_output": "output", "is_sample": true, "description": "Test case 1"}]', '2025-08-18 09:13:51', '2025-08-18 09:13:51');
INSERT INTO leetcode_suggestions (id, title, description, difficulty_level, topic_tags, problem_statement, input_format, output_format, constraints, examples, hints, source_problem_id, time_limit_ms, memory_limit_mb, test_cases, created_at, updated_at) VALUES (262, 'Longest Substring Without Repeating Characters', 'LeetCode Problem 3: Longest Substring Without Repeating Characters - Medium level problem', 'Medium', '["hash-table", "string", "sliding-window"]', '<p>Given a string <code>s</code>, find the length of the <strong>longest</strong> <span data-keyword="substring-nonempty"><strong>substring</strong></span> without duplicate characters.</p>

<p>&nbsp;</p>
<p><strong class="example">Example 1:</strong></p>

<pre>
<strong>Input:</strong> s = &quot;abcabcbb&quot;
<strong>Output:</strong> 3
<strong>Explanation:</strong> The answer is &quot;abc&quot;, with the length of 3.
</pre>

<p><strong class="example">Example 2:</strong></p>

<pre>
<strong>Input:</strong> s = &quot;bbbbb&quot;
<strong>Output:</strong> 1
<strong>Explanation:</strong> The answer is &quot;b&quot;, with the length of 1.
</pre>

<p><strong class="example">Example 3:</strong></p>

<pre>
<strong>Input:</strong> s = &quot;pwwkew&quot;
<strong>Output:</strong> 3
<strong>Explanation:</strong> The answer is &quot;wke&quot;, with the length of 3.
Notice that the answer must be a substring, &quot;pwke&quot; is a subsequence and not a substring.
</pre>

<p>&nbsp;</p>
<p><strong>Constraints:</strong></p>

<ul>
	<li><code>0 &lt;= s.length &lt;= 5 * 10<sup>4</sup></code></li>
	<li><code>s</code> consists of English letters, digits, symbols and spaces.</li>
</ul>
', 'Standard input format for this problem type', 'Expected output format for this problem type', 'Standard constraints for medium level problems', '["Example 3: Longest Substring Without Repeating Characters case"]', 'Generate all possible substrings & check for each substring if it''s valid and keep updating maxLen accordingly.', '3', 1000, 256, '[{"input_data": "s,", "expected_output": "output", "is_sample": true, "description": "Test case 1"}]', '2025-08-18 09:13:57', '2025-08-18 09:13:57');
INSERT INTO leetcode_suggestions (id, title, description, difficulty_level, topic_tags, problem_statement, input_format, output_format, constraints, examples, hints, source_problem_id, time_limit_ms, memory_limit_mb, test_cases, created_at, updated_at) VALUES (264, 'Longest Palindromic Substring', 'LeetCode Problem 5: Longest Palindromic Substring - Medium level problem', 'Medium', '["two-pointers", "string", "dynamic-programming"]', '<p>Given a string <code>s</code>, return <em>the longest</em> <span data-keyword="palindromic-string"><em>palindromic</em></span> <span data-keyword="substring-nonempty"><em>substring</em></span> in <code>s</code>.</p>

<p>&nbsp;</p>
<p><strong class="example">Example 1:</strong></p>

<pre>
<strong>Input:</strong> s = &quot;babad&quot;
<strong>Output:</strong> &quot;bab&quot;
<strong>Explanation:</strong> &quot;aba&quot; is also a valid answer.
</pre>

<p><strong class="example">Example 2:</strong></p>

<pre>
<strong>Input:</strong> s = &quot;cbbd&quot;
<strong>Output:</strong> &quot;bb&quot;
</pre>

<p>&nbsp;</p>
<p><strong>Constraints:</strong></p>

<ul>
	<li><code>1 &lt;= s.length &lt;= 1000</code></li>
	<li><code>s</code> consist of only digits and English letters.</li>
</ul>
', 'Standard input format for this problem type', 'Expected output format for this problem type', 'Standard constraints for medium level problems', '["Example 5: Longest Palindromic Substring case"]', 'How can we reuse a previously computed palindrome to compute a larger palindrome?; If “aba” is a palindrome, is “xabax” a palindrome? Similarly is “xabay” a palindrome?; Complexity based hint:</br>
If we use brute-force and check whether for every start and end position a substring is a palindrome we have O(n^2) start - end pairs and O(n) palindromic checks. Can we reduce the time for palindromic checks to O(1) by reusing some previous computation.', '5', 1000, 256, '[{"input_data": "s,", "expected_output": "output", "is_sample": true, "description": "Test case 1"}]', '2025-08-18 09:14:07', '2025-08-18 09:14:07');
INSERT INTO leetcode_suggestions (id, title, description, difficulty_level, topic_tags, problem_statement, input_format, output_format, constraints, examples, hints, source_problem_id, time_limit_ms, memory_limit_mb, test_cases, created_at, updated_at) VALUES (265, 'Zigzag Conversion', 'LeetCode Problem 6: Zigzag Conversion - Medium level problem', 'Medium', '["string"]', '<p>The string <code>&quot;PAYPALISHIRING&quot;</code> is written in a zigzag pattern on a given number of rows like this: (you may want to display this pattern in a fixed font for better legibility)</p>

<pre>
P   A   H   N
A P L S I I G
Y   I   R
</pre>

<p>And then read line by line: <code>&quot;PAHNAPLSIIGYIR&quot;</code></p>

<p>Write the code that will take a string and make this conversion given a number of rows:</p>

<pre>
string convert(string s, int numRows);
</pre>

<p>&nbsp;</p>
<p><strong class="example">Example 1:</strong></p>

<pre>
<strong>Input:</strong> s = &quot;PAYPALISHIRING&quot;, numRows = 3
<strong>Output:</strong> &quot;PAHNAPLSIIGYIR&quot;
</pre>

<p><strong class="example">Example 2:</strong></p>

<pre>
<strong>Input:</strong> s = &quot;PAYPALISHIRING&quot;, numRows = 4
<strong>Output:</strong> &quot;PINALSIGYAHRPI&quot;
<strong>Explanation:</strong>
P     I    N
A   L S  I G
Y A   H R
P     I
</pre>

<p><strong class="example">Example 3:</strong></p>

<pre>
<strong>Input:</strong> s = &quot;A&quot;, numRows = 1
<strong>Output:</strong> &quot;A&quot;
</pre>

<p>&nbsp;</p>
<p><strong>Constraints:</strong></p>

<ul>
	<li><code>1 &lt;= s.length &lt;= 1000</code></li>
	<li><code>s</code> consists of English letters (lower-case and upper-case), <code>&#39;,&#39;</code> and <code>&#39;.&#39;</code>.</li>
	<li><code>1 &lt;= numRows &lt;= 1000</code></li>
</ul>
', 'Standard input format for this problem type', 'Expected output format for this problem type', 'Standard constraints for medium level problems', '["Example 6: Zigzag Conversion case"]', 'Think step by step', '6', 1000, 256, '[{"input_data": "s,\n                numRows,", "expected_output": "output", "is_sample": true, "description": "Test case 1"}]', '2025-08-18 09:14:12', '2025-08-18 09:14:12');
INSERT INTO leetcode_suggestions (id, title, description, difficulty_level, topic_tags, problem_statement, input_format, output_format, constraints, examples, hints, source_problem_id, time_limit_ms, memory_limit_mb, test_cases, created_at, updated_at) VALUES (266, 'Reverse Integer', 'LeetCode Problem 7: Reverse Integer - Medium level problem', 'Medium', '["math"]', '<p>Given a signed 32-bit integer <code>x</code>, return <code>x</code><em> with its digits reversed</em>. If reversing <code>x</code> causes the value to go outside the signed 32-bit integer range <code>[-2<sup>31</sup>, 2<sup>31</sup> - 1]</code>, then return <code>0</code>.</p>

<p><strong>Assume the environment does not allow you to store 64-bit integers (signed or unsigned).</strong></p>

<p>&nbsp;</p>
<p><strong class="example">Example 1:</strong></p>

<pre>
<strong>Input:</strong> x = 123
<strong>Output:</strong> 321
</pre>

<p><strong class="example">Example 2:</strong></p>

<pre>
<strong>Input:</strong> x = -123
<strong>Output:</strong> -321
</pre>

<p><strong class="example">Example 3:</strong></p>

<pre>
<strong>Input:</strong> x = 120
<strong>Output:</strong> 21
</pre>

<p>&nbsp;</p>
<p><strong>Constraints:</strong></p>

<ul>
	<li><code>-2<sup>31</sup> &lt;= x &lt;= 2<sup>31</sup> - 1</code></li>
</ul>
', 'Standard input format for this problem type', 'Expected output format for this problem type', 'Standard constraints for medium level problems', '["Example 7: Reverse Integer case"]', 'Think step by step', '7', 1000, 256, '[{"input_data": "x,", "expected_output": "output", "is_sample": true, "description": "Test case 1"}]', '2025-08-18 09:14:17', '2025-08-18 09:14:17');
INSERT INTO leetcode_suggestions (id, title, description, difficulty_level, topic_tags, problem_statement, input_format, output_format, constraints, examples, hints, source_problem_id, time_limit_ms, memory_limit_mb, test_cases, created_at, updated_at) VALUES (267, 'Palindrome Number', 'LeetCode Problem 9: Palindrome Number - Easy level problem', 'Easy', '["math"]', '<p>Given an integer <code>x</code>, return <code>true</code><em> if </em><code>x</code><em> is a </em><span data-keyword="palindrome-integer"><em><strong>palindrome</strong></em></span><em>, and </em><code>false</code><em> otherwise</em>.</p>

<p>&nbsp;</p>
<p><strong class="example">Example 1:</strong></p>

<pre>
<strong>Input:</strong> x = 121
<strong>Output:</strong> true
<strong>Explanation:</strong> 121 reads as 121 from left to right and from right to left.
</pre>

<p><strong class="example">Example 2:</strong></p>

<pre>
<strong>Input:</strong> x = -121
<strong>Output:</strong> false
<strong>Explanation:</strong> From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.
</pre>

<p><strong class="example">Example 3:</strong></p>

<pre>
<strong>Input:</strong> x = 10
<strong>Output:</strong> false
<strong>Explanation:</strong> Reads 01 from right to left. Therefore it is not a palindrome.
</pre>

<p>&nbsp;</p>
<p><strong>Constraints:</strong></p>

<ul>
	<li><code>-2<sup>31</sup>&nbsp;&lt;= x &lt;= 2<sup>31</sup>&nbsp;- 1</code></li>
</ul>

<p>&nbsp;</p>
<strong>Follow up:</strong> Could you solve it without converting the integer to a string?', 'Standard input format for this problem type', 'Expected output format for this problem type', 'Standard constraints for easy level problems', '["Example 9: Palindrome Number case"]', 'Beware of overflow when you reverse the integer.', '9', 1000, 256, '[{"input_data": "x,", "expected_output": "output", "is_sample": true, "description": "Test case 1"}]', '2025-08-18 09:14:27', '2025-08-18 09:14:27');
INSERT INTO leetcode_suggestions (id, title, description, difficulty_level, topic_tags, problem_statement, input_format, output_format, constraints, examples, hints, source_problem_id, time_limit_ms, memory_limit_mb, test_cases, created_at, updated_at) VALUES (268, 'Regular Expression Matching', 'LeetCode Problem 10: Regular Expression Matching - Hard level problem', 'Hard', '["string", "dynamic-programming", "recursion"]', '<p>Given an input string <code>s</code>&nbsp;and a pattern <code>p</code>, implement regular expression matching with support for <code>&#39;.&#39;</code> and <code>&#39;*&#39;</code> where:</p>

<ul>
	<li><code>&#39;.&#39;</code> Matches any single character.​​​​</li>
	<li><code>&#39;*&#39;</code> Matches zero or more of the preceding element.</li>
</ul>

<p>The matching should cover the <strong>entire</strong> input string (not partial).</p>

<p>&nbsp;</p>
<p><strong class="example">Example 1:</strong></p>

<pre>
<strong>Input:</strong> s = &quot;aa&quot;, p = &quot;a&quot;
<strong>Output:</strong> false
<strong>Explanation:</strong> &quot;a&quot; does not match the entire string &quot;aa&quot;.
</pre>

<p><strong class="example">Example 2:</strong></p>

<pre>
<strong>Input:</strong> s = &quot;aa&quot;, p = &quot;a*&quot;
<strong>Output:</strong> true
<strong>Explanation:</strong> &#39;*&#39; means zero or more of the preceding element, &#39;a&#39;. Therefore, by repeating &#39;a&#39; once, it becomes &quot;aa&quot;.
</pre>

<p><strong class="example">Example 3:</strong></p>

<pre>
<strong>Input:</strong> s = &quot;ab&quot;, p = &quot;.*&quot;
<strong>Output:</strong> true
<strong>Explanation:</strong> &quot;.*&quot; means &quot;zero or more (*) of any character (.)&quot;.
</pre>

<p>&nbsp;</p>
<p><strong>Constraints:</strong></p>

<ul>
	<li><code>1 &lt;= s.length&nbsp;&lt;= 20</code></li>
	<li><code>1 &lt;= p.length&nbsp;&lt;= 20</code></li>
	<li><code>s</code> contains only lowercase English letters.</li>
	<li><code>p</code> contains only lowercase English letters, <code>&#39;.&#39;</code>, and&nbsp;<code>&#39;*&#39;</code>.</li>
	<li>It is guaranteed for each appearance of the character <code>&#39;*&#39;</code>, there will be a previous valid character to match.</li>
</ul>
', 'Standard input format for this problem type', 'Expected output format for this problem type', 'Standard constraints for hard level problems', '["Example 10: Regular Expression Matching case"]', 'Think step by step', '10', 1000, 256, '[{"input_data": "s,\n                p,", "expected_output": "output", "is_sample": true, "description": "Test case 1"}]', '2025-08-18 09:14:31', '2025-08-18 09:14:31');
COMMIT;

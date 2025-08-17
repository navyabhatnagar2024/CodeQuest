const bcrypt = require('bcryptjs');
const database = require('./connection');

class DatabaseSeeder {
    constructor() {
        this.sampleProblems = [
            {
                title: 'Two Sum',
                description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

**Example 1:**
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\`

**Example 3:**
\`\`\`
Input: nums = [3,3], target = 6
Output: [0,1]
\`\`\`

**Constraints:**
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists`,
                problem_statement: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
                difficulty_level: 'Easy',
                time_limit_ms: 1000,
                memory_limit_mb: 256,
                topic_tags: JSON.stringify(['array', 'hash-table']),
                input_format: 'The first line contains two integers n and target.\nThe second line contains n space-separated integers representing the array nums.',
                output_format: 'Print two space-separated integers representing the indices of the two numbers.',
                constraints: JSON.stringify([
                    '2 <= nums.length <= 10^4',
                    '-10^9 <= nums[i] <= 10^9',
                    '-10^9 <= target <= 10^9',
                    'Only one valid answer exists'
                ]),
                examples: JSON.stringify([
                    {
                        input: '4 9\n2 7 11 15',
                        output: '0 1',
                        explanation: 'nums[0] + nums[1] = 2 + 7 = 9'
                    },
                    {
                        input: '3 6\n3 2 4',
                        output: '1 2',
                        explanation: 'nums[1] + nums[2] = 2 + 4 = 6'
                    }
                ]),
                hints: 'Try using a hash map to store the complement of each number.',
                source_platform: 'LeetCode',
                source_problem_id: '1'
            },
            {
                title: 'Valid Parentheses',
                description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:

1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

**Example 1:**
\`\`\`
Input: s = "()"
Output: true
\`\`\`

**Example 2:**
\`\`\`
Input: s = "()[]{}"
Output: true
\`\`\`

**Example 3:**
\`\`\`
Input: s = "(]"
Output: false
\`\`\`

**Constraints:**
- 1 <= s.length <= 10^4
- s consists of parentheses only '()[]{}'`,
                problem_statement: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:

1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
                difficulty_level: 'Easy',
                time_limit_ms: 1000,
                memory_limit_mb: 256,
                topic_tags: JSON.stringify(['string', 'stack']),
                input_format: 'The first line contains a string s consisting of parentheses.',
                output_format: 'Print "true" if the string is valid, "false" otherwise.',
                constraints: JSON.stringify([
                    '1 <= s.length <= 10^4',
                    's consists of parentheses only \'()[]{}\''
                ]),
                examples: JSON.stringify([
                    {
                        input: '()',
                        output: 'true',
                        explanation: 'Simple valid parentheses'
                    },
                    {
                        input: '()[]{}',
                        output: 'true',
                        explanation: 'Multiple valid parentheses'
                    },
                    {
                        input: '(]',
                        output: 'false',
                        explanation: 'Invalid parentheses'
                    }
                ]),
                hints: 'Use a stack to keep track of opening brackets.',
                source_platform: 'LeetCode',
                source_problem_id: '20'
            },
            {
                title: 'Maximum Subarray',
                description: `Given an integer array nums, find the subarray with the largest sum, and return its sum.

**Example 1:**
\`\`\`
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: The subarray [4,-1,2,1] has the largest sum 6.
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [1]
Output: 1
\`\`\`

**Example 3:**
\`\`\`
Input: nums = [5,4,-1,7,8]
Output: 23
\`\`\`

**Constraints:**
- 1 <= nums.length <= 10^5
- -10^4 <= nums[i] <= 10^4`,
                problem_statement: `Given an integer array nums, find the subarray with the largest sum, and return its sum.`,
                difficulty_level: 'Medium',
                time_limit_ms: 1000,
                memory_limit_mb: 256,
                topic_tags: JSON.stringify(['array', 'divide-and-conquer', 'dynamic-programming']),
                input_format: 'The first line contains an integer n.\nThe second line contains n space-separated integers representing the array nums.',
                output_format: 'Print a single integer representing the maximum subarray sum.',
                constraints: JSON.stringify([
                    '1 <= nums.length <= 10^5',
                    '-10^4 <= nums[i] <= 10^4'
                ]),
                examples: JSON.stringify([
                    {
                        input: '9\n-2 1 -3 4 -1 2 1 -5 4',
                        output: '6',
                        explanation: 'The subarray [4,-1,2,1] has the largest sum 6'
                    },
                    {
                        input: '1\n1',
                        output: '1',
                        explanation: 'Single element array'
                    },
                    {
                        input: '5\n5 4 -1 7 8',
                        output: '23',
                        explanation: 'The entire array has the largest sum'
                    }
                ]),
                hints: 'Try using Kadane\'s algorithm or dynamic programming.',
                source_platform: 'LeetCode',
                source_problem_id: '53'
            }
        ];

        this.sampleTestCases = {
            'Two Sum': [
                {
                    input: '4 9\n2 7 11 15',
                    expected_output: '0 1',
                    is_sample: true,
                    weight: 10
                },
                {
                    input: '3 6\n3 2 4',
                    expected_output: '1 2',
                    is_sample: true,
                    weight: 10
                },
                {
                    input: '2 6\n3 3',
                    expected_output: '0 1',
                    is_sample: false,
                    weight: 20
                },
                {
                    input: '5 18\n1 5 8 10 13',
                    expected_output: '2 4',
                    is_sample: false,
                    weight: 25
                }
            ],
            'Valid Parentheses': [
                {
                    input: '()',
                    expected_output: 'true',
                    is_sample: true,
                    weight: 10
                },
                {
                    input: '()[]{}',
                    expected_output: 'true',
                    is_sample: true,
                    weight: 10
                },
                {
                    input: '(]',
                    expected_output: 'false',
                    is_sample: true,
                    weight: 10
                },
                {
                    input: '([)]',
                    expected_output: 'false',
                    is_sample: false,
                    weight: 20
                },
                {
                    input: '{[]}',
                    expected_output: 'true',
                    is_sample: false,
                    weight: 20
                }
            ],
            'Maximum Subarray': [
                {
                    input: '9\n-2 1 -3 4 -1 2 1 -5 4',
                    expected_output: '6',
                    is_sample: true,
                    weight: 10
                },
                {
                    input: '1\n1',
                    expected_output: '1',
                    is_sample: true,
                    weight: 10
                },
                {
                    input: '5\n5 4 -1 7 8',
                    expected_output: '23',
                    is_sample: true,
                    weight: 10
                },
                {
                    input: '4\n-1 -2 -3 -4',
                    expected_output: '-1',
                    is_sample: false,
                    weight: 20
                },
                {
                    input: '5\n1 2 3 4 5',
                    expected_output: '15',
                    is_sample: false,
                    weight: 20
                }
            ]
        };
    }

    async seed() {
        console.log('Starting database seeding...\n');

        try {
            await database.transaction(async () => {
                // Create admin user
                await this.createAdminUser();
                
                // Create sample problems
                await this.createSampleProblems();
                
                // Create sample contests
                await this.createSampleContests();
                
                // Create system settings (only if they don't exist)
                await this.createSystemSettings();
            });

            console.log('✓ Database seeded successfully!');
        } catch (error) {
            console.error('✗ Seeding failed:', error.message);
            throw error;
        }
    }

    async createAdminUser() {
        const hashedPassword = await bcrypt.hash('admin123', 12);
        
        const adminUser = {
            username: 'admin',
            email: 'admin@competitiveplatform.com',
            password_hash: hashedPassword,
            full_name: 'Administrator',
            country: 'Global',
            timezone: 'UTC',
            is_admin: 1,
            is_verified: 1,
            total_problems_solved: 0
        };

        await database.run(`
            INSERT OR IGNORE INTO users (
                username, email, password_hash, full_name, country, timezone,
                is_admin, is_verified, total_problems_solved
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            adminUser.username, adminUser.email, adminUser.password_hash,
            adminUser.full_name, adminUser.country, adminUser.timezone,
            adminUser.is_admin, adminUser.is_verified, adminUser.total_problems_solved
        ]);

        console.log('✓ Created admin user (username: admin, password: admin123)');
    }

    async createSampleProblems() {
        console.log('Creating sample problems...');
        
        for (const problem of this.sampleProblems) {
            try {
                console.log(`Processing problem: ${problem.title}`);
                
                // First check if problem exists
                const existingProblem = await database.get('SELECT id FROM problems WHERE title = ?', [problem.title]);
                
                let problemId;
                if (existingProblem) {
                    problemId = existingProblem.id;
                    console.log(`⚠ Problem already exists: ${problem.title} with ID: ${problemId}`);
                } else {
                    console.log(`Creating new problem: ${problem.title}`);
                    const result = await database.run(`
                        INSERT INTO problems (
                            title, description, problem_statement, difficulty_level, time_limit_ms, memory_limit_mb,
                            topic_tags, input_format, output_format, constraints, examples, hints,
                            source_platform, source_problem_id, is_active
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        problem.title, problem.description, problem.problem_statement, problem.difficulty_level,
                        problem.time_limit_ms, problem.memory_limit_mb, problem.topic_tags,
                        problem.input_format, problem.output_format, problem.constraints, problem.examples,
                        problem.hints, problem.source_platform, problem.source_problem_id, 1
                    ]);
                    
                    problemId = result.lastID;
                    console.log(`✓ Created problem: ${problem.title} with ID: ${problemId}`);
                }
                
                // Add test cases for this problem
                const testCases = this.sampleTestCases[problem.title] || [];
                let testCasesCreated = 0;
                
                console.log(`Adding ${testCases.length} test cases for problem: ${problem.title}`);
                
                for (const testCase of testCases) {
                    try {
                        // Check if test case already exists
                        const existingTestCase = await database.get(
                            'SELECT id FROM test_cases WHERE problem_id = ? AND input_data = ? AND expected_output = ?',
                            [problemId, testCase.input, testCase.expected_output]
                        );
                        
                        if (!existingTestCase) {
                            const testCaseResult = await database.run(`
                                INSERT INTO test_cases (
                                    problem_id, input_data, expected_output, is_sample, weight
                                ) VALUES (?, ?, ?, ?, ?)
                            `, [
                                problemId, testCase.input, testCase.expected_output,
                                testCase.is_sample, testCase.weight
                            ]);
                            testCasesCreated++;
                            console.log(`  ✓ Created test case: ${testCase.input} -> ${testCase.expected_output}`);
                        } else {
                            console.log(`  ⚠ Test case already exists: ${testCase.input} -> ${testCase.expected_output}`);
                        }
                    } catch (testCaseError) {
                        console.error(`Error creating test case for ${problem.title}:`, testCaseError);
                    }
                }
                
                if (testCasesCreated > 0) {
                    console.log(`  - Added ${testCasesCreated} new test cases`);
                } else {
                    console.log(`  - All test cases already exist`);
                }
                
            } catch (error) {
                console.error(`Error creating problem ${problem.title}:`, error);
                console.error('Error details:', {
                    message: error.message,
                    code: error.code,
                    errno: error.errno
                });
            }
        }
    }

    async createSampleContests() {
        // First, get the admin user ID
        const adminUser = await database.get('SELECT id FROM users WHERE username = ?', ['admin']);
        if (!adminUser) {
            console.error('❌ Admin user not found. Cannot create contests.');
            return;
        }

        const sampleContests = [
            {
                title: 'Beginner Contest #1',
                description: 'A beginner-friendly contest with easy problems',
                start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
                end_time: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
                duration_minutes: 60,
                max_participants: 1000,
                registration_deadline: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
                contest_type: 'Practice',
                difficulty_range: JSON.stringify({ min: 'Easy', max: 'Easy' }),
                prizes_description: 'Practice contest - no prizes',
                rules: 'Standard competitive programming rules apply',
                is_active: 1,
                is_public: 1
            },
            {
                title: 'Weekly Challenge #1',
                description: 'Weekly programming challenge with mixed difficulty problems',
                start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
                end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
                duration_minutes: 120,
                max_participants: 500,
                registration_deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
                contest_type: 'Rated',
                difficulty_range: JSON.stringify({ min: 'Easy', max: 'Medium' }),
                prizes_description: 'Rating points and bragging rights',
                rules: 'Rated contest - affects your rating',
                is_active: 1,
                is_public: 1
            }
        ];

        for (const contest of sampleContests) {
            try {
                const result = await database.run(`
                    INSERT OR IGNORE INTO contests (
                        title, description, start_time, end_time, duration_minutes,
                        max_participants, registration_deadline, contest_type, difficulty_range,
                        prizes_description, rules, is_active, is_public, created_by_admin_id
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    contest.title, contest.description, contest.start_time,
                    contest.end_time, contest.duration_minutes, contest.max_participants,
                    contest.registration_deadline, contest.contest_type, contest.difficulty_range,
                    contest.prizes_description, contest.rules, contest.is_active, contest.is_public, adminUser.id
                ]);

                if (result.lastID) {
                    console.log(`✓ Created contest: ${contest.title}`);
                }
            } catch (error) {
                console.error(`Error creating contest ${contest.title}:`, error);
            }
        }
    }

    async createSystemSettings() {
        // Only add settings that aren't already in the schema
        const additionalSettings = [
            ['platform_name', 'Competitive Programming Platform', 'Name of the platform'],
            ['platform_description', 'A comprehensive platform for competitive programming contests', 'Platform description'],
            ['enable_registration', 'true', 'Whether user registration is enabled'],
            ['enable_public_problems', 'true', 'Whether problems are publicly visible'],
            ['maintenance_mode', 'false', 'Whether the platform is in maintenance mode'],
            ['version', '1.0.0', 'Platform version']
        ];

        for (const [key, value, description] of additionalSettings) {
            await database.run(`
                INSERT OR IGNORE INTO system_settings (setting_key, setting_value, description)
                VALUES (?, ?, ?)
            `, [key, value, description]);
        }

        console.log('✓ Created additional system settings');
    }

    async clear() {
        console.log('Clearing database...');
        
        const tables = [
            'notifications', 'user_sessions', 'leaderboards', 'submissions',
            'contest_registrations', 'contest_problems', 'test_cases',
            'contests', 'problems', 'user_statistics', 'problem_statistics',
            'users', 'system_settings'
        ];

        for (const table of tables) {
            await database.run(`DELETE FROM ${table}`);
        }

        console.log('✓ Database cleared');
    }
}

// CLI interface
async function main() {
    const seeder = new DatabaseSeeder();
    const command = process.argv[2];

    try {
        switch (command) {
            case 'seed':
                await seeder.seed();
                break;
            case 'clear':
                await seeder.clear();
                break;
            case 'reset':
                await seeder.clear();
                await seeder.seed();
                break;
            default:
                console.log('Usage: node seed.js <command>');
                console.log('Commands:');
                console.log('  seed  - Seed the database with sample data');
                console.log('  clear - Clear all data from the database');
                console.log('  reset - Clear and reseed the database');
                break;
        }
    } catch (error) {
        console.error('Seeding error:', error.message);
        process.exit(1);
    } finally {
        await database.close();
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = DatabaseSeeder;

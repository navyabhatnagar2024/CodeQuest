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
- Only one valid answer exists.`,
                difficulty: 'Easy',
                time_limit: 1000,
                memory_limit: 256,
                topic_tags: JSON.stringify(['array', 'hash-table']),
                examples: JSON.stringify([
                    {
                        input: '[2,7,11,15]\n9',
                        output: '[0,1]',
                        explanation: 'nums[0] + nums[1] = 2 + 7 = 9'
                    },
                    {
                        input: '[3,2,4]\n6',
                        output: '[1,2]',
                        explanation: 'nums[1] + nums[2] = 2 + 4 = 6'
                    }
                ]),
                constraints: JSON.stringify([
                    '2 <= nums.length <= 10^4',
                    '-10^9 <= nums[i] <= 10^9',
                    '-10^9 <= target <= 10^9',
                    'Only one valid answer exists'
                ]),
                solution_template: JSON.stringify({
                    'javascript': `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Your code here
};`,
                    'python3': `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Your code here
        pass`,
                    'cpp': `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your code here
    }
};`,
                    'java': `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
    }
}`
                }),
                is_published: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
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
                difficulty: 'Easy',
                time_limit: 1000,
                memory_limit: 256,
                topic_tags: JSON.stringify(['string', 'stack']),
                examples: JSON.stringify([
                    {
                        input: '"()"',
                        output: 'true',
                        explanation: 'Simple valid parentheses'
                    },
                    {
                        input: '"()[]{}"',
                        output: 'true',
                        explanation: 'Multiple valid parentheses'
                    },
                    {
                        input: '"(]"',
                        output: 'false',
                        explanation: 'Invalid parentheses'
                    }
                ]),
                constraints: JSON.stringify([
                    '1 <= s.length <= 10^4',
                    's consists of parentheses only \'()[]{}\''
                ]),
                solution_template: JSON.stringify({
                    'javascript': `/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    // Your code here
};`,
                    'python3': `class Solution:
    def isValid(self, s: str) -> bool:
        # Your code here
        pass`,
                    'cpp': `class Solution {
public:
    bool isValid(string s) {
        // Your code here
    }
};`,
                    'java': `class Solution {
    public boolean isValid(String s) {
        // Your code here
    }
}`
                }),
                is_published: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
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
                difficulty: 'Medium',
                time_limit: 1000,
                memory_limit: 256,
                topic_tags: JSON.stringify(['array', 'divide-and-conquer', 'dynamic-programming']),
                examples: JSON.stringify([
                    {
                        input: '[-2,1,-3,4,-1,2,1,-5,4]',
                        output: '6',
                        explanation: 'The subarray [4,-1,2,1] has the largest sum 6'
                    },
                    {
                        input: '[1]',
                        output: '1',
                        explanation: 'Single element array'
                    },
                    {
                        input: '[5,4,-1,7,8]',
                        output: '23',
                        explanation: 'The entire array has the largest sum'
                    }
                ]),
                constraints: JSON.stringify([
                    '1 <= nums.length <= 10^5',
                    '-10^4 <= nums[i] <= 10^4'
                ]),
                solution_template: JSON.stringify({
                    'javascript': `/**
 * @param {number[]} nums
 * @return {number}
 */
var maxSubArray = function(nums) {
    // Your code here
};`,
                    'python3': `class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        # Your code here
        pass`,
                    'cpp': `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        // Your code here
    }
};`,
                    'java': `class Solution {
    public int maxSubArray(int[] nums) {
        // Your code here
    }
}`
                }),
                is_published: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ];

        this.sampleTestCases = {
            'Two Sum': [
                {
                    input: '[2,7,11,15]\n9',
                    expected_output: '[0,1]',
                    is_sample: true,
                    points: 10
                },
                {
                    input: '[3,2,4]\n6',
                    expected_output: '[1,2]',
                    is_sample: false,
                    points: 20
                },
                {
                    input: '[3,3]\n6',
                    expected_output: '[0,1]',
                    is_sample: false,
                    points: 20
                },
                {
                    input: '[1,5,8,10,13]\n18',
                    expected_output: '[2,4]',
                    is_sample: false,
                    points: 25
                }
            ],
            'Valid Parentheses': [
                {
                    input: '"()"',
                    expected_output: 'true',
                    is_sample: true,
                    points: 10
                },
                {
                    input: '"()[]{}"',
                    expected_output: 'true',
                    is_sample: true,
                    points: 10
                },
                {
                    input: '"(]"',
                    expected_output: 'false',
                    is_sample: true,
                    points: 10
                },
                {
                    input: '"([)]"',
                    expected_output: 'false',
                    is_sample: false,
                    points: 20
                },
                {
                    input: '"{[]}"',
                    expected_output: 'true',
                    is_sample: false,
                    points: 20
                }
            ],
            'Maximum Subarray': [
                {
                    input: '[-2,1,-3,4,-1,2,1,-5,4]',
                    expected_output: '6',
                    is_sample: true,
                    points: 10
                },
                {
                    input: '[1]',
                    expected_output: '1',
                    is_sample: true,
                    points: 10
                },
                {
                    input: '[5,4,-1,7,8]',
                    expected_output: '23',
                    is_sample: true,
                    points: 10
                },
                {
                    input: '[-1,-2,-3,-4]',
                    expected_output: '-1',
                    is_sample: false,
                    points: 20
                },
                {
                    input: '[1,2,3,4,5]',
                    expected_output: '15',
                    is_sample: false,
                    points: 20
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
                
                // Create system settings
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
            elo_rating: 1500,
            total_problems_solved: 0,
            contests_participated: 0,
            is_admin: 1,
            is_verified: 1,
            account_status: 'active',
            preferred_language: 'python',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        await database.run(`
            INSERT OR IGNORE INTO users (
                username, email, password_hash, full_name, elo_rating, 
                total_problems_solved, contests_participated, is_admin, is_verified,
                account_status, preferred_language, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            adminUser.username, adminUser.email, adminUser.password_hash,
            adminUser.full_name, adminUser.elo_rating, adminUser.total_problems_solved,
            adminUser.contests_participated, adminUser.is_admin, adminUser.is_verified,
            adminUser.account_status, adminUser.preferred_language,
            adminUser.created_at, adminUser.updated_at
        ]);

        console.log('✓ Created admin user (username: admin, password: admin123)');
    }

    async createSampleProblems() {
        console.log('Creating sample problems...');
        console.log('Sample problems array:', this.sampleProblems.length);
        
        for (const problem of this.sampleProblems) {
            console.log('Processing problem:', problem.title);
            try {
                const result = await database.run(`
                    INSERT OR IGNORE INTO problems (
                        title, description, problem_statement, difficulty_level, time_limit_ms, memory_limit_mb,
                        topic_tags, examples, constraints, is_active, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    problem.title, problem.description, problem.description, problem.difficulty,
                    problem.time_limit, problem.memory_limit, problem.topic_tags,
                    problem.examples, problem.constraints, 1, problem.created_at, problem.updated_at
                ]);

                console.log('Insert result:', result);
                if (result.lastID) {
                    console.log(`✓ Created problem: ${problem.title}`);
                    
                    // Add test cases for this problem
                    const testCases = this.sampleTestCases[problem.title] || [];
                    for (const testCase of testCases) {
                        await database.run(`
                            INSERT OR IGNORE INTO test_cases (
                                problem_id, input_data, expected_output, is_sample, weight
                            ) VALUES (?, ?, ?, ?, ?)
                        `, [
                            result.lastID, testCase.input, testCase.expected_output,
                            testCase.is_sample, testCase.points
                        ]);
                    }
                    
                    console.log(`  - Added ${testCases.length} test cases`);
                } else {
                    console.log(`No problem created for: ${problem.title}`);
                }
            } catch (error) {
                console.error(`Error creating problem ${problem.title}:`, error);
            }
        }
    }

    async createSampleContests() {
        const sampleContests = [
            {
                title: 'Beginner Contest #1',
                description: 'A beginner-friendly contest with easy problems',
                start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
                end_time: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
                duration: 60,
                max_participants: 1000,
                registration_deadline: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
                is_published: true,
                scoring_rules: JSON.stringify({
                    'penalty_per_wrong_submission': 10,
                    'points_per_problem': 100,
                    'bonus_for_fast_solve': 10
                }),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                title: 'Weekly Challenge #1',
                description: 'Weekly programming challenge with mixed difficulty problems',
                start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
                end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
                duration: 120,
                max_participants: 500,
                registration_deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
                is_published: true,
                scoring_rules: JSON.stringify({
                    'penalty_per_wrong_submission': 15,
                    'points_per_problem': 150,
                    'bonus_for_fast_solve': 20
                }),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ];

        for (const contest of sampleContests) {
            const result = await database.run(`
                INSERT OR IGNORE INTO contests (
                    title, description, start_time, end_time, duration_minutes,
                    max_participants, registration_deadline, is_active, is_public,
                    created_by_admin_id, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                contest.title, contest.description, contest.start_time,
                contest.end_time, contest.duration, contest.max_participants,
                contest.registration_deadline, 1, 1, 1, contest.created_at, contest.updated_at
            ]);

            if (result.lastID) {
                console.log(`✓ Created contest: ${contest.title}`);
            }
        }
    }

    async createSystemSettings() {
        const defaultSettings = [
            ['platform_name', 'Competitive Programming Platform'],
            ['platform_description', 'A comprehensive platform for competitive programming contests'],
            ['max_submission_length', '50000'],
            ['default_time_limit', '1000'],
            ['default_memory_limit', '256'],
            ['enable_registration', 'true'],
            ['enable_public_problems', 'true'],
            ['maintenance_mode', 'false'],
            ['version', '1.0.0']
        ];

        for (const [key, value] of defaultSettings) {
            await database.run(`
                INSERT OR IGNORE INTO system_settings (setting_key, setting_value)
                VALUES (?, ?)
            `, [key, value]);
        }

        console.log('✓ Created system settings');
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

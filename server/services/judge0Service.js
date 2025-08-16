const axios = require('axios');
const database = require('../database/connection');

class Judge0Service {
    constructor() {
        this.apiUrl = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
        this.apiKey = process.env.JUDGE0_API_KEY;
        this.maxRetries = 3;
        this.pollingInterval = 1000; // 1 second
        this.maxPollingTime = 30000; // 30 seconds
        
        // Supported languages with Judge0 IDs
        this.supportedLanguages = {
            'javascript': 63,    // Node.js
            'python': 71,        // Python 3
            'cpp': 54,           // C++ (GCC)
            'c': 50,             // C (GCC)
            'java': 62,          // Java
            'csharp': 51,        // C# (.NET)
            'r': 80,             // R
            'go': 60,            // Go
            'rust': 73,          // Rust
            'php': 68,           // PHP
            'ruby': 72,          // Ruby
            'swift': 83,         // Swift
            'kotlin': 78,        // Kotlin
            'scala': 81,         // Scala
            'typescript': 74     // TypeScript
        };
    }

    // Get language ID from language name
    getLanguageId(language) {
        const lang = language.toLowerCase();
        return this.supportedLanguages[lang] || this.supportedLanguages['python'];
    }

    // Get language name from ID
    getLanguageName(languageId) {
        for (const [name, id] of Object.entries(this.supportedLanguages)) {
            if (id === languageId) {
                return name;
            }
        }
        return 'python';
    }

    // Submit code to Judge0
    async submitCode(sourceCode, language, inputData = '', expectedOutput = '', timeLimit = 1000, memoryLimit = 256) {
        try {
            const languageId = this.getLanguageId(language);
            
            const submissionData = {
                source_code: sourceCode,
                language_id: languageId,
                stdin: inputData,
                expected_output: expectedOutput,
                cpu_time_limit: Math.ceil(timeLimit / 1000), // Convert to seconds
                memory_limit: memoryLimit * 1024, // Convert to KB
                enable_network: false,
                number_of_runs: 1
            };

            const response = await axios.post(
                `${this.apiUrl}/submissions`,
                submissionData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-RapidAPI-Key': this.apiKey,
                        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
                    },
                    timeout: 10000
                }
            );

            return response.data.token;
        } catch (error) {
            console.error('Error submitting code to Judge0:', error.message);
            throw new Error(`Failed to submit code: ${error.message}`);
        }
    }

    // Get submission result
    async getSubmissionResult(token) {
        try {
            const response = await axios.get(
                `${this.apiUrl}/submissions/${token}`,
                {
                    headers: {
                        'X-RapidAPI-Key': this.apiKey,
                        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
                    },
                    timeout: 5000
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error getting submission result:', error.message);
            throw new Error(`Failed to get submission result: ${error.message}`);
        }
    }

    // Poll submission until completion
    async pollSubmission(token, maxTime = this.maxPollingTime) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxTime) {
            try {
                const result = await this.getSubmissionResult(token);
                
                // Check if submission is complete
                if (result.status && result.status.id > 3) {
                    return this.processResult(result);
                }
                
                // Wait before next poll
                await new Promise(resolve => setTimeout(resolve, this.pollingInterval));
            } catch (error) {
                console.error('Error polling submission:', error.message);
                throw error;
            }
        }
        
        throw new Error('Submission polling timeout');
    }

    // Process Judge0 result
    processResult(result) {
        const statusMap = {
            1: 'Processing',
            2: 'Processing',
            3: 'Processing',
            4: 'AC',      // Accepted
            5: 'WA',      // Wrong Answer
            6: 'TLE',     // Time Limit Exceeded
            7: 'CE',      // Compilation Error
            8: 'RE',      // Runtime Error
            9: 'MLE',     // Memory Limit Exceeded
            10: 'RE',     // Runtime Error
            11: 'RE',     // Runtime Error
            12: 'RE',     // Runtime Error
            13: 'RE',     // Runtime Error
            14: 'RE',     // Runtime Error
            15: 'RE'      // Runtime Error
        };

        const status = statusMap[result.status?.id] || 'RE';
        
        return {
            status,
            executionTime: result.time || 0,
            memoryUsed: result.memory || 0,
            output: result.stdout || '',
            error: result.stderr || result.compile_output || '',
            expectedOutput: result.expected_output || '',
            judge0Status: result.status
        };
    }

    // Execute code with test cases
    async executeWithTestCases(sourceCode, language, testCases, timeLimit = 1000, memoryLimit = 256) {
        const results = [];
        let totalScore = 0;
        let passedTests = 0;
        let totalTests = testCases.length;

        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            
            try {
                // Submit code for this test case
                const token = await this.submitCode(
                    sourceCode,
                    language,
                    testCase.input_data,
                    testCase.expected_output,
                    timeLimit,
                    memoryLimit
                );

                // Poll for result
                const result = await this.pollSubmission(token);
                
                // Check if test case passed
                const passed = result.status === 'AC';
                const score = passed ? (testCase.weight || 1) : 0;
                
                results.push({
                    testCaseId: testCase.id,
                    status: result.status,
                    executionTime: result.executionTime,
                    memoryUsed: result.memoryUsed,
                    output: result.output,
                    error: result.error,
                    expectedOutput: testCase.expected_output,
                    passed,
                    score,
                    weight: testCase.weight || 1
                });

                if (passed) {
                    passedTests++;
                    totalScore += score;
                }

            } catch (error) {
                console.error(`Error executing test case ${i + 1}:`, error.message);
                results.push({
                    testCaseId: testCase.id,
                    status: 'RE',
                    executionTime: 0,
                    memoryUsed: 0,
                    output: '',
                    error: error.message,
                    expectedOutput: testCase.expected_output,
                    passed: false,
                    score: 0,
                    weight: testCase.weight || 1
                });
            }
        }

        // Calculate overall status
        let overallStatus = 'AC';
        if (passedTests === 0) {
            overallStatus = 'WA';
        } else if (passedTests < totalTests) {
            overallStatus = 'WA'; // Partial score
        }

        return {
            status: overallStatus,
            totalScore,
            passedTests,
            totalTests,
            results,
            executionTime: Math.max(...results.map(r => r.executionTime)),
            memoryUsed: Math.max(...results.map(r => r.memoryUsed))
        };
    }

    // Validate code before submission
    validateCode(sourceCode, language) {
        const maxLength = parseInt(process.env.MAX_SUBMISSION_LENGTH) || 50000;
        
        if (!sourceCode || sourceCode.trim().length === 0) {
            throw new Error('Source code cannot be empty');
        }
        
        if (sourceCode.length > maxLength) {
            throw new Error(`Source code too long. Maximum ${maxLength} characters allowed`);
        }
        
        if (!this.supportedLanguages[language.toLowerCase()]) {
            throw new Error(`Unsupported language: ${language}`);
        }
        
        return true;
    }

    // Get supported languages
    getSupportedLanguages() {
        return Object.keys(this.supportedLanguages).map(lang => ({
            name: lang,
            id: this.supportedLanguages[lang],
            displayName: this.getDisplayName(lang)
        }));
    }

    // Get display name for language
    getDisplayName(language) {
        const displayNames = {
            'javascript': 'JavaScript (Node.js)',
            'python': 'Python 3',
            'cpp': 'C++ (GCC)',
            'c': 'C (GCC)',
            'java': 'Java',
            'csharp': 'C# (.NET)',
            'r': 'R',
            'go': 'Go',
            'rust': 'Rust',
            'php': 'PHP',
            'ruby': 'Ruby',
            'swift': 'Swift',
            'kotlin': 'Kotlin',
            'scala': 'Scala',
            'typescript': 'TypeScript'
        };
        
        return displayNames[language] || language;
    }

    // Health check for Judge0 service
    async healthCheck() {
        try {
            const response = await axios.get(
                `${this.apiUrl}/languages`,
                {
                    headers: {
                        'X-RapidAPI-Key': this.apiKey,
                        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
                    },
                    timeout: 5000
                }
            );
            
            return response.status === 200;
        } catch (error) {
            console.error('Judge0 health check failed:', error.message);
            return false;
        }
    }

    // Get system statistics
    async getSystemStats() {
        try {
            const response = await axios.get(
                `${this.apiUrl}/statistics`,
                {
                    headers: {
                        'X-RapidAPI-Key': this.apiKey,
                        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
                    },
                    timeout: 5000
                }
            );
            
            return response.data;
        } catch (error) {
            console.error('Error getting Judge0 statistics:', error.message);
            return null;
        }
    }
}

module.exports = new Judge0Service();

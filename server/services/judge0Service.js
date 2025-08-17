const axios = require('axios');

class Judge0Service {
    constructor() {
        // Judge0 API endpoint (you can use the public instance or host your own)
        this.baseURL = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';
        this.apiKey = process.env.JUDGE0_API_KEY || '';
        
        // Supported languages mapping
        this.languageMap = {
            'python': 71,      // Python 3
            'python3': 71,     // Python 3
            'javascript': 63,   // JavaScript (Node.js)
            'js': 63,          // JavaScript (Node.js)
            'java': 62,        // Java
            'cpp': 54,         // C++17
            'c': 50,           // C (GCC 9.2.0)
            'csharp': 51,      // C# (Mono 6.6.0.161)
            'go': 60,          // Go
            'rust': 73,        // Rust
            'php': 68,         // PHP
            'ruby': 72,        // Ruby
            'swift': 83,       // Swift
            'kotlin': 78,      // Kotlin
            'scala': 81,       // Scala
            'r': 80,           // R
            'dart': 87,        // Dart
            'elixir': 57,      // Elixir
            'erlang': 58,      // Erlang
            'haskell': 61,     // Haskell
            'lua': 64,         // Lua
            'perl': 85,        // Perl
            'bash': 46,        // Bash
            'sql': 82,         // SQL
            'typescript': 74,  // TypeScript
            'ts': 74           // TypeScript
        };
    }

    /**
     * Submit code for execution
     */
    async submitCode(code, language, input = '') {
        try {
            const languageId = this.languageMap[language.toLowerCase()];
            if (!languageId) {
                throw new Error(`Unsupported language: ${language}`);
            }

            const submission = {
                source_code: code,
                language_id: languageId,
                stdin: input
            };

            const response = await axios.post(`${this.baseURL}/submissions`, submission, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-RapidAPI-Key': this.apiKey,
                    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
                }
            });

            return response.data.token;
        } catch (error) {
            console.error('Error submitting code to Judge0:', error);
            throw new Error(`Failed to submit code: ${error.message}`);
        }
    }

    /**
     * Get submission result
     */
    async getSubmissionResult(token) {
        try {
            const response = await axios.get(`${this.baseURL}/submissions/${token}`, {
                headers: {
                    'X-RapidAPI-Key': this.apiKey,
                    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error getting submission result:', error);
            throw new Error(`Failed to get submission result: ${error.message}`);
        }
    }

    /**
     * Wait for submission completion
     */
    async waitForSubmission(token, maxWaitTime = 30000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWaitTime) {
            try {
                const result = await this.getSubmissionResult(token);
                
                if (result.status && result.status.id > 2) { // Status > 2 means completed
                    return result;
                }
                
                // Wait 1 second before checking again
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error('Error waiting for submission:', error);
                throw error;
            }
        }
        
        throw new Error('Submission timeout');
    }

    /**
     * Execute code against test cases
     */
    async executeTestCases(code, language, testCases) {
        try {
            const results = [];
            
            for (const testCase of testCases) {
                try {
                    // Submit code with test case input
                    const token = await this.submitCode(code, language, testCase.input);
                    
                    // Wait for completion
                    const result = await this.waitForSubmission(token);
                    
                    // Check if execution was successful
                    if (result.status && result.status.id === 3) { // Accepted
                        const isCorrect = this.compareOutput(result.stdout, testCase.output);
                        
                        results.push({
                            testCase: testCase,
                            status: isCorrect ? 'PASSED' : 'FAILED',
                            output: result.stdout,
                            expected: testCase.output,
                            executionTime: result.time,
                            memory: result.memory,
                            error: null
                        });
                    } else if (result.status && result.status.id === 4) { // Wrong Answer
                        results.push({
                            testCase: testCase,
                            status: 'FAILED',
                            output: result.stdout,
                            expected: testCase.output,
                            executionTime: result.time,
                            memory: result.memory,
                            error: null
                        });
                    } else if (result.status && result.status.id === 5) { // Time Limit Exceeded
                        results.push({
                            testCase: testCase,
                            status: 'TLE',
                            output: null,
                            expected: testCase.output,
                            executionTime: null,
                            memory: null,
                            error: 'Time Limit Exceeded'
                        });
                    } else if (result.status && result.status.id === 6) { // Compilation Error
                        results.push({
                            testCase: testCase,
                            status: 'CE',
                            output: null,
                            expected: testCase.output,
                            executionTime: null,
                            memory: null,
                            error: result.compile_output || 'Compilation Error'
                        });
                    } else {
                        results.push({
                            testCase: testCase,
                            status: 'ERROR',
                            output: null,
                            expected: testCase.output,
                            executionTime: null,
                            memory: null,
                            error: result.status?.description || 'Unknown Error'
                        });
                    }
                } catch (error) {
                    results.push({
                        testCase: testCase,
                        status: 'ERROR',
                        output: null,
                        expected: testCase.output,
                        executionTime: null,
                        memory: null,
                        error: error.message
                    });
                }
            }
            
            return results;
        } catch (error) {
            console.error('Error executing test cases:', error);
            throw error;
        }
    }

    /**
     * Compare output with expected output
     */
    compareOutput(actual, expected) {
        if (!actual || !expected) return false;
        
        // Clean up whitespace and normalize line endings
        const cleanActual = actual.trim().replace(/\r\n/g, '\n');
        const cleanExpected = expected.trim().replace(/\r\n/g, '\n');
        
        return cleanActual === cleanExpected;
    }

    /**
     * Get supported languages
     */
    getSupportedLanguages() {
        return Object.keys(this.languageMap);
    }

    /**
     * Get language ID for a given language
     */
    getLanguageId(language) {
        return this.languageMap[language.toLowerCase()];
    }
}

module.exports = new Judge0Service();

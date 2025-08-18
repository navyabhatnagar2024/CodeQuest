const axios = require('axios');

class Judge0Service {
    constructor() {
        this.apiKey = process.env.JUDGE0_API_KEY;
        this.apiHost = process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com';
        this.baseURL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
        this.useRapidAPI = this.baseURL.includes('rapidapi.com');
        
        // Language mapping for Judge0
        this.languageMap = {
            'c': 50,           // C (GCC 9.2.0)
            'cpp': 54,         // C++ (GCC 9.2.0)
            'java': 62,        // Java (OpenJDK 13.0.1)
            'python': 71,      // Python (3.8.1)
            'javascript': 63,  // JavaScript (Node.js 12.14.0)
            'ruby': 72,        // Ruby (2.7.0)
            'csharp': 51,      // C# (Mono 6.6.0.161)
            'go': 60,          // Go (1.13.5)
            'rust': 73,        // Rust (1.40.0)
            'swift': 83,       // Swift (5.2.3)
            'php': 68,         // PHP (7.4.1)
            'kotlin': 78,      // Kotlin (1.3.70)
            'scala': 81,       // Scala (2.13.2)
            'haskell': 61,     // Haskell (GHC 8.8.1)
            'perl': 85,        // Perl (5.28.1)
            'bash': 46,        // Bash (5.0.0)
            'r': 80,           // R (4.0.0)
            'dart': 87,        // Dart (2.7.0)
            'elixir': 57,      // Elixir (1.9.4)
            'clojure': 86      // Clojure (1.10.1)
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
                stdin: input,
                base64_encoded: true
            };

            let headers = {
                'Content-Type': 'application/json'
            };

            // Add RapidAPI headers if using RapidAPI
            if (this.useRapidAPI && this.apiKey) {
                headers['X-RapidAPI-Key'] = this.apiKey;
                headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
            }

            const response = await axios.post(`${this.baseURL}/submissions`, submission, { headers });

            return response.data.token;
        } catch (error) {
            console.error('Error submitting code to Judge0:', error);
            
            // Provide more helpful error messages
            if (error.response) {
                if (error.response.status === 401) {
                    throw new Error('Judge0 API key is invalid or missing. Please check your JUDGE0_API_KEY environment variable.');
                } else if (error.response.status === 429) {
                    throw new Error('Judge0 API rate limit exceeded. Please try again later.');
                } else if (error.response.status === 500) {
                    throw new Error('Judge0 service is temporarily unavailable. Please try again later.');
                }
            }
            
            throw new Error(`Failed to submit code: ${error.message}`);
        }
    }

    /**
     * Get submission result
     */
    async getSubmissionResult(token) {
        try {
            let headers = {};
            
            // Add RapidAPI headers if using RapidAPI
            if (this.useRapidAPI && this.apiKey) {
                headers['X-RapidAPI-Key'] = this.apiKey;
                headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
            }

            // Add base64_encoded=true to resolve UTF-8 encoding issues
            const response = await axios.get(`${this.baseURL}/submissions/${token}?base64_encoded=true`, { headers });

            // Decode base64 encoded fields
            const decodedData = this.decodeBase64Response(response.data);

            return decodedData;
        } catch (error) {
            console.error('Error getting submission result:', error);
            throw new Error(`Failed to get submission result: ${error.message}`);
        }
    }

    /**
     * Decode base64 encoded response fields
     */
    decodeBase64Response(data) {
        const decoded = { ...data };
        
        // Decode common base64 fields
        if (decoded.stdout && typeof decoded.stdout === 'string') {
            try {
                decoded.stdout = Buffer.from(decoded.stdout, 'base64').toString('utf-8');
            } catch (e) {
                console.warn('Failed to decode stdout from base64:', e);
            }
        }
        
        if (decoded.stderr && typeof decoded.stderr === 'string') {
            try {
                decoded.stderr = Buffer.from(decoded.stderr, 'base64').toString('utf-8');
            } catch (e) {
                console.warn('Failed to decode stderr from base64:', e);
            }
        }
        
        if (decoded.compile_output && typeof decoded.compile_output === 'string') {
            try {
                decoded.compile_output = Buffer.from(decoded.compile_output, 'base64').toString('utf-8');
            } catch (e) {
                console.warn('Failed to decode compile_output from base64:', e);
            }
        }
        
        return decoded;
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
     * Execute code with input and return result
     */
    async executeCode(code, language, input = '') {
        try {
            console.log(`Executing ${language} code with input: "${input}"`);
            
            // Format input for the specific language if it's a test case
            const formattedInput = this.formatTestCaseInput({ input_data: input }, language);
            console.log(`Formatted input for ${language}:`, formattedInput);
            
            // Submit code
            const token = await this.submitCode(code, language, formattedInput);
            console.log('Code submitted, token:', token);
            
            // Wait for result
            const result = await this.waitForSubmission(token, 15000);
            console.log('Execution result:', result);
            
            return result;
        } catch (error) {
            console.error('Error executing code:', error);
            throw error;
        }
    }

    /**
     * Execute code against test cases
     */
    async executeTestCases(code, language, testCases) {
        try {
            console.log('Starting test case execution...');
            console.log('Language:', language);
            console.log('Code length:', code.length);
            console.log('Number of test cases:', testCases.length);
            console.log('Test cases:', JSON.stringify(testCases, null, 2));
            
            const results = [];
            
            for (const testCase of testCases) {
                try {
                    console.log(`Processing test case ${testCase.id}:`, {
                        input: testCase.input_data,
                        expected_output: testCase.expected_output,
                        is_sample: testCase.is_sample
                    });
                    
                    // Format input for the specific language
                    const formattedInput = this.formatTestCaseInput(testCase, language);
                    console.log(`Formatted input for ${language}:`, formattedInput);
                    
                    // Submit code with formatted test case input
                    const token = await this.submitCode(code, language, formattedInput);
                    console.log(`Test case ${testCase.id} submitted, token:`, token);
                    
                    // Wait for completion
                    const result = await this.waitForSubmission(token);
                    console.log(`Test case ${testCase.id} completed:`, {
                        status_id: result.status?.id,
                        status_description: result.status?.description,
                        stdout: result.stdout,
                        stderr: result.stderr,
                        compile_output: result.compile_output
                    });
                    
                    // Check if execution was successful
                    if (result.status && result.status.id === 3) { // Accepted
                        const isCorrect = this.compareOutput(result.stdout, testCase.expected_output);
                        
                        results.push({
                            testCase: testCase,
                            status: isCorrect ? 'PASSED' : 'FAILED',
                            output: result.stdout,
                            expected: testCase.expected_output,
                            executionTime: result.time,
                            memory: result.memory,
                            error: null
                        });
                    } else if (result.status && result.status.id === 4) { // Wrong Answer
                        results.push({
                            testCase: testCase,
                            status: 'FAILED',
                            output: result.stdout,
                            expected: testCase.expected_output,
                            executionTime: result.time,
                            memory: result.memory,
                            error: null
                        });
                    } else if (result.status && result.status.id === 5) { // Time Limit Exceeded
                        results.push({
                            testCase: testCase,
                            status: 'TLE',
                            output: null,
                            expected: testCase.expected_output,
                            executionTime: null,
                            memory: null,
                            error: 'Time Limit Exceeded'
                        });
                    } else if (result.status && result.status.id === 6) { // Compilation Error
                        results.push({
                            testCase: testCase,
                            status: 'CE',
                            output: null,
                            expected: testCase.expected_output,
                            executionTime: null,
                            memory: null,
                            error: result.compile_output || 'Compilation Error'
                        });
                    } else {
                        results.push({
                            testCase: testCase,
                            status: 'ERROR',
                            output: null,
                            expected: testCase.expected_output,
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
                        expected: testCase.expected_output,
                        executionTime: null,
                        memory: null,
                        error: error.message
                    });
                }
            }
            
            console.log('Test case execution completed. Results:', results);
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

    /**
     * Format test case input for different programming languages
     */
    formatTestCaseInput(testCase, language) {
        const input = testCase.input_data || '';
        const expected = testCase.expected_output || '';
        
        // If input is already in a simple format, return as is
        if (this.isSimpleInput(input)) {
            return input;
        }
        
        // Parse complex input like "nums1 = [1,2], nums2 = [3,4]" and convert to simple format
        const parsedInput = this.parseComplexInput(input);
        
        // Format based on language
        switch (language.toLowerCase()) {
            case 'python':
                return this.formatForPython(parsedInput);
            case 'javascript':
                return this.formatForJavaScript(parsedInput);
            case 'java':
                return this.formatForJava(parsedInput);
            case 'cpp':
            case 'c':
                return this.formatForC(parsedInput);
            default:
                return parsedInput;
        }
    }
    
    /**
     * Check if input is already in a simple, parseable format
     */
    isSimpleInput(input) {
        // Simple inputs like: "2 7 11 15 9", "abcabcbb", "121"
        return !input.includes('=') && !input.includes('nums') && !input.includes('target');
    }
    
    /**
     * Parse complex input like "nums1 = [1,2], nums2 = [3,4]" to extract values
     */
    parseComplexInput(input) {
        try {
            // Handle Two Sum format: "nums = [2,7,11,15], target = 9"
            if (input.includes('nums') && input.includes('target')) {
                const numsMatch = input.match(/nums\s*=\s*\[([^\]]+)\]/);
                const targetMatch = input.match(/target\s*=\s*(\d+)/);
                
                if (numsMatch && targetMatch) {
                    const nums = numsMatch[1].split(',').map(n => n.trim());
                    const target = targetMatch[1];
                    return { type: 'two_sum', nums, target };
                }
            }
            
            // Handle Median format: "nums1 = [1,3], nums2 = [2]"
            if (input.includes('nums1') && input.includes('nums2')) {
                const nums1Match = input.match(/nums1\s*=\s*\[([^\]]+)\]/);
                const nums2Match = input.match(/nums2\s*=\s*\[([^\]]+)\]/);
                
                if (nums1Match && nums2Match) {
                    const nums1 = nums1Match[1].split(',').map(n => n.trim());
                    const nums2 = nums2Match[1].split(',').map(n => n.trim());
                    return { type: 'median', nums1, nums2 };
                }
            }
            
            // Handle palindrome format: "121"
            if (/^\d+$/.test(input.trim())) {
                return { type: 'palindrome', value: input.trim() };
            }
            
            // Handle string format: "abcabcbb"
            if (/^[a-zA-Z]+$/.test(input.trim())) {
                return { type: 'string', value: input.trim() };
            }
            
            // Default: return as is
            return { type: 'raw', value: input };
            
        } catch (error) {
            console.warn('Error parsing complex input:', error);
            return { type: 'raw', value: input };
        }
    }
    
    /**
     * Format parsed input for Python
     */
    formatForPython(parsed) {
        switch (parsed.type) {
            case 'two_sum':
                return `${parsed.nums.join(' ')} ${parsed.target}`;
            case 'median':
                return `${parsed.nums1.join(' ')} ${parsed.nums2.join(' ')}`;
            case 'palindrome':
                return parsed.value;
            case 'string':
                return parsed.value;
            default:
                return parsed.value;
        }
    }
    
    /**
     * Format parsed input for JavaScript
     */
    formatForJavaScript(parsed) {
        return this.formatForPython(parsed); // Same format
    }
    
    /**
     * Format parsed input for Java
     */
    formatForJava(parsed) {
        return this.formatForPython(parsed); // Same format
    }
    
    /**
     * Format parsed input for C/C++
     */
    formatForC(parsed) {
        switch (parsed.type) {
            case 'two_sum':
                return `${parsed.nums.join(' ')} ${parsed.target}`;
            case 'median':
                return `${parsed.nums1.join(' ')} ${parsed.nums2.join(' ')}`;
            case 'palindrome':
                return parsed.value;
            case 'string':
                return parsed.value;
            default:
                return parsed.value;
        }
    }
}

module.exports = new Judge0Service();

const axios = require('axios');

class LLMService {
    constructor() {
        this.apiKey = process.env.OPENROUTER_API_KEY;
        this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
        this.model = 'qwen/qwen3-coder:free';
        
        if (!this.apiKey) {
            console.warn('OPENROUTER_API_KEY not found in environment variables');
        }
    }

    /**
     * Interpret test case and format it for a specific programming language
     */
    async interpretTestCase(testCase, language, problemContext = '') {
        try {
            if (!this.apiKey) {
                throw new Error('OpenRouter API key not configured');
            }

            const prompt = this.buildPrompt(testCase, language, problemContext);
            
            const response = await axios.post(
                this.apiUrl,
                {
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: this.getSystemPrompt(language)
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.1,
                    max_tokens: 1000
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
                        'X-Title': 'Coding Platform'
                    }
                }
            );

            const result = response.data.choices[0].message.content;
            return this.parseLLMResponse(result, language);
        } catch (error) {
            console.error('Error interpreting test case with LLM:', error);
            // Fallback to basic formatting if LLM fails
            return this.fallbackFormatting(testCase, language);
        }
    }

    /**
     * Build the prompt for the LLM
     */
    buildPrompt(testCase, language, problemContext) {
        return `Please interpret this test case and format the input data for ${language} programming language.

Test Case:
Input: ${testCase.input_data}
Expected Output: ${testCase.expected_output}

Problem Context: ${problemContext}

Please provide:
1. The formatted input that should be passed to the program
2. Any specific formatting requirements for ${language}
3. How the input should be parsed/read in ${language}

Format your response as JSON with the following structure:
{
    "formatted_input": "the actual input string to use",
    "input_format": "description of how to parse this input",
    "language_specific_notes": "any ${language}-specific considerations"
}`;
    }

    /**
     * Get system prompt for the LLM
     */
    getSystemPrompt(language) {
        return `You are an expert programming assistant specializing in ${language}. Your task is to interpret test case inputs and format them appropriately for ${language} programs.

Key requirements:
1. Understand the input format from the test case
2. Format it in a way that can be directly used as stdin for a ${language} program
3. Consider ${language}-specific input parsing methods
4. Provide clear, executable input that matches the expected output
5. Return only valid JSON as specified in the user prompt

Be precise and ensure the formatted input will produce the expected output when run with a correct solution.`;
    }

    /**
     * Parse the LLM response
     */
    parseLLMResponse(response, language) {
        try {
            // Try to extract JSON from the response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    success: true,
                    formatted_input: parsed.formatted_input || '',
                    input_format: parsed.input_format || '',
                    language_specific_notes: parsed.language_specific_notes || '',
                    raw_response: response
                };
            }
            
            // If no JSON found, try to extract just the input
            const inputMatch = response.match(/formatted_input["\s]*:["\s]*"([^"]+)"/);
            if (inputMatch) {
                return {
                    success: true,
                    formatted_input: inputMatch[1],
                    input_format: 'Extracted from LLM response',
                    language_specific_notes: 'Response parsed manually',
                    raw_response: response
                };
            }

            throw new Error('Could not parse LLM response');
        } catch (error) {
            console.error('Error parsing LLM response:', error);
            return {
                success: false,
                error: 'Failed to parse LLM response',
                raw_response: response
            };
        }
    }

    /**
     * Fallback formatting when LLM fails
     */
    fallbackFormatting(testCase, language) {
        // Basic formatting based on language
        let formattedInput = testCase.input_data;
        
        // Language-specific formatting rules
        switch (language.toLowerCase()) {
            case 'python':
            case 'javascript':
            case 'ruby':
            case 'php':
            case 'r':
                // These languages can handle most input formats directly
                break;
            case 'c':
            case 'cpp':
            case 'java':
                // For compiled languages, ensure proper line endings
                formattedInput = testCase.input_data.replace(/\r\n/g, '\n');
                break;
            case 'go':
            case 'rust':
                // Go and Rust also handle most formats well
                break;
            case 'csharp':
                // C# console input handling
                formattedInput = testCase.input_data.replace(/\r\n/g, '\n');
                break;
        }

        return {
            success: true,
            formatted_input: formattedInput,
            input_format: 'Basic formatting applied',
            language_specific_notes: 'Fallback formatting used due to LLM failure',
            raw_response: null
        };
    }

    /**
     * Batch interpret multiple test cases
     */
    async interpretTestCases(testCases, language, problemContext = '') {
        const results = [];
        
        for (const testCase of testCases) {
            try {
                const result = await this.interpretTestCase(testCase, language, problemContext);
                results.push({
                    testCaseId: testCase.id,
                    ...result
                });
            } catch (error) {
                console.error(`Error interpreting test case ${testCase.id}:`, error);
                results.push({
                    testCaseId: testCase.id,
                    success: false,
                    error: error.message,
                    formatted_input: testCase.input_data // Use original as fallback
                });
            }
        }
        
        return results;
    }

    /**
     * Health check for the LLM service
     */
    async healthCheck() {
        try {
            if (!this.apiKey) {
                return false;
            }
            
            // Try a simple test request
            const response = await axios.post(
                this.apiUrl,
                {
                    model: this.model,
                    messages: [
                        {
                            role: 'user',
                            content: 'Hello'
                        }
                    ],
                    max_tokens: 10
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            return response.status === 200;
        } catch (error) {
            console.error('LLM service health check failed:', error);
            return false;
        }
    }
}

module.exports = new LLMService();

require('dotenv').config();
const llmService = require('./services/llmService');

// Sample test case
const sampleTestCase = {
    id: 1,
    input_data: 'nums1 = [1,3], nums2 = [2]',
    expected_output: '2.0',
    is_sample: true
};

// Sample problem context
const problemContext = `Problem: Median of Two Sorted Arrays
Difficulty: Hard
Description: Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.`;

async function testLLMService() {
    console.log('🧠 Testing LLM Service...\n');
    
    // Test health check
    console.log('1. Health Check:');
    const health = await llmService.healthCheck();
    console.log(`   Status: ${health ? '✅ Healthy' : '❌ Unhealthy'}\n`);
    
    if (!health) {
        console.log('❌ LLM service is not healthy. Please check your API key configuration.');
        return;
    }
    
    // Test single test case interpretation
    console.log('2. Single Test Case Interpretation:');
    console.log(`   Input: ${sampleTestCase.input_data}`);
    console.log(`   Expected Output: ${sampleTestCase.expected_output}`);
    console.log(`   Language: Python\n`);
    
    try {
        const result = await llmService.interpretTestCase(sampleTestCase, 'python', problemContext);
        console.log('   Result:');
        console.log(`   - Success: ${result.success}`);
        if (result.success) {
            console.log(`   - Formatted Input: ${result.formatted_input}`);
            console.log(`   - Input Format: ${result.input_format}`);
            console.log(`   - Language Notes: ${result.language_specific_notes}`);
        } else {
            console.log(`   - Error: ${result.error}`);
        }
        console.log(`   - Raw Response: ${result.raw_response ? 'Available' : 'None'}\n`);
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
    }
    
    // Test multiple test cases
    console.log('3. Multiple Test Cases Interpretation:');
    const multipleTestCases = [
        sampleTestCase,
        {
            id: 2,
            input_data: 'nums1 = [1,2], nums2 = [3,4]',
            expected_output: '2.5',
            is_sample: true
        }
    ];
    
    try {
        const results = await llmService.interpretTestCases(multipleTestCases, 'python', problemContext);
        console.log(`   Processed ${results.length} test cases:`);
        
        results.forEach((result, index) => {
            console.log(`   Test Case ${index + 1}:`);
            console.log(`   - Success: ${result.success}`);
            if (result.success) {
                console.log(`   - Formatted Input: ${result.formatted_input}`);
            } else {
                console.log(`   - Error: ${result.error}`);
            }
        });
        console.log();
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
    }
    
    // Test different languages
    console.log('4. Language-Specific Testing:');
    const languages = ['python', 'javascript', 'cpp', 'java'];
    
    for (const lang of languages) {
        try {
            console.log(`   Testing ${lang.toUpperCase()}:`);
            const result = await llmService.interpretTestCase(sampleTestCase, lang, problemContext);
            console.log(`   - Success: ${result.success}`);
            if (result.success) {
                console.log(`   - Formatted Input: ${result.formatted_input.substring(0, 50)}...`);
            }
            console.log();
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}\n`);
        }
    }
    
    console.log('✅ LLM Service Test Completed!');
}

// Run the test
testLLMService().catch(console.error);

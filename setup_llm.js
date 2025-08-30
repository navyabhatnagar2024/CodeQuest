#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧠 Setting up LLM Integration for CodeQuest Platform\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
    console.log('✅ .env file found');
    
    // Read existing .env file
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Check if OPENROUTER_API_KEY already exists
    if (envContent.includes('OPENROUTER_API_KEY')) {
        console.log('✅ OPENROUTER_API_KEY already configured');
    } else {
        // Add the API key
        const apiKeyLine = '\n# OpenRouter API Configuration (for LLM service)\nOPENROUTER_API_KEY=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\n';
        fs.appendFileSync(envPath, apiKeyLine);
        console.log('✅ Added OPENROUTER_API_KEY to .env file');
    }
} else {
    console.log('📝 Creating .env file...');
    
    // Create new .env file with the API key
    const envContent = `# OpenRouter API Configuration (for LLM service)
OPENROUTER_API_KEY=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
`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file with OPENROUTER_API_KEY');
}

console.log('\n🚀 LLM Integration Setup Complete!');
console.log('\nNext steps:');
console.log('1. Install dependencies: npm install');
console.log('2. Start the server: npm start');
console.log('3. Test the LLM service: node server/test_llm.js');
console.log('\nFor more information, see LLM_INTEGRATION_README.md');

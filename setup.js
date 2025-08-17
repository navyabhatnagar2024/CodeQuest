const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Setting up Coding Platform...\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json') || !fs.existsSync('client') || !fs.existsSync('server')) {
    console.error('❌ Please run this script from the root directory of the project.');
    process.exit(1);
}

try {
    // Install root dependencies
    console.log('📦 Installing root dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Root dependencies installed!\n');

    // Setup server
    console.log('🔧 Setting up server...');
    process.chdir('server');
    execSync('node setup.js', { stdio: 'inherit' });
    process.chdir('..');
    console.log('✅ Server setup completed!\n');

    // Setup client
    console.log('🎨 Setting up client...');
    process.chdir('client');
    execSync('npm install', { stdio: 'inherit' });
    process.chdir('..');
    console.log('✅ Client setup completed!\n');

    console.log('🎉 Setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the server: cd server && npm start');
    console.log('2. Start the client: cd client && npm start');
    console.log('3. Server will be at http://localhost:5000');
    console.log('4. Client will be at http://localhost:3000');
    console.log('\n🔑 Admin credentials: username: admin, password: admin123');
    
} catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
}

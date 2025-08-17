const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Setting up Coding Platform Server...\n');

// Check if package.json exists
if (!fs.existsSync('package.json')) {
    console.error('❌ package.json not found. Please run this script from the server directory.');
    process.exit(1);
}

try {
    // Install dependencies
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully!\n');

    // Check if database directory exists
    const dbDir = path.join(__dirname, 'database');
    if (!fs.existsSync(dbDir)) {
        console.error('❌ Database directory not found.');
        process.exit(1);
    }

    // Seed the database
    console.log('🌱 Seeding database...');
    execSync('node database/seed.js seed', { stdio: 'inherit' });
    console.log('✅ Database seeded successfully!\n');

    console.log('🎉 Setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the server: npm start');
    console.log('2. The database is now populated with sample data');
    console.log('3. Admin credentials: username: admin, password: admin123');
    
} catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
}

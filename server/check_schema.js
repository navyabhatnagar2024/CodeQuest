const db = require('./database/connection');

async function checkSchema() {
    try {
        console.log('🔍 Checking database schema...');
        
        // Get all table names
        const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
        
        console.log('📋 Existing tables:');
        tables.forEach(table => {
            console.log(`   - ${table.name}`);
        });
        
        // Check if user_xp table exists
        const userXpExists = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='user_xp'");
        console.log(`\n❓ user_xp table exists: ${userXpExists ? 'Yes' : 'No'}`);
        
    } catch (error) {
        console.error('❌ Error checking schema:', error);
    }
}

checkSchema();

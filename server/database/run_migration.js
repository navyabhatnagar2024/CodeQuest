const fs = require('fs');
const path = require('path');
const database = require('./connection');

async function runMigration() {
    try {
        console.log('🚀 Running database migration...');
        
        // Read migration file
        const migrationPath = path.join(__dirname, 'migrations', '001_create_leetcode_suggestions.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        // Split SQL statements and execute each one
        const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
            if (statement.trim()) {
                console.log(`Executing: ${statement.trim().substring(0, 50)}...`);
                await database.run(statement);
            }
        }
        
        console.log('✅ Migration completed successfully!');
        console.log('📋 Created leetcode_suggestions table with indexes');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await database.close();
    }
}

// Run migration if this script is executed directly
if (require.main === module) {
    runMigration()
        .then(() => {
            console.log('\n🎉 Database migration completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Migration failed:', error);
            process.exit(1);
        });
}

module.exports = runMigration;

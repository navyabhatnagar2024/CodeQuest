const fs = require('fs');
const path = require('path');
const db = require('./database/connection');

async function runGamificationMigration() {
    console.log('🚀 Starting gamification system migration...');
    
    try {
        // Read the migration file
        const migrationPath = path.join(__dirname, 'database', 'migrations', '002_gamification_system.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        // Split into individual statements, but be more careful about semicolons
        const statements = migrationSQL
            .split('\n')
            .reduce((acc, line) => {
                const trimmedLine = line.trim();
                if (trimmedLine && !trimmedLine.startsWith('--')) {
                    if (acc.length > 0 && !acc[acc.length - 1].endsWith(';')) {
                        acc[acc.length - 1] += ' ' + trimmedLine;
                    } else {
                        acc.push(trimmedLine);
                    }
                }
                return acc;
            }, [])
            .filter(stmt => stmt.trim() && stmt.trim().endsWith(';'))
            .map(stmt => stmt.trim());
        
        console.log(`📝 Found ${statements.length} SQL statements to execute`);
        
        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            
            try {
                if (statement.trim()) {
                    await db.run(statement);
                    console.log(`✅ Statement ${i + 1} executed successfully`);
                }
            } catch (error) {
                // Handle "already exists" errors gracefully
                if (error.message.includes('already exists') || error.message.includes('duplicate column')) {
                    console.log(`⚠️  Statement ${i + 1} skipped (already exists): ${error.message}`);
                } else {
                    console.error(`❌ Statement ${i + 1} failed:`, error.message);
                    console.error('Statement:', statement);
                    throw error;
                }
            }
        }
        
        console.log('🎉 Gamification system migration completed successfully!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run the migration
runGamificationMigration();

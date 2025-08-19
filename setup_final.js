const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class FinalSetupManager {
    constructor() {
        this.dbPath = path.join(__dirname, 'server', 'database', 'coding_platform.db');
        this.systemDataPath = path.join(__dirname, 'server', 'database', 'initial_system_data.sql');
    }

    async setupFinal() {
        console.log('🚀 Starting Final Setup (System Settings)...\n');
        
        try {
            // Check if database exists
            if (!fs.existsSync(this.dbPath)) {
                console.error('❌ Database not found. Please run "npm run setup" first.');
                return;
            }

            // Check if .env file exists
            const envPath = path.join(__dirname, '.env');
            if (!fs.existsSync(envPath)) {
                console.error('❌ .env file not found. Please add your .env file first.');
                console.log('   Copy your .env file to the root directory, then run this script.');
                return;
            }

            // Import system settings
            await this.importSystemSettings();
            
            console.log('\n✅ Final setup completed successfully!');
            console.log('\n🎉 Your platform is now fully configured with:');
            console.log('   ✅ Database with all your problems and test cases');
            console.log('   ✅ Environment configuration from .env');
            console.log('   ✅ Custom system settings and branding');
            console.log('\n🚀 You can now start the platform with: npm run dev');
            
        } catch (error) {
            console.error('❌ Final setup failed:', error);
            process.exit(1);
        }
    }

    async importSystemSettings() {
        console.log('⚙️  Importing system settings...');
        
        if (!fs.existsSync(this.systemDataPath)) {
            console.error('❌ System settings file not found:', this.systemDataPath);
            return;
        }

        const systemData = fs.readFileSync(this.systemDataPath, 'utf8');
        
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath);
            
            // Execute the entire system settings file
            db.exec(systemData, (err) => {
                if (err) {
                    console.error('❌ Error importing system settings:', err.message);
                    reject(err);
                    return;
                }
                
                console.log('✅ System settings imported successfully');
                console.log('   - Platform name and description');
                console.log('   - Registration and visibility settings');
                console.log('   - Judge0 API configuration');
                console.log('   - Rate limiting and submission settings');
                console.log('   - All custom platform branding');
                
                db.close();
                resolve();
            });
        });
    }
}

// Run final setup if this file is executed directly
if (require.main === module) {
    const finalSetup = new FinalSetupManager();
    finalSetup.setupFinal();
}

module.exports = FinalSetupManager;

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class SetupManager {
    constructor() {
        this.dbPath = path.join(__dirname, 'server', 'database', 'coding_platform.db');
        this.schemaPath = path.join(__dirname, 'server', 'database', 'schema.sql');
    }

    async setup() {
        console.log('🚀 Starting Coding Platform Setup...\n');
        
        try {
            // 1. Create database directory if it doesn't exist
            await this.ensureDatabaseDirectory();
            
            // 2. Initialize database and create tables
            await this.initializeDatabase();
            
            // 3. Populate with sample data
            await this.populateSampleData();
            
            // 4. Create environment file
            await this.createEnvironmentFile();
            
            console.log('\n✅ Setup completed successfully!');
            console.log('\n📋 Next steps:');
            console.log('1. cd server && npm install');
            console.log('2. cd ../client && npm install');
            console.log('3. cd .. && npm run dev');
            console.log('\n🌐 The platform will be available at http://localhost:3000');
            
        } catch (error) {
            console.error('❌ Setup failed:', error);
            process.exit(1);
        }
    }

    async ensureDatabaseDirectory() {
        const dbDir = path.dirname(this.dbPath);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
            console.log('📁 Created database directory');
        }
    }

    async initializeDatabase() {
        console.log('🗄️  Initializing database...');
        
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(this.dbPath);
            
            // Read and execute schema
            const schema = fs.readFileSync(this.schemaPath, 'utf8');
            
            db.exec(schema, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                console.log('✅ Database tables created');
                db.close();
                resolve();
            });
        });
    }

    async populateSampleData() {
        console.log('🌱 Populating database with initial data...');
        
        const initialDataPath = path.join(__dirname, 'server', 'database', 'initial_data.sql');
        
        if (fs.existsSync(initialDataPath)) {
            // Import and run the initial data
            const initialData = fs.readFileSync(initialDataPath, 'utf8');
            
            return new Promise((resolve, reject) => {
                const db = new sqlite3.Database(this.dbPath);
                
                db.exec(initialData, (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    
                    console.log('✅ Initial data populated from exported database');
                    db.close();
                    resolve();
                });
            });
        } else {
            console.log('⚠️  No initial data file found. Database will be empty.');
            console.log('   Run: node server/database/export_database.js to export current data');
        }
    }

    async createEnvironmentFile() {
        const envPath = path.join(__dirname, '.env');
        const envExamplePath = path.join(__dirname, 'env.example');
        
        if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
            const envContent = fs.readFileSync(envExamplePath, 'utf8');
            
            // Replace placeholder values with actual values
            const actualEnvContent = envContent
                .replace('YOUR_JUDGE0_API_KEY', 'demo_key_for_testing')
                .replace('YOUR_JUDGE0_API_HOST', 'judge0-ce.p.rapidapi.com')
                .replace('YOUR_JWT_SECRET', 'your-super-secret-jwt-key-change-this-in-production')
                .replace('YOUR_DATABASE_PATH', './server/database/coding_platform.db');
            
            fs.writeFileSync(envPath, actualEnvContent);
            console.log('✅ Environment file created (.env)');
        }
    }
}

// Run setup if this file is executed directly
if (require.main === module) {
    const setup = new SetupManager();
    setup.setup();
}

module.exports = SetupManager;

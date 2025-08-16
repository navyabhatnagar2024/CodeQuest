const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
    constructor() {
        this.db = null;
        this.dbPath = path.join(__dirname, '..', '..', 'data', 'competitive_platform.db');
        this.init();
    }

    init() {
        // Ensure data directory exists
        const dataDir = path.dirname(this.dbPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Initialize database connection
        this.db = new sqlite3.Database(this.dbPath, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
            } else {
                console.log('Connected to SQLite database');
                this.enableForeignKeys();
                this.createTables();
            }
        });

        // Enable verbose mode for debugging
        this.db.configure('busyTimeout', 30000);
    }

    enableForeignKeys() {
        return new Promise((resolve, reject) => {
            this.db.run('PRAGMA foreign_keys = ON', (err) => {
                if (err) {
                    console.error('Error enabling foreign keys:', err.message);
                    reject(err);
                } else {
                    console.log('Foreign keys enabled');
                    resolve();
                }
            });
        });
    }

    createTables() {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Split schema into individual statements
        const statements = schema.split(';').filter(stmt => stmt.trim());
        
        statements.forEach((statement, index) => {
            if (statement.trim()) {
                this.db.run(statement, (err) => {
                    if (err) {
                        console.error(`Error executing statement ${index + 1}:`, err.message);
                        console.error('Statement:', statement);
                    }
                });
            }
        });
    }

    // Promise-based wrapper for database operations
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Transaction support
    async transaction(callback) {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run('BEGIN TRANSACTION');
                
                try {
                    const result = callback(this);
                    this.db.run('COMMIT', (err) => {
                        if (err) {
                            this.db.run('ROLLBACK');
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                } catch (error) {
                    this.db.run('ROLLBACK');
                    reject(error);
                }
            });
        });
    }

    // Close database connection
    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Database connection closed');
                    resolve();
                }
            });
        });
    }

    // Health check
    healthCheck() {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT 1 as health', (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.health === 1);
                }
            });
        });
    }

    // Get database statistics
    async getStats() {
        try {
            const stats = {};
            
            // Count users
            const userCount = await this.get('SELECT COUNT(*) as count FROM users');
            stats.users = userCount.count;
            
            // Count problems
            const problemCount = await this.get('SELECT COUNT(*) as count FROM problems');
            stats.problems = problemCount.count;
            
            // Count contests
            const contestCount = await this.get('SELECT COUNT(*) as count FROM contests');
            stats.contests = contestCount.count;
            
            // Count submissions
            const submissionCount = await this.get('SELECT COUNT(*) as count FROM submissions');
            stats.submissions = submissionCount.count;
            
            // Database size
            const dbStats = fs.statSync(this.dbPath);
            stats.databaseSize = dbStats.size;
            
            return stats;
        } catch (error) {
            console.error('Error getting database stats:', error);
            throw error;
        }
    }
}

// Create singleton instance
const database = new Database();

module.exports = database;

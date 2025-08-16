const fs = require('fs');
const path = require('path');
const database = require('./connection');

class DatabaseMigration {
    constructor() {
        this.migrationsPath = path.join(__dirname, 'migrations');
        this.ensureMigrationsDirectory();
    }

    ensureMigrationsDirectory() {
        if (!fs.existsSync(this.migrationsPath)) {
            fs.mkdirSync(this.migrationsPath, { recursive: true });
        }
    }

    async createMigrationsTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS migrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                version TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                checksum TEXT NOT NULL
            )
        `;
        await database.run(sql);
    }

    async getAppliedMigrations() {
        const migrations = await database.all('SELECT version FROM migrations ORDER BY version');
        return migrations.map(m => m.version);
    }

    async applyMigration(version, name, sql) {
        const checksum = this.calculateChecksum(sql);
        
        try {
            // Check if migration was already applied
            const existing = await database.get('SELECT version FROM migrations WHERE version = ?', [version]);
            if (existing) {
                console.log(`Migration ${version} (${name}) already applied, skipping...`);
                return;
            }

            // Apply the migration
            await database.transaction(async () => {
                // Split SQL by semicolon and execute each statement
                const statements = sql.split(';').filter(stmt => stmt.trim());
                for (const statement of statements) {
                    if (statement.trim()) {
                        await database.run(statement);
                    }
                }
                
                // Record the migration
                await database.run(
                    'INSERT INTO migrations (version, name, checksum) VALUES (?, ?, ?)',
                    [version, name, checksum]
                );
            });

            console.log(`✓ Applied migration ${version} (${name})`);
        } catch (error) {
            console.error(`✗ Failed to apply migration ${version} (${name}):`, error.message);
            throw error;
        }
    }

    calculateChecksum(content) {
        const crypto = require('crypto');
        return crypto.createHash('md5').update(content).digest('hex');
    }

    async runMigrations() {
        console.log('Starting database migrations...\n');

        try {
            // Create migrations table if it doesn't exist
            await this.createMigrationsTable();

            // Get list of migration files
            const migrationFiles = this.getMigrationFiles();
            const appliedMigrations = await this.getAppliedMigrations();

            if (migrationFiles.length === 0) {
                console.log('No migration files found.');
                return;
            }

            let appliedCount = 0;
            for (const file of migrationFiles) {
                const { version, name, sql } = this.parseMigrationFile(file);
                
                if (!appliedMigrations.includes(version)) {
                    await this.applyMigration(version, name, sql);
                    appliedCount++;
                }
            }

            if (appliedCount === 0) {
                console.log('\nAll migrations are up to date.');
            } else {
                console.log(`\n✓ Applied ${appliedCount} migration(s) successfully.`);
            }

        } catch (error) {
            console.error('\n✗ Migration failed:', error.message);
            process.exit(1);
        }
    }

    getMigrationFiles() {
        if (!fs.existsSync(this.migrationsPath)) {
            return [];
        }

        return fs.readdirSync(this.migrationsPath)
            .filter(file => file.endsWith('.sql'))
            .sort();
    }

    parseMigrationFile(filename) {
        const filePath = path.join(this.migrationsPath, filename);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract version and name from filename (format: VERSION__NAME.sql)
        const match = filename.match(/^(\d+\.\d+\.\d+)__(.+)\.sql$/);
        if (!match) {
            throw new Error(`Invalid migration filename format: ${filename}`);
        }

        const [, version, name] = match;
        return {
            version,
            name: name.replace(/_/g, ' '),
            sql: content
        };
    }

    async createMigration(version, name, sql) {
        const filename = `${version}__${name.replace(/\s+/g, '_')}.sql`;
        const filePath = path.join(this.migrationsPath, filename);
        
        fs.writeFileSync(filePath, sql);
        console.log(`Created migration file: ${filename}`);
    }

    async rollback(version) {
        console.log(`Rolling back to version: ${version}`);
        
        const appliedMigrations = await database.all(
            'SELECT version, name FROM migrations WHERE version > ? ORDER BY version DESC',
            [version]
        );

        if (appliedMigrations.length === 0) {
            console.log('No migrations to rollback.');
            return;
        }

        for (const migration of appliedMigrations) {
            console.log(`Rolling back ${migration.version} (${migration.name})...`);
            
            // Note: This is a simplified rollback. In a real implementation,
            // you would need to store the rollback SQL for each migration
            await database.run('DELETE FROM migrations WHERE version = ?', [migration.version]);
        }

        console.log(`✓ Rolled back ${appliedMigrations.length} migration(s)`);
    }

    async status() {
        const appliedMigrations = await database.all(
            'SELECT version, name, applied_at FROM migrations ORDER BY version'
        );
        
        console.log('Migration Status:');
        console.log('================');
        
        if (appliedMigrations.length === 0) {
            console.log('No migrations applied yet.');
        } else {
            appliedMigrations.forEach(migration => {
                console.log(`${migration.version} - ${migration.name} (${migration.applied_at})`);
            });
        }
    }
}

// CLI interface
async function main() {
    const migration = new DatabaseMigration();
    const command = process.argv[2];

    try {
        switch (command) {
            case 'up':
                await migration.runMigrations();
                break;
            case 'status':
                await migration.status();
                break;
            case 'rollback':
                const version = process.argv[3];
                if (!version) {
                    console.error('Please specify a version to rollback to.');
                    process.exit(1);
                }
                await migration.rollback(version);
                break;
            case 'create':
                const [migrationVersion, migrationName] = process.argv.slice(3);
                if (!migrationVersion || !migrationName) {
                    console.error('Usage: node migrate.js create <version> <name>');
                    process.exit(1);
                }
                await migration.createMigration(migrationVersion, migrationName, '-- Add your SQL here');
                break;
            default:
                console.log('Usage: node migrate.js <command>');
                console.log('Commands:');
                console.log('  up       - Run all pending migrations');
                console.log('  status   - Show migration status');
                console.log('  rollback <version> - Rollback to specific version');
                console.log('  create <version> <name> - Create new migration file');
                break;
        }
    } catch (error) {
        console.error('Migration error:', error.message);
        process.exit(1);
    } finally {
        await database.close();
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = DatabaseMigration;

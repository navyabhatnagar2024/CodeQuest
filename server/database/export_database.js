const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class DatabaseExporter {
    constructor() {
        this.dbPath = path.join(__dirname, 'coding_platform.db');
        this.exportPath = path.join(__dirname, 'initial_data.sql');
    }

    async exportDatabase() {
        console.log('📤 Exporting database content...\n');
        
        if (!fs.existsSync(this.dbPath)) {
            console.error('❌ Database not found. Please run the platform first to create the database.');
            return;
        }

        try {
            const db = new sqlite3.Database(this.dbPath);
            const exportQueries = [];
            
            // Get all tables
            const tables = await this.getTables(db);
            
            for (const table of tables) {
                console.log(`📋 Exporting table: ${table}`);
                const tableData = await this.exportTable(db, table);
                if (tableData.length > 0) {
                    exportQueries.push(...tableData);
                }
            }
            
            // Write to file
            const exportContent = this.formatExportContent(exportQueries);
            fs.writeFileSync(this.exportPath, exportContent);
            
            console.log(`\n✅ Database exported to: ${this.exportPath}`);
            console.log(`📊 Total queries: ${exportQueries.length}`);
            
            db.close();
            
        } catch (error) {
            console.error('❌ Export failed:', error);
        }
    }

    async getTables(db) {
        return new Promise((resolve, reject) => {
            db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", (err, rows) => {
                if (err) reject(err);
                else resolve(rows.map(row => row.name));
            });
        });
    }

    async exportTable(db, tableName) {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                const queries = [];
                for (const row of rows) {
                    const insertQuery = this.createInsertQuery(tableName, row);
                    queries.push(insertQuery);
                }
                
                resolve(queries);
            });
        });
    }

    createInsertQuery(tableName, row) {
        const columns = Object.keys(row);
        const values = columns.map(col => {
            const value = row[col];
            if (value === null) return 'NULL';
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
            if (typeof value === 'boolean') return value ? '1' : '0';
            return value;
        });
        
        return `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});`;
    }

    formatExportContent(queries) {
        const header = `-- Initial Database Data for CodeQuest Platform
-- This file contains all the data from the original database
-- Generated on: ${new Date().toISOString()}
-- 
-- To use this file:
-- 1. Create a fresh database using schema.sql
-- 2. Run this file to populate with initial data
-- 3. The platform will be ready to use with real problems and test cases

-- Disable foreign key constraints temporarily
PRAGMA foreign_keys = OFF;

-- Clear any existing data
DELETE FROM users WHERE id > 0;
DELETE FROM problems WHERE id > 0;
DELETE FROM test_cases WHERE id > 0;
DELETE FROM contests WHERE id > 0;
DELETE FROM system_settings WHERE id > 0;
DELETE FROM leetcode_suggestions WHERE id > 0;

-- Reset auto-increment counters
DELETE FROM sqlite_sequence;

`;

        const footer = `

-- Re-enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Update auto-increment counters to match the highest IDs
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM users) WHERE name = 'users';
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM problems) WHERE name = 'problems';
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM test_cases) WHERE name = 'test_cases';
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM contests) WHERE name = 'contests';
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM system_settings) WHERE name = 'system_settings';
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM leetcode_suggestions) WHERE name = 'leetcode_suggestions';
`;

        return header + queries.join('\n') + footer;
    }
}

// Run export if this file is executed directly
if (require.main === module) {
    const exporter = new DatabaseExporter();
    exporter.exportDatabase();
}

module.exports = DatabaseExporter;

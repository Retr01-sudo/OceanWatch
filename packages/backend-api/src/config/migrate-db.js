const fs = require('fs');
const path = require('path');
const pool = require('./database');

/**
 * Database migration script to update schema safely
 */
async function migrateDatabase() {
  try {
    console.log('Starting database migration...');
    
    // Check if new columns already exist
    const checkColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'reports' 
      AND column_name IN ('severity_level', 'report_language', 'brief_title', 'video_url', 'phone_number', 'address', 'is_verified')
    `);
    
    const existingColumns = checkColumns.rows.map(row => row.column_name);
    console.log('Existing enhanced columns:', existingColumns);
    
    // Add missing columns
    const columnsToAdd = [
      { name: 'severity_level', definition: 'VARCHAR(50) NOT NULL DEFAULT \'Medium\'' },
      { name: 'report_language', definition: 'VARCHAR(10) NOT NULL DEFAULT \'English\'' },
      { name: 'brief_title', definition: 'VARCHAR(255)' },
      { name: 'video_url', definition: 'VARCHAR(255)' },
      { name: 'phone_number', definition: 'VARCHAR(20)' },
      { name: 'address', definition: 'TEXT' },
      { name: 'is_verified', definition: 'BOOLEAN DEFAULT FALSE' },
      { name: 'verified_by', definition: 'INTEGER REFERENCES users(id)' },
      { name: 'verified_at', definition: 'TIMESTAMP WITH TIME ZONE' },
      { name: 'updated_at', definition: 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP' }
    ];
    
    for (const column of columnsToAdd) {
      if (!existingColumns.includes(column.name)) {
        console.log(`Adding column: ${column.name}`);
        await pool.query(`ALTER TABLE reports ADD COLUMN ${column.name} ${column.definition}`);
      } else {
        console.log(`Column ${column.name} already exists, skipping...`);
      }
    }
    
    // Add new indexes if they don't exist
    const indexesToAdd = [
      'CREATE INDEX IF NOT EXISTS idx_reports_event_type ON reports (event_type)',
      'CREATE INDEX IF NOT EXISTS idx_reports_severity ON reports (severity_level)',
      'CREATE INDEX IF NOT EXISTS idx_reports_verified ON reports (is_verified)'
    ];
    
    for (const indexQuery of indexesToAdd) {
      console.log('Creating index...');
      await pool.query(indexQuery);
    }
    
    console.log('Database migration completed successfully!');
  } catch (error) {
    console.error('Error during database migration:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateDatabase()
    .then(() => {
      console.log('Migration complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrateDatabase;

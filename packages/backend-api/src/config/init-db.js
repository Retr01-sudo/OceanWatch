const fs = require('fs');
const path = require('path');
const pool = require('./database');

/**
 * Initialize the database with schema ONLY - NO sample data
 * 
 * PRODUCTION SAFE: This script only creates tables and users.
 * It does NOT create any dummy reports.
 */
async function initDatabase() {
  try {
    console.log('Initializing database...');
    
    // Read and execute schema file
    const schemaPath = path.join(__dirname, 'schema-updated.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }
    
    console.log('Database initialized successfully!');
    console.log('✅ Tables created');
    console.log('✅ User accounts created');
    console.log('✅ NO dummy reports created (production safe)');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('Database setup complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database setup failed:', error);
      process.exit(1);
    });
}

module.exports = initDatabase;


const pool = require('./db');
const fs = require('fs');
const path = require('path');

// Initialize database tables if they don't exist
async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Check if password_resets table exists
    const [tables] = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'restaurant_db' AND table_name = 'password_resets'
    `);
    
    // If table doesn't exist, create it
    if (tables.length === 0) {
      console.log('Creating password_resets table...');
      
      // Read and execute the SQL migration file
      const migrationPath = path.join(__dirname, '..', 'migrations', 'password_resets_table.sql');
      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      await pool.query(sql);
      console.log('Password resets table created successfully');
    } else {
      console.log('Password resets table already exists');
    }
    
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

module.exports = { initializeDatabase };

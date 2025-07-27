require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function setupChatTables() {
  try {
    console.log('Setting up chat tables...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-chat-tables.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await pool.query(sqlContent);
    
    console.log('✅ Chat tables created successfully!');
    
    // Verify tables exist
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'chat%'
      ORDER BY table_name
    `);
    
    console.log('📋 Available chat tables:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error setting up chat tables:', error);
  } finally {
    await pool.end();
  }
}

setupChatTables(); 
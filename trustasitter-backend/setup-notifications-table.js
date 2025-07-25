const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// PostgreSQL client configuration
const db = new Client({
  host: "20.40.73.193",
  port: 5432,
  user: "postgres",
  password: "LargeWC<123456>",
  database: "postgres",
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000
});

async function setupNotificationsTable() {
  try {
    console.log('Connecting to database...');
    await db.connect();
    console.log('✅ Connected to PostgreSQL');

    // Read SQL file
    const sqlPath = path.join(__dirname, 'create-notifications-table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Creating notifications_read table...');
    await db.query(sqlContent);
    console.log('✅ notifications_read table created successfully');

    // Verify table was created
    const verifyResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'notifications_read'
    `);
    
    if (verifyResult.rows.length > 0) {
      console.log('✅ Table verification successful');
      
      // Show table structure
      const structureResult = await db.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'notifications_read'
        ORDER BY ordinal_position
      `);
      console.log('✅ Table structure:', structureResult.rows);
    } else {
      console.log('❌ Table was not created');
    }

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await db.end();
    console.log('Database connection closed');
  }
}

setupNotificationsTable(); 
const { Client } = require('pg');

// PostgreSQL client configuration
const db = new Client({
  host: "trustasitter-db.postgres.database.azure.com",
  port: 5432,
  user: "bruno",
  password: "PanetoneAzul01!",
  database: "postgres",
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000
});

async function testDatabase() {
  try {
    console.log('Connecting to database...');
    await db.connect();
    console.log('✅ Connected to PostgreSQL');

    // Test basic connection
    const result = await db.query('SELECT NOW()');
    console.log('✅ Database time:', result.rows[0].now);

    // Check if tables exist
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'babysitters', 'bookings', 'admins')
      ORDER BY table_name
    `);
    console.log('✅ Available tables:', tablesResult.rows.map(row => row.table_name));

    // Check table structures
    for (const table of ['users', 'babysitters']) {
      try {
        const structureResult = await db.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = $1
          ORDER BY ordinal_position
        `, [table]);
        console.log(`✅ ${table} table structure:`, structureResult.rows);
      } catch (error) {
        console.error(`❌ Error checking ${table} table:`, error.message);
      }
    }

    // Test a simple query on users table
    try {
      const usersResult = await db.query('SELECT COUNT(*) FROM users');
      console.log('✅ Users count:', usersResult.rows[0].count);
    } catch (error) {
      console.error('❌ Error querying users table:', error.message);
    }

    // Test a simple query on babysitters table
    try {
      const babysittersResult = await db.query('SELECT COUNT(*) FROM babysitters');
      console.log('✅ Babysitters count:', babysittersResult.rows[0].count);
    } catch (error) {
      console.error('❌ Error querying babysitters table:', error.message);
    }

  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await db.end();
    console.log('Database connection closed');
  }
}

testDatabase(); 
const { Client } = require('pg');

// Database configuration
const dbConfig = {
  host: "20.40.73.193",
  port: 5432,
  user: "postgres",
  password: "LargeWC<123456>",
  database: "postgres",
  // ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000
};

// Alternative database configuration (commented out)
/*
const dbConfig = {
  host: "10.0.0.4",
  port: 5432,
  user: "developer",
  password: "LargeWC<123456>",
  database: "postgres",
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000
};
*/

// Create and export database client
const db = new Client(dbConfig);

module.exports = { db, dbConfig }; 
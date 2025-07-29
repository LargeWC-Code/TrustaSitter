const { Client } = require('pg');

// Try to load local configuration
let localConfig;
try {
  localConfig = require('./local');
} catch (error) {
  console.error('❌ Local configuration file (config/local.js) not found!');
  console.error('Please copy config/local.template.js to config/local.js and fill in your configuration.');
  console.error('Error:', error.message);
  process.exit(1);
}

// Database configuration from local config
const dbConfig = localConfig.database;

// Create and export database client
const db = new Client(dbConfig);

module.exports = { db, dbConfig }; 
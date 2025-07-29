// Configuration template file
// Copy this file to local.js and fill in your actual values
// DO NOT commit local.js to version control

module.exports = {
  // Database configuration
  database: {
    host: "your-database-host",
    port: 5432,
    user: "your-database-user",
    password: "your-database-password",
    database: "your-database-name",
    // ssl: { rejectUnauthorized: false }, // Uncomment if using SSL
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000
  },

  // Google Maps API Key
  googleMapsApiKey: "your-google-maps-api-key",

  // JWT Secret (should be a strong, random string)
  jwtSecret: "your-jwt-secret-key",

  // Email configuration (optional)
  email: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASS || "your-email-password"
  }
}; 
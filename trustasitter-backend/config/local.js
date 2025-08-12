// Local configuration file - DO NOT COMMIT TO VERSION CONTROL
// This file contains sensitive information and should be kept local only

module.exports = {
  // Database configuration for AWS RDS
  database: {
    host: "db-trustasitter.c50cc4cyg1c6.ap-southeast-2.rds.amazonaws.com",
    port: 5432,
    user: "postgres",
    password: "LargeWC<123456>",
    database: "postgres",
    ssl: { rejectUnauthorized: false }, // Required for AWS RDS
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000
  },

  // Google Maps API Key
  googleMapsApiKey: "AIzaSyBVW-pAsL7J590t7Y1uM8Y4tlcNvSdy0O4",
  // Restricted Google Maps API Key for frontend (with limited permissions)
  googleMapsFrontendKey: "AIzaSyBVW-pAsL7J590t7Y1uM8Y4tlcNvSdy0O4", // Same key but with restrictions in Google Console
  
  // JWT Secret
  jwtSecret: "trustasitter-super-secret-jwt-key-2024",

  // Email configuration (if needed)
  email: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || ""
  }
}; 
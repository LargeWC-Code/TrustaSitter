// Local configuration file - DO NOT COMMIT TO VERSION CONTROL
// This file contains sensitive information and should be kept local only

module.exports = {
  // Database configuration
  /*
  database: {
    host: "20.40.73.193",
    port: 5432,
    user: "postgres",
    password: "LargeWC<123456>",
    database: "postgres",
    // ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000
  },
  */
  // Alternative database configuration (uncomment to use)
  
  database: {
    host: "10.0.0.4",
    port: 5432,
    user: "developer",
    password: "LargeWC<123456>",
    database: "postgres",
    ssl: { rejectUnauthorized: false },
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
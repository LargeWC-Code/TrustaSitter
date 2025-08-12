// Server configuration
const serverConfig = {
  port: process.env.PORT || 3000,
  cors: {
    origin: (origin, callback) => {
      // Allow any Azure Static Web Apps subdomain, AWS Amplify subdomain, localhost, and backend domain
      if (
        !origin ||
        origin.includes('azurestaticapps.net') ||
        origin.includes('amplifyapp.com') ||  // Allow AWS Amplify domains
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.includes('largewc.ink')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  },
  socketIO: {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:3000", "https://www.largewc.ink", "https://*.amplifyapp.com"],
      methods: ["GET", "POST"]
    }
  }
};

module.exports = serverConfig; 
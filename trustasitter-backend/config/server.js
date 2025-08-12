// Server configuration
const serverConfig = {
  port: process.env.PORT || 3000,
  cors: {
    origin: (origin, callback) => {
      // Allow any Azure Static Web Apps subdomain, localhost, and backend domain
      if (
        !origin ||
        origin.includes('azurestaticapps.net') ||
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
      origin: ["http://localhost:5173", "http://localhost:3000", "https://www.largewc.ink"],
      methods: ["GET", "POST"]
    }
  }
};

module.exports = serverConfig; 
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

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || localConfig.jwtSecret;

// Google Maps API Key
const GOOGLE_API_KEY = localConfig.googleMapsApiKey;
const GOOGLE_FRONTEND_API_KEY = localConfig.googleMapsFrontendKey;

// File upload configuration
const uploadConfig = {
  reports: {
    destination: '../uploads/reports',
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
      files: 1
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  }
};

// Notification types
const NOTIFICATION_TYPES = {
  BOOKING_CREATED: 'booking_created',
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_REJECTED: 'booking_rejected',
  BOOKING_CANCELLED: 'booking_cancelled',
  REPORT_SENT: 'report_sent',
  BOOKING_REMINDER_12H: 'booking_reminder_12h',
  BOOKING_REMINDER_1H: 'booking_reminder_1h',
  BOOKING_TIME_CHANGED: 'booking_time_changed',
  CHAT_MESSAGE: 'chat_message',
  PAYMENT_CONFIRMED: 'payment_confirmed'
};

// Booking statuses
const BOOKING_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

// User roles
const USER_ROLES = {
  USER: 'user',
  BABYSITTER: 'babysitter',
  ADMIN: 'admin'
};

module.exports = {
  JWT_SECRET,
  GOOGLE_API_KEY,
  GOOGLE_FRONTEND_API_KEY,
  uploadConfig,
  NOTIFICATION_TYPES,
  BOOKING_STATUSES,
  USER_ROLES
}; 
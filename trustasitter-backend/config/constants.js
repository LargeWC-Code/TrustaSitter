// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'trustasitter-super-secret-jwt-key-2024';

// Google Maps API Key
const GOOGLE_API_KEY = "AIzaSyBVW-pAsL7J590t7Y1uM8Y4tlcNvSdy0O4";

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
  uploadConfig,
  NOTIFICATION_TYPES,
  BOOKING_STATUSES,
  USER_ROLES
}; 
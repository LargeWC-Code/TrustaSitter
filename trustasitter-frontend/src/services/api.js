import axios from "axios";
import { config } from "../config/environment.js";

// Create an Axios instance with the base URL from environment configuration
export const api = axios.create({
  baseURL: config.apiUrl,
  timeout: 30000, // Increased timeout for stress test operations
});

// Add request interceptor for debugging and authentication
api.interceptors.request.use(
  (config) => {
    // Add authorization header if token exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    console.log('Authorization header:', config.headers?.Authorization ? 'Present' : 'Missing');
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {

    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Function to log in user
export const loginUser = async (email, password) => {
  const response = await api.post("/users/login", {
    email,
    password,
  });
  return response.data;
};

// Function to log in babysitter
export const loginBabysitter = async (email, password) => {
  const response = await api.post("/babysitters/login", {
    email,
    password,
  });
  return response.data;
};

// Universal login for users and babysitters
export const loginUniversal = async (email, password) => {
  const response = await api.post("/login", {
    email,
    password,
  });
  return response.data;
};

// Function to change babysitter password
export const changeBabysitterPassword = async (token, currentPassword, newPassword) => {
  const response = await api.put(
    "/babysitters/change-password",
    { currentPassword, newPassword },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Function to update client profile
export const updateClientProfile = async (data, token) => {
  const response = await api.put("/users/profile", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Function to delete client account
export const deleteClientAccount = async (token) => {
  const response = await api.delete("/users/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Function to register client
export const registerClient = async (data) => {
  const response = await api.post("/users/register", data);
  return response.data;
};

// Get bookings for a user
export const getUserBookings = async (userId, token) => {
  const response = await api.get(`/bookings/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Function to send email
export const sendEmail = async (emailData, token) => {
  console.log('sendEmail called with token:', !!token);
  console.log('Email data:', emailData);
  
  const response = await api.post("/send-email", emailData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Notification management functions
export const markNotificationAsRead = async (notificationType, notificationId, token) => {
  const response = await api.post("/notifications/read", {
    notification_type: notificationType,
    notification_id: notificationId
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const markNotificationAsUnread = async (notificationType, notificationId, token) => {
  const response = await api.post("/notifications/unread", {
    notification_type: notificationType,
    notification_id: notificationId
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getNotificationStatus = async (notificationType, notificationIds, token) => {
  const idsParam = Array.isArray(notificationIds) ? notificationIds.join(',') : notificationIds;
  const response = await api.get(`/notifications/status?notification_type=${notificationType}&notification_ids=${idsParam}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getReadNotifications = async (token, notificationType = null) => {
  const url = notificationType 
    ? `/notifications/read?notification_type=${notificationType}`
    : '/notifications/read';
  
  const response = await api.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Get all notifications for a user (for notification bell)
export const getNotifications = async (token, limit = 10) => {
  const response = await api.get(`/notifications?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Get unread count for a user
export const getUnreadCount = async (token) => {
  const response = await api.get('/notifications/unread-count', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.count;
};

// Save notification
export const saveNotification = async (token, notificationType, notificationId) => {
  const response = await api.post('/notifications/save', {
    notification_type: notificationType,
    notification_id: notificationId
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Unsave notification
export const unsaveNotification = async (token, notificationType, notificationId) => {
  const response = await api.delete('/notifications/save', {
    data: {
      notification_type: notificationType,
      notification_id: notificationId
    },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Get saved notifications
export const getSavedNotifications = async (token, limit = 50) => {
  const response = await api.get(`/notifications/saved?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Get saved count
export const getSavedCount = async (token) => {
  const response = await api.get('/notifications/saved-count', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.count;
};

// Check if notification is saved
export const getSavedStatus = async (token, notificationType, notificationId) => {
  const response = await api.get(`/notifications/saved-status?notification_type=${notificationType}&notification_id=${notificationId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.isSaved;
};

// Delete notification for a user
export const deleteNotification = async (token, notificationType, notificationId) => {
  const response = await api.delete(`/notifications/${notificationType}/${notificationId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Get Google Maps API Key from backend
export const getGoogleMapsApiKey = async () => {
  try {
    const response = await api.get('/config/google-maps-key');
    return response.data.apiKey;
  } catch (error) {
    console.error('Error fetching Google Maps API key:', error);
    // Fallback to a default key or throw error
    throw new Error('Failed to fetch Google Maps API key');
  }
};

// Google Maps API proxy functions (more secure)
export const geocodeAddress = async (address) => {
  try {
    const response = await api.get('/google/geocode', {
      params: { address }
    });
    return response.data;
  } catch (error) {
    console.error('Error geocoding address:', error);
    throw error;
  }
};

export const getPlacesAutocomplete = async (input) => {
  try {
    const response = await api.get('/google/places/autocomplete', {
      params: { input }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting places autocomplete:', error);
    throw error;
  }
};

export const getPlaceDetails = async (placeId) => {
  try {
    const response = await api.get('/google/places/details', {
      params: { place_id: placeId }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting place details:', error);
    throw error;
  }
};

import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  markNotificationAsRead, 
  markNotificationAsUnread, 
  getNotificationStatus,
  getReadNotifications 
} from '../services/api';

export const useNotifications = () => {
  const { token } = useContext(AuthContext);
  const [notificationStatus, setNotificationStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mark notification as read
  const markAsRead = async (notificationType, notificationId) => {
    if (!token) {
      console.warn('No token available for marking notification as read');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      await markNotificationAsRead(notificationType, notificationId, token);
      
      // Update local state
      setNotificationStatus(prev => ({
        ...prev,
        [notificationId]: { is_read: true, read_at: new Date().toISOString() }
      }));
      
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(err.message || 'Failed to mark notification as read');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as unread
  const markAsUnread = async (notificationType, notificationId) => {
    if (!token) {
      console.warn('No token available for marking notification as unread');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      await markNotificationAsUnread(notificationType, notificationId, token);
      
      // Update local state
      setNotificationStatus(prev => ({
        ...prev,
        [notificationId]: { is_read: false, read_at: null }
      }));
      
      return true;
    } catch (err) {
      console.error('Error marking notification as unread:', err);
      setError(err.message || 'Failed to mark notification as unread');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get status for multiple notifications
  const getStatus = async (notificationType, notificationIds) => {
    if (!token || !notificationIds || notificationIds.length === 0) {
      return {};
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await getNotificationStatus(notificationType, notificationIds, token);
      
      // Update local state
      setNotificationStatus(prev => ({
        ...prev,
        ...response.notification_status
      }));
      
      return response.notification_status;
    } catch (err) {
      console.error('Error getting notification status:', err);
      setError(err.message || 'Failed to get notification status');
      return {};
    } finally {
      setLoading(false);
    }
  };

  // Get all read notifications
  const getRead = async (notificationType = null) => {
    if (!token) {
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await getReadNotifications(token, notificationType);
      return response.notifications;
    } catch (err) {
      console.error('Error getting read notifications:', err);
      setError(err.message || 'Failed to get read notifications');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Check if a specific notification is read
  const isRead = (notificationId) => {
    return notificationStatus[notificationId]?.is_read || false;
  };

  // Get read timestamp for a notification
  const getReadAt = (notificationId) => {
    return notificationStatus[notificationId]?.read_at || null;
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return {
    // State
    notificationStatus,
    loading,
    error,
    
    // Actions
    markAsRead,
    markAsUnread,
    getStatus,
    getRead,
    isRead,
    getReadAt,
    clearError
  };
}; 
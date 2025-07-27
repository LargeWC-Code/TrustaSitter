import { useState, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  markNotificationAsRead, 
  markNotificationAsUnread, 
  getNotificationStatus, 
  getReadNotifications,
  getNotifications,
  getUnreadCount,
  saveNotification,
  unsaveNotification,
  getSavedNotifications,
  getSavedCount,
  getSavedStatus,
  deleteNotification
} from '../services/api';

export const useNotifications = () => {
  const { token } = useContext(AuthContext);
  const [notificationStatus, setNotificationStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationType, notificationId) => {
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
  }, [token]);

  // Mark notification as unread
  const markAsUnread = useCallback(async (notificationType, notificationId) => {
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
  }, [token]);

  // Get status for multiple notifications
  const getStatus = useCallback(async (notificationType, notificationIds) => {
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
  }, [token]);

  // Get all read notifications
  const getRead = useCallback(async (notificationType = null) => {
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
  }, [token]);

  // Get all notifications for notification bell
  const getAllNotifications = useCallback(async (limit = 10) => {
    if (!token) {
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      
      const notifications = await getNotifications(token, limit);
      return notifications;
    } catch (err) {
      console.error('Error getting notifications:', err);
      setError(err.message || 'Failed to get notifications');
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Get unread count
  const getUnreadNotificationsCount = useCallback(async () => {
    if (!token) {
      return 0;
    }

    try {
      const count = await getUnreadCount(token);
      return count;
    } catch (err) {
      console.error('Error getting unread count:', err);
      setError(err.message || 'Failed to get unread count');
      return 0;
    }
  }, [token]);

  // Save notification
  const saveNotificationById = useCallback(async (notificationType, notificationId) => {
    if (!token) {
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      await saveNotification(token, notificationType, notificationId);
      return true;
    } catch (err) {
      console.error('Error saving notification:', err);
      setError(err.message || 'Failed to save notification');
      return false;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Unsave notification
  const unsaveNotificationById = useCallback(async (notificationType, notificationId) => {
    if (!token) {
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      await unsaveNotification(token, notificationType, notificationId);
      return true;
    } catch (err) {
      console.error('Error unsaving notification:', err);
      setError(err.message || 'Failed to unsave notification');
      return false;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Get saved notifications
  const getSavedNotificationsList = useCallback(async (limit = 50) => {
    if (!token) {
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      
      const notifications = await getSavedNotifications(token, limit);
      return notifications;
    } catch (err) {
      console.error('Error getting saved notifications:', err);
      setError(err.message || 'Failed to get saved notifications');
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Get saved count
  const getSavedNotificationsCount = useCallback(async () => {
    if (!token) {
      return 0;
    }

    try {
      const count = await getSavedCount(token);
      return count;
    } catch (err) {
      console.error('Error getting saved count:', err);
      setError(err.message || 'Failed to get saved count');
      return 0;
    }
  }, [token]);

  // Check if notification is saved
  const isNotificationSaved = useCallback(async (notificationType, notificationId) => {
    if (!token) {
      return false;
    }

    try {
      const isSaved = await getSavedStatus(token, notificationType, notificationId);
      return isSaved;
    } catch (err) {
      console.error('Error checking saved status:', err);
      return false;
    }
  }, [token]);

  // Delete notification
  const deleteNotificationById = useCallback(async (notificationType, notificationId) => {
    if (!token) return false;
    try {
      setLoading(true);
      setError(null);
      await deleteNotification(token, notificationType, notificationId);
      return true;
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError(err.message || 'Failed to delete notification');
      return false;
    } finally {
      setLoading(false);
    }
  }, [token]);

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
    getAllNotifications,
    getUnreadNotificationsCount,
    saveNotificationById,
    unsaveNotificationById,
    getSavedNotificationsList,
    getSavedNotificationsCount,
    isNotificationSaved,
    isRead,
    getReadAt,
    clearError,
    deleteNotificationById
  };
}; 
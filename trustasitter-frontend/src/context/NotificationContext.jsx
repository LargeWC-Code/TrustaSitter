import React, { createContext, useContext, useState, useEffect } from 'react';
import { chatApi } from '../services/chatApi';
import { AuthContext } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const { user, token, role } = useContext(AuthContext);

  const checkUnreadMessages = async () => {
    if (user && token && (role === "user" || role === "babysitter")) {
      try {
        const response = await chatApi.getUnreadCount();
        const hasUnread = response.unread_count > 0;
        setHasUnreadMessages(hasUnread);
      } catch (error) {
        console.error("Error checking unread messages:", error);
      }
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await chatApi.markAsRead(conversationId);
      // Update unread status immediately
      await checkUnreadMessages();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };



  useEffect(() => {
    checkUnreadMessages();
    
    // Expose checkUnreadMessages globally for WebSocket updates
    window.notificationContext = { checkUnreadMessages };
    
    return () => {
      delete window.notificationContext;
    };
  }, [user, token, role]);

  const value = {
    hasUnreadMessages,
    checkUnreadMessages,
    markAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 
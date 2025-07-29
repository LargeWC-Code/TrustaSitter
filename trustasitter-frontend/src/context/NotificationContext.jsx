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
    
    // Check every 30 seconds only if user is logged in
    if (user && token) {
      const interval = setInterval(checkUnreadMessages, 30000);
      return () => clearInterval(interval);
    }
  }, [user, token, role]);

  // Check more frequently for better responsiveness
  useEffect(() => {
    checkUnreadMessages();
    
    // Check every 10 seconds instead of 30 for better responsiveness
    if (user && token) {
      const interval = setInterval(checkUnreadMessages, 10000);
      return () => clearInterval(interval);
    }
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
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection
    console.log('🔌 Creating WebSocket connection...');
    const newSocket = io('http://20.58.138.202:3000', {
      transports: ['websocket', 'polling']
    });

    // Connection events
    newSocket.on('connect', () => {
      
      setIsConnected(true);
      
      // Authenticate with token
      
      newSocket.emit('authenticate', token);
    });

    newSocket.on('authenticated', (data) => {
      
    });

    // Listen for new messages to update notifications
    newSocket.on('new_message', (data) => {
      console.log('📨 New message received:', data);
      // Trigger notification update
      if (window.notificationContext) {
        console.log('🔄 Triggering notification update...');
        window.notificationContext.checkUnreadMessages();
      } else {
        console.log('❌ notificationContext not available');
      }
    });



    newSocket.on('auth_error', (error) => {
      console.error('WebSocket authentication error:', error);
    });

    newSocket.on('disconnect', () => {
      
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const joinConversation = (conversationId) => {
    if (socket && isConnected) {
      socket.emit('join_conversation', conversationId);
    }
  };

  const sendMessage = (conversationId, message, senderType) => {
    if (socket && isConnected) {
      socket.emit('send_message', {
        conversationId,
        message,
        senderType
      });
    }
  };

  const startTyping = (conversationId) => {
    if (socket && isConnected) {
      socket.emit('typing_start', conversationId);
    }
  };

  const stopTyping = (conversationId) => {
    if (socket && isConnected) {
      socket.emit('typing_stop', conversationId);
    }
  };

  const value = {
    socket,
    isConnected,
    joinConversation,
    sendMessage,
    startTyping,
    stopTyping
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}; 
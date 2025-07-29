import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { AuthContext } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { FiBell } from 'react-icons/fi';
import NotificationModal from './NotificationModal';

function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const { 
    getAllNotifications, 
    getUnreadNotificationsCount, 
    saveNotificationById,
    unsaveNotificationById,
    markAsRead, 
    markAsUnread,
    deleteNotificationById
  } = useNotifications();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { role, user } = useContext(AuthContext);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { socket, isConnected } = useWebSocket();

  useEffect(() => {
    // Listen for notifications using existing WebSocket
    if (socket && isConnected && user && user.id) {
      socket.on('notification', (data) => {
        // Atualiza notificações em tempo real
        setNotifications((prev) => [
          {
            id: data.notificationId,
            type: data.type,
            isRead: false,
            createdAt: data.createdAt,
            title: data.title,
            message: data.message
          },
          ...prev
        ]);
        setUnreadCount((prev) => prev + 1);
      });
    }
  }, [socket, isConnected, user]);

  useEffect(() => {
    // Load notifications and count unread
    const loadNotifications = async () => {
      try {
        const [notificationsData, unreadCountData] = await Promise.all([
          getAllNotifications(10),
          getUnreadNotificationsCount()
        ]);
        
        setNotifications(notificationsData);
        setUnreadCount(unreadCountData);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();
  }, [user]);

  // Listen for notification read events from other components
  useEffect(() => {
    const handleNotificationRead = (event) => {
      setUnreadCount(event.detail.unreadCount);
    };

    const handleNotificationDeleted = (event) => {
      // Remove the deleted notification from the list
      setNotifications(prev => prev.filter(n => n.id !== event.detail.notificationId));
      
      // Update unread count if the deleted notification was unread
      if (event.detail.wasUnread) {
        setUnreadCount(event.detail.unreadCount);
      }
    };

    window.addEventListener('notificationRead', handleNotificationRead);
    window.addEventListener('notificationDeleted', handleNotificationDeleted);
    
    return () => {
      window.removeEventListener('notificationRead', handleNotificationRead);
      window.removeEventListener('notificationDeleted', handleNotificationDeleted);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      try {
        await markAsRead(notification.type, notification.id);
        
        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
        
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Open modal instead of navigating
    setSelectedNotification(notification);
    setIsModalOpen(true);
    setIsOpen(false);
  };

  const handleMarkAsUnread = async (notification) => {
    try {
      await markAsUnread(notification.type, notification.id);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id ? { ...n, isRead: false } : n
        )
      );
      setUnreadCount(prev => prev + 1);
    } catch (error) {
      console.error('Error marking notification as unread:', error);
    }
  };

  const handleDelete = async (notification) => {
    try {
      const success = await deleteNotificationById(notification.type, notification.id);
      if (success) {
        // Remove from local state
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        
        // Update unread count if notification was unread
        if (!notification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleSave = async (notification) => {
    try {
      const success = await saveNotificationById(notification.type, notification.id);
      if (success) {
        // Update the notification in the list to show it's saved
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id ? { ...n, savedAt: new Date().toISOString() } : n
          )
        );
      }
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  };

  const handleUnsave = async (notification) => {
    try {
      const success = await unsaveNotificationById(notification.type, notification.id);
      if (success) {
        // Update the notification in the list to show it's not saved
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id ? { ...n, savedAt: null } : n
          )
        );
      }
    } catch (error) {
      console.error('Error unsaving notification:', error);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_created':
        return '📅';
      case 'booking_confirmed':
        return '✅';
      case 'booking_rejected':
        return '❌';
      case 'booking_cancelled':
        return '🚫';
      case 'report_submitted':
        return '📝';
      case 'message_received':
        return '💬';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-purple-600 transition-colors"
      >
        <FiBell className="w-6 h-6" />
        
        {/* Badge for unread count */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600">{unreadCount} unread</p>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-medium text-sm ${
                          !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(new Date(notification.createdAt))}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => {
                navigate('/notifications');
                setIsOpen(false);
              }}
              className="w-full text-center text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      <NotificationModal
        notification={selectedNotification}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedNotification(null);
        }}
        onMarkAsUnread={handleMarkAsUnread}
        onDelete={handleDelete}
        onSave={handleSave}
        onUnsave={handleUnsave}
        isSaved={selectedNotification?.savedAt ? true : false}
        className="bell-modal"
      />
    </div>
  );
}

export default NotificationBell; 
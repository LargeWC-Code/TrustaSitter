import React, { useState, useEffect, useContext } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useWebSocket } from '../context/WebSocketContext';
import { AuthContext } from '../context/AuthContext';
import { FiBell, FiCheck, FiX, FiClock, FiRefreshCw, FiBookmark } from 'react-icons/fi';
import NotificationModal from '../components/NotificationModal';
import ConfirmModal from '../components/ConfirmModal';

const Notifications = () => {
  const { 
    getAllNotifications, 
    getUnreadNotificationsCount, 
    getSavedNotificationsCount,
    getSavedNotificationsList,
    saveNotificationById,
    unsaveNotificationById,
    markAsRead, 
    markAsUnread, 
    deleteNotificationById,
    loading 
  } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'unread', 'read', 'saved'
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedNotifications, setSavedNotifications] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const { socket, isConnected } = useWebSocket();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const [notificationsData, unreadCountData, savedCountData] = await Promise.all([
          getAllNotifications(50),
          getUnreadNotificationsCount(),
          getSavedNotificationsCount()
        ]);
        setNotifications(notificationsData);
        setUnreadCount(unreadCountData);
        setSavedCount(savedCountData);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };
    loadNotifications();
  }, [getAllNotifications, getUnreadNotificationsCount, getSavedNotificationsCount]);

  // Listen for notifications using existing WebSocket
  useEffect(() => {
    if (socket && isConnected && user && user.id) {
      socket.on('notification', (data) => {
        // Add new notification to the list
        setNotifications(prev => [
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
        setUnreadCount(prev => prev + 1);
      });
    }
  }, [socket, isConnected, user]);

  useEffect(() => {
    if (activeTab === 'saved') {
      const loadSavedNotifications = async () => {
        try {
          const saved = await getSavedNotificationsList(50);
          setSavedNotifications(saved);
        } catch (error) {
          console.error('Error loading saved notifications:', error);
        }
      };
      loadSavedNotifications();
    }
  }, [activeTab, getSavedNotificationsList]);

                const handleNotificationClick = async (notification) => {
                if (!notification.isRead) {
                  try {
                    await markAsRead(notification.type, notification.id);
                    setNotifications(prev => 
                      prev.map(n => 
                        n.id === notification.id ? { ...n, isRead: true } : n
                      )
                    );
                    setUnreadCount(prev => Math.max(0, prev - 1));
                    
                    // Dispatch custom event to sync with NotificationBell
                    window.dispatchEvent(new CustomEvent('notificationRead', {
                      detail: { unreadCount: Math.max(0, unreadCount - 1) }
                    }));
                  } catch (error) {
                    console.error('Error marking notification as read:', error);
                  }
                }
                setSelectedNotification(notification);
                setIsModalOpen(true);
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

  const handleDelete = (notification) => {
    setNotificationToDelete(notification);
    setConfirmDelete(true);
  };

  const confirmDeleteNotification = async () => {
    if (!notificationToDelete) return;
    try {
      const success = await deleteNotificationById(notificationToDelete.type, notificationToDelete.id);
      if (success) {
        // Remove from main notifications list
        setNotifications(prev => prev.filter(n => n.id !== notificationToDelete.id));
        
        // Update unread count if notification was unread
        if (!notificationToDelete.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        // Remove from saved notifications list if it was saved
        setSavedNotifications(prev => prev.filter(n => n.id !== notificationToDelete.id));
        
        // Update saved count if notification was saved
        if (notificationToDelete.savedAt) {
          setSavedCount(prev => Math.max(0, prev - 1));
        }
        
        // Close modal if it was open
        if (selectedNotification?.id === notificationToDelete.id) {
          setIsModalOpen(false);
          setSelectedNotification(null);
        }
        
        // Dispatch custom event to sync with NotificationBell
        window.dispatchEvent(new CustomEvent('notificationDeleted', {
          detail: { 
            notificationId: notificationToDelete.id,
            wasUnread: !notificationToDelete.isRead,
            unreadCount: !notificationToDelete.isRead ? Math.max(0, unreadCount - 1) : unreadCount
          }
        }));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setConfirmDelete(false);
      setNotificationToDelete(null);
    }
  };

  const handleSave = async (notification) => {
    try {
      const success = await saveNotificationById(notification.type, notification.id);
      if (success) {
        const newSavedCount = await getSavedNotificationsCount();
        setSavedCount(newSavedCount);
      }
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  };

  const handleUnsave = async (notification) => {
    try {
      const success = await unsaveNotificationById(notification.type, notification.id);
      if (success) {
        const newSavedCount = await getSavedNotificationsCount();
        setSavedCount(newSavedCount);
        if (activeTab === 'saved') {
          setSavedNotifications(prev => prev.filter(n => n.id !== notification.id));
        }
      }
    } catch (error) {
      console.error('Error unsaving notification:', error);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now - date;
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
      case 'report_sent':
        return '📋';
      case 'booking_reminder_12h':
      case 'booking_reminder_1h':
        return '⏰';
      case 'booking_time_changed':
        return '🔄';
      default:
        return '🔔';
    }
  };

  const filteredNotifications = activeTab === 'saved' 
    ? savedNotifications 
    : notifications.filter(notification => {
        if (activeTab === 'unread') return !notification.isRead;
        if (activeTab === 'read') return notification.isRead;
        return true;
      });

  // Remove duplicates based on id and type
  const uniqueNotifications = filteredNotifications.filter((notification, index, self) => 
    index === self.findIndex(n => n.id === notification.id && n.type === notification.type)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🔔 Notification Center
          </h1>
        </div>
        {/* Stats */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{notifications.length}</div>
              <div className="text-gray-600">Total</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-red-600">{unreadCount}</div>
              <div className="text-gray-600">Unread</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-green-600">{notifications.length - unreadCount}</div>
              <div className="text-gray-600">Read</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600">{savedCount}</div>
              <div className="text-gray-600">Saved</div>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-white rounded-lg shadow p-2">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
                  activeTab === 'all' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FiBell className="inline mr-2" />
                All ({uniqueNotifications.length})
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
                  activeTab === 'unread' 
                    ? 'bg-red-100 text-red-700' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FiX className="inline mr-2" />
                Unread ({uniqueNotifications.filter(n => !n.isRead).length})
              </button>
              <button
                onClick={() => setActiveTab('read')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
                  activeTab === 'read' 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FiCheck className="inline mr-2" />
                Read ({uniqueNotifications.filter(n => n.isRead).length})
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
                  activeTab === 'saved' 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FiBookmark className="inline mr-2" />
                Saved ({savedCount})
              </button>
            </div>
          </div>
        </div>
        {/* Notifications List */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg">
            {loading ? (
              <div className="p-8 text-center">
                <FiRefreshCw className="animate-spin h-8 w-8 text-purple-600 mx-auto mb-4" />
                <p className="text-gray-500">Loading notifications...</p>
              </div>
            ) : uniqueNotifications.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {uniqueNotifications.map((notification) => (
                  <div
                    key={`${notification.type}-${notification.id}`}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-6 cursor-pointer transition-colors hover:bg-gray-50 ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className={`font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              <FiClock className="inline mr-1" />
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-2">{notification.message}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Type: {notification.type}</span>
                          <span>ID: {notification.id}</span>
                          {notification.isRead && (
                            <span className="text-green-600">
                              <FiCheck className="inline mr-1" />
                              Read
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">No notifications found.</div>
            )}
          </div>
        </div>
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
        <ConfirmModal
          isOpen={confirmDelete}
          title="Delete Notification"
          message="Are you sure you want to delete this notification? This action cannot be undone."
          onConfirm={confirmDeleteNotification}
          onCancel={() => { setConfirmDelete(false); setNotificationToDelete(null); }}
        />
      </div>
    </div>
  );
};

export default Notifications; 
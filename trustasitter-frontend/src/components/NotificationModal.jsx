import React, { useRef, useEffect } from 'react';
import { FiX, FiBookmark, FiTrash2, FiClock, FiCheck } from 'react-icons/fi';

const typeLabels = {
  booking_created: 'Booking Created',
  booking_confirmed: 'Booking Confirmed',
  booking_rejected: 'Booking Rejected',
  booking_cancelled: 'Booking Cancelled',
  report_sent: 'Babysitter Report',
  booking_reminder_12h: 'Booking Reminder (12h)',
  booking_reminder_1h: 'Booking Reminder (1h)',
  booking_time_changed: 'Booking Time Changed',
  chat_message: 'New Message',
  payment_confirmed: 'Payment Confirmed',
  default: 'Notification'
};

const NotificationModal = ({ 
  notification, 
  isOpen, 
  onClose, 
  onMarkAsUnread, 
  onDelete, 
  onSave, 
  onUnsave, 
  isSaved,
  className = ""
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !notification) return null;

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
      case 'chat_message':
        return '💬';
      case 'payment_confirmed':
        return '💸';
      default:
        return '🔔';
    }
  };

  const getNotificationDetails = (type) => {
    switch (type) {
      case 'booking_created':
        return {
          description: 'A new booking request has been created and is waiting for your response.',
          action: 'Review the booking details and accept or reject the request.'
        };
      case 'booking_confirmed':
        return {
          description: 'Your booking has been confirmed by the babysitter.',
          action: 'Prepare for your scheduled babysitting session.'
        };
      case 'booking_rejected':
        return {
          description: 'Your booking request has been rejected by the babysitter.',
          action: 'You can search for other available babysitters.'
        };
      case 'booking_cancelled':
        return {
          description: 'A booking has been cancelled.',
          action: 'Check your bookings for updated information.'
        };
      case 'report_sent':
        return {
          description: 'A detailed report has been sent by the babysitter.',
          action: 'Review the report to see how the session went.'
        };
      case 'booking_reminder_12h':
        return {
          description: 'Your booking is scheduled in 12 hours.',
          action: 'Make sure everything is prepared for tomorrow.'
        };
      case 'booking_reminder_1h':
        return {
          description: 'Your booking is scheduled in 1 hour.',
          action: 'Get ready for your babysitting session.'
        };
      case 'booking_time_changed':
        return {
          description: 'The time or date of your booking has been changed.',
          action: 'Check the updated booking details.'
        };
      case 'chat_message':
        return {
          description: 'You have received a new message.',
          action: 'Check your chat to read the message.'
        };
      case 'payment_confirmed':
        return {
          description: 'Payment for your booking has been confirmed.',
          action: 'Your booking is now fully confirmed.'
        };
      default:
        return {
          description: 'You have a new notification.',
          action: 'Check the details below.'
        };
    }
  };

  const details = getNotificationDetails(notification.type);
  const typeLabel = typeLabels[notification.type] || typeLabels.default;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className={`bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{typeLabel}</h3>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <FiClock className="inline" />
                  {formatTimeAgo(notification.createdAt)}
                </p>
                {notification.isRead && (
                  <span className="flex items-center gap-1 text-sm text-green-600">
                    <FiCheck className="inline" />
                    Read
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-4">{details.description}</p>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <strong>Action:</strong> {details.action}
            </p>
          </div>

          {/* Notification Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Details</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Received:</span>
                <span>{new Date(notification.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {notification.isRead && (
              <button
                onClick={() => {
                  onMarkAsUnread(notification);
                  onClose();
                }}
                className="modal-btn modal-btn-gray"
              >
                Mark as Unread
              </button>
            )}
            {isSaved ? (
              <button
                onClick={() => {
                  onUnsave(notification);
                  onClose();
                }}
                className="modal-btn modal-btn-yellow-saved modal-btn-with-icon"
              >
                <FiBookmark className="w-4 h-4" />
                Unsave
              </button>
            ) : (
              <button
                onClick={() => {
                  onSave(notification);
                  onClose();
                }}
                className="modal-btn modal-btn-yellow modal-btn-with-icon"
              >
                <FiBookmark className="w-4 h-4" />
                Save
              </button>
            )}
            <button
              onClick={() => {
                onDelete(notification);
                onClose();
              }}
              className="modal-btn modal-btn-red modal-btn-with-icon"
            >
              <FiTrash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal; 
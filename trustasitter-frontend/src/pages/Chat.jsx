import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { chatApi } from '../services/chatApi';
import { useNotifications } from '../context/NotificationContext';
import { useWebSocket } from '../context/WebSocketContext';
import { FaPaperPlane, FaComments, FaLock, FaCheckCircle, FaTimesCircle, FaTrash } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal';

const Chat = () => {
  const { user, token, role } = useContext(AuthContext);
  const { markAsRead: markAsReadNotification, checkUnreadMessages } = useNotifications();
  const { socket, isConnected, joinConversation, sendMessage: sendWebSocketMessage } = useWebSocket();
  const navigate = useNavigate();

  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingConversation, setDeletingConversation] = useState(null);

  // Simple scroll to bottom function
  const scrollToBottom = () => {
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
      // Use requestAnimationFrame for smooth scrolling
      requestAnimationFrame(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      });
    }
  };

  // Load conversations on component mount
  useEffect(() => {
    if (user && token) {
      loadConversations();
    }
  }, [user, token]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      try {
        loadMessages(selectedConversation.id);
        // Mark as read immediately when conversation is selected
        markAsRead(selectedConversation.id);
        // Join WebSocket room for this conversation
        joinConversation(selectedConversation.id);
        // Reload conversations to get updated unread counts
        loadConversations();
      } catch (error) {
        console.error('Error in conversation selection:', error);
      }
    }
  }, [selectedConversation]);

  // Auto-scroll when conversation is selected
  useEffect(() => {
    if (selectedConversation && messages.length > 0) {
      // Multiple timeouts to ensure DOM is ready
      setTimeout(() => scrollToBottom(), 100);
      setTimeout(() => scrollToBottom(), 300);
      setTimeout(() => scrollToBottom(), 500);
      setTimeout(() => scrollToBottom(), 1000);
    }
  }, [selectedConversation, messages]);





  // WebSocket event listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    const handleNewMessage = (data) => {
      try {
  
        
        // Add message to current conversation if it matches
        if (data.conversationId === selectedConversation?.id) {
          
          setMessages(prev => [...prev, data.message]);
          // Auto-scroll to bottom
          setTimeout(() => {
            const messagesContainer = document.querySelector('.messages-container');
            if (messagesContainer) {
              messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
          }, 100);
        } else {

        }
        
        // Update conversations list without full refresh
        setConversations(prev => {
          return prev.map(conv => {
            if (conv.id === data.conversationId) {
              // Only increment unread count if message is from other user
              const shouldIncrement = data.message.sender_id !== user?.id;
              const currentUnreadCount = parseInt(conv.unread_count) || 0;
              return {
                ...conv,
                last_message: data.message.message,
                last_message_time: data.message.created_at,
                unread_count: shouldIncrement ? currentUnreadCount + 1 : currentUnreadCount
              };
            }
            return conv;
          });
        });

        // Notification will be updated automatically by NotificationContext
      } catch (error) {
        console.error('Error handling new message:', error);
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, selectedConversation]);

  // Auto-scroll when messages change or conversation is selected
  useEffect(() => {
    if (messages.length > 0 && selectedConversation) {
      // Auto-scroll to bottom when messages are loaded or new message is added
      // Use multiple timeouts to ensure DOM is ready
      setTimeout(() => scrollToBottom(), 100);
      setTimeout(() => scrollToBottom(), 300);
      setTimeout(() => scrollToBottom(), 500);
    }
  }, [messages, selectedConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await chatApi.getConversations();
      setConversations(data.conversations || []);
    } catch (err) {
      setError('Failed to load conversations');
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const data = await chatApi.getMessages(conversationId);
      setMessages(data.messages || []);
      
      // Auto-scroll to bottom after messages are loaded
      // Multiple timeouts to ensure DOM is ready
      setTimeout(() => scrollToBottom(), 100);
      setTimeout(() => scrollToBottom(), 300);
      setTimeout(() => scrollToBottom(), 500);
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error loading messages:', err);
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await chatApi.markAsRead(conversationId);
      
      // Reset unread count for this conversation
      setConversations(prev => {
        return prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              unread_count: 0
            };
          }
          return conv;
        });
      });
      
      // Update notification status immediately
      await markAsReadNotification(conversationId);
      // Force check unread messages to update the red dot
      await checkUnreadMessages();
      
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      if (isConnected) {
        // Use WebSocket for real-time messaging
        const senderType = role === 'user' ? 'client' : 'babysitter';
        sendWebSocketMessage(selectedConversation.id, newMessage.trim(), senderType);
        setNewMessage('');
      } else {
        // Fallback to HTTP API if WebSocket not connected
        const data = await chatApi.sendMessage(selectedConversation.id, newMessage.trim());
        setMessages(prev => [...prev, data.chatMessage]);
        setNewMessage('');
      }
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    }
  };

  const getBookingStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'cancelled': return 'text-red-600';
      case 'completed': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getBookingStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <FaCheckCircle className="text-green-600" />;
      case 'cancelled': return <FaTimesCircle className="text-red-600" />;
      default: return null;
    }
  };

  const isChatEnabled = (conversation) => {
    return conversation.booking_status === 'approved';
  };

  const handleDeleteConversation = async () => {
    if (!deletingConversation) return;
    
    try {
      await chatApi.deleteConversation(deletingConversation.id);
      
      // Remove from conversations list
      setConversations(prev => prev.filter(conv => conv.id !== deletingConversation.id));
      
      // If this was the selected conversation, clear it
      if (selectedConversation?.id === deletingConversation.id) {
        setSelectedConversation(null);
        setMessages([]);
      }
      
      // Close modal
      setShowDeleteModal(false);
      setDeletingConversation(null);
      
    } catch (error) {
      console.error('Error deleting conversation:', error);
      setError('Failed to delete conversation');
    }
  };



  const filteredConversations = conversations.filter(conv => 
    conv.participant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.booking_date?.includes(searchTerm)
  );

  // Redirect if not logged in
  if (!user || !token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access the chat.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 pt-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-lg shadow-lg overflow-hidden border border-blue-100">
          <div className="flex h-[500px]">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200 bg-gray-50">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Messages</h2>

                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="overflow-y-auto h-[500px]">
                {filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <FaComments className="mx-auto text-4xl mb-2 text-gray-300" />
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors ${
                        selectedConversation?.id === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">
                          {conversation.participant_name}
                        </h3>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        
                        {!isChatEnabled(conversation) && (
                          <FaLock className="text-gray-400 text-xs" />
                        )}
                        
                        {conversation.unread_count > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                      
                      {conversation.last_message && (
                        <p className="text-sm text-gray-500 mt-1 truncate">
                          {conversation.last_message}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {selectedConversation.participant_name}
                        </h3>
                      </div>
                      <button
                        onClick={() => {
                          setDeletingConversation(selectedConversation);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete conversation"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50 messages-container">
                    {!isChatEnabled(selectedConversation) ? (
                      <div className="text-center py-8">
                        <FaLock className="mx-auto text-4xl text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Chat Unavailable</h3>
                        <p className="text-gray-600">
                          {selectedConversation.booking_status === 'pending' && 
                            "Chat will be available once the booking is confirmed."}
                          {selectedConversation.booking_status === 'cancelled' && 
                            "Chat is no longer available for cancelled bookings."}
                          {selectedConversation.booking_status === 'completed' && 
                            "Chat is no longer available for completed bookings."}
                        </p>
                      </div>
                    ) : (
                      <>
                        {messages.length === 0 ? (
                          <div className="text-center py-8">
                            <FaComments className="mx-auto text-4xl text-gray-300 mb-4" />
                            <p className="text-gray-500">No messages yet. Start the conversation!</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {messages.map((message) => (
                              <div
                                key={message.id}
                                className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                    message.sender_id === user.id
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-white text-gray-800 border border-gray-200'
                                  }`}
                                >
                                  <p className="text-sm">{message.message}</p>
                                  <p className={`text-xs mt-1 ${
                                    message.sender_id === user.id ? 'text-blue-100' : 'text-gray-500'
                                  }`}>
                                    {new Date(message.created_at).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Message Input */}
                  {isChatEnabled(selectedConversation) && (
                    <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={!isChatEnabled(selectedConversation)}
                        />
                        <button
                          type="submit"
                          disabled={!newMessage.trim() || !isChatEnabled(selectedConversation)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          <FaPaperPlane />
                        </button>
                      </div>
                    </form>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <FaComments className="mx-auto text-4xl text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a Conversation</h3>
                    <p className="text-gray-500">Choose a conversation from the list to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingConversation(null);
        }}
        onConfirm={handleDeleteConversation}
        title="Delete Conversation"
        message={`Are you sure you want to delete the conversation with ${deletingConversation?.participant_name}? This action cannot be undone and will remove all messages.`}
        confirmText="Delete Conversation"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Chat; 
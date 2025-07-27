import { api } from './api';

// Chat API service
export const chatApi = {
  // Get all conversations for current user
  getConversations: async () => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },

  // Get messages for a specific conversation
  getMessages: async (conversationId) => {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`);
    return response.data;
  },

  // Send a message
  sendMessage: async (conversationId, message) => {
    const response = await api.post(`/chat/conversations/${conversationId}/messages`, {
      message
    });
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (conversationId) => {
    const response = await api.put(`/chat/conversations/${conversationId}/messages/read`);
    return response.data;
  },

  // Get unread message count
  getUnreadCount: async () => {
    const response = await api.get('/chat/unread-count');
    return response.data;
  },

  // Create or get conversation between two users
  createOrGetConversation: async (participantId) => {
    const response = await api.post('/chat/conversations', {
      participant_id: participantId
    });
    return response.data;
  }
}; 
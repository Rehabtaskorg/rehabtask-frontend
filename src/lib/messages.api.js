import { api } from "./api.js"

/**
 * Centralized messaging API calls
 */
export const messagesApi = {
    /**
     * Get all conversations for the current user
     * Returns relationship-based grouped conversations
     */
    getConversations: async () => {
        return api.get("/messages/conversations");
    },

    /**
     * Get messages for a specific conversation context
     * @param {string} contextType - "request" | "booking"
     * @param {string} contextId - UUID of the context
     * @param {object} options - { limit, cursor, order }
     */
    getMessages: async (contextType, contextId, options = {}) => {
        const params = new URLSearchParams();
        if (options.limit) params.append("limit", options.limit);
        if (options.cursor) params.append("cursor", options.cursor);
        if (options.order) params.append("order", options.order);

        const query = params.toString() ? `?${params.toString()}` : "";
        return api.get(`/messages/${contextType}/${contextId}${query}`);
    },

    /**
     * Send a new message
     * @param {object} data - { content, contextType, contextId }
     */
    sendMessage: async ({ content, contextType, contextId }) => {
        return api.post("/messages", { content, contextType, contextId });
    },

    /**
     * Mark all messages as read in a conversation
     * @param {string} contextType - "request" | "booking"
     * @param {string} contextId - UUID of the context
     */
    markAsRead: async (contextType, contextId) => {
        return api.put(`/messages/${contextType}/${contextId}/read`);
    },

    /**
     * Get total unread message count for badge
     */
    getUnreadCount: async () => {
        return api.get("/messages/unread-count");
    },
};
import { api } from "./api.js"

/**
 * Centralized messaging API calls — Phase 3: conversationId-based endpoints
 */
export const messagesApi = {
    /**
     * Get all conversations for the current user
     */
    getConversations: async () => {
        return api.get("/messages/conversations");
    },

    /**
     * Get messages for a conversation by conversationId
     * @param {string} conversationId - UUID of the DirectConversation
     * @param {object} options - { limit, cursor, order }
     */
    getMessages: async (conversationId, options = {}) => {
        const params = new URLSearchParams();
        if (options.limit) params.append("limit", options.limit);
        if (options.cursor) params.append("cursor", options.cursor);
        if (options.order) params.append("order", options.order);

        const query = params.toString() ? `?${params.toString()}` : "";
        return api.get(`/messages/c/${conversationId}${query}`);
    },

    /**
     * Send a new message in a conversation
     * @param {object} data - { content, contextType, contextId }
     * contextType/contextId still used for the legacy createMessage path
     * which dual-writes to the DirectConversation automatically
     */
    sendMessage: async ({ content, contextType, contextId }) => {
        return api.post("/messages", { content, contextType, contextId });
    },

    /**
     * Mark all messages as read in a conversation
     * @param {string} conversationId - UUID of the DirectConversation
     */
    markAsRead: async (conversationId) => {
        return api.put(`/messages/c/${conversationId}/read`);
    },

    /**
     * Get total unread message count for badge
     */
    getUnreadCount: async () => {
        return api.get("/messages/unread-count");
    },

    /**
     * Get the other party's info for a conversation
     * Used when no messages exist yet to resolve the other user's name
     * @param {string} contextType - "offer" | "booking" | "direct"
     * @param {string} contextId - UUID of the context
     */
    getConversationContext: async (contextType, contextId) => {
        return api.get(`/messages/${contextType}/${contextId}/context`);
    },

    /**
     * Send a direct message (creates conversation if needed)
     * @param {string} recipientId - UUID of the recipient user
     * @param {string} content - Message text
     */
    sendDirectMessage: async (recipientId, content) => {
        return api.post("/messages/direct", { recipientId, content });
    },
};

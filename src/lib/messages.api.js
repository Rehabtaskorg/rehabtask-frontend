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
    sendMessage: async ({ content, contextType, contextId, replyToId }) => {
        return api.post("/messages", { content, contextType, contextId, ...(replyToId && { replyToId }) });
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

    // ─── Attachments ────────────────────────────────────────────

    /**
     * Upload attachments with optional text message
     * @param {string} conversationId - DirectConversation UUID
     * @param {File[]} files - Array of File objects
     * @param {string} content - Optional text content
     */
    uploadAttachments: async (conversationId, files, content = "", replyToId = null) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        if (content.trim()) formData.append("content", content.trim());
        if (replyToId) formData.append("replyToId", replyToId);

        return api.post(`/messages/c/${conversationId}/attachments`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    /**
     * Get all attachments for a conversation (paginated)
     * @param {string} conversationId - DirectConversation UUID
     * @param {object} options - { limit, cursor }
     */
    getAttachments: async (conversationId, options = {}) => {
        const params = new URLSearchParams();
        if (options.limit) params.append("limit", options.limit);
        if (options.cursor) params.append("cursor", options.cursor);
        if (options.bookingId) params.append("bookingId", options.bookingId);
        const query = params.toString() ? `?${params.toString()}` : "";
        return api.get(`/messages/c/${conversationId}/attachments${query}`);
    },

    /**
     * Get signed download URL for an attachment
     * @param {string} attachmentId - UUID of the attachment
     */
    getAttachmentUrl: async (attachmentId) => {
        return api.get(`/messages/attachments/${attachmentId}/url`);
    },
};

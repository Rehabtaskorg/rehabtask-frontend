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
     * Send a new message in a conversation (Phase 3 — conversationId only)
     * @param {string} conversationId - DirectConversation UUID
     * @param {string} content - Message text
     * @param {string} [replyToId] - Optional reply target message UUID
     */
    sendMessage: async (conversationId, content, replyToId) => {
        return api.post(`/messages/c/${conversationId}`, {
            content,
            ...(replyToId && { replyToId }),
        });
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
     * Get basic public info for a user by userId.
     * Used to resolve a pending direct recipient's name before any conversation exists.
     * @param {string} userId - The target user's UUID
     */
    getUserPublicInfo: async (userId) => {
        return api.get(`/messages/users/${userId}/info`);
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
    uploadAttachments: async (conversationId, files, content = "", replyToId = null, bookingId = null) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        if (content.trim()) formData.append("content", content.trim());
        if (replyToId) formData.append("replyToId", replyToId);
        if (bookingId) formData.append("bookingId", bookingId);

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

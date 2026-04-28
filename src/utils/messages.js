/**
 * Shared utility functions for the messaging UI
 * Used by both customer and therapist message pages
 */

export const getDisplayName = (user) =>
    user?.therapistProfile?.fullName ||
    user?.customerProfile?.fullName ||
    user?.fullName ||
    'Unknown User';

/**Extract profile photo url from a user object */
export const getPhotoUrl = (user) =>
    user?.therapistProfile?.profilePhotoUrl ||
    user?.profilePhotoUrl ||
    user?.profile?.profilePhotoUrl ||
    null;

export const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const diffDays = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export const formatMessageTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatDateSeparator = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.round((today - msgDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
};

export const shouldShowDateSeparator = (messages, index) => {
    if (index === 0) return true;
    return new Date(messages[index - 1].createdAt).toDateString() !== new Date(messages[index].createdAt).toDateString();
};

export const getContextBadge = (type) => {
    if (type === 'booking') {
        return { label: 'Booking', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' };
    }
    if (type === 'direct') {
        return null; // no badge for direct conversations
    }
    return { label: 'Offer', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' };
};

/** Parse "booking:uuid" → { type, id } or null */
export const parseContextParam = (param) => {
    if (!param) return null;
    const idx = param.indexOf(':');
    if (idx === -1) return null;
    const type = param.slice(0, idx);
    const id = param.slice(idx + 1);
    if (!['offer', 'booking', 'direct'].includes(type) || !id) return null;
    return { type, id };
};

export const formatCurrency = (amount) => {
    if (amount == null) return '$0.00';
    return `$${Number(amount).toFixed(2)}`;
};
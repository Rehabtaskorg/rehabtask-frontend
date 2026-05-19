export const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" });
};

/**
 * Format a date as "Jan 5, 2026" — short form used in tables and cards.
 * @param {string|Date} dateStr
 * @returns {string}
 */
export const formatShortDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

/**
 * Format a date as a relative string ("Just now", "3h ago", "5d ago", or short date).
 * @param {string|Date} dateStr
 * @returns {string}
 */
export const formatRelativeDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    const diffMs = Date.now() - d;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatShortDate(dateStr);
};

export const formatTime = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

const pad = (n) => String(n).padStart(2, "0");

// Returns YYYY-MM-DD in local time — use as min for type="date" inputs
export const localDateStr = (offsetMs = 0) => {
    const d = new Date(Date.now() + offsetMs);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Returns YYYY-MM-DDTHH:MM in local time — use as min for type="datetime-local" inputs
export const localDateTimeStr = (offsetMs = 0) => {
    const d = new Date(Date.now() + offsetMs);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

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

/**
 * Derives age in years from a date-only string (YYYY-MM-DD).
 * Splits on "T" first to avoid UTC/local off-by-one when a full ISO timestamp is passed.
 * @param {string|null|undefined} dateOnly
 * @returns {number|null}
 */
export const calculateAge = (dateOnly) => {
    if (!dateOnly) return null;
    const [year, month, day] = dateOnly.split("T")[0].split("-").map(Number);
    const today = new Date();
    let age = today.getFullYear() - year;
    const monthDiff = today.getMonth() + 1 - month;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) age--;
    return age;
};

const pad = (n) => String(n).padStart(2, "0");

/**
 * Returns YYYY-MM-DD in local time — use as min for type="date" inputs.
 * @param {number} [offsetMs=0]
 * @returns {string}
 */
export const localDateStr = (offsetMs = 0) => {
    const d = new Date(Date.now() + offsetMs);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/**
 * Returns true when a YYYY-MM-DD string is today or a future date, in local time.
 * Uses string comparison — YYYY-MM-DD is zero-padded and lexicographically sortable.
 * @param {string} dateStr
 * @returns {boolean}
 */
export const isDateTodayOrLater = (dateStr) => {
    if (!dateStr) return false;
    return dateStr >= localDateStr();
};

/**
 * Returns the local date and time parts of a Date object as YYYY-MM-DD and HH:MM strings.
 * Both parts use the browser's local timezone — safe for round-tripping through getPreferredDateISO.
 * @param {Date} date
 * @returns {{ date: string, time: string }}
 */
export const localDateTimeParts = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return { date: `${y}-${m}-${d}`, time: `${h}:${min}` };
};

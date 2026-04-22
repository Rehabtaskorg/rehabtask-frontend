export const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" });
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

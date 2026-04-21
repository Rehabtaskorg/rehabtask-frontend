export const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" });
};

export const formatTime = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

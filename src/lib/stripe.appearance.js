export function getStripeAppearance() {
    const isDark = typeof document !== "undefined"
        && document.documentElement.classList.contains("dark");

    return {
        theme: isDark ? "night" : "stripe",
        variables: {
            colorPrimary: "#137fec",
            colorBackground: isDark ? "#1a2633" : "#ffffff",
            colorText: isDark ? "#ffffff" : "#111418",
            colorTextSecondary: isDark ? "#94a3b8" : "#617589",
            colorDanger: isDark ? "#f87171" : "#ef4444",
            fontFamily: "Inter, system-ui, sans-serif",
            borderRadius: "8px",
            spacingUnit: "4px",
        },
        rules: {
            ".Input": {
                border: isDark ? "1px solid #2d3748" : "1px solid #e5e7eb",
                boxShadow: "none",
                backgroundColor: isDark ? "#101922" : "#ffffff",
            },
            ".Input:focus": {
                border: "1px solid #137fec",
                boxShadow: "0 0 0 2px rgba(19, 127, 236, 0.2)",
            },
            ".Label": {
                color: isDark ? "#94a3b8" : "#617589",
                fontWeight: "500",
            },
            ".Tab": {
                border: isDark ? "1px solid #2d3748" : "1px solid #e5e7eb",
                backgroundColor: isDark ? "#1a2633" : "#ffffff",
            },
            ".Tab--selected": {
                borderColor: "#137fec",
                backgroundColor: isDark ? "#101922" : "#f0f7ff",
            },
        },
    };
}

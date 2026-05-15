export function getStripeAppearance() {
    const isDark = typeof window !== "undefined"
        && window.matchMedia?.("(prefers-color-scheme: dark)").matches;

    return {
        theme: isDark ? "night" : "stripe",
        variables: {
            colorPrimary: "#0A2540",
            colorBackground: isDark ? "#112240" : "#FFFFFF",
            colorText: isDark ? "#ffffff" : "#1A1A1A",
            colorTextSecondary: isDark ? "#94a3b8" : "#6B7280",
            colorDanger: isDark ? "#f87171" : "#ef4444",
            fontFamily: "Inter, system-ui, sans-serif",
            borderRadius: "8px",
            spacingUnit: "4px",
        },
        rules: {
            ".Input": {
                border: isDark ? "1px solid #1E3A5F" : "1px solid #E2E8F0",
                boxShadow: "none",
                backgroundColor: isDark ? "#0D1B2E" : "#FFFFFF",
            },
            ".Input:focus": {
                border: "1px solid #0A2540",
                boxShadow: "0 0 0 2px rgba(10, 37, 64, 0.2)",
            },
            ".Label": {
                color: isDark ? "#94a3b8" : "#6B7280",
                fontWeight: "500",
            },
            ".Tab": {
                border: isDark ? "1px solid #1E3A5F" : "1px solid #E2E8F0",
                backgroundColor: isDark ? "#112240" : "#FFFFFF",
            },
            ".Tab--selected": {
                borderColor: "#0A2540",
                backgroundColor: isDark ? "#0D1B2E" : "#F5F7FA",
            },
        },
    };
}

export function getStripeAppearance() {
    return {
        theme: "stripe",
        variables: {
            colorPrimary: "#0A2540",
            colorBackground: "#FFFFFF",
            colorText: "#1A1A1A",
            colorTextSecondary: "#6B7280",
            colorDanger: "#ef4444",
            fontFamily: "Inter, system-ui, sans-serif",
            borderRadius: "8px",
            spacingUnit: "4px",
        },
        rules: {
            ".Input": {
                border: "1px solid #E2E8F0",
                boxShadow: "none",
                backgroundColor: "#FFFFFF",
            },
            ".Input:focus": {
                border: "1px solid #0A2540",
                boxShadow: "0 0 0 2px rgba(10, 37, 64, 0.2)",
            },
            ".Label": {
                color: "#6B7280",
                fontWeight: "500",
            },
            ".Tab": {
                border: "1px solid #E2E8F0",
                backgroundColor: "#FFFFFF",
            },
            ".Tab--selected": {
                borderColor: "#0A2540",
                backgroundColor: "#F5F7FA",
            },
        },
    };
}

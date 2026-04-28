function sanitizeCSVValue(value) {
    const str = String(value);
    if (/^[=+\-@\t\r]/.test(str)) return `'${str}`;
    return str;
}

export function exportPayoutsCSV(payments) {
    if (!payments?.length) return;

    const headers = ["Customer", "Service Type", "Session Date", "Rate", "Platform Fee", "Earnings", "Status", "Date Paid"];
    const rows = payments.map((p) => [
        sanitizeCSVValue(p.booking?.customer?.fullName ?? ""),
        sanitizeCSVValue(p.booking?.offer?.request?.serviceType ?? ""),
        p.booking?.scheduledDate ? new Date(p.booking.scheduledDate).toLocaleDateString() : "",
        Number(p.amount || 0).toFixed(2),
        Number(p.platformFee || 0).toFixed(2),
        Number(p.releasedAmount ?? p.therapistPayout ?? 0).toFixed(2),
        p.status ?? "",
        p.releasedAt ? new Date(p.releasedAt).toLocaleDateString() : "",
    ]);

    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rehabtask-earnings-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

export function getBarHeightPercent(value, max) {
    if (!max || max === 0) return 0;
    return Math.max(2, Math.round((value / max) * 100));
}

export function formatMonthLabel(monthStr) {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "short" });
}

export function fillMissingMonths(earningsByMonth) {
    if (!Array.isArray(earningsByMonth)) return [];
    const result = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const existing = earningsByMonth.find((e) => e.month === key);
        result.push(existing || { month: key, earnings: 0, sessions: 0 });
    }
    return result;
}

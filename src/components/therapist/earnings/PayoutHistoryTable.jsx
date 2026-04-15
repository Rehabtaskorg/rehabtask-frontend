"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MdChevronLeft, MdChevronRight, MdAccountBalanceWallet } from "react-icons/md";
import { formatCurrency } from "@/utils/messages";

const ITEMS_PER_PAGE = 10;

const FILTER_TABS = [
    { key: "all", label: "All" },
    { key: "released", label: "Paid Out", dotColor: "bg-emerald-500" },
    { key: "escrowed", label: "In Escrow", dotColor: "bg-amber-500" },
    { key: "partially_released", label: "Partially Paid", dotColor: "bg-orange-500" },
];

const STATUS_STYLES = {
    released: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    escrowed: "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400",
    partially_released: "bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400",
};

const STATUS_TEXT = {
    released: "Paid Out",
    escrowed: "In Escrow",
    partially_released: "Partially Paid",
};

function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Compute adjusted payout figures accounting for missed/cancelled sessions.
 *
 * Missed and cancelled sessions have already been refunded to the customer
 * (per-session), so they can never contribute to the therapist's earnings.
 * The UI should reflect the adjusted ceiling, not the original booking total.
 */
function computePayoutFigures(payment) {
    const sessions = payment.booking?.sessions || [];
    const totalSessionCount = sessions.length || 1;
    const totalAmount = parseFloat(payment.amount);
    const fullFee = parseFloat(payment.platformFee);
    const fullPayout = parseFloat(payment.therapistPayout);

    const confirmedCount = sessions.filter(s => s.status === "confirmed_by_customer").length;
    const missedOrCancelledCount = sessions.filter(s => s.status === "missed" || s.status === "cancelled").length;
    const deliverableCount = Math.max(0, totalSessionCount - missedOrCancelledCount);
    const hasReducedScope = missedOrCancelledCount > 0 && totalSessionCount > 1;

    // Prorate totals by deliverable fraction
    const adjustedTotalAmount = hasReducedScope
        ? parseFloat(((totalAmount / totalSessionCount) * deliverableCount).toFixed(2))
        : totalAmount;
    const adjustedFee = hasReducedScope
        ? parseFloat(((fullFee / totalSessionCount) * deliverableCount).toFixed(2))
        : fullFee;
    const adjustedPayout = hasReducedScope
        ? parseFloat(((fullPayout / totalSessionCount) * deliverableCount).toFixed(2))
        : fullPayout;

    const feePercent = adjustedTotalAmount > 0
        ? Math.round((adjustedFee / adjustedTotalAmount) * 100)
        : 0;

    return {
        totalSessionCount,
        confirmedCount,
        missedOrCancelledCount,
        deliverableCount,
        hasReducedScope,
        fee: adjustedFee,
        feePercent,
        totalPayout: adjustedPayout,
        released: parseFloat(payment.releasedAmount ?? 0),
    };
}

function CustomerCell({ payment }) {
    const name = payment.booking?.customer?.fullName || "Customer";
    const service = payment.booking?.offer?.request?.serviceType || "";
    const initial = name.charAt(0).toUpperCase();

    return (
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                {initial}
            </div>
            <div className="min-w-0">
                <p className="text-sm font-semibold text-text-main dark:text-white truncate">{name}</p>
                {service && <p className="text-[10px] text-text-muted dark:text-slate-500 uppercase font-semibold tracking-tight">{service}</p>}
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[status] || "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
            {STATUS_TEXT[status] || status}
        </span>
    );
}

/** Session progress bar — shows confirmed / deliverable with a mini bar */
function SessionProgress({ payment }) {
    const sessions = payment.booking?.sessions;
    if (!sessions || sessions.length <= 1) return null;

    const total = sessions.length;
    const confirmed = sessions.filter(s => s.status === "confirmed_by_customer").length;
    const missedOrCancelled = sessions.filter(s => s.status === "missed" || s.status === "cancelled").length;
    const deliverable = Math.max(0, total - missedOrCancelled);
    const denominator = deliverable > 0 ? deliverable : total;
    const pct = denominator > 0 ? Math.round((confirmed / denominator) * 100) : 0;

    return (
        <div className="mt-1.5">
            <div className="flex items-center gap-1.5">
                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${confirmed === denominator ? "bg-emerald-500" : "bg-primary"}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
                <span className="text-[10px] font-bold text-text-muted dark:text-slate-500 whitespace-nowrap">
                    {confirmed}/{denominator}
                </span>
            </div>
        </div>
    );
}

export default function PayoutHistoryTable({ payments }) {
    const [activeFilter, setActiveFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    const filtered = useMemo(() => {
        if (activeFilter === "all") return payments;
        return payments.filter((p) => p.status === activeFilter);
    }, [payments, activeFilter]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleFilterChange = (key) => {
        setActiveFilter(key);
        setCurrentPage(1);
    };

    const router = useRouter();
    const handleRowClick = (bookingId) => {
        if (bookingId) router.push(`/therapist/bookings/${bookingId}`);
    };

    return (
        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl overflow-hidden">
            <div className="p-6 pb-0">
                <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-lg font-bold text-text-main dark:text-white">Payout History</h2>
                    <span className="bg-slate-100 dark:bg-slate-800 text-text-muted dark:text-slate-400 text-xs font-bold px-2.5 py-0.5 rounded-full">
                        {payments.length}
                    </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4 border-b border-border-light dark:border-border-dark pb-4">
                    {FILTER_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => handleFilterChange(tab.key)}
                            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
                                activeFilter === tab.key
                                    ? "bg-primary/10 text-primary"
                                    : "text-text-muted dark:text-slate-500 hover:text-text-main dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                        >
                            {tab.dotColor && <div className={`w-1.5 h-1.5 rounded-full ${tab.dotColor}`} />}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="px-6 pb-8 pt-4 text-center">
                    <MdAccountBalanceWallet className="text-4xl text-text-muted dark:text-slate-600 mx-auto mb-3" />
                    {payments.length === 0 ? (
                        <>
                            <p className="text-sm font-semibold text-text-main dark:text-white">No earnings yet</p>
                            <p className="text-xs text-text-muted dark:text-slate-400 mt-1">
                                Complete your first session to start earning. Your payout history will appear here.
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-sm font-semibold text-text-main dark:text-white">
                                No {FILTER_TABS.find((t) => t.key === activeFilter)?.label?.toLowerCase() || ""} payments
                            </p>
                            <p className="text-xs text-text-muted dark:text-slate-400 mt-1">
                                You don&apos;t have any payments with this status right now.
                            </p>
                        </>
                    )}
                </div>
            ) : (
                <>
                    {/* Desktop table */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-[#101922]/50 text-text-muted dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                    <th className="px-6 py-3">Customer</th>
                                    <th className="px-4 py-3">Rate</th>
                                    <th className="px-4 py-3">Sessions</th>
                                    <th className="px-4 py-3">Fee</th>
                                    <th className="px-4 py-3">Released</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-6 py-3">Date Paid</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                {paginated.map((p) => {
                                    const totalAmount = parseFloat(p.amount);
                                    const perSessionRate = p.booking?.rate ? parseFloat(p.booking.rate) : totalAmount;
                                    const figures = computePayoutFigures(p);
                                    const isMultiSession = figures.totalSessionCount > 1;

                                    return (
                                        <tr
                                            key={p.id}
                                            onClick={() => handleRowClick(p.bookingId)}
                                            className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-4"><CustomerCell payment={p} /></td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-text-main dark:text-white">
                                                    {formatCurrency(perSessionRate)}
                                                </span>
                                                {isMultiSession && (
                                                    <span className="text-[10px] text-text-muted dark:text-slate-500">/session</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                {isMultiSession ? (
                                                    <div>
                                                        <span className="text-sm text-text-main dark:text-white">
                                                            {figures.confirmedCount} of {figures.deliverableCount}
                                                        </span>
                                                        {figures.hasReducedScope && (
                                                            <p className="text-[10px] text-text-muted dark:text-slate-500 mt-0.5">
                                                                {figures.missedOrCancelledCount} missed/cancelled
                                                            </p>
                                                        )}
                                                        <SessionProgress payment={p} />
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-text-muted dark:text-slate-400">1</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-red-500">-{formatCurrency(figures.fee)} ({figures.feePercent}%)</td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                    {formatCurrency(p.status === "escrowed" ? figures.totalPayout : figures.released)}
                                                </span>
                                                {p.status === "partially_released" && (
                                                    <p className="text-[10px] text-text-muted dark:text-slate-500 mt-0.5">
                                                        of {formatCurrency(figures.totalPayout)}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-4"><StatusBadge status={p.status} /></td>
                                            <td className="px-6 py-4 text-sm text-text-muted dark:text-slate-400">
                                                {p.status === "released"
                                                    ? formatDate(p.releasedAt)
                                                    : p.status === "partially_released"
                                                        ? <span className="text-orange-500 font-medium">In progress</span>
                                                        : <span className="italic text-text-muted dark:text-slate-500">Pending</span>
                                                }
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="lg:hidden divide-y divide-border-light dark:divide-border-dark">
                        {paginated.map((p) => {
                            const totalAmount = parseFloat(p.amount);
                            const perSessionRate = p.booking?.rate ? parseFloat(p.booking.rate) : totalAmount;
                            const figures = computePayoutFigures(p);
                            const isMultiSession = figures.totalSessionCount > 1;

                            return (
                                <div
                                    key={p.id}
                                    onClick={() => handleRowClick(p.bookingId)}
                                    className="p-4 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <CustomerCell payment={p} />
                                        <StatusBadge status={p.status} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 text-sm">
                                        <div>
                                            <p className="text-[10px] text-text-muted dark:text-slate-500 uppercase font-bold">Rate</p>
                                            <p className="text-text-main dark:text-white">
                                                {formatCurrency(perSessionRate)}
                                                {isMultiSession && <span className="text-[10px] text-text-muted">/session</span>}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-text-muted dark:text-slate-500 uppercase font-bold">Fee ({figures.feePercent}%)</p>
                                            <p className="text-red-500">-{formatCurrency(figures.fee)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-text-muted dark:text-slate-500 uppercase font-bold">Released</p>
                                            <p className="font-bold text-emerald-600 dark:text-emerald-400">
                                                {formatCurrency(p.status === "escrowed" ? figures.totalPayout : figures.released)}
                                            </p>
                                            {p.status === "partially_released" && (
                                                <p className="text-[10px] text-text-muted mt-0.5">of {formatCurrency(figures.totalPayout)}</p>
                                            )}
                                        </div>
                                    </div>
                                    {isMultiSession && (
                                        <div className="mt-2">
                                            <p className="text-[10px] text-text-muted dark:text-slate-500">
                                                {figures.confirmedCount} of {figures.deliverableCount} sessions confirmed
                                                {figures.hasReducedScope && ` (${figures.missedOrCancelledCount} missed/cancelled)`}
                                            </p>
                                            <SessionProgress payment={p} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 sm:p-6 border-t border-border-light dark:border-border-dark flex items-center justify-between">
                            <p className="text-xs text-text-muted dark:text-slate-500">
                                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 rounded border border-border-light dark:border-border-dark text-text-muted dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                                >
                                    <MdChevronLeft className="text-lg" />
                                </button>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                                            currentPage === page
                                                ? "bg-primary text-white"
                                                : "border border-border-light dark:border-border-dark text-text-muted dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 rounded border border-border-light dark:border-border-dark text-text-muted dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                                >
                                    <MdChevronRight className="text-lg" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
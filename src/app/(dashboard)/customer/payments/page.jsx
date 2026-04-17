"use client";

import { useState, useMemo, Fragment } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePageTitle } from "@/hooks/usePageTitle";
import { usePaymentHistory, useRefundSummary, useCustomerConnectStatus } from "@/hooks/usePayments";
import {
    MdPayments, MdLock, MdAccountBalance, MdArrowForward,
    MdChevronLeft, MdChevronRight, MdExpandMore, MdExpandLess,
    MdCheckCircle, MdSchedule, MdWarning, MdInfo,
} from "react-icons/md";

const ROWS_PER_PAGE = 10;

const STATUS_CONFIG = {
    intent_created: { label: "Pending", color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" },
    escrowed: { label: "In Escrow", color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" },
    partially_released: { label: "In Escrow", color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" },
    released: { label: "Completed", color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" },
    refunded: { label: "Refunded", color: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" },
    failed: { label: "Failed", color: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" },
};

const getEffectiveStatus = (payment) => {
    const bookingStatus = payment.booking?.status;
    if (payment.status === "escrowed" && ["finalized", "cancelled"].includes(bookingStatus)) return "refunded";
    return payment.status;
};

const formatCurrency = (amount) => {
    const num = parseFloat(amount);
    return isNaN(num) ? "$0.00" : `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const getInitials = (name) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

// Status display for a CustomerRefund (what the customer actually sees)
// Build an aggregate refund label for a payment's row.
// Sums per-status totals across all CustomerRefund rows for this payment.
// Pending takes priority in the label since it's the actionable state.
const getRefundDisplay = (customerRefunds, fallbackRefundedAmount) => {
    const refunds = customerRefunds || [];

    if (refunds.length > 0) {
        const sumByStatus = (status) => refunds
            .filter(r => r.status === status)
            .reduce((sum, r) => sum + parseFloat(r.amount), 0);

        const pending = sumByStatus("pending_connect");
        const transferred = sumByStatus("transferred");
        const card = sumByStatus("refunded_to_card");
        const completed = transferred + card;

        // Priority: show pending if any (action needed); otherwise show completed total
        if (pending > 0 && completed > 0) {
            return {
                label: `${formatCurrency(completed)} sent · ${formatCurrency(pending)} pending`,
                color: "text-amber-600 dark:text-amber-400 font-semibold",
            };
        }
        if (pending > 0) {
            return { label: `${formatCurrency(pending)} pending refund`, color: "text-amber-600 dark:text-amber-400 font-semibold" };
        }
        if (transferred > 0 && card === 0) {
            return { label: `${formatCurrency(transferred)} sent to bank`, color: "text-emerald-600 dark:text-emerald-400 font-semibold" };
        }
        if (card > 0 && transferred === 0) {
            return { label: `${formatCurrency(card)} returned to card`, color: "text-emerald-600 dark:text-emerald-400 font-semibold" };
        }
        if (completed > 0) {
            return { label: `${formatCurrency(completed)} refunded`, color: "text-emerald-600 dark:text-emerald-400 font-semibold" };
        }
    }

    // Legacy: payment.refundedAmount set via old card refund path (no CustomerRefund row)
    if (fallbackRefundedAmount && refunds.length === 0) {
        return { label: `${formatCurrency(fallbackRefundedAmount)} refunded`, color: "text-emerald-600 dark:text-emerald-400 font-semibold" };
    }
    return null;
};

export default function CustomerPaymentsPage() {
    usePageTitle("Payments & Refunds");
    const router = useRouter();

    const { data: payments, isLoading: paymentsLoading } = usePaymentHistory();
    const { data: summary, isLoading: summaryLoading } = useRefundSummary();
    const { data: connectStatus } = useCustomerConnectStatus();

    const [filter, setFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [expandedId, setExpandedId] = useState(null);

    const filtered = useMemo(() => {
        if (!payments) return [];
        if (filter === "all") return payments;
        if (filter === "escrow") return payments.filter(p => ["escrowed", "partially_released"].includes(p.status));
        if (filter === "completed") return payments.filter(p => p.status === "released");
        if (filter === "refunded") return payments.filter(p => p.status === "refunded" || p.refundedAmount);
        return payments;
    }, [payments, filter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
    const safePage = Math.min(page, totalPages);
    const paginated = filtered.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

    const isLoading = paymentsLoading || summaryLoading;

    const hasPendingRefunds = summary?.pendingRefundAmount > 0;
    const hasConnectAccount = connectStatus?.connected;

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="border-b border-border-light dark:border-border-dark bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
                <div className="flex justify-between items-center px-4 sm:px-8 py-4">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-text-main dark:text-white">
                        Payments & Refunds
                    </h2>
                </div>
            </header>

            {/* Scrollable content */}
            <div className="flex-1 overflow-auto px-4 sm:px-8 py-6">
                <div className="max-w-6xl mx-auto space-y-6">

                    {/* Summary Cards */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-28 bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark animate-pulse" />
                            ))}
                        </div>
                    ) : summary ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <MdPayments className="text-text-muted dark:text-gray-400" />
                                    <p className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest">Total Paid</p>
                                </div>
                                <p className="text-2xl font-black text-text-main dark:text-white">{formatCurrency(summary.totalPaid)}</p>
                                <p className="text-xs text-text-muted dark:text-gray-400 mt-1">All time</p>
                            </div>
                            <div className="bg-card-light dark:bg-card-dark border-l-4 border-l-blue-500 border border-border-light dark:border-border-dark rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <MdLock className="text-blue-500" />
                                    <p className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest">In Escrow</p>
                                </div>
                                <p className="text-2xl font-black text-blue-500">{formatCurrency(summary.inEscrow)}</p>
                                <p className="text-xs text-text-muted dark:text-gray-400 mt-1">Held for active bookings</p>
                            </div>
                            <div className="bg-card-light dark:bg-card-dark border-l-4 border-l-emerald-500 border border-border-light dark:border-border-dark rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <MdCheckCircle className="text-emerald-500" />
                                    <p className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest">Refunded</p>
                                </div>
                                <p className="text-2xl font-black text-emerald-500">{formatCurrency(summary.totalRefunded)}</p>
                                <p className="text-xs text-text-muted dark:text-gray-400 mt-1">Returned to you</p>
                            </div>
                        </div>
                    ) : null}

                    {/* Pending Refund Banner */}
                    {hasPendingRefunds && !hasConnectAccount && (
                        <div className="bg-card-light dark:bg-card-dark rounded-xl border border-amber-300 dark:border-amber-500/30 overflow-hidden">
                            <div className="border-l-4 border-l-amber-500 p-5">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                                            <MdWarning className="text-2xl" />
                                        </div>
                                        <div>
                                            <span className="inline-block px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded uppercase tracking-wider mb-1">
                                                Action Required
                                            </span>
                                            <h4 className="text-text-main dark:text-white font-bold">
                                                You have {formatCurrency(summary.pendingRefundAmount)} in pending refunds
                                            </h4>
                                            <p className="text-sm text-text-muted dark:text-gray-400 mt-0.5">
                                                Set up your payout account to receive refunds directly to your bank account.
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/customer/payout-setup"
                                        className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors shrink-0 text-center"
                                    >
                                        Set Up Payout Account
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payout Account Status (when Connect is active) */}
                    {hasConnectAccount && connectStatus?.onboardingComplete && (
                        <div className="bg-card-light dark:bg-card-dark rounded-xl border border-emerald-200 dark:border-emerald-500/20 p-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                        <MdAccountBalance className="text-2xl" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-text-main dark:text-white">Payout Account</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Active</span>
                                        </div>
                                    </div>
                                </div>
                                {hasPendingRefunds && (
                                    <p className="text-sm text-text-muted dark:text-gray-400">
                                        {formatCurrency(summary.pendingRefundAmount)} pending
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Payout Account Under Review */}
                    {hasConnectAccount && connectStatus?.detailsSubmitted && !connectStatus?.onboardingComplete && (
                        <div className="bg-card-light dark:bg-card-dark rounded-xl border border-amber-200 dark:border-amber-500/20 p-5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                    <MdSchedule className="text-2xl" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-text-main dark:text-white">Payout Account Under Review</p>
                                    <p className="text-xs text-text-muted dark:text-gray-400 mt-0.5">
                                        Your details have been submitted. We are verifying your account — this usually takes a few minutes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filter Tabs + Payment Table */}
                    <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
                        {/* Filter tabs */}
                        <div className="px-5 pt-5 pb-3 border-b border-border-light dark:border-border-dark flex items-center gap-2">
                            {[
                                { key: "all", label: "All" },
                                { key: "escrow", label: "In Escrow" },
                                { key: "completed", label: "Completed" },
                                { key: "refunded", label: "Refunded" },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => { setFilter(tab.key); setPage(1); }}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${filter === tab.key
                                        ? "bg-primary text-white"
                                        : "text-text-muted dark:text-gray-400 hover:bg-muted-light dark:hover:bg-muted-dark"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {paymentsLoading ? (
                            <div className="animate-pulse space-y-0">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-16 border-b border-border-light dark:border-border-dark" />
                                ))}
                            </div>
                        ) : !payments || payments.length === 0 ? (
                            <div className="py-16 text-center">
                                <MdPayments className="text-5xl text-slate-200 dark:text-slate-700 mx-auto mb-2" />
                                <p className="text-text-muted dark:text-gray-400 text-sm">No payment history yet</p>
                                <p className="text-xs text-text-muted/60 dark:text-gray-500 mt-1">Your payment history will appear here once you book a therapist.</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="py-16 text-center">
                                <p className="text-text-muted dark:text-gray-400 text-sm">No payments match this filter.</p>
                                <button onClick={() => setFilter("all")} className="text-primary text-sm font-bold hover:underline mt-1">
                                    Show all
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Desktop table */}
                                <div className="hidden lg:block">
                                    <table className="w-full text-left">
                                        <thead className="bg-muted-light dark:bg-muted-dark border-b border-border-light dark:border-border-dark">
                                            <tr>
                                                <th className="px-5 py-3 text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest">Therapist</th>
                                                <th className="px-5 py-3 text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest">Booking</th>
                                                <th className="px-5 py-3 text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest">Amount</th>
                                                <th className="px-5 py-3 text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest">Date</th>
                                                <th className="px-5 py-3 text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest">Status</th>
                                                <th className="px-5 py-3 text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest">Refund</th>
                                                <th className="px-5 py-3"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                            {paginated.map((payment) => {
                                                const config = STATUS_CONFIG[getEffectiveStatus(payment)] || STATUS_CONFIG.escrowed;
                                                const isExpanded = expandedId === payment.id;
                                                const therapist = payment.booking?.therapist;
                                                const serviceType = payment.booking?.offer?.request?.serviceType || payment.booking?.sessionType || "—";
                                                const sessionCount = payment.booking?.sessions?.length;
                                                const sessions = payment.booking?.sessions || [];
                                                const confirmedCount = sessions.filter(s => s.status === "confirmed_by_customer").length;

                                                return (
                                                    <Fragment key={payment.id}>
                                                        <tr className={`hover:bg-primary/5 transition-colors cursor-pointer ${isExpanded ? "bg-primary/5" : ""}`} onClick={() => setExpandedId(isExpanded ? null : payment.id)}>
                                                            <td className="px-5 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                                                        {getInitials(therapist?.fullName)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-bold text-text-main dark:text-white">{therapist?.fullName || "—"}</p>
                                                                        <p className="text-[11px] text-text-muted dark:text-gray-400">{serviceType}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-4 text-sm text-text-muted dark:text-gray-400">
                                                                {sessionCount ? `${sessionCount} session${sessionCount > 1 ? "s" : ""}` : "—"}
                                                            </td>
                                                            <td className="px-5 py-4 text-sm font-bold text-text-main dark:text-white">
                                                                {formatCurrency(payment.amount)}
                                                            </td>
                                                            <td className="px-5 py-4 text-sm text-text-muted dark:text-gray-400">
                                                                {formatDate(payment.createdAt)}
                                                            </td>
                                                            <td className="px-5 py-4">
                                                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${config.color}`}>
                                                                    {config.label}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-4 text-xs">
                                                                {(() => {
                                                                    const refundDisplay = getRefundDisplay(payment.customerRefunds, payment.refundedAmount);
                                                                    return refundDisplay ? (
                                                                        <span className={refundDisplay.color}>{refundDisplay.label}</span>
                                                                    ) : <span className="text-text-muted dark:text-gray-400">—</span>;
                                                                })()}
                                                            </td>
                                                            <td className="px-5 py-4 text-right">
                                                                {isExpanded ? <MdExpandLess className="text-lg text-text-muted" /> : <MdExpandMore className="text-lg text-text-muted" />}
                                                            </td>
                                                        </tr>

                                                        {isExpanded && (
                                                            <tr className="bg-muted-light dark:bg-muted-dark">
                                                                <td className="px-5 py-5" colSpan={7}>
                                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                                        {/* Session Progress */}
                                                                        {sessions.length > 0 && (
                                                                            <div>
                                                                                <p className="text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-2">Session Progress</p>
                                                                                <div className="flex justify-between text-xs text-text-main dark:text-white mb-1">
                                                                                    <span>{confirmedCount} of {sessions.length} completed</span>
                                                                                    <span>{Math.round((confirmedCount / sessions.length) * 100)}%</span>
                                                                                </div>
                                                                                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                                                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(confirmedCount / sessions.length) * 100}%` }} />
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* Financial Breakdown */}
                                                                        <div>
                                                                            <p className="text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-2">Financial Breakdown</p>
                                                                            {(() => {
                                                                                const total = parseFloat(payment.amount);
                                                                                const feeRatio = total > 0 ? parseFloat(payment.platformFee) / total : 0;
                                                                                const released = parseFloat(payment.releasedAmount ?? 0);
                                                                                const grossReleased = feeRatio < 1 ? parseFloat((released / (1 - feeRatio)).toFixed(2)) : released;
                                                                                const refunds = payment.customerRefunds || [];
                                                                                const sumByStatus = (status) => refunds.filter(r => r.status === status).reduce((s, r) => s + parseFloat(r.amount), 0);
                                                                                const pendingRefund = sumByStatus("pending_connect");
                                                                                const transferredRefund = sumByStatus("transferred");
                                                                                const cardRefund = sumByStatus("refunded_to_card");
                                                                                const legacyRefund = refunds.length === 0 && payment.refundedAmount ? parseFloat(payment.refundedAmount) : 0;
                                                                                const totalRefunded = pendingRefund + transferredRefund + cardRefund + legacyRefund;
                                                                                const effectiveReleased = getEffectiveStatus(payment) === "refunded" ? 0 : grossReleased;
                                                                                const remaining = Math.max(0, parseFloat((total - effectiveReleased - totalRefunded).toFixed(2)));

                                                                                return (
                                                                                    <div className="space-y-1.5 text-xs">
                                                                                        <div className="flex justify-between font-semibold text-text-main dark:text-white">
                                                                                            <span>Total Paid</span>
                                                                                            <span>{formatCurrency(total)}</span>
                                                                                        </div>
                                                                                        {effectiveReleased > 0 && (
                                                                                            <div className="flex justify-between text-text-muted dark:text-gray-400">
                                                                                                <span>Released to therapist</span>
                                                                                                <span>{formatCurrency(effectiveReleased)}</span>
                                                                                            </div>
                                                                                        )}
                                                                                        {transferredRefund > 0 && (
                                                                                            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                                                                                                <span>Refunded to your bank</span>
                                                                                                <span>{formatCurrency(transferredRefund)}</span>
                                                                                            </div>
                                                                                        )}
                                                                                        {cardRefund > 0 && (
                                                                                            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                                                                                                <span>Returned to card</span>
                                                                                                <span>{formatCurrency(cardRefund)}</span>
                                                                                            </div>
                                                                                        )}
                                                                                        {pendingRefund > 0 && (
                                                                                            <div className="flex justify-between text-amber-600 dark:text-amber-400">
                                                                                                <span>Refund pending</span>
                                                                                                <span>{formatCurrency(pendingRefund)}</span>
                                                                                            </div>
                                                                                        )}
                                                                                        {legacyRefund > 0 && (
                                                                                            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                                                                                                <span>Refunded</span>
                                                                                                <span>{formatCurrency(legacyRefund)}</span>
                                                                                            </div>
                                                                                        )}
                                                                                        {remaining > 0 && (
                                                                                            <div className="flex justify-between text-text-muted dark:text-gray-400 pt-1 border-t border-border-light dark:border-border-dark">
                                                                                                <span>Held in escrow</span>
                                                                                                <span>{formatCurrency(remaining)}</span>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                );
                                                                            })()}
                                                                        </div>

                                                                        {/* Timeline */}
                                                                        <div>
                                                                            <p className="text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-2">Timeline</p>
                                                                            <div className="space-y-3 relative before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-border-light dark:before:bg-border-dark">
                                                                                <div className="relative pl-5">
                                                                                    <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-primary" />
                                                                                    <p className="text-xs text-text-main dark:text-white">Payment received</p>
                                                                                    <p className="text-[10px] text-text-muted dark:text-gray-400">{formatDate(payment.createdAt)}</p>
                                                                                </div>
                                                                                {payment.escrowedAt && (
                                                                                    <div className="relative pl-5">
                                                                                        <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-blue-500" />
                                                                                        <p className="text-xs text-text-main dark:text-white">Funds escrowed</p>
                                                                                        <p className="text-[10px] text-text-muted dark:text-gray-400">{formatDate(payment.escrowedAt)}</p>
                                                                                    </div>
                                                                                )}
                                                                                {payment.releasedAt && (
                                                                                    <div className="relative pl-5">
                                                                                        <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-emerald-500" />
                                                                                        <p className="text-xs text-text-main dark:text-white">Therapist paid</p>
                                                                                        <p className="text-[10px] text-text-muted dark:text-gray-400">{formatDate(payment.releasedAt)}</p>
                                                                                    </div>
                                                                                )}
                                                                                {(payment.customerRefunds || []).map((cr) => {
                                                                                    if (cr.status === "pending_connect") {
                                                                                        return (
                                                                                            <div key={cr.id} className="relative pl-5">
                                                                                                <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                                                                                                <p className="text-xs text-text-main dark:text-white">Refund pending ({formatCurrency(cr.amount)}) — awaiting payout setup</p>
                                                                                                <p className="text-[10px] text-text-muted dark:text-gray-400">{formatDate(cr.createdAt)}</p>
                                                                                            </div>
                                                                                        );
                                                                                    }
                                                                                    if (cr.status === "transferred") {
                                                                                        return (
                                                                                            <div key={cr.id} className="relative pl-5">
                                                                                                <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-emerald-500" />
                                                                                                <p className="text-xs text-text-main dark:text-white">Refund sent to bank ({formatCurrency(cr.amount)})</p>
                                                                                                <p className="text-[10px] text-text-muted dark:text-gray-400">{formatDate(cr.transferredAt)}</p>
                                                                                            </div>
                                                                                        );
                                                                                    }
                                                                                    if (cr.status === "refunded_to_card") {
                                                                                        return (
                                                                                            <div key={cr.id} className="relative pl-5">
                                                                                                <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-emerald-500" />
                                                                                                <p className="text-xs text-text-main dark:text-white">Refund returned to card ({formatCurrency(cr.amount)})</p>
                                                                                                <p className="text-[10px] text-text-muted dark:text-gray-400">{formatDate(cr.fallbackRefundAt)}</p>
                                                                                            </div>
                                                                                        );
                                                                                    }
                                                                                    return null;
                                                                                })}
                                                                                {!payment.customerRefunds?.[0] && payment.refundedAt && (
                                                                                    <div className="relative pl-5">
                                                                                        <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-amber-500" />
                                                                                        <p className="text-xs text-text-main dark:text-white">Refund issued</p>
                                                                                        <p className="text-[10px] text-text-muted dark:text-gray-400">{formatDate(payment.refundedAt)}</p>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </Fragment>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile card list */}
                                <div className="lg:hidden divide-y divide-border-light dark:divide-border-dark">
                                    {paginated.map((payment) => {
                                        const config = STATUS_CONFIG[getEffectiveStatus(payment)] || STATUS_CONFIG.escrowed;
                                        const therapist = payment.booking?.therapist;
                                        return (
                                            <div key={payment.id} className="p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                                            {getInitials(therapist?.fullName)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-text-main dark:text-white">{therapist?.fullName || "—"}</p>
                                                            <p className="text-xs text-text-muted dark:text-gray-400">{formatDate(payment.createdAt)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-text-main dark:text-white">{formatCurrency(payment.amount)}</p>
                                                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${config.color}`}>
                                                            {config.label}
                                                        </span>
                                                    </div>
                                                </div>
                                                {(() => {
                                                    const refundDisplay = getRefundDisplay(payment.customerRefunds, payment.refundedAmount);
                                                    return refundDisplay ? (
                                                        <p className={`text-xs mt-2 ${refundDisplay.color}`}>
                                                            {refundDisplay.label}
                                                        </p>
                                                    ) : null;
                                                })()}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Pagination */}
                                {filtered.length > ROWS_PER_PAGE && (
                                    <div className="px-5 py-3 bg-muted-light dark:bg-muted-dark border-t border-border-light dark:border-border-dark flex justify-between items-center">
                                        <p className="text-xs text-text-muted dark:text-gray-400">
                                            Showing <span className="font-bold text-text-main dark:text-white">{(safePage - 1) * ROWS_PER_PAGE + 1}-{Math.min(safePage * ROWS_PER_PAGE, filtered.length)}</span> of <span className="font-bold text-text-main dark:text-white">{filtered.length}</span>
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                                disabled={safePage <= 1}
                                                className="p-1.5 rounded-lg bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark hover:bg-muted-light dark:hover:bg-muted-dark transition-colors disabled:opacity-40"
                                            >
                                                <MdChevronLeft className="text-base" />
                                            </button>
                                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                                const pageNum = totalPages <= 5 ? i + 1 : safePage <= 3 ? i + 1 : safePage >= totalPages - 2 ? totalPages - 4 + i : safePage - 2 + i;
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setPage(pageNum)}
                                                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${safePage === pageNum ? "bg-primary text-white" : "text-text-muted dark:text-gray-400 hover:bg-muted-light dark:hover:bg-muted-dark"}`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                            <button
                                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                                disabled={safePage >= totalPages}
                                                className="p-1.5 rounded-lg bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark hover:bg-muted-light dark:hover:bg-muted-dark transition-colors disabled:opacity-40"
                                            >
                                                <MdChevronRight className="text-base" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Escrow info */}
                    {payments?.some(p => ["escrowed", "partially_released"].includes(p.status)) && (
                        <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4">
                            <MdInfo className="text-blue-500 text-lg shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                                Payments marked &quot;In Escrow&quot; are held securely until you confirm session completion. Funds are released to the therapist after each confirmed session.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

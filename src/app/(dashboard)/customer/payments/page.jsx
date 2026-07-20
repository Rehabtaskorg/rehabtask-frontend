"use client";

import { useState, useMemo, Fragment } from "react";
import Link from "next/link";
import { usePageTitle } from "@/hooks/usePageTitle";
import { usePaymentHistory, useRefundSummary, useCustomerConnectStatus } from "@/hooks/usePayments";
import {
    MdPayments, MdLock, MdAccountBalance,
    MdChevronLeft, MdChevronRight, MdExpandMore, MdExpandLess,
    MdCheckCircle, MdSchedule, MdWarning, MdInfo,
} from "react-icons/md";

const ROWS_PER_PAGE = 10;

const STATUS_CONFIG = {
    intent_created: { label: "Pending",   color: "bg-amber-50  text-amber-600  border border-amber-200 " },
    escrowed:       { label: "In Escrow", color: "bg-blue-50   text-blue-600   border border-blue-200 " },
    partially_released: { label: "In Escrow", color: "bg-blue-50 text-blue-600 border border-blue-200 " },
    released:       { label: "Completed", color: "bg-emerald-50 text-emerald-600 border border-emerald-200 " },
    refunded:       { label: "Refunded",  color: "bg-slate-100  text-slate-600  border border-slate-200 " },
    failed:         { label: "Failed",    color: "bg-red-50    text-red-600    border border-red-200 " },
};

/**
 * @param {Object} payment
 * @returns {string}
 */
const getEffectiveStatus = (payment) => {
    const bookingStatus = payment.booking?.status;
    if (payment.status === "escrowed" && ["finalized", "cancelled"].includes(bookingStatus)) return "refunded";
    return payment.status;
};

/**
 * @param {number|string} amount
 * @returns {string}
 */
const formatCurrency = (amount) => {
    const num = parseFloat(amount);
    return isNaN(num) ? "$0.00" : `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * @param {string} dateStr
 * @returns {string}
 */
const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

/**
 * @param {string} name
 * @returns {string}
 */
const getInitials = (name) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

/**
 * Builds an aggregate refund label for a payment row.
 * Pending takes priority since it's the actionable state.
 *
 * @param {Array} customerRefunds
 * @param {number|string|null} fallbackRefundedAmount
 * @returns {{ label: string, color: string } | null}
 */
const getRefundDisplay = (customerRefunds, fallbackRefundedAmount) => {
    const refunds = customerRefunds || [];

    if (refunds.length > 0) {
        const sumByStatus = (status) => refunds
            .filter(r => r.status === status)
            .reduce((sum, r) => sum + parseFloat(r.amount), 0);

        const pending     = sumByStatus("pending_connect");
        const transferred = sumByStatus("transferred");
        const card        = sumByStatus("refunded_to_card");
        const completed   = transferred + card;

        if (pending > 0 && completed > 0) {
            return { label: `${formatCurrency(completed)} sent · ${formatCurrency(pending)} pending`, color: "text-amber-600  font-semibold" };
        }
        if (pending > 0) {
            return { label: `${formatCurrency(pending)} pending refund`, color: "text-amber-600  font-semibold" };
        }
        if (transferred > 0 && card === 0) {
            return { label: `${formatCurrency(transferred)} returned to your account`, color: "text-emerald-600  font-semibold" };
        }
        if (card > 0 && transferred === 0) {
            return { label: `${formatCurrency(card)} returned to card`, color: "text-emerald-600  font-semibold" };
        }
        if (completed > 0) {
            return { label: `${formatCurrency(completed)} refunded`, color: "text-emerald-600  font-semibold" };
        }
    }

    if (fallbackRefundedAmount && refunds.length === 0) {
        return { label: `${formatCurrency(fallbackRefundedAmount)} refunded`, color: "text-emerald-600  font-semibold" };
    }
    return null;
};

export default function CustomerPaymentsPage() {
    usePageTitle("Payments & Refunds");

    const { data: payments, isLoading: paymentsLoading } = usePaymentHistory();
    const { data: summary, isLoading: summaryLoading }   = useRefundSummary();
    const { data: connectStatus }                        = useCustomerConnectStatus();

    const [filter, setFilter]       = useState("all");
    const [page, setPage]           = useState(1);
    const [expandedId, setExpandedId] = useState(null);

    const filtered = useMemo(() => {
        if (!payments) return [];
        if (filter === "all")       return payments;
        if (filter === "escrow")    return payments.filter(p => ["escrowed", "partially_released"].includes(p.status));
        if (filter === "completed") return payments.filter(p => p.status === "released");
        if (filter === "refunded")  return payments.filter(p => {
            if (getEffectiveStatus(p) === "refunded") return true;
            const refunds = p.customerRefunds || [];
            const hasCompletedRefund = refunds.some(r => r.status === "transferred" || r.status === "refunded_to_card");
            const isStillEscrowed = p.status === "escrowed" || p.status === "partially_released";
            return hasCompletedRefund && !isStillEscrowed;
        });
        return payments;
    }, [payments, filter]);

    const tabCounts = useMemo(() => {
        if (!payments) return { all: 0, escrow: 0, completed: 0, refunded: 0 };
        return {
            all:       payments.length,
            escrow:    payments.filter(p => ["escrowed", "partially_released"].includes(p.status)).length,
            completed: payments.filter(p => p.status === "released").length,
            refunded:  payments.filter(p => {
                if (getEffectiveStatus(p) === "refunded") return true;
                const refunds = p.customerRefunds || [];
                const hasCompletedRefund = refunds.some(r => r.status === "transferred" || r.status === "refunded_to_card");
                const isStillEscrowed = p.status === "escrowed" || p.status === "partially_released";
                return hasCompletedRefund && !isStillEscrowed;
            }).length,
        };
    }, [payments]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
    const safePage   = Math.min(page, totalPages);
    const paginated  = filtered.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

    const isLoading = paymentsLoading || summaryLoading;

    const hasPendingRefunds     = summary?.pendingRefundAmount > 0;
    const hasConnectAccount     = connectStatus?.connected && connectStatus?.onboardingComplete;

    const failedPayoutRefunds = useMemo(() => {
        if (!payments) return [];
        return payments.flatMap(p => (p.customerRefunds || []).filter(cr => cr.status === "pending_connect" && cr.reason));
    }, [payments]);
    const hasFailedPayoutRefunds = failedPayoutRefunds.length > 0;
    const failedPayoutTotal      = failedPayoutRefunds.reduce((sum, cr) => sum + parseFloat(cr.amount), 0);

    const TABS = [
        { key: "all",       label: "All" },
        { key: "escrow",    label: "In Escrow" },
        { key: "completed", label: "Completed" },
        { key: "refunded",  label: "Refunded" },
    ];

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="border-b border-border-light  bg-white/80  backdrop-blur-md sticky top-0 z-10 shrink-0">
                <div className="flex justify-between items-center px-4 sm:px-8 py-4">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-text-main ">
                        Payments &amp; Refunds
                    </h2>
                </div>
            </header>

            <div className="flex-1 overflow-auto px-4 sm:px-8 py-6">
                <div className="max-w-5xl mx-auto space-y-6">

                    {/* Summary Cards */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-28 bg-card-light  rounded-xl border border-border-light  animate-pulse" />
                            ))}
                        </div>
                    ) : summary ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-card-light  border border-border-light  rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <MdPayments className="text-text-muted " />
                                    <p className="text-xs font-bold text-text-muted  uppercase tracking-widest">Total Paid</p>
                                </div>
                                <p className="text-3xl font-black text-text-main ">{formatCurrency(summary.totalPaid)}</p>
                                <p className="text-xs text-text-muted  mt-1">All time</p>
                            </div>
                            <div className="bg-card-light  border-l-4 border-l-blue-500 border border-border-light  rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <MdLock className="text-blue-500" />
                                    <p className="text-xs font-bold text-text-muted  uppercase tracking-widest">In Escrow</p>
                                </div>
                                <p className="text-3xl font-black text-blue-500">{formatCurrency(summary.inEscrow)}</p>
                                <p className="text-xs text-text-muted  mt-1">Held for active bookings</p>
                            </div>
                            <div className="bg-card-light  border-l-4 border-l-emerald-500 border border-border-light  rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <MdCheckCircle className="text-emerald-500" />
                                    <p className="text-xs font-bold text-text-muted  uppercase tracking-widest">Refunded</p>
                                </div>
                                <p className="text-3xl font-black text-emerald-500">{formatCurrency(summary.totalRefunded)}</p>
                                <p className="text-xs text-text-muted  mt-1">Returned to you</p>
                            </div>
                        </div>
                    ) : null}

                    {/* Payout Failure Banner */}
                    {hasFailedPayoutRefunds && (
                        <div className="bg-card-light  rounded-xl border border-red-300  overflow-hidden">
                            <div className="border-l-4 border-l-red-500 p-5">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-full bg-red-100  flex items-center justify-center text-red-600  shrink-0">
                                            <MdWarning className="text-2xl" />
                                        </div>
                                        <div>
                                            <span className="inline-block px-2 py-0.5 bg-red-100  text-red-700  text-[10px] font-bold rounded uppercase tracking-wider mb-1">
                                                Bank Transfer Failed
                                            </span>
                                            <h4 className="text-text-main  font-bold">
                                                Your refund of {formatCurrency(failedPayoutTotal)} could not be delivered
                                            </h4>
                                            <p className="text-sm text-text-muted  mt-0.5">
                                                The transfer to your bank account was unsuccessful. Please update your bank account details to receive your refund.
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/customer/payout-setup"
                                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors shrink-0 text-center"
                                    >
                                        Update Bank Account
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pending Refund Banner — no Connect account yet */}
                    {hasPendingRefunds && !connectStatus?.connected && (
                        <div className="bg-card-light  rounded-xl border border-amber-300  overflow-hidden">
                            <div className="border-l-4 border-l-amber-500 p-5">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-full bg-amber-100  flex items-center justify-center text-amber-600  shrink-0">
                                            <MdWarning className="text-2xl" />
                                        </div>
                                        <div>
                                            <span className="inline-block px-2 py-0.5 bg-amber-100  text-amber-700  text-[10px] font-bold rounded uppercase tracking-wider mb-1">
                                                Action Required
                                            </span>
                                            <h4 className="text-text-main  font-bold">
                                                You have {formatCurrency(summary.pendingRefundAmount)} in pending refunds
                                            </h4>
                                            <p className="text-sm text-text-muted  mt-0.5">
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

                    {/* Incomplete onboarding banner */}
                    {hasPendingRefunds && connectStatus?.connected && !connectStatus?.onboardingComplete && (
                        <div className="bg-card-light  rounded-xl border border-amber-300  overflow-hidden">
                            <div className="border-l-4 border-l-amber-500 p-5">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-full bg-amber-100  flex items-center justify-center text-amber-600  shrink-0">
                                            <MdWarning className="text-2xl" />
                                        </div>
                                        <div>
                                            <span className="inline-block px-2 py-0.5 bg-amber-100  text-amber-700  text-[10px] font-bold rounded uppercase tracking-wider mb-1">
                                                Setup Incomplete
                                            </span>
                                            <h4 className="text-text-main  font-bold">Finish setting up your payout account</h4>
                                            <p className="text-sm text-text-muted  mt-0.5">
                                                You have {formatCurrency(summary.pendingRefundAmount)} in pending refunds. Complete your account setup to receive them.
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/customer/payout-setup"
                                        className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors shrink-0 text-center"
                                    >
                                        Complete Setup
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payout Account Status — Connect active */}
                    {hasConnectAccount && connectStatus?.onboardingComplete && (() => {
                        const isPastDue      = (connectStatus.pastDueCount ?? 0) > 0;
                        const isCurrentlyDue = (connectStatus.currentlyDueCount ?? 0) > 0;
                        const hasUpcoming    = connectStatus.hasUpcomingRequirements;
                        const deadlineDate   = connectStatus.currentDeadline
                            ? new Date(connectStatus.currentDeadline * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                            : null;
                        const futureDateStr  = connectStatus.futureDeadline
                            ? new Date(connectStatus.futureDeadline * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                            : null;

                        if (isPastDue) return (
                            <div className="bg-red-50  rounded-xl border border-red-300  p-5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-red-100  flex items-center justify-center text-red-600 "><MdWarning className="text-2xl" /></div>
                                        <div>
                                            <p className="text-sm font-bold text-red-700 ">Refund Account Restricted</p>
                                            <p className="text-xs text-red-600/80  mt-0.5">Your refund account has been restricted. Complete the required information to restore it.</p>
                                        </div>
                                    </div>
                                    <Link href="/customer/payout-setup" className="shrink-0 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors text-center">Restore Account</Link>
                                </div>
                            </div>
                        );

                        if (isCurrentlyDue) return (
                            <div className="bg-amber-50  rounded-xl border border-amber-300  p-5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-amber-100  flex items-center justify-center text-amber-600 "><MdSchedule className="text-2xl" /></div>
                                        <div>
                                            <p className="text-sm font-bold text-text-main ">Action Required — Refund Account</p>
                                            <p className="text-xs text-text-muted  mt-0.5">
                                                {deadlineDate ? `Stripe requires updated information by ${deadlineDate} or your refunds will be paused.` : "Stripe requires updated information to keep your refund account active."}
                                            </p>
                                        </div>
                                    </div>
                                    <Link href="/customer/payout-setup" className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors text-center">Complete Now</Link>
                                </div>
                            </div>
                        );

                        if (hasUpcoming) return (
                            <div className="bg-blue-50  rounded-xl border border-blue-200  p-5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-100  flex items-center justify-center text-blue-600 "><MdInfo className="text-2xl" /></div>
                                        <div>
                                            <p className="text-sm font-bold text-text-main ">Payout Account</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                <span className="text-xs text-emerald-600  font-semibold">Active</span>
                                                <span className="text-xs text-blue-600  font-medium">— {futureDateStr ? `info required by ${futureDateStr}` : "upcoming requirements"}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Link href="/customer/payout-setup" className="shrink-0 text-blue-600  border border-blue-300  hover:bg-blue-50  px-4 py-2 rounded-lg text-xs font-bold transition-colors text-center">Review</Link>
                                </div>
                            </div>
                        );

                        return (
                            <div className="bg-card-light  rounded-xl border border-emerald-200  p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-100  flex items-center justify-center text-emerald-600 "><MdAccountBalance className="text-2xl" /></div>
                                        <div>
                                            <p className="text-sm font-bold text-text-main ">Payout Account</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                <span className="text-xs text-emerald-600  font-semibold">Active</span>
                                            </div>
                                        </div>
                                    </div>
                                    {hasPendingRefunds && <p className="text-sm text-text-muted ">{formatCurrency(summary.pendingRefundAmount)} pending</p>}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Connect account submitted but not yet complete */}
                    {hasConnectAccount && connectStatus?.detailsSubmitted && !connectStatus?.onboardingComplete && (() => {
                        const isPastDue      = (connectStatus.pastDueCount ?? 0) > 0;
                        const isCurrentlyDue = (connectStatus.currentlyDueCount ?? 0) > 0;
                        const deadlineDate   = connectStatus.currentDeadline
                            ? new Date(connectStatus.currentDeadline * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                            : null;

                        if (isPastDue) return (
                            <div className="bg-red-50  rounded-xl border border-red-300  p-5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-red-100  flex items-center justify-center text-red-600 "><MdWarning className="text-2xl" /></div>
                                        <div>
                                            <p className="text-sm font-bold text-red-700 ">Refund Account Restricted</p>
                                            <p className="text-xs text-red-600/80  mt-0.5">Your refund account requires overdue information. Complete it now to restore your ability to receive refunds.</p>
                                        </div>
                                    </div>
                                    <Link href="/customer/payout-setup" className="shrink-0 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors text-center">Restore Account</Link>
                                </div>
                            </div>
                        );

                        if (isCurrentlyDue) return (
                            <div className="bg-amber-50  rounded-xl border border-amber-300  p-5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-amber-100  flex items-center justify-center text-amber-600 "><MdSchedule className="text-2xl" /></div>
                                        <div>
                                            <p className="text-sm font-bold text-text-main ">Action Required — Refund Account</p>
                                            <p className="text-xs text-text-muted  mt-0.5">
                                                {deadlineDate ? `Complete required information by ${deadlineDate} to keep your refund account active.` : "Stripe requires updated information to keep your refund account active."}
                                            </p>
                                        </div>
                                    </div>
                                    <Link href="/customer/payout-setup" className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors text-center">Complete Now</Link>
                                </div>
                            </div>
                        );

                        return (
                            <div className="bg-card-light  rounded-xl border border-amber-200  p-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-amber-100  flex items-center justify-center text-amber-600 "><MdSchedule className="text-2xl" /></div>
                                    <div>
                                        <p className="text-sm font-bold text-text-main ">Payout Account Under Review</p>
                                        <p className="text-xs text-text-muted  mt-0.5">Your details have been submitted. Stripe is verifying your account — this usually takes a few minutes.</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Payment History */}
                    <div className="bg-card-light  rounded-xl border border-border-light  overflow-hidden shadow-sm">

                        {/* Filter tabs with counts */}
                        <div className="px-5 pt-5 pb-4 border-b border-border-light  flex items-center gap-2 flex-wrap">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => { setFilter(tab.key); setPage(1); }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                                        filter === tab.key
                                            ? "bg-primary text-white"
                                            : "text-text-muted  hover:bg-muted-light "
                                    }`}
                                >
                                    {tab.label}
                                    {!paymentsLoading && (
                                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                                            filter === tab.key
                                                ? "bg-white/20 text-white"
                                                : "bg-muted-light  text-text-muted "
                                        }`}>
                                            {tabCounts[tab.key]}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {paymentsLoading ? (
                            <div className="divide-y divide-border-light ">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="p-5 animate-pulse">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-full bg-muted-light  shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3.5 bg-muted-light  rounded w-1/3" />
                                                <div className="h-3 bg-muted-light  rounded w-1/4" />
                                            </div>
                                            <div className="h-6 bg-muted-light  rounded w-20" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : !payments || payments.length === 0 ? (
                            <div className="py-20 text-center">
                                <MdPayments className="text-5xl text-slate-200  mx-auto mb-3" />
                                <p className="text-text-muted  text-sm font-medium">No payment history yet</p>
                                <p className="text-xs text-text-muted/60  mt-1">Your payments will appear here once you book a therapist.</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="py-20 text-center">
                                <p className="text-text-muted  text-sm font-medium">No payments in this category.</p>
                                <button onClick={() => setFilter("all")} className="text-primary text-sm font-bold hover:underline mt-2">
                                    Show all payments
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="divide-y divide-border-light ">
                                    {paginated.map((payment) => {
                                        const effectiveStatus = getEffectiveStatus(payment);
                                        const config          = STATUS_CONFIG[effectiveStatus] || STATUS_CONFIG.escrowed;
                                        const isExpanded      = expandedId === payment.id;
                                        const therapist       = payment.booking?.therapist;
                                        const serviceType     = payment.booking?.offer?.request?.serviceType || payment.booking?.sessionType;
                                        const sessions        = payment.booking?.sessions || [];
                                        const sessionCount    = sessions.length;
                                        const confirmedCount  = sessions.filter(s => s.status === "confirmed_by_customer").length;
                                        const refundDisplay   = getRefundDisplay(payment.customerRefunds, payment.refundedAmount);

                                        return (
                                            <Fragment key={payment.id}>
                                                {/* Payment row */}
                                                <div
                                                    className={`p-5 cursor-pointer transition-colors hover:bg-primary/[0.03] ${isExpanded ? "bg-primary/[0.03]" : ""}`}
                                                    onClick={() => setExpandedId(isExpanded ? null : payment.id)}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        {/* Avatar */}
                                                        <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                                            {getInitials(therapist?.fullName)}
                                                        </div>

                                                        {/* Therapist + meta */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-text-main  truncate">
                                                                {therapist?.fullName || "—"}
                                                            </p>
                                                            <p className="text-xs text-text-muted  mt-0.5">
                                                                {[
                                                                    serviceType,
                                                                    sessionCount ? `${sessionCount} session${sessionCount > 1 ? "s" : ""}` : null,
                                                                    formatDate(payment.createdAt),
                                                                ].filter(Boolean).join(" · ")}
                                                            </p>
                                                        </div>

                                                        {/* Amount + status */}
                                                        <div className="text-right shrink-0">
                                                            <p className="text-lg font-black text-text-main ">{formatCurrency(payment.amount)}</p>
                                                            <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${config.color}`}>
                                                                {config.label}
                                                            </span>
                                                        </div>

                                                        {/* Expand toggle */}
                                                        <div className="shrink-0 ml-1">
                                                            {isExpanded
                                                                ? <MdExpandLess className="text-xl text-text-muted " />
                                                                : <MdExpandMore className="text-xl text-text-muted " />
                                                            }
                                                        </div>
                                                    </div>

                                                    {/* Refund line — visible without expanding */}
                                                    {refundDisplay && (
                                                        <div className="mt-2 ml-15 pl-[60px]">
                                                            <p className={`text-xs ${refundDisplay.color}`}>
                                                                {refundDisplay.label}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* View breakdown prompt */}
                                                    {!isExpanded && (
                                                        <div className="mt-2 pl-[60px]">
                                                            <span className="text-xs text-primary font-semibold">
                                                                View breakdown →
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Expanded detail */}
                                                {isExpanded && (
                                                    <div className="bg-muted-light  border-t border-border-light  px-5 py-5">
                                                        <div className="pl-[60px] grid grid-cols-1 md:grid-cols-3 gap-6">

                                                            {/* Session Progress */}
                                                            {sessions.length > 0 && (
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-text-muted  uppercase tracking-widest mb-3">Session Progress</p>
                                                                    <div className="flex justify-between text-xs text-text-main  mb-1.5">
                                                                        <span>{confirmedCount} of {sessions.length} completed</span>
                                                                        <span className="font-bold">{Math.round((confirmedCount / sessions.length) * 100)}%</span>
                                                                    </div>
                                                                    <div className="h-2 w-full bg-slate-200  rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-primary rounded-full transition-all"
                                                                            style={{ width: `${(confirmedCount / sessions.length) * 100}%` }}
                                                                        />
                                                                    </div>
                                                                    <p className="text-[10px] text-text-muted  mt-2">
                                                                        {sessions.length - confirmedCount} session{sessions.length - confirmedCount !== 1 ? "s" : ""} remaining
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {/* Financial Breakdown */}
                                                            <div>
                                                                <p className="text-[10px] font-bold text-text-muted  uppercase tracking-widest mb-3">Financial Breakdown</p>
                                                                {(() => {
                                                                    const total          = parseFloat(payment.amount);
                                                                    const feeRatio       = total > 0 ? parseFloat(payment.platformFee) / total : 0;
                                                                    const released       = parseFloat(payment.releasedAmount ?? 0);
                                                                    const grossReleased  = feeRatio < 1 ? parseFloat((released / (1 - feeRatio)).toFixed(2)) : released;
                                                                    const refunds        = payment.customerRefunds || [];
                                                                    const sumByStatus    = (status) => refunds.filter(r => r.status === status).reduce((s, r) => s + parseFloat(r.amount), 0);
                                                                    const pendingRefund  = sumByStatus("pending_connect");
                                                                    const transferredRefund = sumByStatus("transferred");
                                                                    const cardRefund     = sumByStatus("refunded_to_card");
                                                                    const legacyRefund   = refunds.length === 0 && payment.refundedAmount ? parseFloat(payment.refundedAmount) : 0;
                                                                    const totalRefunded  = pendingRefund + transferredRefund + cardRefund + legacyRefund;
                                                                    const effectiveReleased = effectiveStatus === "refunded" ? 0 : grossReleased;
                                                                    const remaining      = Math.max(0, parseFloat((total - effectiveReleased - totalRefunded).toFixed(2)));

                                                                    return (
                                                                        <div className="space-y-2 text-xs">
                                                                            <div className="flex justify-between font-bold text-text-main ">
                                                                                <span>Total Paid</span>
                                                                                <span>{formatCurrency(total)}</span>
                                                                            </div>
                                                                            {effectiveReleased > 0 && (
                                                                                <div className="flex justify-between text-text-muted ">
                                                                                    <span>Released to therapist</span>
                                                                                    <span>{formatCurrency(effectiveReleased)}</span>
                                                                                </div>
                                                                            )}
                                                                            {transferredRefund > 0 && (
                                                                                <div className="flex justify-between text-emerald-600 ">
                                                                                    <span>Returned to your account</span>
                                                                                    <span>{formatCurrency(transferredRefund)}</span>
                                                                                </div>
                                                                            )}
                                                                            {cardRefund > 0 && (
                                                                                <div className="flex justify-between text-emerald-600 ">
                                                                                    <span>Returned to card</span>
                                                                                    <span>{formatCurrency(cardRefund)}</span>
                                                                                </div>
                                                                            )}
                                                                            {pendingRefund > 0 && (
                                                                                <div className="flex justify-between text-amber-600 ">
                                                                                    <span>Refund pending</span>
                                                                                    <span>{formatCurrency(pendingRefund)}</span>
                                                                                </div>
                                                                            )}
                                                                            {legacyRefund > 0 && (
                                                                                <div className="flex justify-between text-emerald-600 ">
                                                                                    <span>Refunded</span>
                                                                                    <span>{formatCurrency(legacyRefund)}</span>
                                                                                </div>
                                                                            )}
                                                                            {remaining > 0 && (
                                                                                <div className="flex justify-between text-text-muted  pt-2 border-t border-border-light ">
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
                                                                <p className="text-[10px] font-bold text-text-muted  uppercase tracking-widest mb-3">Timeline</p>
                                                                <div className="space-y-3 relative before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-border-light ">
                                                                    <div className="relative pl-5">
                                                                        <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-primary" />
                                                                        <p className="text-xs font-medium text-text-main ">Payment received</p>
                                                                        <p className="text-[10px] text-text-muted ">{formatDate(payment.createdAt)}</p>
                                                                    </div>
                                                                    {payment.escrowedAt && (
                                                                        <div className="relative pl-5">
                                                                            <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-blue-500" />
                                                                            <p className="text-xs font-medium text-text-main ">Funds escrowed</p>
                                                                            <p className="text-[10px] text-text-muted ">{formatDate(payment.escrowedAt)}</p>
                                                                        </div>
                                                                    )}
                                                                    {payment.releasedAt && (
                                                                        <div className="relative pl-5">
                                                                            <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-emerald-500" />
                                                                            <p className="text-xs font-medium text-text-main ">Therapist paid</p>
                                                                            <p className="text-[10px] text-text-muted ">{formatDate(payment.releasedAt)}</p>
                                                                        </div>
                                                                    )}
                                                                    {(payment.customerRefunds || []).map((cr) => {
                                                                        if (cr.status === "pending_connect" && cr.reason) return (
                                                                            <div key={cr.id} className="relative pl-5">
                                                                                <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                                                                                <p className="text-xs text-red-600  font-semibold">Bank transfer failed ({formatCurrency(cr.amount)}) — update your bank account</p>
                                                                                <p className="text-[10px] text-text-muted ">{cr.reason}</p>
                                                                            </div>
                                                                        );
                                                                        if (cr.status === "pending_connect") return (
                                                                            <div key={cr.id} className="relative pl-5">
                                                                                <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                                                                                <p className="text-xs text-text-main ">Refund pending ({formatCurrency(cr.amount)}) — awaiting payout setup</p>
                                                                                <p className="text-[10px] text-text-muted ">{formatDate(cr.createdAt)}</p>
                                                                            </div>
                                                                        );
                                                                        if (cr.status === "transferred") return (
                                                                            <div key={cr.id} className="relative pl-5">
                                                                                <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-emerald-500" />
                                                                                <p className="text-xs font-medium text-text-main ">Refund returned to your account ({formatCurrency(cr.amount)})</p>
                                                                                <p className="text-[10px] text-text-muted ">{formatDate(cr.transferredAt)}</p>
                                                                            </div>
                                                                        );
                                                                        if (cr.status === "refunded_to_card") return (
                                                                            <div key={cr.id} className="relative pl-5">
                                                                                <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-emerald-500" />
                                                                                <p className="text-xs font-medium text-text-main ">Refund returned to card ({formatCurrency(cr.amount)})</p>
                                                                                <p className="text-[10px] text-text-muted ">{formatDate(cr.fallbackRefundAt)}</p>
                                                                            </div>
                                                                        );
                                                                        return null;
                                                                    })}
                                                                    {!payment.customerRefunds?.[0] && payment.refundedAt && (
                                                                        <div className="relative pl-5">
                                                                            <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-amber-500" />
                                                                            <p className="text-xs font-medium text-text-main ">Refund issued</p>
                                                                            <p className="text-[10px] text-text-muted ">{formatDate(payment.refundedAt)}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Fragment>
                                        );
                                    })}
                                </div>

                                {/* Pagination */}
                                {filtered.length > ROWS_PER_PAGE && (
                                    <div className="px-5 py-3 bg-muted-light  border-t border-border-light  flex justify-between items-center">
                                        <p className="text-xs text-text-muted ">
                                            Showing{" "}
                                            <span className="font-bold text-text-main ">
                                                {(safePage - 1) * ROWS_PER_PAGE + 1}–{Math.min(safePage * ROWS_PER_PAGE, filtered.length)}
                                            </span>{" "}
                                            of{" "}
                                            <span className="font-bold text-text-main ">{filtered.length}</span>
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                                disabled={safePage <= 1}
                                                className="p-1.5 rounded-lg bg-card-light  border border-border-light  hover:bg-muted-light  transition-colors disabled:opacity-40"
                                                aria-label="Previous page"
                                            >
                                                <MdChevronLeft className="text-base" />
                                            </button>
                                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                                const pageNum = totalPages <= 5
                                                    ? i + 1
                                                    : safePage <= 3
                                                        ? i + 1
                                                        : safePage >= totalPages - 2
                                                            ? totalPages - 4 + i
                                                            : safePage - 2 + i;
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setPage(pageNum)}
                                                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${safePage === pageNum ? "bg-primary text-white" : "text-text-muted  hover:bg-muted-light "}`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                            <button
                                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                                disabled={safePage >= totalPages}
                                                className="p-1.5 rounded-lg bg-card-light  border border-border-light  hover:bg-muted-light  transition-colors disabled:opacity-40"
                                                aria-label="Next page"
                                            >
                                                <MdChevronRight className="text-base" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Escrow info note */}
                    {payments?.some(p => ["escrowed", "partially_released"].includes(p.status)) && (
                        <div className="flex items-start gap-3 bg-blue-50  border border-blue-200  rounded-xl p-4">
                            <MdInfo className="text-blue-500 text-lg shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-700  leading-relaxed">
                                Payments marked &quot;In Escrow&quot; are held securely until you confirm session completion. Funds are released to the therapist after each confirmed session.
                            </p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

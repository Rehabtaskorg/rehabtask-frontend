"use client";

import { useState, useMemo, useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
    MdAttachMoney,
    MdAccountBalanceWallet,
    MdTrendingUp,
    MdReceipt,
    MdClose,
    MdCheckCircle,
    MdSearch,
    MdSwapVert,
} from "react-icons/md";
import {
    useAdminPaymentStats,
    useAdminPayments,
    useReleaseAdminPayment,
    useRefundAdminPayment,
} from "@/hooks/useAdmin";

const fmt$ = (v) =>
    v == null
        ? "—"
        : Number(v).toLocaleString("en-US", { style: "currency", currency: "USD" });

const fmtDate = (d) =>
    d
        ? new Date(d).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
        : "—";

const PAYMENT_STATUS_STYLES = {
    intent_created: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    escrowed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    partially_released: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    released: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    refunded: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    failed: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300",
};

const BOOKING_STATUS_STYLES = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const SORT_OPTIONS = [
    { value: "createdAt", label: "Date Created" },
    { value: "amount", label: "Amount" },
];

const STATUS_LABELS = {
    intent_created: "Pending",
    escrowed: "Escrowed",
    partially_released: "Partial Release",
    released: "Released",
    refunded: "Refunded",
    failed: "Failed",
    accepted: "Accepted",
    confirmed: "Confirmed",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
};

function StatusBadge({ value, styleMap }) {
    const cls =
        styleMap?.[value] ??
        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}
        >
            {STATUS_LABELS[value] || value?.replace(/_/g, " ") || "—"}
        </span>
    );
}

function Skeleton({ className = "" }) {
    return (
        <div
            className={`animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${className}`}
        />
    );
}

function StatCard({ icon: Icon, label, value, loading, color = "text-primary" }) {
    return (
        <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-4">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs text-text-muted">{label}</p>
                    {loading ? (
                        <Skeleton className="h-7 w-24 mt-1" />
                    ) : (
                        <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
                    )}
                </div>
                <div className={`p-2 rounded-lg bg-primary/10 ${color}`}>
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );
}

function PaymentSidePanel({ payment, onClose }) {
    const [showRefundForm, setShowRefundForm] = useState(false);
    const [refundReason, setRefundReason] = useState("");
    const [releaseAmount, setReleaseAmount] = useState("");

    const releaseMutation = useReleaseAdminPayment();
    const refundMutation = useRefundAdminPayment();

    const maxPayout = payment ? parseFloat(payment.therapistPayout ?? 0) : 0;

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShowRefundForm(false);
        setRefundReason("");
        setReleaseAmount("");
    }, [payment?.id]);

    if (!payment) return null;

    const bookingStatus = payment.booking?.status;
    const isBookingFinalized = ["finalized", "cancelled"].includes(bookingStatus);
    const effectiveStatus = (isBookingFinalized && payment.status === "escrowed") ? "refunded" : payment.status;

    const isReleasable = effectiveStatus === "escrowed" && !isBookingFinalized;
    const isPartiallyReleased = payment.status === "partially_released";
    const isRefundable = ["escrowed", "intent_created"].includes(payment.status) && !isBookingFinalized;

    const sessions = payment.booking?.sessions || [];
    const missedOrCancelled = sessions.filter(s => ["missed", "cancelled", "attempted"].includes(s.status)).length;
    const totalSessions = sessions.length || 1;
    const deliverable = Math.max(0, totalSessions - missedOrCancelled);
    const adjustedMaxPayout = totalSessions > 1 && missedOrCancelled > 0
        ? parseFloat(((maxPayout / totalSessions) * deliverable).toFixed(2))
        : maxPayout;

    const alreadyReleased = parseFloat(payment.releasedAmount ?? 0);
    const remainderAmount = isPartiallyReleased ? parseFloat((adjustedMaxPayout - alreadyReleased).toFixed(2)) : 0;

    const parsedReleaseAmount = parseFloat(releaseAmount);
    const releaseAmountValid =
        releaseAmount === "" ||
        (!isNaN(parsedReleaseAmount) && parsedReleaseAmount >= 0.01 && parsedReleaseAmount <= maxPayout);
    const releaseAmountToSend = releaseAmount !== "" && !isNaN(parsedReleaseAmount)
        ? parsedReleaseAmount
        : null;
    const isPartial = releaseAmountToSend !== null && releaseAmountToSend < maxPayout;

    const handleRelease = async () => {
        if (!releaseAmountValid) return;
        try {
            await releaseMutation.mutateAsync({ id: payment.id, amount: releaseAmountToSend });
        } catch { }
    };

    const handleReleaseRemainder = async () => {
        try {
            await releaseMutation.mutateAsync({ id: payment.id, remainder: true });
        } catch { }
    };

    const handleRefund = async () => {
        if (refundReason.trim().length < 5) return;
        try {
            await refundMutation.mutateAsync({
                paymentId: payment.id,
                reason: refundReason.trim(),
            });
            setShowRefundForm(false);
            setRefundReason("");
        } catch { }
    };

    return (
        <>
            {/* Mobile backdrop */}
            <div
                className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                onClick={onClose}
            />

            <aside className="fixed right-0 top-14 lg:top-0 h-[calc(100dvh-3.5rem)] lg:h-dvh max-w-95 w-full bg-card-light dark:bg-card-dark border-l border-border-light dark:border-border-dark z-40 lg:z-20 flex flex-col shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border-light dark:border-border-dark shrink-0">
                    <h2 className="font-semibold text-text-main dark:text-white text-sm">
                        Payment Detail
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-background-light dark:hover:bg-background-dark text-text-muted"
                    >
                        <MdClose size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto panel-scroll p-4 space-y-4">
                    {/* Amount & Status */}
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-2xl font-bold text-text-main dark:text-white">
                                {fmt$(payment.amount)}
                            </p>
                            <p className="text-xs text-text-muted mt-0.5">Total charged</p>
                        </div>
                        <StatusBadge
                            value={effectiveStatus}
                            styleMap={PAYMENT_STATUS_STYLES}
                        />
                    </div>

                    {/* Fee breakdown */}
                    <div className="bg-background-light dark:bg-background-dark rounded-lg p-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-text-muted">Platform Fee</span>
                            <span className="text-text-main dark:text-white font-medium">
                                {fmt$(payment.platformFee)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-muted">Therapist Payout</span>
                            <span className="text-text-main dark:text-white font-medium">
                                {fmt$(isBookingFinalized && payment.status === "escrowed" ? 0 : adjustedMaxPayout)}
                            </span>
                        </div>
                        {payment.stripePaymentIntentId && (
                            <div className="pt-2 border-t border-border-light dark:border-border-dark">
                                <p className="text-text-muted text-xs">Stripe ID</p>
                                <p className="text-text-main dark:text-white font-mono text-xs truncate">
                                    {payment.stripePaymentIntentId}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Customer */}
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                            Customer
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                                {payment.customer?.fullName?.[0] ?? "?"}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-text-main dark:text-white">
                                    {payment.customer?.fullName ?? "—"}
                                </p>
                                <p className="text-xs text-text-muted">
                                    {payment.customer?.user?.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Therapist */}
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                            Therapist
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 flex items-center justify-center text-xs font-semibold shrink-0">
                                {payment.therapist?.fullName?.[0] ?? "?"}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-text-main dark:text-white">
                                    {payment.therapist?.fullName ?? "—"}
                                </p>
                                <p className="text-xs text-text-muted">
                                    {payment.therapist?.user?.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Booking */}
                    {payment.booking && (
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                                Booking
                            </p>
                            <div className="bg-background-light dark:bg-background-dark rounded-lg p-3 space-y-1.5 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-text-muted">Date</span>
                                    <span className="text-text-main dark:text-white">
                                        {fmtDate(payment.booking.scheduledDate)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-text-muted">Booking Status</span>
                                    <StatusBadge
                                        value={payment.booking.status}
                                        styleMap={BOOKING_STATUS_STYLES}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Multi-session breakdown */}
                    {payment.booking?.sessions?.length > 1 && (
                        <div className="border border-border-light dark:border-border-dark rounded-xl overflow-hidden">
                            <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                                <p className="text-[10px] font-bold text-text-main dark:text-white uppercase tracking-wider">
                                    Sessions
                                </p>
                                <p className="text-[10px] font-semibold text-text-muted dark:text-slate-400">
                                    {payment.booking.sessions.filter(s => s.status === "confirmed_by_customer").length}/{payment.booking.sessions.length} confirmed
                                </p>
                            </div>
                            <div className="divide-y divide-border-light dark:divide-border-dark">
                                {payment.booking.sessions.map((s) => {
                                    const statusColors = {
                                        pending_schedule: "text-slate-400",
                                        scheduled: "text-blue-500",
                                        completed_by_therapist: "text-amber-500",
                                        confirmed_by_customer: "text-emerald-500",
                                        cancelled: "text-red-500",
                                    };
                                    return (
                                        <div key={s.id} className="px-3 py-2 flex items-center justify-between">
                                            <span className="text-xs font-medium text-text-main dark:text-white">
                                                Session {s.sessionNumber}
                                            </span>
                                            <span className={`text-[10px] font-bold uppercase ${statusColors[s.status] || "text-slate-400"}`}>
                                                {s.status?.replace(/_/g, " ")}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-text-muted">
                        Created: {fmtDate(payment.createdAt)}
                    </p>

                    {/* Partial release amount input */}
                    {isReleasable && !showRefundForm && (
                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-text-muted">
                                Release Amount{" "}
                                <span className="font-normal">(leave blank for full {fmt$(maxPayout)})</span>
                            </label>
                            <input
                                type="number"
                                value={releaseAmount}
                                onChange={(e) => setReleaseAmount(e.target.value)}
                                placeholder={`Max ${maxPayout.toFixed(2)}`}
                                min="0.01"
                                max={maxPayout}
                                step="0.01"
                                className={`w-full rounded-lg border px-3 py-2 text-sm bg-background-light dark:bg-background-dark text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary ${!releaseAmountValid
                                    ? "border-red-400 dark:border-red-600"
                                    : "border-border-light dark:border-border-dark"
                                    }`}
                            />
                            {!releaseAmountValid && (
                                <p className="text-xs text-red-500">
                                    Amount must be between $0.01 and {fmt$(maxPayout)}.
                                </p>
                            )}
                            {isPartial && releaseAmountValid && (
                                <p className="text-xs text-amber-600 dark:text-amber-400">
                                    Partial release: {fmt$(releaseAmountToSend)} of {fmt$(maxPayout)} will be sent to the therapist.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Refund form */}
                    {showRefundForm && (
                        <div className="border border-red-200 dark:border-red-800 rounded-lg p-3 space-y-2">
                            <p className="text-sm font-medium text-red-700 dark:text-red-400">
                                Reason for Refund
                            </p>
                            <textarea
                                value={refundReason}
                                onChange={(e) => setRefundReason(e.target.value)}
                                rows={3}
                                placeholder="Explain why this payment is being refunded…"
                                className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleRefund}
                                    disabled={
                                        refundReason.trim().length < 5 ||
                                        refundMutation.isPending
                                    }
                                    className="flex-1 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50"
                                >
                                    {refundMutation.isPending
                                        ? "Processing…"
                                        : "Confirm Refund"}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowRefundForm(false);
                                        setRefundReason("");
                                    }}
                                    className="px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark text-text-muted text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-border-light dark:border-border-dark shrink-0 space-y-2">
                    {isReleasable && !showRefundForm && (
                        <button
                            onClick={handleRelease}
                            disabled={releaseMutation.isPending || !releaseAmountValid}
                            className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <MdCheckCircle size={16} />
                            {releaseMutation.isPending
                                ? "Releasing…"
                                : isPartial
                                    ? `Partial Release (${fmt$(releaseAmountToSend)})`
                                    : "Release Full Payment"}
                        </button>
                    )}
                    {isPartiallyReleased && (
                        <div className="space-y-2">
                            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                                <p className="text-xs font-medium text-orange-800 dark:text-orange-300">
                                    Partially released: {fmt$(alreadyReleased)} of {fmt$(adjustedMaxPayout)}
                                    {missedOrCancelled > 0 && ` (${missedOrCancelled} missed/cancelled excluded)`}
                                </p>
                                <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                                    Remaining: {fmt$(remainderAmount)}
                                </p>
                            </div>
                            <button
                                onClick={handleReleaseRemainder}
                                disabled={releaseMutation.isPending}
                                className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <MdCheckCircle size={16} />
                                {releaseMutation.isPending ? "Releasing…" : `Release Remainder (${fmt$(remainderAmount)})`}
                            </button>
                        </div>
                    )}
                    {isRefundable && !showRefundForm && (
                        <button
                            onClick={() => setShowRefundForm(true)}
                            className="w-full py-2 rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium"
                        >
                            Issue Refund
                        </button>
                    )}
                </div>
            </aside>
        </>
    );
}

const STATUS_TABS = [
    { key: "all", label: "All" },
    { key: "intent_created", label: "Pending" },
    { key: "escrowed", label: "Escrowed" },
    { key: "partially_released", label: "Partial" },
    { key: "released", label: "Released" },
    { key: "refunded", label: "Refunded" },
];

export default function AdminPaymentsPage() {
    usePageTitle("Payments");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedPayment, setSelectedPayment] = useState(null);

    // Search & filter state
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const commitSearch = () => setSearch(searchInput.trim());

    const hasFilters = search || startDate || endDate || sortBy !== "createdAt" || sortOrder !== "desc";

    const clearFilters = () => {
        setSearchInput("");
        setSearch("");
        setSortBy("createdAt");
        setSortOrder("desc");
        setStartDate("");
        setEndDate("");
        setSelectedPayment(null);
    };

    const params = useMemo(() => {
        const p = {};
        if (statusFilter !== "all") p.status = statusFilter;
        if (search) p.search = search;
        if (sortBy) p.sortBy = sortBy;
        if (sortOrder) p.sortOrder = sortOrder;
        if (startDate) p.startDate = startDate;
        if (endDate) p.endDate = endDate;
        return p;
    }, [statusFilter, search, sortBy, sortOrder, startDate, endDate]);

    const { data: statsData, isLoading: statsLoading } = useAdminPaymentStats();
    const { data: paymentsData, isLoading: paymentsLoading } = useAdminPayments(params);

    const stats = statsData ?? {};
    const payments = paymentsData?.payments ?? [];

    const panelOpen = !!selectedPayment;

    return (
        <div
            className={`flex-1 transition-all duration-300 ${panelOpen ? "lg:mr-95" : ""}`}
        >
            <div className="p-4 lg:p-6 space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-xl font-bold text-text-main dark:text-white">
                        Payments
                    </h1>
                    <p className="text-sm text-text-muted mt-0.5">
                        Monitor transactions and manage payouts
                    </p>
                </div>

                <>
                    {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                icon={MdAttachMoney}
                                label="Total Volume"
                                value={fmt$(stats.totalVolume)}
                                loading={statsLoading}
                            />
                            <StatCard
                                icon={MdTrendingUp}
                                label="Platform Revenue"
                                value={fmt$(stats.platformRevenue)}
                                loading={statsLoading}
                                color="text-green-600"
                            />
                            <StatCard
                                icon={MdAccountBalanceWallet}
                                label="Escrowed Funds"
                                value={fmt$(stats.escrowedFunds)}
                                loading={statsLoading}
                                color="text-purple-600"
                            />
                            <StatCard
                                icon={MdReceipt}
                                label="Total Refunded"
                                value={fmt$(stats.totalRefunded)}
                                loading={statsLoading}
                                color="text-orange-600"
                            />
                        </div>

                        {/* Status filter tabs */}
                        <div className="flex gap-1 bg-background-light dark:bg-background-dark rounded-xl p-1 border border-border-light dark:border-border-dark w-fit overflow-x-auto">
                            {STATUS_TABS.map((t) => (
                                <button
                                    key={t.key}
                                    onClick={() => {
                                        setStatusFilter(t.key);
                                        setSelectedPayment(null);
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === t.key
                                        ? "bg-card-light dark:bg-card-dark text-text-main dark:text-white shadow-sm"
                                        : "text-text-muted hover:text-text-main dark:hover:text-white"
                                        }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* Search & Sort Filters */}
                        <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-3 space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {/* Search */}
                                <div className="relative flex-1 min-w-44">
                                    <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                    <input
                                        type="text"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        onBlur={commitSearch}
                                        onKeyDown={(e) => e.key === "Enter" && commitSearch()}
                                        placeholder="Search customer or therapist…"
                                        className="w-full pl-8 pr-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                {/* Sort by */}
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {SORT_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                {/* Sort order toggle */}
                                <button
                                    onClick={() => setSortOrder((o) => o === "asc" ? "desc" : "asc")}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-muted hover:text-text-main dark:hover:text-white text-sm"
                                    title={sortOrder === "asc" ? "Ascending" : "Descending"}
                                >
                                    <MdSwapVert size={16} />
                                    {sortOrder === "asc" ? "Asc" : "Desc"}
                                </button>
                                {/* Date range */}
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                {hasFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="px-3 py-2 rounded-lg border border-border-light dark:border-border-dark text-text-muted hover:text-text-main dark:hover:text-white text-sm"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Payments Table */}
                        <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
                                            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Customer</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Therapist</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Amount</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted hidden md:table-cell">Platform Fee</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted hidden lg:table-cell">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                        {paymentsLoading ? (
                                            [...Array(6)].map((_, i) => (
                                                <tr key={i}>
                                                    {[...Array(6)].map((_, j) => (
                                                        <td key={j} className="px-4 py-3">
                                                            <Skeleton className="h-4 w-full" />
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))
                                        ) : payments.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-10 text-center text-sm text-text-muted">
                                                    No payments found.
                                                </td>
                                            </tr>
                                        ) : (
                                            payments.map((p) => (
                                                <tr
                                                    key={p.id}
                                                    onClick={() =>
                                                        setSelectedPayment(
                                                            selectedPayment?.id === p.id ? null : p
                                                        )
                                                    }
                                                    className={`cursor-pointer transition-colors hover:bg-background-light dark:hover:bg-background-dark ${selectedPayment?.id === p.id
                                                        ? "bg-primary/5 dark:bg-primary/10"
                                                        : ""
                                                        }`}
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                                                                {p.customer?.fullName?.[0] ?? "?"}
                                                            </div>
                                                            <span className="text-text-main dark:text-white font-medium truncate max-w-22.5">
                                                                {p.customer?.fullName ?? "—"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-text-main dark:text-white truncate max-w-22.5">
                                                        {p.therapist?.fullName ?? "—"}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-text-main dark:text-white">
                                                        {fmt$(p.amount)}
                                                    </td>
                                                    <td className="px-4 py-3 text-text-muted hidden md:table-cell">
                                                        {fmt$(p.platformFee)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <StatusBadge
                                                            value={p.status}
                                                            styleMap={PAYMENT_STATUS_STYLES}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-text-muted hidden lg:table-cell">
                                                        {fmtDate(p.createdAt)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
            </div>

            {/* Side panel */}
            {panelOpen && (
                <PaymentSidePanel
                    payment={selectedPayment}
                    onClose={() => setSelectedPayment(null)}
                />
            )}
        </div>
    );
}

"use client";

import { useState, useMemo, useEffect } from "react";
import {
    MdAttachMoney,
    MdAccountBalanceWallet,
    MdTrendingUp,
    MdReceipt,
    MdClose,
    MdCheckCircle,
    MdHistory,
    MdPercent,
    MdWarning,
} from "react-icons/md";
import {
    useAdminPaymentStats,
    useAdminPayments,
    useReleaseAdminPayment,
    useRefundAdminPayment,
    useAdminCommission,
    useAdminCommissionHistory,
    useSetCommissionRate,
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

const fmtPct = (v) =>
    v == null ? "—" : `${(Number(v) * 100).toFixed(1)}%`;

const PAYMENT_STATUS_STYLES = {
    intent_created: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    escrowed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
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

function StatusBadge({ value, styleMap }) {
    const cls =
        styleMap?.[value] ??
        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}
        >
            {value ?? "—"}
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

    const releaseMutation = useReleaseAdminPayment();
    const refundMutation = useRefundAdminPayment();

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShowRefundForm(false);
        setRefundReason("");
    }, [payment?.id]);

    if (!payment) return null;

    const isReleasable = payment.status === "escrowed";
    const isRefundable = payment.status !== "refunded";

    const handleRelease = async () => {
        try {
            await releaseMutation.mutateAsync(payment.id);
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
                            value={payment.status}
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
                                {fmt$(payment.therapistPayout)}
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

                    <p className="text-xs text-text-muted">
                        Created: {fmtDate(payment.createdAt)}
                    </p>

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
                            disabled={releaseMutation.isPending}
                            className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <MdCheckCircle size={16} />
                            {releaseMutation.isPending
                                ? "Releasing…"
                                : "Release Payment"}
                        </button>
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

function CommissionTab() {
    const { data: commData, isLoading: commLoading } = useAdminCommission();
    const { data: histData, isLoading: histLoading } = useAdminCommissionHistory();
    const setRateMutation = useSetCommissionRate();

    const [newRate, setNewRate] = useState("");
    const [effectiveFrom, setEffectiveFrom] = useState("");
    const [formError, setFormError] = useState("");

    const currentRate = commData;
    const history = histData?.configs ?? [];

    const handleSetRate = async (e) => {
        e.preventDefault();
        setFormError("");
        const parsed = parseFloat(newRate);
        if (isNaN(parsed) || parsed < 0 || parsed > 100) {
            setFormError("Enter a valid percentage between 0 and 100.");
            return;
        }
        try {
            await setRateMutation.mutateAsync({
                rate: parsed / 100,
                ...(effectiveFrom
                    ? { effectiveFrom: new Date(effectiveFrom).toISOString() }
                    : {}),
            });
            setNewRate("");
            setEffectiveFrom("");
        } catch (err) {
            setFormError(
                err?.response?.data?.message ?? "Failed to update rate."
            );
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Current Rate */}
            <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                        <MdPercent size={22} />
                    </div>
                    <div>
                        <p className="text-xs text-text-muted">Current Commission Rate</p>
                        {commLoading ? (
                            <Skeleton className="h-9 w-24 mt-1" />
                        ) : (
                            <p className="text-3xl font-bold text-text-main dark:text-white">
                                {fmtPct(currentRate?.rate)}
                            </p>
                        )}
                    </div>
                </div>
                {!commLoading && currentRate && (
                    <div className="text-xs text-text-muted space-y-0.5 ml-0.5">
                        <p>Effective: {fmtDate(currentRate.effectiveFrom)}</p>
                        {currentRate.createdByAdmin && (
                            <p>Set by: {currentRate.createdByAdmin.email}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Update Rate Form */}
            <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6">
                <h3 className="font-semibold text-text-main dark:text-white mb-4">
                    Update Commission Rate
                </h3>
                <form onSubmit={handleSetRate} className="space-y-4">
                    <div>
                        <label className="block text-sm text-text-muted mb-1">
                            New Rate (%)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={newRate}
                                onChange={(e) => setNewRate(e.target.value)}
                                placeholder="e.g. 15"
                                min="0"
                                max="100"
                                step="0.1"
                                className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
                                %
                            </span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-text-muted mb-1">
                            Effective From{" "}
                            <span className="text-text-muted font-normal">(optional)</span>
                        </label>
                        <input
                            type="date"
                            value={effectiveFrom}
                            onChange={(e) => setEffectiveFrom(e.target.value)}
                            className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <p className="text-xs text-text-muted mt-1">
                            Leave blank to take effect immediately.
                        </p>
                    </div>
                    {formError && (
                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                            <MdWarning size={16} />
                            {formError}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={!newRate || setRateMutation.isPending}
                        className="w-full py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-medium disabled:opacity-50"
                    >
                        {setRateMutation.isPending ? "Saving…" : "Save New Rate"}
                    </button>
                </form>
            </div>

            {/* Rate History */}
            <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
                <div className="px-4 py-3 border-b border-border-light dark:border-border-dark flex items-center gap-2">
                    <MdHistory size={18} className="text-text-muted" />
                    <h3 className="font-semibold text-text-main dark:text-white text-sm">Rate History</h3>
                </div>
                {histLoading ? (
                    <div className="p-4 space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full" />
                        ))}
                    </div>
                ) : history.length === 0 ? (
                    <p className="p-8 text-center text-sm text-text-muted">
                        No rate history yet.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-text-muted">
                                        Rate
                                    </th>
                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-text-muted">
                                        Effective From
                                    </th>
                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-text-muted">
                                        Set By
                                    </th>
                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-text-muted">
                                        Created
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                {history.map((h) => (
                                    <tr
                                        key={h.id}
                                        className="hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                                    >
                                        <td className="px-4 py-3 font-semibold text-text-main dark:text-white">
                                            {fmtPct(h.rate)}
                                        </td>
                                        <td className="px-4 py-3 text-text-muted">
                                            {fmtDate(h.effectiveFrom)}
                                        </td>
                                        <td className="px-4 py-3 text-text-muted">
                                            {h.createdByAdmin?.email ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 text-text-muted">
                                            {fmtDate(h.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

const STATUS_TABS = [
    { key: "all", label: "All" },
    { key: "intent_created", label: "Pending" },
    { key: "escrowed", label: "Escrowed" },
    { key: "released", label: "Released" },
    { key: "refunded", label: "Refunded" },
];

export default function AdminPaymentsPage() {
    const [activeTab, setActiveTab] = useState("payments");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedPayment, setSelectedPayment] = useState(null);

    const params = useMemo(() => {
        const p = {};
        if (statusFilter !== "all") p.status = statusFilter;
        return p;
    }, [statusFilter]);

    const { data: statsData, isLoading: statsLoading } = useAdminPaymentStats();
    const { data: paymentsData, isLoading: paymentsLoading } = useAdminPayments(params);

    const stats    = statsData ?? {};
    const payments = paymentsData?.payments ?? [];

    const panelOpen = selectedPayment && activeTab === "payments";

    return (
        <div
            className={`flex-1 transition-all duration-300 ${panelOpen ? "lg:mr-95" : ""}`}
        >
            <div className="p-4 lg:p-6 space-y-6">
                {/* Page Header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-text-main dark:text-white">
                            Payments & Commission
                        </h1>
                        <p className="text-sm text-text-muted mt-0.5">
                            Monitor transactions and platform commission
                        </p>
                    </div>
                    {/* Tab switcher */}
                    <div className="flex bg-background-light dark:bg-background-dark rounded-lg p-1 border border-border-light dark:border-border-dark">
                        {[
                            { key: "payments", label: "Payments" },
                            { key: "commission", label: "Commission" },
                        ].map((t) => (
                            <button
                                key={t.key}
                                onClick={() => {
                                    setActiveTab(t.key);
                                    if (t.key !== "payments") setSelectedPayment(null);
                                }}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === t.key
                                    ? "bg-card-light dark:bg-card-dark text-text-main dark:text-white shadow-sm"
                                    : "text-text-muted hover:text-text-main dark:hover:text-white"
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === "payments" ? (
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

                        {/* Payments Table */}
                        <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
                                            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">
                                                Customer
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">
                                                Therapist
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">
                                                Amount
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted hidden md:table-cell">
                                                Platform Fee
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-text-muted hidden lg:table-cell">
                                                Date
                                            </th>
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
                                                <td
                                                    colSpan={6}
                                                    className="px-4 py-10 text-center text-sm text-text-muted"
                                                >
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
                ) : (
                    <CommissionTab />
                )}
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

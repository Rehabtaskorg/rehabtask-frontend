'use client';

import { useState, useMemo } from 'react';
import {
    MdCardMembership, MdClose, MdChevronLeft, MdChevronRight,
    MdCheckCircle, MdWarning, MdPerson, MdTrendingUp,
} from 'react-icons/md';
import {
    useAdminSubscriptions,
    useAdminSubscriptionStats,
    useCancelAdminSubscription,
} from '@/hooks/useAdmin';

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const fmt$ = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(v) || 0);

const SUB_STATUS_STYLES = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    cancelled: 'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
    expired: 'bg-slate-100  text-slate-600  dark:bg-slate-700     dark:text-slate-300',
    past_due: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    trialing: 'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
};

const PLAN_STYLES = {
    basic: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    premium: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

function StatusBadge({ status, styleMap }) {
    return (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap ${styleMap?.[status] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
            {status?.replace(/_/g, ' ') || '—'}
        </span>
    );
}

function Skeleton({ className }) {
    return <div className={`animate-pulse rounded bg-slate-200 dark:bg-slate-700 ${className}`} />;
}

function StatCard({ icon: Icon, label, value, iconBg, loading }) {
    return (
        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5">
            <div className={`p-2.5 rounded-xl ${iconBg} w-fit mb-3`}>
                <Icon className="text-xl text-white" />
            </div>
            {loading ? (
                <>
                    <Skeleton className="h-7 w-16 mb-1" />
                    <Skeleton className="h-3.5 w-28" />
                </>
            ) : (
                <>
                    <p className="text-2xl font-bold text-text-main dark:text-white">{value ?? '—'}</p>
                    <p className="text-sm text-text-muted dark:text-slate-400 mt-0.5">{label}</p>
                </>
            )}
        </div>
    );
}


function SubscriptionSidePanel({ subscription, onClose, onCancel, loading, error, success }) {
    const [confirmCancel, setConfirmCancel] = useState(false);

    const isActive = subscription.status === 'active' || subscription.status === 'trialing';

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-light dark:border-border-dark shrink-0">
                <h3 className="font-semibold text-text-main dark:text-white text-sm">Subscription Details</h3>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                    <MdClose className="text-xl" />
                </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto panel-scroll p-5 space-y-5">
                {/* Status + plan */}
                <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={subscription.status} styleMap={SUB_STATUS_STYLES} />
                    <StatusBadge status={subscription.planType} styleMap={PLAN_STYLES} />
                </div>

                {/* Feedback */}
                {error && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                        <MdWarning className="shrink-0 text-base" /> {error}
                    </div>
                )}
                {success && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm">
                        <MdCheckCircle className="shrink-0 text-base" /> {success}
                    </div>
                )}

                {/* Details */}
                <dl className="space-y-3 text-sm">
                    <div className="flex justify-between gap-3">
                        <dt className="text-text-muted dark:text-slate-400 flex items-center gap-1">
                            <MdPerson className="text-sm" /> Customer
                        </dt>
                        <dd className="font-medium text-text-main dark:text-white text-right">
                            {subscription.customer?.fullName || '—'}
                        </dd>
                    </div>

                    {subscription.customer?.user?.email && (
                        <div className="flex justify-between gap-3">
                            <dt className="text-text-muted dark:text-slate-400">Email</dt>
                            <dd className="text-text-main dark:text-white text-right truncate max-w-45">
                                {subscription.customer.user.email}
                            </dd>
                        </div>
                    )}

                    <div className="flex justify-between gap-3">
                        <dt className="text-text-muted dark:text-slate-400">Plan</dt>
                        <dd className="font-medium text-text-main dark:text-white capitalize">
                            {subscription.planType}
                        </dd>
                    </div>

                    {subscription.amount && (
                        <div className="flex justify-between gap-3">
                            <dt className="text-text-muted dark:text-slate-400">Amount</dt>
                            <dd className="font-semibold text-text-main dark:text-white">
                                {fmt$(subscription.amount)}
                            </dd>
                        </div>
                    )}

                    <div className="flex justify-between gap-3">
                        <dt className="text-text-muted dark:text-slate-400">Started</dt>
                        <dd className="font-medium text-text-main dark:text-white">
                            {fmtDate(subscription.startDate)}
                        </dd>
                    </div>

                    {subscription.endDate && (
                        <div className="flex justify-between gap-3">
                            <dt className="text-text-muted dark:text-slate-400">
                                {subscription.status === 'active' ? 'Renews' : 'Ended'}
                            </dt>
                            <dd className="font-medium text-text-main dark:text-white">
                                {fmtDate(subscription.endDate)}
                            </dd>
                        </div>
                    )}

                    {subscription.stripeSubscriptionId && (
                        <div className="flex justify-between gap-3">
                            <dt className="text-text-muted dark:text-slate-400">Stripe ID</dt>
                            <dd className="font-mono text-xs text-text-muted dark:text-slate-400 text-right truncate max-w-40">
                                {subscription.stripeSubscriptionId}
                            </dd>
                        </div>
                    )}
                </dl>

                {/* Cancel section */}
                {isActive && !success && (
                    <div className="border border-border-light dark:border-border-dark rounded-xl overflow-hidden">
                        <button
                            onClick={() => setConfirmCancel(v => !v)}
                            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                            Cancel Subscription
                            <span className="text-text-muted text-xs">{confirmCancel ? '▲' : '▼'}</span>
                        </button>

                        {confirmCancel && (
                            <div className="px-4 pb-4 space-y-3 border-t border-border-light dark:border-border-dark pt-3">
                                <p className="text-xs text-text-muted dark:text-slate-400">
                                    This will cancel the subscription immediately in Stripe and update the status. This action cannot be undone.
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onCancel(subscription.id)}
                                        disabled={loading}
                                        className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                                    >
                                        {loading ? 'Cancelling…' : 'Confirm Cancellation'}
                                    </button>
                                    <button
                                        onClick={() => setConfirmCancel(false)}
                                        disabled={loading}
                                        className="px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark text-sm text-text-main dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Back
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AdminSubscriptionsPage() {
    const [statusFilter, setStatusFilter] = useState('');
    const [planFilter, setPlanFilter] = useState('');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(null);
    const [actionError, setActionError] = useState('');
    const [actionSuccess, setActionSuccess] = useState('');

    const params = {
        ...(statusFilter && { status: statusFilter }),
        ...(planFilter && { planType: planFilter }),
        page,
        limit: 20,
    };

    const { data: statsData, isLoading: statsLoading } = useAdminSubscriptionStats();
    const { data, isLoading, error } = useAdminSubscriptions(params);
    const cancelSub = useCancelAdminSubscription();

    const subscriptions = data?.subscriptions ?? [];
    const pagination = data?.pagination;
    const mutating = cancelSub.isPending;

    // Compute stats from groupBy response
    const stats = useMemo(() => {
        if (!statsData?.stats) return { total: 0, basic: 0, premium: 0 };
        const active = statsData.stats.filter(s => s.status === 'active');
        return {
            total: active.reduce((sum, s) => sum + (s._count?.id ?? 0), 0),
            basic: active.filter(s => s.planType === 'basic').reduce((sum, s) => sum + (s._count?.id ?? 0), 0),
            premium: active.filter(s => s.planType === 'premium').reduce((sum, s) => sum + (s._count?.id ?? 0), 0),
        };
    }, [statsData]);

    const handleCancel = async (id) => {
        setActionError(''); setActionSuccess('');
        try {
            await cancelSub.mutateAsync(id);
            setActionSuccess('Subscription cancelled successfully.');
            setSelected(prev => prev?.id === id ? { ...prev, status: 'cancelled' } : prev);
        } catch (e) {
            setActionError(e?.response?.data?.message || 'Failed to cancel subscription.');
        }
    };

    const resetFilters = () => {
        setStatusFilter('');
        setPlanFilter('');
        setPage(1);
        setSelected(null);
        setActionError('');
        setActionSuccess('');
    };

    return (
        <div className="flex min-h-screen relative">

            {/* ── Main content ── */}
            <div className={`flex-1 min-w-0 p-4 md:p-6 transition-all duration-300 ${selected ? 'lg:mr-95' : ''}`}>

                {/* Header */}
                <div className="mb-5">
                    <h1 className="text-xl md:text-2xl font-bold text-text-main dark:text-white">Subscriptions</h1>
                    <p className="text-text-muted dark:text-slate-400 text-sm mt-0.5">
                        {pagination ? `${pagination.total.toLocaleString()} total` : 'Manage customer subscriptions'}
                    </p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
                    <StatCard
                        icon={MdCardMembership}
                        label="Active Subscriptions"
                        value={stats.total}
                        iconBg="bg-emerald-500"
                        loading={statsLoading}
                    />
                    <StatCard
                        icon={MdTrendingUp}
                        label="Basic Plan"
                        value={stats.basic}
                        iconBg="bg-slate-500"
                        loading={statsLoading}
                    />
                    <StatCard
                        icon={MdTrendingUp}
                        label="Premium Plan"
                        value={stats.premium}
                        iconBg="bg-purple-500"
                        loading={statsLoading}
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-5">
                    <select
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); setSelected(null); }}
                        className="px-3 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="trialing">Trialing</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="expired">Expired</option>
                        <option value="past_due">Past Due</option>
                    </select>

                    <select
                        value={planFilter}
                        onChange={e => { setPlanFilter(e.target.value); setPage(1); setSelected(null); }}
                        className="px-3 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                        <option value="">All Plans</option>
                        <option value="basic">Basic</option>
                        <option value="premium">Premium</option>
                    </select>

                    {(statusFilter || planFilter) && (
                        <button
                            onClick={resetFilters}
                            className="px-3 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark text-text-muted dark:text-slate-400 hover:text-text-main dark:hover:text-white hover:border-primary/40 transition-colors"
                        >
                            Clear filters
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl overflow-hidden">
                    {isLoading ? (
                        <div className="p-5 space-y-3">
                            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16" />)}
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center text-sm text-red-500">
                            Failed to load subscriptions. Please refresh.
                        </div>
                    ) : !subscriptions.length ? (
                        <div className="p-12 text-center">
                            <MdCardMembership className="text-4xl text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                            <p className="text-sm text-text-muted dark:text-slate-400">No subscriptions found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800/50">
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide">Customer</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide">Plan</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide">Status</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide hidden md:table-cell">Started</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide hidden lg:table-cell">Renews / Ends</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                        {subscriptions.map(sub => (
                                            <tr
                                                key={sub.id}
                                                onClick={() => {
                                                    setSelected(prev => prev?.id === sub.id ? null : sub);
                                                    setActionError(''); setActionSuccess('');
                                                }}
                                                className={`cursor-pointer transition-colors
                                                    ${selected?.id === sub.id
                                                        ? 'bg-primary/5 dark:bg-primary/10'
                                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
                                            >
                                                <td className="px-5 py-3.5">
                                                    <p className="font-medium text-text-main dark:text-white">
                                                        {sub.customer?.fullName || '—'}
                                                    </p>
                                                    <p className="text-xs text-text-muted dark:text-slate-400 hidden sm:block">
                                                        {sub.customer?.user?.email}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <StatusBadge status={sub.planType} styleMap={PLAN_STYLES} />
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <StatusBadge status={sub.status} styleMap={SUB_STATUS_STYLES} />
                                                </td>
                                                <td className="px-5 py-3.5 text-text-muted dark:text-slate-400 hidden md:table-cell">
                                                    {fmtDate(sub.startDate)}
                                                </td>
                                                <td className="px-5 py-3.5 text-text-muted dark:text-slate-400 hidden lg:table-cell">
                                                    {fmtDate(sub.endDate)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination && pagination.pages > 1 && (
                                <div className="flex items-center justify-between px-5 py-4 border-t border-border-light dark:border-border-dark">
                                    <p className="text-sm text-text-muted dark:text-slate-400">
                                        {(page - 1) * pagination.limit + 1}–{Math.min(page * pagination.limit, pagination.total)} of {pagination.total.toLocaleString()}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setPage(p => p - 1)}
                                            disabled={page === 1}
                                            className="p-1.5 rounded-lg border border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <MdChevronLeft className="text-xl text-slate-600 dark:text-slate-300" />
                                        </button>
                                        <span className="text-sm font-medium text-text-main dark:text-white min-w-15 text-center">
                                            {page} / {pagination.pages}
                                        </span>
                                        <button
                                            onClick={() => setPage(p => p + 1)}
                                            disabled={page === pagination.pages}
                                            className="p-1.5 rounded-lg border border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <MdChevronRight className="text-xl text-slate-600 dark:text-slate-300" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ── Side Panel ── */}
            {selected && (
                <>
                    <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSelected(null)} />
                    <div className="fixed right-0 top-14 lg:top-0 h-[calc(100dvh-3.5rem)] lg:h-dvh w-full max-w-95 bg-card-light dark:bg-card-dark border-l border-border-light dark:border-border-dark z-40 lg:z-20 shadow-xl flex flex-col overflow-hidden">
                        <SubscriptionSidePanel
                            subscription={selected}
                            onClose={() => { setSelected(null); setActionError(''); setActionSuccess(''); }}
                            onCancel={handleCancel}
                            loading={mutating}
                            error={actionError}
                            success={actionSuccess}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

'use client';

import { useState, useMemo } from 'react';
import { usePageTitle } from "@/hooks/usePageTitle";
import {
    MdCardMembership, MdClose, MdChevronLeft, MdChevronRight,
    MdCheckCircle, MdWarning, MdPerson, MdTrendingUp, MdSearch,
    MdSwapVert, MdFilterList, MdWorkspacePremium,
} from 'react-icons/md';
import {
    useAdminSubscriptions,
    useAdminSubscriptionStats,
    useCancelAdminSubscription,
    useAdminTherapists,
    useAdminTherapistPlanStats,
    useUpdateTherapistPlan,
    useAdminTierRates,
} from '@/hooks/useAdmin';

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

// DB enum values: active | inactive | cancelled | past_due
const SUB_STATUS_STYLES = {
    active:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    inactive:  'bg-slate-100  text-slate-600  dark:bg-slate-700     dark:text-slate-300',
    cancelled: 'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
    past_due:  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

const PLAN_STYLES = {
    free:     'bg-slate-100  text-slate-700  dark:bg-slate-700    dark:text-slate-300',
    standard: 'bg-blue-100   text-blue-700   dark:bg-blue-900/30  dark:text-blue-400',
    premium:  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const TIER_STYLES = {
    basic: 'bg-slate-100  text-slate-700  dark:bg-slate-700    dark:text-slate-300',
    pro:   'bg-blue-100   text-blue-700   dark:bg-blue-900/30  dark:text-blue-400',
    elite: 'bg-amber-100  text-amber-700  dark:bg-amber-900/30 dark:text-amber-400',
};

const TIER_META = {
    basic: { label: 'Basic', price: 'Free' },
    pro:   { label: 'Pro',   price: '$19/mo' },
    elite: { label: 'Elite', price: '$39/mo' },
};

const getTierCommission = (tierRates, tier) => {
    const found = tierRates?.find(t => t.tier === tier);
    return found ? `${(found.rate * 100).toFixed(1)}%` : '—';
};

const APPROVAL_STYLES = {
    approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    review:   'bg-amber-100   text-amber-700   dark:bg-amber-900/30   dark:text-amber-400',
    pending:  'bg-blue-100    text-blue-700    dark:bg-blue-900/30    dark:text-blue-400',
    rejected: 'bg-red-100     text-red-700     dark:bg-red-900/30     dark:text-red-400',
};

const SORT_OPTIONS = [
    { value: 'createdAt',          label: 'Date Created' },
    { value: 'currentPeriodStart', label: 'Period Start' },
    { value: 'currentPeriodEnd',   label: 'Period End' },
];

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

/* ─────────────────────────────────────────────────────────
   Customer Subscriptions Side Panel
   ───────────────────────────────────────────────────────── */
function SubscriptionSidePanel({ subscription, onClose, onCancel, loading, error, success }) {
    const [confirmCancel, setConfirmCancel] = useState(false);
    const isActive = subscription.status === 'active';

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-light dark:border-border-dark shrink-0">
                <h3 className="font-semibold text-text-main dark:text-white text-sm">Subscription Details</h3>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <MdClose className="text-xl" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto panel-scroll p-5 space-y-5">
                <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={subscription.status} styleMap={SUB_STATUS_STYLES} />
                    <StatusBadge status={subscription.planType} styleMap={PLAN_STYLES} />
                </div>
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
                <dl className="space-y-3 text-sm">
                    <div className="flex justify-between gap-3">
                        <dt className="text-text-muted dark:text-slate-400 flex items-center gap-1"><MdPerson className="text-sm" /> Customer</dt>
                        <dd className="font-medium text-text-main dark:text-white text-right">{subscription.customer?.fullName || '—'}</dd>
                    </div>
                    {subscription.customer?.user?.email && (
                        <div className="flex justify-between gap-3">
                            <dt className="text-text-muted dark:text-slate-400">Email</dt>
                            <dd className="text-text-main dark:text-white text-right truncate max-w-45">{subscription.customer.user.email}</dd>
                        </div>
                    )}
                    <div className="flex justify-between gap-3">
                        <dt className="text-text-muted dark:text-slate-400">Plan</dt>
                        <dd className="font-medium text-text-main dark:text-white capitalize">{subscription.planType}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                        <dt className="text-text-muted dark:text-slate-400">Therapist Limit</dt>
                        <dd className="font-medium text-text-main dark:text-white">{subscription.therapistLimit ?? '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                        <dt className="text-text-muted dark:text-slate-400">Request Limit</dt>
                        <dd className="font-medium text-text-main dark:text-white">{subscription.requestLimit ?? '—'}</dd>
                    </div>
                    {subscription.currentPeriodStart && (
                        <div className="flex justify-between gap-3">
                            <dt className="text-text-muted dark:text-slate-400">Started</dt>
                            <dd className="font-medium text-text-main dark:text-white">{fmtDate(subscription.currentPeriodStart)}</dd>
                        </div>
                    )}
                    {subscription.currentPeriodEnd && (
                        <div className="flex justify-between gap-3">
                            <dt className="text-text-muted dark:text-slate-400">{isActive ? 'Renews' : 'Ended'}</dt>
                            <dd className="font-medium text-text-main dark:text-white">{fmtDate(subscription.currentPeriodEnd)}</dd>
                        </div>
                    )}
                    <div className="flex justify-between gap-3">
                        <dt className="text-text-muted dark:text-slate-400">Created</dt>
                        <dd className="font-medium text-text-main dark:text-white">{fmtDate(subscription.createdAt)}</dd>
                    </div>
                    {subscription.stripeSubscriptionId && (
                        <div className="flex justify-between gap-3">
                            <dt className="text-text-muted dark:text-slate-400">Stripe ID</dt>
                            <dd className="font-mono text-xs text-text-muted dark:text-slate-400 text-right truncate max-w-40">{subscription.stripeSubscriptionId}</dd>
                        </div>
                    )}
                </dl>
                {isActive && !success && (
                    <div className="border border-border-light dark:border-border-dark rounded-xl overflow-hidden">
                        <button onClick={() => setConfirmCancel(v => !v)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                            Cancel Subscription
                            <span className="text-text-muted text-xs">{confirmCancel ? '▲' : '▼'}</span>
                        </button>
                        {confirmCancel && (
                            <div className="px-4 pb-4 space-y-3 border-t border-border-light dark:border-border-dark pt-3">
                                <p className="text-xs text-text-muted dark:text-slate-400">This will cancel the subscription immediately in Stripe and update the status. This action cannot be undone.</p>
                                <div className="flex gap-2">
                                    <button onClick={() => onCancel(subscription.id)} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
                                        {loading ? 'Cancelling\u2026' : 'Confirm Cancellation'}
                                    </button>
                                    <button onClick={() => setConfirmCancel(false)} disabled={loading} className="px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark text-sm text-text-main dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
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

/* ─────────────────────────────────────────────────────────
   Therapist Plans Side Panel
   ───────────────────────────────────────────────────────── */
function TherapistPlanSidePanel({ therapist, onClose, onUpdatePlan, loading, error, success, tierRates }) {
    const [confirmTier, setConfirmTier] = useState(null);
    const profile = therapist.therapistProfile;
    const currentTier = profile?.planTier || 'basic';

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-light dark:border-border-dark shrink-0">
                <h3 className="font-semibold text-text-main dark:text-white text-sm">Therapist Plan Details</h3>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <MdClose className="text-xl" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto panel-scroll p-5 space-y-5">
                <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={currentTier} styleMap={TIER_STYLES} />
                    <StatusBadge status={profile?.approvalStatus} styleMap={APPROVAL_STYLES} />
                </div>

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

                <dl className="space-y-3 text-sm">
                    <div className="flex justify-between gap-3">
                        <dt className="text-text-muted dark:text-slate-400 flex items-center gap-1"><MdPerson className="text-sm" /> Therapist</dt>
                        <dd className="font-medium text-text-main dark:text-white text-right">{profile?.fullName || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                        <dt className="text-text-muted dark:text-slate-400">Email</dt>
                        <dd className="text-text-main dark:text-white text-right truncate max-w-45">{therapist.email}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                        <dt className="text-text-muted dark:text-slate-400">Current Tier</dt>
                        <dd className="font-medium text-text-main dark:text-white capitalize">{TIER_META[currentTier]?.label}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                        <dt className="text-text-muted dark:text-slate-400">Commission Rate</dt>
                        <dd className="font-medium text-text-main dark:text-white">{getTierCommission(tierRates, currentTier)}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                        <dt className="text-text-muted dark:text-slate-400">License Type</dt>
                        <dd className="font-medium text-text-main dark:text-white">{profile?.primaryLicenseType || '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                        <dt className="text-text-muted dark:text-slate-400">Joined</dt>
                        <dd className="font-medium text-text-main dark:text-white">{fmtDate(therapist.createdAt)}</dd>
                    </div>
                </dl>

                {/* Change Plan Tier */}
                {profile?.approvalStatus === 'approved' && !success && (
                    <div className="space-y-3">
                        <p className="text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide">Change Plan Tier</p>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.entries(TIER_META).map(([tier, meta]) => (
                                <button
                                    key={tier}
                                    onClick={() => tier !== currentTier ? setConfirmTier(tier) : null}
                                    disabled={tier === currentTier || loading}
                                    className={`py-2.5 px-2 rounded-xl text-sm font-medium transition-colors border ${
                                        tier === currentTier
                                            ? 'bg-primary/10 border-primary text-primary dark:bg-primary/20 dark:text-blue-300'
                                            : 'border-border-light dark:border-border-dark text-text-main dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-primary/40'
                                    } disabled:opacity-50`}
                                >
                                    <span className="block">{meta.label}</span>
                                    <span className="block text-xs text-text-muted dark:text-slate-400 mt-0.5">{getTierCommission(tierRates, tier)}</span>
                                </button>
                            ))}
                        </div>

                        {/* Confirmation */}
                        {confirmTier && (
                            <div className="border border-border-light dark:border-border-dark rounded-xl p-4 space-y-3">
                                <p className="text-sm text-text-main dark:text-white">
                                    Change <span className="font-semibold">{profile?.fullName}</span> from{' '}
                                    <span className="font-semibold capitalize">{TIER_META[currentTier]?.label}</span> to{' '}
                                    <span className="font-semibold capitalize">{TIER_META[confirmTier]?.label}</span>?
                                </p>
                                <p className="text-xs text-text-muted dark:text-slate-400">
                                    Commission rate will change from {getTierCommission(tierRates, currentTier)} to {getTierCommission(tierRates, confirmTier)} for future transactions.
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { onUpdatePlan(therapist.id, confirmTier); setConfirmTier(null); }}
                                        disabled={loading}
                                        className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                                    >
                                        {loading ? 'Updating\u2026' : 'Confirm Change'}
                                    </button>
                                    <button
                                        onClick={() => setConfirmTier(null)}
                                        disabled={loading}
                                        className="px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark text-sm text-text-main dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Cancel
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

/* ─────────────────────────────────────────────────────────
   Customer Subscriptions Tab
   ───────────────────────────────────────────────────────── */
function CustomerSubscriptionsTab() {
    const [statusFilter, setStatusFilter] = useState('');
    const [planFilter, setPlanFilter] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(null);
    const [actionError, setActionError] = useState('');
    const [actionSuccess, setActionSuccess] = useState('');

    const params = {
        ...(statusFilter && { status: statusFilter }),
        ...(planFilter && { planType: planFilter }),
        ...(search && { search }),
        sortBy, sortOrder,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        page, limit: 20,
    };

    const { data: statsData, isLoading: statsLoading } = useAdminSubscriptionStats();
    const { data, isLoading, error } = useAdminSubscriptions(params);
    const cancelSub = useCancelAdminSubscription();

    const subscriptions = data?.subscriptions ?? [];
    const pagination = data?.pagination;
    const mutating = cancelSub.isPending;

    const stats = useMemo(() => {
        if (!statsData) return { total: 0, active: 0, free: 0, standard: 0, premium: 0 };
        return {
            total: statsData.total ?? 0,
            active: statsData.active ?? 0,
            free: statsData.byPlan?.free ?? 0,
            standard: statsData.byPlan?.standard ?? 0,
            premium: statsData.byPlan?.premium ?? 0,
        };
    }, [statsData]);

    const hasActiveFilters = statusFilter || planFilter || search || startDate || endDate || sortBy !== 'createdAt' || sortOrder !== 'desc';

    const commitSearch = (val) => { setSearch(val.trim()); setPage(1); setSelected(null); };

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
        setStatusFilter(''); setPlanFilter(''); setSearch(''); setSearchInput('');
        setSortBy('createdAt'); setSortOrder('desc'); setStartDate(''); setEndDate('');
        setPage(1); setSelected(null); setActionError(''); setActionSuccess('');
    };

    const inputCls = 'px-3 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary';

    return (
        <div className="flex min-h-0 relative">
            <div className={`flex-1 min-w-0 transition-all duration-300 ${selected ? 'lg:mr-95' : ''}`}>
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
                    <StatCard icon={MdCardMembership} label="Total" value={stats.total} iconBg="bg-primary" loading={statsLoading} />
                    <StatCard icon={MdCheckCircle} label="Active" value={stats.active} iconBg="bg-emerald-500" loading={statsLoading} />
                    <StatCard icon={MdTrendingUp} label="Free Plan" value={stats.free} iconBg="bg-slate-500" loading={statsLoading} />
                    <StatCard icon={MdTrendingUp} label="Standard Plan" value={stats.standard} iconBg="bg-blue-500" loading={statsLoading} />
                    <StatCard icon={MdTrendingUp} label="Premium Plan" value={stats.premium} iconBg="bg-purple-500" loading={statsLoading} />
                </div>

                {/* Filters */}
                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-4 mb-5 space-y-3">
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="relative flex-1 min-w-48">
                            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-slate-400 text-lg pointer-events-none" />
                            <input type="text" placeholder="Search customer name or email\u2026" value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') commitSearch(e.target.value); }}
                                onBlur={e => commitSearch(e.target.value)}
                                className={`${inputCls} pl-9 w-full`} />
                        </div>
                        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); setSelected(null); }} className={inputCls}>
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="past_due">Past Due</option>
                        </select>
                        <select value={planFilter} onChange={e => { setPlanFilter(e.target.value); setPage(1); setSelected(null); }} className={inputCls}>
                            <option value="">All Plans</option>
                            <option value="free">Free</option>
                            <option value="standard">Standard</option>
                            <option value="premium">Premium</option>
                        </select>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex items-center gap-2">
                            <MdSwapVert className="text-text-muted dark:text-slate-400 text-lg shrink-0" />
                            <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }} className={inputCls}>
                                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            <button onClick={() => { setSortOrder(o => o === 'desc' ? 'asc' : 'desc'); setPage(1); }}
                                title={sortOrder === 'desc' ? 'Descending' : 'Ascending'}
                                className={`${inputCls} font-mono text-xs min-w-16`}>
                                {sortOrder === 'desc' ? '\u2193 Desc' : '\u2191 Asc'}
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <MdFilterList className="text-text-muted dark:text-slate-400 text-lg shrink-0" />
                            <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1); setSelected(null); }} title="Created from" className={inputCls} />
                            <span className="text-text-muted dark:text-slate-400 text-sm shrink-0">to</span>
                            <input type="date" value={endDate} min={startDate || undefined} onChange={e => { setEndDate(e.target.value); setPage(1); setSelected(null); }} title="Created until" className={inputCls} />
                        </div>
                        {hasActiveFilters && (
                            <button onClick={resetFilters} className="px-3 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark text-text-muted dark:text-slate-400 hover:text-text-main dark:hover:text-white hover:border-primary/40 transition-colors">
                                Clear all
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl overflow-hidden">
                    {isLoading ? (
                        <div className="p-5 space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
                    ) : error ? (
                        <div className="p-12 text-center text-sm text-red-500">Failed to load subscriptions. Please refresh.</div>
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
                                            <tr key={sub.id}
                                                onClick={() => { setSelected(prev => prev?.id === sub.id ? null : sub); setActionError(''); setActionSuccess(''); }}
                                                className={`cursor-pointer transition-colors ${selected?.id === sub.id ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}>
                                                <td className="px-5 py-3.5">
                                                    <p className="font-medium text-text-main dark:text-white">{sub.customer?.fullName || '—'}</p>
                                                    <p className="text-xs text-text-muted dark:text-slate-400 hidden sm:block">{sub.customer?.user?.email}</p>
                                                </td>
                                                <td className="px-5 py-3.5"><StatusBadge status={sub.planType} styleMap={PLAN_STYLES} /></td>
                                                <td className="px-5 py-3.5"><StatusBadge status={sub.status} styleMap={SUB_STATUS_STYLES} /></td>
                                                <td className="px-5 py-3.5 text-text-muted dark:text-slate-400 hidden md:table-cell">{fmtDate(sub.currentPeriodStart)}</td>
                                                <td className="px-5 py-3.5 text-text-muted dark:text-slate-400 hidden lg:table-cell">{fmtDate(sub.currentPeriodEnd)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {pagination && pagination.totalPages > 1 && (
                                <div className="flex items-center justify-between px-5 py-4 border-t border-border-light dark:border-border-dark">
                                    <p className="text-sm text-text-muted dark:text-slate-400">
                                        {(page - 1) * pagination.limit + 1}–{Math.min(page * pagination.limit, pagination.total)} of {pagination.total.toLocaleString()}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="p-1.5 rounded-lg border border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed">
                                            <MdChevronLeft className="text-xl text-slate-600 dark:text-slate-300" />
                                        </button>
                                        <span className="text-sm font-medium text-text-main dark:text-white min-w-15 text-center">{page} / {pagination.totalPages}</span>
                                        <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.totalPages} className="p-1.5 rounded-lg border border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed">
                                            <MdChevronRight className="text-xl text-slate-600 dark:text-slate-300" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Side Panel */}
            {selected && (
                <>
                    <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSelected(null)} />
                    <div className="fixed right-0 top-14 lg:top-0 h-[calc(100dvh-3.5rem)] lg:h-dvh w-full max-w-95 bg-card-light dark:bg-card-dark border-l border-border-light dark:border-border-dark z-40 lg:z-20 shadow-xl flex flex-col overflow-hidden">
                        <SubscriptionSidePanel subscription={selected}
                            onClose={() => { setSelected(null); setActionError(''); setActionSuccess(''); }}
                            onCancel={handleCancel} loading={mutating} error={actionError} success={actionSuccess} />
                    </div>
                </>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   Therapist Plans Tab
   ───────────────────────────────────────────────────────── */
function TherapistPlansTab() {
    const [tierFilter, setTierFilter] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(null);
    const [actionError, setActionError] = useState('');
    const [actionSuccess, setActionSuccess] = useState('');

    const params = {
        ...(tierFilter && { planTier: tierFilter }),
        ...(search && { search }),
        approvalStatus: 'approved',
        page, limit: 20,
    };

    const { data: planStats, isLoading: statsLoading } = useAdminTherapistPlanStats();
    const { data: tierRates } = useAdminTierRates();
    const { data, isLoading, error } = useAdminTherapists(params);
    const updatePlan = useUpdateTherapistPlan();

    const therapists = data?.therapists ?? [];
    const pagination = data?.pagination;

    const commitSearch = (val) => { setSearch(val.trim()); setPage(1); setSelected(null); };

    const handleUpdatePlan = async (therapistUserId, planTier) => {
        setActionError(''); setActionSuccess('');
        try {
            await updatePlan.mutateAsync({ therapistUserId, planTier });
            setActionSuccess(`Plan updated to ${TIER_META[planTier]?.label} successfully.`);
            setSelected(prev => {
                if (!prev || prev.id !== therapistUserId) return prev;
                return { ...prev, therapistProfile: { ...prev.therapistProfile, planTier } };
            });
        } catch (e) {
            setActionError(e?.response?.data?.message || 'Failed to update plan tier.');
        }
    };

    const hasActiveFilters = tierFilter || search;

    const resetFilters = () => {
        setTierFilter(''); setSearch(''); setSearchInput('');
        setPage(1); setSelected(null); setActionError(''); setActionSuccess('');
    };

    const inputCls = 'px-3 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary';

    return (
        <div className="flex min-h-0 relative">
            <div className={`flex-1 min-w-0 transition-all duration-300 ${selected ? 'lg:mr-95' : ''}`}>
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                    <StatCard icon={MdWorkspacePremium} label="Total Approved" value={planStats?.approved ?? 0} iconBg="bg-primary" loading={statsLoading} />
                    <StatCard icon={MdTrendingUp} label="Basic Tier" value={planStats?.byTier?.basic ?? 0} iconBg="bg-slate-500" loading={statsLoading} />
                    <StatCard icon={MdTrendingUp} label="Pro Tier" value={planStats?.byTier?.pro ?? 0} iconBg="bg-blue-500" loading={statsLoading} />
                    <StatCard icon={MdTrendingUp} label="Elite Tier" value={planStats?.byTier?.elite ?? 0} iconBg="bg-amber-500" loading={statsLoading} />
                </div>

                {/* Filters */}
                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-4 mb-5">
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="relative flex-1 min-w-48">
                            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-slate-400 text-lg pointer-events-none" />
                            <input type="text" placeholder="Search therapist name or email\u2026" value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') commitSearch(e.target.value); }}
                                onBlur={e => commitSearch(e.target.value)}
                                className={`${inputCls} pl-9 w-full`} />
                        </div>
                        <select value={tierFilter} onChange={e => { setTierFilter(e.target.value); setPage(1); setSelected(null); }} className={inputCls}>
                            <option value="">All Tiers</option>
                            <option value="basic">Basic</option>
                            <option value="pro">Pro</option>
                            <option value="elite">Elite</option>
                        </select>
                        {hasActiveFilters && (
                            <button onClick={resetFilters} className="px-3 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark text-text-muted dark:text-slate-400 hover:text-text-main dark:hover:text-white hover:border-primary/40 transition-colors">
                                Clear all
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl overflow-hidden">
                    {isLoading ? (
                        <div className="p-5 space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
                    ) : error ? (
                        <div className="p-12 text-center text-sm text-red-500">Failed to load therapists. Please refresh.</div>
                    ) : !therapists.length ? (
                        <div className="p-12 text-center">
                            <MdWorkspacePremium className="text-4xl text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                            <p className="text-sm text-text-muted dark:text-slate-400">No therapists found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800/50">
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide">Therapist</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide">Plan Tier</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide hidden md:table-cell">Commission</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide hidden md:table-cell">License</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide hidden lg:table-cell">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                        {therapists.map(t => {
                                            const tier = t.therapistProfile?.planTier || 'basic';
                                            return (
                                                <tr key={t.id}
                                                    onClick={() => { setSelected(prev => prev?.id === t.id ? null : t); setActionError(''); setActionSuccess(''); }}
                                                    className={`cursor-pointer transition-colors ${selected?.id === t.id ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}>
                                                    <td className="px-5 py-3.5">
                                                        <p className="font-medium text-text-main dark:text-white">{t.therapistProfile?.fullName || '—'}</p>
                                                        <p className="text-xs text-text-muted dark:text-slate-400 hidden sm:block">{t.email}</p>
                                                    </td>
                                                    <td className="px-5 py-3.5"><StatusBadge status={tier} styleMap={TIER_STYLES} /></td>
                                                    <td className="px-5 py-3.5 text-text-muted dark:text-slate-400 hidden md:table-cell">{getTierCommission(tierRates, tier)}</td>
                                                    <td className="px-5 py-3.5 text-text-muted dark:text-slate-400 hidden md:table-cell">{t.therapistProfile?.primaryLicenseType || '—'}</td>
                                                    <td className="px-5 py-3.5 text-text-muted dark:text-slate-400 hidden lg:table-cell">{fmtDate(t.createdAt)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            {pagination && pagination.totalPages > 1 && (
                                <div className="flex items-center justify-between px-5 py-4 border-t border-border-light dark:border-border-dark">
                                    <p className="text-sm text-text-muted dark:text-slate-400">
                                        {(page - 1) * pagination.limit + 1}–{Math.min(page * pagination.limit, pagination.total)} of {pagination.total.toLocaleString()}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="p-1.5 rounded-lg border border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed">
                                            <MdChevronLeft className="text-xl text-slate-600 dark:text-slate-300" />
                                        </button>
                                        <span className="text-sm font-medium text-text-main dark:text-white min-w-15 text-center">{page} / {pagination.totalPages}</span>
                                        <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.totalPages} className="p-1.5 rounded-lg border border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed">
                                            <MdChevronRight className="text-xl text-slate-600 dark:text-slate-300" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Side Panel */}
            {selected && (
                <>
                    <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSelected(null)} />
                    <div className="fixed right-0 top-14 lg:top-0 h-[calc(100dvh-3.5rem)] lg:h-dvh w-full max-w-95 bg-card-light dark:bg-card-dark border-l border-border-light dark:border-border-dark z-40 lg:z-20 shadow-xl flex flex-col overflow-hidden">
                        <TherapistPlanSidePanel therapist={selected}
                            onClose={() => { setSelected(null); setActionError(''); setActionSuccess(''); }}
                            onUpdatePlan={handleUpdatePlan} loading={updatePlan.isPending}
                            error={actionError} success={actionSuccess} tierRates={tierRates} />
                    </div>
                </>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   Main Page with Tabs
   ───────────────────────────────────────────────────────── */
const TABS = [
    { key: 'customers', label: 'Customer Subscriptions' },
    { key: 'therapists', label: 'Therapist Plans' },
];

export default function AdminSubscriptionsPage() {
    usePageTitle("Subscriptions");
    const [activeTab, setActiveTab] = useState('customers');

    return (
        <div className="p-4 md:p-6">
            {/* Header */}
            <div className="mb-5">
                <h1 className="text-xl md:text-2xl font-bold text-text-main dark:text-white">Subscriptions & Plans</h1>
                <p className="text-text-muted dark:text-slate-400 text-sm mt-0.5">
                    Manage customer subscriptions and therapist plan tiers
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-border-light dark:border-border-dark">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                            activeTab === tab.key
                                ? 'border-primary text-primary'
                                : 'border-transparent text-text-muted dark:text-slate-400 hover:text-text-main dark:hover:text-white'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'customers' && <CustomerSubscriptionsTab />}
            {activeTab === 'therapists' && <TherapistPlansTab />}
        </div>
    );
}

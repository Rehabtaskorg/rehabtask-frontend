'use client';

import { useState, useMemo } from 'react';
import { usePageTitle } from "@/hooks/usePageTitle";
import {
    MdCalendarMonth, MdClose, MdChevronLeft, MdChevronRight,
    MdCheckCircle, MdWarning, MdPerson, MdSearch, MdSwapVert,
    MdFilterList, MdSchedule, MdCancel, MdEventRepeat,
} from 'react-icons/md';
import {
    useAdminBookings,
    useAdminBookingStats,
    useCancelAdminBooking,
    useApproveBookingReschedule,
    useDenyBookingReschedule,
} from '@/hooks/useAdmin';

const fmt$ = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(v) || 0);

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const fmtDateTime = (d) =>
    d ? new Date(d).toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
        year: 'numeric', hour: '2-digit', minute: '2-digit',
    }) : '—';

// Full DB enum: pending | confirmed | in_progress | completed | cancelled | reschedule_requested
const BOOKING_STYLES = {
    pending:              'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400',
    confirmed:            'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
    in_progress:          'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    completed:            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    cancelled:            'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
    reschedule_requested: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

const PAYMENT_STYLES = {
    intent_created:      'bg-slate-100  text-slate-600  dark:bg-slate-700     dark:text-slate-300',
    escrowed:            'bg-cyan-100   text-cyan-700   dark:bg-cyan-900/30   dark:text-cyan-400',
    partially_released:  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    released:            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    refunded:            'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
    failed:              'bg-rose-100   text-rose-700   dark:bg-rose-900/30   dark:text-rose-400',
};

const SESSION_STYLES = {
    pending_schedule:       'bg-slate-100  text-slate-600  dark:bg-slate-700     dark:text-slate-300',
    scheduled:              'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
    completed_by_therapist: 'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400',
    confirmed_by_customer:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    cancelled:              'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
};

const SORT_OPTIONS = [
    { value: 'createdAt',    label: 'Date Created' },
    { value: 'scheduledDate', label: 'Scheduled Date' },
    { value: 'rate',         label: 'Rate' },
    { value: 'status',       label: 'Status' },
];

const TABS = [
    { value: '',                     label: 'All' },
    { value: 'pending',              label: 'Pending' },
    { value: 'confirmed',            label: 'Confirmed' },
    { value: 'reschedule_requested', label: 'Reschedule' },
    { value: 'in_progress',          label: 'In Progress' },
    { value: 'completed',            label: 'Completed' },
    { value: 'cancelled',            label: 'Cancelled' },
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
                    <Skeleton className="h-3.5 w-24" />
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

function BookingSidePanel({ booking, onClose, onCancel, onApproveReschedule, onDenyReschedule, loading, error, success }) {
    const [showCancelForm, setShowCancelForm] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [showDenyForm, setShowDenyForm] = useState(false);
    const [denyReason, setDenyReason] = useState('');
    const [confirmApproveReschedule, setConfirmApproveReschedule] = useState(false);

    const isCancellable = ['pending', 'confirmed', 'reschedule_requested'].includes(booking.status);
    const isRescheduleRequested = booking.status === 'reschedule_requested';

    const textareaCls = 'w-full px-3 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-text-main dark:text-white placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary/30';

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-light dark:border-border-dark shrink-0">
                <h3 className="font-semibold text-text-main dark:text-white text-sm">Booking Details</h3>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                    <MdClose className="text-xl" />
                </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto panel-scroll p-5 space-y-5">
                {/* Status + date */}
                <div className="flex items-center justify-between">
                    <StatusBadge status={booking.status} styleMap={BOOKING_STYLES} />
                    <span className="text-xs text-text-muted dark:text-slate-500">
                        Created {fmtDate(booking.createdAt)}
                    </span>
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
                            {booking.customer?.fullName || '—'}
                            {booking.customer?.customerType === 'agency' && (
                                <span className="block text-xs text-text-muted dark:text-slate-400 font-normal">
                                    {booking.customer.agencyName || 'Agency'}
                                </span>
                            )}
                        </dd>
                    </div>

                    {booking.patient && (
                        <div className="flex justify-between gap-3">
                            <dt className="text-text-muted dark:text-slate-400 flex items-center gap-1">
                                <MdPerson className="text-sm" /> Patient
                            </dt>
                            <dd className="text-right">
                                <p className="font-medium text-text-main dark:text-white">{booking.patient.fullName}</p>
                                {booking.patient.email && (
                                    <p className="text-xs text-text-muted dark:text-slate-400 font-normal">{booking.patient.email}</p>
                                )}
                                {booking.patient.phone && (
                                    <p className="text-xs text-text-muted dark:text-slate-400 font-normal">{booking.patient.phone}</p>
                                )}
                            </dd>
                        </div>
                    )}

                    <div className="flex justify-between gap-3">
                        <dt className="text-text-muted dark:text-slate-400 flex items-center gap-1">
                            <MdPerson className="text-sm" /> Therapist
                        </dt>
                        <dd className="font-medium text-text-main dark:text-white text-right">
                            {booking.therapist?.fullName || '—'}
                        </dd>
                    </div>

                    <div className="flex justify-between gap-3">
                        <dt className="text-text-muted dark:text-slate-400">Scheduled</dt>
                        <dd className="font-medium text-text-main dark:text-white text-right">
                            {fmtDateTime(booking.scheduledDate)}
                        </dd>
                    </div>

                    {isRescheduleRequested && booking.proposedNewDate && (
                        <div className="flex justify-between gap-3">
                            <dt className="text-text-muted dark:text-slate-400">Proposed Date</dt>
                            <dd className="font-medium text-orange-600 dark:text-orange-400 text-right">
                                {fmtDateTime(booking.proposedNewDate)}
                            </dd>
                        </div>
                    )}

                    <div className="flex justify-between gap-3">
                        <dt className="text-text-muted dark:text-slate-400">Session Type</dt>
                        <dd className="font-medium text-text-main dark:text-white capitalize">
                            {booking.sessionType || '—'}
                        </dd>
                    </div>

                    <div className="flex justify-between gap-3">
                        <dt className="text-text-muted dark:text-slate-400">Rate</dt>
                        <dd className="font-semibold text-text-main dark:text-white">
                            {fmt$(booking.payment?.amount ?? booking.rate)}
                        </dd>
                    </div>

                    {booking.payment && (
                        <div className="flex justify-between gap-3 items-center">
                            <dt className="text-text-muted dark:text-slate-400">Payment</dt>
                            <dd><StatusBadge status={booking.payment.status} styleMap={PAYMENT_STYLES} /></dd>
                        </div>
                    )}

                    {booking.sessions?.length === 1 && (
                        <div className="flex justify-between gap-3 items-center">
                            <dt className="text-text-muted dark:text-slate-400">Session</dt>
                            <dd><StatusBadge status={booking.sessions[0].status} styleMap={SESSION_STYLES} /></dd>
                        </div>
                    )}
                </dl>

                {/* Multi-session breakdown */}
                {booking.sessions?.length > 1 && (
                    <div className="border border-border-light dark:border-border-dark rounded-xl overflow-hidden">
                        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                            <p className="text-xs font-bold text-text-main dark:text-white uppercase tracking-wider">
                                Treatment Plan
                            </p>
                            <p className="text-xs font-semibold text-text-muted dark:text-slate-400">
                                {booking.sessions.filter(s => s.status === "confirmed_by_customer").length} of {booking.sessions.length} confirmed
                            </p>
                        </div>
                        <div className="divide-y divide-border-light dark:divide-border-dark">
                            {booking.sessions.map((s) => (
                                <div key={s.id} className="px-4 py-2.5 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-text-main dark:text-white">
                                            Session {s.sessionNumber}
                                        </p>
                                        <p className="text-[10px] text-text-muted dark:text-slate-500">
                                            {s.scheduledDate
                                                ? new Date(s.scheduledDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })
                                                : "Not scheduled"}
                                        </p>
                                    </div>
                                    <StatusBadge status={s.status} styleMap={SESSION_STYLES} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Reschedule approve/deny section ── */}
                {isRescheduleRequested && !success && (
                    <div className="border border-orange-200 dark:border-orange-800/60 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 bg-orange-50 dark:bg-orange-900/10 flex items-center gap-2">
                            <MdEventRepeat className="text-orange-600 dark:text-orange-400 shrink-0" />
                            <p className="text-sm font-medium text-orange-700 dark:text-orange-400">Reschedule Requested</p>
                        </div>
                        <div className="px-4 py-3 space-y-2 border-t border-orange-200 dark:border-orange-800/60">
                            <p className="text-xs text-text-muted dark:text-slate-400">
                                Approve to confirm the new date, or deny to keep the original schedule.
                            </p>
                            {confirmApproveReschedule ? (
                                <div className="space-y-2">
                                    <p className="text-xs text-text-muted dark:text-slate-400">
                                        This will confirm the booking for the new requested date. Continue?
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { onApproveReschedule(booking.id); setConfirmApproveReschedule(false); }}
                                            disabled={loading}
                                            className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                                        >
                                            {loading ? '\u2026' : 'Confirm Approve'}
                                        </button>
                                        <button
                                            onClick={() => setConfirmApproveReschedule(false)}
                                            disabled={loading}
                                            className="px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark text-sm text-text-main dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            Back
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setConfirmApproveReschedule(true)}
                                        disabled={loading}
                                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => setShowDenyForm(v => !v)}
                                        disabled={loading}
                                        className="flex-1 py-2.5 rounded-xl border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                    >
                                        Deny
                                    </button>
                                </div>
                            )}
                            {showDenyForm && (
                                <div className="space-y-2 pt-1">
                                    <textarea
                                        value={denyReason}
                                        onChange={e => setDenyReason(e.target.value)}
                                        placeholder="Reason for denial (optional)…"
                                        rows={2}
                                        className={textareaCls}
                                    />
                                    <button
                                        onClick={() => onDenyReschedule(booking.id, denyReason.trim() || undefined)}
                                        disabled={loading}
                                        className="w-full py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                                    >
                                        {loading ? 'Denying…' : 'Confirm Denial'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Cancel section ── */}
                {isCancellable && !success && (
                    <div className="border border-border-light dark:border-border-dark rounded-xl overflow-hidden">
                        <button
                            onClick={() => setShowCancelForm(v => !v)}
                            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                            Cancel Booking
                            <span className="text-text-muted text-xs">{showCancelForm ? '▲' : '▼'}</span>
                        </button>

                        {showCancelForm && (
                            <div className="px-4 pb-4 space-y-3 border-t border-border-light dark:border-border-dark">
                                <div className="pt-3">
                                    <label className="block text-xs font-medium text-text-muted dark:text-slate-400 mb-1.5">
                                        Reason <span className="font-normal">(optional)</span>
                                    </label>
                                    <textarea
                                        value={cancelReason}
                                        onChange={e => setCancelReason(e.target.value)}
                                        placeholder="Reason for cancellation…"
                                        rows={3}
                                        className={`${textareaCls} focus:ring-red-300 dark:focus:ring-red-700`}
                                    />
                                </div>
                                <p className="text-xs text-text-muted dark:text-slate-400">
                                    Both the customer and therapist will be notified by email.
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onCancel(booking.id, cancelReason.trim() || undefined)}
                                        disabled={loading}
                                        className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                                    >
                                        {loading ? 'Cancelling…' : 'Confirm Cancellation'}
                                    </button>
                                    <button
                                        onClick={() => { setShowCancelForm(false); setCancelReason(''); }}
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

export default function AdminBookingsPage() {
    usePageTitle("Bookings");
    const [statusFilter, setStatusFilter] = useState('');
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
        ...(search && { search }),
        sortBy,
        sortOrder,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        page,
        limit: 20,
    };

    const { data: statsData, isLoading: statsLoading } = useAdminBookingStats();
    const { data, isLoading, error } = useAdminBookings(params);
    const cancelBooking = useCancelAdminBooking();
    const approveReschedule = useApproveBookingReschedule();
    const denyReschedule = useDenyBookingReschedule();

    const bookings = data?.bookings ?? [];
    const pagination = data?.pagination;
    const mutating = cancelBooking.isPending || approveReschedule.isPending || denyReschedule.isPending;

    const stats = useMemo(() => {
        if (!statsData) return { total: 0, pending: 0, completed: 0, cancelled: 0, rescheduleRequested: 0 };
        return statsData;
    }, [statsData]);

    const hasSecondaryFilters = search || startDate || endDate || sortBy !== 'createdAt' || sortOrder !== 'desc';

    const commitSearch = (val) => {
        setSearch(val.trim());
        setPage(1);
        setSelected(null);
    };

    const handleTabChange = (value) => {
        setStatusFilter(value);
        setPage(1);
        setSelected(null);
        setActionError('');
        setActionSuccess('');
    };

    const handleCancel = async (id, reason) => {
        setActionError(''); setActionSuccess('');
        try {
            await cancelBooking.mutateAsync({ id, reason });
            setActionSuccess('Booking cancelled successfully. Both parties have been notified.');
            setSelected(prev => prev?.id === id ? { ...prev, status: 'cancelled' } : prev);
        } catch (e) {
            setActionError(e?.response?.data?.message || 'Failed to cancel booking.');
        }
    };

    const handleApproveReschedule = async (id) => {
        setActionError(''); setActionSuccess('');
        try {
            const result = await approveReschedule.mutateAsync(id);
            setActionSuccess('Reschedule approved. Booking confirmed for the new date.');
            setSelected(prev => prev?.id === id ? result.data?.data ?? { ...prev, status: 'confirmed', proposedNewDate: null } : prev);
        } catch (e) {
            setActionError(e?.response?.data?.message || 'Failed to approve reschedule.');
        }
    };

    const handleDenyReschedule = async (id, reason) => {
        setActionError(''); setActionSuccess('');
        try {
            await denyReschedule.mutateAsync({ id, reason });
            setActionSuccess('Reschedule denied. Booking reverted to confirmed status.');
            setSelected(prev => prev?.id === id ? { ...prev, status: 'confirmed', proposedNewDate: null } : prev);
        } catch (e) {
            setActionError(e?.response?.data?.message || 'Failed to deny reschedule.');
        }
    };

    const resetSecondaryFilters = () => {
        setSearch('');
        setSearchInput('');
        setSortBy('createdAt');
        setSortOrder('desc');
        setStartDate('');
        setEndDate('');
        setPage(1);
        setSelected(null);
    };

    const inputCls = 'px-3 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary';

    return (
        <div className="flex min-h-screen relative">

            {/* ── Main content ── */}
            <div className={`flex-1 min-w-0 p-4 md:p-6 transition-all duration-300 ${selected ? 'lg:mr-95' : ''}`}>

                {/* Header */}
                <div className="mb-5">
                    <h1 className="text-xl md:text-2xl font-bold text-text-main dark:text-white">Bookings</h1>
                    <p className="text-text-muted dark:text-slate-400 text-sm mt-0.5">
                        {pagination ? `${pagination.total.toLocaleString()} bookings` : 'Manage platform bookings'}
                    </p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                    <StatCard icon={MdCalendarMonth} label="Total Bookings" value={stats.total} iconBg="bg-primary" loading={statsLoading} />
                    <StatCard icon={MdSchedule} label="Pending" value={stats.pending} iconBg="bg-amber-500" loading={statsLoading} />
                    <StatCard icon={MdCheckCircle} label="Completed" value={stats.completed} iconBg="bg-emerald-500" loading={statsLoading} />
                    <StatCard icon={MdCancel} label="Cancelled" value={stats.cancelled} iconBg="bg-red-500" loading={statsLoading} />
                </div>

                {/* Status tabs */}
                <div className="flex gap-1 mb-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit overflow-x-auto max-w-full">
                    {TABS.map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => handleTabChange(tab.value)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                                ${statusFilter === tab.value
                                    ? 'bg-white dark:bg-card-dark text-text-main dark:text-white shadow-sm'
                                    : 'text-text-muted dark:text-slate-400 hover:text-text-main dark:hover:text-slate-200'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Secondary filters: search, sort, date range */}
                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-4 mb-5 space-y-3">
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="relative flex-1 min-w-48">
                            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-slate-400 text-lg pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search customer, therapist, or email…"
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') commitSearch(e.target.value); }}
                                onBlur={e => commitSearch(e.target.value)}
                                className={`${inputCls} pl-9 w-full`}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <MdSwapVert className="text-text-muted dark:text-slate-400 text-lg shrink-0" />
                            <select
                                value={sortBy}
                                onChange={e => { setSortBy(e.target.value); setPage(1); }}
                                className={inputCls}
                            >
                                {SORT_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => { setSortOrder(o => o === 'desc' ? 'asc' : 'desc'); setPage(1); }}
                                title={sortOrder === 'desc' ? 'Descending — click for ascending' : 'Ascending — click for descending'}
                                className={`${inputCls} font-mono text-xs min-w-16`}
                            >
                                {sortOrder === 'desc' ? '↓ Desc' : '↑ Asc'}
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <MdFilterList className="text-text-muted dark:text-slate-400 text-lg shrink-0" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => { setStartDate(e.target.value); setPage(1); setSelected(null); }}
                                title="Scheduled from"
                                className={inputCls}
                            />
                            <span className="text-text-muted dark:text-slate-400 text-sm shrink-0">to</span>
                            <input
                                type="date"
                                value={endDate}
                                min={startDate || undefined}
                                onChange={e => { setEndDate(e.target.value); setPage(1); setSelected(null); }}
                                title="Scheduled until"
                                className={inputCls}
                            />
                        </div>

                        {hasSecondaryFilters && (
                            <button
                                onClick={resetSecondaryFilters}
                                className="px-3 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark text-text-muted dark:text-slate-400 hover:text-text-main dark:hover:text-white hover:border-primary/40 transition-colors"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl overflow-hidden">
                    {isLoading ? (
                        <div className="p-5 space-y-3">
                            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16" />)}
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center text-sm text-red-500">
                            Failed to load bookings. Please refresh.
                        </div>
                    ) : !bookings.length ? (
                        <div className="p-12 text-center">
                            <MdCalendarMonth className="text-4xl text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                            <p className="text-sm text-text-muted dark:text-slate-400">
                                No {statusFilter ? statusFilter.replace(/_/g, ' ') + ' ' : ''}bookings found
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800/50">
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide">Customer</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide hidden md:table-cell">Therapist</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide hidden lg:table-cell">Scheduled</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide">Status</th>
                                            <th className="px-5 py-3 text-right text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                        {bookings.map(b => (
                                            <tr
                                                key={b.id}
                                                onClick={() => {
                                                    setSelected(prev => prev?.id === b.id ? null : b);
                                                    setActionError(''); setActionSuccess('');
                                                }}
                                                className={`cursor-pointer transition-colors
                                                    ${selected?.id === b.id
                                                        ? 'bg-primary/5 dark:bg-primary/10'
                                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
                                            >
                                                <td className="px-5 py-3.5 font-medium text-text-main dark:text-white">
                                                    {b.customer?.fullName || '—'}
                                                </td>
                                                <td className="px-5 py-3.5 text-text-muted dark:text-slate-400 hidden md:table-cell">
                                                    {b.therapist?.fullName || '—'}
                                                </td>
                                                <td className="px-5 py-3.5 text-text-muted dark:text-slate-400 hidden lg:table-cell">
                                                    {fmtDate(b.scheduledDate)}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <StatusBadge status={b.status} styleMap={BOOKING_STYLES} />
                                                </td>
                                                <td className="px-5 py-3.5 text-right font-medium text-text-main dark:text-white">
                                                    {fmt$(b.payment?.amount ?? b.rate)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination && pagination.totalPages > 1 && (
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
                                            {page} / {pagination.totalPages}
                                        </span>
                                        <button
                                            onClick={() => setPage(p => p + 1)}
                                            disabled={page === pagination.totalPages}
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
                        <BookingSidePanel
                            booking={selected}
                            onClose={() => { setSelected(null); setActionError(''); setActionSuccess(''); }}
                            onCancel={handleCancel}
                            onApproveReschedule={handleApproveReschedule}
                            onDenyReschedule={handleDenyReschedule}
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

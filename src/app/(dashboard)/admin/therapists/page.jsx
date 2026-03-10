/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, Suspense } from 'react';
import { usePageTitle } from "@/hooks/usePageTitle";
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    MdSearch, MdClose, MdVerifiedUser, MdChevronLeft,
    MdChevronRight, MdOpenInNew, MdCheckCircle, MdThumbDown,
    MdDescription,
} from 'react-icons/md';
import {
    useAdminTherapists,
    useApproveTherapist,
    useRejectTherapist,
} from '@/hooks/useAdmin';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const STATUS_STYLES = {
    pending: 'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400',
    review: 'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
    approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    rejected: 'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
    incomplete: 'bg-slate-100  text-slate-600  dark:bg-slate-700     dark:text-slate-300',
};

function Skeleton({ className }) {
    return <div className={`animate-pulse rounded bg-slate-200 dark:bg-slate-700 ${className}`} />;
}

// ─── Side Panel ───────────────────────────────────────────────────────────────

function TherapistSidePanel({ therapist, onClose, onApprove, onReject, loading, error, success }) {
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [reason, setReason] = useState('');
    const [reasonError, setReasonError] = useState('');

    const isPending = ['pending', 'review'].includes(therapist.therapistProfile?.approvalStatus);

    const handleRejectSubmit = () => {
        if (reason.trim().length < 10) {
            setReasonError('Reason must be at least 10 characters.');
            return;
        }
        setReasonError('');
        onReject(therapist.id, reason.trim());
    };

    const cancelReject = () => {
        setShowRejectForm(false);
        setReason('');
        setReasonError('');
    };

    // Reset form when therapist changes
    useEffect(() => {
        setShowRejectForm(false);
        setReason('');
        setReasonError('');
    }, [therapist.id]);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-light dark:border-border-dark shrink-0">
                <h3 className="font-semibold text-text-main dark:text-white text-sm">Review Application</h3>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                    <MdClose className="text-xl" />
                </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto panel-scroll p-5 space-y-5">
                {/* Identity */}
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-base font-bold text-primary shrink-0">
                        {therapist.therapistProfile?.fullName?.charAt(0)?.toUpperCase() || 'T'}
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-text-main dark:text-white truncate">{therapist.therapistProfile?.fullName}</p>
                        <p className="text-sm text-text-muted dark:text-slate-400 truncate">{therapist.email}</p>
                    </div>
                </div>

                {/* Status badge */}
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[therapist.therapistProfile?.approvalStatus] ?? 'bg-slate-100 text-slate-600'}`}>
                    {therapist.therapistProfile?.approvalStatus}
                </span>

                {/* Details */}
                <dl className="space-y-3 text-sm">
                    <div className="flex justify-between gap-3">
                        <dt className="text-text-muted dark:text-slate-400">License type</dt>
                        <dd className="font-medium text-text-main dark:text-white text-right">
                            {therapist.therapistProfile?.primaryLicenseType || '—'}
                        </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                        <dt className="text-text-muted dark:text-slate-400">Applied</dt>
                        <dd className="font-medium text-text-main dark:text-white">
                            {fmtDate(therapist.createdAt)}
                        </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                        <dt className="text-text-muted dark:text-slate-400 flex items-center gap-1">
                            <MdDescription className="text-sm" /> Documents
                        </dt>
                        <dd className="font-medium text-text-main dark:text-white">
                            {therapist.therapistProfile?.licenseDocuments?.length ?? 0} uploaded
                        </dd>
                    </div>
                    {therapist.therapistProfile?.approvalStatus === 'rejected' && therapist.therapistProfile?.rejectionReason && (
                        <div>
                            <dt className="text-text-muted dark:text-slate-400 mb-1.5">Rejection reason</dt>
                            <dd className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl leading-relaxed">
                                {therapist.therapistProfile.rejectionReason}
                            </dd>
                        </div>
                    )}
                </dl>

                {/* Feedback */}
                {error && (
                    <div className="px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm">
                        <MdCheckCircle className="shrink-0" /> {success}
                    </div>
                )}

                {/* Inline reject form */}
                {showRejectForm && (
                    <div className="space-y-3 p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
                        <p className="text-sm font-medium text-text-main dark:text-white">Rejection Reason</p>
                        <textarea
                            value={reason}
                            onChange={e => { setReason(e.target.value); setReasonError(''); }}
                            placeholder="Explain why this application is being rejected (min. 10 characters)…"
                            rows={4}
                            className="w-full px-3 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-text-main dark:text-white placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-700 focus:border-red-400"
                        />
                        {reasonError && <p className="text-xs text-red-500">{reasonError}</p>}
                        <div className="flex gap-2">
                            <button
                                onClick={handleRejectSubmit}
                                disabled={loading}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Rejecting…' : 'Confirm Rejection'}
                            </button>
                            <button
                                onClick={cancelReject}
                                disabled={loading}
                                className="px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark text-sm text-text-main dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Fixed action footer */}
            <div className="p-5 border-t border-border-light dark:border-border-dark space-y-2.5 shrink-0">
                <Link
                    href={`/admin/therapists/${therapist.id}`}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark text-sm font-medium text-text-main dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                    <MdOpenInNew className="text-base" />
                    View Full Application
                </Link>

                {isPending && !showRejectForm && !success && (
                    <>
                        <button
                            onClick={() => onApprove(therapist.id)}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                        >
                            <MdCheckCircle className="text-base" />
                            {loading ? 'Approving…' : 'Approve Application'}
                        </button>
                        <button
                            onClick={() => setShowRejectForm(true)}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <MdThumbDown className="text-base" />
                            Reject Application
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Status filter tabs ───────────────────────────────────────────────────────

const TABS = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'review', label: 'Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
];

function TherapistsContent() {
    const searchParams = useSearchParams();

    const [approvalFilter, setApprovalFilter] = useState(searchParams.get('approvalStatus') || '');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebounced] = useState('');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(null);
    const [actionError, setActionError] = useState('');
    const [actionSuccess, setActionSuccess] = useState('');

    useEffect(() => {
        const t = setTimeout(() => { setDebounced(search); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [search]);

    const params = {
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(approvalFilter && { approvalStatus: approvalFilter }),
        page,
        limit: 20,
    };

    // Separate lightweight queries for badge counts
    const { data: pendingCountData } = useAdminTherapists({ approvalStatus: 'pending', limit: 1 });
    const pendingBadge = pendingCountData?.pagination?.total ?? 0;
    const { data: reviewCountData } = useAdminTherapists({ approvalStatus: 'review', limit: 1 });
    const reviewBadge = reviewCountData?.pagination?.total ?? 0;

    const { data, isLoading, error } = useAdminTherapists(params);
    const approve = useApproveTherapist();
    const reject = useRejectTherapist();
    const mutating = approve.isPending || reject.isPending;

    const therapists = data?.therapists ?? [];
    const pagination = data?.pagination;

    const handleApprove = async (therapistUserId) => {
        setActionError(''); setActionSuccess('');
        try {
            await approve.mutateAsync(therapistUserId);
            setActionSuccess('Application approved successfully.');
            setSelected(prev =>
                prev?.id === therapistUserId
                    ? { ...prev, therapistProfile: { ...prev.therapistProfile, approvalStatus: 'approved' } }
                    : prev
            );
        } catch (e) {
            setActionError(e?.response?.data?.message || 'Failed to approve application.');
        }
    };

    const handleReject = async (therapistUserId, reason) => {
        setActionError(''); setActionSuccess('');
        try {
            await reject.mutateAsync({ therapistUserId, reason });
            setActionSuccess('Application rejected.');
            setSelected(prev =>
                prev?.id === therapistUserId
                    ? { ...prev, therapistProfile: { ...prev.therapistProfile, approvalStatus: 'rejected', rejectionReason: reason } }
                    : prev
            );
        } catch (e) {
            setActionError(e?.response?.data?.message || 'Failed to reject application.');
        }
    };

    const handleTabChange = (value) => {
        setApprovalFilter(value);
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
                    <h1 className="text-xl md:text-2xl font-bold text-text-main dark:text-white">Therapists</h1>
                    <p className="text-text-muted dark:text-slate-400 text-sm mt-0.5">
                        {pagination ? `${pagination.total.toLocaleString()} therapists` : 'Manage therapist applications'}
                    </p>
                </div>

                {/* Approval status tabs */}
                <div className="flex gap-1 mb-5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit overflow-x-auto">
                    {TABS.map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => handleTabChange(tab.value)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5
                                ${approvalFilter === tab.value
                                    ? 'bg-white dark:bg-card-dark text-text-main dark:text-white shadow-sm'
                                    : 'text-text-muted dark:text-slate-400 hover:text-text-main dark:hover:text-slate-200'}`}
                        >
                            {tab.label}
                            {tab.value === 'pending' && pendingBadge > 0 && (
                                <span className="min-w-4.5 h-4.5 px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                                    {pendingBadge > 99 ? '99+' : pendingBadge}
                                </span>
                            )}
                            {tab.value === 'review' && reviewBadge > 0 && (
                                <span className="min-w-4.5 h-4.5 px-1 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                                    {reviewBadge > 99 ? '99+' : reviewBadge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative max-w-sm mb-5">
                    <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xl pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search by name…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-text-main dark:text-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-slate-700 dark:hover:text-slate-200"
                        >
                            <MdClose className="text-lg" />
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
                            Failed to load therapists. Please refresh.
                        </div>
                    ) : !therapists.length ? (
                        <div className="p-12 text-center">
                            <MdVerifiedUser className="text-4xl text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                            <p className="text-sm text-text-muted dark:text-slate-400">
                                No {approvalFilter || ''} therapists found
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800/50">
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide">Therapist</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide hidden md:table-cell">License Type</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide">Status</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide hidden lg:table-cell">Applied</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide hidden lg:table-cell">Docs</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                        {therapists.map(t => (
                                            <tr
                                                key={t.id}
                                                onClick={() => {
                                                    setSelected(prev => prev?.id === t.id ? null : t);
                                                    setActionError('');
                                                    setActionSuccess('');
                                                }}
                                                className={`cursor-pointer transition-colors
                                                    ${selected?.id === t.id
                                                        ? 'bg-primary/5 dark:bg-primary/10'
                                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                                                    }`}
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                                                            {t.therapistProfile?.fullName?.charAt(0)?.toUpperCase() || 'T'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-text-main dark:text-white truncate">{t.therapistProfile?.fullName}</p>
                                                            <p className="text-xs text-text-muted dark:text-slate-400 truncate hidden sm:block">{t.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-text-muted dark:text-slate-400 hidden md:table-cell">
                                                    {t.therapistProfile?.primaryLicenseType || '—'}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[t.therapistProfile?.approvalStatus] ?? 'bg-slate-100 text-slate-600'}`}>
                                                        {t.therapistProfile?.approvalStatus}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-text-muted dark:text-slate-400 hidden lg:table-cell">
                                                    {fmtDate(t.createdAt)}
                                                </td>
                                                <td className="px-5 py-4 hidden lg:table-cell">
                                                    <span className="inline-flex items-center gap-1 text-text-muted dark:text-slate-400 text-xs">
                                                        <MdDescription className="text-base" />
                                                        {t.therapistProfile?.licenseDocuments?.length ?? 0}
                                                    </span>
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
                    <div
                        className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                        onClick={() => setSelected(null)}
                    />
                    <div className="fixed right-0 top-14 lg:top-0 h-[calc(100dvh-3.5rem)] lg:h-dvh w-full max-w-95 bg-card-light dark:bg-card-dark border-l border-border-light dark:border-border-dark z-40 lg:z-20 shadow-xl flex flex-col overflow-hidden">
                        <TherapistSidePanel
                            therapist={selected}
                            onClose={() => { setSelected(null); setActionError(''); setActionSuccess(''); }}
                            onApprove={handleApprove}
                            onReject={handleReject}
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

export default function AdminTherapistsPage() {
    usePageTitle("Therapists");
    return (
        <Suspense fallback={
            <div className="p-6 space-y-4">
                <div className="animate-pulse h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="animate-pulse h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                <div className="animate-pulse h-72 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            </div>
        }>
            <TherapistsContent />
        </Suspense>
    );
}

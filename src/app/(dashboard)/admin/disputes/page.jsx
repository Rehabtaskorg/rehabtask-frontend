/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    MdGavel, MdClose, MdChevronLeft, MdChevronRight,
    MdCheckCircle, MdWarning, MdRefresh, MdOpenInNew,
    MdPerson, MdSave,
} from 'react-icons/md';
import {
    useAdminDisputes,
    useUpdateDispute,
    useAssignDispute,
    useReopenDispute,
    useAdminUsers,
} from '@/hooks/useAdmin';
import { useAdminUser } from '@/contexts/AdminUserContext';

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const getFilerName = (user) =>
    user?.customerProfile?.fullName || user?.therapistProfile?.fullName || user?.email || '—';

const TYPE_STYLES = {
    billing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    service_quality: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    no_show: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    communication: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    other: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

const STATUS_STYLES = {
    open: 'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
    under_review: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    closed: 'bg-slate-100  text-slate-600  dark:bg-slate-700     dark:text-slate-300',
};

const STATUS_OPTIONS = [
    { value: 'open', label: 'Open' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'resolved', label: 'Resolved' },
];

function Skeleton({ className }) {
    return <div className={`animate-pulse rounded bg-slate-200 dark:bg-slate-700 ${className}`} />;
}

function StatusBadge({ status }) {
    return (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap ${STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-600'}`}>
            {status?.replace(/_/g, ' ')}
        </span>
    );
}

function TypeBadge({ type }) {
    return (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap ${TYPE_STYLES[type] ?? TYPE_STYLES.other}`}>
            {type?.replace(/_/g, ' ') || 'Other'}
        </span>
    );
}

function DisputeSidePanel({ dispute, admins, onClose, onUpdate, onAssign, onReopen, loading, error, success, currentUser }) {
    const [formStatus, setFormStatus] = useState(dispute.status);
    const [formResolution, setFormResolution] = useState(dispute.resolution || '');
    const [formAssignId, setFormAssignId] = useState(dispute.assignedAdmin?.id || '');
    const [activeSection, setActiveSection] = useState(null); // 'update' | 'assign'

    // Reset form whenever a different dispute is shown
    useEffect(() => {
        setFormStatus(dispute.status);
        setFormResolution(dispute.resolution || '');
        setFormAssignId(dispute.assignedAdmin?.id || '');
        setActiveSection(null);
    }, [dispute.assignedAdmin?.id, dispute.id, dispute.resolution, dispute.status]);

    const isResolved = dispute.status === 'resolved' || dispute.status === 'closed';
    const isDirty = formStatus !== dispute.status || formResolution !== (dispute.resolution || '');

    const isFullAdmin = currentUser?.role === 'admin';
    const isAssignedToMe = dispute.assignedAdminId === currentUser?.id || dispute.assignedAdmin?.id === currentUser?.id;
    const canModify = isFullAdmin || isAssignedToMe;
    const canAssign = isFullAdmin;

    const handleSaveUpdate = () => {
        onUpdate(dispute.id, {
            status: formStatus,
            ...(formResolution && { resolution: formResolution }),
            expectedUpdatedAt: dispute.updatedAt,
        });
    };

    const handleAssign = () => {
        if (!formAssignId) return;
        onAssign(dispute.id, formAssignId);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-border-light dark:border-border-dark shrink-0 gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-mono text-text-muted dark:text-slate-400">#{dispute.ticketId}</p>
                    <p className="font-semibold text-text-main dark:text-white text-sm mt-0.5 leading-snug line-clamp-2">
                        {dispute.description}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
                >
                    <MdClose className="text-xl" />
                </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto panel-scroll p-5 space-y-5">
                {/* Status badge */}
                <div className="flex items-center justify-between">
                    <StatusBadge status={dispute.status} />
                    <span className="text-xs text-text-muted dark:text-slate-500">{fmtDate(dispute.createdAt)}</span>
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

                {/* Dispute info */}
                <dl className="space-y-3 text-sm">
                    <div>
                        <dt className="text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide mb-1">Filed By</dt>
                        <dd className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                <MdPerson className="text-xs text-slate-500 dark:text-slate-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-medium text-text-main dark:text-white truncate">
                                    {getFilerName(dispute.user)}
                                </p>
                                {dispute.user?.email && (
                                    <p className="text-xs text-text-muted dark:text-slate-400 truncate">
                                        {dispute.user.email}
                                    </p>
                                )}
                            </div>
                            {dispute.user?.id && (
                                <Link
                                    href={`/admin/users/${dispute.user.id}`}
                                    className="ml-auto shrink-0 text-primary hover:text-primary/80"
                                    title="View user"
                                >
                                    <MdOpenInNew className="text-sm" />
                                </Link>
                            )}
                        </dd>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <dt className="text-text-muted dark:text-slate-400">Type</dt>
                        <dd><TypeBadge type={dispute.type} /></dd>
                    </div>

                    {dispute.booking && (
                        <div className="flex justify-between gap-3">
                            <dt className="text-text-muted dark:text-slate-400">Booking</dt>
                            <dd className="font-medium text-text-main dark:text-white">
                                <span className="capitalize">{dispute.booking.status}</span>
                            </dd>
                        </div>
                    )}

                    <div className="flex justify-between gap-3">
                        <dt className="text-text-muted dark:text-slate-400">Assigned to</dt>
                        <dd className="font-medium text-text-main dark:text-white text-right truncate max-w-40">
                            {dispute.assignedAdmin?.email || 'Unassigned'}
                        </dd>
                    </div>
                </dl>

                {/* Description */}
                {dispute.description && (
                    <div>
                        <p className="text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide mb-2">Description</p>
                        <p className="text-sm text-text-main dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                            {dispute.description}
                        </p>
                    </div>
                )}

                {/* Current resolution */}
                {dispute.resolution && (
                    <div>
                        <p className="text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide mb-2">Resolution</p>
                        <p className="text-sm text-text-main dark:text-slate-200 leading-relaxed bg-emerald-50 dark:bg-emerald-900/10 rounded-xl p-3 border border-emerald-200 dark:border-emerald-800">
                            {dispute.resolution}
                        </p>
                    </div>
                )}

                {/* ── Update Status section ── */}
                {canModify ? (
                    <div className="border border-border-light dark:border-border-dark rounded-xl overflow-hidden">
                        <button
                            onClick={() => setActiveSection(prev => prev === 'update' ? null : 'update')}
                            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-text-main dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                            Update Status & Resolution
                            <span className="text-text-muted text-xs">{activeSection === 'update' ? '▲' : '▼'}</span>
                        </button>

                        {activeSection === 'update' && (
                            <div className="px-4 pb-4 space-y-3 border-t border-border-light dark:border-border-dark">
                                <div className="pt-3">
                                    <label className="block text-xs font-medium text-text-muted dark:text-slate-400 mb-1.5">
                                        Status
                                    </label>
                                    <select
                                        value={formStatus}
                                        onChange={e => setFormStatus(e.target.value)}
                                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    >
                                        {STATUS_OPTIONS.map(o => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-text-muted dark:text-slate-400 mb-1.5">
                                        Resolution Note
                                        <span className="font-normal ml-1">(optional)</span>
                                    </label>
                                    <textarea
                                        value={formResolution}
                                        onChange={e => setFormResolution(e.target.value)}
                                        placeholder="Describe how this dispute was resolved…"
                                        rows={3}
                                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-text-main dark:text-white placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>

                                <button
                                    onClick={handleSaveUpdate}
                                    disabled={loading || !isDirty}
                                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <MdSave className="text-base" />
                                    {loading ? 'Saving…' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border-light dark:border-border-dark px-4 py-3">
                        <p className="text-xs font-medium text-text-muted dark:text-slate-400">
                            {dispute.assignedAdmin
                                ? `This dispute is assigned to ${dispute.assignedAdmin.email}. Only the assigned admin or a full admin can update it.`
                                : 'This dispute is unassigned. Only a full admin can update unassigned disputes.'}
                        </p>
                    </div>
                )}

                {/* ── Assign Admin section — full admins only ── */}
                {canAssign && (
                    <div className="border border-border-light dark:border-border-dark rounded-xl overflow-hidden">
                        <button
                            onClick={() => setActiveSection(prev => prev === 'assign' ? null : 'assign')}
                            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-text-main dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                            Assign to Admin
                            <span className="text-text-muted text-xs">{activeSection === 'assign' ? '▲' : '▼'}</span>
                        </button>

                        {activeSection === 'assign' && (
                            <div className="px-4 pb-4 space-y-3 border-t border-border-light dark:border-border-dark pt-3">
                                <select
                                    value={formAssignId}
                                    onChange={e => setFormAssignId(e.target.value)}
                                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                >
                                    <option value="">Select an admin…</option>
                                    {admins.map(admin => (
                                        <option key={admin.id} value={admin.id}>
                                            {admin.email}{admin.role === 'sub_admin' ? ' (Sub-Admin)' : ' (Admin)'}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    onClick={handleAssign}
                                    disabled={loading || !formAssignId || formAssignId === dispute.assignedAdmin?.id}
                                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? 'Assigning…' : 'Assign'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Fixed footer — reopen action */}
            {isResolved && canModify && (
                <div className="p-5 border-t border-border-light dark:border-border-dark shrink-0">
                    <button
                        onClick={() => onReopen(dispute.id)}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 text-sm font-medium hover:bg-amber-50 dark:hover:bg-amber-900/20 disabled:opacity-50 transition-colors"
                    >
                        <MdRefresh className="text-base" />
                        {loading ? 'Processing…' : 'Reopen Dispute'}
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

const TABS = [
    { value: '', label: 'All' },
    { value: 'open', label: 'Open' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'resolved', label: 'Resolved' },
];

export default function AdminDisputesPage() {
    const currentUser = useAdminUser();
    const isFullAdmin = currentUser?.role === 'admin';
    const [statusFilter, setStatusFilter] = useState('');
    const [unassignedOnly, setUnassigned] = useState(false);
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(null);
    const [actionError, setActionError] = useState('');
    const [actionSuccess, setActionSuccess] = useState('');

    const params = {
        ...(statusFilter && { status: statusFilter }),
        ...(unassignedOnly && { unassigned: true }),
        page,
        limit: 20,
    };

    const { data, isLoading, error } = useAdminDisputes(params);
    const { data: adminData } = useAdminUsers({ role: 'admin', limit: 100, enabled: isFullAdmin });
    const { data: subAdminData } = useAdminUsers({ role: 'sub_admin', limit: 100, enabled: isFullAdmin });
    const updateDispute = useUpdateDispute();
    const assignDispute = useAssignDispute();
    const reopenDispute = useReopenDispute();

    const disputes = data?.disputes ?? [];
    const pagination = data?.pagination;
    const admins = [
        ...(adminData?.users ?? []),
        ...(subAdminData?.users ?? []),
    ];
    const mutating = updateDispute.isPending || assignDispute.isPending || reopenDispute.isPending;

    const clear = () => { setActionError(''); setActionSuccess(''); };

    const handleUpdate = async (id, updateData) => {
        clear();
        try {
            const { data: res } = await updateDispute.mutateAsync({ id, ...updateData });
            setActionSuccess('Dispute updated successfully.');
            // Use server response to keep updatedAt current for concurrency guard
            const serverDispute = res?.data;
            setSelected(prev => prev?.id === id ? { ...prev, ...updateData, ...(serverDispute && { updatedAt: serverDispute.updatedAt }) } : prev);
        } catch (e) {
            setActionError(e?.response?.data?.message || 'Failed to update dispute.');
        }
    };

    const handleAssign = async (id, assignedAdminId) => {
        clear();
        try {
            await assignDispute.mutateAsync({ id, assignedAdminId });
            const adminUser = admins.find(a => a.id === assignedAdminId);
            setActionSuccess('Dispute assigned successfully.');
            setSelected(prev =>
                prev?.id === id
                    ? { ...prev, assignedAdmin: { id: assignedAdminId, email: adminUser?.email || '' }, status: prev.status === 'open' ? 'under_review' : prev.status }
                    : prev
            );
        } catch (e) {
            setActionError(e?.response?.data?.message || 'Failed to assign dispute.');
        }
    };

    const handleReopen = async (id) => {
        clear();
        try {
            await reopenDispute.mutateAsync(id);
            setActionSuccess('Dispute reopened.');
            setSelected(prev => prev?.id === id ? { ...prev, status: 'under_review' } : prev);
        } catch (e) {
            setActionError(e?.response?.data?.message || 'Failed to reopen dispute.');
        }
    };

    const handleTabChange = (value) => {
        setStatusFilter(value);
        setPage(1);
        setSelected(null);
        clear();
    };

    return (
        <div className="flex min-h-screen relative">

            {/* ── Main content ── */}
            <div className={`flex-1 min-w-0 p-4 md:p-6 transition-all duration-300 ${selected ? 'lg:mr-100' : ''}`}>

                {/* Header */}
                <div className="mb-5">
                    <h1 className="text-xl md:text-2xl font-bold text-text-main dark:text-white">Disputes</h1>
                    <p className="text-text-muted dark:text-slate-400 text-sm mt-0.5">
                        {pagination
                            ? `${pagination.total.toLocaleString()} ${isFullAdmin ? 'disputes' : 'disputes assigned to you'}`
                            : isFullAdmin ? 'Manage platform disputes' : 'Disputes assigned to you'}
                    </p>
                </div>

                {/* Filters row */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
                    {/* Status tabs */}
                    <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit overflow-x-auto shrink-0">
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

                    {/* Unassigned toggle — admin only */}
                    {isFullAdmin && (
                        <button
                            onClick={() => { setUnassigned(v => !v); setPage(1); setSelected(null); }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors
                                ${unassignedOnly
                                    ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20'
                                    : 'border-border-light dark:border-border-dark text-text-muted dark:text-slate-400 hover:border-primary/40 hover:text-primary'}`}
                        >
                            <span className={`h-2 w-2 rounded-full ${unassignedOnly ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`} />
                            Unassigned only
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
                            Failed to load disputes. Please refresh.
                        </div>
                    ) : !disputes.length ? (
                        <div className="p-12 text-center">
                            <MdGavel className="text-4xl text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                            <p className="text-sm text-text-muted dark:text-slate-400">
                                No {statusFilter || ''} disputes found
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800/50">
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide">Ticket</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide">Description</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide hidden md:table-cell">Filed By</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide">Status</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide hidden md:table-cell">Type</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide hidden lg:table-cell">Assigned To</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide hidden lg:table-cell">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                        {disputes.map(d => (
                                            <tr
                                                key={d.id}
                                                onClick={() => {
                                                    setSelected(prev => prev?.id === d.id ? null : d);
                                                    clear();
                                                }}
                                                className={`cursor-pointer transition-colors
                                                    ${selected?.id === d.id
                                                        ? 'bg-primary/5 dark:bg-primary/10'
                                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
                                            >
                                                <td className="px-5 py-3.5">
                                                    <span className="font-mono text-xs text-text-muted dark:text-slate-400">
                                                        #{d.ticketId}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <p className="font-medium text-text-main dark:text-white truncate max-w-50">
                                                        {d.description}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-3.5 hidden md:table-cell text-text-muted dark:text-slate-400">
                                                    {getFilerName(d.user)}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <StatusBadge status={d.status} />
                                                </td>
                                                <td className="px-5 py-3.5 hidden md:table-cell">
                                                    <TypeBadge type={d.type} />
                                                </td>
                                                <td className="px-5 py-3.5 hidden lg:table-cell text-text-muted dark:text-slate-400">
                                                    {d.assignedAdmin?.email ?? (
                                                        <span className="text-amber-600 dark:text-amber-400 text-xs font-medium">Unassigned</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 hidden lg:table-cell text-text-muted dark:text-slate-400">
                                                    {fmtDate(d.createdAt)}
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
                    <div className="fixed right-0 top-14 lg:top-0 h-[calc(100dvh-3.5rem)] lg:h-dvh w-full max-w-100 bg-card-light dark:bg-card-dark border-l border-border-light dark:border-border-dark z-40 lg:z-20 shadow-xl flex flex-col overflow-hidden">
                        <DisputeSidePanel
                            dispute={selected}
                            admins={admins}
                            onClose={() => { setSelected(null); clear(); }}
                            onUpdate={handleUpdate}
                            onAssign={handleAssign}
                            onReopen={handleReopen}
                            loading={mutating}
                            error={actionError}
                            success={actionSuccess}
                            currentUser={currentUser}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

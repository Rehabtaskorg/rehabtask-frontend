'use client';

import { useState, useEffect } from 'react';
import { usePageTitle } from "@/hooks/usePageTitle";
import Link from 'next/link';
import {
    MdSearch, MdClose, MdPeople, MdChevronLeft,
    MdChevronRight, MdOpenInNew, MdBlock, MdCheckCircle,
} from 'react-icons/md';
import {
    useAdminUsers,
    useDeactivateUser,
    useReactivateUser,
} from '@/hooks/useAdmin';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const getDisplayName = (user) =>
    user.customerProfile?.fullName ||
    user.therapistProfile?.fullName ||
    user.email.split('@')[0];

const getInitials = (user) => {
    const name = user.customerProfile?.fullName || user.therapistProfile?.fullName || user.email;
    return name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const ROLE_STYLES = {
    admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    sub_admin: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    therapist: 'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
    customer: 'bg-slate-100  text-slate-600  dark:bg-slate-700     dark:text-slate-300',
};

function Skeleton({ className }) {
    return <div className={`animate-pulse rounded bg-slate-200 dark:bg-slate-700 ${className}`} />;
}

// ─── Side Panel ───────────────────────────────────────────────────────────────

function UserSidePanel({ user, onClose, onDeactivate, onReactivate, mutating }) {
    const [confirmDeactivate, setConfirmDeactivate] = useState(false);
    const [confirmReactivate, setConfirmReactivate] = useState(false);
    const displayName = getDisplayName(user);
    const initials = getInitials(user);

    return (
        <div className="flex flex-col h-full">
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-light dark:border-border-dark shrink-0">
                <h3 className="font-semibold text-text-main dark:text-white text-sm">User Details</h3>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                    <MdClose className="text-xl" />
                </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto panel-scroll p-5 space-y-5">
                {/* Avatar + identity */}
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-base font-bold text-primary shrink-0">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-text-main dark:text-white truncate">{displayName}</p>
                        <p className="text-sm text-text-muted dark:text-slate-400 truncate">{user.email}</p>
                    </div>
                </div>

                {/* Role + status badges */}
                <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${ROLE_STYLES[user.role] ?? 'bg-slate-100 text-slate-600'}`}>
                        {user.role.replace('_', ' ')}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {user.isActive ? 'Active' : 'Deactivated'}
                    </span>
                </div>

                {/* Details list */}
                <div>
                    <p className="text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide mb-3">
                        Account Details
                    </p>
                    <dl className="space-y-2.5 text-sm">
                        <div className="flex justify-between gap-3">
                            <dt className="text-text-muted dark:text-slate-400">Joined</dt>
                            <dd className="font-medium text-text-main dark:text-white">{fmtDate(user.createdAt)}</dd>
                        </div>

                        {user.customerProfile && (
                            <>
                                <div className="flex justify-between gap-3">
                                    <dt className="text-text-muted dark:text-slate-400">Account type</dt>
                                    <dd className="font-medium text-text-main dark:text-white capitalize">
                                        {user.customerProfile.customerType || 'Individual'}
                                    </dd>
                                </div>
                                {user.customerProfile.customerType === 'agency' && user.customerProfile.agencyName && (
                                    <div className="flex justify-between gap-3">
                                        <dt className="text-text-muted dark:text-slate-400">Agency</dt>
                                        <dd className="font-medium text-text-main dark:text-white text-right">
                                            {user.customerProfile.agencyName}
                                        </dd>
                                    </div>
                                )}
                            </>
                        )}

                        {user.therapistProfile && (
                            <>
                                <div className="flex justify-between gap-3">
                                    <dt className="text-text-muted dark:text-slate-400">License type</dt>
                                    <dd className="font-medium text-text-main dark:text-white">
                                        {user.therapistProfile.primaryLicenseType || '—'}
                                    </dd>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <dt className="text-text-muted dark:text-slate-400">Approval</dt>
                                    <dd className={`font-medium capitalize ${user.therapistProfile.approvalStatus === 'approved' ? 'text-emerald-600 dark:text-emerald-400' :
                                        user.therapistProfile.approvalStatus === 'rejected' ? 'text-red-600 dark:text-red-400' :
                                            'text-amber-600 dark:text-amber-400'
                                        }`}>
                                        {user.therapistProfile.approvalStatus}
                                    </dd>
                                </div>
                            </>
                        )}

                        {!user.isActive && user.deactivatedAt && (
                            <div className="flex justify-between gap-3">
                                <dt className="text-text-muted dark:text-slate-400">Deactivated</dt>
                                <dd className="font-medium text-red-500">{fmtDate(user.deactivatedAt)}</dd>
                            </div>
                        )}
                    </dl>
                </div>
            </div>

            {/* Action buttons */}
            <div className="p-5 border-t border-border-light dark:border-border-dark space-y-2.5 shrink-0">
                <Link
                    href={`/admin/users/${user.id}`}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark text-sm font-medium text-text-main dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                    <MdOpenInNew className="text-base" />
                    View Full Profile
                </Link>

                {user.isActive ? (
                    confirmDeactivate ? (
                        <div className="space-y-2">
                            <p className="text-xs text-red-600 dark:text-red-400">This user will be unable to log in or access the platform.</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { onDeactivate(user.id); setConfirmDeactivate(false); }}
                                    disabled={mutating}
                                    className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    {mutating ? 'Processing…' : 'Confirm'}
                                </button>
                                <button
                                    onClick={() => setConfirmDeactivate(false)}
                                    className="flex-1 px-4 py-2 rounded-xl border border-border-light dark:border-border-dark text-sm font-medium text-text-main dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setConfirmDeactivate(true)}
                            disabled={mutating}
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <MdBlock className="text-base" />
                            Deactivate User
                        </button>
                    )
                ) : (
                    confirmReactivate ? (
                        <div className="space-y-2">
                            <p className="text-xs text-emerald-600 dark:text-emerald-400">This will restore the user&apos;s access to the platform.</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { onReactivate(user.id); setConfirmReactivate(false); }}
                                    disabled={mutating}
                                    className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                >
                                    {mutating ? 'Processing…' : 'Confirm'}
                                </button>
                                <button
                                    onClick={() => setConfirmReactivate(false)}
                                    className="flex-1 px-4 py-2 rounded-xl border border-border-light dark:border-border-dark text-sm font-medium text-text-main dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setConfirmReactivate(true)}
                            disabled={mutating}
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <MdCheckCircle className="text-base" />
                            Reactivate User
                        </button>
                    )
                )}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
    usePageTitle("Users");
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebounced] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);
    const [actionError, setActionError] = useState('');

    // Debounce search → reset page too
    useEffect(() => {
        const t = setTimeout(() => { setDebounced(search); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [search]);

    const params = {
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter === 'active' && { isActive: true }),
        ...(statusFilter === 'inactive' && { isActive: false }),
        page,
        limit: 20,
    };

    const { data, isLoading, error } = useAdminUsers(params);
    const deactivate = useDeactivateUser();
    const reactivate = useReactivateUser();

    const users = data?.users ?? [];
    const pagination = data?.pagination;
    const mutating = deactivate.isPending || reactivate.isPending;

    const handleDeactivate = async (userId) => {
        setActionError('');
        try {
            await deactivate.mutateAsync(userId);
            setSelectedUser(prev => prev?.id === userId ? { ...prev, isActive: false, deactivatedAt: new Date().toISOString() } : prev);
        } catch (e) {
            setActionError(e?.response?.data?.message || 'Failed to deactivate user.');
        }
    };

    const handleReactivate = async (userId) => {
        setActionError('');
        try {
            await reactivate.mutateAsync(userId);
            setSelectedUser(prev => prev?.id === userId ? { ...prev, isActive: true, deactivatedAt: null } : prev);
        } catch (e) {
            setActionError(e?.response?.data?.message || 'Failed to reactivate user.');
        }
    };

    const handleRowClick = (user) => {
        setSelectedUser(prev => prev?.id === user.id ? null : user);
        setActionError('');
    };

    return (
        <div className="flex min-h-screen relative">

            {/* ── Main content ── */}
            <div className={`flex-1 min-w-0 p-4 md:p-6 transition-all duration-300 ${selectedUser ? 'lg:mr-90' : ''}`}>

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-xl md:text-2xl font-bold text-text-main dark:text-white">Users</h1>
                    <p className="text-text-muted dark:text-slate-400 text-sm mt-0.5">
                        {pagination ? `${pagination.total.toLocaleString()} total users` : 'Manage platform users'}
                    </p>
                </div>

                {/* Filters row */}
                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                    <div className="relative flex-1 max-w-sm">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xl pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search name or email…"
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

                    <select
                        value={roleFilter}
                        onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
                        className="px-3 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                        <option value="">All Roles</option>
                        <option value="customer">Customer</option>
                        <option value="therapist">Therapist</option>
                        <option value="admin">Admin</option>
                        <option value="sub_admin">Sub-Admin</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        className="px-3 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                {/* Error banner */}
                {actionError && (
                    <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                        <MdClose className="shrink-0 text-base" />
                        {actionError}
                        <button onClick={() => setActionError('')} className="ml-auto shrink-0">
                            <MdClose className="text-sm" />
                        </button>
                    </div>
                )}

                {/* Table card */}
                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl overflow-hidden">
                    {isLoading ? (
                        <div className="p-5 space-y-3">
                            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-14" />)}
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center text-sm text-red-500">
                            Failed to load users. Please refresh the page.
                        </div>
                    ) : !users.length ? (
                        <div className="p-12 text-center">
                            <MdPeople className="text-4xl text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                            <p className="text-sm text-text-muted dark:text-slate-400">No users match your filters</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800/50">
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide">User</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide hidden md:table-cell">Email</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide">Role</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide">Status</th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide hidden lg:table-cell">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                        {users.map(user => (
                                            <tr
                                                key={user.id}
                                                onClick={() => handleRowClick(user)}
                                                className={`cursor-pointer transition-colors
                                                    ${selectedUser?.id === user.id
                                                        ? 'bg-primary/5 dark:bg-primary/10'
                                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                                                    }`}
                                            >
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                                                            {getInitials(user)}
                                                        </div>
                                                        <span className="font-medium text-text-main dark:text-white">
                                                            {getDisplayName(user)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-text-muted dark:text-slate-400 hidden md:table-cell">
                                                    {user.email}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_STYLES[user.role] ?? 'bg-slate-100 text-slate-600'}`}>
                                                        {user.role.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                        {user.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-text-muted dark:text-slate-400 hidden lg:table-cell">
                                                    {fmtDate(user.createdAt)}
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
                                            className="p-1.5 rounded-lg border border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <MdChevronLeft className="text-xl text-slate-600 dark:text-slate-300" />
                                        </button>
                                        <span className="text-sm font-medium text-text-main dark:text-white min-w-15 text-center">
                                            {page} / {pagination.totalPages}
                                        </span>
                                        <button
                                            onClick={() => setPage(p => p + 1)}
                                            disabled={page === pagination.totalPages}
                                            className="p-1.5 rounded-lg border border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
            {selectedUser && (
                <>
                    {/* Mobile backdrop */}
                    <div
                        className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                        onClick={() => setSelectedUser(null)}
                    />
                    {/* Panel */}
                    <div className="fixed right-0 top-14 lg:top-0 h-[calc(100dvh-3.5rem)] lg:h-dvh w-full max-w-90 bg-card-light dark:bg-card-dark border-l border-border-light dark:border-border-dark z-40 lg:z-20 shadow-xl flex flex-col overflow-hidden">
                        <UserSidePanel
                            user={selectedUser}
                            onClose={() => { setSelectedUser(null); setActionError(''); }}
                            onDeactivate={handleDeactivate}
                            onReactivate={handleReactivate}
                            mutating={mutating}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
    MdPeople, MdVerifiedUser, MdPendingActions, MdAttachMoney,
    MdGavel, MdCalendarMonth, MdArrowForward, MdTrendingUp,
    MdCardMembership, MdCheckCircle,
} from 'react-icons/md'
import {
    useAdminPaymentStats,
    useAdminSubscriptionStats,
    useAdminTherapists,
    useAdminDisputes,
    useAdminBookings,
    useAdminUsers,
} from '@/hooks/useAdmin';
import { useAdminUser } from '@/contexts/AdminUserContext';

// Shared primitives
const fmt$ = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
        .format(parseFloat(v) || 0);

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';

function StatusBadge({ status }) {
    const styles = {
        active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        confirmed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        released: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        pending: 'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400',
        open: 'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
        under_review: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        escrowed: 'bg-cyan-100   text-cyan-700   dark:bg-cyan-900/30   dark:text-cyan-400',
        cancelled: 'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
        rejected: 'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
        resolved: 'bg-slate-100  text-slate-500  dark:bg-slate-700     dark:text-slate-300',
    };
    return (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap ${styles[status] ?? 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'}`}>
            {status?.replace(/_/g, ' ')}
        </span>
    );
}

function Skeleton({ className }) {
    return <div className={`animate-pulse rounded bg-slate-200 dark:bg-slate-700 ${className}`} />;
}

// Stat Card
function StatCard({ icon: Icon, label, value, sub, iconBg, href, loading }) {
    const inner = (
        <div className={`bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5 h-full ${href ? 'hover:shadow-md hover:border-primary/30 transition-all' : ''}`}>
            <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${iconBg}`}>
                    <Icon className="text-xl text-white" />
                </div>
                {href && <MdArrowForward className="text-slate-300 dark:text-slate-600 text-lg mt-0.5" />}
            </div>
            {loading ? (
                <>
                    <Skeleton className="h-7 w-24 mb-1" />
                    <Skeleton className="h-3.5 w-32" />
                </>
            ) : (
                <>
                    <p className="text-2xl font-bold text-text-main dark:text-white">{value ?? '—'}</p>
                    <p className="text-sm text-text-muted dark:text-slate-400 mt-0.5">{label}</p>
                    {sub && <p className="text-xs text-text-muted dark:text-slate-500 mt-1">{sub}</p>}
                </>
            )}
        </div>
    );
    return href ? <Link href={href} className="block">{inner}</Link> : inner;
}

// Section Card
function SectionCard({ title, viewAllHref, children }) {
    return (
        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-light dark:border-border-dark">
                <h3 className="font-semibold text-text-main dark:text-white text-sm">{title}</h3>
                {viewAllHref && (
                    <Link
                        href={viewAllHref}
                        className="text-primary text-xs font-medium hover:underline flex items-center gap-0.5"
                    >
                        View all <MdArrowForward className="text-xs" />
                    </Link>
                )}
            </div>
            {children}
        </div>
    );
}

function EmptyRow({ icon: Icon, message }) {
    return (
        <div className="py-10 text-center">
            <Icon className="text-3xl text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-text-muted dark:text-slate-500">{message}</p>
        </div>
    );
}

export default function AdminDashboardPage() {
    const adminUser = useAdminUser();
    const can = (perm) => adminUser?.role === 'admin' || adminUser?.permissions?.includes(perm);

    // Only fetch data the current admin/sub-admin has permission for
    const { data: payStats, isLoading: payLoading } = useAdminPaymentStats({ enabled: can('payments') });
    const { data: subStats, isLoading: subLoading } = useAdminSubscriptionStats({ enabled: can('subscriptions') });
    const { data: usersData, isLoading: usersLoading } = useAdminUsers({ limit: 1, enabled: can('users') });
    const { data: pendingData, isLoading: pendingLoading } = useAdminTherapists({ approvalStatus: 'pending', limit: 5, enabled: can('therapists') });
    const { data: disputesData, isLoading: dispLoading } = useAdminDisputes({ status: 'open', limit: 5, enabled: can('disputes') });
    const { data: bookingsData, isLoading: bookLoading } = useAdminBookings({ limit: 6, enabled: can('bookings') });

    const activeSubscriptions = useMemo(() => {
        if (!subStats?.stats) return 0;
        return subStats.stats
            .filter(s => s.status === 'active')
            .reduce((sum, s) => sum + (s._count?.id ?? 0), 0);
    }, [subStats]);

    const totalUsers = usersData?.pagination?.total ?? 0;
    const pendingCount = pendingData?.pagination?.total ?? 0;
    const openDispCount = disputesData?.pagination?.total ?? 0;

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">

            {/* Page header */}
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-text-main dark:text-white">
                    Admin Dashboard
                </h1>
                <p className="text-text-muted dark:text-slate-400 text-sm mt-0.5">
                    Platform overview and key metrics
                </p>
            </div>

            {/* Primary stats row */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
                {can('users') && (
                    <StatCard
                        icon={MdPeople}
                        label="Total Users"
                        value={totalUsers.toLocaleString()}
                        iconBg="bg-blue-500"
                        href="/admin/users"
                        loading={usersLoading}
                    />
                )}
                {can('therapists') && (
                    <StatCard
                        icon={MdVerifiedUser}
                        label="Pending Approvals"
                        value={pendingCount}
                        sub="Therapists awaiting review"
                        iconBg="bg-amber-500"
                        href="/admin/therapists?approvalStatus=pending"
                        loading={pendingLoading}
                    />
                )}
                {can('disputes') && (
                    <StatCard
                        icon={MdGavel}
                        label="Open Disputes"
                        value={openDispCount}
                        sub="Needs attention"
                        iconBg="bg-red-500"
                        href="/admin/disputes?status=open"
                        loading={dispLoading}
                    />
                )}
                {can('payments') && (
                    <StatCard
                        icon={MdAttachMoney}
                        label="Total Revenue"
                        value={fmt$(payStats?.totalRevenue)}
                        sub={`${payStats?.totalTransactions ?? 0} transactions`}
                        iconBg="bg-emerald-500"
                        href="/admin/payments"
                        loading={payLoading}
                    />
                )}
            </div>

            {/* Secondary stats row */}
            {(can('subscriptions') || can('payments')) && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {can('subscriptions') && (
                        <StatCard
                            icon={MdCardMembership}
                            label="Active Subscriptions"
                            value={activeSubscriptions}
                            iconBg="bg-cyan-500"
                            href="/admin/subscriptions"
                            loading={subLoading}
                        />
                    )}
                    {can('payments') && (
                        <>
                            <StatCard
                                icon={MdTrendingUp}
                                label="Platform Fees"
                                value={fmt$(payStats?.totalPlatformFees)}
                                sub="All time earned"
                                iconBg="bg-indigo-500"
                                href="/admin/payments"
                                loading={payLoading}
                            />
                            <StatCard
                                icon={MdCheckCircle}
                                label="Payouts Released"
                                value={fmt$(payStats?.totalTherapistPayouts)}
                                sub="To therapists"
                                iconBg="bg-purple-500"
                                href="/admin/payments"
                                loading={payLoading}
                            />
                        </>
                    )}
                </div>
            )}

            {/* Mid row: Disputes + Pending Applications */}
            {(can('disputes') || can('therapists')) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

                    {/* Open Disputes */}
                    {can('disputes') && (
                        <SectionCard
                            title={`Open Disputes${openDispCount > 0 ? ` (${openDispCount})` : ''}`}
                            viewAllHref="/admin/disputes"
                        >
                            {dispLoading ? (
                                <div className="p-4 space-y-3">
                                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12" />)}
                                </div>
                            ) : !disputesData?.disputes?.length ? (
                                <EmptyRow icon={MdGavel} message="No open disputes" />
                            ) : (
                                <ul className="divide-y divide-border-light dark:divide-border-dark">
                                    {disputesData.disputes.map(d => (
                                        <li key={d.id}>
                                            <Link
                                                href="/admin/disputes"
                                                className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                                            >
                                                <div className="min-w-0 mr-3">
                                                    <p className="text-sm font-medium text-text-main dark:text-white truncate">
                                                        {d.title || `Dispute #${d.ticketId}`}
                                                    </p>
                                                    <p className="text-xs text-text-muted dark:text-slate-500 mt-0.5">
                                                        {fmtDate(d.createdAt)}
                                                        {d.assignedAdmin ? ` · Assigned to ${d.assignedAdmin.email}` : ' · Unassigned'}
                                                    </p>
                                                </div>
                                                <StatusBadge status={d.status} />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </SectionCard>
                    )}

                    {/* Pending Therapist Applications */}
                    {can('therapists') && (
                        <SectionCard
                            title={`Pending Applications${pendingCount > 0 ? ` (${pendingCount})` : ''}`}
                            viewAllHref="/admin/therapists?approvalStatus=pending"
                        >
                            {pendingLoading ? (
                                <div className="p-4 space-y-3">
                                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12" />)}
                                </div>
                            ) : !pendingData?.therapists?.length ? (
                                <EmptyRow icon={MdPendingActions} message="No pending applications" />
                            ) : (
                                <ul className="divide-y divide-border-light dark:divide-border-dark">
                                    {pendingData.therapists.map(t => (
                                        <li key={t.id}>
                                            <Link
                                                href={`/admin/therapists/${t.userId}`}
                                                className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                                            >
                                                <div className="h-9 w-9 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                                                    {t.fullName?.charAt(0)?.toUpperCase() || 'T'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-text-main dark:text-white truncate">
                                                        {t.fullName}
                                                    </p>
                                                    <p className="text-xs text-text-muted dark:text-slate-500 truncate">
                                                        {t.primaryLicenseType || 'Therapist'} · Applied {fmtDate(t.createdAt)}
                                                    </p>
                                                </div>
                                                <StatusBadge status="pending" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </SectionCard>
                    )}
                </div>
            )}

            {/* Recent Bookings */}
            {can('bookings') && (
                <SectionCard title="Recent Bookings" viewAllHref="/admin/bookings">
                    {bookLoading ? (
                        <div className="p-4 space-y-3">
                            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12" />)}
                        </div>
                    ) : !bookingsData?.bookings?.length ? (
                        <EmptyRow icon={MdCalendarMonth} message="No bookings yet" />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border-light dark:border-border-dark">
                                        {['Customer', 'Therapist', 'Date', 'Status', 'Amount'].map((h, i) => (
                                            <th
                                                key={h}
                                                className={`px-5 py-3 text-left text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide
                                                    ${i === 1 ? 'hidden md:table-cell' : ''}
                                                    ${i === 2 ? 'hidden lg:table-cell' : ''}
                                                    ${i === 4 ? 'text-right' : ''}`}
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                    {bookingsData.bookings.map(b => (
                                        <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
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
                                                <StatusBadge status={b.status} />
                                            </td>
                                            <td className="px-5 py-3.5 text-right font-medium text-text-main dark:text-white">
                                                {fmt$(b.payment?.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </SectionCard>
            )}

        </div>
    )

}
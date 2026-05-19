'use client';

import { useState } from 'react';
import { usePageTitle } from "@/hooks/usePageTitle";
import React from 'react';
import {
    MdHistory, MdChevronLeft, MdChevronRight,
    MdFilterList, MdExpandMore, MdExpandLess, MdWarning,
} from 'react-icons/md';
import { useAdminAuditLogs } from '@/hooks/useAdmin';

const fmtDateTime = (d) =>
    d ? new Date(d).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    }) : '—';

const ENTITY_TYPES = ['payment', 'booking', 'subscription', 'therapist', 'user', 'commission', 'request', 'offer', 'session', 'message', 'dispute'];

function Skeleton({ className }) {
    return <div className={`animate-pulse rounded bg-slate-200  ${className}`} />;
}

function ChangesViewer({ changes }) {
    if (!changes || typeof changes !== 'object' || !Object.keys(changes).length) {
        return <span className="text-text-muted  text-xs">No details</span>;
    }
    return (
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-xs">
            {Object.entries(changes).map(([key, val]) => (
                <div key={key} className="contents">
                    <dt className="text-text-muted  capitalize whitespace-nowrap font-medium">
                        {key.replace(/_/g, ' ')}
                    </dt>
                    <dd className="text-text-main  break-all">
                        {typeof val === 'object' && val !== null
                            ? JSON.stringify(val)
                            : String(val ?? '—')}
                    </dd>
                </div>
            ))}
        </dl>
    );
}

export default function AdminAuditLogsPage() {
    usePageTitle("Audit Logs");
    const [entityType, setEntityType] = useState('');
    const [actionInput, setActionInput] = useState('');
    const [action, setAction] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [page, setPage] = useState(1);
    const [expanded, setExpanded] = useState(null);

    const params = {
        ...(entityType && { entityType }),
        ...(action && { action }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        page,
        limit: 50,
    };

    const { data, isLoading, error } = useAdminAuditLogs(params);

    const logs = data?.logs ?? [];
    const pagination = data?.pagination;
    const hasFilters = entityType || action || startDate || endDate;

    const commitAction = (val) => {
        setAction(val.trim());
        setPage(1);
        setExpanded(null);
    };

    const resetFilters = () => {
        setEntityType('');
        setActionInput('');
        setAction('');
        setStartDate('');
        setEndDate('');
        setPage(1);
        setExpanded(null);
    };

    const inputCls = 'px-3 py-2.5 text-sm rounded-xl border border-border-light  bg-card-light  text-text-main  focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary';

    return (
        <div className="p-4 md:p-6">
            {/* Header */}
            <div className="mb-5">
                <h1 className="text-xl md:text-2xl font-bold text-text-main ">Audit Logs</h1>
                <p className="text-text-muted  text-sm mt-0.5">
                    {pagination ? `${pagination.total.toLocaleString()} entries` : 'Admin action history'}
                </p>
            </div>

            {/* Filters */}
            <div className="bg-card-light  border border-border-light  rounded-xl p-4 mb-5">
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex items-center gap-2">
                        <MdFilterList className="text-text-muted  text-lg shrink-0" />
                        <select
                            value={entityType}
                            onChange={e => { setEntityType(e.target.value); setPage(1); setExpanded(null); }}
                            className={inputCls}
                        >
                            <option value="">All Entity Types</option>
                            {ENTITY_TYPES.map(t => (
                                <option key={t} value={t}>
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <input
                        type="text"
                        placeholder="Action (e.g. payment.released)…"
                        value={actionInput}
                        onChange={e => setActionInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') commitAction(e.target.value); }}
                        onBlur={e => commitAction(e.target.value)}
                        className={`${inputCls} min-w-52`}
                    />

                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => { setStartDate(e.target.value); setPage(1); setExpanded(null); }}
                            title="From date"
                            className={inputCls}
                        />
                        <span className="text-text-muted  text-sm shrink-0">to</span>
                        <input
                            type="date"
                            value={endDate}
                            min={startDate || undefined}
                            onChange={e => { setEndDate(e.target.value); setPage(1); setExpanded(null); }}
                            title="To date"
                            className={inputCls}
                        />
                    </div>

                    {hasFilters && (
                        <button
                            onClick={resetFilters}
                            className="px-3 py-2.5 text-sm rounded-xl border border-border-light  text-text-muted  hover:text-text-main  hover:border-primary/40 transition-colors"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-card-light  border border-border-light  rounded-xl overflow-hidden">
                {isLoading ? (
                    <div className="p-5 space-y-3">
                        {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-12" />)}
                    </div>
                ) : error ? (
                    <div className="p-12 text-center flex flex-col items-center gap-2">
                        <MdWarning className="text-3xl text-red-400" />
                        <p className="text-sm text-red-500">Failed to load audit logs. Please refresh.</p>
                    </div>
                ) : !logs.length ? (
                    <div className="p-12 text-center">
                        <MdHistory className="text-4xl text-slate-300  mx-auto mb-2" />
                        <p className="text-sm text-text-muted ">No audit log entries found</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border-light  bg-slate-50 ">
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted  uppercase tracking-wide">Timestamp</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted  uppercase tracking-wide hidden md:table-cell">Actor</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted  uppercase tracking-wide">Action</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted  uppercase tracking-wide hidden lg:table-cell">Entity Type</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted  uppercase tracking-wide hidden lg:table-cell">Entity ID</th>
                                        <th className="px-5 py-3 text-right text-xs font-semibold text-text-muted  uppercase tracking-wide">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-light ">
                                    {logs.map(log => {
                                        const isExpanded = expanded === log.id;
                                        const hasChanges = log.changes && typeof log.changes === 'object'
                                            && Object.keys(log.changes).length > 0;
                                        return (
                                            <React.Fragment key={log.id}>
                                                <tr
                                                    onClick={() => hasChanges && setExpanded(isExpanded ? null : log.id)}
                                                    className={`transition-colors
                                                        ${hasChanges ? 'cursor-pointer' : ''}
                                                        ${isExpanded
                                                            ? 'bg-primary/5 '
                                                            : hasChanges
                                                                ? 'hover:bg-slate-50 '
                                                                : ''}`}
                                                >
                                                    <td className="px-5 py-3.5 text-text-muted  whitespace-nowrap text-xs">
                                                        {fmtDateTime(log.createdAt)}
                                                    </td>
                                                    <td className="px-5 py-3.5 hidden md:table-cell">
                                                        {log.actor ? (
                                                            <>
                                                                <p className="font-medium text-text-main  truncate max-w-48">
                                                                    {log.actor.email}
                                                                </p>
                                                                {log.actor.role && (
                                                                    <p className="text-xs text-text-muted  capitalize">
                                                                        {log.actor.role.replace('_', ' ')}
                                                                    </p>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600  bg-amber-50  px-2 py-0.5 rounded-full">
                                                                System
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span className="font-mono text-xs bg-slate-100  text-text-main  px-2 py-1 rounded-lg whitespace-nowrap">
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 hidden lg:table-cell text-text-muted  capitalize text-sm">
                                                        {log.entityType || '—'}
                                                    </td>
                                                    <td className="px-5 py-3.5 hidden lg:table-cell">
                                                        <span
                                                            className="font-mono text-xs text-text-muted "
                                                            title={log.entityId || undefined}
                                                        >
                                                            {log.entityId ? `${log.entityId.slice(0, 8)}…` : '—'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right">
                                                        {hasChanges ? (
                                                            <button
                                                                onClick={e => {
                                                                    e.stopPropagation();
                                                                    setExpanded(isExpanded ? null : log.id);
                                                                }}
                                                                className="p-1 rounded-lg hover:bg-slate-200  text-text-muted  transition-colors"
                                                                title={isExpanded ? 'Collapse' : 'View changes'}
                                                            >
                                                                {isExpanded
                                                                    ? <MdExpandLess className="text-lg" />
                                                                    : <MdExpandMore className="text-lg" />}
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-slate-300 ">—</span>
                                                        )}
                                                    </td>
                                                </tr>

                                                {isExpanded && hasChanges && (
                                                    <tr className="bg-primary/5 ">
                                                        <td colSpan={6} className="px-5 py-4 border-b border-border-light ">
                                                            <p className="text-xs font-semibold text-text-muted  uppercase tracking-wide mb-2">Changes</p>
                                                            <div className="max-w-md">
                                                                <ChangesViewer changes={log.changes} />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between px-5 py-4 border-t border-border-light ">
                                <p className="text-sm text-text-muted ">
                                    {(page - 1) * pagination.limit + 1}–{Math.min(page * pagination.limit, pagination.total)} of {pagination.total.toLocaleString()}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPage(p => p - 1)}
                                        disabled={page === 1}
                                        className="p-1.5 rounded-lg border border-border-light  hover:bg-slate-50  disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <MdChevronLeft className="text-xl text-slate-600 " />
                                    </button>
                                    <span className="text-sm font-medium text-text-main  min-w-15 text-center">
                                        {page} / {pagination.totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={page === pagination.totalPages}
                                        className="p-1.5 rounded-lg border border-border-light  hover:bg-slate-50  disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <MdChevronRight className="text-xl text-slate-600 " />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

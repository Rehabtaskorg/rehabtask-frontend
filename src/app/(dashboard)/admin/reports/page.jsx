'use client';

import { useState } from 'react';
import { usePageTitle } from "@/hooks/usePageTitle";
import {
    MdDownload, MdCalendarMonth, MdPayments, MdPeople, MdWarning,
} from 'react-icons/md';
import { adminReportsApi } from '@/services/admin.api';

const BOOKING_STATUS_OPTIONS = [
    '', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'reschedule_requested',
];
const PAYMENT_STATUS_OPTIONS = [
    '', 'intent_created', 'escrowed', 'released', 'refunded', 'failed',
];
const ROLE_OPTIONS = ['', 'customer', 'therapist', 'admin', 'sub_admin'];

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function ReportCard({ icon: Icon, iconBg, title, description, children, onDownload, loading, error }) {
    return (
        <div className="bg-card-light  border border-border-light  rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-xl ${iconBg} shrink-0`}>
                    <Icon className="text-xl text-white" />
                </div>
                <div>
                    <h3 className="font-semibold text-text-main ">{title}</h3>
                    <p className="text-sm text-text-muted  mt-0.5">{description}</p>
                </div>
            </div>

            <div className="flex-1 space-y-3">{children}</div>

            {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50  text-red-600  text-sm">
                    <MdWarning className="shrink-0 text-base" /> {error}
                </div>
            )}

            <button
                onClick={onDownload}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
                <MdDownload className="text-base" />
                {loading ? 'Generating…' : 'Download CSV'}
            </button>
        </div>
    );
}

export default function AdminReportsPage() {
    usePageTitle("Reports");
    const today = new Date().toISOString().split('T')[0];

    const inputCls = 'w-full px-3 py-2.5 text-sm rounded-xl border border-border-light  bg-background-light  text-text-main  focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary';
    const labelCls = 'block text-xs font-medium text-text-muted  mb-1';

    // Bookings report
    const [bStart, setBStart] = useState('');
    const [bEnd, setBEnd] = useState('');
    const [bStatus, setBStatus] = useState('');
    const [bLoading, setBLoading] = useState(false);
    const [bError, setBError] = useState('');

    // Payments report
    const [pStart, setPStart] = useState('');
    const [pEnd, setPEnd] = useState('');
    const [pStatus, setPStatus] = useState('');
    const [pLoading, setPLoading] = useState(false);
    const [pError, setPError] = useState('');

    // Users report
    const [uStart, setUStart] = useState('');
    const [uEnd, setUEnd] = useState('');
    const [uRole, setURole] = useState('');
    const [uLoading, setULoading] = useState(false);
    const [uError, setUError] = useState('');

    const handleDownload = async (apiFn, params, filename, setLoading, setError) => {
        setError('');
        if (!params.startDate || !params.endDate) {
            setError('Both start and end dates are required.');
            return;
        }
        setLoading(true);
        try {
            const res = await apiFn(params);
            downloadBlob(res.data, filename);
        } catch (e) {
            // Response may be a blob containing a JSON error body
            const responseData = e?.response?.data;
            if (responseData instanceof Blob) {
                const text = await responseData.text().catch(() => '');
                try {
                    const parsed = JSON.parse(text);
                    setError(parsed?.message || 'Failed to generate report.');
                } catch {
                    setError('Failed to generate report.');
                }
            } else {
                setError(e?.response?.data?.message || 'Failed to generate report.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-6">
            <div className="mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-text-main ">Reports</h1>
                <p className="text-text-muted  text-sm mt-0.5">
                    Export platform data as CSV. Both dates are required; maximum range is 366 days.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                {/* Bookings Report */}
                <ReportCard
                    icon={MdCalendarMonth}
                    iconBg="bg-primary"
                    title="Bookings Report"
                    description="Session bookings with customer, therapist, scheduled date, rate, and status."
                    loading={bLoading}
                    error={bError}
                    onDownload={() => handleDownload(
                        adminReportsApi.bookings,
                        { startDate: bStart, endDate: bEnd, ...(bStatus && { status: bStatus }) },
                        `bookings-report-${today}.csv`,
                        setBLoading, setBError,
                    )}
                >
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Start Date *</label>
                            <input
                                type="date"
                                value={bStart}
                                onChange={e => setBStart(e.target.value)}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>End Date *</label>
                            <input
                                type="date"
                                value={bEnd}
                                min={bStart || undefined}
                                onChange={e => setBEnd(e.target.value)}
                                className={inputCls}
                            />
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>Status (optional)</label>
                        <select value={bStatus} onChange={e => setBStatus(e.target.value)} className={inputCls}>
                            {BOOKING_STATUS_OPTIONS.map(s => (
                                <option key={s} value={s}>
                                    {s ? s.replace(/_/g, ' ') : 'All statuses'}
                                </option>
                            ))}
                        </select>
                    </div>
                </ReportCard>

                {/* Payments Report */}
                <ReportCard
                    icon={MdPayments}
                    iconBg="bg-emerald-500"
                    title="Payments Report"
                    description="Payment transactions with amounts, platform fees, therapist payouts, and status."
                    loading={pLoading}
                    error={pError}
                    onDownload={() => handleDownload(
                        adminReportsApi.payments,
                        { startDate: pStart, endDate: pEnd, ...(pStatus && { status: pStatus }) },
                        `payments-report-${today}.csv`,
                        setPLoading, setPError,
                    )}
                >
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Start Date *</label>
                            <input
                                type="date"
                                value={pStart}
                                onChange={e => setPStart(e.target.value)}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>End Date *</label>
                            <input
                                type="date"
                                value={pEnd}
                                min={pStart || undefined}
                                onChange={e => setPEnd(e.target.value)}
                                className={inputCls}
                            />
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>Status (optional)</label>
                        <select value={pStatus} onChange={e => setPStatus(e.target.value)} className={inputCls}>
                            {PAYMENT_STATUS_OPTIONS.map(s => (
                                <option key={s} value={s}>
                                    {s ? s.replace(/_/g, ' ') : 'All statuses'}
                                </option>
                            ))}
                        </select>
                    </div>
                </ReportCard>

                {/* Users Report */}
                <ReportCard
                    icon={MdPeople}
                    iconBg="bg-violet-500"
                    title="User Activity Report"
                    description="Users registered in the date range with role, name, and verification status."
                    loading={uLoading}
                    error={uError}
                    onDownload={() => handleDownload(
                        adminReportsApi.users,
                        { startDate: uStart, endDate: uEnd, ...(uRole && { role: uRole }) },
                        `users-report-${today}.csv`,
                        setULoading, setUError,
                    )}
                >
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Start Date *</label>
                            <input
                                type="date"
                                value={uStart}
                                onChange={e => setUStart(e.target.value)}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>End Date *</label>
                            <input
                                type="date"
                                value={uEnd}
                                min={uStart || undefined}
                                onChange={e => setUEnd(e.target.value)}
                                className={inputCls}
                            />
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>Role (optional)</label>
                        <select value={uRole} onChange={e => setURole(e.target.value)} className={inputCls}>
                            {ROLE_OPTIONS.map(r => (
                                <option key={r} value={r}>
                                    {r ? r.replace('_', ' ') : 'All roles'}
                                </option>
                            ))}
                        </select>
                    </div>
                </ReportCard>

            </div>
        </div>
    );
}

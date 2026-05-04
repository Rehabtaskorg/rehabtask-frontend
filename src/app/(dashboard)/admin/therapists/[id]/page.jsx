'use client';

import { useState } from 'react';
import { usePageTitle } from "@/hooks/usePageTitle";
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    MdArrowBack, MdVerifiedUser, MdDescription, MdLocationOn,
    MdCheckCircle, MdEmail, MdCalendarMonth, MdPerson,
    MdThumbUp, MdThumbDown, MdOpenInNew, MdWarning,
} from 'react-icons/md';
import {
    useAdminTherapist,
    useApproveTherapist,
    useRejectTherapist,
} from '@/hooks/useAdmin';
import { adminTherapistsApi } from '@/lib/admin';

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—';

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

function SectionCard({ title, children }) {
    return (
        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border-light dark:border-border-dark">
                <h3 className="font-semibold text-text-main dark:text-white text-sm">{title}</h3>
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}

const formatFileSize = (bytes) => {
    if (!bytes) return null;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
};

function DocumentRow({ doc, therapistUserId }) {
    const [loading, setLoading] = useState(false);

    const handleView = async () => {
        setLoading(true);
        try {
            const { data } = await adminTherapistsApi.getDocumentUrl(therapistUserId, doc.id);
            window.open(data.data.signedUrl, '_blank');
        } catch {
            alert('Failed to load document. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fileSize = formatFileSize(doc.fileSize);
    const meta = [
        doc.documentType?.replace(/_/g, ' '),
        fileSize,
    ].filter(Boolean).join(' · ');

    return (
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border-light dark:border-border-dark">
            <div className="flex items-center gap-3 min-w-0">
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 shrink-0">
                    <MdDescription className="text-blue-600 dark:text-blue-400 text-base" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-text-main dark:text-white truncate">
                        {doc.fileName || 'License Document'}
                    </p>
                    <p className="text-xs text-text-muted dark:text-slate-500">
                        {meta && <span className="capitalize">{meta}</span>}
                        {meta && ' · '}Uploaded {fmtDate(doc.uploadedAt || doc.createdAt)}
                    </p>
                </div>
            </div>
            <div className="shrink-0">
                <button
                    onClick={handleView}
                    disabled={loading}
                    className="inline-flex items-center gap-1 text-primary text-xs font-medium hover:underline disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'View'} <MdOpenInNew className="text-sm" />
                </button>
            </div>
        </div>
    );
}

export default function AdminTherapistDetailPage() {
    usePageTitle("Therapist Details");
    const { id } = useParams();

    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectError, setRejectError] = useState('');
    const [actionError, setActionError] = useState('');
    const [actionSuccess, setActionSuccess] = useState('');

    const { data: therapist, isLoading, error } = useAdminTherapist(id);
    const approve = useApproveTherapist();
    const reject = useRejectTherapist();
    const mutating = approve.isPending || reject.isPending;

    const handleApprove = async () => {
        setActionError(''); setActionSuccess('');
        try {
            await approve.mutateAsync(id);
            setActionSuccess('Application approved. The therapist will receive an email notification.');
        } catch (e) {
            setActionError(e?.response?.data?.message || 'Failed to approve application.');
        }
    };

    const handleReject = async () => {
        if (rejectReason.trim().length < 10) {
            setRejectError('Please provide a reason of at least 10 characters.');
            return;
        }
        setRejectError(''); setActionError(''); setActionSuccess('');
        try {
            await reject.mutateAsync({ therapistUserId: id, reason: rejectReason.trim() });
            setActionSuccess('Application rejected. The therapist will receive an email notification.');
            setShowRejectForm(false);
        } catch (e) {
            setActionError(e?.response?.data?.message || 'Failed to reject application.');
        }
    };

    if (isLoading) {
        return (
            <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-36 rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Skeleton className="h-52 rounded-xl" />
                    <Skeleton className="h-52 rounded-xl" />
                </div>
                <Skeleton className="h-44 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
            </div>
        );
    }

    if (error || !therapist) {
        return (
            <div className="p-4 md:p-6 max-w-4xl mx-auto">
                <Link href="/admin/therapists" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary mb-6 transition-colors">
                    <MdArrowBack /> Back to Therapists
                </Link>
                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-12 text-center">
                    <MdVerifiedUser className="text-4xl text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-text-muted dark:text-slate-400">Therapist profile not found.</p>
                </div>
            </div>
        );
    }

    const tp = therapist.therapistProfile;
    const isPending = ['pending', 'review'].includes(tp?.approvalStatus);
    const isApproved = tp?.approvalStatus === 'approved';
    const isRejected = tp?.approvalStatus === 'rejected';

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">

            {/* Back nav */}
            <Link
                href="/admin/therapists"
                className="inline-flex items-center gap-1.5 text-sm text-text-muted dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
            >
                <MdArrowBack className="text-base" /> Back to Therapists
            </Link>

            {/* Status feedback */}
            {actionSuccess && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm">
                    <MdCheckCircle className="shrink-0 text-lg" /> {actionSuccess}
                </div>
            )}
            {actionError && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                    <MdWarning className="shrink-0 text-lg" /> {actionError}
                </div>
            )}

            {/* Profile header */}
            <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-xl font-bold text-primary shrink-0">
                        {tp?.fullName?.charAt(0)?.toUpperCase() || 'T'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h1 className="text-lg font-bold text-text-main dark:text-white">{tp?.fullName}</h1>
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[tp?.approvalStatus] ?? 'bg-slate-100 text-slate-600'}`}>
                                {tp?.approvalStatus}
                            </span>
                        </div>
                        <p className="text-sm text-text-muted dark:text-slate-400">{therapist.email}</p>
                        <p className="text-xs text-text-muted dark:text-slate-500 mt-1">
                            Applied {fmtDate(therapist.createdAt)}
                        </p>
                    </div>
                    {/* Quick link to user account */}
                    <Link
                        href={`/admin/users/${therapist.id}`}
                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark text-xs text-text-muted dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        <MdOpenInNew className="text-sm" /> User Account
                    </Link>
                </div>
            </div>

            {/* 2-column grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Professional info */}
                <SectionCard title="Professional Information">
                    <dl className="space-y-3 text-sm">
                        <div className="flex justify-between gap-3">
                            <dt className="text-text-muted dark:text-slate-400">Primary Discipline type</dt>
                            <dd className="font-medium text-text-main dark:text-white text-right">
                                {tp?.primaryLicenseType || '—'}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-3">
                            <dt className="text-text-muted dark:text-slate-400">Onboarding progress</dt>
                            <dd className={`font-medium capitalize ${tp?.onboardingComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                {tp?.onboardingComplete ? 'Complete' : `Step ${tp?.onboardingStep ?? 1} of 5`}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-3">
                            <dt className="text-text-muted dark:text-slate-400">Service areas</dt>
                            <dd className="font-medium text-text-main dark:text-white">
                                {tp?.workAreas?.length ?? 0} configured
                            </dd>
                        </div>
                        <div className="flex justify-between gap-3">
                            <dt className="text-text-muted dark:text-slate-400">Stripe connected</dt>
                            <dd className={`font-medium ${tp?.stripeAccountId ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                {tp?.stripeAccountId ? 'Yes' : 'No'}
                            </dd>
                        </div>
                        {tp?.bio && (
                            <div className="pt-3 border-t border-border-light dark:border-border-dark">
                                <dt className="text-text-muted dark:text-slate-400 mb-1.5">Bio</dt>
                                <dd className="text-text-main dark:text-slate-200 leading-relaxed text-sm">
                                    {tp.bio}
                                </dd>
                            </div>
                        )}
                    </dl>
                </SectionCard>

                {/* Account / decision history */}
                <SectionCard title="Account & Decision">
                    <dl className="space-y-3 text-sm">
                        <div className="flex justify-between gap-3">
                            <dt className="text-text-muted dark:text-slate-400">Account status</dt>
                            <dd className={`font-medium ${therapist.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                                {therapist.isActive ? 'Active' : 'Deactivated'}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-3">
                            <dt className="text-text-muted dark:text-slate-400">Registered</dt>
                            <dd className="font-medium text-text-main dark:text-white">{fmtDate(therapist.createdAt)}</dd>
                        </div>
                        <div className="flex justify-between gap-3">
                            <dt className="text-text-muted dark:text-slate-400">Approval status</dt>
                            <dd className={`font-medium capitalize ${isApproved ? 'text-emerald-600 dark:text-emerald-400' :
                                isRejected ? 'text-red-600 dark:text-red-400' :
                                    'text-amber-600 dark:text-amber-400'
                                }`}>
                                {tp?.approvalStatus}
                            </dd>
                        </div>
                        {isRejected && tp?.rejectionReason && (
                            <div className="pt-3 border-t border-border-light dark:border-border-dark">
                                <dt className="text-text-muted dark:text-slate-400 mb-1.5">Rejection reason</dt>
                                <dd className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl leading-relaxed">
                                    {tp.rejectionReason}
                                </dd>
                            </div>
                        )}
                    </dl>
                </SectionCard>

            </div> {/* end 2-col grid */}

            {/* License Documents */}
            <SectionCard title={`License Documents (${tp?.licenseDocuments?.length ?? 0})`}>
                {!tp?.licenseDocuments?.length ? (
                    <p className="text-sm text-text-muted dark:text-slate-500 py-2">No documents uploaded yet.</p>
                ) : (
                    <div className="space-y-2.5">
                        {tp.licenseDocuments.map(doc => (
                            <DocumentRow key={doc.id} doc={doc} therapistUserId={id} />
                        ))}
                    </div>
                )}
            </SectionCard>

            {/* Service Areas */}
            {!!tp?.workAreas?.length && (
                <SectionCard title={`Service Areas (${tp.workAreas.length})`}>
                    <div className="space-y-2">
                        {tp.workAreas.map(area => (
                            <div key={area.id} className="flex items-start gap-2.5 text-sm">
                                <MdLocationOn className="text-base text-text-muted dark:text-slate-400 mt-0.5 shrink-0" />
                                <span className="text-text-main dark:text-slate-200">
                                    {[area.city, area.state, area.zipCode].filter(Boolean).join(', ')}
                                    {area.radiusMiles && (
                                        <span className="text-text-muted dark:text-slate-400 ml-1.5">
                                            ({area.radiusMiles} mi radius)
                                        </span>
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            )}

            {/* ── Approval Decision Panel (pending/review, before any action taken) ── */}
            {isPending && !actionSuccess && (
                <div className="bg-card-light dark:bg-card-dark border-2 border-amber-200 dark:border-amber-700 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-200 dark:border-amber-700">
                        <h3 className="font-semibold text-amber-800 dark:text-amber-300 text-sm flex items-center gap-2">
                            <MdVerifiedUser className="text-base" />
                            Approval Decision Required
                        </h3>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                            Review all documents and service areas before making a decision.
                        </p>
                    </div>

                    <div className="p-5 space-y-4">
                        {/* Reject reason textarea — shown after clicking Reject */}
                        {showRejectForm && (
                            <div className="space-y-2">
                                <label className="block">
                                    <span className="text-sm font-medium text-text-main dark:text-white">
                                        Rejection Reason
                                        <span className="text-text-muted dark:text-slate-400 font-normal ml-1">
                                            (min. 10 characters)
                                        </span>
                                    </span>
                                    <textarea
                                        value={rejectReason}
                                        onChange={e => { setRejectReason(e.target.value); setRejectError(''); }}
                                        placeholder="Explain why this application is being rejected…"
                                        rows={4}
                                        maxLength={500}
                                        className="mt-1.5 w-full px-3 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-700 focus:border-red-400"
                                    />
                                </label>
                                <div className="flex items-center justify-between">
                                    {rejectError
                                        ? <p className="text-xs text-red-500">{rejectError}</p>
                                        : <span />
                                    }
                                    <p className="text-xs text-text-muted dark:text-slate-500">{rejectReason.length}/500</p>
                                </div>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {!showRejectForm ? (
                                <>
                                    <button
                                        onClick={handleApprove}
                                        disabled={mutating}
                                        className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                                    >
                                        <MdThumbUp className="text-base" />
                                        {mutating ? 'Processing…' : 'Approve Application'}
                                    </button>
                                    <button
                                        onClick={() => setShowRejectForm(true)}
                                        disabled={mutating}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                                    >
                                        <MdThumbDown className="text-base" />
                                        Reject Application
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleReject}
                                        disabled={mutating}
                                        className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                                    >
                                        <MdThumbDown className="text-base" />
                                        {mutating ? 'Rejecting…' : 'Confirm Rejection'}
                                    </button>
                                    <button
                                        onClick={() => { setShowRejectForm(false); setRejectReason(''); setRejectError(''); }}
                                        disabled={mutating}
                                        className="px-5 py-3 rounded-xl border border-border-light dark:border-border-dark text-text-main dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

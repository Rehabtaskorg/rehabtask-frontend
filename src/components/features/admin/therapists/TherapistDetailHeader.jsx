import Link from 'next/link';
import { MdArrowBack, MdCheckCircle, MdWarning, MdOpenInNew } from 'react-icons/md';
import { PendingReviewBadge } from '@/components/features/admin/PendingReviewBadge';
import { THERAPIST_STATUS_STYLES, THERAPIST_STATUS_FALLBACK, fmtDateLong } from './therapistStatusStyles';

/**
 * Back navigation, action feedback banners and the profile header block
 * for the therapist detail page.
 * @param {{ therapist: object, actionSuccess: string, actionError: string }} props
 */
export function TherapistDetailHeader({ therapist, actionSuccess, actionError }) {
    const tp = therapist.therapistProfile;

    return (
        <>
            <Link
                href="/admin/therapists"
                className="inline-flex items-center gap-1.5 text-sm text-text-muted  hover:text-primary  transition-colors"
            >
                <MdArrowBack className="text-base" /> Back to Therapists
            </Link>

            {actionSuccess && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50  text-emerald-700  text-sm">
                    <MdCheckCircle className="shrink-0 text-lg" /> {actionSuccess}
                </div>
            )}
            {actionError && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50  text-red-600  text-sm">
                    <MdWarning className="shrink-0 text-lg" /> {actionError}
                </div>
            )}

            <div className="bg-card-light  border border-border-light  rounded-xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10  flex items-center justify-center text-xl font-bold text-primary shrink-0">
                        {tp?.fullName?.charAt(0)?.toUpperCase() || 'T'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h1 className="text-lg font-bold text-text-main ">{tp?.fullName}</h1>
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${THERAPIST_STATUS_STYLES[tp?.approvalStatus] ?? THERAPIST_STATUS_FALLBACK}`}>
                                {tp?.approvalStatus}
                            </span>
                            <PendingReviewBadge pendingReviewAt={tp?.pendingReviewAt} size="md" />
                        </div>
                        <p className="text-sm text-text-muted ">{therapist.email}</p>
                        <p className="text-xs text-text-muted  mt-1">
                            Applied {fmtDateLong(therapist.createdAt)}
                        </p>
                    </div>
                    <Link
                        href={`/admin/users/${therapist.id}`}
                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-light  text-xs text-text-muted  hover:bg-slate-50  transition-colors"
                    >
                        <MdOpenInNew className="text-sm" /> User Account
                    </Link>
                </div>
            </div>
        </>
    );
}

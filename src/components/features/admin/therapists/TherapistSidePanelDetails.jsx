import { MdDescription, MdCheckCircle } from 'react-icons/md';
import UserAvatar from '@/components/ui/UserAvatar';
import { PendingReviewBadge } from '@/components/features/admin/PendingReviewBadge';
import { APPROVAL_STATUS } from '@/lib/constants';
import { THERAPIST_STATUS_STYLES, THERAPIST_STATUS_FALLBACK, fmtDate } from './therapistStatusStyles';

/**
 * Identity, status badge, application details and action feedback
 * for a therapist inside the review side panel.
 * @param {{ therapist: object, error: string, success: string }} props
 */
export function TherapistSidePanelDetails({ therapist, error, success }) {
    const profile = therapist.therapistProfile;

    return (
        <>
            <div className="flex items-center gap-3">
                <UserAvatar
                    name={profile?.fullName}
                    photoUrl={profile?.profilePhotoUrl}
                    size="md"
                />
                <div className="min-w-0">
                    <p className="font-semibold text-text-main  truncate">{profile?.fullName}</p>
                    <p className="text-sm text-text-muted  truncate">{therapist.email}</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${THERAPIST_STATUS_STYLES[profile?.approvalStatus] ?? THERAPIST_STATUS_FALLBACK}`}>
                    {profile?.approvalStatus}
                </span>
                <PendingReviewBadge pendingReviewAt={profile?.pendingReviewAt} size="md" />
            </div>

            <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                    <dt className="text-text-muted ">Discipline type</dt>
                    <dd className="font-medium text-text-main  text-right">
                        {profile?.primaryLicenseType || '—'}
                    </dd>
                </div>
                <div className="flex justify-between gap-3">
                    <dt className="text-text-muted ">Applied</dt>
                    <dd className="font-medium text-text-main ">
                        {fmtDate(therapist.createdAt)}
                    </dd>
                </div>
                <div className="flex justify-between gap-3">
                    <dt className="text-text-muted  flex items-center gap-1">
                        <MdDescription className="text-sm" /> Documents
                    </dt>
                    <dd className="font-medium text-text-main ">
                        {profile?.licenseDocuments?.length ?? 0} uploaded
                    </dd>
                </div>
                {profile?.approvalStatus === APPROVAL_STATUS.REJECTED && profile?.rejectionReason && (
                    <div>
                        <dt className="text-text-muted  mb-1.5">Rejection reason</dt>
                        <dd className="text-sm text-red-600  bg-red-50  p-3 rounded-xl leading-relaxed">
                            {profile.rejectionReason}
                        </dd>
                    </div>
                )}
            </dl>

            {error && (
                <div className="px-3 py-2.5 rounded-xl bg-red-50  text-red-600  text-sm">
                    {error}
                </div>
            )}
            {success && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50  text-emerald-600  text-sm">
                    <MdCheckCircle className="shrink-0" /> {success}
                </div>
            )}
        </>
    );
}

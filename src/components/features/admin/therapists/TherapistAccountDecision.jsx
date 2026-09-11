import { APPROVAL_STATUS } from '@/lib/constants';
import { TherapistVerificationToggles } from '@/components/features/admin/TherapistVerificationToggles';
import { SectionCard } from './SectionCard';
import { fmtDateLong } from './therapistStatusStyles';

/**
 * "Account & Decision" card — account status, registration date, approval
 * status, rejection reason, and the document-verification toggles.
 * @param {{ therapist: object, therapistUserId: string }} props
 */
export function TherapistAccountDecision({ therapist, therapistUserId }) {
    const tp = therapist.therapistProfile;
    const isApproved = tp?.approvalStatus === APPROVAL_STATUS.APPROVED;
    const isRejected = tp?.approvalStatus === APPROVAL_STATUS.REJECTED;

    return (
        <SectionCard title="Account & Decision">
            <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                    <dt className="text-text-muted ">Account status</dt>
                    <dd className={`font-medium ${therapist.isActive ? 'text-emerald-600 ' : 'text-red-500 '}`}>
                        {therapist.isActive ? 'Active' : 'Deactivated'}
                    </dd>
                </div>
                <div className="flex justify-between gap-3">
                    <dt className="text-text-muted ">Registered</dt>
                    <dd className="font-medium text-text-main ">{fmtDateLong(therapist.createdAt)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                    <dt className="text-text-muted ">Approval status</dt>
                    <dd className={`font-medium capitalize ${isApproved ? 'text-emerald-600 ' :
                        isRejected ? 'text-red-600 ' :
                            'text-amber-600 '
                        }`}>
                        {tp?.approvalStatus}
                    </dd>
                </div>
                {isRejected && tp?.rejectionReason && (
                    <div className="pt-3 border-t border-border-light ">
                        <dt className="text-text-muted  mb-1.5">Rejection reason</dt>
                        <dd className="text-sm text-red-600  bg-red-50  p-3 rounded-xl leading-relaxed">
                            {tp.rejectionReason}
                        </dd>
                    </div>
                )}
            </dl>
            <div className="mt-4 pt-4 border-t border-border-light">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Document Verification</p>
                <TherapistVerificationToggles
                    therapistUserId={therapistUserId}
                    licenseVerified={tp?.licenseVerified ?? false}
                    insuranceVerified={tp?.insuranceVerified ?? false}
                />
            </div>
        </SectionCard>
    );
}

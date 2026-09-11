'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MdArrowBack, MdVerifiedUser } from 'react-icons/md';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
    useAdminTherapist,
    useApproveTherapist,
    useRejectTherapist,
} from '@/hooks/useAdmin';
import { APPROVAL_STATUS } from '@/lib/constants';
import { TherapistSkeleton } from './TherapistSkeleton';
import { TherapistDetailHeader } from './TherapistDetailHeader';
import { TherapistProfessionalInfo } from './TherapistProfessionalInfo';
import { TherapistAccountDecision } from './TherapistAccountDecision';
import { TherapistDocumentsSection } from './TherapistDocumentsSection';
import { TherapistServiceAreas } from './TherapistServiceAreas';
import { TherapistApprovalDecisionPanel } from './TherapistApprovalDecisionPanel';

const REVIEWABLE_STATUSES = [APPROVAL_STATUS.PENDING, APPROVAL_STATUS.REVIEW];

/**
 * Admin therapist detail view — full profile, documents, service areas and the
 * approve / reject decision flow.
 */
export function AdminTherapistDetail() {
    usePageTitle('Therapist Details');
    const { id } = useParams();

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

    const handleReject = async (reason) => {
        setActionError(''); setActionSuccess('');
        try {
            await reject.mutateAsync({ therapistUserId: id, reason });
            setActionSuccess('Application rejected. The therapist will receive an email notification.');
        } catch (e) {
            setActionError(e?.response?.data?.message || 'Failed to reject application.');
        }
    };

    if (isLoading) {
        return (
            <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
                <TherapistSkeleton className="h-8 w-32" />
                <TherapistSkeleton className="h-36 rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <TherapistSkeleton className="h-52 rounded-xl" />
                    <TherapistSkeleton className="h-52 rounded-xl" />
                </div>
                <TherapistSkeleton className="h-44 rounded-xl" />
                <TherapistSkeleton className="h-40 rounded-xl" />
            </div>
        );
    }

    if (error || !therapist) {
        return (
            <div className="p-4 md:p-6 max-w-4xl mx-auto">
                <Link href="/admin/therapists" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary mb-6 transition-colors">
                    <MdArrowBack /> Back to Therapists
                </Link>
                <div className="bg-card-light  border border-border-light  rounded-xl p-12 text-center">
                    <MdVerifiedUser className="text-4xl text-slate-300  mx-auto mb-2" />
                    <p className="text-sm text-text-muted ">Therapist profile not found.</p>
                </div>
            </div>
        );
    }

    const tp = therapist.therapistProfile;
    const isPending = REVIEWABLE_STATUSES.includes(tp?.approvalStatus);

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
            <TherapistDetailHeader
                therapist={therapist}
                actionSuccess={actionSuccess}
                actionError={actionError}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <TherapistProfessionalInfo profile={tp} />
                <TherapistAccountDecision therapist={therapist} therapistUserId={id} />
            </div>

            <TherapistDocumentsSection documents={tp?.licenseDocuments} therapistUserId={id} />

            <TherapistServiceAreas workAreas={tp?.workAreas} />

            {isPending && !actionSuccess && (
                <TherapistApprovalDecisionPanel
                    mutating={mutating}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            )}
        </div>
    );
}

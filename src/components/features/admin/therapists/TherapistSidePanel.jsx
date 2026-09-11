/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MdClose, MdOpenInNew, MdCheckCircle, MdThumbDown } from 'react-icons/md';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { APPROVAL_STATUS } from '@/lib/constants';
import { TherapistSidePanelDetails } from './TherapistSidePanelDetails';
import { TherapistRejectForm } from './TherapistRejectForm';

const REVIEWABLE_STATUSES = [APPROVAL_STATUS.PENDING, APPROVAL_STATUS.REVIEW];

/**
 * Slide-in panel for reviewing a single therapist application — shows details
 * and drives the approve / reject flow.
 * @param {{
 *   therapist: object,
 *   onClose: () => void,
 *   onApprove: (therapistUserId: string) => void,
 *   onReject: (therapistUserId: string, reason: string) => void,
 *   loading: boolean,
 *   error: string,
 *   success: string,
 * }} props
 */
export function TherapistSidePanel({ therapist, onClose, onApprove, onReject, loading, error, success }) {
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [reason, setReason] = useState('');
    const [reasonError, setReasonError] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const isPending = REVIEWABLE_STATUSES.includes(therapist.therapistProfile?.approvalStatus);

    const handleRejectSubmit = () => {
        if (reason.trim().length < 10) {
            setReasonError('Reason must be at least 10 characters.');
            return;
        }
        setReasonError('');
        setShowConfirmModal(true);
    };

    const handleConfirmReject = () => {
        setShowConfirmModal(false);
        onReject(therapist.id, reason.trim());
    };

    const handleReasonChange = (value) => {
        setReason(value);
        setReasonError('');
    };

    const cancelReject = () => {
        setShowRejectForm(false);
        setShowConfirmModal(false);
        setReason('');
        setReasonError('');
    };

    useEffect(() => {
        setShowRejectForm(false);
        setReason('');
        setReasonError('');
    }, [therapist.id]);

    useEffect(() => {
        if (therapist.therapistProfile?.approvalStatus === APPROVAL_STATUS.REJECTED) {
            setShowRejectForm(false);
            setShowConfirmModal(false);
            setReason('');
            setReasonError('');
        }
    }, [therapist.therapistProfile?.approvalStatus]);

    return (
        <div className="flex flex-col h-full">
            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmReject}
                title="Reject Application"
                message={`Are you sure you want to reject ${therapist.therapistProfile?.fullName ?? "this therapist"}'s application? This action will notify the therapist with your reason and cannot be undone.`}
                confirmLabel="Yes, Reject"
                cancelLabel="Cancel"
                confirmClassName="bg-red-600 hover:bg-red-700 text-white"
                loading={loading}
            />

            <div className="flex items-center justify-between px-5 py-4 border-b border-border-light  shrink-0">
                <h3 className="font-semibold text-text-main  text-sm">Review Application</h3>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-slate-100  text-slate-400 hover:text-slate-600 "
                >
                    <MdClose className="text-xl" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto panel-scroll p-5 space-y-5">
                <TherapistSidePanelDetails therapist={therapist} error={error} success={success} />

                {showRejectForm && (
                    <TherapistRejectForm
                        reason={reason}
                        reasonError={reasonError}
                        loading={loading}
                        onReasonChange={handleReasonChange}
                        onSubmit={handleRejectSubmit}
                        onCancel={cancelReject}
                    />
                )}
            </div>

            <div className="p-5 border-t border-border-light  space-y-2.5 shrink-0">
                <Link
                    href={`/admin/therapists/${therapist.id}`}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-border-light  text-sm font-medium text-text-main  hover:bg-slate-50  transition-colors"
                >
                    <MdOpenInNew className="text-base" />
                    View Full Application
                </Link>

                {isPending && !showRejectForm && !success && (
                    <>
                        <button
                            onClick={() => onApprove(therapist.id)}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                        >
                            <MdCheckCircle className="text-base" />
                            {loading ? 'Approving…' : 'Approve Application'}
                        </button>
                        <button
                            onClick={() => setShowRejectForm(true)}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-red-200  text-red-600  text-sm font-medium hover:bg-red-50  transition-colors"
                        >
                            <MdThumbDown className="text-base" />
                            Reject Application
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

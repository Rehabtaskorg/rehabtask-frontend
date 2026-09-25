'use client';

import { useState } from 'react';
import { MdVerifiedUser, MdThumbUp, MdThumbDown } from 'react-icons/md';

const REJECT_REASON_MIN = 10;
const REJECT_REASON_MAX = 500;

/**
 * Amber "Approval Decision Required" panel shown for pending/review therapists.
 * Owns the reject-reason form state; delegates the actual calls to the parent.
 * @param {{
 *   mutating: boolean,
 *   onApprove: () => void,
 *   onReject: (reason: string) => void,
 * }} props
 */
export function TherapistApprovalDecisionPanel({ mutating, onApprove, onReject }) {
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectError, setRejectError] = useState('');

    const handleRejectClick = () => {
        if (rejectReason.trim().length < REJECT_REASON_MIN) {
            setRejectError(`Please provide a reason of at least ${REJECT_REASON_MIN} characters.`);
            return;
        }
        setRejectError('');
        onReject(rejectReason.trim());
    };

    const cancelReject = () => {
        setShowRejectForm(false);
        setRejectReason('');
        setRejectError('');
    };

    return (
        <div className="bg-card-light  border-2 border-amber-200  rounded-xl overflow-hidden">
            <div className="px-5 py-4 bg-amber-50  border-b border-amber-200 ">
                <h3 className="font-semibold text-amber-800  text-sm flex items-center gap-2">
                    <MdVerifiedUser className="text-base" />
                    Approval Decision Required
                </h3>
                <p className="text-xs text-amber-700  mt-0.5">
                    Review all documents and service areas before making a decision.
                </p>
            </div>

            <div className="p-5 space-y-4">
                {showRejectForm && (
                    <div className="space-y-2">
                        <label className="block">
                            <span className="text-sm font-medium text-text-main ">
                                Rejection Reason
                                <span className="text-text-muted  font-normal ml-1">
                                    (min. {REJECT_REASON_MIN} characters)
                                </span>
                            </span>
                            <textarea
                                value={rejectReason}
                                onChange={e => { setRejectReason(e.target.value); setRejectError(''); }}
                                placeholder="Explain why this application is being rejected…"
                                rows={4}
                                maxLength={REJECT_REASON_MAX}
                                className="mt-1.5 w-full px-3 py-2.5 text-sm rounded-xl border border-border-light  bg-background-light  text-text-main  placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-red-300  focus:border-red-400"
                            />
                        </label>
                        <div className="flex items-center justify-between">
                            {rejectError
                                ? <p className="text-xs text-red-500">{rejectError}</p>
                                : <span />
                            }
                            <p className="text-xs text-text-muted ">{rejectReason.length}/{REJECT_REASON_MAX}</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                    {!showRejectForm ? (
                        <>
                            <button
                                onClick={onApprove}
                                disabled={mutating}
                                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                            >
                                <MdThumbUp className="text-base" />
                                {mutating ? 'Processing…' : 'Approve Application'}
                            </button>
                            <button
                                onClick={() => setShowRejectForm(true)}
                                disabled={mutating}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-red-200  text-red-600  font-medium hover:bg-red-50  disabled:opacity-50 transition-colors"
                            >
                                <MdThumbDown className="text-base" />
                                Reject Application
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleRejectClick}
                                disabled={mutating}
                                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                                <MdThumbDown className="text-base" />
                                {mutating ? 'Rejecting…' : 'Confirm Rejection'}
                            </button>
                            <button
                                onClick={cancelReject}
                                disabled={mutating}
                                className="px-5 py-3 rounded-xl border border-border-light  text-text-main  hover:bg-slate-50  transition-colors"
                            >
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

'use client';

import { TherapistSidePanel } from './TherapistSidePanel';

/**
 * Fixed-position drawer that hosts the therapist review side panel, with a
 * click-to-dismiss backdrop on small screens.
 * @param {{
 *   therapist: object,
 *   onDismiss: () => void,
 *   onClose: () => void,
 *   onApprove: (therapistUserId: string) => void,
 *   onReject: (therapistUserId: string, reason: string) => void,
 *   loading: boolean,
 *   error: string,
 *   success: string,
 * }} props
 */
export function TherapistReviewDrawer({ therapist, onDismiss, onClose, onApprove, onReject, loading, error, success }) {
    return (
        <>
            <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onDismiss} />
            <div className="fixed right-0 top-14 lg:top-0 h-[calc(100dvh-3.5rem)] lg:h-dvh w-full max-w-95 bg-card-light  border-l border-border-light  z-40 lg:z-20 shadow-xl flex flex-col overflow-hidden">
                <TherapistSidePanel
                    therapist={therapist}
                    onClose={onClose}
                    onApprove={onApprove}
                    onReject={onReject}
                    loading={loading}
                    error={error}
                    success={success}
                />
            </div>
        </>
    );
}

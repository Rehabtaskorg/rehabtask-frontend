"use client";

export const REJECT_REASON_MIN = 10;
const REASON_MAX = 500;

/**
 * Rejection-reason textarea plus confirm/cancel controls for the customer
 * decision panel. Owns no state — the parent holds the reason and error.
 *
 * @param {{
 *   reason: string,
 *   reasonError: string,
 *   isPending: boolean,
 *   onReasonChange: (value: string) => void,
 *   onSubmit: () => void,
 *   onCancel: () => void,
 * }} props
 */
export function CustomerRejectForm({ reason, reasonError, isPending, onReasonChange, onSubmit, onCancel }) {
    return (
        <div className="space-y-3">
            <div>
                <label htmlFor="reject-reason" className="block text-xs font-medium text-text-main mb-1">
                    Rejection reason <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="reject-reason"
                    value={reason}
                    onChange={(e) => onReasonChange(e.target.value)}
                    maxLength={REASON_MAX}
                    rows={4}
                    placeholder={`Explain why this account cannot be approved (min ${REJECT_REASON_MIN} characters)…`}
                    className="w-full px-3 py-2 text-sm border border-border-light rounded-lg bg-background-light text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none transition"
                />
                <div className="flex justify-between mt-1">
                    {reasonError ? <p className="text-xs text-red-600">{reasonError}</p> : <span />}
                    <span className="text-xs text-text-muted">{reason.length}/{REASON_MAX}</span>
                </div>
            </div>
            <div className="flex gap-3">
                <button
                    onClick={onSubmit}
                    disabled={isPending}
                    className="flex-1 px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
                >
                    {isPending ? "Rejecting…" : "Confirm Rejection"}
                </button>
                <button
                    onClick={onCancel}
                    disabled={isPending}
                    className="px-4 py-2 text-sm border border-border-light text-text-muted rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

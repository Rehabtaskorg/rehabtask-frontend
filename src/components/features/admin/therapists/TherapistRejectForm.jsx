/**
 * Inline rejection-reason form shown inside the therapist side panel.
 * @param {{
 *   reason: string,
 *   reasonError: string,
 *   loading: boolean,
 *   onReasonChange: (value: string) => void,
 *   onSubmit: () => void,
 *   onCancel: () => void,
 * }} props
 */
export function TherapistRejectForm({ reason, reasonError, loading, onReasonChange, onSubmit, onCancel }) {
    return (
        <div className="space-y-3 p-4 rounded-xl border border-red-200  bg-red-50/50 ">
            <p className="text-sm font-medium text-text-main ">Rejection Reason</p>
            <textarea
                value={reason}
                onChange={e => onReasonChange(e.target.value)}
                placeholder="Explain why this application is being rejected (min. 10 characters)…"
                rows={4}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-border-light  bg-card-light  text-text-main  placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-red-300  focus:border-red-400"
            />
            {reasonError && <p className="text-xs text-red-500">{reasonError}</p>}
            <div className="flex gap-2">
                <button
                    onClick={onSubmit}
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                    {loading ? 'Rejecting…' : 'Confirm Rejection'}
                </button>
                <button
                    onClick={onCancel}
                    disabled={loading}
                    className="px-4 py-2.5 rounded-xl border border-border-light  text-sm text-text-main  hover:bg-slate-50  transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

"use client";

/**
 * Read-only summary shown for a rejected customer.
 *
 * @param {{ rejectionReason?: string|null }} props
 */
export function CustomerRejectedPanel({ rejectionReason }) {
    return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 space-y-2">
            <p className="text-sm font-semibold text-red-800">Account rejected</p>
            {rejectionReason && (
                <p className="text-xs text-red-700">{rejectionReason}</p>
            )}
        </div>
    );
}

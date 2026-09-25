"use client";

/**
 * Previous / next pagination footer for the admin customer list.
 * Renders nothing when there is only a single page.
 *
 * @param {{
 *   page: number,
 *   shownCount: number,
 *   pagination: { total: number, totalPages: number },
 *   onPageChange: (updater: (prev: number) => number) => void,
 * }} props
 */
export function CustomerPagination({ page, shownCount, pagination, onPageChange }) {
    if (pagination.totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-text-muted">
                Showing {shownCount} of {pagination.total} customers
            </p>
            <div className="flex gap-2">
                <button
                    onClick={() => onPageChange((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1.5 text-sm border border-border-light rounded-lg text-text-main disabled:opacity-40 hover:bg-slate-50 transition"
                >
                    Previous
                </button>
                <span className="px-3 py-1.5 text-sm text-text-muted">
                    {page} / {pagination.totalPages}
                </span>
                <button
                    onClick={() => onPageChange((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page >= pagination.totalPages}
                    className="px-3 py-1.5 text-sm border border-border-light rounded-lg text-text-main disabled:opacity-40 hover:bg-slate-50 transition"
                >
                    Next
                </button>
            </div>
        </div>
    );
}

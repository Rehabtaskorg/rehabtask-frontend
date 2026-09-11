import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

/**
 * Pagination footer for the admin therapist table.
 * Renders nothing when there is a single page or less.
 * @param {{ page: number, pagination: object|undefined, onPageChange: (p: number) => void }} props
 */
export function TherapistPagination({ page, pagination, onPageChange }) {
    if (!pagination || pagination.totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between px-5 py-4 border-t border-border-light ">
            <p className="text-sm text-text-muted ">
                {(page - 1) * pagination.limit + 1}–{Math.min(page * pagination.limit, pagination.total)} of {pagination.total.toLocaleString()}
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg border border-border-light  hover:bg-slate-50  disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <MdChevronLeft className="text-xl text-slate-600 " />
                </button>
                <span className="text-sm font-medium text-text-main  min-w-15 text-center">
                    {page} / {pagination.totalPages}
                </span>
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === pagination.totalPages}
                    className="p-1.5 rounded-lg border border-border-light  hover:bg-slate-50  disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <MdChevronRight className="text-xl text-slate-600 " />
                </button>
            </div>
        </div>
    );
}

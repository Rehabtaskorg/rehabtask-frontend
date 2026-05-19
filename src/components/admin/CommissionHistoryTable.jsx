"use client";

import { useState } from "react";
import { MdHistory, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { useAdminCommissionHistory } from "@/hooks/useAdmin";
import { formatDate } from "@/utils/dates";

/**
 * Paginated table of global commission rate changes.
 * Read-only — visible to admin and sub-admins with commission permission.
 */
export default function CommissionHistoryTable() {
    const [page, setPage] = useState(1);
    const PAGE_LIMIT = 10;

    const { data, isLoading, isError } = useAdminCommissionHistory({ page, limit: PAGE_LIMIT });

    const configs = data?.configs ?? [];
    const pagination = data?.pagination ?? {};

    return (
        <div className="bg-card-light  border border-border-light  rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MdHistory className="text-primary text-xl" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-text-main  uppercase tracking-wider">
                        Rate Change History
                    </h3>
                    <p className="text-xs text-text-muted  mt-0.5">
                        Audit trail of all commission rate updates
                    </p>
                </div>
            </div>

            {isLoading && (
                <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-slate-200  rounded-lg" />
                    ))}
                </div>
            )}

            {isError && (
                <p className="text-sm text-red-500">Failed to load commission history.</p>
            )}

            {!isLoading && !isError && (
                <>
                    {configs.length === 0 ? (
                        <p className="text-sm text-text-muted  py-4 text-center">
                            No rate changes recorded yet.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border-light ">
                                        <th className="pb-3 text-left text-xs font-bold text-text-muted  uppercase tracking-wider">Rate</th>
                                        <th className="pb-3 text-left text-xs font-bold text-text-muted  uppercase tracking-wider">Effective From</th>
                                        <th className="pb-3 text-left text-xs font-bold text-text-muted  uppercase tracking-wider">Set By</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-light ">
                                    {configs.map((c) => (
                                        <tr key={c.id} className="hover:bg-muted-light  transition-colors">
                                            <td className="py-3 font-mono font-bold text-text-main ">
                                                {(parseFloat(c.rate) * 100).toFixed(2)}%
                                            </td>
                                            <td className="py-3 text-text-muted ">
                                                {formatDate(c.effectiveFrom)}
                                            </td>
                                            <td className="py-3 text-text-muted ">
                                                {c.createdByAdmin?.email ?? "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 border-t border-border-light  mt-4">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="flex items-center gap-1 text-sm font-medium text-text-muted hover:text-primary disabled:opacity-30 transition-colors"
                            >
                                <MdChevronLeft className="text-lg" /> Previous
                            </button>
                            <span className="text-xs text-text-muted ">
                                Page {pagination.page} of {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages}
                                className="flex items-center gap-1 text-sm font-medium text-text-muted hover:text-primary disabled:opacity-30 transition-colors"
                            >
                                Next <MdChevronRight className="text-lg" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
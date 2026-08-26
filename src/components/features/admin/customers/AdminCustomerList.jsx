"use client";

import { useState, useEffect, useRef } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAdminCustomers } from "@/hooks/useAdmin";
import { APPROVAL_STATUS } from "@/lib/constants";
import { CustomerStatusTabs } from "./CustomerStatusTabs";
import { CustomerTypeFilter } from "./CustomerTypeFilter";
import { CustomerTable } from "./CustomerTable";

const PAGE_SIZE = 20;

/**
 * Admin customer review queue.
 * Displays a filterable, searchable, paginated list of customer applications.
 * Defaults to oldest-first (asc) to serve as a FIFO review queue.
 */
export function AdminCustomerList() {
    usePageTitle("Customer Applications");

    const [activeTab, setActiveTab] = useState('');
    const [activeType, setActiveType] = useState('');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const debounceRef = useRef(null);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(debounceRef.current);
    }, [search]);

    const queryParams = {
        ...(activeTab && { approvalStatus: activeTab }),
        ...(activeType && { customerType: activeType }),
        ...(debouncedSearch && { search: debouncedSearch }),
        sortOrder: 'asc',
        page,
        limit: PAGE_SIZE,
    };

    const { data, isLoading, isError, error } = useAdminCustomers(queryParams);

    const pendingCountQuery = useAdminCustomers({
        ...(activeType && { customerType: activeType }),
        approvalStatus: APPROVAL_STATUS.PENDING,
        limit: 1,
    });

    const reviewCountQuery = useAdminCustomers({
        ...(activeType && { customerType: activeType }),
        approvalStatus: APPROVAL_STATUS.REVIEW,
        limit: 1,
    });

    const counts = {
        [APPROVAL_STATUS.PENDING]: pendingCountQuery.data?.pagination?.total ?? 0,
        [APPROVAL_STATUS.REVIEW]: reviewCountQuery.data?.pagination?.total ?? 0,
    };

    const customers = data?.customers ?? [];
    const pagination = data?.pagination ?? { page: 1, totalPages: 1, total: 0 };

    function handleTabChange(value) {
        setActiveTab(value);
        setPage(1);
    }

    function handleTypeChange(value) {
        setActiveType(value);
        setPage(1);
    }

    function handleSearchChange(e) {
        setSearch(e.target.value);
        setPage(1);
    }

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-xl font-bold text-text-main">Customer Applications</h1>
                    <p className="text-sm text-text-muted mt-0.5">
                        Review and approve customer accounts before they can access the platform.
                    </p>
                </div>
            </div>

            <div className="bg-card-light border border-border-light rounded-xl overflow-hidden">
                <CustomerStatusTabs
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    counts={counts}
                />

                <div className="p-4 flex items-center gap-3 flex-wrap border-b border-border-light">
                    <CustomerTypeFilter
                        activeType={activeType}
                        onTypeChange={handleTypeChange}
                    />
                    <div className="ml-auto">
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearchChange}
                            placeholder="Search by name or email…"
                            className="w-64 px-3 py-2 text-sm border border-border-light rounded-lg bg-background-light text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                        />
                    </div>
                </div>

                {isError ? (
                    <div className="p-8 text-center">
                        <p className="text-sm font-semibold text-text-main">Failed to load customers</p>
                        <p className="text-xs text-text-muted mt-1">{error?.message || 'An unexpected error occurred.'}</p>
                    </div>
                ) : (
                    <div className="p-4 space-y-4">
                        <CustomerTable customers={customers} isLoading={isLoading} />

                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between pt-2">
                                <p className="text-xs text-text-muted">
                                    Showing {customers.length} of {pagination.total} customers
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page <= 1}
                                        className="px-3 py-1.5 text-sm border border-border-light rounded-lg text-text-main disabled:opacity-40 hover:bg-slate-50 transition"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-3 py-1.5 text-sm text-text-muted">
                                        {page} / {pagination.totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                                        disabled={page >= pagination.totalPages}
                                        className="px-3 py-1.5 text-sm border border-border-light rounded-lg text-text-main disabled:opacity-40 hover:bg-slate-50 transition"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
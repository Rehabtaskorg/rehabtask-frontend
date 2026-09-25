"use client";

import { CustomerTypeFilter } from "./CustomerTypeFilter";
import { PendingReviewFilter } from "@/components/features/admin/PendingReviewFilter";

/**
 * Filter row for the admin customer list — customer-type pills, the
 * pending-review toggle and the search box.
 *
 * @param {{
 *   activeType: string,
 *   onTypeChange: (value: string) => void,
 *   isPendingReviewOnly: boolean,
 *   onPendingReviewToggle: (next: boolean) => void,
 *   pendingReviewCount: number,
 *   search: string,
 *   onSearchChange: (event: object) => void,
 * }} props
 */
export function CustomerListToolbar({
    activeType,
    onTypeChange,
    isPendingReviewOnly,
    onPendingReviewToggle,
    pendingReviewCount,
    search,
    onSearchChange,
}) {
    return (
        <div className="p-4 flex items-center gap-3 flex-wrap border-b border-border-light">
            <CustomerTypeFilter activeType={activeType} onTypeChange={onTypeChange} />
            <PendingReviewFilter
                isActive={isPendingReviewOnly}
                onToggle={onPendingReviewToggle}
                count={pendingReviewCount}
            />
            <div className="ml-auto">
                <label htmlFor="customer-search" className="sr-only">Search customers</label>
                <input
                    id="customer-search"
                    type="text"
                    value={search}
                    onChange={onSearchChange}
                    placeholder="Search by name or email…"
                    className="w-64 px-3 py-2 text-sm border border-border-light rounded-lg bg-background-light text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
            </div>
        </div>
    );
}

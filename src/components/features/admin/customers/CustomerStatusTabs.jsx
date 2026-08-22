"use client";

import { APPROVAL_STATUS } from "@/lib/constants";

const TABS = [
    { value: '', label: 'All' },
    { value: APPROVAL_STATUS.PENDING, label: 'Pending' },
    { value: APPROVAL_STATUS.REVIEW, label: 'In Review' },
    { value: APPROVAL_STATUS.APPROVED, label: 'Approved' },
    { value: APPROVAL_STATUS.REJECTED, label: 'Rejected' },
];

const BADGE_TABS = new Set([APPROVAL_STATUS.PENDING, APPROVAL_STATUS.REVIEW]);

/**
 * Status tab bar for the admin customer list page.
 * Shows live count badges on Pending and In Review tabs.
 *
 * @param {{ activeTab: string, onTabChange: (value: string) => void, counts: Record<string, number> }} props
 */
export function CustomerStatusTabs({ activeTab, onTabChange, counts = {} }) {
    return (
        <div className="flex gap-1 flex-wrap border-b border-border-light">
            {TABS.map(({ value, label }) => {
                const isActive = activeTab === value;
                const count = BADGE_TABS.has(value) ? counts[value] : null;
                return (
                    <button
                        key={value}
                        onClick={() => onTabChange(value)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${isActive
                                ? 'border-primary text-primary'
                                : 'border-transparent text-text-muted hover:text-text-main'
                            }`}
                    >
                        {label}
                        {count != null && count > 0 && (
                            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-primary text-white text-[10px] font-bold leading-none">
                                {count > 99 ? '99+' : count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
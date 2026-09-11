"use client";

import { MdHistory } from "react-icons/md";

/**
 * Orthogonal toggle that narrows the current admin list to accounts with
 * unreviewed profile changes. Combines with the approval-status tab rather
 * than replacing it (e.g. "Approved" tab + this toggle = approved accounts
 * with an unreviewed change).
 *
 * @param {{ isActive: boolean, onToggle: (next: boolean) => void, count?: number }} props
 */
export function PendingReviewFilter({ isActive, onToggle, count = 0 }) {
    return (
        <button
            type="button"
            onClick={() => onToggle(!isActive)}
            aria-pressed={isActive}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${isActive
                ? "bg-violet-600 text-white border-violet-600"
                : "bg-transparent text-text-muted border-border-light hover:border-violet-400 hover:text-violet-700"
                }`}
        >
            <MdHistory className="text-base shrink-0" aria-hidden="true" />
            Pending Review
            {count > 0 && (
                <span className={`inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-[10px] font-bold leading-none ${isActive ? "bg-white/25 text-white" : "bg-violet-100 text-violet-700"
                    }`}>
                    {count > 99 ? "99+" : count}
                </span>
            )}
        </button>
    );
}

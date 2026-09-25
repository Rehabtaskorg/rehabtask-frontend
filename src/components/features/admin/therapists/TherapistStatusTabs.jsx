import { APPROVAL_STATUS } from "@/lib/constants";

const TABS = [
    { value: '', label: 'All' },
    { value: APPROVAL_STATUS.PENDING, label: 'Pending' },
    { value: APPROVAL_STATUS.REVIEW, label: 'Review' },
    { value: APPROVAL_STATUS.APPROVED, label: 'Approved' },
    { value: APPROVAL_STATUS.REJECTED, label: 'Rejected' },
];

/**
 * Approval-status filter tabs for the admin therapist list.
 * @param {{
 *   activeTab: string,
 *   onTabChange: (value: string) => void,
 *   pendingBadge: number,
 *   reviewBadge: number,
 * }} props
 */
export function TherapistStatusTabs({ activeTab, onTabChange, pendingBadge, reviewBadge }) {
    return (
        <div className="flex gap-1 mb-5 p-1 bg-slate-100  rounded-xl w-fit overflow-x-auto">
            {TABS.map(tab => (
                <button
                    key={tab.value}
                    onClick={() => onTabChange(tab.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5
                        ${activeTab === tab.value
                            ? 'bg-white  text-text-main  shadow-sm'
                            : 'text-text-muted  hover:text-text-main '}`}
                >
                    {tab.label}
                    {tab.value === APPROVAL_STATUS.PENDING && pendingBadge > 0 && (
                        <span className="min-w-4.5 h-4.5 px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                            {pendingBadge > 99 ? '99+' : pendingBadge}
                        </span>
                    )}
                    {tab.value === APPROVAL_STATUS.REVIEW && reviewBadge > 0 && (
                        <span className="min-w-4.5 h-4.5 px-1 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                            {reviewBadge > 99 ? '99+' : reviewBadge}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}

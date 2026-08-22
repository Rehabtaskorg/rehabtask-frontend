"use client";

import { CUSTOMER_TYPES } from "@/lib/constants";

const TYPE_OPTIONS = [
    { value: '', label: 'All' },
    { value: CUSTOMER_TYPES.AGENCY, label: 'Agency' },
    { value: CUSTOMER_TYPES.INDIVIDUAL, label: 'Individual' },
];

/**
 * Pill-row filter for customer type on the admin customer list page.
 *
 * @param {{ activeType: string, onTypeChange: (value: string) => void }} props
 */
export function CustomerTypeFilter({ activeType, onTypeChange }) {
    return (
        <div className="flex gap-2 flex-wrap">
            {TYPE_OPTIONS.map(({ value, label }) => (
                <button
                    key={value}
                    onClick={() => onTypeChange(value)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${activeType === value
                            ? 'bg-primary text-white border-primary'
                            : 'bg-transparent text-text-muted border-border-light hover:border-primary hover:text-primary'
                        }`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}
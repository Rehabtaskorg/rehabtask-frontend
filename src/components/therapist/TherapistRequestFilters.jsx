"use client";

import { MdClose, MdFilterList } from "react-icons/md";

const SERVICE_TYPE_OPTIONS = [
    { label: "Physical Therapy (PT)", value: "physical" },
    { label: "Occupational Therapy (OT)", value: "occupational" },
    { label: "Speech-Language (SLP)", value: "speech" },
    { label: "Other", value: "other" },
];

const SHOW_OPTIONS = [
    { value: "all", label: "All Open" },
    { value: "new", label: "New Only (24h)" },
    { value: "my_offers", label: "With My Offers" },
];

export default function TherapistRequestFilters({
    isOpen,
    onClose,
    filters,
    onToggleServiceType,
    onSetShow,
    onSetDistance,
    onApply,
    onReset,
}) {
    const activeCount = filters.serviceTypes.length + (filters.show !== "all" ? 1 : 0);

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
            )}

            {/* Sidebar — slides from left */}
            <aside className={`
                fixed top-0 left-0 h-full w-80 z-50 bg-white dark:bg-card-dark shadow-2xl
                flex flex-col transform transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border-light dark:border-border-dark shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-text-main dark:text-white">Filter Requests</h3>
                        <p className="text-[10px] text-text-muted dark:text-gray-400 uppercase tracking-widest mt-0.5">Refine your results</p>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-text-muted transition-colors">
                        <MdClose className="text-xl" />
                    </button>
                </div>

                {/* Filters */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Service Type */}
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest">Service Type</p>
                        <div className="space-y-2.5">
                            {SERVICE_TYPE_OPTIONS.map((opt) => (
                                <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={filters.serviceTypes.includes(opt.value)}
                                        onChange={() => onToggleServiceType(opt.value)}
                                        className="rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-text-muted dark:text-gray-400 group-hover:text-text-main dark:group-hover:text-white transition-colors">
                                        {opt.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Distance */}
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest">Distance</p>
                        <select
                            value={filters.distance}
                            onChange={(e) => onSetDistance(e.target.value)}
                            className="w-full rounded-lg border-slate-300 dark:border-border-dark dark:bg-card-dark dark:text-white text-sm focus:ring-primary focus:border-primary"
                        >
                            <option value="5">Within 5 miles</option>
                            <option value="10">Within 10 miles</option>
                            <option value="25">Within 25 miles</option>
                            <option value="50">Within 50 miles</option>
                        </select>
                        <p className="text-[10px] text-text-muted italic">Distance filtering coming soon</p>
                    </div>

                    {/* Show */}
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest">Show</p>
                        <div className="space-y-2.5">
                            {SHOW_OPTIONS.map((opt) => (
                                <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="show"
                                        value={opt.value}
                                        checked={filters.show === opt.value}
                                        onChange={() => onSetShow(opt.value)}
                                        className="border-slate-300 dark:border-slate-600 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-text-muted dark:text-gray-400 group-hover:text-text-main dark:group-hover:text-white transition-colors">
                                        {opt.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-border-light dark:border-border-dark space-y-3 shrink-0">
                    <button
                        onClick={() => { onApply(); onClose(); }}
                        className="w-full bg-primary text-white py-3 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        Apply Filters
                    </button>
                    <button
                        onClick={() => { onReset(); onClose(); }}
                        className="w-full bg-slate-100 dark:bg-slate-800 text-text-muted dark:text-gray-400 py-2.5 rounded-lg font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        Reset All
                    </button>
                </div>
            </aside>
        </>
    );
}

export function FilterToggleButton({ onClick, activeCount }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-text-main dark:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
            <MdFilterList className="text-lg" />
            Filters
            {activeCount > 0 && (
                <span className="bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {activeCount}
                </span>
            )}
        </button>
    );
}

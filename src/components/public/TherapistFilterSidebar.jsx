"use client";

import { MdFilterList, MdClose } from "react-icons/md";

const SPECIALIZATIONS = [
    "Orthopedic Rehabilitation",
    "Neurological Recovery",
    "Pediatric Therapy",
    "Geriatric Care",
    "Sports Rehabilitation",
    "Post-Surgical Recovery",
];

export default function TherapistFilterSidebar({
    isOpen,
    onClose,
    specializations,
    onSpecializationsChange,
    onApply,
}) {
    const toggleSpecialization = (spec) => {
        const next = specializations.includes(spec)
            ? specializations.filter((s) => s !== spec)
            : [...specializations, spec];
        onSpecializationsChange(next);
    };

    const handleApply = () => {
        onApply();
        onClose();
    };

    const handleClear = () => {
        onSpecializationsChange([]);
        onApply();
    };

    const hasActiveFilters = specializations.length > 0;

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
            )}

            <aside className={`
                fixed top-0 left-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 lg:static lg:transform-none lg:z-auto lg:w-auto lg:h-auto
                ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}>
                <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Filters</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                        <MdClose className="text-xl" />
                    </button>
                </div>

                <div className="p-5 space-y-6 overflow-y-auto h-full lg:h-auto lg:bg-white lg:border lg:border-gray-200 lg:rounded-xl">
                    {/* Specialization */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Specialization</h3>
                        <div className="space-y-2.5">
                            {SPECIALIZATIONS.map((s) => (
                                <label key={s} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={specializations.includes(s)}
                                        onChange={() => toggleSpecialization(s)}
                                        className="rounded border-gray-300 text-primary focus:ring-primary/20"
                                    />
                                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{s}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleApply}
                            className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm"
                        >
                            Apply Filters
                        </button>
                        {hasActiveFilters && (
                            <button
                                onClick={handleClear}
                                className="w-full py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}

export function FilterToggleButton({ onClick, activeCount }) {
    return (
        <button
            onClick={onClick}
            className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
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

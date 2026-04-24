"use client";

import { useEffect, useRef, useState } from "react";
import { MdTune, MdClose } from "react-icons/md";
import { SPECIALIZATIONS as ALL_SPECIALIZATIONS } from "@/lib/constants/specializations";

const SPECIALIZATIONS = ALL_SPECIALIZATIONS.filter((s) => s !== "Other");

function FilterContent({ specializations, onToggle, onApply, onClear, hasActiveFilters }) {
    return (
        <div className="p-5 space-y-5">
            <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Specialization
                </h3>
                <div className="space-y-2.5">
                    {SPECIALIZATIONS.map((s) => (
                        <label key={s} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={specializations.includes(s)}
                                onChange={() => onToggle(s)}
                                className="rounded border-gray-300 text-primary focus:ring-primary/20"
                            />
                            <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                                {s}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button
                    onClick={onApply}
                    className="flex-1 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm"
                >
                    Apply
                </button>
                {hasActiveFilters && (
                    <button
                        onClick={onClear}
                        className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
}

export default function TherapistFiltersPopover({
    specializations,
    onSpecializationsChange,
    onApply,
    activeCount = 0,
}) {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);
    const popoverRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e) => {
            if (
                popoverRef.current && !popoverRef.current.contains(e.target) &&
                anchorRef.current && !anchorRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const toggleSpecialization = (spec) => {
        const next = specializations.includes(spec)
            ? specializations.filter((s) => s !== spec)
            : [...specializations, spec];
        onSpecializationsChange(next);
    };

    const handleApply = () => {
        onApply();
        setOpen(false);
    };

    const handleClear = () => {
        onSpecializationsChange([]);
        onApply();
        setOpen(false);
    };

    return (
        <>
            <button
                ref={anchorRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    activeCount > 0
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
            >
                <MdTune className="text-base" />
                Filters
                {activeCount > 0 && (
                    <span className="bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {activeCount}
                    </span>
                )}
            </button>

            {open && (
                <>
                    <div
                        ref={popoverRef}
                        className="hidden md:block absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-40"
                    >
                        <FilterContent
                            specializations={specializations}
                            onToggle={toggleSpecialization}
                            onApply={handleApply}
                            onClear={handleClear}
                            hasActiveFilters={specializations.length > 0}
                        />
                    </div>

                    <div className="md:hidden fixed inset-0 z-50 flex flex-col">
                        <div
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setOpen(false)}
                        />
                        <div className="relative mt-auto bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto">
                            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                <h3 className="font-bold text-gray-900">Filters</h3>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                                >
                                    <MdClose className="text-xl" />
                                </button>
                            </div>
                            <FilterContent
                                specializations={specializations}
                                onToggle={toggleSpecialization}
                                onApply={handleApply}
                                onClear={handleClear}
                                hasActiveFilters={specializations.length > 0}
                            />
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

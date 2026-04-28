"use client";

import { useEffect, useRef, useState } from "react";
import { MdTune, MdClose } from "react-icons/md";

export default function TherapistFiltersPopover({ onApply, activeCount = 0 }) {
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

    const handleApply = () => {
        onApply?.();
        setOpen(false);
    };

    const FilterContent = () => (
        <div className="p-5">
            <p className="text-sm text-gray-500 mb-4">No additional filters available.</p>
            <button
                onClick={handleApply}
                className="w-full py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
                Apply
            </button>
        </div>
    );

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
                        className="hidden md:block absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-40"
                    >
                        <FilterContent />
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
                            <FilterContent />
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

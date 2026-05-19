"use client";

import { useEffect, useRef, useState } from "react";
import { MdTune, MdClose } from "react-icons/md";

export default function FindTherapistsFiltersPopover({
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

    const handleApply = () => {
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
                        : "bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark text-text-main dark:text-white hover:border-gray-300 dark:hover:border-gray-600"
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
                        className="hidden md:block absolute top-full left-0 mt-2 w-80 bg-card-light dark:bg-card-dark rounded-xl shadow-xl border border-border-light dark:border-border-dark z-40"
                    >
                        <div className="p-5">
                            <button
                                onClick={handleApply}
                                className="w-full py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm"
                            >
                                Apply
                            </button>
                        </div>
                    </div>

                    <div className="md:hidden fixed inset-0 z-50 flex flex-col">
                        <div
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setOpen(false)}
                        />
                        <div className="relative mt-auto bg-card-light dark:bg-card-dark rounded-t-2xl max-h-[80vh] overflow-y-auto">
                            <div className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark">
                                <h3 className="font-bold text-text-main dark:text-white">Filters</h3>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-text-muted dark:text-gray-400"
                                >
                                    <MdClose className="text-xl" />
                                </button>
                            </div>
                            <div className="p-5">
                                <button
                                    onClick={handleApply}
                                    className="w-full py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
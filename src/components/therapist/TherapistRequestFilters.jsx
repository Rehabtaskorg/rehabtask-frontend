"use client";

import { MdClose, MdFilterList } from "react-icons/md";
import { useVisitTypes } from "@/hooks/useVisitTypes";
import { DEFAULT_WORK_AREA_RADIUS_MILES, MAX_SEARCH_RADIUS_MILES, RADIUS_FILTER_STEP_MILES } from "@/lib/constants";

const SHOW_OPTIONS = [
    { value: "all", label: "All Open" },
    { value: "new", label: "New Only (24h)" },
    { value: "my_offers", label: "With My Offers" },
];

/**
 * Sidebar filter panel for the therapist available-requests list.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {{show: string, visitTypeIds: string[], radiusMiles: number}} props.filters
 * @param {(value: string) => void} props.onSetShow
 * @param {(visitTypeId: string) => void} props.onToggleVisitType
 * @param {(radiusMiles: number) => void} props.onSetRadius
 * @param {() => void} props.onApply
 * @param {() => void} props.onReset
 */
export default function TherapistRequestFilters({
    isOpen,
    onClose,
    filters,
    onSetShow,
    onToggleVisitType,
    onSetRadius,
    onApply,
    onReset,
}) {
    const { data: visitTypes = [] } = useVisitTypes({ useOwnDiscipline: true, audience: "therapist" });

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
            )}

            {/* Sidebar — slides from left */}
            <aside className={`
                fixed top-0 left-0 h-full w-80 z-50 bg-white  shadow-2xl
                flex flex-col transform transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border-light  shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-text-main ">Filter Requests</h3>
                        <p className="text-[10px] text-text-muted  uppercase tracking-widest mt-0.5">Refine your results</p>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-slate-100  flex items-center justify-center text-text-muted transition-colors">
                        <MdClose className="text-xl" />
                    </button>
                </div>

                {/* Filters */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Show */}
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-text-muted  uppercase tracking-widest">Show</p>
                        <div className="space-y-2.5">
                            {SHOW_OPTIONS.map((opt) => (
                                <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="show"
                                        value={opt.value}
                                        checked={filters.show === opt.value}
                                        onChange={() => onSetShow(opt.value)}
                                        className="border-slate-300  text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-text-muted  group-hover:text-text-main  transition-colors">
                                        {opt.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Visit Type */}
                    {visitTypes.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-xs font-bold text-text-muted  uppercase tracking-widest">Visit Type</p>
                            <div className="space-y-2.5">
                                {visitTypes.map((vt) => (
                                    <label key={vt.id} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={filters.visitTypeIds.includes(vt.id)}
                                            onChange={() => onToggleVisitType(vt.id)}
                                            className="rounded border-slate-300  text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm text-text-muted  group-hover:text-text-main  transition-colors">
                                            {vt.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Search Radius */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-text-muted  uppercase tracking-widest">Search Radius</p>
                            <span className="text-sm font-bold text-primary">
                                {filters.radiusMiles > 0 ? `${filters.radiusMiles} mi` : "Default"}
                            </span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={MAX_SEARCH_RADIUS_MILES}
                            step={RADIUS_FILTER_STEP_MILES}
                            value={filters.radiusMiles}
                            onChange={(e) => onSetRadius(parseInt(e.target.value, 10))}
                            aria-label="Search radius in miles"
                            className="w-full accent-primary"
                        />
                        <p className="text-xs text-text-muted ">
                            {filters.radiusMiles > 0
                                ? `Showing requests up to ${filters.radiusMiles} miles from your work area${filters.radiusMiles > DEFAULT_WORK_AREA_RADIUS_MILES ? " (extended)" : ""}.`
                                : "Using your configured work area radius."}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-border-light  space-y-3 shrink-0">
                    <button
                        onClick={() => { onApply(); onClose(); }}
                        className="w-full bg-primary text-white py-3 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        Apply Filters
                    </button>
                    <button
                        onClick={() => { onReset(); onClose(); }}
                        className="w-full bg-slate-100  text-text-muted  py-2.5 rounded-lg font-medium text-sm hover:bg-slate-200  transition-colors"
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
            className="flex items-center gap-2 bg-slate-100  text-text-main  px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200  transition-colors"
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
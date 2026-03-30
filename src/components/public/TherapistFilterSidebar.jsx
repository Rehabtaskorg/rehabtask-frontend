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

const EXPERIENCE_OPTIONS = [
    { label: "Any", value: "any" },
    { label: "3+ years", value: "3" },
    { label: "5+ years", value: "5" },
    { label: "10+ years", value: "10" },
];

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export default function TherapistFilterSidebar({ isOpen, onClose }) {
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
                                    <input type="checkbox" className="rounded border-gray-300 text-[#137fec] focus:ring-[#137fec]/20" />
                                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{s}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Experience */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Experience</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {EXPERIENCE_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    className="py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:border-[#137fec] hover:text-[#137fec] transition-colors"
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Rate */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Rate Per Visit</h3>
                        <input
                            type="range"
                            min="50"
                            max="300"
                            defaultValue="150"
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#137fec]"
                        />
                        <div className="flex justify-between mt-2 text-xs text-gray-500 font-medium">
                            <span>$50</span>
                            <span className="text-[#137fec] font-bold">$150</span>
                            <span>$300</span>
                        </div>
                    </div>

                    {/* Availability */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Availability</h3>
                        <div className="flex gap-2">
                            {DAYS.map((day, i) => (
                                <button
                                    key={i}
                                    className="w-9 h-9 rounded-full border border-gray-200 text-xs font-bold text-gray-500 hover:border-[#137fec] hover:text-[#137fec] transition-colors flex items-center justify-center"
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button className="w-full py-3 bg-[#137fec] text-white font-semibold rounded-xl hover:bg-[#137fec]/90 transition-colors text-sm">
                        Apply Filters
                    </button>
                </div>
            </aside>
        </>
    );
}

export function FilterToggleButton({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
            <MdFilterList className="text-lg" />
            Filters
        </button>
    );
}

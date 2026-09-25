"use client";

import { DISCIPLINE_PILLS } from "@/lib/constants";

/**
 * @param {object} props
 * @param {string} props.activeDiscipline
 * @param {Function} props.setActiveDiscipline
 * @param {number} props.resultCount
 */
export function TherapistCompactHeader({ activeDiscipline, setActiveDiscipline, resultCount }) {
    return (
        <section className="bg-white border-b border-gray-200">
            <div className="px-4 sm:px-6 lg:px-8 py-2.5">
                <div className="flex items-center justify-between gap-3 relative">
                    <div className="flex items-center gap-2 flex-wrap">
                        {DISCIPLINE_PILLS.map((d) => (
                            <button
                                key={d.key}
                                type="button"
                                onClick={() => setActiveDiscipline(d.key)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${activeDiscipline === d.key
                                        ? "bg-primary text-white"
                                        : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                                    }`}
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>
                    <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                        {resultCount} therapist{resultCount !== 1 ? "s" : ""} found
                    </span>
                </div>
            </div>
        </section>
    );
}

export default TherapistCompactHeader;
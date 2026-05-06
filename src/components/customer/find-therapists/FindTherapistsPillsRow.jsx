"use client";

const DISCIPLINES = [
    { key: "all", label: "All" },
    { key: "pt", label: "PT" },
    { key: "ot", label: "OT" },
    { key: "slp", label: "SLP" },
];

const SORT_OPTIONS = [
    { value: "relevance", label: "Relevance" },
    { value: "rating", label: "Highest Rated" },
    { value: "experience", label: "Most Experience" },
    { value: "newest", label: "Newest" },
];

export default function FindTherapistsPillsRow({
    activeDiscipline,
    setActiveDiscipline,
    sortBy,
    onSortChange,
}) {
    return (
        <section className="bg-card-light dark:bg-card-dark border-b border-border-light dark:border-border-dark">
            <div className="px-4 sm:px-6 lg:px-8 py-2.5">
                <div className="flex items-center justify-between gap-3 relative">
                    <div className="flex items-center gap-2 flex-wrap">
                        {DISCIPLINES.map((d) => (
                            <button
                                key={d.key}
                                type="button"
                                onClick={() => setActiveDiscipline(d.key)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                                    activeDiscipline === d.key
                                        ? "bg-primary text-white"
                                        : "bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark text-text-main dark:text-white hover:border-gray-300 dark:hover:border-gray-600"
                                }`}
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-text-muted dark:text-gray-400">
                        <span className="hidden sm:inline">Sorted by</span>
                        <select
                            value={sortBy}
                            onChange={(e) => onSortChange(e.target.value)}
                            className="text-primary font-semibold bg-transparent border-0 focus:ring-0 cursor-pointer"
                        >
                            {SORT_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </section>
    );
}

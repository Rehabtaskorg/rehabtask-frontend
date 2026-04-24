"use client";

import { MdSearch } from "react-icons/md";
import LocationAutocomplete from "./LocationAutocomplete";
import TherapistFiltersPopover from "./TherapistFiltersPopover";

const DISCIPLINES = [
    { key: "all", label: "All" },
    { key: "pt", label: "PT" },
    { key: "ot", label: "OT" },
    { key: "slp", label: "SLP" },
];

export default function TherapistCompactHeader({
    searchQuery,
    setSearchQuery,
    locationQuery,
    setLocationQuery,
    onLocationSelect,
    onLocationClear,
    activeDiscipline,
    setActiveDiscipline,
    onSearch,
    resultCount,
    specializations,
    onSpecializationsChange,
    onApplyFilters,
    committedSpecializationsCount,
}) {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch();
    };

    return (
        <section className="sticky top-14 z-30 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3"
                >
                    <div className="flex-1 flex items-center bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 min-w-0">
                        <MdSearch className="text-gray-400 text-lg mr-2 shrink-0" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Specialization or keyword"
                            className="bg-transparent border-none focus:ring-0 focus:outline-none text-gray-900 w-full placeholder:text-gray-400 text-sm"
                        />
                    </div>

                    <div className="md:flex-1 md:max-w-sm">
                        <LocationAutocomplete
                            value={locationQuery}
                            onChange={setLocationQuery}
                            onSelect={onLocationSelect}
                            onClear={onLocationClear}
                            placeholder="City or zip code"
                        />
                    </div>

                    <button
                        type="submit"
                        className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm shrink-0"
                    >
                        Search
                    </button>
                </form>

                <div className="flex items-center justify-between gap-3 mt-3 relative">
                    <div className="flex items-center gap-2 flex-wrap">
                        {DISCIPLINES.map((d) => (
                            <button
                                key={d.key}
                                type="button"
                                onClick={() => setActiveDiscipline(d.key)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                                    activeDiscipline === d.key
                                        ? "bg-primary text-white"
                                        : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                                }`}
                            >
                                {d.label}
                            </button>
                        ))}
                        <TherapistFiltersPopover
                            specializations={specializations}
                            onSpecializationsChange={onSpecializationsChange}
                            onApply={onApplyFilters}
                            activeCount={committedSpecializationsCount}
                        />
                    </div>
                    <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                        {resultCount} therapist{resultCount !== 1 ? "s" : ""} found
                    </span>
                </div>
            </div>
        </section>
    );
}

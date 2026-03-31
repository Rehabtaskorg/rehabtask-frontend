"use client";

import { MdSearch } from "react-icons/md";
import LocationAutocomplete from "@/components/public/LocationAutocomplete";

const DISCIPLINES = [
    { key: "all", label: "All Disciplines" },
    { key: "pt", label: "Physical Therapy" },
    { key: "ot", label: "Occupational Therapy" },
    { key: "slp", label: "Speech-Language Pathology" },
];

export default function TherapistSearchHeader({
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
}) {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch();
    };

    return (
        <section className="bg-gray-50 border-b border-gray-200 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-6">Find a Therapist</h1>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col md:flex-row gap-3 mb-6 bg-white p-3 rounded-xl border border-gray-200 shadow-sm"
                >
                    <div className="flex-1 flex items-center bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                        <MdSearch className="text-gray-400 text-xl mr-3 shrink-0" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Specialization or keyword"
                            className="bg-transparent border-none focus:ring-0 focus:outline-none text-gray-900 w-full placeholder:text-gray-400 text-sm"
                        />
                    </div>
                    <LocationAutocomplete
                        value={locationQuery}
                        onChange={setLocationQuery}
                        onSelect={onLocationSelect}
                        onClear={onLocationClear}
                        placeholder="City or zip code"
                    />
                    <button
                        type="submit"
                        className="px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm shrink-0"
                    >
                        Search
                    </button>
                </form>

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        {DISCIPLINES.map((d) => (
                            <button
                                key={d.key}
                                onClick={() => setActiveDiscipline(d.key)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                    activeDiscipline === d.key
                                        ? "bg-primary text-white"
                                        : "bg-white border border-gray-200 text-gray-600 hover:border-primary/30 hover:text-gray-900"
                                }`}
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>
                    <span className="text-sm text-gray-500 font-medium">{resultCount} therapists found</span>
                </div>
            </div>
        </section>
    );
}

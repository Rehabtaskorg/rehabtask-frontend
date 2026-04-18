"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MdSearch, MdTune, MdChevronLeft, MdChevronRight, MdAdd, MdClose, MdRefresh, MdSort } from "react-icons/md";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useTherapistSearch } from "@/hooks/useTherapistSearch";
import TherapistCard from "@/components/therapist/TherapistCard";
import TherapistFilters from "@/components/therapist/TherapistFilters";
import { usePageTitle } from "@/hooks/usePageTitle";
import { DEFAULT_SERVICE_RADIUS_MILES } from "@/lib/constants";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const DEFAULT_FILTERS = {
    locationLabel: "",
    zipCode: "",
    latitude: undefined,
    longitude: undefined,
    radiusMiles: DEFAULT_SERVICE_RADIUS_MILES,
    licenseTypes: [],
    specializations: [],
};

const SORT_OPTIONS = [
    { value: "relevance", label: "Relevance" },
    { value: "rating", label: "Highest Rated" },
    { value: "experience", label: "Most Experience" },
    { value: "newest", label: "Newest" },
];

export default function FindTherapistsPage() {
    usePageTitle("Find Therapists");
    const router = useRouter();
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [page, setPage] = useState(1);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("relevance");
    const debounceRef = useRef(null);

    // Debounce search input (300ms)
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const trimmed = searchInput.trim();
            // Only trigger search for 2+ characters or when clearing
            if (trimmed.length >= 2 || trimmed.length === 0) {
                setSearchQuery(trimmed);
                setPage(1);
            }
        }, 300);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [searchInput]);

    // Build search params from filters
    const searchParams = useMemo(() => {
        const params = { page, limit: 20 };

        // Name search
        if (searchQuery) {
            params.search = searchQuery;
        }

        // Location
        if (filters.latitude && filters.longitude) {
            params.latitude = filters.latitude;
            params.longitude = filters.longitude;
            params.radiusMiles = filters.radiusMiles;
        }

        // Multi-value license types (comma-separated)
        if (filters.licenseTypes && filters.licenseTypes.length > 0) {
            params.primaryLicenseType = filters.licenseTypes.join(",");
        }

        // Multi-value specializations (comma-separated)
        if (filters.specializations && filters.specializations.length > 0) {
            params.specialization = filters.specializations.join(",");
        }

        // Sort
        if (sortBy && sortBy !== "relevance") {
            params.sortBy = sortBy;
        }

        return params;
    }, [filters, page, searchQuery, sortBy]);

    const { therapists, pagination, loading, error, refetch } = useTherapistSearch(searchParams);

    const handleFilterChange = useCallback((newFilters) => {
        setFilters(newFilters);
        setPage(1);
    }, []);

    const handleClearFilters = useCallback(() => {
        setFilters(DEFAULT_FILTERS);
        setSearchInput("");
        setSearchQuery("");
        setSortBy("relevance");
        setPage(1);
    }, []);

    const handleClearSearch = useCallback(() => {
        setSearchInput("");
        setSearchQuery("");
        setPage(1);
    }, []);

    const totalPages = pagination?.totalPages || 1;
    const total = pagination?.total || 0;

    // Generate page numbers for pagination
    const pageNumbers = useMemo(() => {
        const pages = [];
        const maxShow = 5;
        let start = Math.max(1, page - Math.floor(maxShow / 2));
        let end = Math.min(totalPages, start + maxShow - 1);
        if (end - start < maxShow - 1) {
            start = Math.max(1, end - maxShow + 1);
        }
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    }, [page, totalPages]);

    const hasActiveFilters = searchQuery || filters.licenseTypes.length > 0 || filters.specializations.length > 0 || !!filters.latitude || sortBy !== "relevance";

    return (
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Sticky Header */}
                <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-14 lg:top-0 z-10 px-4 sm:px-8 py-3 shrink-0">
                  <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-text-main dark:text-white">
                                Find Therapists
                            </h2>
                            {!loading && (
                                <p className="text-xs text-text-muted dark:text-gray-400 -mt-0.5">
                                    {total} therapist{total !== 1 ? "s" : ""} found
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => router.push("/customer/requests/new")}
                            className="bg-primary hover:bg-primary/90 text-white px-4 sm:px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                        >
                            <MdAdd className="text-lg" />
                            <span className="hidden sm:inline">Create a Request</span>
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1" role="search">
                            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-text-muted dark:text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search by therapist name..."
                                aria-label="Search therapists by name"
                                className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-text-main dark:text-white placeholder:text-text-muted dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                            {searchInput && (
                                <button
                                    onClick={handleClearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white"
                                    aria-label="Clear search"
                                >
                                    <MdClose className="text-base" />
                                </button>
                            )}
                        </div>

                        {/* Sort Dropdown */}
                        <div className="hidden sm:flex items-center gap-1.5">
                            <MdSort className="text-lg text-text-muted dark:text-gray-400" />
                            <select
                                value={sortBy}
                                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                                aria-label="Sort therapists"
                                className="text-sm rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-text-main dark:text-white py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                                {SORT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                  </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 flex gap-8">
                        {/* ── Desktop Sidebar ── */}
                        <div className="hidden md:block w-72 shrink-0">
                            <TherapistFilters
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                onClear={handleClearFilters}
                            />
                        </div>

                        {/* ── Main Content ── */}
                        <div className="flex-1 min-w-0">
                            {/* Mobile Sort (shown below search on mobile) */}
                            <div className="sm:hidden mb-4 flex items-center gap-2">
                                <MdSort className="text-lg text-text-muted dark:text-gray-400" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                                    aria-label="Sort therapists"
                                    className="flex-1 text-sm rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-text-main dark:text-white py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                >
                                    {SORT_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Loading */}
                            {loading && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className="h-64 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl animate-pulse"
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Error */}
                            {!loading && error && (
                                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-10 text-center">
                                    <p className="text-text-muted dark:text-gray-400 text-sm mb-3">
                                        Failed to load therapists.
                                    </p>
                                    <button
                                        onClick={refetch}
                                        className="text-primary hover:underline text-sm font-bold flex items-center gap-1 mx-auto"
                                    >
                                        <MdRefresh className="text-base" /> Try again
                                    </button>
                                </div>
                            )}

                            {/* Empty */}
                            {!loading && !error && therapists.length === 0 && (
                                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-10 text-center">
                                    <MdSearch className="text-5xl text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                                    <p className="text-text-main dark:text-white font-bold text-base mb-1">
                                        No therapists found
                                    </p>
                                    <p className="text-text-muted dark:text-gray-400 text-sm mb-4">
                                        {searchQuery
                                            ? `No results for "${searchQuery}". Try a different name or adjust your filters.`
                                            : "Try adjusting your filters or expanding the search radius."
                                        }
                                    </p>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={handleClearFilters}
                                            className="text-primary hover:underline text-sm font-bold"
                                        >
                                            Clear all filters
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Results Grid */}
                            {!loading && !error && therapists.length > 0 && (
                                <>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {therapists.map((therapist) => (
                                            <TherapistCard
                                                key={therapist.id}
                                                therapist={therapist}
                                                onClick={() =>
                                                    router.push(`/customer/find-therapists/${therapist.id}`)
                                                }
                                            />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-center gap-2 mt-8">
                                            <button
                                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                                disabled={page === 1}
                                                className="p-2 rounded-lg border border-border-light dark:border-border-dark text-text-muted dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <MdChevronLeft className="text-lg" />
                                            </button>
                                            {pageNumbers.map((p) => (
                                                <button
                                                    key={p}
                                                    onClick={() => setPage(p)}
                                                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${p === page
                                                        ? "bg-primary text-white"
                                                        : "border border-border-light dark:border-border-dark text-text-main dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                                                        }`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                                disabled={page === totalPages}
                                                className="p-2 rounded-lg border border-border-light dark:border-border-dark text-text-muted dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <MdChevronRight className="text-lg" />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Mobile Filter Toggle ── */}
                <button
                    onClick={() => setShowMobileFilters(true)}
                    className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-text-main dark:bg-white text-white dark:text-text-main px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold text-sm z-50"
                >
                    <MdTune className="text-lg" />
                    Filters
                </button>

                {/* ── Mobile Filter Overlay ── */}
                {showMobileFilters && (
                    <div className="fixed inset-0 z-60 md:hidden flex flex-col">
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setShowMobileFilters(false)}
                        />
                        <div className="relative mt-auto bg-background-light dark:bg-background-dark rounded-t-2xl max-h-[85vh] overflow-y-auto p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-text-main dark:text-white">
                                    Filters
                                </h3>
                                <button
                                    onClick={() => setShowMobileFilters(false)}
                                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-text-muted dark:text-gray-400"
                                >
                                    <MdClose className="text-xl" />
                                </button>
                            </div>
                            <TherapistFilters
                                filters={filters}
                                onFilterChange={(f) => {
                                    handleFilterChange(f);
                                }}
                                onClear={() => {
                                    handleClearFilters();
                                    setShowMobileFilters(false);
                                }}
                            />
                            <button
                                onClick={() => setShowMobileFilters(false)}
                                className="w-full mt-4 bg-primary text-white py-3 rounded-lg font-bold text-sm"
                            >
                                Show Results
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </APIProvider>
    );
}
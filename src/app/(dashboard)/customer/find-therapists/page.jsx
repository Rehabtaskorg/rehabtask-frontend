"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MdSearch, MdTune, MdChevronLeft, MdChevronRight, MdAdd, MdClose, MdRefresh, MdPersonSearch } from "react-icons/md";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useTherapistSearch } from "@/hooks/useTherapistSearch";
import TherapistCard from "@/components/therapist/TherapistCard";
import TherapistFilters from "@/components/therapist/TherapistFilters";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const DEFAULT_FILTERS = {
    zipCode: "",
    latitude: undefined,
    longitude: undefined,
    radiusMiles: 25,
    specializations: [],
};

export default function FindTherapistsPage() {
    const router = useRouter();
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [page, setPage] = useState(1);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Build search params from filters
    const searchParams = useMemo(() => {
        const params = { page, limit: 20 };
        if (filters.latitude && filters.longitude) {
            params.latitude = filters.latitude;
            params.longitude = filters.longitude;
            params.radiusMiles = filters.radiusMiles;
        }
        if (filters.specializations && filters.specializations.length > 0) {
            params.specialization = filters.specializations[0];
        }
        return params;
    }, [filters, page]);

    const { therapists, pagination, loading, error, refetch } = useTherapistSearch(searchParams);

    const handleFilterChange = useCallback((newFilters) => {
        setFilters(newFilters);
        setPage(1);
    }, []);

    const handleClearFilters = useCallback(() => {
        setFilters(DEFAULT_FILTERS);
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

    return (
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Sticky Header */}
                <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-14 lg:top-0 z-10 flex items-center justify-between px-4 sm:px-8 shrink-0">
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
                                    <p className="text-text-muted dark:text-gray-400 text-sm">
                                        Try adjusting your filters or expanding the search radius.
                                    </p>
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
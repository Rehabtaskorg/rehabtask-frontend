"use client";

import { useState, useCallback, useRef } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import { motion } from "framer-motion";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { useSearchTherapists } from "@/hooks/usePublic";
import { useAppRole } from "@/hooks/useAppRole";
import TherapistSearchHeader from "@/components/public/TherapistSearchHeader";
import TherapistFilterSidebar, { FilterToggleButton } from "@/components/public/TherapistFilterSidebar";
import TherapistPublicCard from "@/components/public/TherapistPublicCard";
import AuthGateModal from "@/components/public/AuthGateModal";
import WhyChooseUs from "@/components/public/WhyChooseUs";
import PublicStats from "@/components/public/PublicStats";
import Testimonials from "@/components/public/Testimonials";
import CTABanner from "@/components/public/CTABanner";

const DISCIPLINE_MAP = { pt: "Physical Therapist", ot: "Occupational Therapist", slp: "Speech-Language Pathologist" };

function mapTherapist(t) {
    const location = t.workAreas?.length > 0
        ? `${t.workAreas[0].city}, ${t.workAreas[0].state}`
        : "Location not specified";
    return {
        id: t.id,
        fullName: t.fullName || "",
        licenseType: t.primaryLicenseType || "",
        specialization: t.specialization || t.primaryLicenseType || "",
        experience: t.yearsOfExperience || 0,
        location,
        rating: t.averageRating || 0,
        reviewCount: t.reviewCount || 0,
        rate: t.ratePerVisit ? parseFloat(t.ratePerVisit) : 0,
        photoUrl: t.profilePhotoUrl || null,
    };
}

function FindTherapistsContent() {
    const userRole = useAppRole();

    // --- Search header inputs (draft state, not sent until submit) ---
    const [searchInput, setSearchInput] = useState("");
    const [locationInput, setLocationInput] = useState("");

    // --- Location coordinates from Places Autocomplete ---
    const locationCoords = useRef(null);

    // --- Committed search values (sent to API) ---
    const [committedSearch, setCommittedSearch] = useState("");
    const [committedCoords, setCommittedCoords] = useState(null);

    // --- Discipline pills (applied immediately on click) ---
    const [activeDiscipline, setActiveDiscipline] = useState("all");

    // --- Sidebar filter state (applied on "Apply Filters") ---
    const [specializations, setSpecializations] = useState([]);
    const [committedSpecializations, setCommittedSpecializations] = useState([]);

    // --- Sort & pagination ---
    const [sortBy, setSortBy] = useState("rating");
    const [currentPage, setCurrentPage] = useState(1);

    // --- Sidebar visibility ---
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // --- Auth gate ---
    const [gateOpen, setGateOpen] = useState(false);
    const [gateTrigger, setGateTrigger] = useState("default");

    // Store coordinates when user selects a place from autocomplete
    const handleLocationSelect = useCallback((place) => {
        locationCoords.current = { latitude: place.latitude, longitude: place.longitude };
    }, []);

    // Clear coordinates when user clears the location input
    const handleLocationClear = useCallback(() => {
        locationCoords.current = null;
    }, []);

    // Commit search header values on explicit Search click / Enter
    const handleSearch = useCallback(() => {
        setCommittedSearch(searchInput.trim());
        setCommittedCoords(locationCoords.current ? { ...locationCoords.current } : null);
        setCurrentPage(1);
    }, [searchInput]);

    // Commit sidebar filters on Apply Filters
    const handleApplyFilters = useCallback(() => {
        setCommittedSpecializations([...specializations]);
        setCurrentPage(1);
    }, [specializations]);

    // Discipline pills apply immediately
    const handleDisciplineChange = useCallback((d) => {
        setActiveDiscipline(d);
        setCurrentPage(1);
    }, []);

    // Build API params from committed state only
    const params = {
        ...(committedSearch && { search: committedSearch }),
        ...(committedCoords && {
            latitude: committedCoords.latitude,
            longitude: committedCoords.longitude,
            radiusMiles: 50,
        }),
        ...(committedSpecializations.length > 0 && { specialization: committedSpecializations.join(",") }),
        ...(activeDiscipline !== "all" && { primaryLicenseType: DISCIPLINE_MAP[activeDiscipline] }),
        sortBy,
        page: currentPage,
        limit: 9,
    };

    const { data, isLoading, isFetching } = useSearchTherapists(params);

    const therapists = (data?.therapists || []).map(mapTherapist);
    const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

    const handleAuthGate = (trigger) => {
        setGateTrigger(trigger);
        setGateOpen(true);
    };

    return (
        <>
            <div className="pt-16 min-h-screen bg-white">
                <TherapistSearchHeader
                    searchQuery={searchInput}
                    setSearchQuery={setSearchInput}
                    locationQuery={locationInput}
                    setLocationQuery={setLocationInput}
                    onLocationSelect={handleLocationSelect}
                    onLocationClear={handleLocationClear}
                    activeDiscipline={activeDiscipline}
                    setActiveDiscipline={handleDisciplineChange}
                    onSearch={handleSearch}
                    resultCount={pagination.total}
                />

                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="flex items-center justify-between mb-6 lg:hidden">
                        <FilterToggleButton
                            onClick={() => setSidebarOpen(true)}
                            activeCount={committedSpecializations.length}
                        />
                        <select
                            value={sortBy}
                            onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                            className="border border-gray-200 rounded-lg text-sm font-medium text-gray-700 py-2 px-3 bg-white"
                        >
                            <option value="rating">Highest Rated</option>
                            <option value="experience">Most Experienced</option>
                            <option value="newest">Newest</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
                        <TherapistFilterSidebar
                            isOpen={sidebarOpen}
                            onClose={() => setSidebarOpen(false)}
                            specializations={specializations}
                            onSpecializationsChange={setSpecializations}
                            onApply={handleApplyFilters}
                        />

                        <div>
                            <div className="hidden lg:flex justify-end mb-4">
                                <select
                                    value={sortBy}
                                    onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                                    className="border border-gray-200 rounded-lg text-sm font-medium text-gray-700 py-2 px-4 bg-white"
                                >
                                    <option value="rating">Highest Rated</option>
                                    <option value="experience">Most Experienced</option>
                                    <option value="newest">Newest</option>
                                </select>
                            </div>

                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-6 animate-pulse">
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-20 h-20 rounded-full bg-gray-200" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 w-32 bg-gray-200 rounded" />
                                                    <div className="h-3 w-24 bg-gray-200 rounded" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-3 w-full bg-gray-200 rounded" />
                                                <div className="h-3 w-2/3 bg-gray-200 rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : therapists.length === 0 ? (
                                <div className="text-center py-16">
                                    <p className="text-gray-500">No therapists match your search criteria.</p>
                                </div>
                            ) : (
                                <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 ${isFetching ? "opacity-60 pointer-events-none" : ""}`}>
                                    {therapists.map((t, i) => (
                                        <TherapistPublicCard
                                            key={t.id}
                                            therapist={t}
                                            index={i}
                                            onAuthGate={handleAuthGate}
                                        />
                                    ))}
                                </div>
                            )}

                            {pagination.totalPages > 1 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center justify-between pt-10 border-t border-gray-100 mt-10"
                                >
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-primary disabled:opacity-30 transition-colors"
                                    >
                                        <MdChevronLeft className="text-lg" /> Previous
                                    </button>
                                    <div className="flex gap-2">
                                        {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${
                                                    currentPage === page
                                                        ? "bg-primary text-white"
                                                        : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                                        disabled={currentPage === pagination.totalPages}
                                        className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-primary disabled:opacity-30 transition-colors"
                                    >
                                        Next <MdChevronRight className="text-lg" />
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </section>

                <WhyChooseUs />
                <PublicStats />
                <Testimonials />
                <CTABanner />
            </div>

            <AuthGateModal
                isOpen={gateOpen}
                onClose={() => setGateOpen(false)}
                trigger={gateTrigger}
                redirectPath="/therapists"
                userRole={userRole}
            />
        </>
    );
}

export default function FindTherapistsPage() {
    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
            <FindTherapistsContent />
        </APIProvider>
    );
}

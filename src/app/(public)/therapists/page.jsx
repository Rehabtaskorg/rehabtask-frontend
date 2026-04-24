"use client";

import { useState, useCallback, useRef } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useSearchTherapists } from "@/hooks/usePublic";
import { useAppRole } from "@/hooks/useAppRole";
import TherapistSearchHeader from "@/components/public/TherapistSearchHeader";
import TherapistResultsLayout from "@/components/public/TherapistResultsLayout";
import AuthGateModal from "@/components/public/AuthGateModal";
import WhyChooseUs from "@/components/public/WhyChooseUs";
import PublicStats from "@/components/public/PublicStats";
import Testimonials from "@/components/public/Testimonials";
import CTABanner from "@/components/public/CTABanner";

const DISCIPLINE_MAP = { pt: "Physical Therapist", ot: "Occupational Therapist", slp: "Speech-Language Pathologist" };

function mapTherapist(t) {
    const firstArea = t.workAreas?.[0];
    const location = firstArea ? `${firstArea.city}, ${firstArea.state}` : "Location not specified";
    return {
        id: t.id,
        fullName: t.fullName || "",
        licenseType: t.primaryLicenseType || "",
        specialization: t.specialization || t.primaryLicenseType || "",
        experience: t.yearsOfExperience || 0,
        location,
        latitude: firstArea?.latitude ? parseFloat(firstArea.latitude) : null,
        longitude: firstArea?.longitude ? parseFloat(firstArea.longitude) : null,
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
            <div className="pt-16 min-h-screen bg-background-light dark:bg-background-dark">
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

                <TherapistResultsLayout
                    therapists={therapists}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    sidebarOpen={sidebarOpen}
                    onSidebarClose={setSidebarOpen}
                    specializations={specializations}
                    onSpecializationsChange={setSpecializations}
                    onApplyFilters={handleApplyFilters}
                    committedSpecializations={committedSpecializations}
                    sortBy={sortBy}
                    onSortChange={(v) => { setSortBy(v); setCurrentPage(1); }}
                    currentPage={currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={setCurrentPage}
                    onAuthGate={handleAuthGate}
                    searchCenter={committedCoords ? { lat: committedCoords.latitude, lng: committedCoords.longitude } : null}
                />

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

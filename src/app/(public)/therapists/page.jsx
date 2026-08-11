"use client";

import { Suspense, useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useSearchTherapists } from "@/hooks/usePublic";
import { useAppRole } from "@/hooks/useAppRole";
import { useAnalytics } from "@/hooks/useAnalytics";
import TherapistAppNavbar from "@/components/public/TherapistAppNavbar";
import TherapistCompactHeader from "@/components/public/TherapistCompactHeader";
import TherapistResultsLayout from "@/components/public/TherapistResultsLayout";
import AuthGateModal from "@/components/public/AuthGateModal";
import { aggregatePinsByLocation } from "@/lib/mapPinAggregation";
import { DISCIPLINE_PILLS } from "@/lib/constants";

/**
 * @param {object} t - Raw therapist from API
 * @returns {object} Mapped therapist for UI
 */
function mapTherapist(t) {
    const firstArea = t.workAreas?.[0];
    const location = firstArea ? `${firstArea.city}, ${firstArea.state}` : "Location not specified";
    return {
        id: t.id,
        userId: t.userId,
        fullName: t.fullName || "",
        licenseType: t.primaryLicenseType || "",
        experience: t.yearsOfExperience || 0,
        location,
        rating: t.averageRating || 0,
        reviewCount: t.reviewCount || 0,
        rate: t.ratePerVisit ? parseFloat(t.ratePerVisit) : 0,
        photoUrl: t.profilePhotoUrl || null,
    };
}

/**
 * @param {Array} rawTherapists - Raw therapists from API
 * @returns {Array} Map pins with coordinates
 */
function buildMapPins(rawTherapists) {
    const pins = [];
    for (const t of rawTherapists || []) {
        for (const area of t.workAreas || []) {
            if (!area.latitude || !area.longitude) continue;
            pins.push({
                id: `${t.id}__${area.city}_${area.state}_${area.latitude}_${area.longitude}`,
                therapistId: t.id,
                userId: t.userId,
                fullName: t.fullName || "",
                rate: t.ratePerVisit ? parseFloat(t.ratePerVisit) : 0,
                photoUrl: t.profilePhotoUrl || null,
                rating: t.averageRating || 0,
                reviewCount: t.reviewCount || 0,
                location: `${area.city}, ${area.state}`,
                latitude: parseFloat(area.latitude),
                longitude: parseFloat(area.longitude),
            });
        }
    }
    return pins;
}

function FindTherapistsContent() {
    const userRole = useAppRole();
    const searchParams = useSearchParams();
    const { trackEvent } = useAnalytics();

    const initialLicenseType = searchParams.get("licenseType") || "";
    const initialLocation = searchParams.get("location") || "";
    const initialLat = searchParams.get("lat");
    const initialLng = searchParams.get("lng");
    const initialCoords = initialLat && initialLng
        ? { latitude: parseFloat(initialLat), longitude: parseFloat(initialLng) }
        : null;

    const [licenseType, setLicenseType] = useState(initialLicenseType);
    const [locationInput, setLocationInput] = useState(initialLocation);
    const locationCoords = useRef(initialCoords);

    const [committedLicenseType, setCommittedLicenseType] = useState(initialLicenseType);
    const [committedCoords, setCommittedCoords] = useState(initialCoords);

    const [activeDiscipline, setActiveDiscipline] = useState("all");
    const [sortBy, setSortBy] = useState("relevance");
    const [currentPage, setCurrentPage] = useState(1);

    const [gateOpen, setGateOpen] = useState(false);
    const [gateTrigger, setGateTrigger] = useState("default");
    const [gateEntityId, setGateEntityId] = useState(null);
    const [locationError, setLocationError] = useState("");

    const searchTriggeredRef = useRef(false);

    const handleLocationSelect = useCallback((place) => {
        locationCoords.current = { latitude: place.latitude, longitude: place.longitude };
        setLocationError("");
    }, []);

    const handleLocationClear = useCallback(() => {
        locationCoords.current = null;
        setLocationError("");
        setCommittedCoords(null);
        setCurrentPage(1);
    }, []);

    const handleSearch = useCallback(() => {
        if (locationInput.trim() && !locationCoords.current) {
            setLocationError("Please select a location from the dropdown.");
            return;
        }
        setLocationError("");
        searchTriggeredRef.current = true;
        setCommittedLicenseType(licenseType);
        setCommittedCoords(locationCoords.current ? { ...locationCoords.current } : null);
        setActiveDiscipline("all");
        setCurrentPage(1);
    }, [licenseType, locationInput]);

    const handleDisciplineChange = useCallback((d) => {
        setActiveDiscipline(d);
        setCommittedLicenseType("");
        setLicenseType("");
        setCommittedCoords(null);
        setLocationInput("");
        locationCoords.current = null;
        setLocationError("");
        setCurrentPage(1);
    }, []);

    const handleDisciplineClear = useCallback(() => {
        setCommittedLicenseType("");
        setCurrentPage(1);
    }, []);

    const handleClearFilters = useCallback(() => {
        setLicenseType("");
        setLocationInput("");
        locationCoords.current = null;
        setCommittedLicenseType("");
        setCommittedCoords(null);
        setActiveDiscipline("all");
        setSortBy("relevance");
        setCurrentPage(1);
    }, []);

    const searchParamsQuery = useMemo(() => {
        const params = { page: currentPage, limit: 9, sortBy };

        if (committedCoords) {
            params.latitude = committedCoords.latitude;
            params.longitude = committedCoords.longitude;
        }

        if (committedLicenseType) {
            params.primaryLicenseType = committedLicenseType;
        } else if (activeDiscipline !== "all") {
            const pill = DISCIPLINE_PILLS.find((d) => d.key === activeDiscipline);
            if (pill?.licenseTypes.length) {
                params.primaryLicenseType = pill.licenseTypes.join(",");
            }
        }

        return params;
    }, [committedLicenseType, committedCoords, activeDiscipline, sortBy, currentPage]);

    const { data, isLoading, isFetching, isError } = useSearchTherapists(searchParamsQuery);

    useEffect(() => {
        if (!data || isFetching || !searchTriggeredRef.current) return;
        searchTriggeredRef.current = false;
        trackEvent("therapist_search_performed", {
            service_type: committedLicenseType || null,
            result_count: data.pagination?.total ?? data.therapists?.length ?? 0,
        });
    }, [data, isFetching, committedLicenseType, trackEvent]);

    const therapists = (data?.therapists || []).map(mapTherapist);
    const mapMarkers = aggregatePinsByLocation(buildMapPins(data?.therapists));
    const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

    const hasActiveFilters = !!committedLicenseType || !!committedCoords || activeDiscipline !== "all" || sortBy !== "relevance";

    const handleAuthGate = useCallback((trigger, entityId = null) => {
        setGateTrigger(trigger);
        setGateEntityId(entityId);
        setGateOpen(true);
    }, []);

    return (
        <>
            <TherapistAppNavbar
                searchQuery={licenseType}
                setSearchQuery={setLicenseType}
                locationQuery={locationInput}
                setLocationQuery={setLocationInput}
                onLocationSelect={handleLocationSelect}
                onLocationClear={handleLocationClear}
                onSearch={handleSearch}
                locationError={locationError}
                onDisciplineClear={handleDisciplineClear}
            />

            <div className="min-h-screen md:h-screen md:pt-16 md:overflow-hidden bg-white flex flex-col">
                <TherapistCompactHeader
                    activeDiscipline={activeDiscipline}
                    setActiveDiscipline={handleDisciplineChange}
                    resultCount={pagination.total}
                />

                <TherapistResultsLayout
                    therapists={therapists}
                    mapMarkers={mapMarkers}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    isError={isError}
                    sortBy={sortBy}
                    onSortChange={(v) => { setSortBy(v); setCurrentPage(1); }}
                    currentPage={currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={setCurrentPage}
                    onAuthGate={handleAuthGate}
                    searchCenter={committedCoords ? { lat: committedCoords.latitude, lng: committedCoords.longitude } : null}
                    hasActiveFilters={hasActiveFilters}
                    onClearFilters={handleClearFilters}
                />
            </div>

            <AuthGateModal
                isOpen={gateOpen}
                onClose={() => setGateOpen(false)}
                trigger={gateTrigger}
                entityId={gateEntityId}
                userRole={userRole}
            />
        </>
    );
}

export default function FindTherapistsPage() {
    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
            <Suspense fallback={<div className="h-screen bg-white" />}>
                <FindTherapistsContent />
            </Suspense>
        </APIProvider>
    );
}
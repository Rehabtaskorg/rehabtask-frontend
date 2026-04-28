"use client";

import { Suspense, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useSearchTherapists } from "@/hooks/usePublic";
import { useAppRole } from "@/hooks/useAppRole";
import TherapistAppNavbar from "@/components/public/TherapistAppNavbar";
import TherapistCompactHeader from "@/components/public/TherapistCompactHeader";
import TherapistResultsLayout from "@/components/public/TherapistResultsLayout";
import AuthGateModal from "@/components/public/AuthGateModal";
import { aggregatePinsByLocation } from "@/lib/mapPinAggregation";

const DISCIPLINE_MAP = { pt: "Physical Therapist", ot: "Occupational Therapist", slp: "Speech-Language Pathologist" };

function mapTherapist(t) {
    const firstArea = t.workAreas?.[0];
    const location = firstArea ? `${firstArea.city}, ${firstArea.state}` : "Location not specified";
    return {
        id: t.id,
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

function buildMapPins(rawTherapists) {
    const pins = [];
    for (const t of rawTherapists || []) {
        const areas = t.workAreas || [];
        for (const area of areas) {
            if (!area.latitude || !area.longitude) continue;
            pins.push({
                id: `${t.id}__${area.city}_${area.state}_${area.latitude}_${area.longitude}`,
                therapistId: t.id,
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

    // --- Discipline pills (applied immediately on click) ---
    const [activeDiscipline, setActiveDiscipline] = useState("all");


    const [sortBy, setSortBy] = useState("rating");
    const [currentPage, setCurrentPage] = useState(1);

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

    const handleSearch = useCallback(() => {
        setCommittedLicenseType(licenseType);
        setCommittedCoords(locationCoords.current ? { ...locationCoords.current } : null);
        setCurrentPage(1);
    }, [licenseType]);


    // Discipline pills apply immediately
    const handleDisciplineChange = useCallback((d) => {
        setActiveDiscipline(d);
        setCurrentPage(1);
    }, []);

    const params = {
        ...(committedCoords && {
            latitude: committedCoords.latitude,
            longitude: committedCoords.longitude,
            radiusMiles: 50,
        }),
        // License type selector takes precedence; discipline pill is a fallback
        ...(committedLicenseType
            ? { primaryLicenseType: committedLicenseType }
            : activeDiscipline !== "all" && { primaryLicenseType: DISCIPLINE_MAP[activeDiscipline] }
        ),
        sortBy,
        page: currentPage,
        limit: 9,
    };

    const { data, isLoading, isFetching } = useSearchTherapists(params);

    const therapists = (data?.therapists || []).map(mapTherapist);
    const mapMarkers = aggregatePinsByLocation(buildMapPins(data?.therapists));
    const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

    const handleAuthGate = (trigger) => {
        setGateTrigger(trigger);
        setGateOpen(true);
    };

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
                    sortBy={sortBy}
                    onSortChange={(v) => { setSortBy(v); setCurrentPage(1); }}
                    currentPage={currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={setCurrentPage}
                    onAuthGate={handleAuthGate}
                    searchCenter={committedCoords ? { lat: committedCoords.latitude, lng: committedCoords.longitude } : null}
                />
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
            <Suspense fallback={<div className="h-screen bg-white" />}>
                <FindTherapistsContent />
            </Suspense>
        </APIProvider>
    );
}

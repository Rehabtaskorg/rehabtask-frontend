"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useTherapistSearch } from "@/hooks/useTherapistSearch";
import { usePageTitle } from "@/hooks/usePageTitle";
import { aggregatePinsByLocation } from "@/lib/mapPinAggregation";
import { DISCIPLINE_PILLS } from "@/lib/constants";
import FindTherapistsHeader from "@/components/customer/find-therapists/FindTherapistsHeader";
import FindTherapistsPillsRow from "@/components/customer/find-therapists/FindTherapistsPillsRow";
import FindTherapistsResultsLayout from "@/components/customer/find-therapists/FindTherapistsResultsLayout";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

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
    usePageTitle("Find Therapists");

    const [licenseType, setLicenseType] = useState("");
    const [locationInput, setLocationInput] = useState("");
    const locationCoords = useRef(null);

    const [committedLicenseType, setCommittedLicenseType] = useState("");
    const [committedCoords, setCommittedCoords] = useState(null);

    const [activeDiscipline, setActiveDiscipline] = useState("all");
    const [sortBy, setSortBy] = useState("relevance");
    const [currentPage, setCurrentPage] = useState(1);

    const [locationError, setLocationError] = useState("");

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
        setCommittedLicenseType(licenseType);
        setCommittedCoords(locationCoords.current ? { ...locationCoords.current } : null);
        setActiveDiscipline("all");
        setCurrentPage(1);
    }, [licenseType, locationInput]);

    const handleClearFilters = useCallback(() => {
        setLicenseType("");
        setLocationInput("");
        locationCoords.current = null;
        setLocationError("");
        setCommittedLicenseType("");
        setCommittedCoords(null);
        setActiveDiscipline("all");
        setSortBy("relevance");
        setCurrentPage(1);
    }, []);

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

    const searchParams = useMemo(() => {
        const params = { page: currentPage, limit: 20, sortBy };

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

    const { therapists: rawTherapists, pagination, loading } = useTherapistSearch(searchParams);

    const therapists = rawTherapists.map(mapTherapist);
    const mapMarkers = aggregatePinsByLocation(buildMapPins(rawTherapists));

    const totalPages = pagination?.totalPages || 1;
    const total = pagination?.total || 0;

    const hasActiveFilters =
        !!committedLicenseType ||
        !!committedCoords ||
        activeDiscipline !== "all" ||
        sortBy !== "relevance";

    return (
        <div className="h-[calc(100vh-3.5rem)] lg:h-screen flex flex-col overflow-hidden bg-background-light">
            <FindTherapistsHeader
                resultCount={total}
                isLoading={loading}
                licenseType={licenseType}
                onLicenseTypeChange={setLicenseType}
                locationInput={locationInput}
                setLocationInput={setLocationInput}
                onLocationSelect={handleLocationSelect}
                onLocationClear={handleLocationClear}
                onSearch={handleSearch}
                locationError={locationError}
            />

            <FindTherapistsPillsRow
                activeDiscipline={activeDiscipline}
                setActiveDiscipline={handleDisciplineChange}
                sortBy={sortBy}
                onSortChange={(v) => { setSortBy(v); setCurrentPage(1); }}
            />

            <FindTherapistsResultsLayout
                therapists={therapists}
                mapMarkers={mapMarkers}
                isLoading={loading}
                isFetching={loading}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                searchCenter={committedCoords ? { lat: committedCoords.latitude, lng: committedCoords.longitude } : null}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={handleClearFilters}
            />
        </div>
    );
}

export default function FindTherapistsPage() {
    return (
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <FindTherapistsContent />
        </APIProvider>
    );
}
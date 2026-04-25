"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useTherapistSearch } from "@/hooks/useTherapistSearch";
import { usePageTitle } from "@/hooks/usePageTitle";
import { DEFAULT_SERVICE_RADIUS_MILES } from "@/lib/constants";
import { aggregatePinsByLocation } from "@/lib/mapPinAggregation";
import FindTherapistsHeader from "@/components/customer/find-therapists/FindTherapistsHeader";
import FindTherapistsPillsRow from "@/components/customer/find-therapists/FindTherapistsPillsRow";
import FindTherapistsResultsLayout from "@/components/customer/find-therapists/FindTherapistsResultsLayout";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const DISCIPLINE_MAP = {
    pt: "Physical Therapist",
    ot: "Occupational Therapist",
    slp: "Speech-Language Pathologist",
};

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
    usePageTitle("Find Therapists");

    const [licenseType, setLicenseType] = useState("");
    const [locationInput, setLocationInput] = useState("");
    const locationCoords = useRef(null);

    const [committedLicenseType, setCommittedLicenseType] = useState("");
    const [committedCoords, setCommittedCoords] = useState(null);

    const [activeDiscipline, setActiveDiscipline] = useState("all");

    const [radiusMiles, setRadiusMiles] = useState(DEFAULT_SERVICE_RADIUS_MILES);
    const [committedRadius, setCommittedRadius] = useState(DEFAULT_SERVICE_RADIUS_MILES);

    const [sortBy, setSortBy] = useState("relevance");
    const [currentPage, setCurrentPage] = useState(1);

    const handleLocationSelect = useCallback((place) => {
        locationCoords.current = { latitude: place.latitude, longitude: place.longitude };
    }, []);

    const handleLocationClear = useCallback(() => {
        locationCoords.current = null;
    }, []);

    const handleSearch = useCallback(() => {
        setCommittedLicenseType(licenseType);
        setCommittedCoords(locationCoords.current ? { ...locationCoords.current } : null);
        setCurrentPage(1);
    }, [licenseType]);

    const handleApplyFilters = useCallback(() => {
        setCommittedRadius(radiusMiles);
        setCurrentPage(1);
    }, [radiusMiles]);

    const handleClearFilters = useCallback(() => {
        setLicenseType("");
        setLocationInput("");
        locationCoords.current = null;
        setCommittedLicenseType("");
        setCommittedCoords(null);
        setActiveDiscipline("all");
        setRadiusMiles(DEFAULT_SERVICE_RADIUS_MILES);
        setCommittedRadius(DEFAULT_SERVICE_RADIUS_MILES);
        setSortBy("relevance");
        setCurrentPage(1);
    }, []);

    const handleDisciplineChange = useCallback((d) => {
        setActiveDiscipline(d);
        setCurrentPage(1);
    }, []);

    const searchParams = useMemo(() => {
        const params = { page: currentPage, limit: 20 };
        if (committedCoords) {
            params.latitude = committedCoords.latitude;
            params.longitude = committedCoords.longitude;
            params.radiusMiles = committedRadius;
        }
        // License type selector takes precedence; discipline pill is a fallback
        if (committedLicenseType) {
            params.primaryLicenseType = committedLicenseType;
        } else if (activeDiscipline !== "all") {
            params.primaryLicenseType = DISCIPLINE_MAP[activeDiscipline];
        }
        if (sortBy && sortBy !== "relevance") {
            params.sortBy = sortBy;
        }
        return params;
    }, [committedLicenseType, committedCoords, committedRadius, activeDiscipline, sortBy, currentPage]);

    const { therapists: rawTherapists, pagination, loading } = useTherapistSearch(searchParams);

    const therapists = rawTherapists.map(mapTherapist);
    const mapMarkers = aggregatePinsByLocation(buildMapPins(rawTherapists));

    const totalPages = pagination?.totalPages || 1;
    const total = pagination?.total || 0;

    const hasActiveFilters =
        !!committedLicenseType ||
        !!committedCoords ||
        activeDiscipline !== "all" ||
        committedRadius !== DEFAULT_SERVICE_RADIUS_MILES ||
        sortBy !== "relevance";

    return (
        <div className="h-[calc(100vh-3.5rem)] lg:h-screen flex flex-col overflow-hidden bg-background-light dark:bg-background-dark">
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
            />

            <FindTherapistsPillsRow
                activeDiscipline={activeDiscipline}
                setActiveDiscipline={handleDisciplineChange}
                radiusMiles={radiusMiles}
                onRadiusChange={setRadiusMiles}
                onApplyFilters={handleApplyFilters}
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

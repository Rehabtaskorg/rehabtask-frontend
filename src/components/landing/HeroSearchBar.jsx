"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { APIProvider } from "@vis.gl/react-google-maps";
import LocationAutocomplete from "@/components/public/LocationAutocomplete";
import SpecializationAutocomplete from "@/components/public/SpecializationAutocomplete";

function HeroSearchBarInner() {
    const router = useRouter();
    const [specialization, setSpecialization] = useState("");
    const [locationLabel, setLocationLabel] = useState("");
    const coordsRef = useRef(null);

    const handleLocationSelect = (place) => {
        coordsRef.current = { latitude: place.latitude, longitude: place.longitude };
    };

    const handleLocationClear = () => {
        coordsRef.current = null;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        const trimmed = specialization.trim();
        if (trimmed) params.set("q", trimmed);
        if (locationLabel.trim()) params.set("location", locationLabel.trim());
        if (coordsRef.current) {
            params.set("lat", String(coordsRef.current.latitude));
            params.set("lng", String(coordsRef.current.longitude));
        }
        const query = params.toString();
        router.push(query ? `/therapists?${query}` : "/therapists");
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-lg">
            <SpecializationAutocomplete
                value={specialization}
                onChange={setSpecialization}
                placeholder="Specialization or keyword"
                variant="stacked"
            />

            <LocationAutocomplete
                value={locationLabel}
                onChange={setLocationLabel}
                onSelect={handleLocationSelect}
                onClear={handleLocationClear}
                placeholder="City or zip code"
                variant="stacked"
            />

            <button
                type="submit"
                className="w-full px-6 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors text-base shadow-sm"
            >
                Find a Therapist
            </button>
        </form>
    );
}

export default function HeroSearchBar() {
    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
            <HeroSearchBarInner />
        </APIProvider>
    );
}

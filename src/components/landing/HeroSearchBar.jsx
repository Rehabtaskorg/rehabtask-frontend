"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { MdSearch } from "react-icons/md";
import { APIProvider } from "@vis.gl/react-google-maps";
import LocationAutocomplete from "@/components/public/LocationAutocomplete";

function HeroSearchBarInner() {
    const router = useRouter();
    const [query, setQuery] = useState("");
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
        const trimmed = query.trim();
        if (trimmed) params.set("q", trimmed);
        if (locationLabel.trim()) params.set("location", locationLabel.trim());
        if (coordsRef.current) {
            params.set("lat", String(coordsRef.current.latitude));
            params.set("lng", String(coordsRef.current.longitude));
        }
        const qs = params.toString();
        router.push(qs ? `/therapists?${qs}` : "/therapists");
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-lg">
            <div className="flex items-center bg-white px-4 py-4 rounded-xl border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                <MdSearch className="text-gray-400 text-xl mr-3 shrink-0" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name"
                    className="bg-transparent border-none focus:ring-0 focus:outline-none text-gray-900 w-full placeholder:text-gray-400 text-sm"
                />
            </div>

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

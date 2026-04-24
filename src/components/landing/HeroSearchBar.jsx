"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { APIProvider } from "@vis.gl/react-google-maps";
import { MdSearch } from "react-icons/md";
import LocationAutocomplete from "@/components/public/LocationAutocomplete";

function HeroSearchBarInner() {
    const router = useRouter();
    const [keyword, setKeyword] = useState("");
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
        const trimmedKeyword = keyword.trim();
        if (trimmedKeyword) params.set("q", trimmedKeyword);
        if (locationLabel.trim()) params.set("location", locationLabel.trim());
        if (coordsRef.current) {
            params.set("lat", String(coordsRef.current.latitude));
            params.set("lng", String(coordsRef.current.longitude));
        }
        const query = params.toString();
        router.push(query ? `/therapists?${query}` : "/therapists");
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white p-2 rounded-2xl shadow-xl shadow-primary/5 border border-gray-100 flex flex-col md:flex-row items-stretch gap-2"
        >
            <div className="flex-1 flex items-center bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                <MdSearch className="text-gray-400 text-xl mr-3 shrink-0" />
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Specialization or keyword"
                    className="bg-transparent border-none focus:ring-0 focus:outline-none text-gray-900 w-full placeholder:text-gray-400 text-sm"
                />
            </div>

            <LocationAutocomplete
                value={locationLabel}
                onChange={setLocationLabel}
                onSelect={handleLocationSelect}
                onClear={handleLocationClear}
                placeholder="City or zip code"
            />

            <button
                type="submit"
                className="px-8 py-4 md:py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors text-sm shrink-0 flex items-center justify-center gap-2"
            >
                <MdSearch className="text-lg md:hidden" />
                Search
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

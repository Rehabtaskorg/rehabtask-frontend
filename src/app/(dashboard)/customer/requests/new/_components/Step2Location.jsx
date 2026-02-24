"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MdLocationOn, MdCheck } from "react-icons/md";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import useRequestStore from "@/store/requestStore";

const INPUT_CLASS =
    "w-full bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark rounded-lg text-sm text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none";

export default function Step2Location() {
    const { step2, setStep2 } = useRequestStore();
    const placesLib = useMapsLibrary("places");
    const geocodingLib = useMapsLibrary("geocoding");

    const [inputValue, setInputValue] = useState(step2.address || "");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [serviceReady, setServiceReady] = useState(false);

    const autocompleteServiceRef = useRef(null);
    const geocoderRef = useRef(null);
    const debounceTimerRef = useRef(null);
    const wrapperRef = useRef(null);

    // Initialize services when libraries load
    useEffect(() => {
        if (placesLib) {
            autocompleteServiceRef.current = new placesLib.AutocompleteService();
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setServiceReady(true);
        }
    }, [placesLib]);

    useEffect(() => {
        if (geocodingLib) {
            geocoderRef.current = new geocodingLib.Geocoder();
        }
    }, [geocodingLib]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch suggestions with debounce
    const fetchSuggestions = useCallback(
        (input) => {
            if (!autocompleteServiceRef.current || !input.trim()) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

            debounceTimerRef.current = setTimeout(() => {
                autocompleteServiceRef.current.getPlacePredictions(
                    {
                        input,
                        types: ["address"],
                        componentRestrictions: { country: "us" },
                    },
                    (predictions, status) => {
                        if (
                            status === google.maps.places.PlacesServiceStatus.OK &&
                            predictions
                        ) {
                            setSuggestions(predictions);
                            setShowSuggestions(true);
                        } else {
                            setSuggestions([]);
                            setShowSuggestions(false);
                        }
                    }
                );
            }, 300);
        },
        []
    );

    const handleInput = (e) => {
        const value = e.target.value;
        setInputValue(value);

        if (!value) {
            setStep2({ address: "", latitude: null, longitude: null });
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        fetchSuggestions(value);
    };

    const handleSelect = async (description) => {
        setInputValue(description);
        setSuggestions([]);
        setShowSuggestions(false);

        if (!geocoderRef.current) return;

        try {
            const response = await geocoderRef.current.geocode({ address: description });
            if (response.results && response.results[0]) {
                const { lat, lng } = response.results[0].geometry.location;
                setStep2({
                    address: description,
                    latitude: lat(),
                    longitude: lng(),
                });
            }
        } catch (error) {
            console.error("Geocode error:", error);
        }
    };

    const hasLocation = step2.latitude !== null && step2.longitude !== null;
    const mapCenter = hasLocation
        ? { lat: step2.latitude, lng: step2.longitude }
        : { lat: 40.7128, lng: -74.006 };

    return (
        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-text-main dark:text-white">
                Step 2: Location
            </h3>

            {/* Address Input */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Service Address <span className="text-red-500">*</span>
                </label>
                <div className="relative" ref={wrapperRef}>
                    <MdLocationOn className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInput}
                        onFocus={() => {
                            if (suggestions.length > 0) setShowSuggestions(true);
                        }}
                        disabled={!serviceReady}
                        placeholder={
                            serviceReady
                                ? "Start typing your address..."
                                : "Loading address search..."
                        }
                        className={`${INPUT_CLASS} pl-10 pr-4 py-2.5`}
                    />

                    {/* Suggestions dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <ul className="absolute z-10 mt-1 w-full bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg shadow-lg overflow-hidden">
                            {suggestions.map((suggestion) => (
                                <li
                                    key={suggestion.place_id}
                                    onClick={() => handleSelect(suggestion.description)}
                                    className="px-4 py-3 text-sm cursor-pointer hover:bg-background-light dark:hover:bg-background-dark text-text-main dark:text-white flex items-center gap-2"
                                >
                                    <MdLocationOn className="text-slate-400 shrink-0" />
                                    {suggestion.description}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {!hasLocation && inputValue && !showSuggestions && (
                    <p className="text-xs text-text-muted dark:text-gray-500 mt-1">
                        Select an address from the suggestions above
                    </p>
                )}
                {hasLocation && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                        <MdCheck /> Location confirmed
                    </p>
                )}
            </div>

            {/* Map Preview */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Map Preview
                    </label>
                </div>
                <div className="aspect-video w-full rounded-xl overflow-hidden border border-border-light dark:border-border-dark">
                    <Map
                        defaultCenter={mapCenter}
                        center={hasLocation ? mapCenter : undefined}
                        defaultZoom={hasLocation ? 15 : 11}
                        zoom={hasLocation ? 15 : undefined}
                        mapId="request-location-map"
                        disableDefaultUI
                        className="w-full h-full"
                    >
                        {hasLocation && <AdvancedMarker position={mapCenter} />}
                    </Map>
                </div>
                {!hasLocation && (
                    <p className="text-xs text-text-muted dark:text-gray-500 mt-1.5 text-center">
                        Search for an address above to see it on the map
                    </p>
                )}
            </div>
        </div>
    );
}
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useMapsLibrary, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { MdClose, MdLocationOn, MdSearch } from "react-icons/md";
import Button from "@/components/ui/Button";

const DEFAULT_CENTER = { lat: 39.8283, lng: -98.5795 };
const DEFAULT_ZOOM = 4;
const SELECTED_ZOOM = 10;

const WorkAreaFormModal = ({ isOpen, onClose, workArea, onSave }) => {
    const isEditing = !!workArea;

    const placesLib = useMapsLibrary("places");
    const geocodingLib = useMapsLibrary("geocoding");
    const autocompleteServiceRef = useRef(null);
    const geocoderRef = useRef(null);
    const debounceTimerRef = useRef(null);
    const suggestionsRef = useRef(null);

    const [searchInput, setSearchInput] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [radiusMiles, setRadiusMiles] = useState(25);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (placesLib) {
            autocompleteServiceRef.current = new placesLib.AutocompleteService();
        }
    }, [placesLib]);

    useEffect(() => {
        if (geocodingLib) {
            geocoderRef.current = new geocodingLib.Geocoder();
        }
    }, [geocodingLib]);

    // ── Pre-fill state when modal opens (reset on add, populate on edit) ──
    useEffect(() => {
        if (isOpen) {
            if (workArea) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setSearchInput(`${workArea.city}, ${workArea.state}`);
                setCity(workArea.city || "");
                setState(workArea.state || "");
                setLatitude(parseFloat(workArea.latitude) || null);
                setLongitude(parseFloat(workArea.longitude) || null);
                setRadiusMiles(workArea.radiusMiles || 25);
            } else {
                setSearchInput("");
                setCity("");
                setState("");
                setLatitude(null);
                setLongitude(null);
                setRadiusMiles(25);
            }
            setSuggestions([]);
            setShowSuggestions(false);
            setError(null);
        }
    }, [isOpen, workArea]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchSuggestions = useCallback(
        (input) => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

            if (!input || input.length < 2 || !autocompleteServiceRef.current) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            debounceTimerRef.current = setTimeout(() => {
                autocompleteServiceRef.current.getPlacePredictions(
                    {
                        input,
                        // types: ["(cities)"] — we want city-level results for work areas
                        // (vs ["address"] in the customer flow)
                        types: ["(cities)"],
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

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);
        fetchSuggestions(value);

        if (latitude !== null) {
            setCity("");
            setState("");
            setLatitude(null);
            setLongitude(null);
        }
    };

    const handleSelectSuggestion = async (suggestion) => {
        setShowSuggestions(false);
        setSearchInput(suggestion.description);
        setError(null);

        if (!geocoderRef.current) {
            setError("Geocoding service not available. Please try again.");
            return;
        }

        try {
            const response = await geocoderRef.current.geocode({
                address: suggestion.description,
            });

            if (response.results && response.results.length > 0) {
                const result = response.results[0];
                // lat() and lng() are functions on google.maps.LatLng, not plain values
                const lat = result.geometry.location.lat();
                const lng = result.geometry.location.lng();

                setLatitude(lat);
                setLongitude(lng);

                // Parse city name and state code from address_components
                let parsedCity = "";
                let parsedState = "";

                for (const component of result.address_components) {
                    if (component.types.includes("locality")) {
                        parsedCity = component.long_name;
                    }
                    // Fallback: some cities don't have "locality"
                    if (!parsedCity && component.types.includes("sublocality_level_1")) {
                        parsedCity = component.long_name;
                    }
                    if (component.types.includes("administrative_area_level_1")) {
                        parsedState = component.short_name; // e.g. "TX", "CA"
                    }
                }

                // Final fallback: use first part of the description as city name
                if (!parsedCity) {
                    parsedCity = suggestion.description.split(",")[0].trim();
                }

                setCity(parsedCity);
                setState(parsedState);
            }
        } catch (err) {
            console.error("Geocoding error:", err);
            setError("Could not find location coordinates. Please try a different search.");
        }
    };

    const handleSave = () => {
        setError(null);

        if (!city || !state || latitude === null || longitude === null) {
            setError("Please search and select a city from the suggestions.");
            return;
        }

        if (radiusMiles < 1 || radiusMiles > 100) {
            setError("Radius must be between 1 and 100 miles.");
            return;
        }

        onSave({
            city,
            state,
            latitude,
            longitude,
            radiusMiles: parseInt(radiusMiles, 10),
        });
        onClose();
    };

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    const hasSelectedLocation = latitude !== null && longitude !== null;
    const mapCenter = hasSelectedLocation
        ? { lat: latitude, lng: longitude }
        : DEFAULT_CENTER;
    const mapZoom = hasSelectedLocation ? SELECTED_ZOOM : DEFAULT_ZOOM;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={handleOverlayClick}
        >
            <div className="bg-card-light dark:bg-card-dark rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
                {/* ── Header ── */}
                <div className="flex items-center justify-between p-6 border-b border-border-light dark:border-border-dark">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <MdLocationOn className="text-primary text-xl" />
                        </div>
                        <h2 className="text-lg font-bold text-text-main dark:text-white">
                            {isEditing ? "Edit Work Area" : "Add Work Area"}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-lg text-text-muted hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
                    >
                        <MdClose className="text-xl" />
                    </button>
                </div>

                {/* ── Body ── */}
                <div className="p-6 space-y-5">
                    {/* Error alert */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                        </div>
                    )}

                    {/* ── Location Search (Google Places Autocomplete) ── */}
                    <div className="space-y-2 relative" ref={suggestionsRef}>
                        <label className="block text-sm font-bold text-text-main dark:text-white uppercase tracking-wide">
                            Search City <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchInput}
                                onChange={handleSearchChange}
                                placeholder="Type a city name (e.g. Austin, TX)"
                                className="w-full px-4 py-3 pl-10 rounded-xl bg-white dark:bg-background-dark border border-border-subtle dark:border-[#2a3038] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-text-main dark:text-white placeholder:text-text-muted/50 transition-all"
                                autoComplete="off"
                            />
                            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xl" />
                        </div>

                        {/* Suggestions dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute left-0 right-0 top-full z-10 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shadow-lg overflow-hidden mt-1">
                                {suggestions.map((suggestion) => (
                                    <button
                                        key={suggestion.place_id}
                                        type="button"
                                        onClick={() => handleSelectSuggestion(suggestion)}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted-light dark:hover:bg-muted-dark transition-colors border-b border-border-light dark:border-border-dark last:border-b-0"
                                    >
                                        <MdLocationOn className="text-primary text-lg shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-text-main dark:text-white truncate">
                                                {suggestion.structured_formatting?.main_text || suggestion.description}
                                            </p>
                                            <p className="text-xs text-text-muted truncate">
                                                {suggestion.structured_formatting?.secondary_text || ""}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Selected location confirmation badge ── */}
                    {hasSelectedLocation && (
                        <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
                            <MdLocationOn className="text-primary shrink-0" />
                            <div className="text-sm">
                                <span className="font-medium text-text-main dark:text-white">
                                    {city}, {state}
                                </span>
                                <span className="text-text-muted ml-2">
                                    ({latitude.toFixed(4)}, {longitude.toFixed(4)})
                                </span>
                            </div>
                        </div>
                    )}

                    {/* ── Map Preview ── */}
                    <div className="rounded-xl overflow-hidden border border-border-light dark:border-border-dark h-48">
                        <Map
                            defaultCenter={DEFAULT_CENTER}
                            defaultZoom={DEFAULT_ZOOM}
                            center={mapCenter}
                            zoom={mapZoom}
                            gestureHandling="cooperative"
                            disableDefaultUI={true}
                            zoomControl={true}
                            mapId="work-area-modal-map"
                        >
                            {hasSelectedLocation && (
                                <AdvancedMarker
                                    position={{ lat: latitude, lng: longitude }}
                                />
                            )}
                        </Map>
                    </div>

                    {/* ── Radius Slider ── */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-bold text-text-main dark:text-white uppercase tracking-wide">
                                Service Radius
                            </label>
                            <span className="text-sm font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                                {radiusMiles} mi
                            </span>
                        </div>
                        <input
                            type="range"
                            min={1}
                            max={100}
                            value={radiusMiles}
                            onChange={(e) => setRadiusMiles(parseInt(e.target.value, 10))}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-xs text-text-muted">
                            <span>1 mi</span>
                            <span>100 mi</span>
                        </div>
                    </div>

                    {/* ── Actions ── */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            {isEditing ? "Update" : "Add"} Work Area
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkAreaFormModal;
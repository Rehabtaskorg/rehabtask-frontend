"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { MdLocationOn, MdClose } from "react-icons/md";

/**
 * Lightweight Places Autocomplete for the public search header.
 * Returns { city, state, latitude, longitude } on selection.
 * Styled to match the existing search bar inputs (bg-gray-50, no label).
 */
export default function LocationAutocomplete({ value, onChange, onSelect, onClear, placeholder = "City or zip code" }) {
    const places = useMapsLibrary("places");
    const geocoding = useMapsLibrary("geocoding");

    const [predictions, setPredictions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const autocompleteService = useRef(null);
    const geocoder = useRef(null);
    const sessionToken = useRef(null);
    const debounceTimer = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!places) return;
        autocompleteService.current = new places.AutocompleteService();
        sessionToken.current = new places.AutocompleteSessionToken();
    }, [places]);

    useEffect(() => {
        if (!geocoding) return;
        geocoder.current = new geocoding.Geocoder();
    }, [geocoding]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchPredictions = useCallback((input) => {
        if (!autocompleteService.current || !input || input.length < 2) {
            setPredictions([]);
            setIsOpen(false);
            return;
        }

        autocompleteService.current.getPlacePredictions(
            {
                input,
                componentRestrictions: { country: "us" },
                types: ["(regions)"],
                sessionToken: sessionToken.current,
            },
            (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    setPredictions(results.slice(0, 5));
                    setIsOpen(true);
                    setActiveIndex(-1);
                } else {
                    setPredictions([]);
                    setIsOpen(false);
                }
            }
        );
    }, []);

    const handleInputChange = (e) => {
        const text = e.target.value;
        onChange(text);

        // If user clears the input, also clear the coordinates
        if (!text.trim()) {
            onClear();
            setPredictions([]);
            setIsOpen(false);
            return;
        }

        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            fetchPredictions(text);
        }, 300);
    };

    const handleSelect = useCallback((prediction) => {
        if (!geocoder.current || !places) return;

        onChange(prediction.description);
        setPredictions([]);
        setIsOpen(false);

        geocoder.current.geocode(
            { placeId: prediction.place_id },
            (results, status) => {
                if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
                    const result = results[0];
                    const loc = result.geometry.location;
                    const components = result.address_components;

                    const cityComp = components.find(
                        (c) => c.types.includes("locality") || c.types.includes("sublocality_level_1")
                    );
                    const stateComp = components.find((c) =>
                        c.types.includes("administrative_area_level_1")
                    );

                    onSelect({
                        city: cityComp?.long_name || "",
                        state: stateComp?.short_name || "",
                        latitude: loc.lat(),
                        longitude: loc.lng(),
                    });

                    sessionToken.current = new places.AutocompleteSessionToken();
                }
            }
        );
    }, [onChange, onSelect, places]);

    const handleClearClick = () => {
        onChange("");
        onClear();
        setPredictions([]);
        setIsOpen(false);
    };

    const handleKeyDown = (e) => {
        if (!isOpen || predictions.length === 0) {
            // Allow Enter to propagate to form submit when dropdown is closed
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev) => (prev < predictions.length - 1 ? prev + 1 : 0));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : predictions.length - 1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeIndex >= 0) {
                handleSelect(predictions[activeIndex]);
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    return (
        <div className="flex-1 relative" ref={containerRef}>
            <div className="flex items-center bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                <MdLocationOn className="text-gray-400 text-xl mr-3 shrink-0" />
                <input
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => { if (predictions.length > 0) setIsOpen(true); }}
                    placeholder={placeholder}
                    autoComplete="off"
                    className="bg-transparent border-none focus:ring-0 focus:outline-none text-gray-900 w-full placeholder:text-gray-400 text-sm"
                />
                {value && (
                    <button
                        type="button"
                        onClick={handleClearClick}
                        className="text-gray-400 hover:text-gray-600 transition-colors ml-1 shrink-0"
                    >
                        <MdClose className="text-lg" />
                    </button>
                )}
            </div>

            {isOpen && predictions.length > 0 && (
                <ul className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                    {predictions.map((prediction, index) => (
                        <li
                            key={prediction.place_id}
                            onClick={() => handleSelect(prediction)}
                            onMouseEnter={() => setActiveIndex(index)}
                            className={`flex items-center gap-2.5 px-4 py-3 cursor-pointer text-sm transition-colors ${
                                index === activeIndex
                                    ? "bg-primary/10 text-primary"
                                    : "text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            <MdLocationOn className={`shrink-0 ${index === activeIndex ? "text-primary" : "text-gray-400"}`} />
                            <span className="truncate">{prediction.description}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

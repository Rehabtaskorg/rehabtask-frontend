"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { MdLocationOn, MdErrorOutline } from "react-icons/md";

export default function AddressAutocomplete({
    value = "",
    onChange,
    onSelect,
    placeholder = "Enter a US address...",
    label,
    required = false,
    error,
    helperText,
    disabled = false,
}) {
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

    // Initialize services when the Places library loads
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

    const fetchPredictions = useCallback(
        (input) => {
            if (!autocompleteService.current || !input || input.length < 3) {
                setPredictions([]);
                setIsOpen(false);
                return;
            }

            autocompleteService.current.getPlacePredictions(
                {
                    input,
                    componentRestrictions: { country: "us" },
                    types: ["geocode"],
                    sessionToken: sessionToken.current,
                },
                (results, status) => {
                    if (
                        status === google.maps.places.PlacesServiceStatus.OK &&
                        results
                    ) {
                        setPredictions(results);
                        setIsOpen(true);
                        setActiveIndex(-1);
                    } else {
                        setPredictions([]);
                        setIsOpen(false);
                    }
                }
            );
        },
        []
    );

    const handleInputChange = (e) => {
        const text = e.target.value;
        onChange?.(text);

        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            fetchPredictions(text);
        }, 300);
    };

    const handleSelect = useCallback(
        (prediction) => {
            if (!geocoder.current || !places) return;

            onChange?.(prediction.description);
            setPredictions([]);
            setIsOpen(false);

            geocoder.current.geocode(
                { placeId: prediction.place_id },
                (results, status) => {
                    if (
                        status === google.maps.GeocoderStatus.OK &&
                        results?.[0]
                    ) {
                        const result = results[0];
                        const loc = result.geometry.location;
                        const components = result.address_components;

                        const cityComp = components.find(
                            (c) =>
                                c.types.includes("locality") ||
                                c.types.includes("sublocality_level_1")
                        );
                        const stateComp = components.find((c) =>
                            c.types.includes("administrative_area_level_1")
                        );
                        const zipComp = components.find((c) =>
                            c.types.includes("postal_code")
                        );
                        const streetNumber = components.find((c) =>
                            c.types.includes("street_number")
                        );
                        const route = components.find((c) =>
                            c.types.includes("route")
                        );
                        const streetAddress = [streetNumber?.long_name, route?.long_name]
                            .filter(Boolean)
                            .join(" ");

                        onSelect?.({
                            formattedAddress: result.formatted_address,
                            streetAddress: streetAddress || "",
                            city: cityComp?.long_name || "",
                            state: stateComp?.short_name || "",
                            zipCode: zipComp?.long_name || "",
                            latitude: loc.lat(),
                            longitude: loc.lng(),
                        });

                        // Reset session token after a selection for billing optimization
                        sessionToken.current =
                            new places.AutocompleteSessionToken();
                    }
                }
            );
        },
        [onChange, onSelect, places]
    );

    const handleKeyDown = (e) => {
        if (!isOpen || predictions.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev) =>
                prev < predictions.length - 1 ? prev + 1 : 0
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev) =>
                prev > 0 ? prev - 1 : predictions.length - 1
            );
        } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            handleSelect(predictions[activeIndex]);
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    return (
        <div className="space-y-2" ref={containerRef}>
            {label && (
                <label className="block text-sm font-bold text-text-main dark:text-white uppercase tracking-wide">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <MdLocationOn className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none z-10" />
                <input
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (predictions.length > 0) setIsOpen(true);
                    }}
                    placeholder={placeholder}
                    disabled={disabled}
                    autoComplete="off"
                    className={`
                        w-full pl-10 pr-4 py-3 rounded-xl
                        bg-white dark:bg-background-dark
                        border transition-all outline-none
                        ${
                            error
                                ? "border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                : "border-border-subtle dark:border-[#2a3038] focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        }
                        text-text-main dark:text-white
                        placeholder:text-text-muted/50
                        disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                />

                {/* Predictions dropdown */}
                {isOpen && predictions.length > 0 && (
                    <ul className="absolute left-0 right-0 top-full mt-1 z-50 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                        {predictions.map((prediction, index) => (
                            <li
                                key={prediction.place_id}
                                onClick={() => handleSelect(prediction)}
                                onMouseEnter={() => setActiveIndex(index)}
                                className={`flex items-center gap-2.5 px-4 py-3 cursor-pointer text-sm transition-colors ${
                                    index === activeIndex
                                        ? "bg-primary/10 text-primary"
                                        : "text-text-main dark:text-white hover:bg-muted-light dark:hover:bg-muted-dark"
                                }`}
                            >
                                <MdLocationOn
                                    className={`shrink-0 ${
                                        index === activeIndex
                                            ? "text-primary"
                                            : "text-text-muted"
                                    }`}
                                />
                                <span className="truncate">
                                    {prediction.description}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {error && (
                <p className="text-xs text-red-500 flex items-center gap-1 font-medium">
                    <MdErrorOutline size={14} />
                    {error}
                </p>
            )}

            {helperText && !error && (
                <p className="text-xs text-text-muted dark:text-text-muted/80">
                    {helperText}
                </p>
            )}
        </div>
    );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { MdLocationOn, MdClose } from "react-icons/md";

/**
 * Unified Places Autocomplete input.
 *
 * Accepts addresses, cities, or ZIP codes — Google Places decides based on input.
 * Returns a uniform shape on selection so callers don't care which the user typed.
 *
 * Props:
 * - value / onChange: controlled input value
 * - onSelect({ city, state, zipCode, latitude, longitude, formattedAddress })
 * - onClear: called when the user clears the input
 * - placeholder: input placeholder text
 * - restrictToPostalCode: when true, only ZIP code predictions are shown (for therapist work areas)
 * - restrictToAddress: when true, only street-level address predictions are shown (for address line 1)
 * - variant: "compact" (public search header) | "form" (dashboard forms with label)
 * - label / required / error / helperText / disabled: form-variant props
 */
export default function LocationAutocomplete({
    value,
    onChange,
    onSelect,
    onClear,
    placeholder = "Enter address, city, or ZIP",
    restrictToPostalCode = false,
    restrictToAddress = false,
    variant = "compact",
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
    const [broadLocationError, setBroadLocationError] = useState(false);

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

        const types = restrictToPostalCode
            ? ["postal_code"]
            : restrictToAddress
                ? ["address"]
                : ["geocode"];

        autocompleteService.current.getPlacePredictions(
            {
                input,
                componentRestrictions: { country: "us" },
                types,
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
    }, [restrictToPostalCode, restrictToAddress]);

    const handleInputChange = (e) => {
        const text = e.target.value;
        onChange?.(text);
        setBroadLocationError(false);

        if (!text.trim()) {
            onClear?.();
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

        onChange?.(prediction.description);
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
                    const zipComp = components.find((c) =>
                        c.types.includes("postal_code")
                    );

                    // Reject state, country, or county-level selections — their center
                    // coordinates are too far from most cities to work with a 50-mile radius.
                    if (!cityComp && !zipComp) {
                        setBroadLocationError(true);
                        onChange?.("");
                        onClear?.();
                        sessionToken.current = new places.AutocompleteSessionToken();
                        return;
                    }

                    setBroadLocationError(false);
                    onSelect?.({
                        city: cityComp?.long_name || "",
                        state: stateComp?.short_name || "",
                        zipCode: zipComp?.long_name || "",
                        latitude: loc.lat(),
                        longitude: loc.lng(),
                        formattedAddress: result.formatted_address,
                    });

                    sessionToken.current = new places.AutocompleteSessionToken();
                }
            }
        );
    }, [onChange, onSelect, onClear, places]);

    const handleClearClick = () => {
        onChange?.("");
        onClear?.();
        setPredictions([]);
        setIsOpen(false);
        setBroadLocationError(false);
    };

    const handleKeyDown = (e) => {
        if (!isOpen || predictions.length === 0) return;

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

    if (variant === "form") {
        return (
            <div className="space-y-2" ref={containerRef}>
                {label && (
                    <label className="block text-sm font-bold text-text-main  uppercase tracking-wide">
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                <div className="relative">
                    <MdLocationOn className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none z-10" />
                    <input
                        type="text"
                        value={value || ""}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => { if (predictions.length > 0) setIsOpen(true); }}
                        placeholder={placeholder}
                        disabled={disabled}
                        autoComplete="off"
                        className={`
                            w-full pl-10 pr-10 py-3 rounded-xl
                            bg-white 
                            border transition-all outline-none
                            ${
                                error
                                    ? "border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                    : "border-border-subtle  focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            }
                            text-text-main 
                            placeholder:text-text-muted/50
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                    />
                    {value && !disabled && (
                        <button
                            type="button"
                            onClick={handleClearClick}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <MdClose className="text-lg" />
                        </button>
                    )}

                    {isOpen && predictions.length > 0 && (
                        <ul className="absolute left-0 right-0 top-full mt-1 z-50 bg-card-light  border border-border-light  rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                            {predictions.map((prediction, index) => (
                                <li
                                    key={prediction.place_id}
                                    onClick={() => handleSelect(prediction)}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    className={`flex items-center gap-2.5 px-4 py-3 cursor-pointer text-sm transition-colors ${
                                        index === activeIndex
                                            ? "bg-primary/10 text-primary"
                                            : "text-text-main  hover:bg-muted-light "
                                    }`}
                                >
                                    <MdLocationOn className={`shrink-0 ${index === activeIndex ? "text-primary" : "text-text-muted"}`} />
                                    <span className="truncate">{prediction.description}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {(error || broadLocationError) && (
                    <p className="text-xs text-red-500 font-medium">
                        {broadLocationError ? "Please select a city or ZIP code, not a state or country." : error}
                    </p>
                )}
                {helperText && !error && !broadLocationError && (
                    <p className="text-xs text-text-muted ">{helperText}</p>
                )}
            </div>
        );
    }

    // compact variant (public search headers) & stacked variant (hero search)
    const isStacked = variant === "stacked";
    const shellClass = isStacked
        ? "flex items-center bg-white px-4 py-4 rounded-xl border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all"
        : `flex items-center bg-gray-50 px-4 py-3 rounded-lg border ${broadLocationError ? "border-red-400" : "border-gray-100"}`;
    const iconClass = isStacked ? "text-gray-400 text-xl mr-3 shrink-0" : "text-gray-400 text-xl mr-3 shrink-0";

    return (
        <div className="flex-1 relative" ref={containerRef}>
            {broadLocationError && (
                <p className="absolute -top-6 left-0 text-xs text-red-500 font-medium whitespace-nowrap">
                    Please select a city or ZIP code, not a state or country.
                </p>
            )}
            <div className={shellClass}>
                <MdLocationOn className={iconClass} />
                <input
                    type="text"
                    value={value || ""}
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

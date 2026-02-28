"use client";

import { useState, useEffect } from "react";
import { MdLocationOn, MdCheck } from "react-icons/md";
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import useRequestStore from "@/store/requestStore";
import { geocodeZipCode } from "@/lib/geocoding";

const DEFAULT_CENTER = { lat: 39.8283, lng: -98.5795 };
const DEFAULT_ZOOM = 4;
const SELECTED_ZOOM = 13;

export default function Step2Location() {
    const { step2, setStep2 } = useRequestStore();

    const [zipCode, setZipCode] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [geocoding, setGeocoding] = useState(false);
    const [error, setError] = useState(null);

    // Restore resolved location display if store already has data (e.g., user navigated back)
    useEffect(() => {
        if (step2.address && step2.latitude !== null) {
            // Parse "City, ST" from stored address
            const parts = step2.address.split(", ");
            if (parts.length === 2) {
                setCity(parts[0]);
                setState(parts[1]);
            }
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleZipChange = async (e) => {
        const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 5);
        setZipCode(value);
        setError(null);

        // Clear previous location when user changes ZIP
        if (value.length < 5) {
            setCity("");
            setState("");
            setStep2({ address: "", latitude: null, longitude: null });
            return;
        }

        // Auto-geocode when 5 digits entered
        if (value.length === 5) {
            setGeocoding(true);
            try {
                const result = await geocodeZipCode(value);
                if (result) {
                    setCity(result.city);
                    setState(result.state);
                    setStep2({
                        address: `${result.city}, ${result.state}`,
                        latitude: result.latitude,
                        longitude: result.longitude,
                    });
                } else {
                    setError("Could not find this ZIP code. Please check and try again.");
                    setCity("");
                    setState("");
                    setStep2({ address: "", latitude: null, longitude: null });
                }
            } catch {
                setError("Geocoding failed. Please try again.");
            } finally {
                setGeocoding(false);
            }
        }
    };

    const hasLocation = step2.latitude !== null && step2.longitude !== null;
    const mapCenter = hasLocation
        ? { lat: step2.latitude, lng: step2.longitude }
        : DEFAULT_CENTER;

    return (
        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-text-main dark:text-white">
                Step 2: Location
            </h3>

            {/* ZIP Code Input */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Service ZIP Code <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <MdLocationOn className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                    <input
                        type="text"
                        value={zipCode}
                        onChange={handleZipChange}
                        placeholder="e.g. 90210"
                        maxLength={5}
                        inputMode="numeric"
                        className="w-full bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark rounded-lg text-sm text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none pl-10 pr-4 py-2.5"
                    />
                </div>

                {/* Helper / Error text */}
                {error && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>
                )}
                {geocoding && (
                    <p className="text-xs text-text-muted dark:text-gray-500 mt-1">
                        Looking up ZIP code...
                    </p>
                )}
                {!error && !geocoding && !hasLocation && zipCode.length > 0 && zipCode.length < 5 && (
                    <p className="text-xs text-text-muted dark:text-gray-500 mt-1">
                        Enter a 5-digit US ZIP code
                    </p>
                )}
            </div>

            {/* Resolved location badge */}
            {hasLocation && city && state && (
                <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
                    <MdLocationOn className="text-primary shrink-0" />
                    <div className="text-sm">
                        <span className="font-medium text-text-main dark:text-white">
                            {city}, {state}
                        </span>
                        <span className="text-text-muted ml-2">
                            ({step2.latitude.toFixed(4)}, {step2.longitude.toFixed(4)})
                        </span>
                    </div>
                    <MdCheck className="text-emerald-500 ml-auto shrink-0" />
                </div>
            )}

            {/* Map Preview */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Map Preview
                    </label>
                </div>
                <div className="aspect-video w-full rounded-xl overflow-hidden border border-border-light dark:border-border-dark">
                    <Map
                        defaultCenter={DEFAULT_CENTER}
                        defaultZoom={DEFAULT_ZOOM}
                        center={hasLocation ? mapCenter : undefined}
                        zoom={hasLocation ? SELECTED_ZOOM : undefined}
                        mapId="request-location-map"
                        disableDefaultUI
                        className="w-full h-full"
                    >
                        {hasLocation && <AdvancedMarker position={mapCenter} />}
                    </Map>
                </div>
                {!hasLocation && (
                    <p className="text-xs text-text-muted dark:text-gray-500 mt-1.5 text-center">
                        Enter a ZIP code above to see the location on the map
                    </p>
                )}
            </div>
        </div>
    );
}
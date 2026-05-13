/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { MdClose, MdLocationOn } from "react-icons/md";
import Button from "@/components/ui/Button";
import LocationAutocomplete from "@/components/public/LocationAutocomplete";
import { RADIUS_PRESETS, DEFAULT_RADIUS_PRESET } from "@/lib/constants";

const DEFAULT_CENTER = { lat: 39.8283, lng: -98.5795 };
const DEFAULT_ZOOM = 4;
const SELECTED_ZOOM = 10;

const WorkAreaFormModal = ({ isOpen, onClose, workArea, onSave }) => {
    const isEditing = !!workArea;

    const [locationInput, setLocationInput] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [radiusMiles, setRadiusMiles] = useState(DEFAULT_RADIUS_PRESET.miles);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            if (workArea) {
                const z = workArea.zipCode || "";
                const c = workArea.city || "";
                const s = workArea.state || "";
                setZipCode(z);
                setCity(c);
                setState(s);
                setLatitude(parseFloat(workArea.latitude) || null);
                setLongitude(parseFloat(workArea.longitude) || null);
                // Snap to nearest preset when editing an existing work area
                const nearest = RADIUS_PRESETS.reduce((prev, curr) =>
                    Math.abs(curr.miles - (workArea.radiusMiles || DEFAULT_RADIUS_PRESET.miles)) <
                    Math.abs(prev.miles - (workArea.radiusMiles || DEFAULT_RADIUS_PRESET.miles))
                        ? curr : prev
                );
                setRadiusMiles(nearest.miles);
                setLocationInput(z && c && s ? `${z}, ${c}, ${s}` : z);
            } else {
                setLocationInput("");
                setZipCode("");
                setCity("");
                setState("");
                setLatitude(null);
                setLongitude(null);
                setRadiusMiles(DEFAULT_RADIUS_PRESET.miles);
            }
            setError(null);
        }
    }, [isOpen, workArea]);

    const handleLocationSelect = (place) => {
        setError(null);

        if (!place.zipCode) {
            setError("Please select a result that includes a ZIP code.");
            return;
        }

        setZipCode(place.zipCode);
        setCity(place.city);
        setState(place.state);
        setLatitude(place.latitude);
        setLongitude(place.longitude);
    };

    const handleLocationClear = () => {
        setZipCode("");
        setCity("");
        setState("");
        setLatitude(null);
        setLongitude(null);
        setError(null);
    };

    const handleSave = () => {
        setError(null);

        if (!zipCode || !/^\d{5}$/.test(zipCode)) {
            setError("Please select a valid 5-digit US ZIP code.");
            return;
        }

        if (!city || !state || latitude === null || longitude === null) {
            setError("Please select a ZIP code from the dropdown to set your work area.");
            return;
        }

        onSave({
            zipCode,
            city,
            state,
            latitude,
            longitude,
            radiusMiles,
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
                {/* Header */}
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

                {/* Body */}
                <div className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                        </div>
                    )}

                    <LocationAutocomplete
                        variant="form"
                        label="ZIP Code"
                        required
                        placeholder="e.g. 77001"
                        value={locationInput}
                        onChange={setLocationInput}
                        onSelect={handleLocationSelect}
                        onClear={handleLocationClear}
                        restrictToPostalCode
                        helperText={
                            hasSelectedLocation
                                ? null
                                : "Search by a 5-digit US ZIP code"
                        }
                    />

                    {hasSelectedLocation && city && state && (
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

                    {/* Coverage preset buttons */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-text-main dark:text-white uppercase tracking-wide">
                            Coverage
                        </label>
                        <div className="flex gap-2">
                            {RADIUS_PRESETS.map((preset) => (
                                <button
                                    key={preset.miles}
                                    type="button"
                                    onClick={() => setRadiusMiles(preset.miles)}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                                        radiusMiles === preset.miles
                                            ? "bg-primary text-white border-primary"
                                            : "bg-white dark:bg-background-dark text-text-main dark:text-white border-border-light dark:border-border-dark hover:border-primary"
                                    }`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-text-muted">
                            {RADIUS_PRESETS.find((p) => p.miles === radiusMiles)?.label === "My city" &&
                                "Covers patients within a short drive — ideal for dense urban areas."}
                            {RADIUS_PRESETS.find((p) => p.miles === radiusMiles)?.label === "My area" &&
                                "Covers your city and surrounding neighbourhoods — the most common choice."}
                            {RADIUS_PRESETS.find((p) => p.miles === radiusMiles)?.label === "My region" &&
                                "Covers a wide metro area — best if you're willing to travel further."}
                        </p>
                    </div>

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
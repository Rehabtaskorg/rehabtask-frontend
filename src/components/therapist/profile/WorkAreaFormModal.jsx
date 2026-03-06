"use client";

import { useState, useEffect } from "react";
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { MdClose, MdLocationOn } from "react-icons/md";
import Button from "@/components/ui/Button";
import AddressAutocomplete from "@/components/maps/AddressAutocomplete";

const DEFAULT_CENTER = { lat: 39.8283, lng: -98.5795 };
const DEFAULT_ZOOM = 4;
const SELECTED_ZOOM = 10;

const WorkAreaFormModal = ({ isOpen, onClose, workArea, onSave }) => {
    const isEditing = !!workArea;

    const [addressText, setAddressText] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [radiusMiles, setRadiusMiles] = useState(25);
    const [error, setError] = useState(null);

    // Reset/populate state when modal opens
    useEffect(() => {
        if (isOpen) {
            if (workArea) {
                setAddressText(
                    workArea.city && workArea.state
                        ? `${workArea.city}, ${workArea.state}`
                        : ""
                );
                setCity(workArea.city || "");
                setState(workArea.state || "");
                setLatitude(parseFloat(workArea.latitude) || null);
                setLongitude(parseFloat(workArea.longitude) || null);
                setRadiusMiles(workArea.radiusMiles || 25);
            } else {
                setAddressText("");
                setCity("");
                setState("");
                setLatitude(null);
                setLongitude(null);
                setRadiusMiles(25);
            }
            setError(null);
        }
    }, [isOpen, workArea]);

    const handleAddressSelect = (result) => {
        setAddressText(result.formattedAddress);
        setCity(result.city);
        setState(result.state);
        setLatitude(result.latitude);
        setLongitude(result.longitude);
        setError(null);
    };

    const handleAddressChange = (text) => {
        setAddressText(text);
        // Clear resolved location when user types new text
        if (latitude !== null) {
            setCity("");
            setState("");
            setLatitude(null);
            setLongitude(null);
        }
    };

    const handleSave = () => {
        setError(null);

        if (!city || !state || latitude === null || longitude === null) {
            setError("Please select a valid US address from the suggestions.");
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
                    {/* Error alert */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                        </div>
                    )}

                    {/* Address Input */}
                    <AddressAutocomplete
                        label="ADDRESS"
                        placeholder="e.g. 456 Oak Ave, Houston, TX"
                        value={addressText}
                        onChange={handleAddressChange}
                        onSelect={handleAddressSelect}
                        helperText={
                            isEditing && !hasSelectedLocation && addressText
                                ? `Current: ${addressText} — type a new address to change`
                                : undefined
                        }
                        required
                    />

                    {/* Resolved location badge */}
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

                    {/* Map Preview */}
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

                    {/* Radius Slider */}
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

                    {/* Actions */}
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

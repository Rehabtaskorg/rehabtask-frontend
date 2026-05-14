/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { MdClose, MdLocationOn } from "react-icons/md";
import Button from "@/components/ui/Button";
import LocationAutocomplete from "@/components/public/LocationAutocomplete";
import { DEFAULT_WORK_AREA_RADIUS_MILES } from "@/lib/constants";

const DEFAULT_CENTER = { lat: 39.8283, lng: -98.5795 };
const DEFAULT_ZOOM = 4;
const SELECTED_ZOOM = 10;

/**
 * Modal for adding or editing a therapist work area.
 * Therapist types a city or address — radius is set silently in the background.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Object|null} props.workArea - Existing work area when editing, null when adding
 * @param {Function} props.onSave
 */
const WorkAreaFormModal = ({ isOpen, onClose, workArea, onSave }) => {
    const isEditing = !!workArea;

    const [locationInput, setLocationInput] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
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
                setLocationInput(c && s ? `${c}, ${s}` : z);
            } else {
                setLocationInput("");
                setZipCode("");
                setCity("");
                setState("");
                setLatitude(null);
                setLongitude(null);
            }
            setError(null);
        }
    }, [isOpen, workArea]);

    const handleLocationSelect = (place) => {
        setError(null);
        setZipCode(place.zipCode || "");
        setCity(place.city || "");
        setState(place.state || "");
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

        if (latitude === null || longitude === null) {
            setError("Please select a location from the dropdown.");
            return;
        }

        if (!city || !state) {
            setError("Please select a city or address from the dropdown.");
            return;
        }

        onSave({
            zipCode,
            city,
            state,
            latitude,
            longitude,
            radiusMiles: DEFAULT_WORK_AREA_RADIUS_MILES,
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
                        label="City or Address"
                        required
                        placeholder="e.g. Miami, FL or Houston, TX"
                        value={locationInput}
                        onChange={setLocationInput}
                        onSelect={handleLocationSelect}
                        onClear={handleLocationClear}
                        helperText={hasSelectedLocation ? null : "Search by city, neighbourhood, or address"}
                    />

                    {hasSelectedLocation && city && state && (
                        <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
                            <MdLocationOn className="text-primary shrink-0" />
                            <span className="text-sm font-medium text-text-main dark:text-white">
                                {city}, {state}
                            </span>
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
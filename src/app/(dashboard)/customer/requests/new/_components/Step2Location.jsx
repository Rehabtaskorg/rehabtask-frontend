"use client";

import { useState } from "react";
import { MdLocationOn, MdCheck } from "react-icons/md";
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import useRequestStore from "@/store/requestStore";
import LocationAutocomplete from "@/components/maps/LocationAutocomplete";

const DEFAULT_CENTER = { lat: 39.8283, lng: -98.5795 };
const DEFAULT_ZOOM = 4;
const SELECTED_ZOOM = 13;

export default function Step2Location() {
    const { step2, setStep2 } = useRequestStore();

    const [addressText, setAddressText] = useState(step2.address || "");

    const handleSelect = (result) => {
        setAddressText(result.formattedAddress);
        setStep2({
            address: result.formattedAddress,
            latitude: result.latitude,
            longitude: result.longitude,
        });
    };

    const handleChange = (text) => {
        setAddressText(text);
        if (step2.latitude !== null) {
            setStep2({ address: "", latitude: null, longitude: null });
        }
    };

    const handleClear = () => {
        setAddressText("");
        setStep2({ address: "", latitude: null, longitude: null });
    };

    const hasLocation = step2.latitude !== null && step2.longitude !== null;
    const mapCenter = hasLocation
        ? { lat: step2.latitude, lng: step2.longitude }
        : DEFAULT_CENTER;

    return (
        <div className="bg-card-light  border border-border-light  rounded-xl shadow-sm p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-text-main ">
                Step 2: Location
            </h3>

            <LocationAutocomplete
                variant="form"
                label="Service Address"
                required
                placeholder="e.g. Miami, FL or 123 Main St, Houston, TX"
                value={addressText}
                onChange={handleChange}
                onSelect={handleSelect}
                onClear={handleClear}
                helperText={hasLocation ? null : "Enter a city or full address where you need therapy"}
            />

            {hasLocation && step2.address && (
                <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
                    <MdLocationOn className="text-primary shrink-0" />
                    <div className="text-sm">
                        <span className="font-medium text-text-main ">
                            {step2.address}
                        </span>
                        <span className="text-text-muted ml-2">
                            ({step2.latitude.toFixed(4)}, {step2.longitude.toFixed(4)})
                        </span>
                    </div>
                    <MdCheck className="text-emerald-500 ml-auto shrink-0" />
                </div>
            )}

            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-500  uppercase tracking-wider">
                        Map Preview
                    </label>
                </div>
                <div className="aspect-video w-full rounded-xl overflow-hidden border border-border-light ">
                    <Map
                        defaultCenter={DEFAULT_CENTER}
                        defaultZoom={DEFAULT_ZOOM}
                        center={hasLocation ? mapCenter : undefined}
                        zoom={hasLocation ? SELECTED_ZOOM : undefined}
                        mapId="request-location-map"
                        disableDefaultUI
                        gestureHandling="cooperative"
                        zoomControl
                        className="w-full h-full"
                    >
                        {hasLocation && <AdvancedMarker position={mapCenter} />}
                    </Map>
                </div>
                {!hasLocation && (
                    <p className="text-xs text-text-muted  mt-1.5 text-center">
                        Enter an address above to see the location on the map
                    </p>
                )}
            </div>
        </div>
    );
}
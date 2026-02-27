"use client";

import { MdLocationOn } from "react-icons/md";
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";

export default function ServiceAreasCard({ workAreas }) {
    if (!workAreas || workAreas.length === 0) {
        return (
            <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <MdLocationOn className="text-primary text-lg" />
                    <h3 className="text-base font-bold text-text-main dark:text-white">
                        Service Areas
                    </h3>
                </div>
                <p className="text-sm text-text-muted dark:text-gray-400">
                    No service areas listed.
                </p>
            </div>
        );
    }

    // Parse coordinates
    const parsedAreas = workAreas.map((wa) => ({
        ...wa,
        lat: parseFloat(wa.latitude),
        lng: parseFloat(wa.longitude),
        radius: wa.radiusMiles || 10,
    }));

    const center = {
        lat: parsedAreas[0].lat,
        lng: parsedAreas[0].lng,
    };

    return (
        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <MdLocationOn className="text-primary text-lg" />
                <h3 className="text-base font-bold text-text-main dark:text-white">
                    Service Areas
                </h3>
            </div>

            {/* Work area pills */}
            <div className="flex flex-wrap gap-2 mb-4">
                {parsedAreas.map((wa, i) => (
                    <span
                        key={wa.id || i}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-text-main dark:text-white text-sm font-medium rounded-lg"
                    >
                        {wa.city}, {wa.state} — within {wa.radius} mi
                    </span>
                ))}
            </div>

            {/* Map */}
            <div className="aspect-video w-full rounded-lg overflow-hidden border border-border-light dark:border-border-dark">
                <Map
                    defaultCenter={center}
                    defaultZoom={10}
                    mapId="service-areas-map"
                    gestureHandling="cooperative"
                    disableDefaultUI={false}
                    style={{ width: "100%", height: "100%" }}
                >
                    {parsedAreas.map((wa, i) => (
                        <AdvancedMarker
                            key={wa.id || i}
                            position={{ lat: wa.lat, lng: wa.lng }}
                            title={`${wa.city}, ${wa.state}`}
                        />
                    ))}
                </Map>
            </div>
        </div>
    )

}
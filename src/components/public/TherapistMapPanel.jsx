"use client";

import { useEffect, useMemo } from "react";
import { Map, AdvancedMarker, InfoWindow, useMap } from "@vis.gl/react-google-maps";
import { MdStar, MdLocationOn } from "react-icons/md";
import UserAvatar from "@/components/ui/UserAvatar";
import TherapistPriceMarker from "./TherapistPriceMarker";

const DEFAULT_CENTER = { lat: 34.0522, lng: -118.2437 };
const DEFAULT_ZOOM = 11;
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "rehabtask_map";

function buildCenter(pins, fallback) {
    if (pins.length === 0) return fallback || DEFAULT_CENTER;
    const avgLat = pins.reduce((s, p) => s + p.latitude, 0) / pins.length;
    const avgLng = pins.reduce((s, p) => s + p.longitude, 0) / pins.length;
    return { lat: avgLat, lng: avgLng };
}

function MapBoundsFitter({ pins }) {
    const map = useMap();

    useEffect(() => {
        if (!map || !pins?.length) return;
        if (pins.length === 1) {
            map.setCenter({ lat: pins[0].latitude, lng: pins[0].longitude });
            map.setZoom(13);
            return;
        }
        const bounds = new window.google.maps.LatLngBounds();
        pins.forEach((p) => bounds.extend({ lat: p.latitude, lng: p.longitude }));
        map.fitBounds(bounds, 80);
    }, [map, pins]);

    return null;
}

export default function TherapistMapPanel({
    pins,
    highlightedTherapistId,
    openPinId,
    onPinClick,
    onCloseInfoWindow,
    onAuthGate,
    searchCenter,
}) {
    const initialCenter = useMemo(
        () => searchCenter || buildCenter(pins, DEFAULT_CENTER),
        [searchCenter, pins],
    );

    const activePin = pins.find((p) => p.id === openPinId);

    if (pins.length === 0) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-muted-light">
                <div className="text-center p-6">
                    <MdLocationOn className="text-4xl text-text-muted/40 mx-auto mb-2" />
                    <p className="text-sm text-text-muted">No therapists to display on map.</p>
                    <p className="text-xs text-text-muted/70 mt-1">Try adjusting your search.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full overflow-hidden">
            <Map
                mapId={MAP_ID}
                defaultCenter={initialCenter}
                defaultZoom={DEFAULT_ZOOM}
                gestureHandling="greedy"
                disableDefaultUI={false}
                mapTypeControl={false}
                streetViewControl={false}
                fullscreenControl={false}
                onClick={() => onCloseInfoWindow?.()}
                className="w-full h-full"
            >
                <MapBoundsFitter pins={pins} />

                {pins.map((pin) => (
                    <AdvancedMarker
                        key={pin.id}
                        position={{ lat: pin.latitude, lng: pin.longitude }}
                        onClick={() => onPinClick?.(pin)}
                    >
                        <TherapistPriceMarker
                            rate={pin.rate}
                            isActive={highlightedTherapistId === pin.therapistId}
                            onClick={() => onPinClick?.(pin)}
                        />
                    </AdvancedMarker>
                ))}

                {activePin && (
                    <InfoWindow
                        position={{ lat: activePin.latitude, lng: activePin.longitude }}
                        pixelOffset={[0, -12]}
                        onCloseClick={() => onCloseInfoWindow?.()}
                        headerDisabled
                    >
                        <div className="w-60 p-1">
                            <div className="flex gap-3 mb-3">
                                <UserAvatar
                                    name={activePin.fullName || "Therapist"}
                                    photoUrl={activePin.photoUrl}
                                    size="md"
                                />
                                <div className="min-w-0">
                                    <p className="font-bold text-sm text-text-main truncate">
                                        {activePin.fullName}
                                    </p>
                                    {activePin.reviewCount > 0 && (
                                        <div className="flex items-center text-amber-500 text-[11px] font-bold mt-0.5">
                                            <MdStar className="text-sm mr-0.5" />
                                            {activePin.rating} ({activePin.reviewCount})
                                        </div>
                                    )}
                                </div>
                            </div>
                            {activePin.location && (
                                <p className="text-xs text-text-muted mb-2 line-clamp-1">
                                    {activePin.location}
                                </p>
                            )}
                            <p className="text-sm font-bold text-primary mb-3">
                                {activePin.rate ? `$${activePin.rate}/visit` : "Rate on request"}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <a
                                    href={`/therapists/${activePin.therapistId}`}
                                    className="py-1.5 text-center text-xs font-bold rounded-lg border border-border-light text-text-main hover:bg-muted-light transition-colors"
                                >
                                    View Profile
                                </a>
                                <button
                                    type="button"
                                    onClick={() => onAuthGate?.("message")}
                                    className="py-1.5 text-xs font-bold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                                >
                                    Message
                                </button>
                            </div>
                        </div>
                    </InfoWindow>
                )}
            </Map>
        </div>
    );
}

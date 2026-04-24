"use client";

import { useEffect, useMemo, useState } from "react";
import { Map, AdvancedMarker, InfoWindow, useMap } from "@vis.gl/react-google-maps";
import { MdStar, MdLocationOn } from "react-icons/md";
import UserAvatar from "@/components/ui/UserAvatar";
import TherapistPriceMarker from "./TherapistPriceMarker";

const DEFAULT_CENTER = { lat: 34.0522, lng: -118.2437 };
const DEFAULT_ZOOM = 11;
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "rehabtask_map";

function buildCenter(therapists, fallback) {
    const withCoords = therapists.filter((t) => t.latitude && t.longitude);
    if (withCoords.length === 0) return fallback || DEFAULT_CENTER;
    const avgLat = withCoords.reduce((s, t) => s + Number(t.latitude), 0) / withCoords.length;
    const avgLng = withCoords.reduce((s, t) => s + Number(t.longitude), 0) / withCoords.length;
    return { lat: avgLat, lng: avgLng };
}

function MapBoundsFitter({ therapists }) {
    const map = useMap();

    useEffect(() => {
        if (!map || !therapists?.length) return;
        const withCoords = therapists.filter((t) => t.latitude && t.longitude);
        if (withCoords.length === 0) return;
        if (withCoords.length === 1) {
            map.setCenter({ lat: Number(withCoords[0].latitude), lng: Number(withCoords[0].longitude) });
            map.setZoom(13);
            return;
        }
        const bounds = new window.google.maps.LatLngBounds();
        withCoords.forEach((t) => {
            bounds.extend({ lat: Number(t.latitude), lng: Number(t.longitude) });
        });
        map.fitBounds(bounds, 80);
    }, [map, therapists]);

    return null;
}

export default function TherapistMapPanel({
    therapists,
    selectedTherapistId,
    onSelectTherapist,
    onAuthGate,
    searchCenter,
}) {
    const [dismissedId, setDismissedId] = useState(null);

    const therapistsWithCoords = useMemo(
        () => therapists.filter((t) => t.latitude && t.longitude),
        [therapists],
    );

    const initialCenter = useMemo(
        () => searchCenter || buildCenter(therapistsWithCoords, DEFAULT_CENTER),
        [searchCenter, therapistsWithCoords],
    );

    const infoWindowId = selectedTherapistId && selectedTherapistId !== dismissedId ? selectedTherapistId : null;
    const activeTherapist = therapistsWithCoords.find((t) => t.id === infoWindowId);

    if (therapistsWithCoords.length === 0) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-muted-light dark:bg-muted-dark rounded-xl border border-border-light dark:border-border-dark">
                <div className="text-center p-6">
                    <MdLocationOn className="text-4xl text-text-muted/40 mx-auto mb-2" />
                    <p className="text-sm text-text-muted">No therapists to display on map.</p>
                    <p className="text-xs text-text-muted/70 mt-1">Try adjusting your search.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full rounded-xl overflow-hidden border border-border-light dark:border-border-dark">
            <Map
                mapId={MAP_ID}
                defaultCenter={initialCenter}
                defaultZoom={DEFAULT_ZOOM}
                gestureHandling="greedy"
                disableDefaultUI={false}
                mapTypeControl={false}
                streetViewControl={false}
                fullscreenControl={false}
                className="w-full h-full"
            >
                <MapBoundsFitter therapists={therapistsWithCoords} />

                {therapistsWithCoords.map((t) => (
                    <AdvancedMarker
                        key={t.id}
                        position={{ lat: Number(t.latitude), lng: Number(t.longitude) }}
                        onClick={() => {
                            onSelectTherapist?.(t.id);
                            setDismissedId(null);
                        }}
                    >
                        <TherapistPriceMarker
                            rate={t.rate}
                            isActive={selectedTherapistId === t.id}
                            onClick={() => {
                                onSelectTherapist?.(t.id);
                                setInfoWindowId(t.id);
                            }}
                        />
                    </AdvancedMarker>
                ))}

                {activeTherapist && (
                    <InfoWindow
                        position={{
                            lat: Number(activeTherapist.latitude),
                            lng: Number(activeTherapist.longitude),
                        }}
                        pixelOffset={[0, -12]}
                        onCloseClick={() => setDismissedId(selectedTherapistId)}
                        headerDisabled
                    >
                        <div className="w-60 p-1">
                            <div className="flex gap-3 mb-3">
                                <UserAvatar
                                    name={activeTherapist.fullName || "Therapist"}
                                    photoUrl={activeTherapist.photoUrl}
                                    size="md"
                                />
                                <div className="min-w-0">
                                    <p className="font-bold text-sm text-text-main truncate">
                                        {activeTherapist.fullName}
                                    </p>
                                    {activeTherapist.reviewCount > 0 && (
                                        <div className="flex items-center text-amber-500 text-[11px] font-bold mt-0.5">
                                            <MdStar className="text-sm mr-0.5" />
                                            {activeTherapist.rating} ({activeTherapist.reviewCount})
                                        </div>
                                    )}
                                </div>
                            </div>
                            {activeTherapist.location && (
                                <p className="text-xs text-text-muted mb-2 line-clamp-1">
                                    {activeTherapist.location}
                                </p>
                            )}
                            <p className="text-sm font-bold text-primary mb-3">
                                {activeTherapist.rate ? `$${activeTherapist.rate}/visit` : "Rate on request"}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <a
                                    href={`/therapists/${activeTherapist.id}`}
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

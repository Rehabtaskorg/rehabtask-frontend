"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Map, AdvancedMarker, InfoWindow, useMap } from "@vis.gl/react-google-maps";
import { MdStar, MdLocationOn, MdChatBubble } from "react-icons/md";
import UserAvatar from "@/components/ui/UserAvatar";
import TherapistPriceMarker from "@/components/public/TherapistPriceMarker";
import { useMessageGuard } from "@/hooks/useMessageGuard";
import { MessageGateModal } from "@/components/ui/MessageGateModal";

const DEFAULT_CENTER = { lat: 34.0522, lng: -118.2437 };
const DEFAULT_ZOOM = 11;
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "rehabtask_map";

function buildCenter(markers, fallback) {
    if (markers.length === 0) return fallback || DEFAULT_CENTER;
    const avgLat = markers.reduce((s, m) => s + m.latitude, 0) / markers.length;
    const avgLng = markers.reduce((s, m) => s + m.longitude, 0) / markers.length;
    return { lat: avgLat, lng: avgLng };
}

function MapBoundsFitter({ markers }) {
    const map = useMap();

    useEffect(() => {
        if (!map || !markers?.length) return;
        if (markers.length === 1) {
            map.setCenter({ lat: markers[0].latitude, lng: markers[0].longitude });
            map.setZoom(13);
            return;
        }
        const bounds = new window.google.maps.LatLngBounds();
        markers.forEach((m) => bounds.extend({ lat: m.latitude, lng: m.longitude }));
        map.fitBounds(bounds, 80);
    }, [map, markers]);

    return null;
}

function AggregateInfoWindow({ marker, onMessage }) {
    const router = useRouter();

    return (
        <div className="w-72 max-h-80 overflow-y-auto">
            {marker.location && (
                <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted px-1 pb-2 border-b border-border-light">
                    {marker.location} · {marker.therapists.length} therapist{marker.therapists.length !== 1 ? "s" : ""}
                </p>
            )}
            <ul className="divide-y divide-border-light">
                {marker.therapists.map((t) => (
                    <li key={t.id} className="py-2.5 px-1">
                        <div className="flex items-start gap-2.5">
                            <UserAvatar name={t.fullName || "Therapist"} photoUrl={t.photoUrl} size="sm" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-text-main truncate">{t.fullName}</p>
                                {t.reviewCount > 0 && (
                                    <div className="flex items-center text-amber-500 text-[10px] font-bold mt-0.5">
                                        <MdStar className="text-xs mr-0.5" />
                                        {t.rating} ({t.reviewCount})
                                    </div>
                                )}
                            </div>
                            <p className="text-sm font-extrabold text-primary whitespace-nowrap shrink-0">
                                {t.rate ? `$${t.rate}` : "—"}
                            </p>
                        </div>
                        <div className="flex items-center justify-end gap-2 mt-2">
                            <button
                                type="button"
                                onClick={() => router.push(`/customer/find-therapists/${t.id}`)}
                                className="text-[11px] font-semibold text-text-muted hover:text-primary transition-colors"
                            >
                                View Profile
                            </button>
                            <button
                                type="button"
                                onClick={() => onMessage(t.userId)}
                                className="px-2.5 py-1 rounded-lg bg-primary text-white font-semibold text-[11px] flex items-center gap-1 hover:bg-primary/90 transition-colors"
                            >
                                <MdChatBubble className="text-[10px]" />
                                Message
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function FindTherapistsMapPanel({
    markers,
    highlightedTherapistId,
    openMarkerId,
    onMarkerClick,
    onCloseInfoWindow,
    searchCenter,
}) {
    const { guardedHandleMessage, isGateOpen, closeGate, gateProps } = useMessageGuard();

    const initialCenter = useMemo(
        () => searchCenter || buildCenter(markers, DEFAULT_CENTER),
        [searchCenter, markers],
    );

    const activeMarker = markers.find((m) => m.id === openMarkerId);

    if (markers.length === 0) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-muted-light ">
                <div className="text-center p-6">
                    <MdLocationOn className="text-4xl text-text-muted/40 mx-auto mb-2" />
                    <p className="text-sm text-text-muted ">No therapists to display on map.</p>
                    <p className="text-xs text-text-muted/70 mt-1">Try adjusting your search.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full overflow-hidden">
            <MessageGateModal isOpen={isGateOpen} onClose={closeGate} {...gateProps} />
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
                <MapBoundsFitter markers={markers} />

                {markers.map((marker) => {
                    const isActive =
                        openMarkerId === marker.id ||
                        marker.therapists.some((t) => t.id === highlightedTherapistId);
                    return (
                        <AdvancedMarker
                            key={marker.id}
                            position={{ lat: marker.latitude, lng: marker.longitude }}
                            onClick={() => onMarkerClick?.(marker)}
                        >
                            <TherapistPriceMarker
                                label={marker.label}
                                isActive={isActive}
                                onClick={() => onMarkerClick?.(marker)}
                            />
                        </AdvancedMarker>
                    );
                })}

                {activeMarker && (
                    <InfoWindow
                        position={{ lat: activeMarker.latitude, lng: activeMarker.longitude }}
                        pixelOffset={[0, -12]}
                        onCloseClick={() => onCloseInfoWindow?.()}
                        headerDisabled
                    >
                        <AggregateInfoWindow marker={activeMarker} onMessage={guardedHandleMessage} />
                    </InfoWindow>
                )}
            </Map>
        </div>
    );
}

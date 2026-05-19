"use client";

import { MdEdit, MdVisibility, MdLocationOn, MdCalendarToday } from "react-icons/md";
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import useRequestStore from "@/store/requestStore";

const formatReviewDate = (dateStr, timeStr) => {
    if (!dateStr) return "—";
    const d = new Date(timeStr ? `${dateStr}T${timeStr}` : `${dateStr}T09:00`);
    const datePart = d.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
    const timePart = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    return `${datePart} at ${timePart}`;
};

export default function Step3Review({ onEditStep }) {
    const { step1, step2 } = useRequestStore();

    const hasLocation = step2.latitude !== null && step2.longitude !== null;
    const mapCenter = hasLocation
        ? { lat: step2.latitude, lng: step2.longitude }
        : { lat: 40.7128, lng: -74.006 };

    return (
        <div className="space-y-6">
            {/* Service Details Section */}
            <div className="bg-card-light  border border-border-light  rounded-xl shadow-sm p-6 sm:p-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-text-main ">
                        Service Details
                    </h3>
                    <button
                        onClick={() => onEditStep(1)}
                        className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline"
                    >
                        <MdEdit className="text-base" /> Edit
                    </button>
                </div>

                <div className="bg-muted-light  p-6 rounded-lg space-y-4">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted  mb-1">
                            Therapy Type
                        </p>
                        <p className="text-sm font-medium text-text-main ">
                            {step1.serviceType || "—"}
                        </p>
                    </div>

                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted  mb-1">
                            Description
                        </p>
                        <p className="text-sm text-text-main  leading-relaxed">
                            {step1.description || "—"}
                        </p>
                    </div>

                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted  mb-1">
                            Preferred Date & Time
                        </p>
                        <p className="text-sm font-medium text-text-main  flex items-center gap-1.5">
                            <MdCalendarToday className="text-text-muted " />
                            {formatReviewDate(step1.preferredDate, step1.preferredTime)}
                        </p>
                    </div>

                    {step1.visitsPerWeek && step1.numberOfWeeks && (
                        <div className="pt-2 border-t border-border-light ">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted  mb-1">
                                Treatment Frequency
                            </p>
                            <p className="text-sm font-semibold text-primary">
                                {step1.visitsPerWeek}x/week · {step1.numberOfWeeks} week{parseInt(step1.numberOfWeeks) > 1 ? "s" : ""} ({parseInt(step1.visitsPerWeek) * parseInt(step1.numberOfWeeks)} visits total)
                                {step1.rate && parseFloat(step1.rate) > 0 && (
                                    <span className="text-text-muted  font-normal ml-2">
                                        · ${(parseFloat(step1.rate) * parseInt(step1.visitsPerWeek) * parseInt(step1.numberOfWeeks)).toFixed(2)} estimated total
                                    </span>
                                )}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border-light ">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted  mb-1">
                                Rate per Visit
                            </p>
                            <p className="text-sm font-medium text-text-main ">
                                {step1.rate ? `$${parseFloat(step1.rate).toFixed(2)}` : "—"}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted  mb-1">
                                Visit Type
                            </p>
                            <p className="text-sm font-medium text-text-main ">
                                {step1.visitTypeName || step1.visitType || "—"}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted  mb-1">
                                EMR System
                            </p>
                            <p className="text-sm font-medium text-text-main ">
                                {step1.emr === "Other" ? step1.emrOther : step1.emr || "—"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Location Section */}
            <div className="bg-card-light  border border-border-light  rounded-xl shadow-sm p-6 sm:p-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-text-main ">Location</h3>
                    <button
                        onClick={() => onEditStep(2)}
                        className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline"
                    >
                        <MdEdit className="text-base" /> Edit
                    </button>
                </div>

                <div className="bg-muted-light  p-6 rounded-lg space-y-4">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted  mb-1">
                            Address
                        </p>
                        <p className="text-sm font-medium text-text-main  flex items-center gap-1.5">
                            <MdLocationOn className="text-text-muted " />
                            {step2.address || "—"}
                        </p>
                    </div>

                    {/* Mini map */}
                    {hasLocation && (
                        <div className="h-16 w-full rounded-lg overflow-hidden border border-border-light ">
                            <Map
                                defaultCenter={mapCenter}
                                center={mapCenter}
                                defaultZoom={15}
                                zoom={15}
                                mapId="request-review-map"
                                disableDefaultUI
                                className="w-full h-full"
                            >
                                <AdvancedMarker position={mapCenter} />
                            </Map>
                        </div>
                    )}
                </div>
            </div>

            {/* Visibility note */}
            <p className="text-xs text-text-muted  flex items-center justify-center gap-1 mt-2">
                <MdVisibility className="text-sm" /> Your request will be visible to therapists
                in your area.
            </p>
        </div>
    )
}
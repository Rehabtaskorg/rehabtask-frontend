"use client";

import { MdCalendarToday } from "react-icons/md";

const DAYS_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const DAY_LABELS = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
};

/**
 * Convert "09:00" → "9:00 AM", "17:00" → "5:00 PM"
 */
const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
};

const formatTimeBlock = (block) => {
    if (!block?.startTime || !block?.endTime) return "";
    return `${formatTime(block.startTime)} – ${formatTime(block.endTime)}`;
};

export default function AvailabilityCard({ availability }) {
    // Build a lookup from day → availability entry
    const dayMap = {};
    if (availability) {
        availability.forEach((entry) => {
            dayMap[entry.dayOfWeek] = entry;
        });
    }

    return (
        <div className="bg-card-light  border border-border-light  rounded-xl p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <MdCalendarToday className="text-primary text-lg" />
                <h3 className="text-base font-bold text-text-main ">
                    Availability
                </h3>
            </div>

            {/* Day list */}
            <div className="space-y-0">
                {DAYS_ORDER.map((day, index) => {
                    const entry = dayMap[day];
                    const isEnabled = entry?.isEnabled && entry?.timeBlocks?.length > 0;
                    const isLast = index === DAYS_ORDER.length - 1;

                    return (
                        <div
                            key={day}
                            className={`flex items-start justify-between py-3 gap-4 ${!isLast ? "border-b border-border-light " : ""}`}
                        >
                            <span className="text-sm font-medium text-text-muted  shrink-0 pt-0.5">
                                {DAY_LABELS[day]}
                            </span>
                            {isEnabled ? (
                                <div className="flex flex-col items-end gap-0.5">
                                    {entry.timeBlocks
                                        .map(formatTimeBlock)
                                        .filter(Boolean)
                                        .map((slot, i) => (
                                            <span key={i} className="text-sm font-semibold text-text-main  whitespace-nowrap">
                                                {slot}
                                            </span>
                                        ))}
                                </div>
                            ) : (
                                <span className="text-sm font-semibold text-text-muted ">
                                    Unavailable
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    )
}
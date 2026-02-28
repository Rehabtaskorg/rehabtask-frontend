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
        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <MdCalendarToday className="text-primary text-lg" />
                <h3 className="text-base font-bold text-text-main dark:text-white">
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
                            className={`flex items-center justify-between py-3 ${!isLast ? "border-b border-border-light dark:border-border-dark" : ""
                                }`}
                        >
                            <span className="text-sm font-medium text-text-muted dark:text-gray-400">
                                {DAY_LABELS[day]}
                            </span>
                            {isEnabled ? (
                                <span className="text-sm font-semibold text-text-main dark:text-white">
                                    {entry.timeBlocks
                                        .map(formatTimeBlock)
                                        .filter(Boolean)
                                        .join(", ") || "Available"}
                                </span>
                            ) : (
                                <span className="text-sm font-semibold text-text-muted dark:text-gray-500">
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
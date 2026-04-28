"use client";

import { useState, useCallback } from "react";
import { MdSchedule, MdContentCopy } from "react-icons/md";
import DayScheduleRow from "./DayScheduleRow";
import { useUpdateAvailability } from "@/hooks/useTherapistProfile";
import { DEFAULT_TIME_BLOCK } from "@/lib/onboardingValidation";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_LABELS = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
};

const initSchedule = (availability) => {
    const base = {
        monday: { enabled: false, timeBlocks: [] },
        tuesday: { enabled: false, timeBlocks: [] },
        wednesday: { enabled: false, timeBlocks: [] },
        thursday: { enabled: false, timeBlocks: [] },
        friday: { enabled: false, timeBlocks: [] },
        saturday: { enabled: false, timeBlocks: [] },
        sunday: { enabled: false, timeBlocks: [] },
    };
    availability?.forEach((a) => {
        base[a.dayOfWeek] = {
            enabled: a.isEnabled,
            timeBlocks: a.timeBlocks?.length ? a.timeBlocks : [],
        };
    });
    return base;
};

const AvailabilityTab = ({ profile }) => {
    const [schedule, setSchedule] = useState(() => initSchedule(profile.availability));
    const [alert, setAlert] = useState(null);

    const updateAvailability = useUpdateAvailability();

    const toggleDay = useCallback((day) => {
        setSchedule((prev) => {
            const current = prev[day];
            return {
                ...prev,
                [day]: {
                    enabled: !current.enabled,
                    timeBlocks:
                        !current.enabled && current.timeBlocks.length === 0
                            ? [{ ...DEFAULT_TIME_BLOCK }]
                            : current.timeBlocks,
                },
            };
        });
    }, []);

    const addTimeBlock = useCallback((day) => {
        setSchedule((prev) => ({
            ...prev,
            [day]: {
                ...prev[day],
                timeBlocks: [...prev[day].timeBlocks, { ...DEFAULT_TIME_BLOCK }],
            },
        }));
    }, []);

    const removeTimeBlock = useCallback((day, index) => {
        setSchedule((prev) => ({
            ...prev,
            [day]: {
                ...prev[day],
                timeBlocks: prev[day].timeBlocks.filter((_, i) => i !== index),
            },
        }));
    }, []);

    const updateTimeBlock = useCallback((day, index, updatedBlock) => {
        setSchedule((prev) => ({
            ...prev,
            [day]: {
                ...prev[day],
                timeBlocks: prev[day].timeBlocks.map((block, i) =>
                    i === index ? updatedBlock : block
                ),
            },
        }));
    }, []);

    const applyToWeekdays = useCallback(() => {
        setSchedule((prev) => {
            const ref = Object.values(prev).find(
                (d) => d.enabled && d.timeBlocks.length
            ) || { timeBlocks: [{ ...DEFAULT_TIME_BLOCK }] };

            const updated = { ...prev };
            ["monday", "tuesday", "wednesday", "thursday", "friday"].forEach((day) => {
                updated[day] = {
                    enabled: true,
                    timeBlocks: ref.timeBlocks.map((b) => ({ ...b })),
                };
            });
            return updated;
        });
    }, []);

    const applyToAllDays = useCallback(() => {
        setSchedule((prev) => {
            const ref = Object.values(prev).find(
                (d) => d.enabled && d.timeBlocks.length
            ) || { timeBlocks: [{ ...DEFAULT_TIME_BLOCK }] };

            const updated = {};
            DAYS.forEach((day) => {
                updated[day] = {
                    enabled: true,
                    timeBlocks: ref.timeBlocks.map((b) => ({ ...b })),
                };
            });
            return updated;
        });
    }, []);

    const handleSave = async () => {
        setAlert(null);

        // Validate at least one day enabled
        const hasEnabledDay = Object.values(schedule).some((d) => d.enabled);
        if (!hasEnabledDay) {
            setAlert({ type: "error", message: "Please enable at least one day of availability." });
            return;
        }

        // Validate enabled days have time blocks and end > start
        for (const [day, data] of Object.entries(schedule)) {
            if (data.enabled) {
                if (data.timeBlocks.length === 0) {
                    setAlert({ type: "error", message: `${DAY_LABELS[day]} is enabled but has no time blocks.` });
                    return;
                }
                for (const block of data.timeBlocks) {
                    if (block.endTime <= block.startTime) {
                        setAlert({ type: "error", message: `${DAY_LABELS[day]}: End time must be after start time.` });
                        return;
                    }
                }
            }
        }

        try {
            await updateAvailability.mutateAsync(schedule);
            setAlert({ type: "success", message: "Availability updated successfully!" });
        } catch (err) {
            setAlert({
                type: "error",
                message: err.response?.data?.message || "Failed to update availability. Please try again.",
            });
        }
    };

    return (
        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <MdSchedule className="text-primary text-xl" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-text-main dark:text-white">
                        Weekly Availability
                    </h2>
                    <p className="text-sm text-text-muted">
                        Set the days and times you&apos;re available for sessions
                    </p>
                </div>
            </div>

            {alert && (
                <div className="mb-6">
                    <Alert
                        type={alert.type}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                </div>
            )}

            {/* Quick apply buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
                <button
                    type="button"
                    onClick={applyToWeekdays}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                    <MdContentCopy className="text-base" />
                    Apply to weekdays
                </button>
                <button
                    type="button"
                    onClick={applyToAllDays}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                    <MdContentCopy className="text-base" />
                    Apply to all days
                </button>
            </div>

            {/* Day rows */}
            <div className="space-y-3 mb-6">
                {DAYS.map((day) => (
                    <DayScheduleRow
                        key={day}
                        day={day}
                        dayLabel={DAY_LABELS[day]}
                        enabled={schedule[day].enabled}
                        timeBlocks={schedule[day].timeBlocks}
                        onToggle={toggleDay}
                        onAddBlock={addTimeBlock}
                        onRemoveBlock={removeTimeBlock}
                        onUpdateBlock={updateTimeBlock}
                    />
                ))}
            </div>

            {/* Save button */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    loading={updateAvailability.isPending}
                >
                    Save Availability
                </Button>
            </div>
        </div>
    )

}

export default AvailabilityTab;
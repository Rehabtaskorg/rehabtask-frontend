"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { LuCalendar, LuPlus, LuX, LuMapPin } from "react-icons/lu";
import { MdEdit, MdDelete, MdLocationOn } from "react-icons/md";

import useOnboardingStore from "@/store/onboardingStore";
import { availabilitySchema } from "@/lib/onboardingValidation";
import { onboardingAPI } from "@/lib/onboarding.api";
import OnboardingProgressBar from "@/components/therapist/OnboardingProgressBar";
import WorkAreaFormModal from "@/components/therapist/profile/WorkAreaFormModal";

import { APIProvider } from "@vis.gl/react-google-maps";
import DatePicker from "react-datepicker";
import { parse, format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import { usePageTitle } from "@/hooks/usePageTitle";

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

export default function AvailabilityPage() {
    usePageTitle("Set Availability");
    const router = useRouter();
    const {
        availability,
        toggleDayAvailability,
        addTimeBlock,
        removeTimeBlock,
        updateTimeBlock,
        applyScheduleToWeekdays,
        applyScheduleToAllDays,
        updateAvailability,
        addWorkArea,
        updateWorkArea,
        removeWorkArea,
        markStepComplete,
        setCurrentStep,
    } = useOnboardingStore();

    const [validationError, setValidationError] = useState("");
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);

    const defaultValues = useMemo(() => availability, [availability]);

    const { handleSubmit, control, setValue, watch, formState: { errors, isSubmitting }, clearErrors } = useForm({
        resolver: zodResolver(availabilitySchema),
        defaultValues,
    });

    // Keep RHF form in sync with store changes
    useEffect(() => {
        Object.keys(availability).forEach((key) => {
            setValue(key, availability[key]);
        });
    }, [availability, setValue]);


    const formData = watch();

    const onSubmit = async (data) => {
        setValidationError("");
        setLoading(true);

        try {
            await onboardingAPI.saveAvailability({
                schedule: data.schedule,
                acceptingNewPatients: data.acceptingNewPatients,
                workAreas: data.workAreas,
            });

            updateAvailability(data);

            markStepComplete(3);
            setCurrentStep(4);

            router.push("/therapist/onboarding/background-check");
        } catch (error) {
            console.error("Failed to save availability:", error);
            setValidationError(error.message || "Failed to save availability. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleModalSave = (area) => {
        if (editingIndex !== null) {
            updateWorkArea(editingIndex, area);
            setValue("workAreas", availability.workAreas.map((wa, i) => i === editingIndex ? area : wa));
        } else {
            addWorkArea(area);
            setValue("workAreas", [...availability.workAreas, area]);
        }
        clearErrors("workAreas");
        setEditingIndex(null);
    };

    const handleRemoveWorkArea = (index) => {
        removeWorkArea(index);
        setValue("workAreas", availability.workAreas.filter((_, i) => i !== index));
    };

    const parseTimeString = (timeStr) => {
        if (!timeStr) return null;
        return parse(timeStr, "HH:mm", new Date());
    };

    const handleToggleDay = (day) => {
        toggleDayAvailability(day);
        setValidationError("");
        clearErrors("schedule");
    }

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
            <div className="min-h-screen bg-background-light dark:bg-background-dark py-10 px-4">
                <div className="max-w-6xl mx-auto">
                    <OnboardingProgressBar />

                    <header className="mb-8 px-4">
                        <div className="flex flex-wrap justify-between items-end gap-6 mb-4">
                            <div className="flex min-w-75 flex-col gap-2">
                                <h1 className="text-text-main dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                                    Set Your Availability & Reach
                                </h1>
                                <p className="text-text-muted dark:text-gray-400 text-lg font-normal leading-normal max-w-2xl">
                                    Define when you&apos;re available and how far you&apos;re willing to
                                    travel to treat patients.
                                </p>
                            </div>
                            <div className="flex items-center gap-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-4 rounded-xl shadow-sm">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-text-main dark:text-white">
                                        Accepting New Patients
                                    </span>
                                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                        Profile will be live instantly
                                    </span>
                                </div>
                                <Controller
                                    name="acceptingNewPatients"
                                    control={control}
                                    render={({ field }) => (
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={field.value}
                                                onChange={(e) => {
                                                    const newValue = e.target.checked;
                                                    field.onChange(newValue);
                                                    updateAvailability({ acceptingNewPatients: newValue });
                                                }}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    )}
                                />
                            </div>
                        </div>
                    </header>

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
                        {/* Grid wrapper for side-by-side layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Weekly Schedule - Takes 2 columns */}
                            <div className="lg:col-span-2">
                                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6 md:p-8 flex flex-col gap-6 shadow-sm">
                                    <div className="flex justify-between items-center border-b border-border-light dark:border-border-dark pb-6">
                                        <h3 className="text-xl font-bold text-text-main dark:text-white flex items-center gap-2">
                                            <LuCalendar size={20} className="text-primary" />
                                            Weekly Schedule
                                        </h3>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        {/* Show validation error for schedule */}
                                        {(errors.schedule || validationError) && (
                                            <p className="text-red-500 text-sm">
                                                {errors.schedule?.message ||
                                                    validationError ||
                                                    "Please enable at least one day of availability"}
                                            </p>
                                        )}

                                        {DAYS.map((day) => {
                                            const dayData = formData.schedule[day];
                                            const isEnabled = dayData?.enabled || false;

                                            return (
                                                <div
                                                    key={day}
                                                    className={`flex flex-col gap-4 p-4 rounded-xl border transition-all ${isEnabled
                                                        ? "bg-primary/5 border-primary/20"
                                                        : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span
                                                            className={`font-semibold text-base ${isEnabled
                                                                ? "text-primary"
                                                                : "text-text-muted dark:text-gray-400"
                                                                }`}
                                                        >
                                                            {DAY_LABELS[day]}
                                                        </span>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={isEnabled}
                                                                onChange={() => handleToggleDay(day)}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                                        </label>
                                                    </div>

                                                    {isEnabled && (
                                                        <div className="flex flex-col gap-3">
                                                            {dayData.timeBlocks.map((block, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="flex items-center gap-3"
                                                                >
                                                                    {/* Start Time */}
                                                                    <Controller
                                                                        name={`schedule.${day}.timeBlocks.${index}.startTime`}
                                                                        control={control}
                                                                        render={({ field }) => (
                                                                            <DatePicker
                                                                                selected={parseTimeString(
                                                                                    field.value
                                                                                )}
                                                                                onChange={(date) => {
                                                                                    const timeString = format(
                                                                                        date,
                                                                                        "HH:mm"
                                                                                    );
                                                                                    field.onChange(timeString);
                                                                                    updateTimeBlock(day, index, {
                                                                                        ...dayData.timeBlocks[index],
                                                                                        startTime: timeString,
                                                                                    });
                                                                                }}
                                                                                showTimeSelect
                                                                                showTimeSelectOnly
                                                                                timeIntervals={15}
                                                                                timeCaption="Time"
                                                                                dateFormat="hh:mm aa"
                                                                                className="flex-1 bg-input-light dark:bg-input-dark border border-border-light dark:border-border-dark rounded-lg px-3 py-2 text-text-main dark:text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                                                            />
                                                                        )}
                                                                    />

                                                                    <span className="text-text-muted dark:text-gray-500 text-sm">
                                                                        to
                                                                    </span>

                                                                    {/* End Time */}
                                                                    <Controller
                                                                        name={`schedule.${day}.timeBlocks.${index}.endTime`}
                                                                        control={control}
                                                                        render={({ field }) => (
                                                                            <DatePicker
                                                                                selected={parseTimeString(
                                                                                    field.value
                                                                                )}
                                                                                onChange={(date) => {
                                                                                    const timeString = format(
                                                                                        date,
                                                                                        "HH:mm"
                                                                                    );
                                                                                    field.onChange(timeString);
                                                                                    updateTimeBlock(day, index, {
                                                                                        ...dayData.timeBlocks[index],
                                                                                        endTime: timeString,
                                                                                    });
                                                                                }}
                                                                                showTimeSelect
                                                                                showTimeSelectOnly
                                                                                timeIntervals={15}
                                                                                timeCaption="Time"
                                                                                dateFormat="hh:mm aa"
                                                                                className="flex-1 bg-input-light dark:bg-input-dark border border-border-light dark:border-border-dark rounded-lg px-3 py-2 text-text-main dark:text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                                                            />
                                                                        )}
                                                                    />

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeTimeBlock(day, index)}
                                                                        className="text-text-muted dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
                                                                    >
                                                                        <LuX size={20} />
                                                                    </button>
                                                                </div>
                                                            ))}

                                                            <button
                                                                type="button"
                                                                onClick={() => addTimeBlock(day)}
                                                                className="flex items-center gap-2 text-sm text-primary font-semibold hover:text-blue-600 dark:hover:text-blue-400 mt-1 self-start py-1 px-2 rounded hover:bg-primary/10 transition-colors"
                                                            >
                                                                <LuPlus size={16} />
                                                                Add time block
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Preset buttons */}
                                    <div className="flex gap-3 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                applyScheduleToWeekdays();
                                                setValidationError("");
                                                clearErrors("schedule");
                                            }}
                                            className="text-sm font-semibold text-primary hover:text-text-main dark:hover:text-white border border-primary/20 hover:border-primary hover:bg-primary/10 rounded-lg px-4 py-2 transition-all"
                                        >
                                            Apply to weekdays
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                applyScheduleToAllDays();
                                                setValidationError("");
                                                clearErrors("schedule");
                                            }}
                                            className="text-sm font-semibold text-primary hover:text-text-main dark:hover:text-white border border-primary/20 hover:border-primary hover:bg-primary/10 rounded-lg px-4 py-2 transition-all"
                                        >
                                            Apply to all days
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Work Areas - Takes 1 column */}
                            <div className="flex flex-col gap-6">
                                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6 flex flex-col gap-6 shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-bold text-text-main dark:text-white flex items-center gap-2">
                                            <LuMapPin size={20} className="text-primary" />
                                            Work Areas
                                        </h3>
                                        <span className="text-xs text-text-muted font-medium">
                                            {formData.workAreas?.length || 0} added
                                        </span>
                                    </div>

                                    {errors.workAreas && (
                                        <p className="text-red-500 text-sm">
                                            {errors.workAreas.message || errors.workAreas.root?.message}
                                        </p>
                                    )}

                                    {/* Work areas list */}
                                    <div className="flex flex-col gap-3">
                                        {(formData.workAreas || []).map((area, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 rounded-lg border border-border-light dark:border-border-dark bg-muted-light dark:bg-muted-dark"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <MdLocationOn className="text-primary shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-text-main dark:text-white truncate">
                                                            {area.city}, {area.state}
                                                        </p>
                                                        <p className="text-xs text-text-muted">
                                                            ZIP {area.zipCode} &middot; {area.radiusMiles} mi radius
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingIndex(index);
                                                            setModalOpen(true);
                                                        }}
                                                        className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                                                    >
                                                        <MdEdit size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveWorkArea(index)}
                                                        className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    >
                                                        <MdDelete size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {(!formData.workAreas || formData.workAreas.length === 0) && (
                                            <p className="text-sm text-text-muted text-center py-4">
                                                No work areas added yet. Add at least one to continue.
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingIndex(null);
                                            setModalOpen(true);
                                        }}
                                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border-2 border-dashed border-primary/30 text-primary text-sm font-semibold hover:bg-primary/5 hover:border-primary/50 transition-all"
                                    >
                                        <LuPlus size={16} />
                                        Add Work Area
                                    </button>
                                </div>

                                {/* Preview Card */}
                                <div className="bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 p-6 rounded-xl">
                                    <h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                                        <LuMapPin size={14} />
                                        Marketplace Preview
                                    </h3>
                                    <p className="text-xs text-primary/80 dark:text-primary/70 leading-relaxed">
                                        Patients will see your availability and work areas when searching for therapists in their area.
                                    </p>
                                </div>
                            </div>

                        </div>

                        {/* Navigation */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-border-light dark:border-border-dark">
                            <button
                                type="button"
                                onClick={() => router.push("/therapist/onboarding/credentials")}
                                className="w-full sm:w-auto flex items-center gap-2 px-8 h-12 text-text-muted dark:text-gray-400 font-bold hover:text-text-main dark:hover:text-white transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                    />
                                </svg>
                                Back to Credentials
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto px-10 h-12 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:brightness-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Saving..." : "Next: Background Check"}
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                                    />
                                </svg>
                            </button>
                        </div>
                    </form>

                    <WorkAreaFormModal
                        isOpen={modalOpen}
                        onClose={() => { setModalOpen(false); setEditingIndex(null); }}
                        workArea={editingIndex !== null ? formData.workAreas?.[editingIndex] : null}
                        onSave={handleModalSave}
                    />
                </div>
            </div>
        </APIProvider>
    );
}
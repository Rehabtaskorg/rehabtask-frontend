"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { LuCalendar, LuPlus, LuX, LuMapPin } from "react-icons/lu";

import useOnboardingStore from "@/store/onboardingStore";
import { availabilitySchema } from "@/lib/onboardingValidation";
import { onboardingAPI } from "@/lib/onboarding.api";
import OnboardingProgressBar from "@/components/therapist/OnboardingProgressBar";

import DatePicker from "react-datepicker";
import { parse, format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";

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
        markStepComplete,
        setCurrentStep,
    } = useOnboardingStore();

    const [validationError, setValidationError] = useState("");
    const [loading, setLoading] = useState(false);

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
            // Call backend API to save availability
            await onboardingAPI.saveAvailability({
                schedule: data.schedule,
                acceptingNewPatients: data.acceptingNewPatients,
                baseZipCode: data.baseZipCode,
                serviceRadiusMiles: data.serviceRadiusMiles
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

                        {/* Service Area - Takes 1 column */}
                        <div className="flex flex-col gap-6">
                            <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6 flex flex-col gap-6 shadow-sm">
                                <h3 className="text-xl font-bold text-text-main dark:text-white flex items-center gap-2">
                                    <LuMapPin size={20} className="text-primary" />
                                    Service Reach
                                </h3>

                                <div className="flex flex-col gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-text-main dark:text-gray-300">
                                            Base ZIP Code
                                        </label>
                                        <div className="relative">
                                            <Controller
                                                name="baseZipCode"
                                                control={control}
                                                render={({ field }) => (
                                                    <input
                                                        type="text"
                                                        {...field}
                                                        className="w-full h-12 rounded-lg border border-border-light dark:border-border-dark bg-input-light dark:bg-input-dark text-text-main dark:text-white px-4 pl-10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                                        placeholder="e.g. 94103"
                                                        maxLength={10}
                                                    />
                                                )}
                                            />
                                            <svg
                                                className="w-5 h-5 text-gray-400 absolute left-3 top-3.5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                                />
                                            </svg>
                                        </div>
                                        {errors.baseZipCode && (
                                            <p className="text-red-500 text-sm">
                                                {errors.baseZipCode.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-bold text-text-main dark:text-gray-300">
                                                Service Radius
                                            </label>
                                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">
                                                {formData.serviceRadiusMiles} miles
                                            </span>
                                        </div>
                                        <Controller
                                            name="serviceRadiusMiles"
                                            control={control}
                                            render={({ field }) => (
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    step="5"
                                                    {...field}
                                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                                />
                                            )}
                                        />
                                        <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                            <span>0 mi</span>
                                            <span>50 mi</span>
                                            <span>100 mi</span>
                                        </div>
                                        {errors.serviceRadiusMiles && (
                                            <p className="text-red-500 text-sm">
                                                {errors.serviceRadiusMiles.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Preview Card */}
                            <div className="bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 p-6 rounded-xl">
                                <h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                    </svg>
                                    Marketplace Preview
                                </h3>
                                <p className="text-xs text-primary/80 dark:text-primary/70 leading-relaxed">
                                    Patients will see your availability and{" "}
                                    <b>{formData.serviceRadiusMiles}-mile</b> service radius.
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
            </div>
        </div>
    );
}
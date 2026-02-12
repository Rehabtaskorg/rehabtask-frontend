"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { LuCalendar, LuPlus, LuX, LuMapPin } from "react-icons/lu";

import useOnboardingStore from "@/store/onboardingStore";
import { availabilitySchema } from "@/lib/onboardingValidation";
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

    // eslint-disable-next-line react-hooks/incompatible-library
    const formData = watch();

    const onSubmit = async (data) => {
        setValidationError("");

        try {
            const parsed = availabilitySchema.safeParse(data);

            if (!parsed.success) {
                const scheduleError = parsed.error?.issues?.find((issue) =>
                    issue.path.includes("schedule")
                );

                if (scheduleError) {
                    setValidationError(scheduleError.message);
                }

                return;
            }

            updateAvailability(data);
            markStepComplete(3);
            setCurrentStep(4);
            router.push("/therapist/onboarding/background-check");
        } catch (err) {
            console.error(err);
            setValidationError("Please ensure all fields are valid.");
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
        <div className="min-h-screen bg-[#0d1109] py-10 px-4">
            <div className="max-w-6xl mx-auto">
                <OnboardingProgressBar />

                <header className="mb-8">
                    <div className="flex flex-wrap justify-between items-end gap-6 mb-4">
                        <div className="flex min-w-75 flex-col gap-2">
                            <h1 className="text-3xl font-bold text-white">Set Your Availability & Reach</h1>
                            <p className="text-gray-400">
                                Define when you&apos;re available and how far you&apos;re willing to travel to treat patients.
                            </p>
                        </div>
                        <div className="flex items-center gap-4 bg-[#1e271c] border border-[#2c3928] p-4 rounded-xl shadow-sm">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-white">Accepting New Patients</span>
                                <span className="text-xs text-green-400 font-medium">Profile will be live instantly</span>
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
                                                updateAvailability({ acceptingNewPatients: newValue })
                                            }}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
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
                            <div className="bg-[#1e271c] border border-[#2c3928] rounded-2xl p-6 md:p-8 flex flex-col gap-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <LuCalendar size={20} className="text-primary" />
                                        Weekly Schedule
                                    </h3>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {/* Show validation error for schedule */}
                                    {(errors.schedule || validationError) && (
                                        <p className="text-red-400 text-sm">
                                            {errors.schedule?.message || validationError || "Please enable at least one day of availability"}
                                        </p>
                                    )}

                                    {DAYS.map((day) => {
                                        const dayData = formData.schedule[day];
                                        const isEnabled = dayData?.enabled || false;

                                        return (
                                            <div
                                                key={day}
                                                className={`flex flex-col gap-4 p-4 rounded-xl border transition-all ${isEnabled
                                                    ? "bg-[#1a2818] border-green-500/30 relative"
                                                    : "bg-[#131811] border-[#2c3928]"
                                                    }`}
                                            >
                                                {isEnabled && <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-xl"></div>}

                                                <div className="flex items-center justify-between pl-2">
                                                    <span className={`font-semibold text-base ${isEnabled ? "text-white" : "text-gray-400"}`}>
                                                        {DAY_LABELS[day]}
                                                    </span>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={isEnabled}
                                                            onChange={() => handleToggleDay(day)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                                    </label>
                                                </div>

                                                {isEnabled && (
                                                    <div className="flex flex-col gap-3 pl-1">
                                                        {dayData.timeBlocks.map((block, index) => (
                                                            <div key={index} className="flex items-center gap-3">
                                                                {/* Start Time */}
                                                                <Controller
                                                                    name={`schedule.${day}.timeBlocks.${index}.startTime`}
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <DatePicker
                                                                            selected={parseTimeString(field.value)}
                                                                            onChange={(date) => {
                                                                                const timeString = format(date, "HH:mm");
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
                                                                            className="flex-1 bg-[#0d1109] border border-[#2c3928] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                                                        />
                                                                    )}
                                                                />

                                                                <span className="text-gray-500 text-sm">to</span>

                                                                {/* End Time */}
                                                                <Controller
                                                                    name={`schedule.${day}.timeBlocks.${index}.endTime`}
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <DatePicker
                                                                            selected={parseTimeString(field.value)}
                                                                            onChange={(date) => {
                                                                                const timeString = format(date, "HH:mm");
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
                                                                            className="flex-1 bg-[#0d1109] border border-[#2c3928] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                                                        />
                                                                    )}
                                                                />

                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeTimeBlock(day, index)}
                                                                    className="text-gray-400 hover:text-red-400 transition-colors p-1"
                                                                >
                                                                    <LuX size={20} />
                                                                </button>
                                                            </div>
                                                        ))}

                                                        <button
                                                            type="button"
                                                            onClick={() => addTimeBlock(day)}
                                                            className="flex items-center gap-2 text-sm text-primary font-semibold hover:text-blue-400 mt-1 self-start py-1 px-2 rounded hover:bg-primary/10 transition-colors"
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
                                        className="text-sm font-semibold text-primary hover:text-white border border-primary/20 hover:border-primary hover:bg-primary/10 rounded-lg px-4 py-2 transition-all"
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
                                        className="text-sm font-semibold text-primary hover:text-white border border-primary/20 hover:border-primary hover:bg-primary/10 rounded-lg px-4 py-2 transition-all"
                                    >
                                        Apply to all days
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Service Area - Takes 1 column */}
                        <div className="flex flex-col gap-6">
                            <div className="bg-[#1e271c] border border-[#2c3928] rounded-2xl p-6 md:p-8 flex flex-col gap-6">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <LuMapPin size={20} className="text-primary" />
                                    Service Area
                                </h3>

                                <div className="flex flex-col gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-gray-300">Base ZIP Code</label>
                                        <Controller
                                            name="baseZipCode"
                                            control={control}
                                            render={({ field }) => (
                                                <input
                                                    type="text"
                                                    {...field}
                                                    className="w-full h-12 rounded-lg border border-[#2c3928] bg-[#131811] text-white px-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                                    placeholder="e.g. 94103"
                                                    maxLength={10}
                                                />
                                            )}
                                        />
                                        {errors.baseZipCode && (
                                            <p className="text-red-400 text-sm">
                                                {errors.baseZipCode.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-bold text-gray-300">Service Radius</label>
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
                                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                                />
                                            )}
                                        />
                                        <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                            <span>0 mi</span>
                                            <span>50 mi</span>
                                            <span>100 mi</span>
                                        </div>
                                        {errors.serviceRadiusMiles && (
                                            <p className="text-red-400 text-sm">
                                                {errors.serviceRadiusMiles.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => router.push("/therapist/onboarding/credentials")}
                            className="w-full sm:w-auto flex items-center gap-2 px-8 h-12 text-gray-400 font-bold hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto px-10 h-12 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-blue-600 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 disabled:bg-gray-600"
                        >
                            {isSubmitting ? "Saving..." : "Continue"}
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

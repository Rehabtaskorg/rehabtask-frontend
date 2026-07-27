"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useOnboardingDataSync } from "@/hooks/useOnboardingDataSync";
import useOnboardingStore from "@/stores/onboardingStore";
import OnboardingProgressBar from "@/components/therapist/OnboardingProgressBar";
import PhoneInput from "@/components/ui/PhoneInput";
import LocationAutocomplete from "@/components/maps/LocationAutocomplete";
import { personalInfoSchema } from "@/lib/validators/onboarding.schema";
import { US_STATES } from "@/lib/constants/credentials";
import { onboardingAPI } from "@/services/onboarding.api";
import { usePageTitle } from "@/hooks/usePageTitle";

/** Max date for DOB input — must be at least 18 years old */
const getMaxDob = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split("T")[0];
};

/**
 * Personal information form — onboarding Step 1.
 * Two-column layout on desktop: personal details (left) + home address (right).
 * Address Line 1 uses Google Places autocomplete (street-level) to auto-fill
 * city, state, ZIP, and coordinates. City/state/ZIP remain manually editable.
 */
export function PersonalInformationForm() {
    usePageTitle("Personal Information");
    const router = useRouter();
    const { trackEvent } = useAnalytics();
    const { syncData } = useOnboardingDataSync();
    const {
        personalInfo,
        updatePersonalInfo,
        markStepComplete,
        setCurrentStep,
    } = useOnboardingStore();

    const [loading, setLoading] = useState(false);
    const [addressLine1Display, setAddressLine1Display] = useState(
        personalInfo.addressLine1 || ""
    );

    const {
        register,
        handleSubmit,
        control,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(personalInfoSchema),
        defaultValues: {
            dateOfBirth: personalInfo.dateOfBirth || "",
            phone: personalInfo.phone || "",
            addressLine1: personalInfo.addressLine1 || "",
            addressLine2: personalInfo.addressLine2 || "",
            city: personalInfo.city || "",
            state: personalInfo.state || "",
            zipCode: personalInfo.zipCode || "",
            latitude: personalInfo.latitude ?? null,
            longitude: personalInfo.longitude ?? null,
            emergencyContactName: personalInfo.emergencyContactName || "",
            emergencyContactPhone: personalInfo.emergencyContactPhone || "",
        },
        mode: "onSubmit",
    });

    useEffect(() => {
        trackEvent("onboarding_step_viewed", { step: 1, step_name: "personal_info" });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Repopulate from the backend on mount — the Zustand store is wiped on
    // logout, so a returning therapist must not see blank fields for a step
    // they already completed.
    useEffect(() => {
        syncData().then((data) => {
            if (!data) return;
            const info = data.personalInfo;
            reset({
                dateOfBirth: info.dateOfBirth ? info.dateOfBirth.slice(0, 10) : "",
                phone: info.phone || "",
                addressLine1: info.addressLine1 || "",
                addressLine2: info.addressLine2 || "",
                city: info.city || "",
                state: info.state || "",
                zipCode: info.zipCode || "",
                latitude: info.latitude ?? null,
                longitude: info.longitude ?? null,
                emergencyContactName: info.emergencyContactName || "",
                emergencyContactPhone: info.emergencyContactPhone || "",
            });
            setAddressLine1Display(info.addressLine1 || "");
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAddressSelect = ({ formattedAddress, city, state, zipCode, latitude, longitude }) => {
        setAddressLine1Display(formattedAddress);
        setValue("addressLine1", formattedAddress, { shouldValidate: false });
        setValue("city", city, { shouldValidate: false });
        setValue("state", state, { shouldValidate: false });
        setValue("zipCode", zipCode, { shouldValidate: false });
        setValue("latitude", latitude, { shouldValidate: false });
        setValue("longitude", longitude, { shouldValidate: false });
    };

    const handleAddressClear = () => {
        setAddressLine1Display("");
        setValue("addressLine1", "", { shouldValidate: false });
        setValue("city", "", { shouldValidate: false });
        setValue("state", "", { shouldValidate: false });
        setValue("zipCode", "", { shouldValidate: false });
        setValue("latitude", null, { shouldValidate: false });
        setValue("longitude", null, { shouldValidate: false });
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await onboardingAPI.savePersonalInfo({
                dateOfBirth: data.dateOfBirth,
                phone: data.phone,
                addressLine1: data.addressLine1,
                addressLine2: data.addressLine2 || null,
                city: data.city,
                state: data.state,
                zipCode: data.zipCode,
                latitude: data.latitude ?? null,
                longitude: data.longitude ?? null,
                emergencyContactName: data.emergencyContactName || null,
                emergencyContactPhone: data.emergencyContactPhone || null,
            });

            updatePersonalInfo({
                dateOfBirth: data.dateOfBirth,
                phone: data.phone,
                addressLine1: data.addressLine1,
                addressLine2: data.addressLine2 || null,
                city: data.city,
                state: data.state,
                zipCode: data.zipCode,
                latitude: data.latitude ?? null,
                longitude: data.longitude ?? null,
                emergencyContactName: data.emergencyContactName || null,
                emergencyContactPhone: data.emergencyContactPhone || null,
            });

            trackEvent("onboarding_step_completed", { step: 1, step_name: "personal_info" });
            markStepComplete(1);
            setCurrentStep(2);
            router.push("/therapist/onboarding/profile");
        } catch (error) {
            console.error("Failed to save personal info:", error);
            alert(error.message || "Failed to save personal information. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
            <div className="min-h-screen bg-background-light py-10 px-4">
                <div className="max-w-4xl mx-auto">
                    <OnboardingProgressBar />

                    <header className="mb-8 px-4">
                        <h1 className="text-text-main text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                            Personal Information
                        </h1>
                        <p className="text-text-muted text-lg font-normal leading-normal">
                            Tell us about yourself. This information is required for identity verification and compliance.
                        </p>
                    </header>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="bg-card-light border border-border-light rounded-xl overflow-hidden shadow-sm">

                            {/* Info banner */}
                            <div className="bg-blue-50 px-6 py-4 flex items-start gap-3 border-b border-blue-100">
                                <svg className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path clipRule="evenodd" fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
                                </svg>
                                <p className="text-sm text-blue-700">
                                    Your name and email from registration are already saved.
                                </p>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                    {/* LEFT COLUMN — Personal Details + Emergency Contact */}
                                    <div className="space-y-6">

                                        {/* Date of Birth */}
                                        <div className="flex flex-col gap-2">
                                            <label
                                                htmlFor="dateOfBirth"
                                                className="text-sm font-medium text-text-main"
                                            >
                                                Date of Birth <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="dateOfBirth"
                                                type="date"
                                                max={getMaxDob()}
                                                {...register("dateOfBirth")}
                                                className={`w-full px-4 py-3 rounded-lg border bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none ${
                                                    errors.dateOfBirth ? "border-red-500" : "border-border-light"
                                                }`}
                                            />
                                            {errors.dateOfBirth && (
                                                <p className="text-red-500 text-sm">{errors.dateOfBirth.message}</p>
                                            )}
                                        </div>

                                        {/* Phone Number */}
                                        <PhoneInput
                                            label="Phone Number"
                                            required
                                            control={control}
                                            name="phone"
                                            error={errors.phone?.message}
                                        />

                                        {/* Emergency Contact Name */}
                                        <div className="flex flex-col gap-2">
                                            <label
                                                htmlFor="emergencyContactName"
                                                className="text-sm font-medium text-text-main"
                                            >
                                                Emergency Contact Name{" "}
                                                <span className="text-text-muted font-normal text-sm">(optional)</span>
                                            </label>
                                            <input
                                                id="emergencyContactName"
                                                type="text"
                                                {...register("emergencyContactName")}
                                                placeholder="e.g. Jane Doe"
                                                className="w-full px-4 py-3 rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                            />
                                            {errors.emergencyContactName && (
                                                <p className="text-red-500 text-sm">{errors.emergencyContactName.message}</p>
                                            )}
                                        </div>

                                        {/* Emergency Contact Phone */}
                                        <PhoneInput
                                            label="Emergency Contact Phone"
                                            control={control}
                                            name="emergencyContactPhone"
                                            error={errors.emergencyContactPhone?.message}
                                            helperText="(optional)"
                                        />
                                    </div>

                                    {/* RIGHT COLUMN — Home Address */}
                                    <div className="space-y-6">

                                        {/* Address Line 1 — Google Places autocomplete */}
                                        <LocationAutocomplete
                                            label="Address Line 1"
                                            required
                                            variant="form"
                                            restrictToAddress
                                            placeholder="e.g. 123 Main Street"
                                            value={addressLine1Display}
                                            onChange={setAddressLine1Display}
                                            onSelect={handleAddressSelect}
                                            onClear={handleAddressClear}
                                            error={errors.addressLine1?.message}
                                            helperText="Select from the dropdown to auto-fill city, state, and ZIP"
                                        />

                                        {/* Address Line 2 */}
                                        <div className="flex flex-col gap-2">
                                            <label
                                                htmlFor="addressLine2"
                                                className="text-sm font-medium text-text-main"
                                            >
                                                Address Line 2{" "}
                                                <span className="text-text-muted font-normal text-sm">(optional)</span>
                                            </label>
                                            <input
                                                id="addressLine2"
                                                type="text"
                                                {...register("addressLine2")}
                                                placeholder="e.g. Apt 4B"
                                                className="w-full px-4 py-3 rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                            />
                                        </div>

                                        {/* City */}
                                        <div className="flex flex-col gap-2">
                                            <label
                                                htmlFor="city"
                                                className="text-sm font-medium text-text-main"
                                            >
                                                City <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="city"
                                                type="text"
                                                {...register("city")}
                                                placeholder="e.g. Chicago"
                                                className={`w-full px-4 py-3 rounded-lg border bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none ${
                                                    errors.city ? "border-red-500" : "border-border-light"
                                                }`}
                                            />
                                            {errors.city && (
                                                <p className="text-red-500 text-sm">{errors.city.message}</p>
                                            )}
                                        </div>

                                        {/* State + ZIP side by side */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label
                                                    htmlFor="state"
                                                    className="text-sm font-medium text-text-main"
                                                >
                                                    State <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    id="state"
                                                    {...register("state")}
                                                    className={`w-full px-4 py-3 rounded-lg border bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none appearance-none ${
                                                        errors.state ? "border-red-500" : "border-border-light"
                                                    }`}
                                                >
                                                    <option value="">Select State</option>
                                                    {US_STATES.map((s) => (
                                                        <option key={s.code} value={s.code}>
                                                            {s.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.state && (
                                                    <p className="text-red-500 text-sm">{errors.state.message}</p>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label
                                                    htmlFor="zipCode"
                                                    className="text-sm font-medium text-text-main"
                                                >
                                                    ZIP Code <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    id="zipCode"
                                                    type="text"
                                                    inputMode="numeric"
                                                    {...register("zipCode")}
                                                    placeholder="e.g. 60601"
                                                    maxLength={5}
                                                    className={`w-full px-4 py-3 rounded-lg border bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none ${
                                                        errors.zipCode ? "border-red-500" : "border-border-light"
                                                    }`}
                                                />
                                                {errors.zipCode && (
                                                    <p className="text-red-500 text-sm">{errors.zipCode.message}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-8 bg-muted-light flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-border-light">
                                <button
                                    type="button"
                                    onClick={() => router.push("/therapist/dashboard")}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-12 text-text-muted font-bold hover:text-text-main transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Back
                                </button>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full sm:w-auto px-10 h-12 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:brightness-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Saving..." : "Save & Continue"}
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </APIProvider>
    );
}
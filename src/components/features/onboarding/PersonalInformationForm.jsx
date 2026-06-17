"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useAnalytics } from "@/hooks/useAnalytics";
import useOnboardingStore from "@/store/onboardingStore";
import OnboardingProgressBar from "@/components/therapist/OnboardingProgressBar";
import PhoneInput from "@/components/ui/PhoneInput";
import LocationAutocomplete from "@/components/maps/LocationAutocomplete";
import { personalInfoSchema } from "@/lib/onboardingValidation";
import { US_STATES } from "@/lib/constants/credentials";
import { onboardingAPI } from "@/lib/onboarding.api";
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
            <div className="min-h-screen bg-background-light py-8 px-4 md:px-12 lg:px-24">
                <div className="max-w-[700px] mx-auto">
                    <OnboardingProgressBar />

                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-text-main mb-2">
                            Personal Information
                        </h1>
                        <p className="text-text-muted">
                            This information is required for identity verification and compliance.
                        </p>
                    </header>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="bg-card-light border border-border-light rounded-xl overflow-hidden shadow-sm">

                            {/* Info banner — mirrors Stitch design */}
                            <div className="bg-blue-50 px-6 py-4 flex items-start gap-3 border-b border-blue-100">
                                <svg className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path clipRule="evenodd" fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
                                </svg>
                                <p className="text-sm text-blue-700">
                                    Your name and email from registration are already saved.
                                </p>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                                    {/* LEFT COLUMN — Personal Details + Emergency Contact */}
                                    <div className="space-y-6">

                                        {/* Date of Birth */}
                                        <div>
                                            <label
                                                htmlFor="dateOfBirth"
                                                className="block text-sm font-semibold text-text-main mb-1"
                                            >
                                                Date of Birth <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="dateOfBirth"
                                                type="date"
                                                max={getMaxDob()}
                                                {...register("dateOfBirth")}
                                                className={`w-full rounded-lg border shadow-sm focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm p-2.5 bg-input-light text-text-main transition-colors outline-none ${
                                                    errors.dateOfBirth ? "border-red-500" : "border-border-light"
                                                }`}
                                            />
                                            {errors.dateOfBirth && (
                                                <p className="mt-1 text-xs text-red-500">{errors.dateOfBirth.message}</p>
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
                                        <div>
                                            <label
                                                htmlFor="emergencyContactName"
                                                className="block text-sm font-semibold text-text-main mb-1"
                                            >
                                                Emergency Contact Name{" "}
                                                <span className="text-text-muted font-normal">(optional)</span>
                                            </label>
                                            <input
                                                id="emergencyContactName"
                                                type="text"
                                                {...register("emergencyContactName")}
                                                placeholder="e.g. Jane Doe"
                                                className="w-full rounded-lg border border-border-light shadow-sm focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm p-2.5 bg-input-light text-text-main transition-colors outline-none"
                                            />
                                            {errors.emergencyContactName && (
                                                <p className="mt-1 text-xs text-red-500">{errors.emergencyContactName.message}</p>
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
                                        <div>
                                            <label
                                                htmlFor="addressLine2"
                                                className="block text-sm font-semibold text-text-main mb-1"
                                            >
                                                Address Line 2{" "}
                                                <span className="text-text-muted font-normal">(optional)</span>
                                            </label>
                                            <input
                                                id="addressLine2"
                                                type="text"
                                                {...register("addressLine2")}
                                                placeholder="e.g. Apt 4B"
                                                className="w-full rounded-lg border border-border-light shadow-sm focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm p-2.5 bg-input-light text-text-main transition-colors outline-none"
                                            />
                                        </div>

                                        {/* City */}
                                        <div>
                                            <label
                                                htmlFor="city"
                                                className="block text-sm font-semibold text-text-main mb-1"
                                            >
                                                City <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="city"
                                                type="text"
                                                {...register("city")}
                                                placeholder="e.g. Chicago"
                                                className={`w-full rounded-lg border shadow-sm focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm p-2.5 bg-input-light text-text-main transition-colors outline-none ${
                                                    errors.city ? "border-red-500" : "border-border-light"
                                                }`}
                                            />
                                            {errors.city && (
                                                <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>
                                            )}
                                        </div>

                                        {/* State + ZIP side by side */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label
                                                    htmlFor="state"
                                                    className="block text-sm font-semibold text-text-main mb-1"
                                                >
                                                    State <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    id="state"
                                                    {...register("state")}
                                                    className={`w-full rounded-lg border shadow-sm focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm p-2.5 bg-input-light text-text-main transition-colors outline-none ${
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
                                                    <p className="mt-1 text-xs text-red-500">{errors.state.message}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="zipCode"
                                                    className="block text-sm font-semibold text-text-main mb-1"
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
                                                    className={`w-full rounded-lg border shadow-sm focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm p-2.5 bg-input-light text-text-main transition-colors outline-none ${
                                                        errors.zipCode ? "border-red-500" : "border-border-light"
                                                    }`}
                                                />
                                                {errors.zipCode && (
                                                    <p className="mt-1 text-xs text-red-500">{errors.zipCode.message}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="mt-12 pt-6 border-t border-border-light flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <button
                                        type="button"
                                        onClick={() => router.push("/therapist/dashboard")}
                                        className="flex items-center text-sm font-semibold text-text-muted hover:text-text-main transition-colors"
                                    >
                                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Back
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:brightness-95 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? "Saving..." : "Save & Continue"}
                                        <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </APIProvider>
    );
}
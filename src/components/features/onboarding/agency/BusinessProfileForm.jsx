"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { APIProvider } from "@vis.gl/react-google-maps";
import { agencyBusinessProfileSchema } from "@/lib/agencyOnboardingValidation";
import { agencyOnboardingAPI } from "@/lib/agency.onboarding.api";
import { useAgencyOnboardingDataSync } from "@/hooks/useAgencyOnboardingSync";
import useAgencyOnboardingStore from "@/store/agencyOnboardingStore";
import { AgencyOnboardingProgressBar } from "@/components/features/onboarding/agency/AgencyOnboardingProgressBar";
import LocationAutocomplete from "@/components/maps/LocationAutocomplete";
import { US_STATES } from "@/lib/constants/credentials";
import { usePageTitle } from "@/hooks/usePageTitle";
import { logger } from "@/lib/logger";

/**
 * Agency onboarding Step 2 — Business Profile.
 * Two-column layout: agency/billing details (left), address (right).
 */
export function BusinessProfileForm() {
    usePageTitle("Business Profile");
    const router = useRouter();
    const { syncData } = useAgencyOnboardingDataSync();
    const { businessProfile, updateBusinessProfile, markStepComplete, setCurrentStep } = useAgencyOnboardingStore();

    const [loading, setLoading] = useState(false);
    const [registration, setRegistration] = useState({ agencyName: "", fullName: "", phone: "" });
    const [addressLine1Display, setAddressLine1Display] = useState(businessProfile.addressLine1 || "");

    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
        resolver: zodResolver(agencyBusinessProfileSchema),
        defaultValues: {
            dbaName: businessProfile.dbaName || "",
            ein: businessProfile.ein || "",
            billingEmail: businessProfile.billingEmail || "",
            addressLine1: businessProfile.addressLine1 || "",
            addressLine2: businessProfile.addressLine2 || "",
            city: businessProfile.city || "",
            state: businessProfile.state || "",
            zipCode: businessProfile.zipCode || "",
        },
        mode: "onSubmit",
    });

    useEffect(() => {
        syncData().then((data) => {
            if (!data) return;
            setRegistration(data.registration);
            reset({
                dbaName: data.businessProfile.dbaName || "",
                ein: data.businessProfile.ein || "",
                billingEmail: data.businessProfile.billingEmail || "",
                addressLine1: data.businessProfile.addressLine1 || "",
                addressLine2: data.businessProfile.addressLine2 || "",
                city: data.businessProfile.city || "",
                state: data.businessProfile.state || "",
                zipCode: data.businessProfile.zipCode || "",
            });
            setAddressLine1Display(data.businessProfile.addressLine1 || "");
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAddressSelect = ({ formattedAddress, city, state, zipCode }) => {
        setAddressLine1Display(formattedAddress);
        setValue("addressLine1", formattedAddress, { shouldValidate: false });
        setValue("city", city, { shouldValidate: false });
        setValue("state", state, { shouldValidate: false });
        setValue("zipCode", zipCode, { shouldValidate: false });
    };

    const handleAddressClear = () => {
        setAddressLine1Display("");
        setValue("addressLine1", "", { shouldValidate: false });
        setValue("city", "", { shouldValidate: false });
        setValue("state", "", { shouldValidate: false });
        setValue("zipCode", "", { shouldValidate: false });
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await agencyOnboardingAPI.saveAgencyBusinessProfile({
                dbaName: data.dbaName || null,
                ein: data.ein || null,
                billingEmail: data.billingEmail,
                addressLine1: data.addressLine1,
                addressLine2: data.addressLine2 || null,
                city: data.city,
                state: data.state,
                zipCode: data.zipCode,
            });
            updateBusinessProfile(data);
            markStepComplete(2);
            setCurrentStep(3);
            router.push("/customer/onboarding/agency/upload-documents");
        } catch (error) {
            logger.error("Failed to save agency business profile:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
            <div className="min-h-screen bg-background-light py-10 px-4">
                <div className="max-w-4xl mx-auto">
                    <AgencyOnboardingProgressBar />

                    <header className="mb-8 px-4">
                        <h1 className="text-text-main text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                            Business Profile
                        </h1>
                        <p className="text-text-muted text-lg font-normal leading-normal">
                            Provide your agency&apos;s legal and billing information.
                        </p>
                    </header>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="bg-card-light border border-border-light rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-blue-50 px-6 py-4 flex items-start gap-3 border-b border-blue-100">
                                <svg className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path clipRule="evenodd" fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
                                </svg>
                                <p className="text-sm text-blue-700">
                                    Your agency name and primary contact from registration are already saved.
                                </p>
                            </div>

                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* LEFT — Agency & Billing Details */}
                                    <div className="space-y-6">
                                        <ReadOnlyField label="Agency Legal Name" value={registration.agencyName} />
                                        <FormField label="DBA Name" optional id="dbaName" placeholder="e.g. ABC Therapy Services" register={register} error={errors.dbaName} />
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="ein" className="text-text-main text-base font-semibold">
                                                EIN <span className="text-text-muted font-normal text-sm">(optional)</span>
                                            </label>
                                            <input id="ein" type="text" {...register("ein")} placeholder="e.g. 12-3456789"
                                                className="w-full px-4 py-3 rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                            />
                                            <p className="text-text-muted text-xs">Employer Identification Number — used for billing and tax purposes</p>
                                            {errors.ein && <p className="text-red-500 text-sm">{errors.ein.message}</p>}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="billingEmail" className="text-text-main text-base font-semibold">
                                                Billing Contact Email <span className="text-red-500">*</span>
                                            </label>
                                            <input id="billingEmail" type="email" {...register("billingEmail")} placeholder="e.g. billing@youragency.com"
                                                className={`w-full px-4 py-3 rounded-lg border bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none ${errors.billingEmail ? "border-red-500" : "border-border-light"}`}
                                            />
                                            {errors.billingEmail && <p className="text-red-500 text-sm">{errors.billingEmail.message}</p>}
                                        </div>
                                    </div>

                                    {/* RIGHT — Contact & Address */}
                                    <div className="space-y-6">
                                        <ReadOnlyField label="Primary Contact Person" value={registration.fullName} />
                                        <ReadOnlyField label="Phone" value={registration.phone} />
                                        <LocationAutocomplete
                                            label="Business Address Line 1"
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
                                        <FormField label="Business Address Line 2" optional id="addressLine2" placeholder="e.g. Suite 400" register={register} error={errors.addressLine2} />
                                        <FormField label="City" required id="city" placeholder="e.g. Chicago" register={register} error={errors.city} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label htmlFor="state" className="text-text-main text-base font-semibold">
                                                    State <span className="text-red-500">*</span>
                                                </label>
                                                <select id="state" {...register("state")}
                                                    className={`w-full px-4 py-3 rounded-lg border bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none appearance-none ${errors.state ? "border-red-500" : "border-border-light"}`}
                                                >
                                                    <option value="">Select State</option>
                                                    {US_STATES.map((s) => (
                                                        <option key={s.code} value={s.code}>{s.name}</option>
                                                    ))}
                                                </select>
                                                {errors.state && <p className="text-red-500 text-sm">{errors.state.message}</p>}
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label htmlFor="zipCode" className="text-text-main text-base font-semibold">
                                                    ZIP Code <span className="text-red-500">*</span>
                                                </label>
                                                <input id="zipCode" type="text" inputMode="numeric" maxLength={5} {...register("zipCode")} placeholder="e.g. 60601"
                                                    className={`w-full px-4 py-3 rounded-lg border bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none ${errors.zipCode ? "border-red-500" : "border-border-light"}`}
                                                />
                                                {errors.zipCode && <p className="text-red-500 text-sm">{errors.zipCode.message}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-muted-light flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-border-light">
                                <button type="button" onClick={() => router.push("/customer/dashboard")}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-12 text-text-muted font-bold hover:text-text-main transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Back
                                </button>
                                <button type="submit" disabled={loading}
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

function ReadOnlyField({ label, value }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-text-main text-base font-semibold">{label}</label>
            <div className="w-full px-4 py-3 rounded-lg border border-border-light bg-gray-50 text-text-muted">
                {value || "—"}
            </div>
        </div>
    );
}

function FormField({ label, id, placeholder, register, error, required, optional }) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-text-main text-base font-semibold">
                {label}{" "}
                {required && <span className="text-red-500">*</span>}
                {optional && <span className="text-text-muted font-normal text-sm">(optional)</span>}
            </label>
            <input id={id} type="text" {...register(id)} placeholder={placeholder}
                className={`w-full px-4 py-3 rounded-lg border bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none ${error ? "border-red-500" : "border-border-light"}`}
            />
            {error && <p className="text-red-500 text-sm">{error.message}</p>}
        </div>
    );
}

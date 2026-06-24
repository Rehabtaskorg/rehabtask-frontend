"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useAgencyOnboardingDataSync } from "@/hooks/useAgencyOnboardingSync";
import useAgencyOnboardingStore from "@/store/agencyOnboardingStore";
import { AgencyOnboardingProgressBar } from "@/components/features/onboarding/agency/AgencyOnboardingProgressBar";
import { BusinessProfileIdentityFields } from "@/components/features/onboarding/agency/BusinessProfileIdentityFields";
import { BusinessProfileAddressFields } from "@/components/features/onboarding/agency/BusinessProfileAddressFields";
import { agencyBusinessProfileSchema } from "@/lib/agencyOnboardingValidation";
import { agencyOnboardingAPI } from "@/lib/agency.onboarding.api";
import { logger } from "@/lib/logger";
import { usePageTitle } from "@/hooks/usePageTitle";

const toPayload = (data) => ({
    dbaName: data.dbaName || null,
    ein: data.ein || null,
    billingEmail: data.billingEmail,
    addressLine1: data.addressLine1,
    addressLine2: data.addressLine2 || null,
    city: data.city,
    state: data.state,
    zipCode: data.zipCode,
});

/**
 * Agency onboarding Step 2 — Business Profile.
 * Collects DBA name, EIN, billing email, and business address.
 * Read-only fields (agency name, primary contact, phone) are pre-filled from registration.
 */
export function BusinessProfileForm() {
    usePageTitle("Business Profile");
    const router = useRouter();
    const { syncData } = useAgencyOnboardingDataSync();
    const businessProfile = useAgencyOnboardingStore((s) => s.businessProfile);
    const updateBusinessProfile = useAgencyOnboardingStore((s) => s.updateBusinessProfile);
    const markStepComplete = useAgencyOnboardingStore((s) => s.markStepComplete);
    const setCurrentStep = useAgencyOnboardingStore((s) => s.setCurrentStep);

    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [registration, setRegistration] = useState({ agencyName: "", fullName: "", phone: "" });
    const [addressLine1Display, setAddressLine1Display] = useState(businessProfile.addressLine1 || "");

    const { register, handleSubmit, setValue, reset, formState: { errors, isDirty } } = useForm({
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
            if (data.registration) setRegistration(data.registration);
            const bp = data.businessProfile;
            if (!bp) return;
            if (!isDirty) {
                reset({
                    dbaName: bp.dbaName || "",
                    ein: bp.ein || "",
                    billingEmail: bp.billingEmail || "",
                    addressLine1: bp.addressLine1 || "",
                    addressLine2: bp.addressLine2 || "",
                    city: bp.city || "",
                    state: bp.state || "",
                    zipCode: bp.zipCode || "",
                });
                setAddressLine1Display(bp.addressLine1 || "");
            }
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
        ["addressLine1", "city", "state", "zipCode"].forEach((f) =>
            setValue(f, "", { shouldValidate: false })
        );
    };

    const onSubmit = async (data) => {
        logger.log("[BusinessProfileForm] onSubmit data:", data);
        setLoading(true);
        setSubmitError(null);
        try {
            const payload = toPayload(data);
            logger.log("[BusinessProfileForm] payload:", payload);
            await agencyOnboardingAPI.saveAgencyBusinessProfile(payload);
            updateBusinessProfile(payload);
            markStepComplete(2);
            setCurrentStep(3);
            router.push("/customer/onboarding/agency/upload-documents");
        } catch (error) {
            logger.error("Failed to save agency business profile:", error);
            setSubmitError(error.message || "Failed to save business profile. Please try again.");
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
                                    Your agency name, primary contact, and phone from registration are already saved.
                                </p>
                            </div>
                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <BusinessProfileIdentityFields register={register} errors={errors} registration={registration} />
                                    <BusinessProfileAddressFields
                                        register={register}
                                        errors={errors}
                                        addressLine1Display={addressLine1Display}
                                        onAddressDisplayChange={setAddressLine1Display}
                                        onAddressSelect={handleAddressSelect}
                                        onAddressClear={handleAddressClear}
                                    />
                                </div>
                                {submitError && (
                                    <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                                        <p className="text-red-700 text-sm">{submitError}</p>
                                    </div>
                                )}
                            </div>
                            <div className="p-8 bg-muted-light flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-border-light">
                                <button
                                    type="button"
                                    onClick={() => router.push("/customer/onboarding/agency/welcome")}
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

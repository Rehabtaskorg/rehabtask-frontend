"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useOnboardingDataSync } from "@/hooks/useOnboardingDataSync";
import useOnboardingStore from "@/store/onboardingStore";
import OnboardingProgressBar from "@/components/therapist/OnboardingProgressBar";
import { professionalProfileSchema } from "@/lib/onboardingValidation";
import { SPECIALIZATIONS } from "@/lib/constants/specializations";
import { LICENSE_TYPES } from "@/lib/constants/credentials";
import { onboardingAPI } from "@/lib/onboarding.api";
import { usePageTitle } from "@/hooks/usePageTitle";

/**
 * Professional profile form — onboarding Step 2.
 * Handles profile photo upload, license type, specialization, and professional summary.
 */
export function ProfessionalProfileForm() {
    usePageTitle("Setup Profile");
    const router = useRouter();
    const { trackEvent } = useAnalytics();
    const { syncData } = useOnboardingDataSync();
    const {
        professionalProfile,
        updateProfessionalProfile,
        markStepComplete,
        setCurrentStep,
    } = useOnboardingStore();

    const [profilePhoto, setProfilePhoto] = useState(
        professionalProfile.profilePhotoUrl || null
    );
    const [loading, setLoading] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
        watch,
    } = useForm({
        resolver: zodResolver(professionalProfileSchema),
        defaultValues: {
            yearsOfExperience: professionalProfile.yearsOfExperience?.toString() || "",
            primaryLicenseType: professionalProfile.primaryLicenseType || "",
            specialization: professionalProfile.specialization || "",
            professionalSummary: professionalProfile.professionalSummary || "",
            profilePhotoUrl: professionalProfile.profilePhotoUrl || null,
        },
        mode: "onSubmit",
    });

    useEffect(() => {
        trackEvent("onboarding_step_viewed", { step: 2, step_name: "profile" });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Repopulate from the backend on mount — the Zustand store is wiped on
    // logout, so a returning therapist must not see blank fields for a step
    // they already completed.
    useEffect(() => {
        syncData().then((data) => {
            if (!data) return;
            const profile = data.professionalProfile;
            reset({
                yearsOfExperience: profile.yearsOfExperience?.toString() || "",
                primaryLicenseType: profile.primaryLicenseType || "",
                specialization: profile.specialization || "",
                professionalSummary: profile.professionalSummary || "",
                profilePhotoUrl: profile.profilePhotoUrl || null,
            });
            setProfilePhoto(profile.profilePhotoUrl || null);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("File too large. Maximum size is 5MB");
            return;
        }

        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (!allowedTypes.includes(file.type)) {
            alert("Invalid file type. Please upload a JPEG or PNG image.");
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setProfilePhoto(previewUrl);
        setUploadingPhoto(true);

        try {
            const result = await onboardingAPI.uploadProfilePhoto(file);
            setProfilePhoto(result.url);
            setValue("profilePhotoUrl", result.url);
            URL.revokeObjectURL(previewUrl);
        } catch (error) {
            console.error("Upload failed:", error);
            alert(error.message || "Failed to upload photo. Please try again.");
            setProfilePhoto(professionalProfile.profilePhotoUrl || null);
            setValue("profilePhotoUrl", professionalProfile.profilePhotoUrl || null);
        } finally {
            setUploadingPhoto(false);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const specialization = data.specialization || null;

            await onboardingAPI.saveProfessionalProfile({
                yearsOfExperience: Number(data.yearsOfExperience),
                primaryLicenseType: data.primaryLicenseType,
                specialization,
                professionalSummary: data.professionalSummary,
                profilePhotoUrl: data.profilePhotoUrl,
            });

            updateProfessionalProfile({
                yearsOfExperience: Number(data.yearsOfExperience),
                primaryLicenseType: data.primaryLicenseType,
                specialization,
                professionalSummary: data.professionalSummary,
                profilePhotoUrl: data.profilePhotoUrl,
            });

            trackEvent("onboarding_step_completed", {
                step: 2,
                step_name: "profile",
                license_type: data.primaryLicenseType,
            });

            markStepComplete(2);
            setCurrentStep(3);
            router.push("/therapist/onboarding/credentials");
        } catch (error) {
            console.error("Failed to save profile:", error);
            alert(error.message || "Failed to save profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-light  py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <OnboardingProgressBar />

                <header className="mb-8 px-4">
                    <h1 className="text-text-main  text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                        Professional Profile
                    </h1>
                    <p className="text-text-muted  text-lg font-normal leading-normal">
                        Tell us about your clinical expertise and background to help patients find the right match.
                    </p>
                </header>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="bg-card-light  border border-border-light  rounded-xl overflow-hidden shadow-sm">
                        {/* Profile Photo */}
                        <div className="p-8 border-b border-border-light ">
                            <div className="flex flex-col items-center text-center gap-6">
                                <div className="relative">
                                    <div
                                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32 ring-4 ring-primary/10 bg-gray-200 "
                                        style={{
                                            backgroundImage: profilePhoto
                                                ? `url(${profilePhoto})`
                                                : "none",
                                        }}
                                    >
                                        {uploadingPhoto && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                                                <svg
                                                    className="animate-spin h-8 w-8 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    />
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:brightness-95 transition-all cursor-pointer">
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png"
                                            className="hidden"
                                            onChange={handlePhotoUpload}
                                            disabled={uploadingPhoto}
                                        />
                                    </label>
                                </div>
                                <div className="flex flex-col items-center">
                                    <h3 className="text-text-main  text-xl font-bold tracking-tight">
                                        Professional Headshot
                                    </h3>
                                    <p className="text-text-muted  text-sm max-w-xs mt-1">
                                        A high-quality, professional photo increases profile views by up to 40%
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Years of Experience */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-text-main  text-base font-semibold">
                                        Years of Experience
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            {...register("yearsOfExperience")}
                                            className="w-full px-4 py-3 rounded-lg border border-border-light  bg-input-light  text-text-main  focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                            placeholder="e.g. 8"
                                            min="0"
                                            max="50"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                            Years
                                        </span>
                                    </div>
                                    {errors.yearsOfExperience && (
                                        <p className="text-red-500 text-sm">
                                            {errors.yearsOfExperience.message}
                                        </p>
                                    )}
                                </div>

                                {/* Primary License Type */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-text-main  text-base font-semibold">
                                        Primary Discipline type
                                    </label>
                                    <select
                                        {...register("primaryLicenseType")}
                                        className="w-full px-4 py-3 rounded-lg border border-border-light  bg-input-light  text-text-main  focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none appearance-none"
                                    >
                                        <option value="">Select Discipline type</option>
                                        {LICENSE_TYPES.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.primaryLicenseType && (
                                        <p className="text-red-500 text-sm">
                                            {errors.primaryLicenseType.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Specialization */}
                            <div className="flex flex-col gap-2">
                                <label className="text-text-main  text-base font-semibold">
                                    Primary Specialization{" "}
                                    <span className="text-text-muted  font-normal text-sm">
                                        (optional)
                                    </span>
                                </label>
                                <select
                                    {...register("specialization")}
                                    className="w-full px-4 py-3 rounded-lg border border-border-light  bg-input-light  text-text-main  focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none appearance-none"
                                >
                                    <option value="">Select Specialization</option>
                                    {SPECIALIZATIONS.map((spec) => (
                                        <option key={spec} value={spec}>
                                            {spec}
                                        </option>
                                    ))}
                                </select>
                                {errors.specialization && (
                                    <p className="text-red-500 text-sm">
                                        {errors.specialization.message}
                                    </p>
                                )}
                            </div>

                            {/* Professional Summary */}
                            <div className="flex flex-col gap-2">
                                <label className="flex justify-between items-center">
                                    <span className="text-text-main  text-base font-semibold">
                                        Professional Summary
                                    </span>
                                    <span className="text-xs text-gray-400 font-normal">
                                        Min 100 characters (
                                        {watch("professionalSummary")?.length || 0}/2000)
                                    </span>
                                </label>
                                <textarea
                                    {...register("professionalSummary")}
                                    className="w-full min-h-36 resize-none rounded-lg border border-border-light  bg-input-light  text-text-main  focus:ring-2 focus:ring-primary focus:border-transparent p-4 text-base leading-relaxed outline-none placeholder:text-text-muted"
                                    placeholder="Share a brief bio about your therapeutic approach, areas of interest, and why you love what you do..."
                                    maxLength={2000}
                                />
                                {errors.professionalSummary && (
                                    <p className="text-red-500 text-sm">
                                        {errors.professionalSummary.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-8 bg-muted-light  flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-border-light ">
                            <button
                                type="button"
                                onClick={() => router.push("/therapist/onboarding/personal-info")}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-12 text-text-muted  font-bold hover:text-text-main  transition-colors"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                    />
                                </svg>
                                Back
                            </button>

                            <button
                                type="submit"
                                disabled={loading || uploadingPhoto}
                                className="w-full sm:w-auto px-10 h-12 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:brightness-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Saving..." : "Save & Continue"}
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

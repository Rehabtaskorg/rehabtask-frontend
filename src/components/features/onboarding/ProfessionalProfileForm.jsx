"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useOnboardingDataSync } from "@/hooks/useOnboardingDataSync";
import useOnboardingStore from "@/stores/onboardingStore";
import OnboardingProgressBar from "@/components/therapist/OnboardingProgressBar";
import { MultiSelectTagPicker } from "@/components/ui/MultiSelectTagPicker";
import { professionalProfileSchema } from "@/lib/validators/onboarding.schema";
import {
    THERAPIST_SPECIALTIES,
    THERAPIST_LANGUAGES,
    THERAPIST_CERTIFICATIONS,
    THERAPIST_PAST_SETTINGS,
    THERAPIST_POPULATIONS,
} from "@/lib/constants/therapistAttributes";
import { LICENSE_TYPES } from "@/lib/constants/credentials";
import { onboardingAPI } from "@/services/onboarding.api";
import { usePageTitle } from "@/hooks/usePageTitle";

/**
 * Professional profile form — onboarding Step 2.
 */
export function ProfessionalProfileForm() {
    usePageTitle("Setup Profile");
    const router = useRouter();
    const { trackEvent } = useAnalytics();
    const { syncData } = useOnboardingDataSync();
    const { professionalProfile, updateProfessionalProfile, markStepComplete, setCurrentStep } =
        useOnboardingStore();

    const [profilePhoto, setProfilePhoto] = useState(professionalProfile.profilePhotoUrl || null);
    const [loading, setLoading] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const [specialties, setSpecialties] = useState(professionalProfile.specialties ?? []);
    const [specialtiesError, setSpecialtiesError] = useState("");
    const [languages, setLanguages] = useState(professionalProfile.languages ?? []);
    const [certifications, setCertifications] = useState(professionalProfile.certifications ?? []);
    const [pastSettings, setPastSettings] = useState(professionalProfile.pastSettings ?? []);
    const [populationExperience, setPopulationExperience] = useState(professionalProfile.populationExperience ?? []);

    const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm({
        resolver: zodResolver(professionalProfileSchema),
        defaultValues: {
            yearsOfExperience: professionalProfile.yearsOfExperience?.toString() || "",
            primaryLicenseType: professionalProfile.primaryLicenseType || "",
            yearsInHomeHealth: professionalProfile.yearsInHomeHealth?.toString() || "",
            professionalSummary: professionalProfile.professionalSummary || "",
            profilePhotoUrl: professionalProfile.profilePhotoUrl || null,
            specialties: [],
            languages: [],
            certifications: [],
            pastSettings: [],
            populationExperience: [],
        },
        mode: "onSubmit",
    });

    useEffect(() => {
        trackEvent("onboarding_step_viewed", { step: 2, step_name: "profile" });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        syncData().then((data) => {
            if (!data) return;
            const p = data.professionalProfile;
            reset({
                yearsOfExperience: p.yearsOfExperience?.toString() || "",
                primaryLicenseType: p.primaryLicenseType || "",
                yearsInHomeHealth: p.yearsInHomeHealth?.toString() || "",
                professionalSummary: p.professionalSummary || "",
                profilePhotoUrl: p.profilePhotoUrl || null,
                specialties: [],
                languages: [],
                certifications: [],
                pastSettings: [],
                populationExperience: [],
            });
            setProfilePhoto(p.profilePhotoUrl || null);
            setSpecialties(p.specialties ?? []);
            setLanguages(p.languages ?? []);
            setCertifications(p.certifications ?? []);
            setPastSettings(p.pastSettings ?? []);
            setPopulationExperience(p.populationExperience ?? []);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { alert("File too large. Maximum size is 5MB"); return; }
        const allowed = ["image/jpeg", "image/jpg", "image/png"];
        if (!allowed.includes(file.type)) { alert("Invalid file type. Please upload a JPEG or PNG image."); return; }

        const preview = URL.createObjectURL(file);
        setProfilePhoto(preview);
        setUploadingPhoto(true);
        try {
            const result = await onboardingAPI.uploadProfilePhoto(file);
            setProfilePhoto(result.url);
            setValue("profilePhotoUrl", result.url);
            URL.revokeObjectURL(preview);
        } catch (err) {
            alert(err.message || "Failed to upload photo. Please try again.");
            setProfilePhoto(professionalProfile.profilePhotoUrl || null);
            setValue("profilePhotoUrl", professionalProfile.profilePhotoUrl || null);
        } finally {
            setUploadingPhoto(false);
        }
    };

    const onSubmit = async (data) => {
        if (specialties.length === 0) {
            setSpecialtiesError("Please select at least one specialty");
            return;
        }
        setSpecialtiesError("");
        setLoading(true);
        setSubmitError("");
        try {
            const payload = {
                yearsOfExperience: Number(data.yearsOfExperience),
                primaryLicenseType: data.primaryLicenseType,
                specialties,
                languages,
                certifications,
                pastSettings,
                populationExperience,
                yearsInHomeHealth: data.yearsInHomeHealth ? Number(data.yearsInHomeHealth) : null,
                professionalSummary: data.professionalSummary,
                profilePhotoUrl: data.profilePhotoUrl,
            };

            await onboardingAPI.saveProfessionalProfile(payload);
            updateProfessionalProfile(payload);
            trackEvent("onboarding_step_completed", { step: 2, step_name: "profile", license_type: data.primaryLicenseType });
            markStepComplete(2);
            setCurrentStep(3);
            router.push("/therapist/onboarding/credentials");
        } catch (err) {
            setSubmitError(err.response?.data?.message || err.message || "Failed to save profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-light py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <OnboardingProgressBar />

                <header className="mb-8 px-4">
                    <h1 className="text-text-main text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                        Professional Profile
                    </h1>
                    <p className="text-text-muted text-lg font-normal leading-normal">
                        Tell us about your clinical expertise and background to help patients find the right match.
                    </p>
                </header>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="bg-card-light border border-border-light rounded-xl overflow-hidden shadow-sm">

                        {/* Profile Photo */}
                        <div className="p-8 border-b border-border-light">
                            <div className="flex flex-col items-center text-center gap-6">
                                <div className="relative">
                                    <div
                                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32 ring-4 ring-primary/10 bg-gray-200"
                                        style={{ backgroundImage: profilePhoto ? `url(${profilePhoto})` : "none" }}
                                    >
                                        {uploadingPhoto && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                                                <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:brightness-95 transition-all cursor-pointer">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <input type="file" accept="image/jpeg,image/jpg,image/png" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                                    </label>
                                </div>
                                <div className="flex flex-col items-center">
                                    <h3 className="text-text-main text-xl font-bold tracking-tight">Professional Headshot</h3>
                                    <p className="text-text-muted text-sm max-w-xs mt-1">
                                        A high-quality, professional photo increases profile views by up to 40%
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="p-8 space-y-8">

                            {/* Years of Experience + Primary Discipline */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="flex flex-col gap-2">
                                    <label className="text-text-main text-base font-semibold">
                                        Years of Experience <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            {...register("yearsOfExperience")}
                                            className="w-full px-4 py-3 rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                            placeholder="e.g. 8"
                                            min="0"
                                            max="50"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">yrs</span>
                                    </div>
                                    {errors.yearsOfExperience && <p className="text-red-500 text-sm">{errors.yearsOfExperience.message}</p>}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-text-main text-base font-semibold">
                                        Primary Discipline <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        {...register("primaryLicenseType")}
                                        className="w-full px-4 py-3 rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none appearance-none"
                                    >
                                        <option value="">Select discipline</option>
                                        {LICENSE_TYPES.map((t) => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                    {errors.primaryLicenseType && <p className="text-red-500 text-sm">{errors.primaryLicenseType.message}</p>}
                                </div>
                            </div>

                            {/* Years in Home Health */}
                            <div className="flex flex-col gap-2 md:w-1/2">
                                <label className="text-text-main text-base font-semibold">
                                    Years in Home Health{" "}
                                    <span className="text-text-muted font-normal text-sm">(optional)</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        {...register("yearsInHomeHealth")}
                                        className="w-full px-4 py-3 rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                        placeholder="e.g. 3"
                                        min="0"
                                        max="50"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">yrs</span>
                                </div>
                                {errors.yearsInHomeHealth && <p className="text-red-500 text-sm">{errors.yearsInHomeHealth.message}</p>}
                            </div>

                            {/* Specialties */}
                            <div className="flex flex-col gap-2">
                                <label className="text-text-main text-base font-semibold">
                                    Clinical Specialties <span className="text-red-500">*</span>
                                </label>
                                <MultiSelectTagPicker
                                    options={THERAPIST_SPECIALTIES}
                                    selected={specialties}
                                    onAdd={(v) => { setSpecialties((p) => [...p, v]); setSpecialtiesError(""); }}
                                    onRemove={(v) => setSpecialties((p) => p.filter((x) => x !== v))}
                                    placeholder="Add a specialty..."
                                />
                                {specialtiesError && <p className="text-red-500 text-sm">{specialtiesError}</p>}
                            </div>

                            {/* Languages */}
                            <div className="flex flex-col gap-2">
                                <label className="text-text-main text-base font-semibold">
                                    Languages Spoken{" "}
                                    <span className="text-text-muted font-normal text-sm">(optional, multi-select)</span>
                                </label>
                                <MultiSelectTagPicker
                                    options={THERAPIST_LANGUAGES}
                                    selected={languages}
                                    onAdd={(v) => setLanguages((p) => [...p, v])}
                                    onRemove={(v) => setLanguages((p) => p.filter((x) => x !== v))}
                                    placeholder="Add a language..."
                                />
                            </div>

                            {/* Certifications */}
                            <div className="flex flex-col gap-2">
                                <label className="text-text-main text-base font-semibold">
                                    Certifications{" "}
                                    <span className="text-text-muted font-normal text-sm">(optional, multi-select)</span>
                                </label>
                                <MultiSelectTagPicker
                                    options={THERAPIST_CERTIFICATIONS}
                                    selected={certifications}
                                    onAdd={(v) => setCertifications((p) => [...p, v])}
                                    onRemove={(v) => setCertifications((p) => p.filter((x) => x !== v))}
                                    placeholder="Add a certification..."
                                />
                            </div>

                            {/* Past Settings */}
                            <div className="flex flex-col gap-2">
                                <label className="text-text-main text-base font-semibold">
                                    Past Clinical Settings{" "}
                                    <span className="text-text-muted font-normal text-sm">(optional, multi-select)</span>
                                </label>
                                <MultiSelectTagPicker
                                    options={THERAPIST_PAST_SETTINGS}
                                    selected={pastSettings}
                                    onAdd={(v) => setPastSettings((p) => [...p, v])}
                                    onRemove={(v) => setPastSettings((p) => p.filter((x) => x !== v))}
                                    placeholder="Add a setting..."
                                />
                            </div>

                            {/* Population Experience */}
                            <div className="flex flex-col gap-2">
                                <label className="text-text-main text-base font-semibold">
                                    Patient Population Experience{" "}
                                    <span className="text-text-muted font-normal text-sm">(optional, multi-select)</span>
                                </label>
                                <MultiSelectTagPicker
                                    options={THERAPIST_POPULATIONS}
                                    selected={populationExperience}
                                    onAdd={(v) => setPopulationExperience((p) => [...p, v])}
                                    onRemove={(v) => setPopulationExperience((p) => p.filter((x) => x !== v))}
                                    placeholder="Add a population..."
                                />
                            </div>

                            {/* Professional Summary */}
                            <div className="flex flex-col gap-2">
                                <label className="flex justify-between items-center">
                                    <span className="text-text-main text-base font-semibold">
                                        Professional Summary <span className="text-red-500">*</span>
                                    </span>
                                    <span className="text-xs text-gray-400 font-normal">
                                        Min 100 characters ({watch("professionalSummary")?.length || 0}/2000)
                                    </span>
                                </label>
                                <textarea
                                    {...register("professionalSummary")}
                                    className="w-full min-h-36 resize-none rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent p-4 text-base leading-relaxed outline-none placeholder:text-text-muted"
                                    placeholder="Share a brief bio about your therapeutic approach, areas of interest, and why you love what you do..."
                                    maxLength={2000}
                                />
                                {errors.professionalSummary && <p className="text-red-500 text-sm">{errors.professionalSummary.message}</p>}
                            </div>

                            {submitError && <p className="text-red-500 text-sm">{submitError}</p>}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-8 bg-muted-light flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-border-light">
                            <button
                                type="button"
                                onClick={() => router.push("/therapist/onboarding/personal-info")}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-12 text-text-muted font-bold hover:text-text-main transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back
                            </button>

                            <button
                                type="submit"
                                disabled={loading || uploadingPhoto}
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
    );
}

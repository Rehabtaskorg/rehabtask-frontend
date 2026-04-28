"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import useOnboardingStore from "@/store/onboardingStore";
import { onboardingAPI } from "@/lib/onboarding.api";
import OnboardingProgressBar from "@/components/therapist/OnboardingProgressBar";
import { backgroundCheckSchema } from "@/lib/onboardingValidation";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function BackgroundCheckPage() {
    usePageTitle("Background Check");
    const router = useRouter();
    const {
        backgroundCheck,
        updateBackgroundCheck,
        markStepComplete,
        setCurrentStep
    } = useOnboardingStore();

    const [loading, setLoading] = useState(false);

    const {
        handleSubmit,
        control,
        formState: { errors },
        setValue,
        watch,
    } = useForm({
        resolver: zodResolver(backgroundCheckSchema),
        defaultValues: {
            consent: backgroundCheck.consent,
            signature: backgroundCheck.signature || "",
        },
    });

    const consent = watch("consent");
    const signature = watch("signature");

    // Keep RHF synced with persisted store (important for hydration)
    useEffect(() => {
        setValue("consent", backgroundCheck.consent);
        setValue("signature", backgroundCheck.signature || "");
    }, [backgroundCheck, setValue]);

    const onSubmit = async (data) => {
        setLoading(true);

        try {
            await onboardingAPI.submitBackgroundCheck({
                consent: data.consent,
                signature: data.signature,
            });

            // Auto-complete onboarding now that all essential steps (1-4) are done
            // This ensures onboardingComplete:true is set BEFORE reaching the Stripe page
            try {
                await onboardingAPI.completeOnboarding();
                useOnboardingStore.getState().reset();
            } catch (completeErr) {
                // Don't block — Stripe skip and route guard handle this gracefully
                console.warn("Auto-complete onboarding after step 4 failed:", completeErr.message);
            }

            // Update local store
            updateBackgroundCheck({
                consent: data.consent,
                signature: data.signature,
                submittedAt: new Date().toISOString(),
            });

            // Mark step as complete and move to next step
            markStepComplete(4);
            setCurrentStep(5);

            // Navigate to Stripe onboarding
            router.push("/therapist/onboarding/stripe");
        } catch (error) {
            console.error("Failed to submit background check:", error);
            alert(error.message || "Failed to submit background check. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <OnboardingProgressBar />

                <form onSubmit={handleSubmit(onSubmit)}>
                    <header className="mb-8 px-4">
                        <div className="flex items-center gap-3">
                            <h1 className="text-text-main dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                                Safety & Verification
                            </h1>
                            <svg
                                className="w-8 h-8 text-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                            </svg>
                        </div>
                        <p className="text-text-muted dark:text-gray-400 text-lg mt-2">
                            To maintain our community standards and ensure patient safety, we require a
                            professional background screening for all therapists joining the marketplace.
                        </p>
                    </header>

                    <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl overflow-hidden shadow-sm">
                        {/* Scope Section */}
                        <div className="p-6 border-b border-border-light dark:border-border-dark bg-primary/5">
                            <h3 className="text-primary tracking-tight text-xl font-bold leading-tight flex items-center gap-2">
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                Scope of Screening
                            </h3>
                            <p className="text-sm text-text-muted dark:text-gray-400 mt-1">
                                Our comprehensive review covers the following areas:
                            </p>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    {
                                        title: "Criminal History",
                                        desc: "State and National databases search",
                                    },
                                    {
                                        title: "Professional License Standing",
                                        desc: "Board certifications and disciplinary actions",
                                    },
                                    {
                                        title: "Identity Verification",
                                        desc: "Government ID and SSN validation",
                                    },
                                    {
                                        title: "OIG Sanctions List",
                                        desc: "Healthcare exclusion and registry checks",
                                    },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-x-3 py-3 items-start">
                                        <svg
                                            className="w-6 h-6 text-primary shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        <div>
                                            <p className="text-text-main dark:text-white text-base font-medium">
                                                {item.title}
                                            </p>
                                            <p className="text-xs text-text-muted dark:text-gray-400">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Legal Disclosure */}
                            <div className="mt-8 p-4 bg-muted-light dark:bg-muted-dark rounded-lg border border-border-light dark:border-border-dark">
                                <h4 className="text-sm font-bold text-text-muted dark:text-gray-300 mb-2 uppercase tracking-wider">
                                    Disclosure & Fair Credit Reporting Act (FCRA)
                                </h4>
                                <p className="text-xs leading-relaxed text-text-muted dark:text-gray-400">
                                    This background check will be conducted by a third-party screening
                                    provider. By proceeding, you acknowledge that you have read and
                                    understood your rights under the Fair Credit Reporting Act and
                                    authorize RehabTask to obtain a consumer report for
                                    professional vetting purposes. All personal information is encrypted
                                    and handled in strict accordance with HIPAA and privacy guidelines.
                                </p>
                            </div>

                            {/* Consent & Signature */}
                            <div className="mt-8 space-y-6">
                                <Controller
                                    name="consent"
                                    control={control}
                                    render={({ field }) => (
                                        <label className="flex gap-x-3 items-center group cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={field.value}
                                                onChange={(e) => {
                                                    const value = e.target.checked;
                                                    field.onChange(value);
                                                    updateBackgroundCheck({ consent: value });
                                                }}
                                                className="h-6 w-6 rounded border-2 border-border-light dark:border-border-dark bg-transparent text-primary focus:ring-primary focus:ring-offset-0 outline-none transition-all cursor-pointer"
                                            />
                                            <p className="text-text-main dark:text-white text-base font-semibold">
                                                I consent to the background screening and agree to the{" "}
                                                <a href="#" className="text-primary underline">
                                                    Authorization Terms
                                                </a>
                                                .
                                            </p>
                                        </label>
                                    )}
                                />
                                {errors.consent && (
                                    <p className="text-red-500 text-sm">{errors.consent.message}</p>
                                )}

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-text-muted dark:text-gray-300">
                                        Digital Signature (Type your full legal name)
                                    </label>

                                    <Controller
                                        name="signature"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type="text"
                                                onChange={(e) => {
                                                    field.onChange(e.target.value);
                                                    updateBackgroundCheck({
                                                        signature: e.target.value,
                                                    });
                                                }}
                                                className="w-full h-14 px-4 bg-muted-light dark:bg-muted-dark border-2 border-border-light dark:border-border-dark rounded-lg focus:border-primary dark:focus:border-primary outline-none transition-all italic text-xl text-text-muted dark:text-gray-200"
                                                placeholder="Johnathan Doe"
                                            />
                                        )}
                                    />

                                    <p className="text-xs text-text-muted dark:text-gray-400">
                                        By typing your name above, you are providing a legally binding
                                        electronic signature.
                                    </p>

                                    {errors.signature && (
                                        <p className="text-red-500 text-sm">{errors.signature.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-muted-light dark:bg-muted-dark border-t border-border-light dark:border-border-dark flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-400">
                                <svg
                                    className="w-5 h-5 text-green-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                                <span className="text-xs font-medium">
                                    Secure 256-bit Encrypted Session
                                </span>
                            </div>

                            <div className="flex gap-4 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={() => router.push("/therapist/onboarding/availability")}
                                    className="flex-1 sm:flex-none px-6 py-3 rounded-lg font-bold text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white hover:bg-muted-light dark:hover:bg-card-dark transition-colors"
                                >
                                    Back
                                </button>

                                <button
                                    type="submit"
                                    disabled={loading || !consent || !signature}
                                    className="flex-1 sm:flex-none bg-primary hover:brightness-95 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Processing..." : "Submit & Continue"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-8 flex justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {["Verified Provider", "HIPAA Compliant", "SOC2 Certified"].map((badge) => (
                            <div key={badge} className="flex flex-col items-center">
                                <div className="w-24 h-8 bg-gray-300 dark:bg-gray-700 rounded mb-1"></div>
                                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400">
                                    {badge}
                                </span>
                            </div>
                        ))}
                    </div>
                </form>
            </div>
        </div>
    );
}
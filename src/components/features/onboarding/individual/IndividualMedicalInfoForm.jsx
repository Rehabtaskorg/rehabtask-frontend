"use client";

import { useRouter } from "next/navigation";
import { usePageTitle } from "@/hooks/usePageTitle";
import { IndividualOnboardingProgressBar } from "@/components/features/onboarding/individual/IndividualOnboardingProgressBar";
import { DocumentDropzone } from "@/components/features/onboarding/DocumentDropzone";

export function IndividualMedicalInfoForm() {
    usePageTitle("Medical Information");
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background-light py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <IndividualOnboardingProgressBar />

                <header className="mb-8 px-4">
                    <h1 className="text-text-main text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                        Medical Information
                    </h1>
                    <p className="text-text-muted text-lg font-normal leading-normal">
                        Provide your diagnosis and referring provider details.
                    </p>
                </header>

                <div className="bg-card-light border border-border-light rounded-xl overflow-hidden shadow-sm">
                    <div className="p-8 space-y-6">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="primaryDiagnosis" className="text-text-main text-sm font-semibold">
                                Primary Diagnosis <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="primaryDiagnosis"
                                type="text"
                                placeholder="e.g. Lumbar disc herniation"
                                className="w-full px-4 py-3 rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="referringProviderName" className="text-text-main text-sm font-semibold">
                                Referring Provider Name{" "}
                                <span className="text-text-muted font-normal text-sm">(optional)</span>
                            </label>
                            <input
                                id="referringProviderName"
                                type="text"
                                placeholder="e.g. Dr. Jane Smith"
                                className="w-full px-4 py-3 rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                            />
                        </div>

                        <DocumentDropzone
                            label="Prescription / Therapy Order"
                            required={false}
                            helperText="Upload if required by your state (PDF, JPG or PNG, max 25MB)"
                            document={null}
                            uploading={false}
                            onDrop={() => { }}
                            onRemove={() => { }}
                        />
                    </div>

                    <div className="p-8 bg-muted-light flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-border-light">
                        <button
                            type="button"
                            onClick={() => router.push("/customer/onboarding/individual/personal-info")}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-12 text-text-muted font-bold hover:text-text-main transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push("/customer/onboarding/individual/consent-forms")}
                            className="w-full sm:w-auto px-10 h-12 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:brightness-95 transition-all flex items-center justify-center gap-2"
                        >
                            Save & Continue
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
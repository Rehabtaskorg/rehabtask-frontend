"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import { useInsuranceUploadsForm } from "@/hooks/useInsuranceUploadsForm";
import OnboardingProgressBar from "@/components/therapist/OnboardingProgressBar";
import { DocumentDropzone } from "@/components/features/onboarding/DocumentDropzone";

/**
 * Insurance documentation form — onboarding Step 5.
 * General Liability and Professional Liability are always required.
 * Auto Insurance becomes required only when the therapist indicates they
 * perform home visits.
 */
export function InsuranceUploadsForm() {
    usePageTitle("Insurance Documentation");
    const {
        insurance,
        loading,
        uploadingType,
        error,
        getDocument,
        handleToggleHomeVisits,
        handleDrop,
        handleRemove,
        onSubmit,
        goBack,
    } = useInsuranceUploadsForm();

    return (
        <div className="min-h-screen bg-background-light py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <OnboardingProgressBar />

                <header className="mb-8 px-4">
                    <h1 className="text-text-main text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                        Insurance Documentation
                    </h1>
                    <p className="text-text-muted text-lg font-normal leading-normal">
                        We require proof of liability insurance to protect you and your patients during home visits.
                    </p>
                </header>

                <form onSubmit={onSubmit}>
                    <div className="bg-card-light border border-border-light rounded-xl p-8 space-y-6 shadow-sm">

                        <div className="flex flex-col gap-2">
                            <label className="text-text-main text-sm font-semibold">
                                Do you perform home visits?
                            </label>
                            <p className="text-xs text-text-muted">
                                This determines whether auto insurance documentation is required.
                            </p>
                            <label className="relative inline-flex items-center cursor-pointer mt-1 w-fit">
                                <input
                                    type="checkbox"
                                    checked={insurance.doesHomeVisits}
                                    onChange={handleToggleHomeVisits}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                            </label>
                        </div>

                        <DocumentDropzone
                            label="General Liability Insurance Certificate"
                            required
                            helperText="Proof of general liability coverage. Required for all therapists."
                            document={getDocument("general_liability")}
                            uploading={uploadingType === "general_liability"}
                            onDrop={handleDrop("general_liability")}
                            onRemove={handleRemove("general_liability")}
                        />

                        <DocumentDropzone
                            label="Professional Liability Insurance Certificate"
                            required
                            helperText="Also known as malpractice insurance. Required for all therapists."
                            document={getDocument("professional_liability")}
                            uploading={uploadingType === "professional_liability"}
                            onDrop={handleDrop("professional_liability")}
                            onRemove={handleRemove("professional_liability")}
                        />

                        {insurance.doesHomeVisits && (
                            <DocumentDropzone
                                label="Auto Insurance Certificate"
                                required
                                helperText="Required because you indicated you perform home visits."
                                document={getDocument("auto_insurance")}
                                uploading={uploadingType === "auto_insurance"}
                                onDrop={handleDrop("auto_insurance")}
                                onRemove={handleRemove("auto_insurance")}
                            />
                        )}

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <div className="flex items-center justify-between pt-6 border-t border-border-light">
                            <button
                                type="button"
                                onClick={goBack}
                                className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border-light text-text-main font-semibold hover:bg-muted-light transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back
                            </button>

                            <button
                                type="submit"
                                disabled={loading || !!uploadingType}
                                className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:brightness-95 transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Saving..." : "Continue to Identity Verification"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

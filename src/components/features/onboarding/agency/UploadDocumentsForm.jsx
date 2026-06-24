"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import { useAgencyUploadDocumentsForm } from "@/hooks/useAgencyUploadDocumentsForm";
import { DocumentDropzone } from "@/components/features/onboarding/DocumentDropzone";
import { AgencyOnboardingProgressBar } from "@/components/features/onboarding/agency/AgencyOnboardingProgressBar";

const DOCUMENTS = [
    { key: "home_health_license", label: "State Home Health License", required: true },
    { key: "medicare_medicaid_cert", label: "Medicare / Medicaid Certification", required: false },
    { key: "general_liability", label: "General Liability Insurance", required: true },
    { key: "professional_liability", label: "Professional Liability Insurance", required: true },
];

/**
 * Agency onboarding Step 3 — Upload Required Documents.
 * Uploads fire on drop (not on submit). Submit reconciles and advances onboardingStep.
 */
export function UploadDocumentsForm() {
    usePageTitle("Upload Documents");
    const {
        loading,
        uploadingType,
        error,
        getDocument,
        handleDrop,
        handleRemove,
        onSubmit,
        goBack,
    } = useAgencyUploadDocumentsForm();

    return (
        <div className="min-h-screen bg-background-light py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <AgencyOnboardingProgressBar />
                <header className="mb-8 px-4">
                    <h1 className="text-text-main text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                        Upload Required Documents
                    </h1>
                    <p className="text-text-muted text-lg font-normal leading-normal">
                        Upload the documents required to verify your agency and maintain compliance standards.
                    </p>
                </header>

                <form onSubmit={onSubmit}>
                    <div className="bg-card-light border border-border-light rounded-xl overflow-hidden shadow-sm">
                        <div className="divide-y divide-border-light">
                            {DOCUMENTS.map(({ key, label, required }) => (
                                <div key={key} className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-text-main font-semibold text-base">{label}</span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${required ? "bg-primary text-white" : "bg-gray-100 text-text-muted"}`}>
                                            {required ? "REQUIRED" : "OPTIONAL"}
                                        </span>
                                    </div>
                                    <DocumentDropzone
                                        label=""
                                        required={required}
                                        document={getDocument(key)}
                                        uploading={uploadingType === key}
                                        onDrop={handleDrop(key)}
                                        onRemove={handleRemove(key)}
                                    />
                                </div>
                            ))}
                        </div>

                        {error && (
                            <div className="px-8 pt-0 pb-4">
                                <p className="text-red-500 text-sm">{error}</p>
                            </div>
                        )}

                        <div className="p-8 bg-muted-light flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-border-light">
                            <button
                                type="button"
                                onClick={goBack}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-12 text-text-muted font-bold hover:text-text-main transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !!uploadingType}
                                className="w-full sm:w-auto px-10 h-12 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:brightness-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Saving..." : (
                                    <>
                                        Next
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import { useIdentityVerificationForm } from "@/hooks/useIdentityVerificationForm";
import OnboardingProgressBar from "@/components/therapist/OnboardingProgressBar";
import { DocumentDropzone } from "@/components/features/onboarding/DocumentDropzone";

/**
 * Identity verification form — onboarding Step 6.
 * Government ID front is required; back is optional (not applicable for passports).
 * Storage only — no OCR or automated verification.
 */
export function IdentityVerificationForm() {
    usePageTitle("Identity Verification");
    const {
        loading,
        initializing,
        uploadingType,
        error,
        getDocument,
        handleDrop,
        handleRemove,
        onSubmit,
        goBack,
    } = useIdentityVerificationForm();

    if (initializing) {
        return (
            <div className="min-h-screen bg-background-light py-10 px-4">
                <div className="max-w-4xl mx-auto">
                    <OnboardingProgressBar />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <OnboardingProgressBar />

                <header className="mb-8 px-4">
                    <h1 className="text-text-main text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                        Identity Verification
                    </h1>
                    <p className="text-text-muted text-lg font-normal leading-normal">
                        Upload a government-issued photo ID. We use this to confirm your identity.
                    </p>
                </header>

                <form onSubmit={onSubmit}>
                    <div className="bg-card-light border border-border-light rounded-xl p-8 space-y-6 shadow-sm">

                        <DocumentDropzone
                            label="Government ID — Front"
                            required
                            helperText="Driver's license or passport"
                            document={getDocument("government_id_front")}
                            uploading={uploadingType === "government_id_front"}
                            onDrop={handleDrop("government_id_front")}
                            onRemove={handleRemove("government_id_front")}
                        />

                        <DocumentDropzone
                            label="Government ID — Back (optional)"
                            helperText="Not applicable for passports"
                            document={getDocument("government_id_back")}
                            uploading={uploadingType === "government_id_back"}
                            onDrop={handleDrop("government_id_back")}
                            onRemove={handleRemove("government_id_back")}
                        />

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <p className="text-text-muted text-xs text-center pt-2">
                            Your ID is stored securely and only used for identity verification.
                        </p>

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
                                {loading ? "Saving..." : "Save & Continue"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

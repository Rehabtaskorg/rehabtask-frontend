"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import { MdVerifiedUser } from "react-icons/md";

import useOnboardingStore from "@/stores/onboardingStore";
import { hipaaSchema } from "@/lib/validators/onboarding.schema";
import { onboardingAPI } from "@/services/onboarding.api";
import OnboardingProgressBar from "@/components/therapist/OnboardingProgressBar";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useOnboardingDataSync } from "@/hooks/useOnboardingDataSync";
import { usePageTitle } from "@/hooks/usePageTitle";

/**
 * HIPAA Attestation form — onboarding Step 6 (compliance sub-step).
 * Required attestation checkbox + optional HIPAA training certificate upload.
 */
export function HipaaAttestationForm() {
    usePageTitle("HIPAA Compliance");
    const router = useRouter();
    const { trackEvent } = useAnalytics();
    const { syncData } = useOnboardingDataSync();
    const { hipaa, updateHipaa } = useOnboardingStore();

    const [loading, setLoading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [uploading, setUploading] = useState(false);
    const [certDoc, setCertDoc] = useState(hipaa.document || null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(hipaaSchema),
        defaultValues: { attested: hipaa.attested || false },
    });

    useEffect(() => {
        trackEvent("onboarding_step_viewed", { step: 6, step_name: "hipaa" });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        syncData().then((data) => {
            if (!data?.hipaa) return;
            reset({ attested: data.hipaa.attested || false });
            setCertDoc(data.hipaa.document || null);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCertDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;
        setUploadError("");

        if (file.size > 25 * 1024 * 1024) { setUploadError("File too large. Maximum size is 25MB."); return; }
        const allowed = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
        if (!allowed.includes(file.type)) { setUploadError("Invalid file type. Only PDF, JPEG, and PNG are allowed."); return; }

        setUploading(true);
        try {
            const result = await onboardingAPI.uploadDocument(file, "compliance", "hipaa_certificate");
            const doc = {
                id: result.id,
                path: result.path,
                fileName: result.fileName,
                fileSize: result.fileSize,
                documentType: result.documentType,
                mimeType: result.mimeType,
            };
            setCertDoc(doc);
            updateHipaa({ document: doc });
        } catch (err) {
            setUploadError(`Failed to upload: ${err.message}`);
        } finally {
            setUploading(false);
        }
    }, [updateHipaa]);

    const handleRemoveCert = async () => {
        setUploadError("");
        if (certDoc?.id) {
            try {
                await onboardingAPI.deleteDocument(certDoc.id);
            } catch {
                setUploadError(`Could not delete ${certDoc.fileName}. Please try again.`);
                return;
            }
        }
        setCertDoc(null);
        updateHipaa({ document: null });
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: handleCertDrop,
        onDropRejected: () => setUploadError("Invalid file type. Only PDF, JPEG, and PNG files are allowed."),
        accept: { "application/pdf": [".pdf"], "image/*": [".jpeg", ".jpg", ".png"] },
        multiple: false,
        maxFiles: 1,
        disabled: !!certDoc || uploading,
    });

    const onSubmit = async (data) => {
        setLoading(true);
        setUploadError("");
        try {
            await onboardingAPI.saveHipaaAttestation({
                attested: data.attested,
                ...(certDoc && {
                    document: {
                        path: certDoc.path,
                        fileName: certDoc.fileName,
                        fileSize: certDoc.fileSize,
                        documentType: certDoc.documentType,
                        mimeType: certDoc.mimeType,
                    },
                }),
            });

            updateHipaa({ attested: true, document: certDoc });
            trackEvent("onboarding_step_completed", { step: 6, step_name: "hipaa" });
            router.push("/therapist/onboarding/background-check");
        } catch (err) {
            setUploadError(err.response?.data?.message || err.message || "Failed to save. Please try again.");
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
                        HIPAA Compliance
                    </h1>
                    <p className="text-text-muted text-lg font-normal leading-normal">
                        Confirm your HIPAA training and optionally upload your training certificate.
                    </p>
                </header>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="bg-card-light border border-border-light rounded-xl overflow-hidden shadow-sm">
                        <div className="p-8 space-y-8">

                            {/* Attestation Checkbox */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-start gap-4 p-6 rounded-xl border border-primary/20 bg-primary/5">
                                    <MdVerifiedUser className="text-primary text-3xl shrink-0 mt-0.5" />
                                    <div className="flex flex-col gap-3 flex-1">
                                        <p className="text-text-main text-sm font-medium leading-relaxed">
                                            I confirm that I have completed HIPAA training and understand my obligations
                                            regarding the privacy and security of protected health information (PHI).
                                            I agree to handle all patient information in accordance with HIPAA regulations.
                                        </p>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                {...register("attested")}
                                                className="w-5 h-5 rounded border-border-light text-primary focus:ring-primary focus:ring-2"
                                            />
                                            <span className="text-text-main text-sm font-semibold">
                                                I confirm I have completed HIPAA training <span className="text-red-500">*</span>
                                            </span>
                                        </label>
                                        {errors.attested && <p className="text-red-500 text-sm">{errors.attested.message}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Certificate Upload */}
                            <div className="flex flex-col gap-3">
                                <label className="text-text-main text-base font-semibold">
                                    HIPAA Training Certificate{" "}
                                    <span className="text-text-muted font-normal text-sm">(optional)</span>
                                </label>
                                <p className="text-xs text-text-muted">
                                    Upload your HIPAA training completion certificate if you have one. PDF, JPG or PNG (max. 25MB).
                                </p>

                                {certDoc ? (
                                    <div className="flex items-center justify-between bg-muted-light p-3 rounded-lg border border-border-light">
                                        <div className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span className="text-text-main text-sm truncate">{certDoc.fileName}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveCert}
                                            className="text-red-500 hover:text-red-600 font-semibold text-sm shrink-0 ml-4"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        {...getRootProps()}
                                        className={`border-2 border-dashed border-border-light rounded-xl p-8 flex flex-col items-center justify-center bg-muted-light transition-colors ${uploading ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/5 hover:border-primary cursor-pointer group"}`}
                                    >
                                        <input {...getInputProps()} />
                                        {uploading ? (
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                                                <p className="text-text-main text-sm font-medium">Uploading certificate...</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                    </svg>
                                                </div>
                                                <p className="text-text-main text-sm font-medium text-center">
                                                    {isDragActive ? "Drop certificate here..." : "Click to upload or drag and drop"}
                                                </p>
                                                <p className="text-text-muted text-xs mt-1 text-center">PDF, JPG or PNG (max. 25MB)</p>
                                            </>
                                        )}
                                    </div>
                                )}

                                {uploadError && <p className="text-red-500 text-sm">{uploadError}</p>}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-8 bg-muted-light flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-border-light">
                            <button
                                type="button"
                                onClick={() => router.push("/therapist/onboarding/identity")}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-12 text-text-muted font-bold hover:text-text-main transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back
                            </button>

                            <button
                                type="submit"
                                disabled={loading || uploading}
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

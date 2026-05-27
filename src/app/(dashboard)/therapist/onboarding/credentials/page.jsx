"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import { z } from "zod";

import useOnboardingStore from "@/store/onboardingStore";
import { credentialsSchema } from "@/lib/onboardingValidation";
import { onboardingAPI } from "@/lib/onboarding.api";
import OnboardingProgressBar from "@/components/therapist/OnboardingProgressBar";
import { US_STATES } from "@/lib/constants/credentials";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function CredentialsPage() {
    usePageTitle("Add Credentials");
    const router = useRouter();
    const { trackEvent } = useAnalytics();
    const { user, loading: authLoading } = useAuth();
    const { credentials, updateCredentials, addLicenseDocument, removeLicenseDocument, markStepComplete, setCurrentStep } = useOnboardingStore();

    useEffect(() => {
        trackEvent("onboarding_step_viewed", { step: 2, step_name: "credentials" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [loading, setLoading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [uploading, setUploading] = useState(false);

    const uploadedDocs = credentials.licenseDocuments;

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(
            credentialsSchema
                .omit({ licenseDocuments: true })
                .extend({
                    ratePerVisit: z.coerce.number().min(0).max(10000).optional().nullable().transform(val => val === 0 ? null : val),
                    attemptedVisitRate: z.preprocess(
                        (val) => (val === "" || val === undefined ? null : val),
                        z.coerce.number().min(0).max(10000).nullable(),
                    ),
                })
                .refine(
                    (data) => {
                        if (data.attemptedVisitRate == null || data.ratePerVisit == null) return true;
                        return data.attemptedVisitRate <= data.ratePerVisit;
                    },
                    {
                        message: "Cannot be greater than your session rate",
                        path: ["attemptedVisitRate"],
                    }
                )
        ),
        defaultValues: {
            licenseNumber: credentials.licenseNumber,
            licenseState: credentials.licenseState,
            ratePerVisit: "",
            attemptedVisitRate: "",
        },
    });

    const onSubmit = async (data) => {
        setLoading(true);
        setUploadError("");

        try {
            if (credentials.licenseDocuments.length === 0) {
                setUploadError("Please upload at least one license document");
                return;
            }

            // Call backend API to save credentials
            const payload = {
                licenseNumber: data.licenseNumber,
                licenseState: data.licenseState,
                ...(data.ratePerVisit != null && data.ratePerVisit !== "" && { ratePerVisit: data.ratePerVisit }),
                ...(data.attemptedVisitRate != null && { attemptedVisitRate: data.attemptedVisitRate }),
                licenseDocuments: credentials.licenseDocuments.map(doc => ({
                    path: doc.path,
                    fileName: doc.fileName,
                    fileSize: doc.fileSize,
                    documentType: doc.documentType,
                    mimeType: doc.mimeType,
                })),
            };
            await onboardingAPI.saveCredentials(payload);

            // Update local store
            updateCredentials({
                licenseNumber: data.licenseNumber,
                licenseState: data.licenseState,
            });

            trackEvent("onboarding_step_completed", { step: 2, step_name: "credentials" });
            markStepComplete(2);
            setCurrentStep(3);
            router.push("/therapist/onboarding/availability");
        } catch (error) {
            console.error("Failed to save credentials:", error);
            setUploadError(error.response?.data?.message || "Failed to save credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const onDrop = useCallback(
        async (acceptedFiles) => {
            setUploadError("");

            const totalCount = uploadedDocs.length + acceptedFiles.length;

            if (totalCount > 5) {
                setUploadError(`You can only upload a maximum of 5 documents. You currently have ${uploadedDocs.length} document(s).`);
                return;
            }

            if (!user) {
                setUploadError("User not authenticated. Please log in again.");
                return;
            }

            setUploading(true);

            try {
                for (const file of acceptedFiles) {
                    if (file.size > 25 * 1024 * 1024) {
                        setUploadError(`${file.name} is too large. Maximum size is 25MB.`);
                        continue;
                    }

                    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
                    if (!allowedTypes.includes(file.type)) {
                        setUploadError(`${file.name} has invalid type. Only PDF, JPEG, and PNG are allowed.`);
                        continue;
                    }

                    try {
                        const result = await onboardingAPI.uploadLicenseDocument(file, "license");

                        // Add to store
                        addLicenseDocument({
                            id: result.id,
                            path: result.path,
                            fileName: result.fileName,
                            fileSize: result.fileSize,
                            documentType: result.documentType,
                            mimeType: result.mimeType,
                        });
                    } catch (error) {
                        console.error(`Failed to upload ${file.name}:`, error);
                        setUploadError(`Failed to upload ${file.name}. ${error.message}`);
                    }
                }
            } finally {
                setUploading(false);
            }
        },
        [uploadedDocs.length, user, addLicenseDocument]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        onDropRejected: (rejections) => {
            const rejection = rejections[0];
            if (rejection?.errors[0]?.code === "file-invalid-type") {
                setUploadError("Invalid file type. Only PDF, JPEG, and PNG files are allowed.");
            } else if (rejection?.errors[0]?.code === "too-many-files") {
                setUploadError("Too many files. Maximum 5 documents allowed.");
            } else {
                setUploadError("File rejected. Please check the file type and try again.");
            }
        },
        accept: {
            "application/pdf": [".pdf"],
            "image/*": [".jpeg", ".jpg", ".png"],
        },
        multiple: true,
        maxFiles: 5,
        disabled: uploadedDocs.length >= 5 || uploading || authLoading,
    });


    const handleRemoveDocument = async (index) => {
        setUploadError("");
        const doc = uploadedDocs[index];
        if (doc?.id) {
            try {
                await onboardingAPI.deleteDocument(doc.id);
            } catch (error) {
                console.error("Failed to delete document:", error);
            }
        }
        removeLicenseDocument(index);
    };

    return (
        <div className="min-h-screen bg-background-light  py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <OnboardingProgressBar />

                <header className="mb-8 px-4">
                    <h1 className="text-text-main  text-[28px] font-bold leading-tight tracking-light mb-2">
                        Verify Your Professional Status
                    </h1>
                    <p className="text-text-muted  text-base font-normal leading-normal">
                        To ensure patient safety, we verify all licenses with state boards. This
                        process usually takes 24-48 hours.
                    </p>
                </header>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="bg-card-light  border border-border-light  rounded-xl p-8 space-y-6 shadow-sm">
                        {/* License Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-text-main  text-sm font-semibold">
                                    License Number
                                </label>
                                <input
                                    type="text"
                                    {...register("licenseNumber")}
                                    className="w-full px-4 py-3 h-12 rounded-lg border border-border-light  bg-input-light  text-text-main  focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder="e.g. 123456789"
                                />
                                {errors.licenseNumber && (
                                    <p className="text-red-500 text-sm">
                                        {errors.licenseNumber.message}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-text-main  text-sm font-semibold">
                                    State of Licensure
                                </label>
                                <select
                                    {...register("licenseState")}
                                    className="w-full px-4 py-3 h-12 rounded-lg border border-border-light  bg-input-light  text-text-main  focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                >
                                    <option value="">Select State</option>
                                    {US_STATES.map((state) => (
                                        <option key={state.code} value={state.code}>
                                            {state.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.licenseState && (
                                    <p className="text-red-500 text-sm">
                                        {errors.licenseState.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Rate per Visit */}
                        <div className="flex flex-col gap-2 mt-4">
                            <label className="text-text-main  text-sm font-semibold">
                                Rate per Visit ($) <span className="text-gray-400 font-normal ml-1">(optional)</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="10000"
                                step="0.01"
                                {...register("ratePerVisit")}
                                className="w-full px-4 py-3 h-12 rounded-lg border border-border-light  bg-input-light  text-text-main  focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all md:w-1/2"
                                placeholder="e.g. 85.00"
                            />
                            <p className="text-xs text-text-muted">Your standard rate per session. This will pre-fill your offers and show on your profile. You can adjust per offer.</p>
                        </div>

                        {/* Attempted Visit Rate */}
                        <div className="flex flex-col gap-2 mt-4">
                            <label className="text-text-main  text-sm font-semibold">
                                Attempted Visit Rate ($) <span className="text-gray-400 font-normal ml-1">(optional)</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="10000"
                                step="0.01"
                                {...register("attemptedVisitRate")}
                                className="w-full px-4 py-3 h-12 rounded-lg border border-border-light  bg-input-light  text-text-main  focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all md:w-1/2"
                                placeholder="e.g. 40.00"
                            />
                            {errors.attemptedVisitRate && (
                                <p className="text-red-500 text-sm">{errors.attemptedVisitRate.message}</p>
                            )}
                            <p className="text-xs text-text-muted">
                                Charged when you arrive but the patient isn&apos;t home. Must be less than or equal to your session rate. Leave blank if you won&apos;t charge for no-shows. You can change this later.
                            </p>
                        </div>

                        {/* File Upload */}
                        <div className="flex flex-col gap-2 mt-4">
                            <label className="text-text-main  text-sm font-semibold">
                                Professional License Certificate
                                <span className="text-gray-400 font-normal ml-2">
                                    ({uploadedDocs.length}/5)
                                </span>
                            </label>

                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed border-border-light  rounded-xl p-10 flex flex-col items-center justify-center bg-muted-light  transition-colors ${uploadedDocs.length >= 5 || uploading
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-primary/5 hover:border-primary cursor-pointer group"
                                    }`}
                            >
                                <input {...getInputProps()} />

                                {uploading ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                        <p className="text-text-main  text-base font-medium">
                                            Uploading documents...
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
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
                                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                />
                                            </svg>
                                        </div>

                                        <p className="text-text-main  text-base font-medium text-center">
                                            {uploadedDocs.length >= 5
                                                ? "Maximum 5 documents uploaded"
                                                : isDragActive
                                                    ? "Drop files here..."
                                                    : "Click to upload or drag and drop"}
                                        </p>

                                        <p className="text-text-muted  text-sm mt-1 text-center">
                                            PDF, JPG or PNG (max. 10MB each)
                                        </p>
                                    </>
                                )}
                            </div>

                            {uploadError && (
                                <p className="text-red-500 text-sm">{uploadError}</p>
                            )}

                            {uploadedDocs.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {uploadedDocs.map((doc, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between bg-muted-light  p-3 rounded-lg border border-border-light "
                                        >
                                            <div className="flex items-center gap-3">
                                                <svg
                                                    className="w-5 h-5 text-primary"
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
                                                <span className="text-text-main  text-sm">
                                                    {doc.fileName}
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveDocument(index)}
                                                className="text-red-500 hover:text-red-600   font-semibold text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-10 pt-6 border-t border-border-light ">
                            <button
                                type="button"
                                onClick={() => router.push("/therapist/onboarding/profile")}
                                className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border-light  text-text-main  font-semibold hover:bg-muted-light  transition-colors"
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
                                disabled={loading || uploading}
                                className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:brightness-95 transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Saving..." : "Continue to Availability"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
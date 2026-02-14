"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";

import useOnboardingStore from "@/store/onboardingStore";
import { useAuth } from "@/hooks/useAuth";
import { credentialsSchema } from "@/lib/onboardingValidation";
import { onboardingAPI } from "@/lib/onboarding.api";
import OnboardingProgressBar from "@/components/therapist/OnboardingProgressBar";
import { US_STATES } from "@/lib/constants/credentials";


export default function CredentialsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { credentials, updateCredentials, addLicenseDocument, removeLicenseDocument, markStepComplete, setCurrentStep } = useOnboardingStore();

    const [loading, setLoading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [uploading, setUploading] = useState(false);

    const uploadedDocs = credentials.licenseDocuments;

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(credentialsSchema.omit({ licenseDocuments: true })),
        defaultValues: {
            licenseNumber: credentials.licenseNumber,
            licenseState: credentials.licenseState,
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
            await onboardingAPI.saveCredentials({
                licenseNumber: data.licenseNumber,
                licenseState: data.licenseState,
                licenseDocuments: credentials.licenseDocuments.map(doc => ({
                    path: doc.path,
                    fileName: doc.fileName,
                    fileSize: doc.fileSize,
                    documentType: doc.documentType,
                    mimeType: doc.mimeType,
                })),
            });

            // Update local store
            updateCredentials({
                licenseNumber: data.licenseNumber,
                licenseState: data.licenseState,
            });

            markStepComplete(2);
            setCurrentStep(3);

            router.push("/therapist/onboarding/availability");
        } catch (error) {
            console.error("Failed to save credentials:", error);
            setUploadError(error.message || "Failed to save credentials. Please try again.");
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

            const userId = user?.id;
            if (!userId) {
                setUploadError("User not authenticated");
                return;
            }

            setUploading(true);

            try {
                for (const file of acceptedFiles) {
                    if (file.size > 10 * 1024 * 1024) {
                        setUploadError(`${file.name} is too large. Maximum size is 10MB.`);
                        continue;
                    }

                    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

                    if (!allowedTypes.includes(file.type)) {
                        setUploadError(`${file.name} has invalid type. Only PDF, JPEG, and PNG are allowed.`);
                        continue;
                    }

                    try {
                        const result = await onboardingAPI.uploadLicenseDocument(
                            file, userId || "temp"
                        );

                        // Add to store
                        addLicenseDocument({
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
        [uploadedDocs, addLicenseDocument, user]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "image/*": [".jpeg", ".jpg", ".png"],
        },
        multiple: true,
        maxFiles: 5,
        disabled: uploadedDocs.length >= 5 || uploading || loading || !user,
    });


    const handleRemoveDocument = (index) => {
        setUploadError("");
        removeLicenseDocument(index);
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <OnboardingProgressBar />

                <header className="mb-8 px-4">
                    <h1 className="text-text-main dark:text-white text-[28px] font-bold leading-tight tracking-light mb-2">
                        Verify Your Professional Status
                    </h1>
                    <p className="text-text-muted dark:text-gray-400 text-base font-normal leading-normal">
                        To ensure patient safety, we verify all licenses with state boards. This
                        process usually takes 24-48 hours.
                    </p>
                </header>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-8 space-y-6 shadow-sm">
                        {/* License Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-text-main dark:text-white text-sm font-semibold">
                                    License Number
                                </label>
                                <input
                                    type="text"
                                    {...register("licenseNumber")}
                                    className="w-full px-4 py-3 h-12 rounded-lg border border-border-light dark:border-border-dark bg-input-light dark:bg-input-dark text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder="e.g. 123456789"
                                />
                                {errors.licenseNumber && (
                                    <p className="text-red-500 text-sm">
                                        {errors.licenseNumber.message}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-text-main dark:text-white text-sm font-semibold">
                                    State of Licensure
                                </label>
                                <select
                                    {...register("licenseState")}
                                    className="w-full px-4 py-3 h-12 rounded-lg border border-border-light dark:border-border-dark bg-input-light dark:bg-input-dark text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
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

                        {/* File Upload */}
                        <div className="flex flex-col gap-2 mt-4">
                            <label className="text-text-main dark:text-white text-sm font-semibold">
                                Professional License Certificate
                                <span className="text-gray-400 font-normal ml-2">
                                    ({uploadedDocs.length}/5)
                                </span>
                            </label>

                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed border-border-light dark:border-border-dark rounded-xl p-10 flex flex-col items-center justify-center bg-muted-light dark:bg-muted-dark transition-colors ${uploadedDocs.length >= 5 || uploading
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-primary/5 hover:border-primary cursor-pointer group"
                                    }`}
                            >
                                <input {...getInputProps()} />

                                {uploading ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                        <p className="text-text-main dark:text-white text-base font-medium">
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

                                        <p className="text-text-main dark:text-white text-base font-medium text-center">
                                            {uploadedDocs.length >= 5
                                                ? "Maximum 5 documents uploaded"
                                                : isDragActive
                                                    ? "Drop files here..."
                                                    : "Click to upload or drag and drop"}
                                        </p>

                                        <p className="text-text-muted dark:text-gray-400 text-sm mt-1 text-center">
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
                                            className="flex items-center justify-between bg-muted-light dark:bg-muted-dark p-3 rounded-lg border border-border-light dark:border-border-dark"
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
                                                <span className="text-text-main dark:text-white text-sm">
                                                    {doc.fileName}
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveDocument(index)}
                                                className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-semibold text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-10 pt-6 border-t border-border-light dark:border-border-dark">
                            <button
                                type="button"
                                onClick={() => router.push("/therapist/onboarding/profile")}
                                className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border-light dark:border-border-dark text-text-main dark:text-white font-semibold hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
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
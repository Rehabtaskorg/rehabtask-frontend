"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";

import useOnboardingStore from "@/store/onboardingStore";
import { credentialsSchema } from "@/lib/onboardingValidation";
import OnboardingProgressBar from "@/components/therapist/OnboardingProgressBar";
import { US_STATES } from "@/lib/constants/credentials";


export default function CredentialsPage() {
    const router = useRouter();
    const { credentials, updateCredentials, addLicenseDocument, removeLicenseDocument, markStepComplete, setCurrentStep } = useOnboardingStore();

    const [loading, setLoading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [validationError, setValidationError] = useState("");

    const uploadedDocs = credentials.licenseDocuments;

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(credentialsSchema.omit({ licenseDocuments: true })),
        defaultValues: {
            licenseNumber: credentials.licenseNumber,
            licenseState: credentials.licenseState,
        },
    });

    const onSubmit = (data) => {
        setLoading(true);
        setValidationError("");

        try {
            const fullData = {
                ...data,
                licenseDocuments: credentials.licenseDocuments
            };

            // Validate the complete data
            const parsed = credentialsSchema.safeParse(fullData);

            if (!parsed.success) {
                const docError = parsed.error?.issues?.find((issue) =>
                    issue.path.includes("licenseDocuments")
                );

                if (docError) {
                    setValidationError(docError.message);
                }

                return;
            }

            updateCredentials(fullData);
            markStepComplete(2);
            setCurrentStep(3);
            router.push("/therapist/onboarding/availability");
        } finally {
            setLoading(false);
        }
    }

    const onDrop = useCallback(
        (acceptedFiles) => {
            setUploadError("");
            setValidationError("");

            const totalCount = uploadedDocs.length + acceptedFiles.length;

            if (totalCount > 5) {
                setUploadError(`You can only upload a maximum of 5 documents. You currently have ${uploadedDocs.length} document(s).`);
                return;
            }

            const newDocs = acceptedFiles.map(file => ({
                url: URL.createObjectURL(file),
                fileName: file.name,
                fileSize: file.size,
                documentType: "license"
            }));

            newDocs.forEach(addLicenseDocument);
        },
        [uploadedDocs, addLicenseDocument]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "image/*": [".jpeg", ".jpg", ".png"],
        },
        multiple: true,
        maxFiles: 5,
        disabled: uploadedDocs.length >= 5,
    });


    const handleRemoveDocument = (index) => {
        setUploadError("");
        setValidationError("");

        const doc = uploadedDocs[index];
        if (doc?.url) {
            URL.revokeObjectURL(doc.url);
        }

        removeLicenseDocument(index);
    };

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            uploadedDocs.forEach((doc) => {
                if (doc?.url) {
                    URL.revokeObjectURL(doc.url);
                }
            });
        };
    }, [uploadedDocs]);

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <OnboardingProgressBar />

                <header className="mb-8 px-4">
                    <h1 className="text-text-main dark:text-white text-[28px] font-bold leading-tight tracking-light mb-2">
                        Verify Your Professional Status
                    </h1>
                    <p className="text-text-muted dark:text-gray-400 text-base font-normal leading-normal">
                        To ensure patient safety, we verify all licenses with state boards. This process usually takes 24-48 hours.
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
                                className={`border-2 border-dashed border-border-light dark:border-border-dark rounded-xl p-10 flex flex-col items-center justify-center bg-muted-light dark:bg-muted-dark transition-colors ${uploadedDocs.length >= 5
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-primary/5 hover:border-primary cursor-pointer group"
                                    }`}
                            >
                                <input {...getInputProps()} />

                                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
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
                            </div>

                            {uploadError && (
                                <p className="text-red-500 text-sm">{uploadError}</p>
                            )}

                            {validationError && (
                                <p className="text-red-500 text-sm">{validationError}</p>
                            )}

                            {uploadedDocs.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {uploadedDocs.map((doc, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between bg-muted-light dark:bg-muted-dark p-3 rounded-lg border border-border-light dark:border-border-dark"
                                        >
                                            <span className="text-text-main dark:text-white text-sm">
                                                {doc.fileName}
                                            </span>

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
                                onClick={() =>
                                    router.push("/therapist/onboarding/profile")
                                }
                                className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border-light dark:border-border-dark text-text-main dark:text-white font-semibold hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
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
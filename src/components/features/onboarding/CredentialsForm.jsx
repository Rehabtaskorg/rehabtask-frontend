"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import { z } from "zod";
import { MdInfoOutline, MdClose } from "react-icons/md";

import useOnboardingStore from "@/stores/onboardingStore";
import { credentialsSchema } from "@/lib/validators/onboarding.schema";
import { onboardingAPI } from "@/services/onboarding.api";
import OnboardingProgressBar from "@/components/therapist/OnboardingProgressBar";
import { US_STATES } from "@/lib/constants/credentials";
import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useOnboardingDataSync } from "@/hooks/useOnboardingDataSync";
import { usePageTitle } from "@/hooks/usePageTitle";

/** States available for additional license selection, excludes already-selected ones. */
const getAvailableStates = (selectedCodes, primaryState) =>
    US_STATES.filter(
        (s) => s.code !== primaryState && !selectedCodes.includes(s.code)
    );

/**
 * Credentials form — onboarding Step 3.
 * Collects license number, primary state, NPI (optional), additional license
 * states (optional multi-select tags), rates, and license document uploads.
 */
export function CredentialsForm() {
    usePageTitle("Add Credentials");
    const router = useRouter();
    const { trackEvent } = useAnalytics();
    const { user, loading: authLoading } = useAuth();
    const { syncData } = useOnboardingDataSync();
    const {
        credentials,
        updateCredentials,
        addLicenseDocument,
        removeLicenseDocument,
        setW9Document,
        clearW9Document,
        markStepComplete,
        setCurrentStep,
    } = useOnboardingStore();

    const [loading, setLoading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [uploading, setUploading] = useState(false);
    const [w9Uploading, setW9Uploading] = useState(false);

    // Additional license states — managed outside RHF as an array of codes
    const [additionalStates, setAdditionalStates] = useState(
        credentials.additionalLicenseStates ?? []
    );
    const [statePickerValue, setStatePickerValue] = useState("");

    const uploadedDocs = credentials.licenseDocuments;
    const w9Doc = credentials.w9Document;

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(
            credentialsSchema
                .omit({ licenseDocuments: true })
                .extend({
                    ratePerVisit: z.coerce
                        .number()
                        .min(0)
                        .max(10000)
                        .optional()
                        .nullable()
                        .transform((val) => (val === 0 ? null : val)),
                    attemptedVisitRate: z.preprocess(
                        (val) => (val === "" || val === undefined ? null : val),
                        z.coerce.number().min(0).max(10000).nullable()
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
            npiNumber: credentials.npiNumber || "",
            ratePerVisit: credentials.ratePerVisit?.toString() || "",
            attemptedVisitRate: credentials.attemptedVisitRate?.toString() || "",
        },
    });

    const primaryState = watch("licenseState");

    useEffect(() => {
        trackEvent("onboarding_step_viewed", { step: 3, step_name: "credentials" });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        syncData().then((data) => {
            if (!data) return;
            const creds = data.credentials;
            reset({
                licenseNumber: creds.licenseNumber || "",
                licenseState: creds.licenseState || "",
                npiNumber: creds.npiNumber || "",
                ratePerVisit: creds.ratePerVisit?.toString() || "",
                attemptedVisitRate: creds.attemptedVisitRate?.toString() || "",
            });
            setAdditionalStates(creds.additionalLicenseStates ?? []);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAddState = (e) => {
        const code = e.target.value;
        if (!code) return;
        setAdditionalStates((prev) => [...prev, code]);
        setStatePickerValue("");
    };

    const handleRemoveState = (code) => {
        setAdditionalStates((prev) => prev.filter((s) => s !== code));
    };

    const handleW9Drop = useCallback(
        async (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (!file) return;
            setUploadError("");

            if (file.size > 25 * 1024 * 1024) {
                setUploadError(`${file.name} is too large. Maximum size is 25MB.`);
                return;
            }
            const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
            if (!allowedTypes.includes(file.type)) {
                setUploadError(`${file.name} has invalid type. Only PDF, JPEG, and PNG are allowed.`);
                return;
            }
            if (!user) {
                setUploadError("User not authenticated. Please log in again.");
                return;
            }

            setW9Uploading(true);
            try {
                const result = await onboardingAPI.uploadDocument(file, "compliance", "w9");
                setW9Document({
                    id: result.id,
                    path: result.path,
                    fileName: result.fileName,
                    fileSize: result.fileSize,
                    documentType: result.documentType,
                    mimeType: result.mimeType,
                });
            } catch (err) {
                setUploadError(`Failed to upload ${file.name}. ${err.message}`);
            } finally {
                setW9Uploading(false);
            }
        },
        [user, setW9Document]
    );

    const handleRemoveW9 = async () => {
        setUploadError("");
        if (w9Doc?.id) {
            try {
                await onboardingAPI.deleteDocument(w9Doc.id);
            } catch {
                setUploadError(`Could not delete ${w9Doc.fileName} from storage. Please try again.`);
                return;
            }
        }
        clearW9Document();
    };

    const onSubmit = async (data) => {
        setLoading(true);
        setUploadError("");

        try {
            if (uploadedDocs.length === 0) {
                setUploadError("Please upload at least one license document");
                return;
            }

            const payload = {
                licenseNumber: data.licenseNumber,
                licenseState: data.licenseState,
                npiNumber: data.npiNumber || null,
                additionalLicenseStates: additionalStates,
                ...(data.ratePerVisit != null && data.ratePerVisit !== "" && {
                    ratePerVisit: data.ratePerVisit,
                }),
                ...(data.attemptedVisitRate != null && {
                    attemptedVisitRate: data.attemptedVisitRate,
                }),
                licenseDocuments: uploadedDocs.map((doc) => ({
                    path: doc.path,
                    fileName: doc.fileName,
                    fileSize: doc.fileSize,
                    documentType: doc.documentType,
                    mimeType: doc.mimeType,
                })),
                ...(w9Doc && {
                    w9Document: {
                        path: w9Doc.path,
                        fileName: w9Doc.fileName,
                        fileSize: w9Doc.fileSize,
                        documentType: w9Doc.documentType,
                        mimeType: w9Doc.mimeType,
                    },
                }),
            };

            await onboardingAPI.saveCredentials(payload);

            updateCredentials({
                licenseNumber: data.licenseNumber,
                licenseState: data.licenseState,
                npiNumber: data.npiNumber || null,
                additionalLicenseStates: additionalStates,
            });

            trackEvent("onboarding_step_completed", {
                step: 3,
                step_name: "credentials",
            });
            markStepComplete(3);
            setCurrentStep(4);
            router.push("/therapist/onboarding/availability");
        } catch (error) {
            setUploadError(
                error.response?.data?.message || "Failed to save credentials. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const onDrop = useCallback(
        async (acceptedFiles) => {
            setUploadError("");

            if (uploadedDocs.length + acceptedFiles.length > 5) {
                setUploadError(
                    `You can only upload a maximum of 5 documents. You currently have ${uploadedDocs.length} document(s).`
                );
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

                    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
                    if (!allowedTypes.includes(file.type)) {
                        setUploadError(`${file.name} has invalid type. Only PDF, JPEG, and PNG are allowed.`);
                        continue;
                    }

                    try {
                        const result = await onboardingAPI.uploadDocument(file, "license", "license");
                        addLicenseDocument({
                            id: result.id,
                            path: result.path,
                            fileName: result.fileName,
                            fileSize: result.fileSize,
                            documentType: result.documentType,
                            mimeType: result.mimeType,
                        });
                    } catch (err) {
                        setUploadError(`Failed to upload ${file.name}. ${err.message}`);
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
            const code = rejections[0]?.errors[0]?.code;
            if (code === "file-invalid-type") {
                setUploadError("Invalid file type. Only PDF, JPEG, and PNG files are allowed.");
            } else if (code === "too-many-files") {
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

    const { getRootProps: getW9RootProps, getInputProps: getW9InputProps, isDragActive: isW9DragActive } = useDropzone({
        onDrop: handleW9Drop,
        onDropRejected: () => setUploadError("Invalid file type. Only PDF, JPEG, and PNG files are allowed."),
        accept: {
            "application/pdf": [".pdf"],
            "image/*": [".jpeg", ".jpg", ".png"],
        },
        multiple: false,
        maxFiles: 1,
        disabled: !!w9Doc || w9Uploading || authLoading,
    });

    const handleRemoveDocument = async (index) => {
        setUploadError("");
        const doc = uploadedDocs[index];
        if (doc?.id) {
            try {
                await onboardingAPI.deleteDocument(doc.id);
            } catch (err) {
                // log but don't block UI — document is removed locally regardless
                setUploadError(`Could not delete ${doc.fileName} from storage. Please try again.`);
                return;
            }
        }
        removeLicenseDocument(index);
    };

    return (
        <div className="min-h-screen bg-background-light py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <OnboardingProgressBar />

                <header className="mb-8 px-4">
                    <h1 className="text-text-main text-[28px] font-bold leading-tight mb-2">
                        Professional Credentials
                    </h1>
                    <p className="text-text-muted text-base font-normal leading-normal">
                        Add your license details. We verify your credentials to ensure patient safety.
                    </p>
                </header>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="bg-card-light border border-border-light rounded-xl p-8 space-y-6 shadow-sm">

                        {/* Section 1 — License Number + State */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-text-main text-sm font-semibold">
                                    License Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("licenseNumber")}
                                    placeholder="e.g. 123456789"
                                    className="w-full px-4 py-3 h-12 rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                />
                                {errors.licenseNumber && (
                                    <p className="text-red-500 text-sm">{errors.licenseNumber.message}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-text-main text-sm font-semibold">
                                    State of Licensure <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register("licenseState")}
                                    className="w-full px-4 py-3 h-12 rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                >
                                    <option value="">Select State</option>
                                    {US_STATES.map((state) => (
                                        <option key={state.code} value={state.code}>
                                            {state.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.licenseState && (
                                    <p className="text-red-500 text-sm">{errors.licenseState.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Section 2 — NPI Number */}
                        <div className="flex flex-col gap-2">
                            <label className="text-text-main text-sm font-semibold flex items-center gap-1.5">
                                NPI Number{" "}
                                <span className="text-text-muted font-normal">(optional)</span>
                                <span
                                    title="Your 10-digit National Provider Identifier. Used for insurance billing and identity verification."
                                    className="cursor-help text-text-muted hover:text-primary transition-colors"
                                    aria-label="NPI Number information"
                                >
                                    <MdInfoOutline className="text-base" />
                                </span>
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={10}
                                {...register("npiNumber")}
                                placeholder="e.g. 1234567890"
                                className="w-full md:w-1/2 px-4 py-3 h-12 rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                            <p className="text-xs text-text-muted">
                                Your 10-digit National Provider Identifier. Used for insurance billing and identity verification.
                            </p>
                            {errors.npiNumber && (
                                <p className="text-red-500 text-sm">{errors.npiNumber.message}</p>
                            )}
                        </div>

                        {/* Section 3 — Additional License States */}
                        <div className="flex flex-col gap-2">
                            <label className="text-text-main text-sm font-semibold">
                                Additional States Licensed In{" "}
                                <span className="text-text-muted font-normal">(optional)</span>
                            </label>
                            <p className="text-xs text-text-muted">
                                Select any other states where you hold an active therapy license.
                            </p>

                            {/* Selected state chips */}
                            {additionalStates.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-1">
                                    {additionalStates.map((code) => {
                                        const state = US_STATES.find((s) => s.code === code);
                                        return (
                                            <span
                                                key={code}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold"
                                            >
                                                {state?.name ?? code}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveState(code)}
                                                    className="hover:text-primary/70 transition-colors"
                                                    aria-label={`Remove ${state?.name ?? code}`}
                                                >
                                                    <MdClose className="text-sm" />
                                                </button>
                                            </span>
                                        );
                                    })}
                                </div>
                            )}

                            <select
                                value={statePickerValue}
                                onChange={handleAddState}
                                className="w-full md:w-1/2 px-4 py-3 h-12 rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            >
                                <option value="">Add a state...</option>
                                {getAvailableStates(additionalStates, primaryState).map((s) => (
                                    <option key={s.code} value={s.code}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Section 4 — Rates (2-column grid) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-text-main text-sm font-semibold">
                                    Rate per Visit{" "}
                                    <span className="text-text-muted font-normal">(optional)</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm pointer-events-none">
                                        $
                                    </span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10000"
                                        step="0.01"
                                        {...register("ratePerVisit")}
                                        placeholder="85.00"
                                        className="w-full pl-8 pr-4 py-3 h-12 rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                                <p className="text-xs text-text-muted">
                                    Your standard rate per session. This will pre-fill your offers and show on your profile. You can adjust per offer.
                                </p>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-text-main text-sm font-semibold">
                                    Attempted Visit Rate{" "}
                                    <span className="text-text-muted font-normal">(optional)</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm pointer-events-none">
                                        $
                                    </span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10000"
                                        step="0.01"
                                        {...register("attemptedVisitRate")}
                                        placeholder="40.00"
                                        className="w-full pl-8 pr-4 py-3 h-12 rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                                {errors.attemptedVisitRate && (
                                    <p className="text-red-500 text-sm">{errors.attemptedVisitRate.message}</p>
                                )}
                                <p className="text-xs text-text-muted">
                                    Charged when you arrive but the patient isn&apos;t home. Must be less than or equal to your session rate. Leave blank if you won&apos;t charge for no-shows.
                                </p>
                            </div>
                        </div>

                        {/* Section 5 — License Document Upload */}
                        <div className="flex flex-col gap-2">
                            <label className="text-text-main text-sm font-semibold">
                                Professional License Certificate{" "}
                                <span className="text-text-muted font-normal">
                                    ({uploadedDocs.length}/5)
                                </span>
                            </label>

                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed border-border-light rounded-xl p-10 flex flex-col items-center justify-center bg-muted-light transition-colors ${uploadedDocs.length >= 5 || uploading
                                        ? "opacity-50 cursor-not-allowed"
                                        : "hover:bg-primary/5 hover:border-primary cursor-pointer group"
                                    }`}
                            >
                                <input {...getInputProps()} />

                                {uploading ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                                        <p className="text-text-main text-base font-medium">
                                            Uploading documents...
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        <p className="text-text-main text-base font-medium text-center">
                                            {uploadedDocs.length >= 5
                                                ? "Maximum 5 documents uploaded"
                                                : isDragActive
                                                    ? "Drop files here..."
                                                    : "Click to upload or drag and drop"}
                                        </p>
                                        <p className="text-text-muted text-sm mt-1 text-center">
                                            PDF, JPG or PNG (max. 25MB each)
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
                                            className="flex items-center justify-between bg-muted-light p-3 rounded-lg border border-border-light"
                                        >
                                            <div className="flex items-center gap-3">
                                                <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span className="text-text-main text-sm truncate">
                                                    {doc.fileName}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveDocument(index)}
                                                className="text-red-500 hover:text-red-600 font-semibold text-sm shrink-0 ml-4"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Section 6 — W-9 Upload */}
                        <div className="flex flex-col gap-2 pt-2">
                            <label className="text-text-main text-sm font-semibold">
                                W-9 Tax Form{" "}
                                <span className="text-text-muted font-normal">(optional)</span>
                            </label>
                            <p className="text-xs text-text-muted">
                                Required for payment processing. You can upload it now or provide it later.{" "}
                                <a
                                    href="https://www.irs.gov/pub/irs-pdf/fw9.pdf"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary underline"
                                >
                                    Download blank W-9
                                </a>
                            </p>

                            {w9Doc ? (
                                <div className="flex items-center justify-between bg-muted-light p-3 rounded-lg border border-border-light">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span className="text-text-main text-sm truncate">{w9Doc.fileName}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveW9}
                                        className="text-red-500 hover:text-red-600 font-semibold text-sm shrink-0 ml-4"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div
                                    {...getW9RootProps()}
                                    className={`border-2 border-dashed border-border-light rounded-xl p-8 flex flex-col items-center justify-center bg-muted-light transition-colors ${w9Uploading
                                            ? "opacity-50 cursor-not-allowed"
                                            : "hover:bg-primary/5 hover:border-primary cursor-pointer group"
                                        }`}
                                >
                                    <input {...getW9InputProps()} />
                                    {w9Uploading ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                                            <p className="text-text-main text-sm font-medium">Uploading W-9...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                            </div>
                                            <p className="text-text-main text-sm font-medium text-center">
                                                {isW9DragActive ? "Drop W-9 here..." : "Click to upload or drag and drop"}
                                            </p>
                                            <p className="text-text-muted text-xs mt-1 text-center">PDF, JPG or PNG (max. 25MB)</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-6 border-t border-border-light">
                            <button
                                type="button"
                                onClick={() => router.push("/therapist/onboarding/profile")}
                                className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border-light text-text-main font-semibold hover:bg-muted-light transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back
                            </button>

                            <button
                                type="submit"
                                disabled={loading || uploading}
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

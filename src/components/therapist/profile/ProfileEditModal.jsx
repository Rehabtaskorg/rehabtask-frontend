"use client";

import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MdClose, MdEdit, MdCameraAlt, MdLock, MdInfo } from "react-icons/md";
import { LICENSE_TYPES } from "@/lib/constants/credentials";
import { onboardingAPI } from "@/services/onboarding.api";
import { useUpdateProfile } from "@/hooks/useTherapistProfile";
import Input from "@/components/ui/Input";
import PhoneInput from "@/components/ui/PhoneInput";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Image from "next/image";

const profileEditSchema = z.object({
    fullName: z.string().trim().min(2, "Name must be at least 2 characters"),
    phone: z
        .string()
        .regex(/^\+1\d{10}$/, "Phone must be in format +1XXXXXXXXXX"),
    yearsOfExperience: z.coerce
        .number({ invalid_type_error: "Must be a number" })
        .min(0, "Must be 0 or greater")
        .max(50, "Must be 50 or less"),
    ratePerVisit: z.coerce
        .number({ invalid_type_error: "Must be a number" })
        .min(0, "Must be 0 or greater")
        .max(10000, "Must be $10,000 or less")
        .optional()
        .nullable()
        .transform(val => val === 0 ? null : val),
    attemptedVisitRate: z.preprocess(
        (val) => (val === "" || val === undefined ? null : val),
        z.coerce
            .number({ invalid_type_error: "Must be a number" })
            .min(0, "Must be 0 or greater")
            .max(10000, "Must be $10,000 or less")
            .nullable()
    ),
    professionalSummary: z
        .string()
        .min(100, "Must be at least 100 characters")
        .max(2000, "Cannot exceed 2000 characters"),
}).refine(
    (data) => {
        if (data.attemptedVisitRate == null || data.ratePerVisit == null) return true;
        return data.attemptedVisitRate <= data.ratePerVisit;
    },
    {
        message: "Cannot be greater than your session rate",
        path: ["attemptedVisitRate"],
    }
);

const ProfileEditModal = ({ isOpen, onClose, profile, onSuccess }) => {
    const [photoUrl, setPhotoUrl] = useState(profile?.profilePhotoUrl || null);
    const [imgError, setImgError] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [alert, setAlert] = useState(null);
    const fileInputRef = useRef(null);
    const alertRef = useRef(null);

    const showAlert = useCallback((type, message) => {
        setAlert({ type, message });
        setTimeout(() => alertRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    }, []);

    const updateProfile = useUpdateProfile();

    const { register, handleSubmit, watch, control, formState: { errors } } = useForm({
        resolver: zodResolver(profileEditSchema),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: {
            fullName: profile?.fullName || "",
            phone: profile?.phone || "",
            yearsOfExperience: profile?.yearsOfExperience || 0,
            ratePerVisit: profile?.ratePerVisit ? parseFloat(profile.ratePerVisit) : "",
            attemptedVisitRate: profile?.attemptedVisitRate != null ? parseFloat(profile.attemptedVisitRate) : "",
            professionalSummary: profile?.professionalSummary || "",
        }
    })

    const summaryValue = watch("professionalSummary");
    const summaryLength = summaryValue?.length || 0;

    if (!isOpen) return null;

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showAlert("error", "Please select an image file.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showAlert("error", "Image must be less than 5MB.");
            return;
        }

        setUploading(true);
        setAlert(null);

        try {
            const result = await onboardingAPI.uploadProfilePhoto(file);
            setImgError(false);
            setPhotoUrl(result.url);
        } catch (err) {
            showAlert("error", err.response?.data?.message || "Failed to upload photo.");
        } finally {
            setUploading(false);
        }
    }

    const onSubmit = async (data) => {
        setAlert(null);
        try {
            await updateProfile.mutateAsync({
                ...data,
                profilePhotoUrl: photoUrl,
            });
            onSuccess?.();
            onClose();
        } catch (err) {
            showAlert("error", err.response?.data?.message || "Failed to update profile.");
        }
    }

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    }

    const initials = profile?.fullName
        ? profile.fullName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "?";

    const licenseTypeLabel =
        LICENSE_TYPES.find((lt) => lt.value === profile?.primaryLicenseType)?.label ||
        profile?.primaryLicenseType ||
        "—";

    return (
        <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={handleOverlayClick}
        >
            <div className="bg-card-light  rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border-light ">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <MdEdit className="text-primary text-xl" />
                        </div>
                        <h2 className="text-lg font-bold text-text-main ">
                            Edit Profile
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-lg text-text-muted hover:bg-muted-light  transition-colors"
                    >
                        <MdClose className="text-xl" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {alert && (
                        <div ref={alertRef}>
                            <Alert
                                type={alert.type}
                                message={alert.message}
                                onClose={() => setAlert(null)}
                            />
                        </div>
                    )}

                    {/* Profile Photo */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            {photoUrl && !imgError ? (
                                <Image
                                    src={photoUrl}
                                    alt="profile"
                                    width={80}
                                    height={80}
                                    onError={() => setImgError(true)}
                                    className="w-20 h-20 rounded-full object-cover border-2 border-border-light "
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-border-light ">
                                    <span className="text-primary text-xl font-bold">
                                        {initials}
                                    </span>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="absolute -bottom-1 -right-1 p-1.5 bg-primary text-white rounded-full shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                <MdCameraAlt className="text-sm" />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="hidden"
                            />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-main ">
                                Profile Photo
                            </p>
                            <p className="text-xs text-text-muted">
                                {uploading ? "Uploading..." : "JPG, PNG. Max 5MB."}
                            </p>
                        </div>
                    </div>

                    {/* Editable Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Input
                            label="Full Name"
                            error={errors.fullName?.message}
                            required
                            {...register("fullName")}
                        />
                        <PhoneInput
                            label="Phone"
                            name="phone"
                            control={control}
                            error={errors.phone?.message}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Input
                            label="Years of Experience"
                            type="number"
                            min={0}
                            max={50}
                            error={errors.yearsOfExperience?.message}
                            {...register("yearsOfExperience")}
                        />
                        <Input
                            label="Rate per Visit ($)"
                            type="number"
                            min={0}
                            max={10000}
                            step="0.01"
                            placeholder="e.g. 85.00"
                            error={errors.ratePerVisit?.message}
                            {...register("ratePerVisit")}
                        />
                    </div>

                    <div className="space-y-1">
                        <Input
                            label="Attempted Visit Rate ($) — optional"
                            type="number"
                            min={0}
                            max={10000}
                            step="0.01"
                            placeholder="e.g. 40.00"
                            error={errors.attemptedVisitRate?.message}
                            {...register("attemptedVisitRate")}
                        />
                        <p className="text-xs text-text-muted ">
                            Charged when you arrive but the patient isn&apos;t home. Must be less than or equal to your session rate. Leave blank if you won&apos;t charge for no-shows. Changes only apply to new offers — existing bookings keep their original rate.
                        </p>
                    </div>

                    {/* Professional Summary */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-bold text-text-main  uppercase tracking-wide">
                                Professional Summary <span className="text-red-500">*</span>
                            </label>
                            <span
                                className={`text-xs font-medium ${summaryLength < 100
                                    ? "text-red-500"
                                    : summaryLength > 1800
                                        ? "text-yellow-500"
                                        : "text-text-muted"
                                    }`}
                            >
                                {summaryLength}/2000
                            </span>
                        </div>
                        <textarea
                            {...register("professionalSummary")}
                            rows={5}
                            className={`w-full px-4 py-3 rounded-xl bg-white  border transition-all outline-none resize-none ${errors.professionalSummary
                                ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                                : "border-border-subtle  focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                } text-text-main  placeholder:text-text-muted/50`}
                            placeholder="Describe your experience, approach, and areas of expertise..."
                        />
                        {errors.professionalSummary && (
                            <p className="text-xs text-red-500 font-medium">
                                {errors.professionalSummary.message}
                            </p>
                        )}
                    </div>

                    {/* Read-only credentials */}
                    <div className="bg-muted-light  rounded-xl p-4 border border-border-light ">
                        <div className="flex items-center gap-2 mb-3">
                            <MdLock className="text-text-muted" />
                            <span className="text-sm font-bold text-text-muted uppercase tracking-wide">
                                Credentials (Read-Only)
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <p className="text-xs text-text-muted">Discipline type</p>
                                <p className="text-sm font-medium text-text-main ">
                                    {licenseTypeLabel}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-text-muted">License Number</p>
                                <p className="text-sm font-medium text-text-main ">
                                    {profile?.licenseNumber || "—"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-text-muted">License State</p>
                                <p className="text-sm font-medium text-text-main ">
                                    {profile?.licenseState || "—"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 mt-3">
                            <MdInfo className="text-text-muted text-sm" />
                            <p className="text-xs text-text-muted">
                                If you want to edit your discipline, contact admin
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={updateProfile.isPending}>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )

};

export default ProfileEditModal;
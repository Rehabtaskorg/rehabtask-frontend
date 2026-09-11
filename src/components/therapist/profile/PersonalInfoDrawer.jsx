"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Drawer, DRAWER_SIZES } from "@/components/ui/Drawer";
import Input from "@/components/ui/Input";
import PhoneInput from "@/components/ui/PhoneInput";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { useUpdateProfile } from "@/hooks/useTherapistProfile";
import { useProfilePhotoUpload } from "@/hooks/useProfilePhotoUpload";
import { personalInfoSchema } from "@/lib/validators/therapistProfileEdit.schema";
import { ProfilePhotoPicker } from "./ProfilePhotoPicker";
import { InfoRow } from "./cards/InfoRow";

/**
 * Edit panel for photo, phone and years of experience.
 *
 * The submitted payload carries exactly `phone`, `yearsOfExperience` and
 * `profilePhotoUrl`. Full name is shown read-only and never submitted — it is
 * VERIFIED_HARD server-side and including it would delist an approved
 * therapist. Professional summary is likewise excluded (hidden, 2026-09-07).
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls the drawer.
 * @param {() => void} props.onClose - Dismiss handler.
 * @param {Object} props.profile - Therapist profile supplying default values.
 * @param {() => void} [props.onSuccess] - Called after a successful save.
 */
export function PersonalInfoDrawer({ isOpen, onClose, profile, onSuccess }) {
    const [alert, setAlert] = useState(null);
    const updateProfile = useUpdateProfile();

    const showError = useCallback((message) => setAlert({ type: "error", message }), []);

    const {
        fileInputRef,
        photoUrl,
        isImgError,
        isUploading,
        setIsImgError,
        handlePhotoChange,
    } = useProfilePhotoUpload(profile?.profilePhotoUrl, showError);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(personalInfoSchema),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: {
            phone: profile?.phone || "",
            yearsOfExperience: profile?.yearsOfExperience ?? 0,
        },
    });

    const onSubmit = async (data) => {
        setAlert(null);
        try {
            await updateProfile.mutateAsync({
                phone: data.phone,
                yearsOfExperience: data.yearsOfExperience,
                profilePhotoUrl: photoUrl,
            });
            onSuccess?.();
            onClose();
        } catch (err) {
            showError(err.response?.data?.message || "Failed to update profile.");
        }
    };

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="Edit personal information"
            description="Your photo, contact number and experience."
            size={DRAWER_SIZES.MD}
            isDismissDisabled={updateProfile.isPending || isUploading}
            footer={
                <div className="flex items-center justify-end gap-3">
                    <Button variant="secondary" onClick={onClose} disabled={updateProfile.isPending}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="personal-info-form"
                        loading={updateProfile.isPending}
                        disabled={isUploading}
                    >
                        Save Changes
                    </Button>
                </div>
            }
        >
            <form id="personal-info-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {alert && (
                    <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
                )}

                <ProfilePhotoPicker
                    photoUrl={photoUrl}
                    fullName={profile?.fullName}
                    isImgError={isImgError}
                    isUploading={isUploading}
                    onImgError={() => setIsImgError(true)}
                    onFileChange={handlePhotoChange}
                    fileInputRef={fileInputRef}
                />

                <div className="rounded-xl border border-border-light bg-muted-light p-4">
                    <InfoRow label="Full Name" value={profile?.fullName} />
                    <p className="mt-1 text-xs text-text-muted">
                        Your legal name is matched against your licence and cannot be changed here.
                        Contact support to request a correction.
                    </p>
                </div>

                <PhoneInput
                    label="Phone"
                    name="phone"
                    control={control}
                    error={errors.phone?.message}
                    required
                />

                <Input
                    label="Years of Experience"
                    type="number"
                    min={0}
                    max={50}
                    error={errors.yearsOfExperience?.message}
                    helperText="Updating this sends your profile for a light re-review. You stay visible and bookable."
                    {...register("yearsOfExperience")}
                />
            </form>
        </Drawer>
    );
}

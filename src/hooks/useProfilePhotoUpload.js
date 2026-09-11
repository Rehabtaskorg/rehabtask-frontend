"use client";

import { useState, useRef } from "react";
import { onboardingAPI } from "@/services/onboarding.api";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

/**
 * Profile photo picker and uploader.
 *
 * The uploaded URL is held in local state rather than written straight to the
 * profile, so the caller merges `photoUrl` into its own save payload and an
 * abandoned drawer leaves the stored profile untouched.
 *
 * @param {string|null} [initialPhotoUrl] - Existing photo URL from the profile.
 * @param {(message: string) => void} [onError] - Invoked with a user-facing message on validation or upload failure.
 * @returns {{
 *   fileInputRef: import('react').RefObject<HTMLInputElement>,
 *   photoUrl: string|null,
 *   isImgError: boolean,
 *   isUploading: boolean,
 *   setIsImgError: (value: boolean) => void,
 *   handlePhotoChange: (event: Event) => Promise<void>,
 * }}
 */
export function useProfilePhotoUpload(initialPhotoUrl, onError) {
    const [photoUrl, setPhotoUrl] = useState(initialPhotoUrl || null);
    const [isImgError, setIsImgError] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handlePhotoChange = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            onError?.("Please select an image file.");
            return;
        }
        if (file.size > MAX_PHOTO_BYTES) {
            onError?.("Image must be less than 5MB.");
            return;
        }

        setIsUploading(true);
        try {
            const result = await onboardingAPI.uploadProfilePhoto(file);
            setIsImgError(false);
            setPhotoUrl(result.url);
        } catch (err) {
            onError?.(err.response?.data?.message || "Failed to upload photo.");
        } finally {
            setIsUploading(false);
        }
    };

    return {
        fileInputRef,
        photoUrl,
        isImgError,
        isUploading,
        setIsImgError,
        handlePhotoChange,
    };
}

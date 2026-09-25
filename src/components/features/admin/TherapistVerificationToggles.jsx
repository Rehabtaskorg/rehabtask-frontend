"use client";

import { useState } from "react";
import { MdVerified, MdOutlineVerified } from "react-icons/md";
import { useUpdateTherapistVerification } from "@/hooks/useAdmin";
import { THERAPIST_VERIFICATION_FIELDS } from "@/lib/constants";

/**
 * Admin-only UI for toggling licenseVerified and insuranceVerified on a therapist profile.
 * Renders two independent toggle buttons — each can be set without affecting the other.
 *
 * @param {{ therapistUserId: string, licenseVerified: boolean, insuranceVerified: boolean }} props
 */
export function TherapistVerificationToggles({ therapistUserId, licenseVerified, insuranceVerified }) {
    const { mutateAsync, isPending } = useUpdateTherapistVerification();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleToggle = async (field, currentValue) => {
        setError("");
        setSuccess("");
        try {
            await mutateAsync({ therapistUserId, field, value: !currentValue });
            const label = field === THERAPIST_VERIFICATION_FIELDS.LICENSE ? "License" : "Insurance";
            setSuccess(`${label} verification ${!currentValue ? "marked" : "removed"}.`);
        } catch (e) {
            setError(e?.response?.data?.message || "Failed to update verification. Please try again.");
        }
    };

    return (
        <div className="space-y-4">
            <VerificationRow
                label="License Verified"
                isVerified={licenseVerified}
                isLoading={isPending}
                onToggle={() => handleToggle(THERAPIST_VERIFICATION_FIELDS.LICENSE, licenseVerified)}
            />
            <VerificationRow
                label="Insurance Verified"
                isVerified={insuranceVerified}
                isLoading={isPending}
                onToggle={() => handleToggle(THERAPIST_VERIFICATION_FIELDS.INSURANCE, insuranceVerified)}
            />
            {success && (
                <p className="text-sm text-emerald-600">{success}</p>
            )}
            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}
        </div>
    );
}

/**
 * @param {{ label: string, isVerified: boolean, isLoading: boolean, onToggle: () => void }} props
 */
function VerificationRow({ label, isVerified, isLoading, onToggle }) {
    return (
        <div className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
                {isVerified
                    ? <MdVerified className="text-base text-emerald-600" />
                    : <MdOutlineVerified className="text-base text-slate-400" />
                }
                <span className={isVerified ? "text-text-main font-medium" : "text-text-muted"}>
                    {label}
                </span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${isVerified ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {isVerified ? "Verified" : "Pending"}
                </span>
            </div>
            <button
                type="button"
                onClick={onToggle}
                disabled={isLoading}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isVerified
                        ? "border-slate-300 text-slate-600 hover:bg-slate-50"
                        : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                }`}
            >
                {isVerified ? "Remove Verification" : "Mark as Verified"}
            </button>
        </div>
    );
}

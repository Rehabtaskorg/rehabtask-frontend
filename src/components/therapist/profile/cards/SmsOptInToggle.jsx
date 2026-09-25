"use client";

import { useState } from "react";
import { logger } from "@/lib/logger";
import { useUpdateProfile } from "@/hooks/useTherapistProfile";

/**
 * Inline SMS notification switch. Saves immediately with optimistic local state
 * and reverts on failure.
 *
 * `phone` is deliberately sent alongside `smsOptIn` — both are OPEN tier, and
 * this is the exact payload the backend validator has been exercised against.
 *
 * @param {Object} props
 * @param {Object} props.profile - Therapist profile, supplies `phone` and initial `smsOptIn`.
 * @param {boolean} props.isOnboardingComplete - Disables the switch until onboarding is finished.
 */
export function SmsOptInToggle({ profile, isOnboardingComplete }) {
    const [smsOptIn, setSmsOptIn] = useState(profile?.smsOptIn ?? false);
    const updateProfile = useUpdateProfile();

    const handleSmsToggle = async () => {
        const next = !smsOptIn;
        setSmsOptIn(next);
        try {
            await updateProfile.mutateAsync({ phone: profile?.phone, smsOptIn: next });
        } catch (err) {
            setSmsOptIn(!next);
            logger.error("Failed to update SMS preference:", err);
        }
    };

    return (
        <div className="flex items-center justify-between py-2">
            <div>
                <p className="text-sm text-text-muted">SMS Notifications</p>
                <p className="mt-0.5 text-xs text-text-muted">
                    {smsOptIn
                        ? "Receiving appointment reminders via SMS"
                        : "SMS reminders disabled"}
                </p>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={smsOptIn}
                aria-label="Toggle SMS notifications"
                onClick={handleSmsToggle}
                disabled={!isOnboardingComplete || updateProfile.isPending}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${smsOptIn ? "bg-primary" : "bg-gray-300"}`}
            >
                <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${smsOptIn ? "translate-x-5" : "translate-x-0"}`}
                />
            </button>
        </div>
    );
}

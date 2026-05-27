import { usePostHog } from "posthog-js/react";
import { useCallback } from "react";

/**
 * Keys that are never safe to send to PostHog.
 * Covers PHI free-text fields and PII identifiers.
 * Defined as an array and converted to a Set inside sanitiseProps to avoid
 * module-level Set initialisation ordering issues with Next.js/Turbopack.
 */
const PHI_KEY_LIST = [
    "description",
    "location",
    "address",
    "content",
    "fullName",
    "first_name",
    "last_name",
    "email",
    "phone",
    "dob",
    "dateOfBirth",
    "reason",
    "revisionReason",
    "missedReason",
    "attemptedReason",
    "rejectionReason",
    "notes",
    "message",
    "patientName",
];

/**
 * Strips any PHI/PII keys from a properties object before sending to PostHog.
 * This is a defence-in-depth guard — call sites should never pass PHI in the
 * first place, but this ensures nothing leaks if they do.
 *
 * @param {Record<string, unknown>} props
 * @returns {Record<string, unknown>} Sanitised copy with PHI keys removed.
 */
const sanitiseProps = (props) => {
    if (!props || typeof props !== "object") return {};
    return Object.fromEntries(
        Object.entries(props).filter(([key]) => !PHI_KEY_LIST.includes(key))
    );
};

/**
 * PHI-safe analytics hook. The only way PostHog events are fired in this app.
 *
 * Usage:
 * ```js
 * const { trackEvent } = useAnalytics();
 * trackEvent("offer_sent", { service_type: "Physical Therapy", session_type: "in_person" });
 * ```
 *
 * Rules:
 * - Never pass description, location, address, fullName, email, phone, or any free-text.
 * - Only pass structured IDs, enums, booleans, and counts.
 *
 * @returns {{ trackEvent: (eventName: string, properties?: Record<string, unknown>) => void }}
 */
export function useAnalytics() {
    const posthog = usePostHog();

    const trackEvent = useCallback(
        (eventName, properties = {}) => {
            if (!posthog) return;
            const safe = sanitiseProps(properties);
            posthog.capture(eventName, safe);
        },
        [posthog]
    );

    return { trackEvent };
}
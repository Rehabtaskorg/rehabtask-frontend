import { z } from "zod";
import { US_STATES } from "../constants/credentials";

const US_STATE_CODES = US_STATES.map((s) => s.code);

/**
 * Contact information drawer schema.
 *
 * `fullName` and `dateOfBirth` are intentionally absent: both are VERIFIED_HARD
 * server-side, so submitting them on an approved profile would trigger a
 * re-review that suspends marketplace access. They are rendered read-only and
 * routed to "Request a change" instead.
 *
 * `smsOptIn` is also absent by design — it stays an inline toggle that saves
 * immediately alongside `phone`, matching the therapist side's `SmsOptInToggle`.
 */
export const contactInfoSchema = z.object({
    phone: z
        .string()
        .regex(/^\+1\d{10}$/, "Phone must be in format +1XXXXXXXXXX"),
});

/**
 * Address drawer schema.
 */
export const addressSchema = z.object({
    addressLine1: z.string().min(1, "Address is required").max(255),
    addressLine2: z.string().max(255).optional().nullable(),
    city: z.string().min(1, "City is required").max(100),
    state: z
        .string()
        .min(1, "State is required")
        .refine((val) => US_STATE_CODES.includes(val.toUpperCase()), {
            message: "Please select a valid US state",
        }),
    zipCode: z.string().regex(/^\d{5}$/, "ZIP code must be exactly 5 digits"),
});

/**
 * Business information drawer schema (agency only).
 */
export const businessInfoSchema = z.object({
    agencyName: z
        .string()
        .min(2, "Agency name must be at least 2 characters")
        .max(255, "Agency name must be 255 characters or less"),
    ein: z
        .string()
        .refine((val) => val === "" || /^\d{2}-\d{7}$/.test(val), {
            message: "EIN must be in format XX-XXXXXXX",
        })
        .optional()
        .nullable(),
    dbaName: z.string().max(255).optional().nullable(),
    billingEmail: z
        .string()
        .min(1, "Billing email is required")
        .email("Billing email must be a valid email address")
        .max(255, "Billing email must be 255 characters or less"),
});

/**
 * Medical information drawer schema (individual only).
 */
export const medicalInfoSchema = z.object({
    primaryDiagnosis: z.string().min(1, "Primary diagnosis is required").max(255),
    referringProviderName: z.string().max(255).optional().nullable(),
});

const isUnchanged = (next, previous) => {
    const normalize = (val) => (val === "" || val === undefined ? null : val);
    return normalize(next) === normalize(previous);
};

/**
 * Narrow a validated form payload to only the fields whose value actually
 * differs from the currently loaded profile.
 *
 * @param {Object} formValues - Validated values from the drawer form.
 * @param {Object} loadedProfile - Profile object the form was initialised from.
 * @param {string[]} fieldNames - Fields eligible for submission.
 * @returns {Object} Subset of `formValues` that changed; empty when nothing did.
 */
export const pickChangedFields = (formValues, loadedProfile, fieldNames) => {
    return fieldNames.reduce((changed, field) => {
        if (!isUnchanged(formValues?.[field], loadedProfile?.[field])) {
            changed[field] = formValues[field];
        }
        return changed;
    }, {});
};

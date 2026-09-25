import { z } from "zod";
import { US_STATES } from "../constants/credentials";

const US_STATE_CODES = US_STATES.map((s) => s.code);

export const individualPersonalInfoSchema = z.object({
    dateOfBirth: z
        .string()
        .min(1, "Date of birth is required")
        .refine((val) => {
            const date = new Date(val);
            if (isNaN(date.getTime())) return false;
            const now = new Date();
            const age = now.getFullYear() - date.getFullYear();
            return age >= 18 && age <= 100;
        }, "Must be between 18 and 100 years old"),
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

export const individualMedicalInfoSchema = z.object({
    primaryDiagnosis: z.string().min(1, "Primary diagnosis is required").max(255),
    referringProviderName: z.string().max(255).optional().nullable(),
});

export const individualSignConsentSchema = z
    .object({
        signature: z.string().min(2, "Signature is required").max(255, "Signature too long"),
        representativeName: z.string().max(255).optional().nullable(),
        representativeRelationship: z.string().max(100).optional().nullable(),
        representativeAuthority: z.string().max(100).optional().nullable(),
    })
    .refine(
        (data) => {
            const hasAny = !!(
                data.representativeName ||
                data.representativeRelationship ||
                data.representativeAuthority
            );
            const hasAll = !!(
                data.representativeName &&
                data.representativeRelationship &&
                data.representativeAuthority
            );
            return !hasAny || hasAll;
        },
        {
            message: "All representative fields (name, relationship, authority) are required.",
            path: ["representativeName"],
        }
    );
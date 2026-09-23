import { z } from "zod";
import { US_STATES } from "../constants/credentials";

const US_STATE_CODES = US_STATES.map((s) => s.code);

const rateSchema = z.preprocess(
    (val) => (val === "" || val === undefined ? null : val),
    z.coerce
        .number({ invalid_type_error: "Must be a number" })
        .min(0, "Must be 0 or greater")
        .max(10000, "Must be $10,000 or less")
        .nullable()
);

/**
 * Personal information drawer schema.
 *
 * `fullName` is intentionally absent: it is VERIFIED_HARD server-side, so
 * submitting it on an approved profile would trigger a re-review that delists
 * the therapist. It is rendered read-only instead.
 */
export const personalInfoSchema = z.object({
    phone: z
        .string()
        .regex(/^\+1\d{10}$/, "Phone must be in format +1XXXXXXXXXX"),
    yearsOfExperience: z.coerce
        .number({ invalid_type_error: "Must be a number" })
        .min(0, "Must be 0 or greater")
        .max(50, "Must be 50 or less"),
});

export const ratesSchema = z
    .object({
        ratePerVisit: z.coerce
            .number({ invalid_type_error: "Must be a number" })
            .min(0, "Must be 0 or greater")
            .max(10000, "Must be $10,000 or less")
            .optional()
            .nullable()
            .transform((val) => (val === 0 ? null : val)),
        attemptedVisitRate: rateSchema,
        evaluationRate: rateSchema,
        travelFee: rateSchema,
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
    );

export const availabilityDetailsSchema = z.object({
    availableFrom: z.string().datetime({ offset: true }).optional().nullable(),
    caseloadCapacity: z
        .union([z.string().trim(), z.number()])
        .optional()
        .nullable()
        .refine(
            (val) => val == null || val === "" || (Number(val) >= 1 && Number(val) <= 999),
            { message: "Must be a number between 1 and 999" }
        )
        .refine(
            (val) => val == null || val === "" || Number.isInteger(Number(val)),
            { message: "Must be a whole number" }
        )
        .transform((val) => (val == null || val === "" ? null : Number(val))),
});

export const contactDetailsSchema = z
    .object({
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
        emergencyContactName: z.string().max(255).optional().nullable(),
        emergencyContactPhone: z
            .string()
            .refine((val) => !val || /^\+1\d{10}$/.test(val), {
                message: "Phone must be in format +1XXXXXXXXXX",
            })
            .optional()
            .nullable(),
    })
    .refine((data) => !data.emergencyContactPhone || !!data.emergencyContactName, {
        message: "Add a name for your emergency contact",
        path: ["emergencyContactName"],
    });

import { z } from "zod";

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

/**
 * Rates drawer schema.
 *
 * `ratePerVisit` maps 0 to null so clearing the field unsets the rate rather
 * than advertising a free visit. The cross-field cap mirrors the backend guard
 * in `therapist.service.js`.
 */
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

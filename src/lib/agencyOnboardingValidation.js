import { z } from "zod";
import { US_STATES } from "./constants/credentials";

const US_STATE_CODES = US_STATES.map((s) => s.code);

export const agencyBusinessProfileSchema = z.object({
    dbaName: z.string().max(255).optional().nullable(),
    ein: z
        .string()
        .regex(/^\d{2}-\d{7}$/, "EIN must be in format XX-XXXXXXX")
        .optional()
        .nullable()
        .or(z.literal("")),
    billingEmail: z
        .string()
        .min(1, "Billing email is required")
        .email("Billing email must be a valid email address"),
    addressLine1: z.string().min(1, "Business address is required").max(255),
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

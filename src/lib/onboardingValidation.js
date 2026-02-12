import z from "zod";
import { SPECIALIZATIONS } from "./constants/specializations";
import { US_STATES } from "./constants/credentials";

export const DEFAULT_TIME_BLOCK = { startTime: "09:00", endTime: "17:00" };

const timeBlockSchema = z.object({
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid start time"),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid end time"),
}).refine(block => block.endTime > block.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
});

const daySchema = z.object({
    enabled: z.boolean(),
    timeBlocks: z.array(timeBlockSchema),
}).superRefine((day, ctx) => {
    if (day.enabled && day.timeBlocks.length === 0) {
        ctx.addIssue({
            code: "custom",
            message: "Enabled days must have at least one time block",
            path: ["timeBlocks"],
        });
    }
});

export const professionalProfileSchema = z.object({
    yearsOfExperience: z
        .string()
        .trim()
        .min(1, "Years of experience is required")
        .refine((val) => /^\d+$/.test(val), {
            message: "Years of experience must be a valid number",
        })
        .refine((val) => Number(val) >= 0, {
            message: "Years of experience must be 0 or greater",
        })
        .refine((val) => Number(val) <= 50, {
            message: "Years of experience seems invalid",
        })
        .transform((val) => Number(val)),

    specialization: z
        .string()
        .min(1, "Please select your primary specialization")
        .refine((val) => SPECIALIZATIONS.includes(val), {
            error: "Selected specialization is invalid",
        }),

    primaryLicenseType: z
        .string()
        .min(1, "Please select your license type"),

    professionalSummary: z
        .string()
        .min(100, "Professional summary must be at least 100 characters")
        .max(2000, "Professional summary must not exceed 2000 characters"),

    profilePhotoUrl: z
        .url("Invalid profile photo URL")
        .optional()
        .nullable(),
});

export const credentialsSchema = z.object({
    licenseNumber: z
        .string()
        .min(3, "License number must be at least 3 characters")
        .max(100, "License number must not exceed 100 characters"),

    licenseState: z
        .string()
        .min(1, "License state is required")
        .refine((val) => US_STATES.map((s) => s.code).includes(val), {
            message: "Please select a valid US state",
        }),

    licenseDocuments: z
        .array(z.object({
            url: z.url(),
            fileName: z.string(),
            fileSize: z.number(),
            documentType: z.string(),
        }))
        .min(1, "Please upload at least one license document")
        .max(5, "You can upload a maximum of 5 license documents")
});

export const availabilitySchema = z.object({
    schedule: z.object({
        monday: daySchema,
        tuesday: daySchema,
        wednesday: daySchema,
        thursday: daySchema,
        friday: daySchema,
        saturday: daySchema,
        sunday: daySchema,
    }).refine(schedule => Object.values(schedule).some(day => day.enabled), {
        message: "Please enable at least one day of availability",
        path: ["schedule"],
    }),

    acceptingNewPatients: z.boolean(),

    baseZipCode: z
        .string()
        .regex(/^\d{5}(-\d{4})?$/, "Please enter a valid ZIP code")
        .optional(),

    serviceRadiusMiles: z
        .number()
        .min(0, "Service radius must be 0 or greater")
        .max(100, "Service radius must not exceed 100 miles")
        .optional(),
});

export const backgroundCheckSchema = z.object({
    consent: z
        .boolean()
        .refine((val) => val === true, {
            error: "You must consent to the background check to proceed",
        }),

    signature: z
        .string()
        .min(2, "Please type your full legal name")
        .max(255, "Signature must not exceed 255 characters"),
})

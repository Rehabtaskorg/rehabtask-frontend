import z from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";
import { SPECIALIZATIONS } from "./constants/specializations";
import { US_STATES } from "./constants/credentials";

export const DEFAULT_TIME_BLOCK = { startTime: "09:00", endTime: "17:00" };

const US_STATE_CODES = US_STATES.map((s) => s.code);

const usPhoneSchema = z
    .string()
    .min(1, "Phone number is required")
    .refine((val) => isValidPhoneNumber(val, "US"), {
        message: "Please enter a valid US phone number",
    });

export const personalInfoSchema = z.object({
    dateOfBirth: z
        .string()
        .min(1, "Date of birth is required")
        .refine((val) => !isNaN(new Date(val).getTime()), {
            message: "Date of birth must be a valid date",
        })
        .refine((val) => {
            const age = new Date().getFullYear() - new Date(val).getFullYear();
            return age >= 18 && age <= 100;
        }, { message: "You must be between 18 and 100 years old" }),

    phone: usPhoneSchema,

    addressLine1: z.string().min(1, "Address is required").max(255),
    addressLine2: z.string().max(255).optional().nullable(),
    city: z.string().min(1, "City is required").max(100),
    state: z
        .string()
        .min(1, "State is required")
        .refine((val) => US_STATE_CODES.includes(val.toUpperCase()), {
            message: "Please select a valid US state",
        }),
    zipCode: z
        .string()
        .regex(/^\d{5}$/, "ZIP code must be exactly 5 digits"),

    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),

    emergencyContactName: z.string().max(255).optional().nullable(),
    emergencyContactPhone: z
        .string()
        .optional()
        .nullable()
        .refine(
            (val) => !val || isValidPhoneNumber(val, "US"),
            { message: "Please enter a valid US phone number" }
        ),
});

const timeBlockSchema = z.object({
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid start time"),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid end time"),
}).refine(block => block.endTime > block.startTime, {
    error: "End time must be after start time",
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
            error: "Years of experience must be a valid number",
        })
        .refine((val) => Number(val) >= 0, {
            error: "Years of experience must be 0 or greater",
        })
        .refine((val) => Number(val) <= 50, {
            error: "Years of experience seems invalid",
        })
        .transform((val) => Number(val)),

    primaryLicenseType: z
        .string()
        .min(1, "Please select your license type"),

    specialization: z
        .string()
        .optional()
        .nullable()
        .refine((val) => !val || SPECIALIZATIONS.includes(val), {
            message: "Selected specialization is invalid",
        }),

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
        .refine((val) => US_STATE_CODES.includes(val), {
            message: "Please select a valid US state",
        }),

    npiNumber: z
        .string()
        .regex(/^\d{10}$/, "NPI must be exactly 10 digits")
        .optional()
        .nullable(),

    additionalLicenseStates: z
        .array(z.string().length(2))
        .max(50)
        .optional()
        .default([]),

    licenseDocuments: z
        .array(z.object({
            url: z.string().optional(),
            path: z.string(),
            fileName: z.string(),
            fileSize: z.number(),
            documentType: z.string(),
            mimeType: z.string().optional(),
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
        error: "Please enable at least one day of availability",
        path: ["schedule"],
    }),

    acceptingNewPatients: z.boolean(),

    workAreas: z
        .array(
            z.object({
                zipCode: z.string().optional().default(""),
                city: z.string().min(1),
                state: z.string().min(1),
                latitude: z.number().min(-90).max(90),
                longitude: z.number().min(-180).max(180),
                radiusMiles: z.number().int().min(1).max(100),
            })
        )
        .min(1, "Please add at least one work area"),
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
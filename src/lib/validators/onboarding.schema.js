import z from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";
import { US_STATES } from "../constants/credentials";
import {
    THERAPIST_SPECIALTIES,
    THERAPIST_LANGUAGES,
    THERAPIST_CERTIFICATIONS,
    THERAPIST_PAST_SETTINGS,
    THERAPIST_POPULATIONS,
} from "../constants/therapistAttributes";

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

    specialties: z
        .array(z.string().refine((v) => THERAPIST_SPECIALTIES.includes(v), { message: "Invalid specialty" }))
        .max(20)
        .optional()
        .default([]),

    languages: z
        .array(z.string().refine((v) => THERAPIST_LANGUAGES.includes(v), { message: "Invalid language" }))
        .max(20)
        .optional()
        .default([]),

    certifications: z
        .array(z.string().refine((v) => THERAPIST_CERTIFICATIONS.includes(v), { message: "Invalid certification" }))
        .max(20)
        .optional()
        .default([]),

    pastSettings: z
        .array(z.string().refine((v) => THERAPIST_PAST_SETTINGS.includes(v), { message: "Invalid past setting" }))
        .max(20)
        .optional()
        .default([]),

    populationExperience: z
        .array(z.string().refine((v) => THERAPIST_POPULATIONS.includes(v), { message: "Invalid population" }))
        .max(20)
        .optional()
        .default([]),

    yearsInHomeHealth: z
        .string()
        .trim()
        .optional()
        .nullable()
        .refine((val) => !val || (/^\d+$/.test(val) && Number(val) >= 0 && Number(val) <= 50), {
            message: "Must be a number between 0 and 50",
        })
        .transform((val) => (val ? Number(val) : null)),

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
        .or(z.literal(""))
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
        .max(5, "You can upload a maximum of 5 license documents"),

    evaluationRate: z
        .string()
        .trim()
        .optional()
        .nullable()
        .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 10000), {
            message: "Must be between $0 and $10,000",
        })
        .transform((val) => (val ? Number(val) : null)),

    travelFee: z
        .string()
        .trim()
        .optional()
        .nullable()
        .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 500), {
            message: "Must be between $0 and $500",
        })
        .transform((val) => (val ? Number(val) : null)),
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

    availableFrom: z.string().optional().nullable(),
    caseloadCapacity: z
        .union([z.string().trim(), z.number()])
        .optional()
        .nullable()
        .refine((val) => val == null || val === "" || (Number(val) >= 1 && Number(val) <= 999), {
            message: "Must be a number between 1 and 999",
        })
        .transform((val) => (val == null || val === "" ? null : Number(val))),

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

export const hipaaSchema = z.object({
    attested: z.literal(true, { errorMap: () => ({ message: "You must confirm HIPAA compliance" }) }),
    document: z.object({
        url: z.string().optional(),
        path: z.string().min(1),
        fileName: z.string().min(1),
        fileSize: z.number().positive(),
        documentType: z.literal("hipaa_certificate"),
        mimeType: z.string().optional(),
    }).optional().nullable(),
});

const insuranceDocumentSchema = z.object({
    path: z.string(),
    fileName: z.string(),
    fileSize: z.number(),
    documentType: z.enum(["general_liability", "professional_liability", "auto_insurance"]),
    mimeType: z.string().optional(),
});

export const insuranceSchema = z.object({
    doesHomeVisits: z.boolean(),
    documents: z.array(insuranceDocumentSchema),
}).refine(
    (data) => data.documents.some((d) => d.documentType === "general_liability"),
    { message: "General Liability insurance is required", path: ["documents"] }
).refine(
    (data) => data.documents.some((d) => d.documentType === "professional_liability"),
    { message: "Professional Liability insurance is required", path: ["documents"] }
).refine(
    (data) => !data.doesHomeVisits || data.documents.some((d) => d.documentType === "auto_insurance"),
    { message: "Auto Insurance is required because you indicated you perform home visits", path: ["documents"] }
);

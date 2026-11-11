import { z } from "zod";
import { LEAD_CATEGORY_OPTIONS, LEAD_ROLE_OPTIONS } from "@/lib/aiChatConfig";

const ROLE_VALUES = LEAD_ROLE_OPTIONS.map((option) => option.value);
const CATEGORY_VALUES = LEAD_CATEGORY_OPTIONS.map((option) => option.value);

const DISPOSABLE_EMAIL_DOMAINS = new Set([
    "mailinator.com",
    "guerrillamail.com",
    "10minutemail.com",
    "tempmail.com",
    "temp-mail.org",
    "throwawaymail.com",
    "yopmail.com",
    "trashmail.com",
    "sharklasers.com",
    "getnada.com",
    "dispostable.com",
    "fakeinbox.com",
    "maildrop.cc",
    "mailnesia.com",
    "example.com",
    "test.com",
]);

const optionalPhoneSchema = z.preprocess(
    (value) => value || undefined,
    z.string().regex(/^\+1\d{10}$/, "Please enter a valid US phone number").optional()
);

const sharedFields = {
    category: z.enum(CATEGORY_VALUES).optional(),
    context: z
        .string()
        .trim()
        .min(1, "Please tell us what you need help with")
        .max(300, "Please keep this under 300 characters"),
};

const guestSchema = z.object({
    ...sharedFields,
    role: z.enum(ROLE_VALUES, { message: "Please choose which best describes you" }),
    name: z
        .string()
        .trim()
        .min(2, "Please enter your full name")
        .max(80, "Name must be 80 characters or less")
        .regex(/^[\p{L}\s'.-]+$/u, "Name can only contain letters, spaces, hyphens and apostrophes"),
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Please enter a valid email address")
        .max(254)
        .refine((value) => !DISPOSABLE_EMAIL_DOMAINS.has(value.split("@")[1]), {
            message: "Please use a permanent email address we can reply to",
        }),
    phone: optionalPhoneSchema,
});

const accountSchema = z.object(sharedFields);

export const getChatLeadSchema = (hasAccount) => (hasAccount ? accountSchema : guestSchema);

import { z } from "zod";
import { LEAD_ROLE_OPTIONS } from "@/lib/aiChatConfig";

const ROLE_VALUES = LEAD_ROLE_OPTIONS.map((option) => option.value);

const optionalPhoneSchema = z.preprocess(
    (value) => value || undefined,
    z.string().regex(/^\+1\d{10}$/, "Please enter a valid US phone number").optional()
);

export const chatLeadSchema = z.object({
    role: z.enum(ROLE_VALUES, { message: "Please choose which best describes you" }),
    name: z.string().trim().min(1, "Please enter your name").max(80, "Name must be 80 characters or less"),
    email: z.string().trim().email("Please enter a valid email address").max(254),
    phone: optionalPhoneSchema,
    context: z.string().trim().max(300, "Please keep this under 300 characters").optional(),
});

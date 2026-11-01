import { z } from "zod";
import { LEAD_ROLE_OPTIONS } from "@/lib/aiChatConfig";

const ROLE_VALUES = LEAD_ROLE_OPTIONS.map((option) => option.value);

export const chatLeadSchema = z.object({
    role: z.enum(ROLE_VALUES, { message: "Please choose which best describes you" }),
    name: z.string().trim().min(1, "Please enter your name").max(80, "Name must be 80 characters or less"),
    email: z.string().trim().email("Please enter a valid email address").max(254),
    phone: z.string().trim().max(30, "Phone number must be 30 characters or less").optional(),
    context: z.string().trim().max(300, "Please keep this under 300 characters").optional(),
});

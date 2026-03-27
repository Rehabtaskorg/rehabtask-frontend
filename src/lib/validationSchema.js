import z from "zod";

const phoneSchema = z
    .string()
    .regex(
        /^\+1\d{10}$/,
        "Invalid phone number format. Use +1XXXXXXXXXX"
    );

const fullNameSchema = z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must not exceed 255 characters")
    .regex(/^[a-zA-Z\s'.-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .trim();

const licenseNumberSchema = z
    .string()
    .min(3, 'License number must be at least 3 characters')
    .max(100, 'License number must not exceed 100 characters')
    .trim();

export const therapistRegistrationSchema = z
    .object({
        fullName: fullNameSchema,

        email: z
            .email("Please enter a valid email address")
            .transform((val) => val.trim().toLowerCase()),

        phone: phoneSchema,

        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                "Password must contain at least one uppercase letter, one lowercase letter, and one number"
            ),

        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        error: "Passwords must match",
        path: ["confirmPassword"],
    });

export const customerRegistrationSchema = z.object({
    fullName: fullNameSchema,

    email: z
        .email("Please enter a valid email address")
        .transform((val) => val.trim().toLowerCase()),

    phone: phoneSchema,

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/,
            "Password must contain uppercase, lowercase, number, and symbol"
        ),

    customerType: z.enum(["individual", "agency"], {
        required_error: "Please select account type"
    }),

    agencyName: z.string().optional(),
}).refine(
    (data) => {
        if (data.customerType === "agency") {
            return !!data.agencyName && data.agencyName.trim().length >= 2;
        }
        return true;
    }, {
    error: "Agency name is required and must be atleast 2 characters",
    path: ["agencyName"],
}
);

export const loginSchema = z.object({
    email: z
        .email("Please enter a valid email address")
        .min(1, "Email is required")
        .transform((val) => val.trim().toLowerCase()),

    password: z
        .string()
        .min(1, "Password is required"),
});

/**
 * Handles empty strings from form defaults by transforming to undefined
 */
export const oauthOnboardingSchema = z.object({
    role: z.enum(["customer", "therapist"], {
        required_error: "Role is required",
        invalid_type_error: "Role must be either 'customer' or 'therapist'"
    }),

    fullName: fullNameSchema,

    // Customer fields - transform empty strings to undefined
    customerType: z
        .string()
        .transform((val) => val === "" ? undefined : val)
        .pipe(z.enum(["individual", "agency"]).optional()),

    agencyName: z
        .string()
        .transform((val) => val === "" ? undefined : val)
        .pipe(
            z.string()
                .min(2, "Agency name must be at least 2 characters")
                .max(255, "Agency name must not exceed 255 characters")
                .optional()
        ),

}).refine(
    (data) => {
        if (data.role === "customer") {
            return !!data.customerType;
        }
        return true;
    },
    {
        error: "Customer type is required for customers",
        path: ["customerType"]
    }
).refine(
    (data) => {
        if (data.role === "customer" && data.customerType === "agency") {
            return !!data.agencyName?.trim();
        }
        return true;
    },
    {
        error: "Agency name is required and must be at least 2 characters",
        path: ["agencyName"]
    }
)

export const forgotPasswordSchema = z.object({
    email: z
        .email("Please enter a valid email address")
        .min(1, "Email is required")
        .transform((val) => val.trim().toLowerCase()),
});

export const resetPasswordSchema = z.object({
    password: z
        .string()
        .min(8, "Password must be atleast 8 characters")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/,
            "Password must contain uppercase, lowercase, number, and symbol"
        ),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    error: "Passwords must match",
    path: ["confirmPassword"],
});

/**
 * Change password schema (for authenticated users)
 */
export const changePasswordSchema = z.object({
    currentPassword: z
        .string()
        .min(1, "Current password is required"),

    newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/,
            "Password must contain uppercase, lowercase, number, and symbol"
        ),

    confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    error: "Passwords must match",
    path: ["confirmNewPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
    error: "New password must be different from current password",
    path: ["newPassword"]
})
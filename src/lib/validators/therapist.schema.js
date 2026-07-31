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


export const therapistRegistrationSchema = z
    .object({
        fullName: fullNameSchema,

        email: z
            .email("Please enter a valid email address")
            .transform((val) => val.trim().toLowerCase()),

        phone: phoneSchema,

        smsOptIn: z.boolean().optional().default(false),

        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/,
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)"
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

    smsOptIn: z.boolean().optional().default(false),

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

    phone: phoneSchema,

    smsOptIn: z.boolean().optional().default(false),

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
});

/**
 * Validates a patient certification period (start/end dates).
 * @param {string} certificationStart - YYYY-MM-DD
 * @param {string} certificationEnd - YYYY-MM-DD
 * @returns {{certificationStart?: string, certificationEnd?: string}} Field-keyed error messages
 */
export const adminEmailSchema = z.object({
    to: z.email("Invalid email address"),
    subject: z.string().min(1, "Subject is required").max(200, "Subject must be 200 characters or less"),
    message: z.string().min(1, "Message is required").max(5000, "Message must be 5000 characters or less"),
});

export const validateCertificationPeriod = (certificationStart, certificationEnd) => {
    const errors = {};
    if (!certificationStart) errors.certificationStart = "Certification start date is required";
    if (!certificationEnd) errors.certificationEnd = "Certification end date is required";
    if (certificationStart && certificationEnd && certificationEnd < certificationStart) {
        errors.certificationEnd = "Certification end date must be on or after the start date";
    }
    return errors;
};
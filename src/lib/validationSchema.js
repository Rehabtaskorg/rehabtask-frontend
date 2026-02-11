import z from "zod";

export const therapistRegistrationSchema = z
    .object({
        fullName: z
            .string()
            .min(2, "Full name must be atleast 2 characters")
            .max(100, "Full name must not exceed 100 characters")
            .regex(/^[a-zA-Z\s.'-]+$/, "Please enter a valid name"),

        email: z
            .email("Please enter a valid email address")
            .transform((val) => val.trim().toLowerCase()),

        phone: z
            .string()
            .min(1, "Phone number is required")
            .regex(/^\+1\d{10}$/, "Please enter a valid US phone number"
            ),

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
    fullName: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must not exceed 100 characters")
        .regex(/^[a-zA-Z\s.'-]+$/, "Please enter a valid name"),

    email: z
        .email("Please enter a valid email address")
        .transform((val) => val.trim().toLowerCase()),

    phone: z
        .string()
        .min(1, "Phone number is required")
        .refine(
            (val) => !val || /^\+1\d{10}$/.test(val),
            "Please enter a valid US phone number"
        ),

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

export const oauthOnboardingSchema = z.object({
    role: z.enum(["customer", "therapist"], {
        required_error: "Please select your account type"
    }),

    fullName: z
        .string()
        .min(2, "Full name must be at least 2 characters")
        .max(100, "Full name must not exceed 100 characters")
        .regex(/^[a-zA-Z\s.'-]+$/, "Please enter a valid name"),

    phone: z
        .string()
        .min(1, "Phone number is required")
        .refine(
            (val) => !val || /^\+1\d{10}$/.test(val),
            "Please enter a valid US phone number"
        ),

    customerType: z.enum(["individual", "agency"]).optional(),
    agencyName: z.string().optional(),
    location: z.string().max(500, "Location must not exceed 500 characters").optional(),
    specialization: z.string().max(1000, "Specialization must not exceed 1000 characters").optional(),
    licenseNumber: z.string().max(100, "License number must not exceed 100 characters").optional(),
    workArea: z.string().max(500, "Work area must not exceed 500 characters").optional(),
}).refine(
    (data) => {
        if (data.role === "customer") {
            return !!data.customerType;
        }
        return true;
    },
    {
        message: "Please select account type",
        path: ["customerType"]
    }
).refine(
    (data) => {
        if (data.role === "customer" && data.customerType === "agency") {
            return !!data.agencyName && data.agencyName.trim().length >= 2;
        }
        return true;
    },
    {
        message: "Agency name is required and must be at least 2 characters",
        path: ["agencyName"]
    }
).refine(
    (data) => {
        if (data.role === "therapist") {
            return !!data.licenseNumber && data.licenseNumber.trim().length > 0;
        }
        return true;
    },
    {
        message: "License number is required for therapists",
        path: ["licenseNumber"]
    }
);

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
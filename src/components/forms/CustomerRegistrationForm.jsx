"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { MdArrowForward, MdInfo } from "react-icons/md";
import { FaGoogle } from "react-icons/fa";
import Input from "../ui/Input";
import PhoneInput from "../ui/PhoneInput";
import PasswordInput from "../ui/PasswordInput";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import { useCustomerRegistration } from "@/hooks/useCustomerRegistration";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerRegistrationSchema } from "@/lib/validationSchema";

const CustomerRegistrationForm = () => {
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirect") || null;

    const [accountType, setAccountType] = useState("individual");
    const [googleLoading, setGoogleLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, setValue, clearErrors, control } = useForm({
        resolver: zodResolver(customerRegistrationSchema),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: {
            customerType: "individual",
            fullName: "",
            email: "",
            phone: "",
            password: "",
            agencyName: ""
        }
    });

    const { registerCustomer, isSubmitting, error, success, clearMessages } = useCustomerRegistration(redirectTo);
    const { initiateGoogleLogin } = useGoogleAuth(redirectTo);

    const handleAccountTypeChange = (type) => {
        setAccountType(type);
        setValue("customerType", type);
        clearMessages();
        clearErrors("agencyName");
    }

    const onSubmit = async (data) => {
        await registerCustomer({
            ...data,
            agencyName: data.customerType === "agency" ? data.agencyName : null
        });
    };

    const handleGoogleSignup = async () => {
        setGoogleLoading(true);
        clearMessages();
        const result = await initiateGoogleLogin();
        if (!result?.success) {
            setGoogleLoading(false);
        }
        // On success -> redirect handled by backend/OAuth

    }

    return (
        <div className="max-w-md mx-auto w-full">
            {/* Page Heading */}
            <div className="mb-8">
                <h2 className="text-text-main  text-4xl font-black leading-tight tracking-[-0.033em]">
                    Create Your Account
                </h2>
                <p className="text-text-muted  text-base font-normal leading-normal mt-2">
                    Join the community of rehab professionals and patients
                </p>
            </div>

            {/* Account Type Toggle */}
            <div className="mb-8">
                <div className="flex h-12 w-full items-center justify-center rounded-xl bg-border-subtle  p-1">
                    <label
                        className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 transition-all
                            ${accountType === "individual"
                                ? "bg-white  shadow-sm text-text-main "
                                : "text-text-muted"
                            } text-sm font-semibold`}
                    >
                        <span className="truncate">Individual Patient</span>
                        <input
                            type="radio"
                            value="individual"
                            checked={accountType === "individual"}
                            onChange={() => handleAccountTypeChange("individual")}
                            className="sr-only"
                        />
                    </label>

                    <label
                        className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 transition-all
                            ${accountType === "agency"
                                ? "bg-white  shadow-sm text-text-main "
                                : "text-text-muted"
                            } text-sm font-semibold`}
                    >
                        <span className="truncate">Home Health Agency</span>
                        <input
                            type="radio"
                            value="agency"
                            checked={accountType === "agency"}
                            onChange={() => handleAccountTypeChange("agency")}
                            className="sr-only"
                        />
                    </label>
                </div>
            </div>

            {/* Alert Messages */}
            {error && (
                <div className="mb-6">
                    <Alert type="error" message={error} onClose={clearMessages} />
                </div>
            )}

            {success && (
                <div className="mb-6">
                    <Alert type="success" message={success} onClose={clearMessages} />
                </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Full Name / Agency Name */}
                <Input
                    label={accountType === "agency" ? "Agency Contact Name" : "Full Name"}
                    placeholder={accountType === "agency" ? "e.g., John Smith (Agency Director)" : "e.g., John Doe"}
                    error={errors.fullName?.message}
                    {...register("fullName")}
                    required
                />

                {/* Agency Business Name (only for agency type) */}
                {accountType === "agency" && (
                    <Input
                        label="Business Registration Name"
                        placeholder="e.g., Sunshine Home Health LLC"
                        error={errors.agencyName?.message}
                        {...register("agencyName")}
                        required
                    />
                )}

                {/* Email */}
                <Input
                    label="Email Address"
                    type="email"
                    placeholder="e.g., john@example.com"
                    error={errors.email?.message}
                    {...register("email")}
                    required
                />

                {/* Phone Number */}
                <PhoneInput
                    label="Phone Number"
                    control={control}
                    name="phone"
                    error={errors.phone?.message}
                    required
                />

                {/* Password */}
                <div className="space-y-1.5">
                    <PasswordInput
                        label="Password"
                        placeholder="••••••••"
                        error={errors.password?.message}
                        {...register("password")}
                        required
                    />
                    <p className="text-xs text-text-muted flex items-center gap-1">
                        <MdInfo className="text-sm" />
                        Must be at least 8 characters with uppercase, lowercase, number, and symbol
                    </p>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        className="group"
                    >
                        <span>Create Account</span>
                        <MdArrowForward className="text-xl group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>

                {/* Divider */}
                <div className="relative flex py-5 items-center">
                    <div className="grow border-t border-border-subtle " />
                    <span className="shrink mx-4 text-zinc-400 text-xs uppercase tracking-widest font-bold">
                        Or continue with
                    </span>
                    <div className="grow border-t border-border-subtle " />
                </div>

                {/* Google Signup */}
                <button
                    type="button"
                    onClick={handleGoogleSignup}
                    disabled={googleLoading || isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-border-subtle  rounded-xl hover:bg-zinc-50  transition-colors disabled:opacity-50"
                >
                    {googleLoading ? (
                        <>
                            <svg
                                className="animate-spin h-5 w-5 text-[#4285F4]"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                            </svg>
                            <span className="text-sm font-semibold">Connecting...</span>
                        </>
                    ) : (
                        <>
                            <FaGoogle className="w-5 h-5 text-[#4285F4]" />
                            <span className="text-sm font-semibold">Google</span>
                        </>
                    )}
                </button>

            </form>

        </div>
    )
}

export default CustomerRegistrationForm;
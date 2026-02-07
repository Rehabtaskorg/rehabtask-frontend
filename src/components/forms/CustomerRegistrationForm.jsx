"use client";

import { useState } from "react";
import { MdArrowForward, MdInfo } from "react-icons/md";
import { FaGoogle, FaApple } from "react-icons/fa";
import Input from "../ui/Input";
import PasswordInput from "../ui/PasswordInput";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import { useCustomerRegistration } from "@/hooks/useCustomerRegistration";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerRegistrationSchema } from "@/lib/validationSchema";

const CustomerRegistrationForm = () => {
    const [accountType, setAccountType] = useState("individual");

    const { register, handleSubmit, formState: { errors }, setValue, clearErrors } = useForm({
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

    const { registerCustomer, isSubmitting, error, success, clearMessages } = useCustomerRegistration();

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


    return (
        <div className="max-w-md mx-auto w-full">
            {/* Page Heading */}
            <div className="mb-8">
                <h2 className="text-text-main dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                    Create Your Account
                </h2>
                <p className="text-text-muted dark:text-zinc-400 text-base font-normal leading-normal mt-2">
                    Join the community of rehab professionals and patients
                </p>
            </div>

            {/* Account Type Toggle */}
            <div className="mb-8">
                <div className="flex h-12 w-full items-center justify-center rounded-xl bg-border-subtle dark:bg-zinc-800 p-1">
                    <label
                        className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 transition-all
                            ${accountType === "individual"
                                ? "bg-white dark:bg-zinc-700 shadow-sm text-text-main dark:text-white"
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
                                ? "bg-white dark:bg-zinc-700 shadow-sm text-text-main dark:text-white"
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
                <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="e.g., +1 (555) 000-0000"
                    error={errors.phone?.message}
                    {...register("phone")}
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
                    <div className="grow border-t border-border-subtle dark:border-zinc-700" />
                    <span className="shrink mx-4 text-zinc-400 text-xs uppercase tracking-widest font-bold">
                        Or continue with
                    </span>
                    <div className="grow border-t border-border-subtle dark:border-zinc-700" />
                </div>

                {/* Social Login Buttons */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        className="flex-1 flex items-center justify-center gap-2 py-3 border border-border-subtle dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <FaGoogle className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Google</span>
                    </button>

                    <button
                        type="button"
                        className="flex-1 flex items-center justify-center gap-2 py-3 border border-border-subtle dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <FaApple className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Apple</span>
                    </button>
                </div>
            </form>

        </div>
    )
}

export default CustomerRegistrationForm;
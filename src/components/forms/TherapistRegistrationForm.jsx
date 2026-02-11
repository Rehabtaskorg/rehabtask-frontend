"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import PhoneInput from "../ui/PhoneInput";
import Input from "../ui/Input";
import PasswordInput from "../ui/PasswordInput";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import { therapistRegistrationSchema } from "@/lib/validationSchema";
import { useTherapistRegistration } from "@/hooks/useTherapistRegistration";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { MdInfo } from "react-icons/md";
import { FaGoogle } from "react-icons/fa";

const TherapistRegistrationForm = () => {
    const [googleLoading, setGoogleLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, control } = useForm({
        resolver: zodResolver(therapistRegistrationSchema),
        mode: "onChange",
        reValidateMode: "onChange",
    });

    const { registerTherapist, isSubmitting, error, success, clearMessages } = useTherapistRegistration();

    const { initiateGoogleLogin } = useGoogleAuth();

    const onSubmit = async (data) => {
        await registerTherapist(data);
    };

    const handleGoogleSignup = async () => {
        setGoogleLoading(true);
        clearMessages();

        const result = await initiateGoogleLogin();

        if (!result?.success) {
            setGoogleLoading(false);
        }
        // Success → redirect handled externally
    };

    return (
        <div className="max-w-160 mx-auto bg-white dark:bg-background-dark rounded-xl shadow-sm border border-border-subtle dark:border-[#2a3038] overflow-hidden">
            {/* Form Header */}
            <div className="p-8 border-b border-border-subtle dark:border-[#2a3038]">
                <h2 className="text-3xl font-black leading-tight tracking-tight dark:text-white">
                    Create your professional profile
                </h2>
                <p className="text-text-muted mt-2">
                    Enter your credentials to start receiving patient requests.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                {/* Success/Error Messages */}
                {success && (
                    <Alert
                        type="success"
                        message={success}
                        onClose={clearMessages}
                    />
                )}
                {error && (
                    <Alert
                        type="error"
                        message={error}
                        onClose={clearMessages}
                    />
                )}

                {/* Info Banner */}
                <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-lg flex items-start gap-3">
                    <MdInfo className="text-primary mt-1" size={20} />
                    <p className="text-sm text-primary dark:text-primary/90 leading-relaxed">
                        You will be asked to upload your medical license and NPI number in the
                        next step to verify your professional status.
                    </p>
                </div>

                {/* Basic Info Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <Input
                        label="Full Name"
                        placeholder="Dr. Sarah Wilson"
                        error={errors.fullName?.message}
                        {...register("fullName")}
                        required
                    />
                    <Input
                        label="Professional Email"
                        type="email"
                        placeholder="sarah@clinic.com"
                        error={errors.email?.message}
                        {...register("email")}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PhoneInput
                        label="Phone Number"
                        name="phone"
                        control={control}
                        error={errors.phone?.message}
                        required
                    />

                    <PasswordInput
                        label="Create Password"
                        placeholder="Min. 8 characters"
                        error={errors.password?.message}
                        {...register("password")}
                        required
                    />
                </div>

                <PasswordInput
                    label="Confirm Password"
                    placeholder="Re-enter your password"
                    error={errors.confirmPassword?.message}
                    {...register("confirmPassword")}
                    required
                />

                {/* CTA */}
                <div className="pt-6 space-y-4">
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={isSubmitting}
                        disabled={isSubmitting}
                    >
                        Create Professional Account
                    </Button>

                    <p className="text-xs text-center text-text-muted">
                        By clicking create account, you agree to our{" "}
                        <Link href="/terms" className="text-primary hover:underline">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>

                {/* Divider */}
                <div className="relative flex py-5 items-center">
                    <div className="grow border-t border-border-subtle dark:border-[#2a3038]" />
                    <span className="mx-4 text-xs uppercase font-bold text-text-muted">
                        Or continue with
                    </span>
                    <div className="grow border-t border-border-subtle dark:border-[#2a3038]" />
                </div>

                {/* Google Signup */}
                <button
                    type="button"
                    onClick={handleGoogleSignup}
                    disabled={googleLoading || isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-border-subtle dark:border-[#2a3038] rounded-xl hover:bg-gray-50 dark:hover:bg-background-dark transition-colors disabled:opacity-50"
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
    );
};

export default TherapistRegistrationForm;

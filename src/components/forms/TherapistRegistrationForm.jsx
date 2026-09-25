"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import PhoneInput from "../ui/PhoneInput";
import Input from "../ui/Input";
import PasswordInput from "../ui/PasswordInput";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import { therapistRegistrationSchema } from "@/lib/validators/therapist.schema";
import { useTherapistRegistration } from "@/hooks/useTherapistRegistration";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { usePageTitle } from "@/hooks/usePageTitle";
import { MdInfo } from "react-icons/md";
import { FaGoogle } from "react-icons/fa";

const TherapistRegistrationForm = () => {
    usePageTitle("Therapist Registration");
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirect") || null;

    const [googleLoading, setGoogleLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, control } = useForm({
        resolver: zodResolver(therapistRegistrationSchema),
        mode: "onTouched",
        reValidateMode: "onChange",
    });

    const { registerTherapist, isSubmitting, error, success, clearMessages } = useTherapistRegistration(redirectTo);

    const { initiateGoogleLogin } = useGoogleAuth(redirectTo);

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
        <div className="max-w-160 mx-auto bg-white  rounded-xl shadow-sm border border-border-subtle  overflow-hidden">
            {/* Form Header */}
            <div className="p-8 border-b border-border-subtle ">
                <h2 className="text-3xl font-black leading-tight tracking-tight ">
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
                <div className="bg-primary/5  p-4 rounded-lg flex items-start gap-3">
                    <MdInfo className="text-primary mt-1" size={20} />
                    <p className="text-sm text-primary  leading-relaxed">
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

                <div className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        id="smsOptIn"
                        {...register("smsOptIn")}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-primary"
                    />
                    <label htmlFor="smsOptIn" className="text-sm text-text-muted leading-snug">
                        By checking this box, you agree to receive SMS appointment reminders and
                        notifications from RehabTask. Message and data rates may apply.
                        Reply STOP to opt out at any time.
                    </label>
                </div>

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
                    <div className="grow border-t border-border-subtle " />
                    <span className="mx-4 text-xs uppercase font-bold text-text-muted">
                        Or continue with
                    </span>
                    <div className="grow border-t border-border-subtle " />
                </div>

                {/* Google Signup */}
                <button
                    type="button"
                    onClick={handleGoogleSignup}
                    disabled={googleLoading || isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-border-subtle  rounded-xl hover:bg-gray-50  transition-colors disabled:opacity-50"
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

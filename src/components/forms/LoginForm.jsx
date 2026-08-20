"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdLogin } from "react-icons/md";
import Image from "next/image";
import { FaGoogle } from "react-icons/fa";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Link from "next/link";
import { loginSchema } from "@/lib/validators/therapist.schema";
import { useLogin } from "@/hooks/useLogin";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

/**
 * @param {{ redirectTo?: string | null }} props - `redirectTo` resumes the user at the
 * page they were on before being gated, falling back to their role dashboard when absent.
 */
const LoginForm = ({ redirectTo = null }) => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(loginSchema),
        mode: "onChange",
        reValidateMode: "onChange",
    });

    const { login, isSubmitting, error, needsEmailVerification, resendVerification, clearError } = useLogin(redirectTo);

    const { initiateGoogleLogin } = useGoogleAuth(redirectTo);

    const [resendingEmail, setResendingEmail] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [googleError, setGoogleError] = useState(null);

    const onSubmit = async (data) => {
        await login(data);
    };

    const handleResendVerification = async () => {
        setResendingEmail(true);
        await resendVerification();
        setResendingEmail(false);
    }

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        setGoogleError(null);
        clearError();

        const result = await initiateGoogleLogin();

        if (!result.success) {
            setGoogleError(result.error ?? "Failed to sign in with Google. Please try again.");
            setGoogleLoading(false);
        }
    };

    return (
        <div className="w-full max-w-120 bg-white  shadow-xl rounded-xl overflow-hidden border border-border-subtle ">
            {/* Card Header/Branding */}
            <div className="px-8 pt-8 pb-4">
                <div className="mb-6">
                    <Link href="/" aria-label="Back to RehabTask home">
                        <Image
                            src="/images/logo/rehabtask_horizontal.png"
                            alt="RehabTask"
                            width={160}
                            height={49}
                            className="h-10 w-auto"
                            priority
                        />
                    </Link>
                </div>
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-text-main ">
                        Welcome back
                    </h1>
                    <p className="text-text-muted  text-sm">
                        Please enter your details to sign in to your account.
                    </p>
                </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-4 space-y-4">
                {/* Error Alert */}
                {error && (
                    <Alert
                        type={needsEmailVerification ? "warning" : "error"}
                        message={error}
                        onClose={clearError}
                    />
                )}

                {googleError && (
                    <Alert
                        type="error"
                        message={googleError}
                        onClose={() => setGoogleError(null)}
                    />
                )}

                {/* Email Verification Notice */}
                {needsEmailVerification && (
                    <div>
                        <p className="text-sm text-yellow-800 mb-3">
                            Please verify your email address to continue. Didn&apos;t receive the email?
                        </p>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={handleResendVerification}
                            loading={resendingEmail}
                            disabled={resendingEmail}
                        >
                            Resend Verification Email
                        </Button>
                    </div>
                )}

                {/* Email Field */}
                <Input
                    label="Email Address"
                    type="email"
                    placeholder="e.g. name@rehabtask.com"
                    error={errors.email?.message}
                    {...register("email")}
                    required
                />

                {/* Password Field */}
                <PasswordInput
                    label="Password"
                    placeholder="Enter your password"
                    error={errors.password?.message}
                    {...register("password")}
                    required
                />

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between py-2">
                    <Link
                        href="/forgot-password"
                        className="text-primary text-sm font-semibold hover:underline"
                    >
                        Forgot password?
                    </Link>
                </div>

                {/* Primary Action */}
                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    className="group"
                >
                    <span>Log In</span>
                    <MdLogin className="text-lg group-hover:translate-x-0.5 transition-transform" />
                </Button>

                {/* Separator */}
                <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border-subtle " />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white  px-2 text-text-muted font-medium">
                            Or continue with
                        </span>
                    </div>
                </div>

                {/* Social Login - Google Only */}
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isSubmitting || googleLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-border-subtle  rounded-lg hover:bg-gray-50  transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            <span className="text-sm font-semibold text-text-main ">
                                Connecting...
                            </span>
                        </>
                    ) : (
                        <>
                            <FaGoogle className="w-5 h-5 text-[#4285F4]" />
                            <span className="text-sm font-semibold text-text-main ">
                                Continue with Google
                            </span>
                        </>
                    )}
                </button>
            </form>

            {/* Card Footer */}
            <div className="px-8 py-6 bg-gray-50  text-center border-t border-border-subtle ">
                <p className="text-sm text-text-muted  mb-2">
                    Don&apos;t have an account?
                </p>
                <div className="flex items-center justify-center gap-4">
                    <Link
                        href="/register/customer"
                        className="text-primary font-bold hover:underline text-sm"
                    >
                        Sign up as Customer
                    </Link>
                    <span className="text-text-muted">|</span>
                    <Link
                        href="/register/therapist"
                        className="text-primary font-bold hover:underline text-sm"
                    >
                        Sign up as Therapist
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;

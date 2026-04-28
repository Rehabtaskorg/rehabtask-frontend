"use client";

import { useEffect, useState } from "react";
import { MdMail, MdLogin } from "react-icons/md";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import Link from "next/link";

const EmailVerificationCard = ({ email, onResend }) => {
    const [isResending, setIsResending] = useState(false);
    const [alert, setAlert] = useState(null);
    const [countdown, setCountdown] = useState(0);

    // timer logic
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [countdown])

    const handleResend = async () => {
        if (countdown > 0) return;

        setIsResending(true);
        setAlert(null);

        try {
            await onResend();
            setAlert({ type: "success", message: "Verification email has been resent. Please check your inbox." });
            setCountdown(60);// start 60-second cooldown
        } catch (error) {
            setAlert({ type: "error", message: error.message || "Failed to resend verification email. Please try again." });
        } finally {
            setIsResending(false);
        }

    }

    return (
        <div className="max-w-140 w-full bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 md:p-12">
            {/* Icon and Header */}
            <div className="flex flex-col items-center justify-center mb-8">
                <div className="relative w-32 h-32 flex items-center justify-center bg-primary/10 rounded-full mb-6">
                    <MdMail className="text-primary text-6xl" />

                    {/* Medical Pulse Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <svg className="w-24 h-24 text-primary/40" viewBox="0 0 100 100">
                            <path
                                className="animate-pulse-line"
                                d="M10 50 L30 50 L35 30 L45 70 L55 20 L65 80 L70 50 L90 50"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                            />
                        </svg>
                    </div>
                </div>

                <h1 className="text-text-main dark:text-white tracking-tight text-[32px] font-bold leading-tight text-center pb-3">
                    Verify Your Email
                </h1>

                <p className="text-text-muted dark:text-gray-400 text-base font-normal leading-relaxed text-center max-w-100">
                    We&apos;ve sent a verification link to <span className="font-semibold text-text-main dark:text-white">{email}</span>.
                    Please click the link to activate your account and start your journey on our rehabilitation marketplace.
                </p>
            </div>

            {/* Alert Messages */}
            {alert && (
                <div className="mb-6">
                    <Alert
                        type={alert.type}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                </div>
            )}

            {/* Action Area */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col items-center gap-3">
                    <p className="text-sm text-text-muted dark:text-gray-500">
                        Didn&apos;t receive the email?
                    </p>

                    <Button
                        variant="primary"
                        size="md"
                        fullWidth={false}
                        loading={isResending}
                        disabled={countdown > 0}
                        onClick={handleResend}
                        className="min-w-60"
                    >
                        {isResending
                            ? "Sending..."
                            : countdown > 0
                                ? `Resend available in ${countdown}s`
                                : "Resend Verification Link"}
                    </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-border-subtle dark:border-gray-800 flex flex-col items-center gap-3">
                    <Link
                        href="/login"
                        className="text-primary text-sm font-semibold hover:underline flex items-center gap-1 transition-colors"
                    >
                        <MdLogin className="text-base" />
                        Go to Login
                    </Link>

                    <Link
                        href="/forgot-password"
                        className="text-text-muted dark:text-gray-500 text-sm hover:text-primary dark:hover:text-primary transition-colors"
                    >
                        Already have an account? Forgot your password?
                    </Link>

                    <Link
                        href="/support"
                        className="text-gray-400 dark:text-gray-600 text-xs hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                    >
                        Need help? Contact our support team
                    </Link>
                </div>
            </div>

            {/* Visual Decoration */}
            <div className="fixed bottom-0 left-0 -z-10 w-full h-1/3 opacity-20 dark:opacity-5 pointer-events-none overflow-hidden">
                <svg
                    className="absolute -bottom-20 -left-20 text-primary w-100 h-100"
                    fill="currentColor"
                    viewBox="0 0 200 200"
                >
                    <path
                        d="M40,-62.7C52.2,-54.5,62.5,-43.9,69.6,-31.4C76.7,-18.9,80.7,-4.4,78.2,9.3C75.7,23,66.7,35.9,56,46.1C45.3,56.3,32.9,63.8,19.3,68.4C5.7,73,-9.1,74.7,-22.8,70.5C-36.5,66.3,-49.2,56.2,-59.4,43.6C-69.6,31,-77.3,16,-78.6,0.7C-79.9,-14.5,-74.8,-30.1,-64.8,-42.6C-54.8,-55.1,-39.9,-64.6,-25.5,-70.6C-11,-76.6,3,-79.2,16.5,-76.3C30,-73.4,27.8,-70.9,40,-62.7Z"
                        transform="translate(100 100)"
                    />
                </svg>
            </div>
        </div>
    )
}

export default EmailVerificationCard
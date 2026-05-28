"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MdMail, MdLogin, MdCheckCircle } from "react-icons/md";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import Link from "next/link";

/**
 * Inline prompt shown when the resend call reveals the email is already verified.
 * Replaces the alert so the user gets a direct path to login.
 *
 * @param {{ email: string }} props
 * @returns {JSX.Element}
 */
function AlreadyVerifiedPrompt({ email }) {
    const router = useRouter();
    return (
        <div className="flex flex-col items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
            <MdCheckCircle className="text-green-600 text-2xl" />
            <p className="text-sm text-green-800 text-center font-medium">
                <span className="font-semibold">{email}</span> is already verified.
            </p>
            <button
                onClick={() => router.push("/login")}
                className="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
                Go to Login
            </button>
        </div>
    );
}

/**
 * Card shown after registration or after a verification link is (re)sent.
 * Provides a timed resend button with a 60-second cooldown.
 *
 * `onResend` must return a Promise. If it rejects with an Error that has
 * a `code` property of `"EMAIL_ALREADY_VERIFIED"`, the card switches to
 * an AlreadyVerifiedPrompt instead of a generic error alert.
 *
 * @param {{ email: string, onResend: () => Promise<void> }} props
 * @returns {JSX.Element}
 */
const EmailVerificationCard = ({ email, onResend }) => {
    const [isResending, setIsResending] = useState(false);
    const [alert, setAlert] = useState(null);
    const [countdown, setCountdown] = useState(0);
    const [alreadyVerified, setAlreadyVerified] = useState(false);

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const handleResend = async () => {
        if (countdown > 0) return;

        setIsResending(true);
        setAlert(null);

        try {
            await onResend();
            setAlert({ type: "success", message: "Verification email has been resent. Please check your inbox." });
            setCountdown(60);
        } catch (err) {
            if (err?.code === "EMAIL_ALREADY_VERIFIED") {
                setAlreadyVerified(true);
                return;
            }
            setAlert({ type: "error", message: err.message || "Failed to resend verification email. Please try again." });
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="max-w-140 w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12">
            <div className="flex flex-col items-center justify-center mb-8">
                <div className="relative w-32 h-32 flex items-center justify-center bg-primary/10 rounded-full mb-6">
                    <MdMail className="text-primary text-6xl" />

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

                <h1 className="text-text-main tracking-tight text-[32px] font-bold leading-tight text-center pb-3">
                    Verify Your Email
                </h1>

                <p className="text-text-muted text-base font-normal leading-relaxed text-center max-w-100">
                    We&apos;ve sent a verification link to{" "}
                    <span className="font-semibold text-text-main">{email}</span>.
                    Please click the link to activate your account and start your journey on our rehabilitation marketplace.
                </p>
            </div>

            {alreadyVerified ? (
                <AlreadyVerifiedPrompt email={email} />
            ) : (
                <>
                    {alert && (
                        <div className="mb-6">
                            <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
                        </div>
                    )}

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col items-center gap-3">
                            <p className="text-sm text-text-muted">Didn&apos;t receive the email?</p>
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

                        <div className="mt-6 pt-6 border-t border-border-subtle flex flex-col items-center gap-3">
                            <Link
                                href="/login"
                                className="text-primary text-sm font-semibold hover:underline flex items-center gap-1 transition-colors"
                            >
                                <MdLogin className="text-base" />
                                Go to Login
                            </Link>

                            <Link
                                href="/forgot-password"
                                className="text-text-muted text-sm hover:text-primary transition-colors"
                            >
                                Already have an account? Forgot your password?
                            </Link>

                            <Link
                                href="/support"
                                className="text-gray-400 text-xs hover:text-gray-600 transition-colors"
                            >
                                Need help? Contact our support team
                            </Link>
                        </div>
                    </div>
                </>
            )}

            <div className="fixed bottom-0 left-0 -z-10 w-full h-1/3 opacity-20 pointer-events-none overflow-hidden">
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
    );
};

export default EmailVerificationCard;
"use client";

import { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdLock, MdCheck } from "react-icons/md";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Link from "next/link";
import Footer from "@/components/shared/Footer";
import { resetPasswordSchema } from "@/lib/validationSchema";
import { supabase } from "@/lib/supabase";
import { authAPi } from "@/lib/auth.api";
import { usePageTitle } from "@/hooks/usePageTitle";

function InviteAcceptContent() {
    usePageTitle("Accept Invite");
    const router = useRouter();
    const [isValidSession, setIsValidSession] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [sessionUserId, setSessionUserId] = useState(null);

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        resolver: zodResolver(resetPasswordSchema),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const password = watch("password");

    // Check if we have a valid session from the invite link
    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError || !session) {
                    setIsValidSession(false);
                    setError("Invalid or expired invite link. Please ask your administrator to resend the invitation.");
                } else {
                    setIsValidSession(true);
                    setSessionUserId(session.user.id);
                }
            } catch (err) {
                console.error("Session check error:", err);
                setIsValidSession(false);
                setError("Failed to verify invite link. Please try again.");
            } finally {
                setIsChecking(false);
            }
        };

        checkSession();
    }, []);

    const passwordStrength = useMemo(() => {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
        if (/\d/.test(password)) strength += 25;
        if (/[@$!%*?&#]/.test(password)) strength += 25;
        return strength;
    }, [password]);

    const strengthLabel = useMemo(() => {
        if (passwordStrength >= 75) return "Strong";
        if (passwordStrength >= 50) return "Good";
        if (passwordStrength >= 25) return "Fair";
        return "Weak";
    }, [passwordStrength]);

    const strengthColor = useMemo(() => {
        if (passwordStrength >= 75) return "text-green-600 dark:text-green-400";
        if (passwordStrength >= 50) return "text-yellow-600 dark:text-yellow-400";
        return "text-red-600 dark:text-red-400";
    }, [passwordStrength]);

    const barColor = useMemo(() => {
        if (passwordStrength >= 75) return "bg-green-500";
        if (passwordStrength >= 50) return "bg-yellow-500";
        return "bg-red-500";
    }, [passwordStrength]);

    const requirements = useMemo(
        () => [
            { label: "At least 8 characters", met: password.length >= 8 },
            { label: "One uppercase letter", met: /[A-Z]/.test(password) },
            { label: "One number or special character", met: /\d/.test(password) || /[@$!%*?&#]/.test(password) },
        ],
        [password]
    );

    const onSubmit = async (data) => {
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        try {
            // Set the password using Supabase (session is already established from the invite link)
            const { error: updateError } = await supabase.auth.updateUser({
                password: data.password,
            });

            if (updateError) {
                throw updateError;
            }

            // Mark email as verified in the backend
            if (sessionUserId) {
                await authAPi.verifyEmail(sessionUserId);
            }

            setSuccess("Password set successfully! Redirecting to login...");

            // Sign out the temporary invite session
            await supabase.auth.signOut();

            setTimeout(() => {
                router.push("/login?invited=true");
            }, 1500);
        } catch (err) {
            console.error("Set password error:", err);
            setError(err.message || "Failed to set password. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isChecking) {
        return (
            <div className="max-w-120 w-full bg-white dark:bg-[#1a242f] shadow-xl rounded-xl p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-text-muted dark:text-gray-400">Verifying your invite...</p>
                </div>
            </div>
        );
    }

    if (!isValidSession) {
        return (
            <div className="max-w-120 w-full bg-white dark:bg-[#1a242f] shadow-xl rounded-xl p-8 border border-border-subtle dark:border-gray-800">
                <Alert
                    type="error"
                    message={error || "Invalid or expired invite link. Please ask your administrator to resend the invitation."}
                />
                <div className="mt-6 flex flex-col gap-3 items-center">
                    <Link href="/login" className="text-primary text-sm font-semibold hover:underline">
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-120 bg-white dark:bg-[#1a242f] rounded-xl shadow-xl border border-border-subtle dark:border-gray-800 overflow-hidden">
            {/* Page Heading */}
            <div className="p-8 pb-4 text-center">
                <h1 className="text-text-main dark:text-white text-3xl font-black leading-tight tracking-[-0.033em] mb-2">
                    Welcome to RehabTask
                </h1>
                <p className="text-text-muted dark:text-gray-400 text-base font-normal">
                    Set a password to complete your account setup.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8 space-y-4">
                {error && !success && (
                    <Alert type="error" message={error} onClose={() => setError(null)} />
                )}

                {success && (
                    <Alert type="success" message={success} />
                )}

                <PasswordInput
                    label="Password"
                    placeholder="Choose a strong password"
                    error={errors.password?.message}
                    {...register("password")}
                    required
                />

                <PasswordInput
                    label="Confirm Password"
                    placeholder="Repeat your password"
                    error={errors.confirmPassword?.message}
                    {...register("confirmPassword")}
                    required
                />

                {/* Password Strength Indicator */}
                {password && (
                    <div className="flex flex-col gap-3 py-2">
                        <div className="flex gap-6 justify-between items-center">
                            <p className="text-text-main dark:text-gray-200 text-sm font-medium">
                                Password Strength: <span className={strengthColor}>{strengthLabel}</span>
                            </p>
                            <p className="text-text-main dark:text-gray-200 text-sm font-normal">{passwordStrength}%</p>
                        </div>
                        <div className="rounded-full bg-border-subtle dark:bg-gray-700 h-2 overflow-hidden">
                            <div
                                className={`h-2 rounded-full ${barColor} transition-all duration-300`}
                                style={{ width: `${passwordStrength}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Requirements Checklist */}
                <div className="bg-background-light dark:bg-background-dark rounded-lg p-4 space-y-3 border border-border-subtle dark:border-gray-800">
                    {requirements.map((req, index) => (
                        <label key={index} className="flex items-center gap-x-3 cursor-default">
                            <div
                                className={`h-5 w-5 flex items-center justify-center rounded border-2 transition-all ${req.met
                                    ? "border-primary bg-primary text-white"
                                    : "border-border-subtle dark:border-gray-600"
                                    }`}
                            >
                                {req.met && <MdCheck className="text-[16px] font-bold" />}
                            </div>
                            <p
                                className={`text-sm ${req.met
                                    ? "text-text-main dark:text-gray-300 font-medium"
                                    : "text-text-main dark:text-gray-300 font-normal opacity-60"
                                    }`}
                            >
                                {req.label}
                            </p>
                        </label>
                    ))}
                </div>

                <div className="pt-4">
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        className="group shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all"
                    >
                        <span>Set Password & Continue</span>
                    </Button>
                    <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <MdLock className="text-sm" />
                        <p>Secure, encrypted connection</p>
                    </div>
                </div>
            </form>

            <div className="p-6 bg-background-light/50 dark:bg-background-dark/30 border-t border-border-subtle dark:border-gray-800 text-center">
                <Link href="/login" className="text-primary text-sm font-semibold hover:underline">
                    Back to Login
                </Link>
            </div>
        </div>
    );
}

export default function InviteAcceptPage() {
    return (
        <div className="flex min-h-screen flex-col transition-colors duration-200">
            <main className="flex-1 flex items-center justify-center px-4 py-12 bg-background-light dark:bg-background-dark">
                <InviteAcceptContent />
            </main>
            <Footer />
        </div>
    );
}

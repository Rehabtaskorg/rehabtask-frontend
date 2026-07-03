"use client";

import { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdLock, MdCheck } from "react-icons/md";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import PasswordInput from "../ui/PasswordInput";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import Link from "next/link";
import { resetPasswordSchema } from "@/lib/validationSchema";

/**
 * Password reset form — reads oobCode from the URL (set by Identity Platform
 * in the password reset email link), validates it, then calls
 * confirmPasswordReset to set the new password.
 *
 * @returns {JSX.Element}
 */
function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [oobCode, setOobCode] = useState(null);
    const [isValidToken, setIsValidToken] = useState(false);
    const [isCheckingToken, setIsCheckingToken] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

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

    useEffect(() => {
        const checkResetCode = async () => {
            const code = searchParams.get("oobCode");

            if (!code) {
                setIsValidToken(false);
                setError("Invalid or expired reset link. Please request a new password reset.");
                setIsCheckingToken(false);
                return;
            }

            try {
                await verifyPasswordResetCode(firebaseAuth, code);
                setOobCode(code);
                setIsValidToken(true);
            } catch {
                setIsValidToken(false);
                setError("Invalid or expired reset link. Please request a new password reset.");
            } finally {
                setIsCheckingToken(false);
            }
        };

        checkResetCode();
    }, [searchParams]);

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
        if (passwordStrength >= 75) return "text-green-600 ";
        if (passwordStrength >= 50) return "text-yellow-600 ";
        return "text-red-600 ";
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

    const handleSubmit_ = async (data) => {
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        try {
            await confirmPasswordReset(firebaseAuth, oobCode, data.password);

            setSuccess("Password updated successfully! Redirecting...");

            setTimeout(() => {
                router.push("/reset-password/success");
            }, 1500);
        } catch {
            setError("Failed to reset password. The link may have expired — please request a new one.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isCheckingToken) {
        return (
            <div className="max-w-120 w-full bg-white shadow-xl rounded-xl p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-text-muted">Verifying reset link...</p>
                </div>
            </div>
        );
    }

    if (!isValidToken) {
        return (
            <div className="max-w-120 w-full bg-white shadow-xl rounded-xl p-8 border border-border-subtle">
                <Alert
                    type="error"
                    message={error || "Invalid or expired reset link. Please request a new password reset."}
                />
                <div className="mt-6 flex flex-col gap-3 items-center">
                    <Link href="/forgot-password" className="text-primary text-sm font-semibold hover:underline">
                        Request New Reset Link
                    </Link>
                    <Link href="/login" className="text-text-muted text-sm hover:underline">
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-120 bg-white rounded-xl shadow-xl border border-border-subtle overflow-hidden">
            <div className="p-8 pb-4 text-center">
                <h1 className="text-text-main text-3xl font-black leading-tight tracking-[-0.033em] mb-2">
                    Create New Password
                </h1>
                <p className="text-text-muted text-base font-normal">
                    Choose a strong password to secure your personal health records.
                </p>
            </div>

            <form onSubmit={handleSubmit(handleSubmit_)} className="px-8 pb-8 space-y-4">
                {error && !success && (
                    <Alert type="error" message={error} onClose={() => setError(null)} />
                )}

                {success && (
                    <Alert type="success" message={success} />
                )}

                <PasswordInput
                    label="New Password"
                    placeholder="Enter your new password"
                    error={errors.password?.message}
                    {...register("password")}
                    required
                />

                <PasswordInput
                    label="Confirm New Password"
                    placeholder="Repeat your new password"
                    error={errors.confirmPassword?.message}
                    {...register("confirmPassword")}
                    required
                />

                {password && (
                    <div className="flex flex-col gap-3 py-2">
                        <div className="flex gap-6 justify-between items-center">
                            <p className="text-text-main text-sm font-medium">
                                Password Strength: <span className={strengthColor}>{strengthLabel}</span>
                            </p>
                            <p className="text-text-main text-sm font-normal">{passwordStrength}%</p>
                        </div>
                        <div className="rounded-full bg-border-subtle h-2 overflow-hidden">
                            <div
                                className={`h-2 rounded-full ${barColor} transition-all duration-300`}
                                style={{ width: `${passwordStrength}%` }}
                            />
                        </div>
                        <p className="text-text-muted text-xs font-normal italic">
                            Stronger passwords help protect your sensitive medical information.
                        </p>
                    </div>
                )}

                <div className="bg-background-light rounded-lg p-4 space-y-3 border border-border-subtle">
                    {requirements.map((req, index) => (
                        <label key={index} className="flex items-center gap-x-3 cursor-default">
                            <div
                                className={`h-5 w-5 flex items-center justify-center rounded border-2 transition-all ${req.met
                                    ? "border-primary bg-primary text-white"
                                    : "border-border-subtle"
                                    }`}
                            >
                                {req.met && <MdCheck className="text-[16px] font-bold" />}
                            </div>
                            <p
                                className={`text-sm ${req.met
                                    ? "text-text-main font-medium"
                                    : "text-text-main font-normal opacity-60"
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
                        <span>Update Password</span>
                    </Button>
                    <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                        <MdLock className="text-sm" />
                        <p>Secure, encrypted connection</p>
                    </div>
                </div>
            </form>

            <div className="p-6 bg-background-light/50 border-t border-border-subtle text-center">
                <Link href="/login" className="text-primary text-sm font-semibold hover:underline">
                    Back to Login
                </Link>
            </div>
        </div>
    );
}

export default ResetPasswordForm;
"use client";

import { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdLock, MdCheck } from "react-icons/md";
import { useRouter, useSearchParams } from "next/navigation";
import {
    signInWithEmailLink,
    updatePassword,
    signOut,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { authAPi } from "@/services/auth.api";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Link from "next/link";
import { z } from "zod";
import { usePageTitle } from "@/hooks/usePageTitle";

const inviteAcceptSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/, "Password must contain uppercase, lowercase, number, and symbol"),
    confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

/**
 * Sub-admin invite acceptance content.
 *
 * Validates the email sign-in link from Identity Platform, prompts the
 * sub-admin to set their full name and password, then signs them in via
 * the email link, sets their password, exchanges the Firebase tokens for
 * session cookies via the backend, and marks their account as verified.
 *
 * @returns {JSX.Element}
 */
export function InviteAcceptContent() {
    usePageTitle("Accept Invite");
    const router = useRouter();
    const searchParams = useSearchParams();

    const [inviteEmail, setInviteEmail] = useState(null);
    const [isValidLink, setIsValidLink] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        resolver: zodResolver(inviteAcceptSchema),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: {
            fullName: "",
            password: "",
            confirmPassword: "",
        },
    });

    const password = watch("password");

    useEffect(() => {
        const email = searchParams.get("email");
        const oobCode = searchParams.get("oobCode");

        if (!email || !oobCode) {
            setIsValidLink(false);
            setError("Invalid or expired invite link. Please ask your administrator to resend the invitation.");
            setIsChecking(false);
            return;
        }

        setInviteEmail(email);
        setIsValidLink(true);
        setIsChecking(false);
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

    const onSubmit = async (data) => {
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        try {
            const oobCode = searchParams.get("oobCode");
            const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
            const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
            const tenantId = process.env.NEXT_PUBLIC_IDENTITY_PLATFORM_TENANT_ID;
            const firebaseSignInUrl = `https://${authDomain}/__/auth/action?mode=signIn&oobCode=${encodeURIComponent(oobCode)}&apiKey=${encodeURIComponent(apiKey)}&tenantId=${encodeURIComponent(tenantId)}`;
            const credential = await signInWithEmailLink(getFirebaseAuth(), inviteEmail, firebaseSignInUrl);
            const firebaseUser = credential.user;

            await updatePassword(firebaseUser, data.password);

            const idToken = await firebaseUser.getIdToken();
            const refreshToken = firebaseUser.refreshToken;

            await authAPi.processOAuth(idToken, refreshToken);

            await authAPi.verifyEmail(firebaseUser.uid, data.fullName);

            await signOut(getFirebaseAuth());

            setSuccess("Password set successfully! Redirecting to login...");

            setTimeout(() => {
                router.push("/login?invited=true");
            }, 1500);
        } catch (err) {
            const isLinkExpired =
                err?.code === "auth/invalid-action-code" ||
                err?.code === "auth/expired-action-code";

            setError(
                isLinkExpired
                    ? "This invite link has expired. Please ask your administrator to resend the invitation."
                    : "Failed to set password. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isChecking) {
        return (
            <div className="max-w-120 w-full bg-white shadow-xl rounded-xl p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-text-muted">Verifying your invite...</p>
                </div>
            </div>
        );
    }

    if (!isValidLink) {
        return (
            <div className="max-w-120 w-full bg-white shadow-xl rounded-xl p-8 border border-border-subtle">
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
        <div className="w-full max-w-120 bg-white rounded-xl shadow-xl border border-border-subtle overflow-hidden">
            <div className="p-8 pb-4 text-center">
                <h1 className="text-text-main text-3xl font-black leading-tight tracking-[-0.033em] mb-2">
                    Welcome to RehabTask
                </h1>
                <p className="text-text-muted text-base font-normal">
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

                <div>
                    <label className="block text-sm font-medium text-text-main mb-1">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Your full name"
                        {...register("fullName")}
                        className="w-full rounded-lg border border-border-subtle bg-white text-text-main text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.fullName && (
                        <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>
                    )}
                </div>

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
                        <span>Set Password & Continue</span>
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

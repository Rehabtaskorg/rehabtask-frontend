"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { applyActionCode, checkActionCode } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import Alert from "@/components/ui/Alert";
import Footer from "@/components/shared/Footer";
import VerificationSuccess from "@/components/verification/VerificationSuccess";
import { authAPi } from "@/lib/auth.api";
import { getFirstName } from "@/utils/userSession";
import { usePageTitle } from "@/hooks/usePageTitle";
import { USER_ROLES } from "@/lib/constants";

/** Max time to wait before treating the oobCode as missing or invalid. */
const VERIFICATION_TIMEOUT_MS = 10_000;

/**
 * Reads the oobCode from the URL, applies it via Firebase to mark the email
 * verified in Identity Platform, then calls the backend to sync the verified
 * state to Prisma. Handles customers (shows VerificationSuccess UI) and
 * therapists (redirects to login with a success flag).
 *
 * @returns {JSX.Element}
 */
function VerifyCallbackContent() {
    usePageTitle("Verifying Email");
    const router = useRouter();
    const searchParams = useSearchParams();
    const posthog = usePostHog();

    const [status, setStatus] = useState("verifying");
    const [message, setMessage] = useState("Verifying your email...");
    const [userInfo, setUserInfo] = useState(null);
    const [verifiedEmail, setVerifiedEmail] = useState(null);

    useEffect(() => {
        let settled = false;

        const verify = async () => {
            const oobCode = searchParams.get("oobCode");

            if (!oobCode) {
                settled = true;
                setStatus("error");
                setMessage("Verification failed. The link may be expired or invalid.");
                return;
            }

            try {
                const actionInfo = await checkActionCode(firebaseAuth, oobCode);
                const email = actionInfo.data.email;
                if (email) setVerifiedEmail(email);

                await applyActionCode(firebaseAuth, oobCode);

                const response = await authAPi.verifyEmail(null, null, email);
                const user = response?.data?.data?.user || null;

                if (user) setUserInfo(user);

                posthog?.capture("email_verified", { role: user?.role });

                settled = true;
                setStatus("success");

                if (user?.role === USER_ROLES.THERAPIST) {
                    setMessage("Email verified successfully! Redirecting to login...");
                    setTimeout(() => {
                        router.push(`/login?verified=true&role=${USER_ROLES.THERAPIST}`);
                    }, 2000);
                }
            } catch {
                if (!settled) {
                    settled = true;
                    setStatus("error");
                    setMessage("Verification failed. The link may be expired or invalid.");
                }
            }
        };

        const timeout = setTimeout(() => {
            if (!settled) {
                settled = true;
                setStatus("error");
                setMessage("Verification failed. The link may be expired or invalid.");
            }
        }, VERIFICATION_TIMEOUT_MS);

        verify();

        return () => clearTimeout(timeout);
    }, [router, posthog, searchParams]);

    const handleContinue = () => {
        router.push(`/login?verified=true&role=${USER_ROLES.CUSTOMER}`);
    };

    return (
        <main className="flex-1 flex items-center justify-center px-4 py-12 bg-background-light">
            <div className="max-w-md w-full">
                {status === "verifying" && (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                        <p className="text-text-muted">{message}</p>
                    </div>
                )}

                {status === "success" && userInfo?.role === USER_ROLES.CUSTOMER && (
                    <VerificationSuccess
                        userName={getFirstName(userInfo.fullName)}
                        onContinue={handleContinue}
                    />
                )}

                {status === "success" && userInfo?.role === USER_ROLES.THERAPIST && (
                    <Alert type="success" message={message} />
                )}

                {status === "error" && (
                    <div className="space-y-4">
                        <Alert type="error" message={message} />
                        <div className="text-center">
                            <button
                                onClick={() => {
                                    router.push(verifiedEmail
                                        ? `/verify-email?email=${encodeURIComponent(verifiedEmail)}`
                                        : "/verify-email"
                                    );
                                }}
                                className="text-primary text-sm font-semibold hover:underline"
                            >
                                Request new verification link
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

export default function VerifyCallbackPage() {
    return (
        <div className="flex min-h-screen flex-col transition-colors duration-200">
            <VerifyCallbackContent />
            <Footer />
        </div>
    );
}
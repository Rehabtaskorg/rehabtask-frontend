"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { supabase } from "@/lib/supabase";
import Alert from "@/components/ui/Alert";
import Footer from "@/components/shared/Footer";
import VerificationSuccess from "@/components/verification/VerificationSuccess";
import { authAPi } from "@/lib/auth.api";
import { getSessionUserInfo, getFirstName } from "@/utils/userSession";
import { usePageTitle } from "@/hooks/usePageTitle";
import { USER_ROLES } from "@/lib/constants";

/** Max time to wait for Supabase to parse the URL hash and emit SIGNED_IN. */
const AUTH_EVENT_TIMEOUT_MS = 10_000;

/**
 * Listens for the Supabase SIGNED_IN event that fires after the SDK parses
 * the URL hash from the email verification link, then calls the backend to
 * mark the email verified in our DB.
 *
 * Using onAuthStateChange (not getSession) is required because getSession()
 * races against the hash-parsing step and returns null when called too early.
 */
function VerifyCallbackContent() {
    usePageTitle("Verifying Email");
    const router = useRouter();
    const posthog = usePostHog();

    const [status, setStatus] = useState("verifying");
    const [message, setMessage] = useState("Verifying your email...");
    const [userInfo, setUserInfo] = useState(null);
    const [sessionEmail, setSessionEmail] = useState(null);

    useEffect(() => {
        let settled = false;

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event !== "SIGNED_IN" || settled) return;
            settled = true;

            try {
                if (!session) {
                    setStatus("error");
                    setMessage("No session found. Please try requesting a new verification link.");
                    return;
                }

                if (session.user?.email) setSessionEmail(session.user.email);

                const sessionUser = await getSessionUserInfo();

                if (!sessionUser) {
                    setStatus("error");
                    setMessage("Unable to retrieve user information.");
                    return;
                }

                setUserInfo(sessionUser);

                await authAPi.verifyEmail(session.user.id);

                posthog?.capture("email_verified", { role: sessionUser.role });

                setStatus("success");

                await supabase.auth.signOut();

                if (sessionUser.role === USER_ROLES.THERAPIST) {
                    setMessage("Email verified successfully! Redirecting to login...");
                    setTimeout(() => {
                        router.push(`/login?verified=true&role=${USER_ROLES.THERAPIST}`);
                    }, 2000);
                }
            } catch {
                setStatus("error");
                setMessage("An unexpected error occurred. Please try again.");
            }
        });

        // Fallback: if Supabase never fires SIGNED_IN (invalid/expired link),
        // stop the spinner so the user isn't stuck waiting indefinitely.
        const timeout = setTimeout(() => {
            if (!settled) {
                settled = true;
                setStatus("error");
                setMessage("Verification failed. The link may be expired or invalid.");
            }
        }, AUTH_EVENT_TIMEOUT_MS);

        return () => {
            subscription.unsubscribe();
            clearTimeout(timeout);
        };
    }, [router, posthog]);

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
                                    const email = sessionEmail || userInfo?.email;
                                    router.push(email
                                        ? `/verify-email?email=${encodeURIComponent(email)}`
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

/**
 * Email verification callback page — handles the redirect from Supabase
 * after a user clicks the link in their verification email.
 *
 * @returns {JSX.Element}
 */
export default function VerifyCallbackPage() {
    return (
        <div className="flex min-h-screen flex-col transition-colors duration-200">
            <VerifyCallbackContent />
            <Footer />
        </div>
    );
}
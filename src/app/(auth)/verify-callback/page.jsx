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

function VerifyCallbackContent() {
    usePageTitle("Verifying Email");
    const router = useRouter();
    const posthog = usePostHog();
    const [status, setStatus] = useState("verifying");
    const [message, setMessage] = useState("Verifying your email...");
    const [userInfo, setUserInfo] = useState(null);
    const [sessionEmail, setSessionEmail] = useState(null);

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error("Verification error:", error);
                    setStatus("error");
                    setMessage("Verification failed. The link may be expired or invalid.");
                    return;
                }

                if (!session) {
                    setStatus("error");
                    setMessage("No session found. Please try requesting a new verification link.");
                    return;
                }

                if (session.user?.email) setSessionEmail(session.user.email);

                const sessionUser = getSessionUserInfo();

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

            } catch (error) {
                console.error("Unexpected error:", error);
                setStatus("error");
                setMessage("An unexpected error occurred. Please try again.");
            }
        };

        verifyEmail();
    }, [router, posthog]);

    const handleContinue = () => {
        router.push(`/login?verified=true&role=${USER_ROLES.CUSTOMER}`);
    };

    return (
        <main className="flex-1 flex items-center justify-center px-4 py-12 bg-background-light ">
            <div className="max-w-md w-full">
                {status === "verifying" && (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-text-muted ">{message}</p>
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
                                    router.push(email ? `/verify-email?email=${encodeURIComponent(email)}` : "/verify-email");
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
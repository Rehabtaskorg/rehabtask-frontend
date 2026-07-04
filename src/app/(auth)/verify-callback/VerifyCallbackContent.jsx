"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import Alert from "@/components/ui/Alert";
import VerificationSuccess from "@/components/verification/VerificationSuccess";
import { authAPi } from "@/lib/auth.api";
import { getFirstName } from "@/utils/userSession";
import { usePageTitle } from "@/hooks/usePageTitle";
import { USER_ROLES } from "@/lib/constants";

/**
 * Displays the result of email verification after the action handler at
 * /__/auth/action has processed the oobCode and synced state to Postgres.
 * Receives ?verified=true on success or ?error=invalid on failure.
 *
 * @returns {JSX.Element}
 */
export function VerifyCallbackContent() {
    usePageTitle("Verifying Email");
    const router = useRouter();
    const searchParams = useSearchParams();
    const posthog = usePostHog();

    const [status, setStatus] = useState("loading");
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const verified = searchParams.get("verified");
        const error = searchParams.get("error");

        if (error) {
            setStatus("error");
            return;
        }

        if (verified === "true") {
            authAPi.getCurrentUser()
                .then((res) => {
                    const user = res?.data?.data?.user || null;
                    if (user) {
                        setUserInfo(user);
                        posthog?.capture("email_verified", { role: user?.role });
                    }
                    setStatus("success");

                    if (user?.role === USER_ROLES.THERAPIST) {
                        setTimeout(() => {
                            router.push(`/login?verified=true&role=${USER_ROLES.THERAPIST}`);
                        }, 2000);
                    }
                })
                .catch(() => setStatus("success"));
            return;
        }

        setStatus("error");
    }, [router, posthog, searchParams]);

    const handleContinue = () => {
        router.push(`/login?verified=true&role=${USER_ROLES.CUSTOMER}`);
    };

    return (
        <main className="flex-1 flex items-center justify-center px-4 py-12 bg-background-light">
            <div className="max-w-md w-full">
                {status === "loading" && (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                        <p className="text-text-muted">Verifying your email...</p>
                    </div>
                )}

                {status === "success" && userInfo?.role === USER_ROLES.CUSTOMER && (
                    <VerificationSuccess
                        userName={getFirstName(userInfo.fullName)}
                        onContinue={handleContinue}
                    />
                )}

                {status === "success" && userInfo?.role === USER_ROLES.THERAPIST && (
                    <Alert type="success" message="Email verified successfully! Redirecting to login..." />
                )}

                {status === "success" && !userInfo && (
                    <Alert type="success" message="Email verified successfully! You can now log in." />
                )}

                {status === "error" && (
                    <div className="space-y-4">
                        <Alert type="error" message="Verification failed. The link may be expired or invalid." />
                        <div className="text-center">
                            <button
                                onClick={() => router.push("/verify-email")}
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
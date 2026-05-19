"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Alert from "@/components/ui/Alert";
import Footer from "@/components/shared/Footer";
import VerificationSuccess from "@/components/verification/VerificationSuccess";
import { authAPi } from "@/lib/auth.api";
import { getSessionUserInfo, getFirstName } from "@/utils/userSession";
import { usePageTitle } from "@/hooks/usePageTitle";

function VerifyCallbackContent() {
    usePageTitle("Verifying Email");
    const router = useRouter();
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

                // Capture email early so the error redirect can carry it
                if (session.user?.email) setSessionEmail(session.user.email);

                // Get minimal user info from session (no API call needed)
                const sessionUser = await getSessionUserInfo();

                if (!sessionUser) {
                    setStatus("error");
                    setMessage("Unable to retrieve user information.");
                    return;
                }

                setUserInfo(sessionUser);

                // call backend to mark email as verified in database
                await authAPi.verifyEmail(session.user.id);

                setStatus("success");

                // Sign out the temporary verification session
                await supabase.auth.signOut();

                // For therapist, auto-redirect after 2 seconds
                if (sessionUser.role === "therapist") {
                    setMessage("Email verified successfully! Redirecting to login...");
                    setTimeout(() => {
                        router.push("/login?verified=true&role=therapist");
                    }, 2000);
                }

                // For customers, show the success page (they control when to continue)


            } catch (error) {
                console.error("Unexpected error:", error);
                setStatus("error");
                setMessage("An unexpected error occured. Please try again.")
            }
        };

        verifyEmail();
    }, [router]);

    const handleContinue = () => {
        router.push("/login?verified=true&role=customer");
    }

    return (
        <main className="flex-1 flex items-center justify-center px-4 py-12 bg-background-light ">
            <div className="max-w-md w-full">
                {status === "verifying" && (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-text-muted ">{message}</p>
                    </div>
                )}

                {/* Success State - Customer */}
                {status === "success" && userInfo?.role === "customer" && (
                    <VerificationSuccess
                        userName={getFirstName(userInfo.fullName)}
                        onContinue={handleContinue}
                    />
                )}

                {/* Success State - Therapist */}
                {status === "success" && userInfo?.role === "therapist" && (
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
    )
}

export default function VerifyCallbackPage() {
    return (
        <div className="flex min-h-screen flex-col transition-colors duration-200">
            <VerifyCallbackContent />
            <Footer />
        </div>
    )
}
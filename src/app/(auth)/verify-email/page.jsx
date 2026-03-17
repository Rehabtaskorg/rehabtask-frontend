"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import EmailVerificationCard from "@/components/shared/EmailVerificationCard";
import Footer from "@/components/shared/Footer";
import { authAPi } from "@/lib/auth.api";
import { usePageTitle } from "@/hooks/usePageTitle";

function VerifyEmailContent() {
    usePageTitle("Verify Email");
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "your email";

    const handleResendVerification = async () => {
        try {
            const response = await authAPi.resendVerificationEmail(email);
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.message ||
                "Failed to resend verification email"
            );
        }
    }

    return (
        <main className="flex-1 flex items-center justify-center px-4 py-12 bg-background-light dark:bg-background-dark">
            <EmailVerificationCard email={email} onResend={handleResendVerification} />
        </main>
    )

}

export default function VerifyEmailPage() {
    return (
        <div className="flex min-h-screen flex-col transition-colors duration-200">
            <Suspense fallback={
                <main className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </main>
            }>
                <VerifyEmailContent />
            </Suspense>
            <Footer />
        </div>
    )
}
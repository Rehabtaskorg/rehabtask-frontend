"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import EmailVerificationCard from "@/components/shared/EmailVerificationCard";
import Footer from "@/components/shared/Footer";
import { authAPi } from "@/lib/auth.api";
import { usePageTitle } from "@/hooks/usePageTitle";
import { MdMail } from "react-icons/md";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function EmailCollectForm() {
    const [input, setInput] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);
    const [apiError, setApiError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = input.trim().toLowerCase();
        if (!EMAIL_RE.test(trimmed)) {
            setError("Please enter a valid email address.");
            return;
        }
        setError("");
        setSending(true);
        setApiError("");
        try {
            await authAPi.resendVerificationEmail(trimmed);
            setSubmitted(true);
        } catch (err) {
            setApiError(err.response?.data?.message || "Failed to send verification email. Please try again.");
        } finally {
            setSending(false);
        }
    };

    if (submitted) {
        return (
            <EmailVerificationCard
                email={input.trim().toLowerCase()}
                onResend={async () => {
                    const res = await authAPi.resendVerificationEmail(input.trim().toLowerCase());
                    return res.data;
                }}
            />
        );
    }

    return (
        <div className="max-w-md w-full bg-white  rounded-xl shadow-sm border border-gray-100  p-8">
            <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 flex items-center justify-center bg-primary/10 rounded-full mb-4">
                    <MdMail className="text-primary text-3xl" />
                </div>
                <h1 className="text-xl font-bold text-text-main  text-center">Resend Verification Link</h1>
                <p className="text-sm text-text-muted  text-center mt-2">
                    Enter your email address and we&apos;ll send you a new verification link.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <input
                        type="email"
                        value={input}
                        onChange={(e) => { setInput(e.target.value); setError(""); }}
                        placeholder="you@example.com"
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-border-light  bg-card-light  text-text-main  placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        autoFocus
                    />
                    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                    {apiError && <p className="text-xs text-red-500 mt-1">{apiError}</p>}
                </div>
                <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
                >
                    {sending ? "Sending..." : "Send Verification Link"}
                </button>
            </form>
        </div>
    );
}

function VerifyEmailContent() {
    usePageTitle("Verify Email");
    const searchParams = useSearchParams();
    const rawEmail = searchParams.get("email") || "";
    const email = EMAIL_RE.test(rawEmail.trim()) ? rawEmail.trim() : null;

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
    };

    return (
        <main className="flex-1 flex items-center justify-center px-4 py-12 bg-background-light ">
            {email
                ? <EmailVerificationCard email={email} onResend={handleResendVerification} />
                : <EmailCollectForm />
            }
        </main>
    );
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
    );
}
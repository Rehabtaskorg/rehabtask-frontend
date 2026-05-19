"use client";

import { useSearchParams } from "next/navigation";
import LoginForm from "@/components/forms/LoginForm";
import { MdVerifiedUser } from "react-icons/md";

export default function LoginContent() {
    const searchParams = useSearchParams();
    const reason = searchParams.get("reason");

    return (
        <>
            {reason === "session_expired" && (
                <div className="w-full max-w-md mx-auto mb-4 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 flex items-center gap-3">
                    <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                        Your session has expired. Please log in to continue.
                    </p>
                </div>
            )}

            {reason === "invited" && (
                <div className="w-full max-w-md mx-auto mb-4 px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50 flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-emerald-800 dark:text-emerald-200 font-medium">
                        Your account is ready! Please log in with your new password.
                    </p>
                </div>
            )}

            {reason === "deactivated" && (
                <div className="w-full max-w-md mx-auto mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                        Your account has been deactivated. Please contact support.
                    </p>
                </div>
            )}

            <LoginForm />

            <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-white/80 dark:bg-card-dark/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border-subtle dark:border-border-dark text-xs font-semibold text-text-muted dark:text-text-muted">
                <MdVerifiedUser className="text-green-500 text-lg" />
                <span>Secure, HIPAA-compliant platform</span>
            </div>
        </>
    )

}
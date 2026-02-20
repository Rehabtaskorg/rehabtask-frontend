"use client";

import { useSearchParams } from "next/navigation";
import LoginForm from "@/components/forms/LoginForm";
import { MdVerifiedUser } from "react-icons/md";

export default function LoginContent() {
    const searchParams = useSearchParams();
    const isSessionExpired = searchParams.get("reason") === "session_expired";

    return (
        <>
            {isSessionExpired && (
                <div className="w-full max-w-md mx-auto mb-4 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 flex items-center gap-3">
                    <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                        Your session has expired. Please log in to continue.
                    </p>
                </div>
            )}

            <LoginForm />

            <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-white/80 dark:bg-[#1a2632]/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border-subtle dark:border-[#2d3a4a] text-xs font-semibold text-text-muted dark:text-[#a1b0c0]">
                <MdVerifiedUser className="text-green-500 text-lg" />
                <span>Secure, HIPAA-compliant platform</span>
            </div>
        </>
    )

}
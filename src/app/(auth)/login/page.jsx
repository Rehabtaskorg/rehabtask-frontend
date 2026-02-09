"use client";

import LoginForm from "@/components/forms/LoginForm";
import { MdVerifiedUser } from "react-icons/md";

export default function LoginPage() {
    return (
        <>
            <LoginForm />

            {/* Security Badge */}
            <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-white/80 dark:bg-[#1a2632]/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border-subtle dark:border-[#2d3a4a] text-xs font-semibold text-text-muted dark:text-[#a1b0c0]">
                <MdVerifiedUser className="text-green-500 text-lg" />
                <span>Secure, HIPAA-compliant platform</span>
            </div>
        </>
    )
}
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import LoginForm from "@/components/forms/LoginForm";
import { MdVerifiedUser } from "react-icons/md";
import { showToast } from "@/lib/toast";
import { LOGOUT_REASON, AUTH_REDIRECT_PARAM } from "@/lib/constants";

const REASON_TOAST = {
    [LOGOUT_REASON.SESSION_EXPIRED]: () =>
        showToast.warning("Your session has expired. Please log in to continue.", {
            position: "top-center",
            autoClose: 6000,
        }),
    [LOGOUT_REASON.IDLE_TIMEOUT]: () =>
        showToast.warning("You were logged out due to inactivity.", {
            position: "top-center",
            autoClose: 6000,
        }),
    [LOGOUT_REASON.DEACTIVATED]: () =>
        showToast.error("Your account has been deactivated. Please contact support.", {
            position: "top-center",
            autoClose: false,
        }),
    [LOGOUT_REASON.INVITED]: () =>
        showToast.success("Your account is ready! Please log in with your new password.", {
            position: "top-center",
            autoClose: 8000,
        }),
};

/**
 * Login page content — handles reason-based notifications via toast
 * so the layout stays clean on all screen sizes.
 */
export default function LoginContent() {
    const searchParams = useSearchParams();
    const reason = searchParams.get("reason");
    const redirectDescriptor = searchParams.get(AUTH_REDIRECT_PARAM);

    useEffect(() => {
        if (!reason) return;
        const fire = REASON_TOAST[reason];
        if (fire) fire();
    }, [reason]);

    return (
        <>
            <LoginForm redirectTo={redirectDescriptor} />

            <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-white/80  backdrop-blur-sm px-4 py-2 rounded-full border border-border-subtle  text-xs font-semibold text-text-muted ">
                <MdVerifiedUser className="text-green-500 text-lg" />
                <span>Secure platform</span>
            </div>
        </>
    );
}
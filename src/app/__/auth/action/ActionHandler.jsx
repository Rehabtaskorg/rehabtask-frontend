"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { applyActionCode } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { authAPi } from "@/lib/auth.api";

/**
 * Intercepts Identity Platform email action links.
 *
 * Identity Platform routes all email actions (verifyEmail, resetPassword,
 * signIn) through callbackUri — this page. It reads the oobCode, handles
 * the action, then redirects to the appropriate page.
 *
 * @returns {JSX.Element}
 */
export function ActionHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const mode = searchParams.get("mode");
        const oobCode = searchParams.get("oobCode");
        const continueUrl = searchParams.get("continueUrl");

        if (!mode || !oobCode) {
            router.replace("/login");
            return;
        }

        if (mode === "verifyEmail") {
            handleVerifyEmail(oobCode, continueUrl, router);
            return;
        }

        if (mode === "resetPassword") {
            const params = new URLSearchParams({ oobCode });
            router.replace(`/reset-password?${params.toString()}`);
            return;
        }

        if (mode === "signIn") {
            const base = continueUrl || "/invite/accept";
            const url = new URL(base);
            url.searchParams.set("oobCode", oobCode);
            router.replace(url.pathname + url.search);
            return;
        }

        router.replace("/login");
    }, [router, searchParams]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background-light">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-text-muted">Processing...</p>
            </div>
        </div>
    );
}

/**
 * @param {string} oobCode
 * @param {string|null} continueUrl
 * @param {import("next/navigation").AppRouterInstance} router
 */
async function handleVerifyEmail(oobCode, continueUrl, router) {
    try {
        const auth = getFirebaseAuth();
        const actionInfo = await import("firebase/auth").then(({ checkActionCode }) =>
            checkActionCode(auth, oobCode)
        );
        const email = actionInfo.data.email;

        await applyActionCode(auth, oobCode);

        await authAPi.verifyEmail(null, null, email);

        const dest = continueUrl
            ? new URL(continueUrl).pathname
            : "/verify-callback";

        router.replace(`${dest}?verified=true`);
    } catch {
        router.replace("/verify-callback?error=invalid");
    }
}
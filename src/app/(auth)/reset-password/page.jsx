export const dynamic = "force-dynamic";
export const metadata = { title: "Reset Password" };

import { Suspense } from "react";
import ResetPasswordForm from "@/components/forms/ResetPasswordForm";

/**
 * Password reset page.
 *
 * @returns {JSX.Element}
 */
export default function ResetPasswordPage() {
    return (
        <main className="flex-1 flex items-center justify-center p-6">
            <Suspense
                fallback={
                    <div className="max-w-120 w-full bg-white shadow-xl rounded-xl p-8">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-text-muted">Loading...</p>
                        </div>
                    </div>
                }
            >
                <ResetPasswordForm />
            </Suspense>
        </main>
    );
}

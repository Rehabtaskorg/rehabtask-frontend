export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { VerifyCallbackContent } from "./VerifyCallbackContent";
import Footer from "@/components/shared/Footer";

/**
 * Email verification callback page.
 *
 * @returns {JSX.Element}
 */
export default function VerifyCallbackPage() {
    return (
        <div className="flex min-h-screen flex-col transition-colors duration-200">
            <Suspense
                fallback={
                    <main className="flex-1 flex items-center justify-center px-4 py-12 bg-background-light">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                            <p className="text-text-muted">Verifying your email...</p>
                        </div>
                    </main>
                }
            >
                <VerifyCallbackContent />
            </Suspense>
            <Footer />
        </div>
    );
}

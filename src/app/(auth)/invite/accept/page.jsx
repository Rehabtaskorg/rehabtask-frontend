export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { InviteAcceptContent } from "./InviteAcceptContent";
import Footer from "@/components/shared/Footer";

/**
 * Sub-admin invite acceptance page.
 *
 * @returns {JSX.Element}
 */
export default function InviteAcceptPage() {
    return (
        <div className="flex min-h-screen flex-col transition-colors duration-200">
            <main className="flex-1 flex items-center justify-center px-4 py-12 bg-background-light">
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
                    <InviteAcceptContent />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}

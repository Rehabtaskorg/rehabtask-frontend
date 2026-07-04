export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { ActionHandler } from "./ActionHandler";

/**
 * Identity Platform email action handler page.
 * Receives mode, oobCode, and continueUrl constructed by the backend.
 *
 * @returns {JSX.Element}
 */
export default function ActionPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-background-light">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                        <p className="text-text-muted">Processing...</p>
                    </div>
                </div>
            }
        >
            <ActionHandler />
        </Suspense>
    );
}

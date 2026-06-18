"use client";

import { useRouter } from "next/navigation";
import { MdWarning } from "react-icons/md";

/**
 * Error boundary shown when an onboarding step route segment throws.
 * Shared by every step's error.jsx so the flow feels consistent.
 *
 * @param {{ error: Error, reset: Function }} props
 */
export function OnboardingStepError({ error, reset }) {
    const router = useRouter();
    return (
        <div className="min-h-screen bg-background-light py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <MdWarning className="text-3xl text-red-500 mx-auto mb-2" />
                    <p className="text-red-800 font-bold">
                        {error?.message || "Something went wrong loading this step."}
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-3">
                        <button onClick={reset} className="text-sm text-primary font-bold hover:underline">
                            Try again
                        </button>
                        <span className="text-slate-300">·</span>
                        <button
                            onClick={() => router.push("/therapist/dashboard")}
                            className="text-sm text-primary font-bold hover:underline"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

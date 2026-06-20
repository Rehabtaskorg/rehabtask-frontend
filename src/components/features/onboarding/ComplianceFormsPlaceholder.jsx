"use client";

import { useRouter } from "next/navigation";
import { usePageTitle } from "@/hooks/usePageTitle";
import OnboardingProgressBar from "@/components/therapist/OnboardingProgressBar";

/**
 * Temporary placeholder for the Compliance Forms onboarding step (Step 7).
 * Exists only so ONBOARDING_STEP_ROUTES[7] resolves to a real page instead
 * of a 404 while the real 4-sub-form flow (W-9, Independent Contractor
 * Agreement, HIPAA Acknowledgment, Background Check Authorization) is still
 * being built. Replace with the real ComplianceFormsForm once it ships.
 */
export function ComplianceFormsPlaceholder() {
    usePageTitle("Compliance Forms");
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background-light py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <OnboardingProgressBar />

                <header className="mb-8 px-4">
                    <h1 className="text-text-main text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                        Compliance Forms
                    </h1>
                    <p className="text-text-muted text-lg font-normal leading-normal">
                        This step is still being built. You&apos;re all caught up — there&apos;s nothing to fill in here yet.
                    </p>
                </header>

                <div className="bg-card-light border border-border-light rounded-xl p-8 shadow-sm">
                    <p className="text-text-main text-base">
                        Your progress is saved. We&apos;ll let you know as soon as this step is ready to complete.
                    </p>

                    <div className="pt-6 mt-6 border-t border-border-light">
                        <button
                            type="button"
                            onClick={() => router.push("/therapist/dashboard")}
                            className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border-light text-text-main font-semibold hover:bg-muted-light transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
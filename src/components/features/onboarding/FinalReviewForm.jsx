"use client";

import Link from "next/link";
import { MdArrowBack, MdArrowForward, MdCheckCircle, MdError } from "react-icons/md";
import OnboardingProgressBar from "@/components/therapist/OnboardingProgressBar";
import Button from "@/components/ui/Button";
import { ONBOARDING_STEP_ROUTES } from "@/lib/therapistRouteAccess";
import { useFinalReview } from "@/hooks/useFinalReview";
import { usePageTitle } from "@/hooks/usePageTitle";

const CHECKLIST_STEPS = [
    { key: "personalInfo", label: "Personal Information", step: 1 },
    { key: "profile", label: "Professional Profile", step: 2 },
    { key: "credentials", label: "Credentials", step: 3 },
    { key: "availability", label: "Availability", step: 4 },
    { key: "insurance", label: "Insurance Uploads", step: 5 },
    { key: "identity", label: "Identity Verification", step: 6 },
    { key: "compliance", label: "Compliance Forms", step: 7 },
];

/**
 * Final Review (Step 9): a read-only checklist of every completed onboarding
 * step plus Stripe's connection state, ending in a single "Submit for
 * Activation" action that calls the real completeOnboarding endpoint.
 */
export function FinalReviewForm() {
    usePageTitle("Final Review");
    const { steps, stripeConnected, initializing, submitting, error, onSubmit, onBack } = useFinalReview();

    return (
        <div className="min-h-screen bg-background-light py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <OnboardingProgressBar />

                <div className="max-w-[700px] mx-auto bg-card-light border border-border-light rounded-xl shadow-sm p-8 md:p-12">
                    <header className="mb-8">
                        <h1 className="text-text-main text-3xl font-extrabold tracking-tight mb-2">
                            Review Your Application
                        </h1>
                        <p className="text-text-muted text-base">
                            Please review your information before submitting for admin review. You can still make changes later.
                        </p>
                    </header>

                    {initializing ? (
                        <div className="flex flex-col items-center gap-3 py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                            <p className="text-text-muted text-sm">Loading your application…</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-1">
                                {CHECKLIST_STEPS.map(({ key, label, step }) => (
                                    <div
                                        key={key}
                                        className="flex items-center justify-between p-4 rounded-lg border-b border-border-light last:border-b-0"
                                    >
                                        <div className="flex items-center gap-4">
                                            {steps?.[key] ? (
                                                <MdCheckCircle className="text-emerald-600 text-xl shrink-0" />
                                            ) : (
                                                <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
                                            )}
                                            <span className="text-sm font-semibold text-text-main">{label}</span>
                                        </div>
                                        <Link
                                            href={ONBOARDING_STEP_ROUTES[step]}
                                            className="text-primary text-xs font-bold uppercase tracking-wide hover:underline"
                                        >
                                            Edit
                                        </Link>
                                    </div>
                                ))}

                                <div className="flex items-center justify-between p-4 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        {stripeConnected ? (
                                            <MdCheckCircle className="text-emerald-600 text-xl shrink-0" />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
                                        )}
                                        <div>
                                            <p className="text-sm font-semibold text-text-main">Payment Setup</p>
                                            {!stripeConnected && (
                                                <p className="text-xs text-text-muted italic">
                                                    Not set up — you can add this later from your Earnings page
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <Link
                                        href={ONBOARDING_STEP_ROUTES[8]}
                                        className="text-primary text-xs font-bold uppercase tracking-wide hover:underline"
                                    >
                                        Edit
                                    </Link>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mt-6">
                                    <MdError className="text-red-500 text-xl shrink-0 mt-0.5" />
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            )}

                            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <button
                                    onClick={onBack}
                                    disabled={submitting}
                                    className="flex items-center gap-2 text-text-muted hover:text-text-main transition-colors disabled:opacity-50"
                                >
                                    <MdArrowBack className="text-lg" />
                                    Back
                                </button>
                                <Button
                                    variant="primary"
                                    loading={submitting}
                                    onClick={onSubmit}
                                    className="w-full sm:w-auto"
                                >
                                    Submit for Activation
                                    <MdArrowForward className="text-lg" />
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
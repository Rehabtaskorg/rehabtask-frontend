"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdLock, MdAccessTime, MdInfo } from "react-icons/md";
import { useCustomerUser } from "@/contexts/CustomerUserContext";
import { resolveCustomerGateState, CUSTOMER_GATE_STATE, AGENCY_ONBOARDING_STEP_ROUTES, INDIVIDUAL_ONBOARDING_STEP_ROUTES } from "@/lib/customerRouteAccess";
import { CUSTOMER_TYPES } from "@/lib/constants";

const PAGE_META = {
    newRequest: {
        title: "Post a Request",
        description: "Submit therapy requests and connect with qualified therapists.",
    },
    subscription: {
        title: "Subscription Plans",
        description: "Manage your plan and unlock higher visit limits.",
    },
};

/**
 * Full-page lock overlay for customer marketplace pages that require approval.
 * Branches copy on gate state — rejected customers see rejection messaging,
 * incomplete customers see an onboarding CTA, review customers see a waiting message.
 *
 * @param {{ pageType: "newRequest" | "subscription" }} props
 */
export function CustomerLockedPageOverlay({ pageType }) {
    const customer = useCustomerUser();
    const router = useRouter();

    const gateState = resolveCustomerGateState({
        approvalStatus: customer?.approvalStatus ?? null,
        onboardingComplete: customer?.onboardingComplete ?? false,
    });

    const isRejected = gateState === CUSTOMER_GATE_STATE.REJECTED;
    const isIncomplete = gateState === CUSTOMER_GATE_STATE.INCOMPLETE;

    const isIndividual = customer?.customerType === CUSTOMER_TYPES.INDIVIDUAL;
    const stepRoutes = isIndividual ? INDIVIDUAL_ONBOARDING_STEP_ROUTES : AGENCY_ONBOARDING_STEP_ROUTES;
    const accountLabel = isIndividual ? "your account" : "your agency account";

    const icon = isRejected
        ? <MdInfo className="text-3xl text-amber-600" />
        : isIncomplete
            ? <MdLock className="text-3xl text-primary" />
            : <MdAccessTime className="text-3xl text-amber-500" />;

    const iconBg = isRejected || !isIncomplete ? "bg-amber-50" : "bg-primary/10";

    const title = isRejected
        ? "Action Required"
        : isIncomplete
            ? "Complete your setup first"
            : "Account Under Review";

    const body = isRejected
        ? "Your application needs an update before we can approve it. Review the reviewer's notes and resubmit."
        : isIncomplete
            ? `Finish setting up ${accountLabel} to unlock this page and start connecting with therapists.`
            : "Our team is reviewing your account. You'll be notified by email once a decision has been made.";

    const meta = PAGE_META[pageType];

    const handleContinueOnboarding = () => {
        const step = customer?.onboardingStep ?? 1;
        router.push(stepRoutes[step] ?? stepRoutes[1]);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
            {meta && (
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-6">
                    {meta.title}
                </p>
            )}
            <div className="w-full max-w-sm bg-card-light border border-border-light rounded-2xl p-8 flex flex-col items-center text-center gap-4 shadow-sm">
                <span className={`w-16 h-16 rounded-full ${iconBg} flex items-center justify-center`}>
                    {icon}
                </span>
                <div className="space-y-2">
                    <h2 className="text-text-main text-lg font-black">{title}</h2>
                    <p className="text-text-muted text-sm leading-relaxed">{body}</p>
                </div>
                <div className="w-full flex flex-col gap-3 pt-2">
                    {isIncomplete && (
                        <button
                            type="button"
                            onClick={handleContinueOnboarding}
                            className="w-full h-11 bg-primary text-white font-bold rounded-lg hover:brightness-95 transition-all"
                        >
                            Continue Onboarding
                        </button>
                    )}
                    {isRejected && (
                        <>
                            <Link
                                href="/customer/application-review"
                                className="w-full h-11 bg-primary text-white font-bold rounded-lg hover:brightness-95 transition-all flex items-center justify-center"
                            >
                                Review and fix
                            </Link>
                            <a
                                href="mailto:support@rehabtask.com"
                                className="text-xs font-semibold text-text-muted underline hover:no-underline text-center"
                            >
                                Contact Support
                            </a>
                        </>
                    )}
                    {!isIncomplete && !isRejected && (
                        <button
                            type="button"
                            onClick={() => router.push("/customer/dashboard")}
                            className="w-full h-11 bg-primary text-white font-bold rounded-lg hover:brightness-95 transition-all"
                        >
                            Go to Dashboard
                        </button>
                    )}
                </div>
            </div>
            {meta?.description && (
                <p className="text-xs text-text-muted mt-4 max-w-xs text-center">{meta.description}</p>
            )}
        </div>
    );
}

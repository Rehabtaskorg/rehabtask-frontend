"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTherapistAccess } from "@/contexts/TherapistAccessContext";
import { ONBOARDING_STEP_ROUTES } from "@/lib/therapistRouteAccess";
import { APPROVAL_STATUS } from "@/lib/constants";
import useOnboardingStore from "@/stores/onboardingStore";
import { MdLock, MdAccessTime, MdSearch, MdSend, MdCalendarMonth, MdChatBubble, MdPayments, MdInfo } from "react-icons/md";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
    RequestsPreview,
    OffersPreview,
    BookingsPreview,
    MessagesPreview,
    EarningsPreview,
} from "@/components/therapist/locked-previews";

const PAGE_META = {
    requests: { title: "Browse Requests", description: "View and respond to therapy requests from patients in your area.", icon: MdSearch, Preview: RequestsPreview },
    offers: { title: "My Offers", description: "Track your sent offers and manage negotiations with patients.", icon: MdSend, Preview: OffersPreview },
    bookings: { title: "My Bookings", description: "Manage your upcoming and completed therapy sessions.", icon: MdCalendarMonth, Preview: BookingsPreview },
    messages: { title: "Messages", description: "Communicate with patients about sessions and treatment plans.", icon: MdChatBubble, Preview: MessagesPreview },
    earnings: { title: "Earnings", description: "View your payout history and track your income.", icon: MdPayments, Preview: EarningsPreview },
};

export default function LockedPageOverlay({ pageType }) {
    const router = useRouter();
    const { onboardingComplete, approvalStatus, rejectionReason } = useTherapistAccess();
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    const meta = PAGE_META[pageType] || PAGE_META.requests;
    const Icon = meta.icon;
    const Preview = meta.Preview;

    const isOnboardingIncomplete = !onboardingComplete;
    const isUnderReview = onboardingComplete && (approvalStatus === APPROVAL_STATUS.PENDING || approvalStatus === APPROVAL_STATUS.REVIEW);
    const isRejected = approvalStatus === APPROVAL_STATUS.REJECTED;

    const handleCTA = () => {
        if (isRejected) {
            setShowFeedbackModal(true);
            return;
        }
        if (isOnboardingIncomplete) {
            const step = useOnboardingStore.getState().currentStep;
            router.push(ONBOARDING_STEP_ROUTES[step] || "/therapist/onboarding/profile");
        } else {
            router.push("/therapist/dashboard");
        }
    };

    let lockTitle, lockDescription, ctaLabel;

    if (isOnboardingIncomplete) {
        lockTitle = "Complete Your Setup";
        lockDescription = `Finish your onboarding to unlock ${meta.title.toLowerCase()}. ${meta.description}`;
        ctaLabel = "Continue Setup";
    } else if (isRejected) {
        lockTitle = "Account Needs Attention";
        lockDescription = "Your application needs updates before you can access this feature. Please review the feedback and resubmit.";
        ctaLabel = "Review Feedback";
    } else {
        lockTitle = "Account Under Review";
        lockDescription = `Our team is reviewing your credentials. You'll have full access to ${meta.title.toLowerCase()} once approved.`;
        ctaLabel = "View Status";
    }

    return (
        <>
            <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
                <div className="blur-[6px] opacity-50 pointer-events-none select-none">
                    <Preview />
                </div>

                <div className="absolute inset-0 flex items-start justify-center pt-32 sm:pt-40">
                    <div className="bg-card-light  border border-border-light  rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
                        <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                            {isUnderReview ? (
                                <MdAccessTime className="text-primary text-2xl" />
                            ) : (
                                <MdLock className="text-primary text-2xl" />
                            )}
                        </div>

                        <h2 className="text-xl font-bold text-text-main  mb-2">
                            {lockTitle}
                        </h2>

                        <p className="text-sm text-text-muted  mb-6 leading-relaxed">
                            {lockDescription}
                        </p>

                        <button
                            onClick={handleCTA}
                            className="w-full px-6 py-3 rounded-xl text-sm font-bold bg-primary text-white hover:brightness-95 transition-all"
                        >
                            {ctaLabel}
                        </button>

                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-muted ">
                            <Icon className="text-sm" />
                            <span>{meta.title}</span>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={showFeedbackModal}
                onClose={() => { setShowFeedbackModal(false); router.push("/therapist/dashboard"); }}
                onConfirm={() => setShowFeedbackModal(false)}
                title="Application Feedback"
                message={rejectionReason || "Our review team found issues with your application. Please review your credentials and contact support for specific details."}
                confirmLabel="Got it"
                cancelLabel="Go to Dashboard"
                confirmClassName="bg-primary hover:bg-primary/90 text-white"
                icon={<MdInfo className="text-red-500 text-xl" />}
            />
        </>
    );
}

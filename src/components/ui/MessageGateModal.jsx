"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MdClose, MdLock, MdAccessTime, MdInfo } from "react-icons/md";
import { AGENCY_ONBOARDING_STEP_ROUTES, INDIVIDUAL_ONBOARDING_STEP_ROUTES, CUSTOMER_GATE_STATE } from "@/lib/customerRouteAccess";
import { CUSTOMER_TYPES } from "@/lib/constants";

/**
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   gateState: string,
 *   onboardingStep: number,
 *   customerType: string|null,
 *   rejectionReason: string|null,
 * }} props
 */
export function MessageGateModal({ isOpen, onClose, gateState, onboardingStep, customerType, rejectionReason }) {
    const router = useRouter();
    const closeRef = useRef(null);
    const previousFocusRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement;
            closeRef.current?.focus();
        } else if (previousFocusRef.current) {
            previousFocusRef.current.focus();
            previousFocusRef.current = null;
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const isIncomplete = gateState === CUSTOMER_GATE_STATE.INCOMPLETE;
    const isRejected = gateState === CUSTOMER_GATE_STATE.REJECTED;

    const isIndividual = customerType === CUSTOMER_TYPES.INDIVIDUAL;
    const stepRoutes = isIndividual ? INDIVIDUAL_ONBOARDING_STEP_ROUTES : AGENCY_ONBOARDING_STEP_ROUTES;
    const accountLabel = isIndividual ? "your account" : "your agency account";

    const handleContinue = () => {
        onClose();
        router.push(stepRoutes[onboardingStep] ?? stepRoutes[1]);
    };

    const icon = isRejected
        ? <MdInfo className="text-2xl text-red-500" />
        : isIncomplete
            ? <MdLock className="text-2xl text-primary" />
            : <MdAccessTime className="text-2xl text-amber-500" />;

    const iconBg = isRejected ? "bg-red-50" : isIncomplete ? "bg-primary/10" : "bg-amber-50";

    const title = isRejected
        ? "Application Not Approved"
        : isIncomplete
            ? "Complete your setup first"
            : "Application Under Review";

    const body = isRejected
        ? (rejectionReason || "Your application was not approved. Please contact support for assistance.")
        : isIncomplete
            ? `Finish setting up ${accountLabel} to unlock messaging and start connecting with therapists.`
            : "Our team is reviewing your account. You’ll be notified by email once a decision has been made.";

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="message-gate-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
            <div className="relative bg-card-light border border-border-light rounded-xl shadow-xl w-full max-w-md p-8 flex flex-col gap-6">
                <button
                    ref={closeRef}
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute top-4 right-4 text-text-muted hover:text-text-main transition-colors"
                >
                    <MdClose className="text-xl" />
                </button>

                <div className="flex flex-col items-center text-center gap-3">
                    <span className={`w-14 h-14 rounded-full ${iconBg} flex items-center justify-center`}>
                        {icon}
                    </span>
                    <h2 id="message-gate-title" className="text-text-main text-xl font-black">
                        {title}
                    </h2>
                    <p className="text-text-muted text-sm leading-relaxed">
                        {body}
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    {isIncomplete && (
                        <button
                            type="button"
                            onClick={handleContinue}
                            className="w-full h-11 bg-primary text-white font-bold rounded-lg hover:brightness-95 transition-all"
                        >
                            Continue Onboarding
                        </button>
                    )}
                    {isRejected && (
                        <a
                            href="mailto:support@rehabtask.com"
                            className="w-full h-11 bg-red-500 text-white font-bold rounded-lg hover:brightness-95 transition-all flex items-center justify-center"
                        >
                            Contact Support
                        </a>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full h-11 text-text-muted font-semibold hover:text-text-main transition-colors"
                    >
                        {isIncomplete || isRejected ? "Maybe Later" : "Close"}
                    </button>
                </div>
            </div>
        </div>
    );
}

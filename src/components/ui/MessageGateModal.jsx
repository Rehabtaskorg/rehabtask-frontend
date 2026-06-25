"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MdClose, MdLock } from "react-icons/md";
import { AGENCY_ONBOARDING_STEP_ROUTES } from "@/lib/customerRouteAccess";

/**
 * Modal shown when an incomplete agency customer tries to message a therapist.
 * Traps focus, restores it on close, dismissable via Escape or backdrop click.
 *
 * @param {{ isOpen: boolean, onClose: () => void, onboardingStep: number }} props
 */
export function MessageGateModal({ isOpen, onClose, onboardingStep }) {
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

    const handleContinue = () => {
        onClose();
        router.push(AGENCY_ONBOARDING_STEP_ROUTES[onboardingStep] ?? AGENCY_ONBOARDING_STEP_ROUTES[1]);
    };

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
                    <span className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <MdLock className="text-2xl text-primary" />
                    </span>
                    <h2 id="message-gate-title" className="text-text-main text-xl font-black">
                        Complete your setup first
                    </h2>
                    <p className="text-text-muted text-sm leading-relaxed">
                        Finish setting up your agency account to unlock messaging and start connecting with therapists.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={handleContinue}
                        className="w-full h-11 bg-primary text-white font-bold rounded-lg hover:brightness-95 transition-all"
                    >
                        Continue Onboarding
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full h-11 text-text-muted font-semibold hover:text-text-main transition-colors"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    );
}
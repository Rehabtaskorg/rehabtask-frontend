"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAnalytics } from "@/hooks/useAnalytics";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdLock, MdDashboard, MdCheckCircle } from "react-icons/md";
import { ROLE_DASHBOARDS } from "@/hooks/useAppRole";
import { AUTH_REDIRECT_PARAM, AUTH_GATE_TRIGGERS } from "@/lib/constants";
import { encodeAuthRedirect } from "@/lib/redirect";

/**
 * @typedef {{ intro: string, bullets?: string[] }} GateContext
 */

/** @type {Record<string, GateContext>} */
const CONTEXT_MESSAGES = {
    [AUTH_GATE_TRIGGERS.MESSAGE]: { intro: "Sign up to message this therapist directly" },
    [AUTH_GATE_TRIGGERS.CONTACT]: { intro: "Sign up to see contact details" },
    [AUTH_GATE_TRIGGERS.PROFILE]: { intro: "Sign up to view the full profile" },
    [AUTH_GATE_TRIGGERS.REQUEST]: { intro: "Sign up to send a request to this therapist" },
    [AUTH_GATE_TRIGGERS.REFERRAL]: {
        intro: "Create your free therapist account to:",
        bullets: [
            "View complete referral details",
            "Submit offers",
            "Message Home Health Agencies",
            "Receive booking requests",
            "Manage your schedule",
            "Receive secure payments",
        ],
    },
    [AUTH_GATE_TRIGGERS.DEFAULT]: { intro: "Create a free account to get started" },
};

const ROLE_LABELS = {
    customer: "Customer",
    therapist: "Therapist",
    admin: "Admin",
    sub_admin: "Sub-Admin",
};

/**
 * Modal shown when a logged-out visitor clicks a gated CTA on the marketing site.
 * Encodes the action as a `trigger:entityId` descriptor in the auth links' `?redirect=`
 * param so that, post-authentication, the user lands on the matching dashboard screen
 * instead of back on the marketing page.
 *
 * The `referral` trigger renders a therapist-only CTA variant with a bullet list.
 * All other triggers render the standard dual-role registration CTA.
 *
 * @param {{ isOpen: boolean, onClose: () => void, trigger?: string, entityId?: string | null, userRole?: string | null }} props
 */
export default function AuthGateModal({ isOpen, onClose, trigger = AUTH_GATE_TRIGGERS.DEFAULT, entityId = null, userRole = null }) {
    useEffect(() => {
        if (isOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    useEffect(() => {
        const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
        if (isOpen) window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    const { trackEvent } = useAnalytics();

    const descriptor = encodeAuthRedirect(trigger, entityId);
    const redirectQuery = descriptor ? `?${AUTH_REDIRECT_PARAM}=${encodeURIComponent(descriptor)}` : "";
    const dashboardHref = userRole ? (ROLE_DASHBOARDS[userRole] ?? "/") : null;
    const copy = CONTEXT_MESSAGES[trigger] ?? CONTEXT_MESSAGES[AUTH_GATE_TRIGGERS.DEFAULT];
    const isReferralTrigger = trigger === AUTH_GATE_TRIGGERS.REFERRAL;

    useEffect(() => {
        if (isOpen && isReferralTrigger && !userRole) {
            trackEvent("therapist_login_prompt_shown");
        }
    }, [isOpen, isReferralTrigger, userRole, trackEvent]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.97 }}
                        transition={{ duration: 0.25 }}
                        className="relative bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            aria-label="Close"
                            className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            <MdClose className="text-xl" />
                        </button>

                        {userRole ? (
                            /* ── Already signed in ── */
                            <div className="text-center">
                                <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                                    <MdDashboard className="text-2xl text-primary" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">You&apos;re already signed in</h2>
                                <p className="text-sm text-gray-500 mt-2">
                                    You&apos;re logged in as a <span className="font-semibold text-gray-700">{ROLE_LABELS[userRole] ?? userRole}</span>.
                                    Head to your dashboard to take action.
                                </p>
                                <div className="mt-6">
                                    <Link
                                        href={dashboardHref}
                                        className="block w-full py-3 text-center text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors"
                                        onClick={onClose}
                                    >
                                        Go to Dashboard
                                    </Link>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    Stay on this page
                                </button>
                            </div>
                        ) : (
                            /* ── Unauthenticated ── */
                            <>
                                <div className="text-center">
                                    <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                                        <MdLock className="text-2xl text-primary" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {isReferralTrigger ? "Sign in to View Referral Details" : "Create Your Free Account"}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-2">{copy.intro}</p>
                                </div>

                                {copy.bullets?.length > 0 && (
                                    <ul className="mt-4 space-y-2">
                                        {copy.bullets.map((bullet) => (
                                            <li key={bullet} className="flex items-center gap-2 text-sm text-gray-600">
                                                <MdCheckCircle className="text-primary shrink-0" />
                                                {bullet}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <div className="mt-6 space-y-3">
                                    {isReferralTrigger ? (
                                        <>
                                            <Link
                                                href={`/register/therapist${redirectQuery}`}
                                                onClick={() => trackEvent("therapist_signup_started", { trigger: AUTH_GATE_TRIGGERS.REFERRAL })}
                                                className="block w-full py-3 text-center text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors"
                                            >
                                                Create Free Account
                                            </Link>
                                            <Link
                                                href={`/login${redirectQuery}`}
                                                className="block w-full py-3 text-center text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                            >
                                                Sign In
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                href={`/register/customer${redirectQuery}`}
                                                className="block w-full py-3 text-center text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors"
                                            >
                                                I&apos;m Looking for a Therapist
                                            </Link>
                                            <p className="text-center text-xs text-gray-400">For home health agencies and individuals</p>

                                            <Link
                                                href={`/register/therapist${redirectQuery}`}
                                                className="block w-full py-3 text-center text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                            >
                                                I&apos;m a Licensed Therapist
                                            </Link>
                                            <p className="text-center text-xs text-gray-400">For PTs, OTs, and SLPs</p>

                                            <div className="mt-6 flex items-center gap-3">
                                                <div className="flex-1 h-px bg-gray-200" />
                                                <span className="text-xs text-gray-400">or</span>
                                                <div className="flex-1 h-px bg-gray-200" />
                                            </div>

                                            <p className="mt-4 text-center text-sm text-gray-500">
                                                Already have an account?{" "}
                                                <Link href={`/login${redirectQuery}`} className="text-primary font-semibold hover:underline">
                                                    Log in
                                                </Link>
                                            </p>
                                        </>
                                    )}
                                </div>

                                <p className="mt-4 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                                    <MdLock className="text-xs" /> Your data is secure
                                </p>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

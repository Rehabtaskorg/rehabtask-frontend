"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose, MdLock, MdDashboard } from "react-icons/md";
import { ROLE_DASHBOARDS } from "@/hooks/useAppRole";

const CONTEXT_MESSAGES = {
    message: "Sign up to message this therapist directly",
    contact: "Sign up to see contact details",
    profile: "Sign up to view the full profile",
    request: "Sign up to send a request to this therapist",
    default: "Create a free account to get started",
};

const ROLE_LABELS = {
    customer: "Customer",
    therapist: "Therapist",
    admin: "Admin",
    sub_admin: "Sub-Admin",
};

/**
 * AuthGateModal
 *
 * Two modes:
 *  1. `userRole` is null  → unauthenticated — show sign-up / log-in CTAs
 *  2. `userRole` is set   → already signed in — show a "go to dashboard" prompt
 */
export default function AuthGateModal({ isOpen, onClose, trigger = "default", redirectPath = "/", userRole = null }) {
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

    const redirect = encodeURIComponent(redirectPath);
    const dashboardHref = userRole ? ROLE_DASHBOARDS[userRole] : null;

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
                                    <h2 className="text-xl font-bold text-gray-900">Create Your Free Account</h2>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {CONTEXT_MESSAGES[trigger] || CONTEXT_MESSAGES.default}
                                    </p>
                                </div>

                                <div className="mt-6 space-y-3">
                                    <Link
                                        href={`/register/customer?redirect=${redirect}`}
                                        className="block w-full py-3 text-center text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors"
                                    >
                                        I&apos;m Looking for a Therapist
                                    </Link>
                                    <p className="text-center text-xs text-gray-400">For home health agencies and individuals</p>

                                    <Link
                                        href={`/register/therapist?redirect=${redirect}`}
                                        className="block w-full py-3 text-center text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        I&apos;m a Licensed Therapist
                                    </Link>
                                    <p className="text-center text-xs text-gray-400">For PTs, OTs, and SLPs</p>
                                </div>

                                <div className="mt-6 flex items-center gap-3">
                                    <div className="flex-1 h-px bg-gray-200" />
                                    <span className="text-xs text-gray-400">or</span>
                                    <div className="flex-1 h-px bg-gray-200" />
                                </div>

                                <p className="mt-4 text-center text-sm text-gray-500">
                                    Already have an account?{" "}
                                    <Link href={`/login?redirect=${redirect}`} className="text-primary font-semibold hover:underline">
                                        Log in
                                    </Link>
                                </p>

                                <p className="mt-4 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                                    <MdLock className="text-xs" /> HIPAA compliant &middot; Your data is secure
                                </p>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdClose, MdCheckCircle, MdWarning } from "react-icons/md";
import { api } from "@/lib/api";
import { formatCurrency } from "@/utils/messages";
import InlinePaymentSection from "@/components/bookings/InlinePaymentSection";

/** @typedef {"idle"|"accepting"|"pay"|"success"|"error"} ModalStep */

/**
 * Modal that accepts a therapist offer and immediately presents payment.
 * The booking is created in the background on confirmation; payment is optional
 * at this point — the user can dismiss and pay from the booking detail page.
 *
 * @param {Object}   props
 * @param {boolean}  props.isOpen
 * @param {Function} props.onClose          - called on dismiss / after success navigation
 * @param {Object}   props.offer            - the offer being accepted
 * @param {Function} props.onAccepted       - called with booking after offer is accepted
 */
export default function AcceptOfferModal({ isOpen, onClose, offer, onAccepted }) {
    const router = useRouter();
    /** @type {[ModalStep, Function]} */
    const [step, setStep] = useState("idle");
    const [booking, setBooking] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");

    if (!isOpen || !offer) return null;

    const therapistName = offer.therapist?.fullName || "Therapist";
    const rate = formatCurrency(parseFloat(offer.rate));

    const handleConfirm = async () => {
        setStep("accepting");
        setErrorMsg("");
        try {
            const res = await api.post(`/offers/${offer.id}/accept`);
            const newBooking = res.data.data.booking;
            setBooking(newBooking);
            onAccepted(newBooking);
            setStep("pay");
        } catch (err) {
            const code = err.response?.data?.code;
            if (code === "THERAPIST_LIMIT_REACHED" || code === "REQUEST_LIMIT_REACHED") {
                setErrorMsg(err.response.data.message + " Please upgrade your plan to continue.");
            } else {
                setErrorMsg(err.response?.data?.message || "Failed to accept offer. Please try again.");
            }
            setStep("error");
        }
    };

    const handlePaymentSuccess = () => {
        setStep("success");
    };

    const handleClose = () => {
        setStep("idle");
        setBooking(null);
        setErrorMsg("");
        onClose();
    };

    const handleViewBooking = () => {
        handleClose();
        router.push(`/customer/bookings/${booking.id}`);
    };

    const handleUpgradePlan = () => {
        handleClose();
        router.push("/customer/subscription");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={step === "accepting" ? undefined : handleClose} />

            <div className="relative w-full max-w-lg bg-card-light dark:bg-card-dark rounded-2xl shadow-2xl border border-border-light dark:border-border-dark flex flex-col max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-light dark:border-border-dark shrink-0">
                    <h2 className="text-base font-bold text-text-main dark:text-white">
                        {step === "success" ? "Payment Confirmed" : step === "pay" ? "Complete Payment" : "Accept & Fund Offer"}
                    </h2>
                    {step !== "accepting" && (
                        <button
                            onClick={handleClose}
                            className="p-1.5 text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white rounded-lg hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
                        >
                            <MdClose className="text-xl" />
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="overflow-y-auto panel-scroll flex-1">
                    {/* ── idle: confirmation screen ── */}
                    {step === "idle" && (
                        <div className="p-6 space-y-5">
                            <div className="bg-muted-light dark:bg-muted-dark rounded-xl p-4 space-y-2 border border-border-light dark:border-border-dark">
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-muted dark:text-gray-400">Therapist</span>
                                    <span className="font-bold text-text-main dark:text-white">{therapistName}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-muted dark:text-gray-400">Rate</span>
                                    <span className="font-bold text-primary">{rate}/session</span>
                                </div>
                                {offer.proposedDate && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-muted dark:text-gray-400">Proposed date</span>
                                        <span className="font-medium text-text-main dark:text-white">
                                            {new Date(offer.proposedDate).toLocaleDateString([], {
                                                month: "short", day: "numeric", year: "numeric",
                                            })}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <p className="text-xs text-text-muted dark:text-gray-400 leading-relaxed">
                                Accepting this offer will create a booking and decline all other pending offers for this request.
                                You can complete payment now or from the booking page at any time.
                            </p>

                            <div className="flex gap-3 pt-1">
                                <button
                                    onClick={handleClose}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark text-sm font-bold text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-colors shadow-lg shadow-emerald-500/20"
                                >
                                    Accept & Fund Offer
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── accepting: spinner while API call runs ── */}
                    {step === "accepting" && (
                        <div className="p-10 flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm font-medium text-text-muted dark:text-gray-400">Creating your booking…</p>
                        </div>
                    )}

                    {/* ── pay: inline payment section ── */}
                    {step === "pay" && booking && (
                        <div className="p-6 space-y-4">
                            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
                                <Elements stripe={stripePromise} options={{ appearance: getStripeAppearance() }}>
                                    <InlinePaymentSection booking={booking} onPaymentSuccess={handlePaymentSuccess} />
                                </Elements>
                            </APIProvider>
                            <button
                                onClick={handleViewBooking}
                                className="w-full text-xs text-text-muted dark:text-gray-400 hover:text-primary transition-colors py-1"
                            >
                                Skip — I&apos;ll pay from the booking page
                            </button>
                        </div>
                    )}

                    {/* ── success: payment confirmed ── */}
                    {step === "success" && booking && (
                        <div className="p-6 flex flex-col items-center gap-4 text-center">
                            <MdCheckCircle className="text-5xl text-emerald-500" />
                            <div>
                                <p className="text-base font-bold text-text-main dark:text-white">Payment confirmed!</p>
                                <p className="text-xs text-text-muted dark:text-gray-400 mt-1">
                                    Your session with {therapistName} is booked and paid.
                                </p>
                            </div>
                            <button
                                onClick={handleViewBooking}
                                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-xl transition-colors"
                            >
                                View Booking →
                            </button>
                        </div>
                    )}

                    {/* ── error: accept failed ── */}
                    {step === "error" && (
                        <div className="p-6 space-y-5">
                            <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                                <MdWarning className="text-red-500 text-lg shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700 dark:text-red-300">{errorMsg}</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleClose}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark text-sm font-bold text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white transition-colors"
                                >
                                    Close
                                </button>
                                {errorMsg.includes("upgrade") ? (
                                    <button
                                        onClick={handleUpgradePlan}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors"
                                    >
                                        Upgrade Plan
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setStep("idle")}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-colors"
                                    >
                                        Try Again
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

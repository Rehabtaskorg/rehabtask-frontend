/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripeAppearance } from "@/lib/stripe.appearance";
import {
    MdArrowBack, MdChat, MdCalendarToday, MdAccessTime, MdLocationOn, MdVideocam, MdPerson,
    MdCheckCircle, MdClose, MdWarning, MdInfo, MdRefresh, MdSchedule, MdUpdate,
    MdLock, MdCreditCard,
} from "react-icons/md";
import { useBookingDetail } from "@/hooks/useBookings";
import { bookingsApi } from "@/lib/bookings.api";
import { api } from "@/lib/api";
import { paymentsApi } from "@/lib/payments.api";
import { resolveVisitPlan, computeTotalVisits } from "@/lib/visitPlan";
import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import BookingTimeline from "@/components/bookings/BookingTimeline";
import BookingSharedFiles from "@/components/bookings/BookingSharedFiles";
import SessionList from "@/components/bookings/SessionList";
import PaymentSummaryCard from "@/components/bookings/PaymentSummaryCard";
import RequestRevisionModal from "@/components/shared/sessions/RequestRevisionModal";
import MarkSessionMissedModal from "@/components/shared/sessions/MarkSessionMissedModal";
import RevisionStatusBanner from "@/components/shared/sessions/RevisionStatusBanner";
import { formatCurrency } from "@/utils/messages";
import { usePageTitle } from "@/hooks/usePageTitle";
import PatientInfoBlock from "@/components/customer/PatientInfoBlock";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const BRAND_LABELS = {
    visa: "Visa", mastercard: "Mastercard", amex: "Amex",
    discover: "Discover", diners: "Diners", jcb: "JCB", unionpay: "UnionPay",
};

// ─── New Card Checkout (inside Stripe Elements) ──────────────────────────────
function NewCardCheckoutForm({ booking, onSuccess, onError }) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        setError(null);

        try {
            const { error: submitError } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/customer/bookings/${booking.id}?payment=success`,
                },
            });

            if (submitError) {
                setError(submitError.message);
            }
        } catch (err) {
            setError("An unexpected error occurred.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            <button
                type="submit"
                disabled={!stripe || processing}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-colors disabled:opacity-50 text-sm"
            >
                {processing ? "Processing..." : `Pay ${formatCurrency(parseFloat(booking.rate))}`}
            </button>
        </form>
    );
}

// ─── Inline Payment Section ──────────────────────────────────────────────────
function InlinePaymentSection({ booking, onPaymentSuccess }) {
    const [selectedPmId, setSelectedPmId] = useState(null);
    const [showNewCard, setShowNewCard] = useState(false);
    const [paying, setPaying] = useState(false);
    const [payError, setPayError] = useState(null);
    const [newCardClientSecret, setNewCardClientSecret] = useState(null);
    const [loadingNewCard, setLoadingNewCard] = useState(false);

    const { data: methods = [], isLoading: methodsLoading } = useQuery({
        queryKey: ["paymentMethods"],
        queryFn: async () => {
            const res = await paymentsApi.getPaymentMethods();
            return res.data.data;
        },
    });

    // Auto-select default card
    useEffect(() => {
        if (methods.length > 0 && !selectedPmId) {
            const defaultCard = methods.find((m) => m.isDefault) || methods[0];
            setSelectedPmId(defaultCard.id);
        }
    }, [methods.length]);

    const handlePayWithSavedCard = async () => {
        if (paying) return;
        if (!selectedPmId) return;
        setPaying(true);
        setPayError(null);

        try {
            const res = await api.post("/payments/create-intent", {
                bookingId: booking.id,
                paymentMethodId: selectedPmId,
            });

            const result = res.data.data;
            console.log("[PAY DEBUG] create-intent result:", result);

            if (result.status === "succeeded") {
                onPaymentSuccess();
                return;
            }

            if (result.status === "requires_action" && result.clientSecret) {
                const stripeInstance = await stripePromise;
                const { error: confirmError, paymentIntent } = await stripeInstance.confirmCardPayment(result.clientSecret, { payment_method: selectedPmId });
                console.log("[PAY DEBUG] confirmCardPayment:", { confirmError, status: paymentIntent?.status });
                if (confirmError) {
                    setPayError(confirmError.message);
                } else if (paymentIntent?.status === "succeeded") {
                    onPaymentSuccess();
                } else {
                    setPayError("Payment could not be completed. Please try again.");
                }
                return;
            }

            if (result.status === "processing") {
                setPayError("Payment is processing. Please wait a moment and refresh.");
                return;
            }

            console.log("[PAY DEBUG] unexpected status:", result.status);
            setPayError("Payment could not be completed. Please try again or use a different card.");
        } catch (err) {
            console.log("[PAY DEBUG] catch error:", err.response?.data || err.message);
            setPayError(err.response?.data?.message || "Payment failed. Please try again.");
        } finally {
            setPaying(false);
        }
    };

    const handleShowNewCard = async () => {
        setLoadingNewCard(true);
        setPayError(null);
        try {
            const res = await api.post("/payments/create-intent", { bookingId: booking.id });
            setNewCardClientSecret(res.data.data.clientSecret);
            setShowNewCard(true);
        } catch (err) {
            setPayError(err.response?.data?.message || "Failed to start payment.");
        } finally {
            setLoadingNewCard(false);
        }
    };

    const perSessionRate = parseFloat(booking.rate);
    // Effective plan: booking (authoritative post-acceptance) > offer override > request (legacy).
    const plan = resolveVisitPlan({ booking, offer: booking.offer, request: booking.offer?.request });
    const totalSessionsFromFreq = computeTotalVisits(plan) ?? 1;
    const sessionsCount = booking.sessions?.length > 1 ? booking.sessions.length : totalSessionsFromFreq;
    const isMultiSession = sessionsCount > 1;
    const totalAmount = perSessionRate * sessionsCount;
    const amount = formatCurrency(totalAmount);

    return (
        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-2">
                <MdLock className="text-text-muted dark:text-gray-400" />
                <h3 className="text-base font-bold text-text-main dark:text-white">Complete Payment</h3>
            </div>

            {/* Escrow info */}
            <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2.5">
                <MdInfo className="text-blue-600 dark:text-blue-400 text-sm mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                    Your payment will be held securely until you confirm {isMultiSession ? "all sessions" : "session"} completion
                </p>
            </div>

            {/* Amount */}
            <div>
                {isMultiSession ? (
                    <>
                        <p className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wider">
                            {formatCurrency(perSessionRate)}/session × {sessionsCount} sessions
                        </p>
                        <p className="text-2xl font-black text-text-main dark:text-white">{amount}</p>
                    </>
                ) : (
                    <>
                        <p className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wider">Session Rate</p>
                        <p className="text-2xl font-black text-text-main dark:text-white">{amount}</p>
                    </>
                )}
            </div>

            {payError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2.5">
                    <p className="text-xs text-red-700 dark:text-red-300">{payError}</p>
                </div>
            )}

            {methodsLoading ? (
                <div className="flex justify-center py-6">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : !showNewCard ? (
                <>
                    {/* Saved Cards */}
                    {methods.length > 0 && (
                        <div className="space-y-2">
                            {methods.map((pm) => (
                                <label
                                    key={pm.id}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                                        selectedPmId === pm.id
                                            ? "border-primary bg-primary/5 dark:bg-primary/10"
                                            : "border-border-light dark:border-border-dark hover:border-slate-300 dark:hover:border-slate-600"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value={pm.id}
                                        checked={selectedPmId === pm.id}
                                        onChange={() => { setSelectedPmId(pm.id); setPayError(null); }}
                                        className="accent-primary"
                                    />
                                    <MdCreditCard className="text-lg text-text-muted dark:text-gray-400" />
                                    <div className="flex-1 min-w-0">
                                        <span className="text-sm font-bold text-text-main dark:text-white">
                                            {BRAND_LABELS[pm.brand] || pm.brand} &bull;&bull;&bull;&bull; {pm.last4}
                                        </span>
                                        <span className="text-xs text-text-muted dark:text-gray-400 ml-2">
                                            Expires {String(pm.expMonth).padStart(2, "0")}/{String(pm.expYear).slice(-2)}
                                        </span>
                                    </div>
                                    {pm.isDefault && (
                                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                            Default
                                        </span>
                                    )}
                                </label>
                            ))}
                        </div>
                    )}

                    {/* Use different method link */}
                    <button
                        onClick={handleShowNewCard}
                        disabled={loadingNewCard}
                        className="text-sm text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50"
                    >
                        {loadingNewCard ? "Loading..." : methods.length > 0 ? "Use a different payment method" : "Enter card details"}
                    </button>

                    {/* Pay button (saved card) */}
                    {methods.length > 0 && (
                        <button
                            onClick={handlePayWithSavedCard}
                            disabled={paying || !selectedPmId}
                            className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-colors disabled:opacity-50 text-sm"
                        >
                            {paying ? "Processing..." : `Pay ${amount}`}
                        </button>
                    )}
                </>
            ) : (
                /* New Card Form */
                newCardClientSecret && (
                    <div className="space-y-3">
                        {methods.length > 0 && (
                            <button
                                onClick={() => setShowNewCard(false)}
                                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                            >
                                &larr; Back to saved cards
                            </button>
                        )}
                        <Elements
                            stripe={stripePromise}
                            options={{ clientSecret: newCardClientSecret, appearance: getStripeAppearance() }}
                        >
                            <NewCardCheckoutForm booking={booking} onSuccess={onPaymentSuccess} />
                        </Elements>
                    </div>
                )
            )}

            {/* Stripe footer */}
            <p className="text-[10px] text-text-muted dark:text-gray-500 text-center">
                Powered by Stripe
            </p>
        </div>
    );
}

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" });
};

const formatTime = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

export default function CustomerBookingDetailPage() {
    usePageTitle("Booking Details");
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { booking, loading, error, refetch } = useBookingDetail(params.id);

    // UI states
    const [confirming, setConfirming] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showRevisionModal, setShowRevisionModal] = useState(false);
    const [revisionSessionId, setRevisionSessionId] = useState(null);
    const [reportMissedSession, setReportMissedSession] = useState(null);
    const [showRefundForm, setShowRefundForm] = useState(false);
    const [refundReason, setRefundReason] = useState("");
    const [refunding, setRefunding] = useState(false);
    const [showPaymentBanner, setShowPaymentBanner] = useState(false);
    const [rescheduleResponding, setRescheduleResponding] = useState(null);
    const [actionError, setActionError] = useState(null);
    const [awaitingPaymentUpdate, setAwaitingPaymentUpdate] = useState(false);

    // Auto-refresh when waiting for therapist actions (mark complete, schedule sessions)
    useEffect(() => {
        if (booking && ["confirmed", "in_progress"].includes(booking.status)) {
            const interval = setInterval(() => { refetch(); }, 5000);
            return () => clearInterval(interval);
        }
    }, [booking?.status, refetch]);

    // Poll after payment success until webhook updates the booking status
    useEffect(() => {
        if (!awaitingPaymentUpdate) return;
        const interval = setInterval(() => { refetch(); }, 2000);
        const timeout = setTimeout(() => { setAwaitingPaymentUpdate(false); }, 30000);
        return () => { clearInterval(interval); clearTimeout(timeout); };
    }, [awaitingPaymentUpdate, refetch]);

    // Stop polling once booking status changes from accepted/pending
    useEffect(() => {
        if (awaitingPaymentUpdate && booking && !["pending", "accepted"].includes(booking.status)) {
            setAwaitingPaymentUpdate(false);
        }
    }, [awaitingPaymentUpdate, booking?.status]);

    useEffect(() => {
        const ownSuccess = searchParams.get("payment") === "success";
        const redirectStatus = searchParams.get("redirect_status");

        if (ownSuccess || redirectStatus === "succeeded") {
            setShowPaymentBanner(true);
            setAwaitingPaymentUpdate(true);
            window.history.replaceState({}, "", `/customer/bookings/${params.id}`);
            const timer = setTimeout(() => setShowPaymentBanner(false), 6000);
            return () => clearTimeout(timer);
        }

        if (redirectStatus === "failed") {
            window.history.replaceState({}, "", `/customer/bookings/${params.id}`);
        }
    }, [searchParams, params.id]);

    const clearError = () => setActionError(null);

    const handleProceedToPayment = () => {
        // Scroll to the inline payment section on this page
        document.getElementById("inline-payment")?.scrollIntoView({ behavior: "smooth" });
    };

    const handleConfirmCompletion = async () => {
        setConfirming(true);
        clearError();
        try {
            await bookingsApi.confirmSession(booking.sessions?.[0]?.id);
            setShowConfirmDialog(false);
            await refetch();
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to confirm completion.");
        } finally {
            setConfirming(false);
        }
    }

    const handleRequestRefund = async () => {
        if (!refundReason.trim()) return;
        setRefunding(true);
        clearError();

        try {
            await bookingsApi.requestRefund(params.id, refundReason);
            setShowRefundForm(false);
            setRefundReason("");
            await refetch();
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to process refund.");
        } finally {
            setRefunding(false);
        }
    }

    const handleRescheduleResponse = async (accept) => {
        setRescheduleResponding(accept ? "accept" : "decline");
        clearError();
        try {
            await bookingsApi.respondToReschedule(params.id, accept);
            await refetch();
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to respond to reschedule.");
        } finally {
            setRescheduleResponding(null);
        }
    };

    const handleMessageTherapist = () => {
        router.push(`/customer/messages?c=booking:${params.id}`);
    }

    const handlePaymentAction = useCallback((action) => {
        if (action === "proceed_payment") handleProceedToPayment();
    }, []);

    // Loading
    if (loading) {
        return (
            <div className="p-4 md:p-6 max-w-6xl mx-auto">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-6 w-64 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-8 space-y-4">
                            <div className="h-40 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl" />
                            <div className="h-60 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl" />
                        </div>
                        <div className="lg:col-span-4 space-y-4">
                            <div className="h-48 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error / Not found
    if (error || !booking) {
        return (
            <div className="p-4 md:p-6 max-w-6xl mx-auto">
                <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-text-muted dark:text-gray-400 hover:text-primary transition-colors mb-6">
                    <MdArrowBack className="text-base" /> Back
                </button>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                    <p className="text-red-700 dark:text-red-400 font-semibold">Booking not found</p>
                    <button onClick={refetch} className="text-primary hover:underline text-sm font-bold mt-2 flex items-center gap-1 mx-auto">
                        <MdRefresh className="text-base" /> Retry
                    </button>
                </div>
            </div>
        );
    }

    const therapist = booking.therapist;
    const sessions = booking.sessions || [];
    const session = sessions[0];
    const payment = booking.payment;
    const offer = booking.offer;
    const request = offer?.request;
    const therapistInitial = therapist?.fullName?.charAt(0) || "?";
    const sessionType = offer?.sessionType;

    // Effective plan: booking (authoritative post-acceptance) > offer override > request (legacy).
    const plan = resolveVisitPlan({ booking, offer, request });
    const totalSessionsFromFrequency = computeTotalVisits(plan) ?? 1;
    const totalSessions = sessions.length > 1 ? sessions.length : totalSessionsFromFrequency;
    const isMultiSession = totalSessions > 1;
    const perSessionRate = parseFloat(booking.rate);
    const totalAmount = payment ? parseFloat(payment.amount) : perSessionRate * totalSessions;

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
            {/* Payment success banner */}
            {showPaymentBanner && (
                <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                    <MdCheckCircle className="text-emerald-600 dark:text-emerald-400 text-lg shrink-0" />
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 flex-1">
                        Payment successful! Your session is confirmed.
                    </p>
                    <button onClick={() => setShowPaymentBanner(false)} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200">
                        <MdClose className="text-base" />
                    </button>
                </div>
            )}

            {/* Action error banner */}
            {actionError && (
                <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <MdWarning className="text-red-600 dark:text-red-400 text-lg shrink-0" />
                    <p className="text-sm text-red-800 dark:text-red-300 flex-1">{actionError}</p>
                    <button onClick={clearError} className="text-red-600 dark:text-red-400 hover:text-red-800">
                        <MdClose className="text-base" />
                    </button>
                </div>
            )}

            {/* Back button */}
            <button
                onClick={() => router.push("/customer/bookings")}
                className="flex items-center gap-1 text-sm text-text-muted dark:text-gray-400 hover:text-primary transition-colors mb-6"
            >
                <MdArrowBack className="text-base" /> Back to Bookings
            </button>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-text-main dark:text-white">
                        Booking Details
                    </h1>
                    <p className="text-xs text-text-muted dark:text-gray-400 mt-0.5 font-mono">
                        ID: {booking.id.slice(0, 8)}...
                    </p>
                </div>
                <BookingStatusBadge status={booking.status} size="md" />
            </div>

            {/* Two-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* ── Left Column ── */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Therapist Card */}
                    <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5">
                        <div className="flex items-start gap-4">
                            {therapist?.profilePhotoUrl ? (
                                <Image
                                    src={therapist.profilePhotoUrl}
                                    alt={therapist.fullName}
                                    width={56}
                                    height={56}
                                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                                    {therapistInitial}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-text-main dark:text-white">
                                    {therapist?.fullName || "Therapist"}
                                </h3>
                                {therapist?.specialization && (
                                    <p className="text-sm text-text-muted dark:text-gray-400 mt-0.5">
                                        {therapist.specialization}
                                    </p>
                                )}
                                {therapist?.phone && (
                                    <p className="text-xs text-text-muted dark:text-gray-500 mt-1">
                                        {therapist.phone}
                                    </p>
                                )}
                            </div>
                            {["accepted", "confirmed", "in_progress", "completed", "reschedule_requested"].includes(booking.status) && (
                                <button
                                    onClick={handleMessageTherapist}
                                    className="flex items-center gap-1.5 px-3 py-2 border border-primary text-primary rounded-lg text-xs font-bold hover:bg-primary/5 transition-colors shrink-0"
                                >
                                    <MdChat className="text-sm" />
                                    Message
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Patient info block (agency bookings only) */}
                    {booking.patient && <PatientInfoBlock patient={booking.patient} />}

                    {/* Session Details */}
                    <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5">
                        <h3 className="text-sm font-bold text-text-main dark:text-white mb-4">Session Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <MdSchedule className="text-primary text-lg mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-text-muted dark:text-gray-400">Service</p>
                                    <p className="text-sm font-medium text-text-main dark:text-white">{request?.serviceType || "—"}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MdCalendarToday className="text-primary text-lg mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-text-muted dark:text-gray-400">Date</p>
                                    <p className="text-sm font-medium text-text-main dark:text-white">{formatDate(session?.scheduledDate || booking.scheduledDate)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MdAccessTime className="text-primary text-lg mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-text-muted dark:text-gray-400">Time</p>
                                    <p className="text-sm font-medium text-text-main dark:text-white">{formatTime(session?.scheduledDate || booking.scheduledDate)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                {sessionType === "virtual" ? (
                                    <MdVideocam className="text-primary text-lg mt-0.5 shrink-0" />
                                ) : (
                                    <MdLocationOn className="text-primary text-lg mt-0.5 shrink-0" />
                                )}
                                <div>
                                    <p className="text-xs text-text-muted dark:text-gray-400">
                                        {sessionType === "virtual" ? "Session Type" : "Location"}
                                    </p>
                                    <p className="text-sm font-medium text-text-main dark:text-white">
                                        {sessionType === "virtual" ? "Virtual Session" : request?.location || "—"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Session type badge */}
                        {sessionType && (
                            <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${sessionType === "virtual"
                                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                    : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                                    }`}>
                                    {sessionType === "virtual" ? <MdVideocam className="text-sm" /> : <MdPerson className="text-sm" />}
                                    {sessionType === "virtual" ? "Virtual" : "In-Person"}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Timeline */}
                    <BookingTimeline booking={booking} />

                    {/* Multi-session treatment plan */}
                    {sessions.length > 1 && (
                        <SessionList
                            sessions={sessions}
                            booking={booking}
                            role="customer"
                            onConfirm={async (sessionId) => {
                                await bookingsApi.confirmSession(sessionId);
                                await refetch();
                            }}
                            onRequestRevision={(sessionId) => {
                                setRevisionSessionId(sessionId);
                                setShowRevisionModal(true);
                            }}
                            onReportMissed={(s) => setReportMissedSession(s)}
                        />
                    )}

                    {/* ── Action Area ── */}
                    <div className="space-y-4">
                        {/* Reschedule request */}
                        {booking.status === "reschedule_requested" && booking.proposedNewDate && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
                                <div className="flex items-start gap-3 mb-3">
                                    <MdUpdate className="text-amber-600 dark:text-amber-400 text-lg mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Reschedule Requested</p>
                                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                                            Therapist proposed: {formatDate(booking.proposedNewDate)} at {formatTime(booking.proposedNewDate)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-8">
                                    <button
                                        onClick={() => handleRescheduleResponse(true)}
                                        disabled={!!rescheduleResponding}
                                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {rescheduleResponding === "accept" ? "Accepting..." : "Accept"}
                                    </button>
                                    <button
                                        onClick={() => handleRescheduleResponse(false)}
                                        disabled={!!rescheduleResponding}
                                        className="px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-50"
                                    >
                                        {rescheduleResponding === "decline" ? "Declining..." : "Decline"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Accepted/Pending — inline payment section (show when no payment, payment needs action, or payment failed) */}
                        {["pending", "accepted"].includes(booking.status) && (!payment || ["intent_created", "requires_action", "failed"].includes(payment.status)) && (
                            <div id="inline-payment">
                                <InlinePaymentSection
                                    booking={booking}
                                    onPaymentSuccess={() => {
                                        setShowPaymentBanner(true);
                                        setAwaitingPaymentUpdate(true);
                                        refetch();
                                        const timer = setTimeout(() => setShowPaymentBanner(false), 6000);
                                    }}
                                />
                            </div>
                        )}

                        {/* Escrowed + scheduled — can request refund */}
                        {payment?.status === "escrowed" && session?.status === "scheduled" && !showRefundForm && (
                            <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <MdInfo className="text-primary text-lg mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-text-main dark:text-white">Session Confirmed</p>
                                        <p className="text-xs text-text-muted dark:text-gray-400 mt-0.5">
                                            Your payment is held securely and will be released after session completion.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowRefundForm(true)}
                                    className="mt-3 ml-8 text-xs font-semibold text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                                >
                                    Cancel & Request Refund
                                </button>
                            </div>
                        )}

                        {/* Refund form */}
                        {showRefundForm && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5">
                                <p className="text-sm font-bold text-red-900 dark:text-red-200 mb-2">Request Refund</p>
                                <p className="text-xs text-red-700 dark:text-red-300 mb-3">
                                    This will cancel your booking and refund your payment.
                                </p>
                                <textarea
                                    rows={2}
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    placeholder="Please provide a reason for the refund..."
                                    className="w-full text-sm rounded-lg bg-white dark:bg-slate-800 border border-red-200 dark:border-red-700 p-2 focus:ring-red-400 focus:outline-none resize-none text-text-main dark:text-white mb-3"
                                />
                                <div className="flex items-center gap-2 justify-end">
                                    <button
                                        onClick={() => { setShowRefundForm(false); setRefundReason(""); }}
                                        className="text-sm text-slate-500 dark:text-slate-400 font-bold hover:text-text-main dark:hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleRequestRefund}
                                        disabled={!refundReason.trim() || refunding}
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 transition-colors"
                                    >
                                        {refunding ? "Processing..." : "Confirm Refund"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Session in revision — customer is waiting for therapist resubmit */}
                        {session?.status === "in_revision" && (
                            <RevisionStatusBanner
                                revisionRequestedAt={session.revisionRequestedAt}
                                revisionReason={session.revisionReason}
                                revisionDueBy={session.revisionDueBy}
                                revisionCount={session.revisionCount}
                                conversationHref={`/customer/messages?c=booking:${params.id}`}
                                viewerRole="customer"
                            />
                        )}

                        {/* Session completed by therapist — confirm or request revision (single-session only; multi-session has per-session buttons in SessionList) */}
                        {sessions.length <= 1 && session?.status === "completed_by_therapist" && !showConfirmDialog && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <MdWarning className="text-amber-600 dark:text-amber-400 text-lg mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                                            {session.revisionCount > 0 ? "Session Resubmitted" : "Session Marked Complete"}
                                        </p>
                                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                                            {session.revisionCount > 0
                                                ? "Your therapist has addressed your revision request and resubmitted the session. Please review and confirm, or request additional changes."
                                                : "Your therapist has marked this session as complete. Please confirm to release payment, or request changes if something needs updating."}
                                        </p>
                                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                            Payment auto-releases after 72 hours if not confirmed.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-3 ml-8 flex flex-wrap items-center gap-2">
                                    <button
                                        onClick={() => setShowConfirmDialog(true)}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors"
                                    >
                                        Confirm Completion
                                    </button>
                                    <button
                                        onClick={() => { setRevisionSessionId(session?.id); setShowRevisionModal(true); }}
                                        className="border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 px-5 py-2 rounded-lg text-sm font-bold transition-colors"
                                    >
                                        Request Revision
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Confirm dialog (inline, single-session only) */}
                        {sessions.length <= 1 && showConfirmDialog && (
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5">
                                <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200 mb-1">Confirm Session Completion?</p>
                                <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-4">
                                    This will release {formatCurrency(parseFloat(booking.rate))} to the therapist. This action cannot be undone.
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleConfirmCompletion}
                                        disabled={confirming}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-50 transition-colors"
                                    >
                                        {confirming ? "Confirming..." : "Yes, Confirm"}
                                    </button>
                                    <button
                                        onClick={() => setShowConfirmDialog(false)}
                                        className="text-sm text-slate-500 dark:text-slate-400 font-bold hover:text-text-main dark:hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Confirmed by customer — success (not shown for finalized bookings) */}
                        {booking.status !== "finalized" && (() => {
                            const allConfirmed = isMultiSession
                                ? sessions.length > 0 && sessions.every(s => s.status === "confirmed_by_customer")
                                : session?.status === "confirmed_by_customer";
                            const paymentReleased = payment?.status === "released";

                            if (allConfirmed || paymentReleased) return (
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5">
                                    <div className="flex items-start gap-3">
                                        <MdCheckCircle className="text-emerald-600 dark:text-emerald-400 text-lg mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                                                {isMultiSession ? "All Sessions Complete" : "Session Complete"}
                                            </p>
                                            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                                                {paymentReleased
                                                    ? `Payment of ${formatCurrency(parseFloat(payment.amount))} has been released to the therapist.`
                                                    : "Payment will be released shortly."
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                            return null;
                        })()}

                        {/* Cancelled */}
                        {booking.status === "cancelled" && (
                            <div className="bg-slate-50 dark:bg-slate-800/50 border border-border-light dark:border-border-dark rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <MdInfo className="text-text-muted dark:text-gray-400 text-lg mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-text-main dark:text-white">Booking Cancelled</p>
                                        {session?.cancellationReason && (
                                            <p className="text-xs text-text-muted dark:text-gray-400 mt-0.5">
                                                Reason: {session.cancellationReason}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right Column ── */}
                <div className="lg:col-span-4 space-y-6">
                    <PaymentSummaryCard
                        booking={booking}
                        role="customer"
                        onAction={handlePaymentAction}
                    />

                    {/* Shared Files */}
                    <BookingSharedFiles bookingId={booking.id} canUpload={false} />

                    {/* Payment status info */}
                    {payment?.status === "escrowed" && booking.status !== "finalized" && booking.status !== "cancelled" && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                            <div className="flex items-start gap-2">
                                <MdInfo className="text-blue-600 dark:text-blue-400 text-sm mt-0.5 shrink-0" />
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    Your payment is held securely in escrow. The therapist receives their share as you confirm each session.
                                </p>
                            </div>
                        </div>
                    )}
                    {payment?.status === "partially_released" && (() => {
                        const totalAmount = parseFloat(payment.amount);
                        const platformFee = parseFloat(payment.platformFee ?? 0);
                        const releasedAmount = parseFloat(payment.releasedAmount ?? 0);
                        const refundedAmount = parseFloat(payment.refundedAmount ?? 0);
                        const feeRatio = totalAmount > 0 ? platformFee / totalAmount : 0;
                        const grossReleased = feeRatio < 1 ? parseFloat((releasedAmount / (1 - feeRatio)).toFixed(2)) : releasedAmount;
                        const stillInEscrow = Math.max(0, parseFloat((totalAmount - grossReleased - refundedAmount).toFixed(2)));
                        return (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                <div className="flex items-start gap-2">
                                    <MdInfo className="text-blue-600 dark:text-blue-400 text-sm mt-0.5 shrink-0" />
                                    <div className="text-xs text-blue-700 dark:text-blue-300 space-y-0.5">
                                        <p>{formatCurrency(grossReleased)} paid for confirmed sessions.</p>
                                        {refundedAmount > 0 && (
                                            <p>{formatCurrency(refundedAmount)} refunded to you for missed/undelivered sessions.</p>
                                        )}
                                        {stillInEscrow > 0 && (
                                            <p>{formatCurrency(stillInEscrow)} held in escrow for upcoming sessions.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                    {booking.status === "finalized" && payment?.refundedAmount && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                            <div className="flex items-start gap-2">
                                <MdCheckCircle className="text-emerald-600 dark:text-emerald-400 text-sm mt-0.5 shrink-0" />
                                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                                    Series finalized. {formatCurrency(parseFloat(payment.refundedAmount))} has been refunded for undelivered sessions.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Request Revision modal — mounted at root so it's not constrained
                by parent overflow/layout */}
            <RequestRevisionModal
                isOpen={showRevisionModal}
                onClose={() => { setShowRevisionModal(false); setRevisionSessionId(null); }}
                sessionId={revisionSessionId || session?.id}
                onSuccess={refetch}
            />

            {/* Report Missed Visit modal (customer complaint flow) */}
            <MarkSessionMissedModal
                isOpen={!!reportMissedSession}
                onClose={() => setReportMissedSession(null)}
                sessionId={reportMissedSession?.id}
                sessionNumber={reportMissedSession?.sessionNumber}
                actorRole="customer"
                refundAmount={booking?.rate}
                onSuccess={refetch}
            />
        </div>
    )

}
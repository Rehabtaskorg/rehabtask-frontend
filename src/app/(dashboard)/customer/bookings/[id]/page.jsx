/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
    MdArrowBack, MdChat, MdCalendarToday, MdAccessTime, MdLocationOn, MdVideocam, MdPerson,
    MdCheckCircle, MdClose, MdWarning, MdInfo, MdRefresh, MdSchedule, MdUpdate,
} from "react-icons/md";
import { useBookingDetail } from "@/hooks/useBookings";
import { bookingsApi } from "@/lib/bookings.api";
import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import BookingTimeline from "@/components/bookings/BookingTimeline";
import PaymentSummaryCard from "@/components/bookings/PaymentSummaryCard";
import { formatCurrency } from "@/utils/messages";
import { usePageTitle } from "@/hooks/usePageTitle";

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
    const [showRefundForm, setShowRefundForm] = useState(false);
    const [refundReason, setRefundReason] = useState("");
    const [refunding, setRefunding] = useState(false);
    const [showPaymentBanner, setShowPaymentBanner] = useState(false);
    const [rescheduleResponding, setRescheduleResponding] = useState(null);
    const [actionError, setActionError] = useState(null);

    // Payment success banner from redirect
    useEffect(() => {
        if (searchParams.get("payment") === "success") {
            setShowPaymentBanner(true);
            window.history.replaceState({}, "", `/customer/bookings/${params.id}`);
            const timer = setTimeout(() => setShowPaymentBanner(false), 6000);
            return () => clearTimeout(timer);
        }
    }, [searchParams, params.id]);

    const clearError = () => setActionError(null);

    const handleProceedToPayment = () => {
        router.push(`/customer/bookings/${params.id}/payment`);
    };

    const handleConfirmCompletion = async () => {
        setConfirming(true);
        clearError();
        try {
            await bookingsApi.confirmSession(booking.session.id);
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
        else if (action === "confirm_completion") setShowConfirmDialog(true);
    }, []);

    // Loading
    if (loading) {
        return (
            <div className="p-4 sm:p-8 max-w-6xl mx-auto">
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
            <div className="p-4 sm:p-8 max-w-6xl mx-auto">
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
    const session = booking.session;
    const payment = booking.payment;
    const offer = booking.offer;
    const request = offer?.request;
    const therapistInitial = therapist?.fullName?.charAt(0) || "?";
    const sessionType = offer?.sessionType;

    return (
        <div className="p-4 sm:p-8 max-w-6xl mx-auto">
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
                            {["confirmed", "in_progress", "completed"].includes(booking.status) && (
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
                                    <p className="text-sm font-medium text-text-main dark:text-white">{formatDate(booking.scheduledDate)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MdAccessTime className="text-primary text-lg mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-text-muted dark:text-gray-400">Time</p>
                                    <p className="text-sm font-medium text-text-main dark:text-white">{formatTime(booking.scheduledDate)}</p>
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

                        {/* Pending — no payment yet */}
                        {booking.status === "pending" && !payment && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <MdInfo className="text-blue-600 dark:text-blue-400 text-lg mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-blue-900 dark:text-blue-200">Payment Required</p>
                                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                                            Complete payment to confirm your session.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleProceedToPayment}
                                    className="mt-3 ml-8 bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors"
                                >
                                    Proceed to Payment
                                </button>
                            </div>
                        )}

                        {/* Payment intent created — waiting */}
                        {payment?.status === "intent_created" && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <MdInfo className="text-amber-600 dark:text-amber-400 text-lg mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Payment Processing</p>
                                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                                            Waiting for payment confirmation.
                                        </p>
                                    </div>
                                    <button onClick={refetch} className="text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1">
                                        <MdRefresh className="text-sm" /> Refresh
                                    </button>
                                </div>
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

                        {/* Session completed by therapist — confirm */}
                        {session?.status === "completed_by_therapist" && !showConfirmDialog && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <MdWarning className="text-amber-600 dark:text-amber-400 text-lg mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Session Marked Complete</p>
                                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                                            Your therapist has marked this session as complete. Please confirm to release payment.
                                        </p>
                                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                            Payment auto-releases after 72 hours if not confirmed.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowConfirmDialog(true)}
                                    className="mt-3 ml-8 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors"
                                >
                                    Confirm Completion
                                </button>
                            </div>
                        )}

                        {/* Confirm dialog (inline) */}
                        {showConfirmDialog && (
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

                        {/* Confirmed by customer — success */}
                        {session?.status === "confirmed_by_customer" && (
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <MdCheckCircle className="text-emerald-600 dark:text-emerald-400 text-lg mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Session Complete</p>
                                        <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                                            Payment of {formatCurrency(parseFloat(booking.rate))} has been released to the therapist.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

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

                    {/* Payment status info */}
                    {payment && payment.status === "escrowed" && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                            <div className="flex items-start gap-2">
                                <MdInfo className="text-blue-600 dark:text-blue-400 text-sm mt-0.5 shrink-0" />
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    Your payment is held securely in escrow and will be released after you confirm session completion.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )

}
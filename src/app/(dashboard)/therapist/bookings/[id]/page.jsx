"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    MdArrowBack, MdChat, MdCalendarToday, MdAccessTime, MdLocationOn, MdVideocam, MdPerson,
    MdCheckCircle, MdClose, MdWarning, MdInfo, MdRefresh, MdSchedule
} from "react-icons/md";
import { useBookingDetail } from "@/hooks/useBookings";
import { bookingsApi } from "@/lib/bookings.api";
import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import BookingTimeline from "@/components/bookings/BookingTimeline";
import PaymentSummaryCard from "@/components/bookings/PaymentSummaryCard";
import { formatCurrency } from "@/utils/messages";
import { usePageTitle } from "@/hooks/usePageTitle";
import PatientInfoBlock from "@/components/customer/PatientInfoBlock";

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" });
};

const formatTime = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

export default function TherapistBookingDetailPage() {
    usePageTitle("Booking Details");
    const params = useParams();
    const router = useRouter();
    const { booking, loading, error, refetch } = useBookingDetail(params.id);

    // UI states
    const [completing, setCompleting] = useState(false);
    const [showCompleteDialog, setShowCompleteDialog] = useState(false);
    const [actionError, setActionError] = useState(null);

    // Auto-refresh when waiting for customer confirmation
    useEffect(() => {
        if (booking?.session?.status === "completed_by_therapist") {
            const interval = setInterval(() => {
                refetch();
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [booking?.session?.status, refetch]);

    const clearError = () => setActionError(null);

    const handleMarkComplete = async () => {
        setCompleting(true);
        clearError();
        try {
            await bookingsApi.completeSession(booking.session.id);
            setShowCompleteDialog(false);
            await refetch();
        } catch (err) {
            const errorCode = err.response?.data?.code;
            if (errorCode === "STRIPE_NOT_CONNECTED") {
                setShowCompleteDialog(false);
                setActionError("STRIPE_NOT_CONNECTED");
            } else {
                setActionError(err.response?.data?.message || "Failed to mark session as complete.");
            }
        } finally {
            setCompleting(false);
        }
    };

    const handleMessageCustomer = () => {
        router.push(`/therapist/messages?c=booking:${params.id}`);
    };

    const handlePaymentAction = useCallback((action) => {
        if (action === "mark_complete") setShowCompleteDialog(true);
    }, []);

    // ─── Loading ────
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

    // ─── Error / Not found ────
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

    const customer = booking.customer;
    const session = booking.session;
    const payment = booking.payment;
    const offer = booking.offer;
    const request = offer?.request;
    const customerInitial = customer?.fullName?.charAt(0) || "?";
    const sessionType = offer?.sessionType;

    const earnings = payment
        ? parseFloat(payment.therapistPayout)
        : null;

    return (
        <div className="p-4 sm:p-8 max-w-6xl mx-auto">
            {/* Action error banner */}
            {actionError === "STRIPE_NOT_CONNECTED" ? (
                <div className="mb-4 flex items-start gap-3 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <MdWarning className="text-amber-600 dark:text-amber-400 text-lg shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-bold text-amber-800 dark:text-amber-200">Stripe Account Required</p>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
                            You must connect and complete your Stripe account setup before marking a session as complete.
                        </p>
                        <button
                            onClick={() => router.push("/therapist/account-settings")}
                            className="text-sm font-bold text-primary hover:underline mt-1 inline-block"
                        >
                            Set up Stripe account →
                        </button>
                    </div>
                    <button onClick={clearError} className="text-amber-600 dark:text-amber-400 hover:text-amber-800">
                        <MdClose className="text-base" />
                    </button>
                </div>
            ) : actionError ? (
                <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <MdWarning className="text-red-600 dark:text-red-400 text-lg shrink-0" />
                    <p className="text-sm text-red-800 dark:text-red-300 flex-1">{actionError}</p>
                    <button onClick={clearError} className="text-red-600 dark:text-red-400 hover:text-red-800">
                        <MdClose className="text-base" />
                    </button>
                </div>
            ) : null}


            {/* Back button */}
            <button
                onClick={() => router.push("/therapist/bookings")}
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
                    {/* Customer Card */}
                    <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                                {customerInitial}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-text-main dark:text-white">
                                    {customer?.fullName || "Customer"}
                                </h3>
                                {customer?.phone && (
                                    <p className="text-sm text-text-muted dark:text-gray-400 mt-0.5">
                                        {customer.phone}
                                    </p>
                                )}
                                {customer?.location && (
                                    <p className="text-xs text-text-muted dark:text-gray-500 mt-0.5 flex items-center gap-1">
                                        <MdLocationOn className="text-sm" />
                                        {customer.location}
                                    </p>
                                )}
                            </div>
                            {["accepted", "confirmed", "in_progress", "completed"].includes(booking.status) && (
                                <button
                                    onClick={handleMessageCustomer}
                                    className="flex items-center gap-1.5 px-3 py-2 border border-primary text-primary rounded-lg text-xs font-bold hover:bg-primary/5 transition-colors shrink-0"
                                >
                                    <MdChat className="text-sm" />
                                    Message
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Patient info block (agency bookings only) */}
                    {booking.patient && (
                        <PatientInfoBlock
                            patient={booking.patient}
                            note="This booking is managed by an agency. The patient above is the person you will be treating."
                        />
                    )}

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

                    {/* Customer's Request Description */}
                    {request?.description && (
                        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5">
                            <h3 className="text-sm font-bold text-text-main dark:text-white mb-2">Customer&apos;s Request</h3>
                            <p className="text-sm text-text-muted dark:text-gray-400 leading-relaxed">
                                {request.description}
                            </p>
                        </div>
                    )}

                    {/* Timeline */}
                    <BookingTimeline booking={booking} />

                    {/* ── Action Area ── */}
                    <div className="space-y-4">
                        {/* Pending/Accepted — waiting for customer payment */}
                        {["pending", "accepted"].includes(booking.status) && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <MdInfo className="text-amber-600 dark:text-amber-400 text-lg mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Waiting for Customer Payment</p>
                                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                                            The customer needs to complete payment before this session is confirmed.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Confirmed + scheduled — mark complete */}
                        {booking.status === "confirmed" && session?.status === "scheduled" && !showCompleteDialog && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <MdInfo className="text-blue-600 dark:text-blue-400 text-lg mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-blue-900 dark:text-blue-200">Session Confirmed</p>
                                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                                            Mark the session as complete after your appointment.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowCompleteDialog(true)}
                                    className="mt-3 ml-8 bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors"
                                >
                                    Mark Session as Complete
                                </button>
                            </div>
                        )}

                        {/* Complete dialog (inline) */}
                        {showCompleteDialog && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
                                <p className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-1">Mark Session as Complete?</p>
                                <p className="text-xs text-blue-700 dark:text-blue-300 mb-4">
                                    The customer will be notified to confirm completion. {earnings != null ? <>Payment of {formatCurrency(earnings)} will be released</> : <>Payment will be released</>} after their confirmation.
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleMarkComplete}
                                        disabled={completing}
                                        className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-50 transition-colors"
                                    >
                                        {completing ? "Processing..." : "Yes, Mark Complete"}
                                    </button>
                                    <button
                                        onClick={() => setShowCompleteDialog(false)}
                                        className="text-sm text-slate-500 dark:text-slate-400 font-bold hover:text-text-main dark:hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Completed by therapist — waiting for customer */}
                        {session?.status === "completed_by_therapist" && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <MdWarning className="text-amber-600 dark:text-amber-400 text-lg mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Waiting for Customer Confirmation</p>
                                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                                            Customer needs to confirm session completion. Payment auto-releases after 72 hours.
                                        </p>
                                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 italic">
                                            Auto-checking every few seconds...
                                        </p>
                                    </div>
                                    <button onClick={refetch} className="text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1 shrink-0">
                                        <MdRefresh className="text-sm" /> Check Now
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Payment released — success */}
                        {payment?.status === "released" && (
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <MdCheckCircle className="text-emerald-600 dark:text-emerald-400 text-lg mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Payment Released</p>
                                        <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                                            {formatCurrency(earnings)} has been transferred to your Stripe account.
                                        </p>
                                        {payment.platformFee && (
                                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                                                Session rate: {formatCurrency(parseFloat(payment.amount))} — Platform fee: {formatCurrency(parseFloat(payment.platformFee))} — Your earnings: {formatCurrency(earnings)}
                                            </p>
                                        )}
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
                                        <p className="text-sm font-bold text-text-main dark:text-white">Session Cancelled</p>
                                        {session?.cancellationReason && (
                                            <p className="text-xs text-text-muted dark:text-gray-400 mt-0.5">
                                                Reason: {session.cancellationReason}
                                            </p>
                                        )}
                                        {payment?.status === "refunded" && (
                                            <p className="text-xs text-text-muted dark:text-gray-400 mt-0.5">
                                                Customer has been refunded.
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
                        role="therapist"
                        onAction={handlePaymentAction}
                    />

                    {/* Message Customer */}
                    {["accepted", "confirmed", "in_progress", "completed"].includes(booking.status) && (
                        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-4">
                            <button
                                onClick={handleMessageCustomer}
                                className="w-full flex items-center justify-center gap-2 py-2.5 border border-primary text-primary rounded-lg text-sm font-bold hover:bg-primary/5 transition-colors"
                            >
                                <MdChat className="text-base" />
                                Message Customer
                            </button>
                        </div>
                    )}

                    {/* Escrow info */}
                    {payment?.status === "escrowed" && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                            <div className="flex items-start gap-2">
                                <MdInfo className="text-blue-600 dark:text-blue-400 text-sm mt-0.5 shrink-0" />
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    Customer payment of {formatCurrency(parseFloat(payment.amount))} is secured. You&apos;ll receive {formatCurrency(earnings)} after session confirmation.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
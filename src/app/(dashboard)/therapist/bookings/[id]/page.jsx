"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    MdArrowBack, MdChat, MdCalendarToday, MdAccessTime, MdLocationOn, MdVideocam, MdPerson,
    MdCheckCircle, MdWarning, MdInfo, MdRefresh, MdSchedule, MdUpdate
} from "react-icons/md";
import { useBookingDetail } from "@/hooks/useBookings";
import { bookingsApi } from "@/lib/bookings.api";
import { showToast } from "@/lib/toast";
import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import BookingTimeline from "@/components/bookings/BookingTimeline";
import SessionList from "@/components/bookings/SessionList";
import PaymentSummaryCard from "@/components/bookings/PaymentSummaryCard";
import SubmitRevisionModal from "@/components/shared/sessions/SubmitRevisionModal";
import MarkSessionMissedModal from "@/components/shared/sessions/MarkSessionMissedModal";
import RevisionStatusBanner from "@/components/shared/sessions/RevisionStatusBanner";
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
    const [showSubmitRevisionModal, setShowSubmitRevisionModal] = useState(false);
    const [revisionSessionId, setRevisionSessionId] = useState(null);
    const [markMissedSession, setMarkMissedSession] = useState(null);

    // Finalize states
    const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);
    const [finalizing, setFinalizing] = useState(false);

    // Reschedule states
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [rescheduleDate, setRescheduleDate] = useState("");
    const [rescheduleTime, setRescheduleTime] = useState("");
    const [rescheduling, setRescheduling] = useState(false);

    // Auto-refresh when waiting for customer confirmation or reschedule response
    useEffect(() => {
        if (booking?.sessions?.[0]?.status === "completed_by_therapist" || booking?.status === "reschedule_requested") {
            const interval = setInterval(() => {
                refetch();
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [booking?.sessions, booking?.status, refetch]);

    const handleMarkComplete = async () => {
        setCompleting(true);
        try {
            await bookingsApi.completeSession(booking.sessions?.[0]?.id);
            setShowCompleteDialog(false);
            showToast.success("Session marked as complete. Waiting for customer confirmation.");
            await refetch();
        } catch (err) {
            const errorCode = err.response?.data?.code;
            if (errorCode === "STRIPE_NOT_CONNECTED") {
                setShowCompleteDialog(false);
                showToast.warning(
                    "You must finish setting up your payout account before marking a session as complete. Go to Account Settings to set up payouts.",
                    { autoClose: 10000 }
                );
            } else {
                showToast.error(err.response?.data?.message || "Failed to mark session as complete.");
            }
        } finally {
            setCompleting(false);
        }
    };

    const handleRequestReschedule = async () => {
        if (!rescheduleDate || !rescheduleTime) return;
        setRescheduling(true);
        try {
            const newDate = new Date(`${rescheduleDate}T${rescheduleTime}`).toISOString();
            await bookingsApi.rescheduleBooking(params.id, newDate);
            setShowRescheduleModal(false);
            setRescheduleDate("");
            setRescheduleTime("");
            showToast.success("Reschedule request sent. Waiting for customer response.");
            await refetch();
        } catch (err) {
            showToast.error(err.response?.data?.message || "Failed to request reschedule.");
        } finally {
            setRescheduling(false);
        }
    };

    const handleMessageCustomer = () => {
        router.push(`/therapist/messages?c=booking:${params.id}`);
    };

    const handleFinalize = async () => {
        setFinalizing(true);
        try {
            await bookingsApi.finalizeBooking(params.id);
            showToast.success("Booking finalized. Confirmed sessions have been paid out and the customer has been refunded for remaining sessions.");
            setShowFinalizeConfirm(false);
            refetch();
        } catch (err) {
            showToast.error(err.response?.data?.message || "Failed to finalize booking");
        } finally {
            setFinalizing(false);
        }
    };

    // ─── Loading ────
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

    // ─── Error / Not found ────
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

    const customer = booking.customer;
    const sessions = booking.sessions || [];
    const session = sessions[0];
    const payment = booking.payment;
    const offer = booking.offer;
    const request = offer?.request;
    const customerInitial = customer?.fullName?.charAt(0) || "?";
    const sessionType = offer?.sessionType;

    const earnings = payment
        ? parseFloat(payment.therapistPayout)
        : null;

    // Finalize button visibility: multi-session booking, at least 1 confirmed,
    // at least 1 unconfirmed, and booking is still active (not already completed/finalized/cancelled)
    const confirmedSessionCount = sessions.filter(s => s.status === "confirmed_by_customer").length;
    const unconfirmedSessionCount = sessions.filter(s => s.status !== "confirmed_by_customer" && s.status !== "cancelled").length;
    const canFinalize =
        ["confirmed", "in_progress"].includes(booking.status) &&
        sessions.length > 1 &&
        confirmedSessionCount > 0 &&
        unconfirmedSessionCount > 0;

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
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
                            {["accepted", "confirmed", "in_progress", "completed", "reschedule_requested"].includes(booking.status) && (
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

                    {/* Multi-session treatment plan */}
                    {sessions.length > 1 && (
                        <SessionList
                            sessions={sessions}
                            role="therapist"
                            onMarkComplete={async (sessionId) => {
                                try {
                                    await bookingsApi.completeSession(sessionId);
                                    showToast.success("Session marked as complete. Waiting for customer confirmation.");
                                    await refetch();
                                } catch (err) {
                                    const errorCode = err.response?.data?.code;
                                    if (errorCode === "STRIPE_NOT_CONNECTED") {
                                        showToast.warning(
                                            "You must finish setting up your payout account before marking a session as complete. Go to Account Settings to set up payouts.",
                                            { autoClose: 10000 }
                                        );
                                    } else {
                                        showToast.error(err.response?.data?.message || "Failed to mark session as complete.");
                                    }
                                }
                            }}
                            onSchedule={async (sessionId, scheduledDate) => {
                                await bookingsApi.scheduleSession(sessionId, scheduledDate);
                                await refetch();
                            }}
                            onSubmitRevision={(sessionId) => {
                                setRevisionSessionId(sessionId);
                                setShowSubmitRevisionModal(true);
                            }}
                            onResubmitSession={async (sessionId) => {
                                try {
                                    await bookingsApi.resubmitSession(sessionId);
                                    showToast.success("Session resubmitted. Customer has been notified and has 72 hours to review.");
                                    await refetch();
                                } catch (err) {
                                    showToast.error(err.response?.data?.message || "Failed to resubmit session.");
                                }
                            }}
                            onMarkMissed={(s) => setMarkMissedSession(s)}
                        />
                    )}

                    {/* ── Action Area ── */}
                    <div className="space-y-4">
                        {/* Reschedule requested — waiting for customer response */}
                        {booking.status === "reschedule_requested" && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <MdUpdate className="text-amber-600 dark:text-amber-400 text-lg mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Reschedule Requested</p>
                                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                                            You proposed: {formatDate(booking.proposedNewDate)} at {formatTime(booking.proposedNewDate)}
                                        </p>
                                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 italic">
                                            Waiting for customer response...
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Reschedule button — visible for eligible statuses */}
                        {["accepted", "confirmed"].includes(booking.status) && !showRescheduleModal && (
                            <button
                                onClick={() => setShowRescheduleModal(true)}
                                className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                            >
                                <MdUpdate className="text-base" />
                                Request Reschedule
                            </button>
                        )}

                        {/* Reschedule modal (inline) */}
                        {showRescheduleModal && (
                            <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5">
                                <h4 className="text-sm font-bold text-text-main dark:text-white mb-1">Request Reschedule</h4>
                                <p className="text-xs text-text-muted dark:text-gray-400 mb-4">
                                    Propose a new date and time. The customer will be notified and can accept or decline.
                                </p>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div>
                                        <label className="text-xs font-bold text-text-muted dark:text-gray-400 block mb-1">Date</label>
                                        <input
                                            type="date"
                                            value={rescheduleDate}
                                            onChange={(e) => setRescheduleDate(e.target.value)}
                                            min={new Date().toISOString().split("T")[0]}
                                            className="w-full text-sm rounded-lg bg-white dark:bg-slate-800 border border-border-light dark:border-border-dark p-2 focus:ring-primary focus:outline-none text-text-main dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-text-muted dark:text-gray-400 block mb-1">Time</label>
                                        <input
                                            type="time"
                                            value={rescheduleTime}
                                            onChange={(e) => setRescheduleTime(e.target.value)}
                                            className="w-full text-sm rounded-lg bg-white dark:bg-slate-800 border border-border-light dark:border-border-dark p-2 focus:ring-primary focus:outline-none text-text-main dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleRequestReschedule}
                                        disabled={rescheduling || !rescheduleDate || !rescheduleTime}
                                        className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-50 transition-colors"
                                    >
                                        {rescheduling ? "Sending..." : "Send Request"}
                                    </button>
                                    <button
                                        onClick={() => { setShowRescheduleModal(false); setRescheduleDate(""); setRescheduleTime(""); }}
                                        className="text-sm text-slate-500 dark:text-slate-400 font-bold hover:text-text-main dark:hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

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

                        {/* Session in revision — therapist needs to respond */}
                        {session?.status === "in_revision" && (
                            <div className="space-y-3">
                                <RevisionStatusBanner
                                    revisionRequestedAt={session.revisionRequestedAt}
                                    revisionReason={session.revisionReason}
                                    revisionDueBy={session.revisionDueBy}
                                    revisionCount={session.revisionCount}
                                    conversationHref={`/therapist/messages?c=booking:${params.id}`}
                                    viewerRole="therapist"
                                />
                                <div className="flex justify-end gap-2">
                                    {!session.revisionDueBy && (
                                        <button
                                            onClick={() => { setRevisionSessionId(session?.id); setShowSubmitRevisionModal(true); }}
                                            className="bg-primary hover:brightness-95 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors"
                                        >
                                            Set Response Date
                                        </button>
                                    )}
                                    {session.revisionDueBy && (
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await bookingsApi.resubmitSession(session.id);
                                                    showToast.success("Session resubmitted. Customer has been notified and has 72 hours to review.");
                                                    await refetch();
                                                } catch (err) {
                                                    showToast.error(err.response?.data?.message || "Failed to resubmit session.");
                                                }
                                            }}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors"
                                        >
                                            Resubmit Session
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Completed by therapist — waiting for customer */}
                        {session?.status === "completed_by_therapist" && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <MdWarning className="text-amber-600 dark:text-amber-400 text-lg mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                                            {session.revisionCount > 0 ? "Resubmitted — Waiting for Customer" : "Waiting for Customer Confirmation"}
                                        </p>
                                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                                            {session.revisionCount > 0
                                                ? "You've resubmitted the session. The customer has 72 hours to confirm or request another revision."
                                                : "Customer needs to confirm session completion. Payment auto-releases after 72 hours."}
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

                        {/* Payment released — success (not shown for finalized — the Series Finalized banner handles it) */}
                        {payment?.status === "released" && booking.status !== "finalized" && (
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <MdCheckCircle className="text-emerald-600 dark:text-emerald-400 text-lg mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Payment Released</p>
                                        <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                                            {formatCurrency(parseFloat(payment.releasedAmount ?? payment.therapistPayout))} has been transferred to your payout account.
                                        </p>
                                        {payment.platformFee && (
                                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                                                Session rate: {formatCurrency(parseFloat(payment.amount))} — Platform fee: {formatCurrency(parseFloat(payment.platformFee))} — Your earnings: {formatCurrency(parseFloat(payment.releasedAmount ?? payment.therapistPayout))}
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
                    />

                    {/* Message Customer */}
                    {["accepted", "confirmed", "in_progress", "completed", "finalized"].includes(booking.status) && (
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

                    {/* Finalize Completed Visits */}
                    {canFinalize && (
                        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-4 space-y-3">
                            {!showFinalizeConfirm ? (
                                <button
                                    onClick={() => setShowFinalizeConfirm(true)}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-bold transition-colors"
                                >
                                    <MdCheckCircle className="text-base" />
                                    Finalize Completed Visits
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                                        <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">Are you sure?</p>
                                        <p className="text-xs text-amber-700 dark:text-amber-400">
                                            This will release payment for {confirmedSessionCount} confirmed session{confirmedSessionCount !== 1 ? "s" : ""} and
                                            refund the customer for {unconfirmedSessionCount} undelivered session{unconfirmedSessionCount !== 1 ? "s" : ""}.
                                            This cannot be undone.
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowFinalizeConfirm(false)}
                                            disabled={finalizing}
                                            className="flex-1 py-2 border border-border-light dark:border-border-dark text-text-main dark:text-white rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleFinalize}
                                            disabled={finalizing}
                                            className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-60"
                                        >
                                            {finalizing ? "Finalizing..." : "Confirm Finalize"}
                                        </button>
                                    </div>
                                </div>
                            )}
                            <p className="text-[10px] text-text-muted dark:text-gray-500 text-center">
                                End this series early and collect payment for completed visits.
                            </p>
                        </div>
                    )}

                    {/* Finalized info banner */}
                    {booking.status === "finalized" && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 border border-border-light dark:border-border-dark rounded-xl p-4">
                            <div className="flex items-start gap-2">
                                <MdInfo className="text-slate-500 text-sm mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-text-main dark:text-white">Series Finalized</p>
                                    <p className="text-xs text-text-muted dark:text-gray-400 mt-0.5">
                                        {confirmedSessionCount} session{confirmedSessionCount !== 1 ? "s" : ""} paid out.
                                        {payment?.refundedAmount && ` Customer refunded ${formatCurrency(parseFloat(payment.refundedAmount))} for undelivered sessions.`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Escrow / partial release info */}
                    {payment?.status === "escrowed" && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                            <div className="flex items-start gap-2">
                                <MdInfo className="text-blue-600 dark:text-blue-400 text-sm mt-0.5 shrink-0" />
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    Customer payment of {formatCurrency(parseFloat(payment.amount))} is secured. You&apos;ll receive payouts as each session is confirmed.
                                </p>
                            </div>
                        </div>
                    )}
                    {payment?.status === "partially_released" && (() => {
                        const totalSessionCount = sessions.length;
                        const missedOrCancelled = sessions.filter(s => s.status === "missed" || s.status === "cancelled").length;
                        const deliverable = Math.max(0, totalSessionCount - missedOrCancelled);
                        const fullPayout = parseFloat(payment.therapistPayout);
                        // Adjusted max payout = per-session payout × deliverable sessions
                        const adjustedMaxPayout = totalSessionCount > 0
                            ? parseFloat(((fullPayout / totalSessionCount) * deliverable).toFixed(2))
                            : fullPayout;
                        const released = parseFloat(payment.releasedAmount ?? 0);
                        return (
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                                <div className="flex items-start gap-2">
                                    <MdCheckCircle className="text-emerald-600 dark:text-emerald-400 text-sm mt-0.5 shrink-0" />
                                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                                        {formatCurrency(released)} of {formatCurrency(adjustedMaxPayout)} released ({confirmedSessionCount} of {deliverable} deliverable session{deliverable !== 1 ? "s" : ""} confirmed{missedOrCancelled > 0 ? `, ${missedOrCancelled} ${sessions.some(s => s.status === "missed") ? "missed" : "cancelled"}` : ""}).
                                    </p>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Submit Revision modal — mounted at root */}
            <SubmitRevisionModal
                isOpen={showSubmitRevisionModal}
                onClose={() => { setShowSubmitRevisionModal(false); setRevisionSessionId(null); }}
                sessionId={revisionSessionId || session?.id}
                revisionReason={revisionSessionId ? sessions.find(s => s.id === revisionSessionId)?.revisionReason : session?.revisionReason}
                onSuccess={refetch}
            />

            {/* Mark Missed modal (therapist self-report) */}
            <MarkSessionMissedModal
                isOpen={!!markMissedSession}
                onClose={() => setMarkMissedSession(null)}
                sessionId={markMissedSession?.id}
                sessionNumber={markMissedSession?.sessionNumber}
                actorRole="therapist"
                refundAmount={booking?.rate}
                onSuccess={refetch}
            />
        </div>
    );
}
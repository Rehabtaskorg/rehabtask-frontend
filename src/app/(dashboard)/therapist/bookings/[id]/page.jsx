"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    MdArrowBack, MdChat, MdCalendarToday, MdAccessTime, MdLocationOn, MdVideocam, MdPerson,
    MdCheckCircle, MdWarning, MdInfo, MdRefresh, MdSchedule, MdUpdate, MdEdit
} from "react-icons/md";
import { useBookingDetail } from "@/hooks/useBookings";
import { bookingsApi } from "@/lib/bookings.api";
import { BOOKING_STATUS, USER_ROLES } from "@/lib/constants";
import { localDateStr } from "@/utils/dates";
import { showToast } from "@/lib/toast";
import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import BookingTimeline from "@/components/bookings/BookingTimeline";
import SessionList from "@/components/bookings/SessionList";
import PaymentSummaryCard from "@/components/bookings/PaymentSummaryCard";
import ConfirmModal from "@/components/ui/ConfirmModal";
import MarkSessionMissedModal from "@/components/shared/sessions/MarkSessionMissedModal";
import MarkSessionAttemptedModal from "@/components/shared/sessions/MarkSessionAttemptedModal";
import RevisionStatusBanner from "@/components/shared/sessions/RevisionStatusBanner";
import { formatCurrency } from "@/utils/messages";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAnalytics } from "@/hooks/useAnalytics";
import BookingSharedFiles from "@/components/bookings/BookingSharedFiles";
import PatientInfoBlock from "@/components/shared/patient/PatientInfoBlock";

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
    const { trackEvent } = useAnalytics();
    const { booking, loading, error, refetch } = useBookingDetail(params.id);

    // UI states
    const [completing, setCompleting] = useState(false);
    const [showCompleteDialog, setShowCompleteDialog] = useState(false);
    const [markMissedSession, setMarkMissedSession] = useState(null);
    const [markAttemptedSession, setMarkAttemptedSession] = useState(null);
    const [cancelSessionTarget, setCancelSessionTarget] = useState(null);
    const [cancelSessionReason, setCancelSessionReason] = useState("");
    const [cancellingSession, setCancellingSession] = useState(false);
    const [rejectSessionTarget, setRejectSessionTarget] = useState(null);
    const [rejectSessionReason, setRejectSessionReason] = useState("");
    const [rejectingSession, setRejectingSession] = useState(false);

    // Finalize states
    const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);
    const [finalizing, setFinalizing] = useState(false);

    // Reschedule states
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [rescheduleDate, setRescheduleDate] = useState("");
    const [rescheduleTime, setRescheduleTime] = useState("");
    const [rescheduling, setRescheduling] = useState(false);

    // Revision extend states
    const [showExtendConfirm, setShowExtendConfirm] = useState(false);
    const [extendSessionId, setExtendSessionId] = useState(null);
    const [extending, setExtending] = useState(false);

    // Resubmit confirmation state
    const [showResubmitConfirm, setShowResubmitConfirm] = useState(false);
    const [resubmitting, setResubmitting] = useState(false);

    // Cancellation approval state
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [cancellationActing, setCancellationActing] = useState(false);

    // Cancellation request state (therapist-initiated)
    const [showRequestCancelForm, setShowRequestCancelForm] = useState(false);
    const [requestCancelReason, setRequestCancelReason] = useState("");
    const [requestingCancellation, setRequestingCancellation] = useState(false);

    // Auto-refresh when waiting for customer confirmation or reschedule response
    useEffect(() => {
        if (booking?.sessions?.[0]?.status === "completed_by_therapist" || booking?.status === "reschedule_requested") {
            const interval = setInterval(() => {
                refetch();
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [booking?.sessions, booking?.status, refetch]);

    const handleApproveCancellation = async () => {
        setCancellationActing(true);
        try {
            await bookingsApi.approveCancellation(params.id);
            showToast.success("Cancellation approved. The customer will receive a full refund.");
            await refetch();
        } catch (err) {
            showToast.error(err.response?.data?.message || "Failed to approve cancellation.");
        } finally {
            setCancellationActing(false);
        }
    };

    const handleRejectCancellation = async () => {
        if (!rejectionReason.trim()) return;
        setCancellationActing(true);
        try {
            await bookingsApi.rejectCancellation(params.id, rejectionReason);
            showToast.success("Cancellation request rejected. The booking remains active.");
            setShowRejectForm(false);
            setRejectionReason("");
            await refetch();
        } catch (err) {
            showToast.error(err.response?.data?.message || "Failed to reject cancellation.");
        } finally {
            setCancellationActing(false);
        }
    };

    const handleRequestCancellation = async () => {
        if (!requestCancelReason.trim()) return;
        setRequestingCancellation(true);
        try {
            await bookingsApi.requestCancellation(params.id, requestCancelReason);
            showToast.success("Cancellation request sent. The customer has 24 hours to approve or reject.");
            setShowRequestCancelForm(false);
            setRequestCancelReason("");
            await refetch();
        } catch (err) {
            showToast.error(err.response?.data?.message || "Failed to submit cancellation request.");
        } finally {
            setRequestingCancellation(false);
        }
    };

    const handleCancelSession = async () => {
        if (!cancelSessionReason.trim()) return;
        setCancellingSession(true);
        try {
            await bookingsApi.requestSessionCancellation(cancelSessionTarget.id, cancelSessionReason);
            showToast.success("Cancellation request sent. The customer has 24 hours to approve or reject.");
            setCancelSessionTarget(null);
            setCancelSessionReason("");
            await refetch();
        } catch (err) {
            showToast.error(err.response?.data?.message || "Failed to submit cancellation request.");
        } finally {
            setCancellingSession(false);
        }
    };

    const handleApproveSessionCancellation = async (session) => {
        try {
            await bookingsApi.approveSessionCancellation(session.id);
            showToast.success("Session cancellation approved. The customer will receive a refund.");
            await refetch();
        } catch (err) {
            showToast.error(err.response?.data?.message || "Failed to approve cancellation.");
        }
    };

    const handleRejectSessionCancellation = async () => {
        if (!rejectSessionReason.trim()) return;
        setRejectingSession(true);
        try {
            await bookingsApi.rejectSessionCancellation(rejectSessionTarget.id, rejectSessionReason);
            showToast.success("Cancellation request rejected. The session remains active.");
            setRejectSessionTarget(null);
            setRejectSessionReason("");
            await refetch();
        } catch (err) {
            showToast.error(err.response?.data?.message || "Failed to reject cancellation.");
        } finally {
            setRejectingSession(false);
        }
    };

    const handleMarkComplete = async () => {
        setCompleting(true);
        try {
            await bookingsApi.completeSession(booking.sessions?.[0]?.id);
            trackEvent("session_completed_by_therapist", { session_type: booking.sessionType });
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

    const handleExtendRevision = async () => {
        const sessionId = extendSessionId || session?.id;
        if (!sessionId) return;
        setExtending(true);
        try {
            await bookingsApi.extendRevision(sessionId);
            showToast.success("Revision deadline extended by 3 days.");
            setShowExtendConfirm(false);
            setExtendSessionId(null);
            await refetch();
        } catch (err) {
            showToast.error(err.response?.data?.message || "Failed to extend deadline.");
        } finally {
            setExtending(false);
        }
    };

    const handleResubmitSession = async () => {
        setResubmitting(true);
        try {
            await bookingsApi.resubmitSession(session.id);
            showToast.success("Session resubmitted. Customer has been notified and has 72 hours to review.");
            setShowResubmitConfirm(false);
            await refetch();
        } catch (err) {
            showToast.error(err.response?.data?.message || "Failed to resubmit session.");
        } finally {
            setResubmitting(false);
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
                    <div className="h-8 w-32 bg-slate-200  rounded" />
                    <div className="h-6 w-64 bg-slate-200  rounded" />
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-8 space-y-4">
                            <div className="h-40 bg-card-light  border border-border-light  rounded-xl" />
                            <div className="h-60 bg-card-light  border border-border-light  rounded-xl" />
                        </div>
                        <div className="lg:col-span-4 space-y-4">
                            <div className="h-48 bg-card-light  border border-border-light  rounded-xl" />
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
                <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-text-muted  hover:text-primary transition-colors mb-6">
                    <MdArrowBack className="text-base" /> Back
                </button>
                <div className="bg-red-50  border border-red-200  rounded-xl p-6 text-center">
                    <p className="text-red-700  font-semibold">Booking not found</p>
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
    const attemptedSessionCount = sessions.filter(s => s.status === "attempted").length;
    // "Paid out" = confirmed (full payout) + attempted (partial payout). Both have
    // a SessionPayout row and a Stripe transfer — the therapist received money.
    const paidOutSessionCount = confirmedSessionCount + attemptedSessionCount;
    const unconfirmedSessionCount = sessions.filter(s =>
        s.status !== "confirmed_by_customer" && s.status !== "cancelled" && s.status !== "attempted"
    ).length;
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
                className="flex items-center gap-1 text-sm text-text-muted  hover:text-primary transition-colors mb-6"
            >
                <MdArrowBack className="text-base" /> Back to Bookings
            </button>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-text-main ">
                        Booking Details
                    </h1>
                    <p className="text-xs text-text-muted  mt-0.5 font-mono">
                        ID: {booking.id.slice(0, 8)}...
                    </p>
                </div>
                <BookingStatusBadge status={booking.status} size="md" />
            </div>

            {/* Cancellation request banner — customer requested, therapist must approve or reject */}
            {booking.status === BOOKING_STATUS.CANCELLATION_REQUESTED &&
                booking.cancellationRequestedBy === USER_ROLES.CUSTOMER && (
                <div className="mb-6 bg-yellow-50 border border-yellow-300 rounded-xl p-5">
                    <div className="flex items-start gap-3 mb-4">
                        <MdWarning className="text-yellow-600 text-xl mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-yellow-900">Cancellation Requested</p>
                            <p className="text-xs text-yellow-700 mt-0.5">
                                {booking.customer?.fullName} has requested to cancel this booking.
                                {booking.cancellationReason && <> Reason: &ldquo;{booking.cancellationReason}&rdquo;</>}
                            </p>
                            <p className="text-xs text-yellow-600 mt-1 font-semibold">
                                You have until{" "}
                                {booking.cancellationRequestedAt
                                    ? new Date(new Date(booking.cancellationRequestedAt).getTime() + 24 * 60 * 60 * 1000).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
                                    : "24 hours from the request"}{" "}
                                to respond. If you take no action, the cancellation will be approved automatically.
                            </p>
                        </div>
                    </div>

                    {!showRejectForm ? (
                        <div className="flex gap-3 ml-8">
                            <button
                                onClick={handleApproveCancellation}
                                disabled={cancellationActing}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg disabled:opacity-50 transition-colors"
                            >
                                {cancellationActing ? "Processing..." : "Approve Cancellation"}
                            </button>
                            <button
                                onClick={() => setShowRejectForm(true)}
                                disabled={cancellationActing}
                                className="px-4 py-2 border border-yellow-400 text-yellow-800 hover:bg-yellow-100 text-sm font-bold rounded-lg disabled:opacity-50 transition-colors"
                            >
                                Reject
                            </button>
                        </div>
                    ) : (
                        <div className="ml-8 space-y-2">
                            <textarea
                                rows={2}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Provide a reason for rejecting this cancellation request..."
                                className="w-full text-sm rounded-lg border border-yellow-300 bg-white p-2 focus:ring-yellow-400 focus:outline-none resize-none text-text-main"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleRejectCancellation}
                                    disabled={!rejectionReason.trim() || cancellationActing}
                                    className="px-4 py-2 bg-yellow-700 hover:bg-yellow-800 text-white text-sm font-bold rounded-lg disabled:opacity-50 transition-colors"
                                >
                                    {cancellationActing ? "Submitting..." : "Confirm Rejection"}
                                </button>
                                <button
                                    onClick={() => { setShowRejectForm(false); setRejectionReason(""); }}
                                    className="px-4 py-2 text-sm text-text-muted font-bold hover:text-text-main transition-colors"
                                >
                                    Back
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Cancellation pending — your own request, waiting on customer */}
            {booking.status === BOOKING_STATUS.CANCELLATION_REQUESTED &&
                booking.cancellationRequestedBy === USER_ROLES.THERAPIST && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                        <MdSchedule className="text-yellow-600 text-lg mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-yellow-900">Cancellation Pending</p>
                            <p className="text-xs text-yellow-700 mt-0.5">
                                Your request has been sent to {booking.customer?.fullName}. They have 24 hours to respond. If they don&apos;t, your request will be automatically declined and the booking will remain active.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Two-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* ── Left Column ── */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Customer Card */}
                    <div className="bg-card-light  border border-border-light  rounded-xl p-5">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                                {customerInitial}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-text-main ">
                                    {customer?.fullName || "Customer"}
                                </h3>
                                {customer?.phone && (
                                    <p className="text-sm text-text-muted  mt-0.5">
                                        {customer.phone}
                                    </p>
                                )}
                                {customer?.location && (
                                    <p className="text-xs text-text-muted  mt-0.5 flex items-center gap-1">
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

                    {booking.patient && (
                        <PatientInfoBlock
                            patient={booking.patient}
                            note="This patient information is shared because this booking is confirmed."
                        />
                    )}

                    {/* Session Details */}
                    <div className="bg-card-light  border border-border-light  rounded-xl p-5">
                        <h3 className="text-sm font-bold text-text-main  mb-4">Session Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <MdSchedule className="text-primary text-lg mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-text-muted ">Service</p>
                                    <p className="text-sm font-medium text-text-main ">{request?.serviceType || "—"}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MdCalendarToday className="text-primary text-lg mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-text-muted ">Date</p>
                                    <p className="text-sm font-medium text-text-main ">{formatDate(session?.scheduledDate || booking.scheduledDate)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MdAccessTime className="text-primary text-lg mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-text-muted ">Time</p>
                                    <p className="text-sm font-medium text-text-main ">{formatTime(session?.scheduledDate || booking.scheduledDate)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                {sessionType === "virtual" ? (
                                    <MdVideocam className="text-primary text-lg mt-0.5 shrink-0" />
                                ) : (
                                    <MdLocationOn className="text-primary text-lg mt-0.5 shrink-0" />
                                )}
                                <div>
                                    <p className="text-xs text-text-muted ">
                                        {sessionType === "virtual" ? "Session Type" : "Location"}
                                    </p>
                                    <p className="text-sm font-medium text-text-main ">
                                        {sessionType === "virtual" ? "Virtual Session" : request?.location || "—"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {sessionType && (
                            <div className="mt-4 pt-4 border-t border-border-light ">
                                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${sessionType === "virtual"
                                    ? "bg-blue-100  text-blue-700 "
                                    : "bg-emerald-100  text-emerald-700 "
                                    }`}>
                                    {sessionType === "virtual" ? <MdVideocam className="text-sm" /> : <MdPerson className="text-sm" />}
                                    {sessionType === "virtual" ? "Virtual" : "In-Person"}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Customer's Request Description */}
                    {request?.description && (
                        <div className="bg-card-light  border border-border-light  rounded-xl p-5">
                            <h3 className="text-sm font-bold text-text-main  mb-2">Customer&apos;s Request</h3>
                            <p className="text-sm text-text-muted  leading-relaxed">
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
                            booking={booking}
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
                            onUpdateTitle={async (sessionId, title) => {
                                try {
                                    await bookingsApi.updateSessionTitle(sessionId, title);
                                    await refetch();
                                } catch (err) {
                                    showToast.error(err.response?.data?.message || "Failed to update visit title.");
                                }
                            }}
                            onExtendRevision={(sessionId) => {
                                setExtendSessionId(sessionId);
                                setShowExtendConfirm(true);
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
                            onMarkAttempted={(s) => setMarkAttemptedSession(s)}
                            onCancelSession={(s) => setCancelSessionTarget(s)}
                            onApproveSessionCancellation={handleApproveSessionCancellation}
                            onRejectSessionCancellation={(s) => setRejectSessionTarget(s)}
                        />
                    )}

                    {/* ── Action Area ── */}
                    <div className="space-y-4">
                        {/* Reschedule requested — waiting for customer response */}
                        {booking.status === "reschedule_requested" && (
                            <div className="bg-amber-50  border border-amber-200  rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <MdUpdate className="text-amber-600  text-lg mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-amber-900 ">Reschedule Requested</p>
                                        <p className="text-xs text-amber-700  mt-0.5">
                                            You proposed: {formatDate(booking.proposedNewDate)} at {formatTime(booking.proposedNewDate)}
                                        </p>
                                        <p className="text-xs text-amber-600  mt-1 italic">
                                            Waiting for customer response...
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Edit date button — single-session only */}
                        {sessions.length <= 1 && ["accepted", "confirmed"].includes(booking.status) && !showRescheduleModal && (
                            <button
                                onClick={() => setShowRescheduleModal(true)}
                                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                            >
                                <MdEdit className="text-base" /> Edit
                            </button>
                        )}

                        {/* Reschedule modal (inline) */}
                        {showRescheduleModal && (
                            <div className="bg-card-light  border border-border-light  rounded-xl p-5">
                                <h4 className="text-sm font-bold text-text-main  mb-1">Request Reschedule</h4>
                                <p className="text-xs text-text-muted  mb-4">
                                    Propose a new date and time. The customer will be notified and can accept or decline.
                                </p>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div>
                                        <label className="text-xs font-bold text-text-muted  block mb-1">Date</label>
                                        <input
                                            type="date"
                                            value={rescheduleDate}
                                            onChange={(e) => setRescheduleDate(e.target.value)}
                                            min={localDateStr()}
                                            className="w-full text-sm rounded-lg bg-white  border border-border-light  p-2 focus:ring-primary focus:outline-none text-text-main "
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-text-muted  block mb-1">Time</label>
                                        <input
                                            type="time"
                                            value={rescheduleTime}
                                            onChange={(e) => setRescheduleTime(e.target.value)}
                                            className="w-full text-sm rounded-lg bg-white  border border-border-light  p-2 focus:ring-primary focus:outline-none text-text-main "
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
                                        className="text-sm text-slate-500  font-bold hover:text-text-main  transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Pending/Accepted — waiting for customer payment */}
                        {["pending", "accepted"].includes(booking.status) && (
                            <div className="bg-amber-50  border border-amber-200  rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <MdInfo className="text-amber-600  text-lg mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-amber-900 ">Waiting for Customer Payment</p>
                                        <p className="text-xs text-amber-700  mt-0.5">
                                            The customer needs to complete payment before this session is confirmed.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Confirmed + scheduled — mark complete (single-session only; multi-session has per-session buttons in SessionList) */}
                        {sessions.length <= 1 && booking.status === "confirmed" && session?.status === "scheduled" && !showCompleteDialog && (
                            <div className="bg-blue-50  border border-blue-200  rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <MdInfo className="text-blue-600  text-lg mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-blue-900 ">Session Confirmed</p>
                                        <p className="text-xs text-blue-700  mt-0.5">
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

                        {/* Single-session: Mark Missed + Mark Attempted (only when past scheduled date) */}
                        {booking.status === "confirmed" && session?.status === "scheduled" && sessions.length <= 1 && !showCompleteDialog && (
                            (() => {
                                const scheduledInPast = session.scheduledDate && new Date(session.scheduledDate) <= new Date();
                                const hasAttemptedRate = booking.attemptedVisitRate != null && parseFloat(booking.attemptedVisitRate) > 0;
                                if (!scheduledInPast) return null;
                                return (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setMarkMissedSession(session)}
                                            className="text-sm font-bold text-red-500  border border-red-300  px-4 py-2 rounded-lg hover:bg-red-50  transition-colors"
                                        >
                                            Mark Missed
                                        </button>
                                        {hasAttemptedRate && (
                                            <button
                                                onClick={() => setMarkAttemptedSession(session)}
                                                className="text-sm font-bold text-amber-600  border border-amber-300  px-4 py-2 rounded-lg hover:bg-amber-50  transition-colors"
                                            >
                                                Mark Attempted
                                            </button>
                                        )}
                                    </div>
                                );
                            })()
                        )}

                        {/* Complete dialog (inline) */}
                        {sessions.length <= 1 && showCompleteDialog && (
                            <div className="bg-blue-50  border border-blue-200  rounded-xl p-5">
                                <p className="text-sm font-bold text-blue-900  mb-1">Mark Session as Complete?</p>
                                <p className="text-xs text-blue-700  mb-4">
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
                                        className="text-sm text-slate-500  font-bold hover:text-text-main  transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Session in revision — single-session only; multi-session handles per-session in SessionList */}
                        {sessions.length <= 1 && session?.status === "in_revision" && (
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
                                    <button
                                        onClick={() => { setExtendSessionId(session.id); setShowExtendConfirm(true); }}
                                        className="border border-primary/30 text-primary hover:bg-primary/5 px-5 py-2.5 rounded-lg text-sm font-bold transition-colors"
                                    >
                                        Extend
                                    </button>
                                    {session.revisionDueBy && (
                                        <button
                                            onClick={() => setShowResubmitConfirm(true)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors"
                                        >
                                            Resubmit Session
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Completed by therapist — waiting for customer (single-session only) */}
                        {sessions.length <= 1 && session?.status === "completed_by_therapist" && (
                            <div className="bg-amber-50  border border-amber-200  rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <MdWarning className="text-amber-600  text-lg mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-amber-900 ">
                                            {session.revisionCount > 0 ? "Resubmitted — Waiting for Customer" : "Waiting for Customer Confirmation"}
                                        </p>
                                        <p className="text-xs text-amber-700  mt-0.5">
                                            {session.revisionCount > 0
                                                ? "You've resubmitted the session. The customer has 72 hours to confirm or request another revision."
                                                : "Customer needs to confirm session completion. Payment auto-releases after 72 hours."}
                                        </p>
                                        <p className="text-xs text-amber-600  mt-1 italic">
                                            Auto-checking every few seconds...
                                        </p>
                                    </div>
                                    <button onClick={refetch} className="text-xs font-bold text-amber-700  hover:underline flex items-center gap-1 shrink-0">
                                        <MdRefresh className="text-sm" /> Check Now
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Payment released — success (not shown for finalized — the Series Finalized banner handles it) */}
                        {payment?.status === "released" && booking.status !== "finalized" && (
                            <div className="bg-emerald-50  border border-emerald-200  rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <MdCheckCircle className="text-emerald-600  text-lg mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-emerald-900 ">Payment Released</p>
                                        <p className="text-xs text-emerald-700  mt-0.5">
                                            {formatCurrency(parseFloat(payment.releasedAmount ?? payment.therapistPayout))} has been transferred to your payout account.
                                        </p>
                                        {payment.platformFee && (
                                            <p className="text-xs text-emerald-600  mt-1">
                                                Session rate: {formatCurrency(parseFloat(payment.amount))} — Platform fee: {formatCurrency(parseFloat(payment.platformFee))} — Your earnings: {formatCurrency(parseFloat(payment.releasedAmount ?? payment.therapistPayout))}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Cancelled */}
                        {booking.status === "cancelled" && (
                            <div className="bg-slate-50  border border-border-light  rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <MdInfo className="text-text-muted  text-lg mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-text-main ">Session Cancelled</p>
                                        {session?.cancellationReason && (
                                            <p className="text-xs text-text-muted  mt-0.5">
                                                Reason: {session.cancellationReason}
                                            </p>
                                        )}
                                        {payment?.status === "refunded" && (
                                            <p className="text-xs text-text-muted  mt-0.5">
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

                    {/* Shared Files */}
                    <BookingSharedFiles bookingId={booking.id} canUpload={true} />

                    {/* Message Customer */}
                    {["accepted", "confirmed", "in_progress", "completed", "finalized"].includes(booking.status) && (
                        <div className="bg-card-light  border border-border-light  rounded-xl p-4">
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
                        <div className="bg-card-light  border border-border-light  rounded-xl p-4 space-y-3">
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
                                    <div className="bg-amber-50  border border-amber-200  rounded-lg p-3">
                                        <p className="text-xs font-bold text-amber-800  mb-1">Are you sure?</p>
                                        <p className="text-xs text-amber-700 ">
                                            This will release payment for {confirmedSessionCount} confirmed session{confirmedSessionCount !== 1 ? "s" : ""} and
                                            refund the customer for {unconfirmedSessionCount} undelivered session{unconfirmedSessionCount !== 1 ? "s" : ""}.
                                            This cannot be undone.
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowFinalizeConfirm(false)}
                                            disabled={finalizing}
                                            className="flex-1 py-2 border border-border-light  text-text-main  rounded-lg text-sm font-medium hover:bg-slate-50  transition-colors"
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
                            <p className="text-[10px] text-text-muted  text-center">
                                End this series early and collect payment for completed visits.
                            </p>
                        </div>
                    )}

                    {/* Finalized info banner */}
                    {booking.status === "finalized" && (
                        <div className="bg-slate-50  border border-border-light  rounded-xl p-4">
                            <div className="flex items-start gap-2">
                                <MdInfo className="text-slate-500 text-sm mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-text-main ">Series Finalized</p>
                                    <p className="text-xs text-text-muted  mt-0.5">
                                        {paidOutSessionCount} session{paidOutSessionCount !== 1 ? "s" : ""} paid out
                                        {attemptedSessionCount > 0 && ` (${attemptedSessionCount} attempted visit${attemptedSessionCount !== 1 ? "s" : ""})`}.
                                        {payment?.refundedAmount && ` Customer refunded ${formatCurrency(parseFloat(payment.refundedAmount))}.`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Escrow / partial release info */}
                    {payment?.status === "escrowed" && booking.status !== "finalized" && booking.status !== "cancelled" && (
                        <div className="bg-blue-50  border border-blue-200  rounded-xl p-4">
                            <div className="flex items-start gap-2">
                                <MdInfo className="text-blue-600  text-sm mt-0.5 shrink-0" />
                                <p className="text-xs text-blue-700 ">
                                    Customer payment of {formatCurrency(parseFloat(payment.amount))} is secured. You&apos;ll receive payouts as each session is confirmed.
                                </p>
                            </div>
                        </div>
                    )}
                    {payment?.status === "partially_released" && (() => {
                        const totalSessionCount = sessions.length;
                        const missedOrCancelled = sessions.filter(s => s.status === "missed" || s.status === "cancelled").length;
                        const attempted = sessions.filter(s => s.status === "attempted").length;
                        const attemptedRevenue = sessions
                            .filter(s => s.status === "attempted")
                            .reduce((sum, s) => sum + (s.attemptedRateCharged != null ? parseFloat(s.attemptedRateCharged) : 0), 0);
                        const deliverable = Math.max(0, totalSessionCount - missedOrCancelled);
                        const perSessionValue = totalSessionCount > 0 ? parseFloat(payment.amount) / totalSessionCount : 0;
                        const feeRatio = parseFloat(payment.amount) > 0 ? parseFloat(payment.platformFee) / parseFloat(payment.amount) : 0;
                        // Discount from missed/cancelled (full loss) + attempted (partial loss)
                        const lossFromMissedCancelled = missedOrCancelled * perSessionValue;
                        const lossFromAttempted = Math.max(0, attempted * perSessionValue - attemptedRevenue);
                        const totalDiscount = lossFromMissedCancelled + lossFromAttempted;
                        const adjustedTotal = parseFloat(payment.amount) - totalDiscount;
                        const adjustedMaxPayout = parseFloat((adjustedTotal - adjustedTotal * feeRatio).toFixed(2));
                        const released = parseFloat(payment.releasedAmount ?? 0);
                        // Build a readable summary of what happened
                        const parts = [];
                        if (confirmedSessionCount > 0) parts.push(`${confirmedSessionCount} confirmed`);
                        if (attempted > 0) parts.push(`${attempted} attempted`);
                        const progressLabel = parts.length > 0 ? parts.join(" + ") : "0";
                        const reducedParts = [];
                        if (missedOrCancelled > 0) reducedParts.push(`${missedOrCancelled} ${sessions.some(s => s.status === "missed") ? "missed" : "cancelled"}`);
                        if (attempted > 0 && !parts.includes(`${attempted} attempted`)) reducedParts.push(`${attempted} attempted`);
                        return (
                            <div className="bg-emerald-50  border border-emerald-200  rounded-xl p-4">
                                <div className="flex items-start gap-2">
                                    <MdCheckCircle className="text-emerald-600  text-sm mt-0.5 shrink-0" />
                                    <p className="text-xs text-emerald-700 ">
                                        {formatCurrency(released)} of {formatCurrency(adjustedMaxPayout)} released ({progressLabel} of {deliverable} deliverable session{deliverable !== 1 ? "s" : ""}{reducedParts.length > 0 ? `, ${reducedParts.join(" · ")}` : ""}).
                                    </p>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Request Cancellation button — escrowed (refundable) or intent_created (no money moved yet), no cancellation already in flight */}
                    {["escrowed", "intent_created"].includes(payment?.status) &&
                        booking.status !== BOOKING_STATUS.CANCELLATION_REQUESTED &&
                        booking.status !== BOOKING_STATUS.CANCELLED &&
                        !showRequestCancelForm && (
                        <div className="bg-card-light border border-border-light rounded-xl p-5">
                            <div className="flex items-start gap-3">
                                <MdInfo className="text-primary text-lg mt-0.5 shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-text-main">Cancel This Booking</p>
                                    <p className="text-xs text-text-muted mt-0.5">
                                        If you can no longer fulfil this booking, you can request to cancel it.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowRequestCancelForm(true)}
                                className="mt-3 ml-8 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                            >
                                Request Cancellation
                            </button>
                        </div>
                    )}

                    {/* Cancellation request form */}
                    {showRequestCancelForm && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                            <p className="text-sm font-bold text-red-900 mb-1">Request Cancellation</p>
                            <p className="text-xs text-red-700 mb-3">
                                {payment?.status === "escrowed"
                                    ? <>Your request will be sent to {booking.customer?.fullName}. They have 24 hours to approve or reject it. If they don&apos;t respond, your request will be automatically declined and the booking will remain active.</>
                                    : <>This booking will be cancelled immediately. No payment has been made, so no refund is needed.</>
                                }
                            </p>
                            <textarea
                                rows={2}
                                value={requestCancelReason}
                                onChange={(e) => setRequestCancelReason(e.target.value)}
                                placeholder="Please provide a reason for cancelling..."
                                className="w-full text-sm rounded-lg bg-white border border-red-200 p-2 focus:ring-red-400 focus:outline-none resize-none text-text-main mb-3"
                            />
                            <div className="flex items-center gap-2 justify-end">
                                <button
                                    onClick={() => { setShowRequestCancelForm(false); setRequestCancelReason(""); }}
                                    className="text-sm text-slate-500 font-bold hover:text-text-main transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleRequestCancellation}
                                    disabled={!requestCancelReason.trim() || requestingCancellation}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 transition-colors"
                                >
                                    {requestingCancellation ? "Submitting..." : "Submit Request"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Extend revision deadline confirmation */}
            <ConfirmModal
                isOpen={showExtendConfirm}
                onClose={() => { if (!extending) { setShowExtendConfirm(false); setExtendSessionId(null); } }}
                onConfirm={handleExtendRevision}
                title="Extend Revision Deadline"
                message="This will add 3 days to the current revision deadline. The customer will be notified of the new date. You can extend as many times as needed."
                confirmLabel="Extend by 3 Days"
                confirmClassName="bg-primary hover:bg-primary/90 text-white"
                loading={extending}
            />

            {/* Resubmit session confirmation */}
            <ConfirmModal
                isOpen={showResubmitConfirm}
                onClose={() => { if (!resubmitting) setShowResubmitConfirm(false); }}
                onConfirm={handleResubmitSession}
                title="Resubmit Session"
                message="This will notify the customer that the session is ready for review. They will have 72 hours to confirm or request another revision."
                confirmLabel="Resubmit"
                confirmClassName="bg-emerald-600 hover:bg-emerald-700 text-white"
                loading={resubmitting}
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

            {/* Mark Attempted modal (therapist only — patient not home) */}
            <MarkSessionAttemptedModal
                isOpen={!!markAttemptedSession}
                onClose={() => setMarkAttemptedSession(null)}
                sessionId={markAttemptedSession?.id}
                sessionNumber={markAttemptedSession?.sessionNumber}
                attemptedRate={booking?.attemptedVisitRate}
                sessionRate={booking?.rate}
                onSuccess={refetch}
            />

            {/* Request session cancellation modal */}
            {cancelSessionTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-card-light rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
                        <h3 className="text-sm font-bold text-text-main">Request Cancellation — Visit {cancelSessionTarget.sessionNumber}</h3>
                        <p className="text-xs text-text-muted">Your request will be sent to the customer. They have 24 hours to approve or reject. If they don&apos;t respond, the cancellation will be approved automatically.</p>
                        <textarea
                            rows={3}
                            value={cancelSessionReason}
                            onChange={(e) => setCancelSessionReason(e.target.value)}
                            placeholder="Reason for requesting cancellation…"
                            className="w-full text-sm rounded-lg border border-border-light bg-background-light p-2 resize-none focus:outline-none focus:ring-2 focus:ring-red-400 text-text-main"
                        />
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => { setCancelSessionTarget(null); setCancelSessionReason(""); }}
                                className="text-sm text-text-muted font-bold hover:text-text-main transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleCancelSession}
                                disabled={!cancelSessionReason.trim() || cancellingSession}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg disabled:opacity-50 transition-colors"
                            >
                                {cancellingSession ? "Submitting…" : "Submit Request"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject session cancellation modal */}
            {rejectSessionTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-card-light rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
                        <h3 className="text-sm font-bold text-text-main">Reject Cancellation — Visit {rejectSessionTarget.sessionNumber}</h3>
                        <textarea
                            rows={3}
                            value={rejectSessionReason}
                            onChange={(e) => setRejectSessionReason(e.target.value)}
                            placeholder="Reason for rejecting this cancellation request…"
                            className="w-full text-sm rounded-lg border border-border-light bg-background-light p-2 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 text-text-main"
                        />
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => { setRejectSessionTarget(null); setRejectSessionReason(""); }}
                                className="text-sm text-text-muted font-bold hover:text-text-main transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleRejectSessionCancellation}
                                disabled={!rejectSessionReason.trim() || rejectingSession}
                                className="px-4 py-2 bg-yellow-700 hover:bg-yellow-800 text-white text-sm font-bold rounded-lg disabled:opacity-50 transition-colors"
                            >
                                {rejectingSession ? "Submitting…" : "Confirm Rejection"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
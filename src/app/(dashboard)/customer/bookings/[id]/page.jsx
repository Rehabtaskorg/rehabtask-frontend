"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
    MdArrowBack, MdChat, MdCalendarToday, MdLocationOn, MdVideocam, MdPerson,
    MdCheckCircle, MdClose, MdWarning, MdInfo, MdRefresh, MdSchedule, MdUpdate,
} from "react-icons/md";
import { useBookingDetail } from "@/hooks/useBookings";
import { useBookingPolling, usePaymentRedirect } from "@/hooks/useBookingPolling";
import { bookingsApi } from "@/services/booking.api";
import { BOOKING_STATUS, USER_ROLES } from "@/lib/constants";
import { resolveVisitPlan, computeTotalVisits } from "@/lib/visitPlan";
import { formatCurrency } from "@/utils/messages";
import { formatDate } from "@/utils/dates";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAnalytics } from "@/hooks/useAnalytics";
import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import BookingTimeline from "@/components/bookings/BookingTimeline";
import BookingSharedFiles from "@/components/bookings/BookingSharedFiles";
import BookingEscrowInfo from "@/components/bookings/BookingEscrowInfo";
import SessionList from "@/components/bookings/SessionList";
import PaymentSummaryCard from "@/components/bookings/PaymentSummaryCard";
import InlinePaymentSection from "@/components/bookings/InlinePaymentSection";
import RequestRevisionModal from "@/components/shared/sessions/RequestRevisionModal";
import MarkSessionMissedModal from "@/components/shared/sessions/MarkSessionMissedModal";
import RevisionStatusBanner from "@/components/shared/sessions/RevisionStatusBanner";
import { PatientInfoBlock } from "@/components/shared/patient/PatientInfoBlock";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function CustomerBookingDetailPage() {
    usePageTitle("Booking Details");
    const params = useParams();
    const router = useRouter();
    const { trackEvent } = useAnalytics();
    const searchParams = useSearchParams();
    const { booking, loading, error, refetch } = useBookingDetail(params.id);

    const [therapistImgError, setTherapistImgError] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showRevisionModal, setShowRevisionModal] = useState(false);
    const [revisionSessionId, setRevisionSessionId] = useState(null);
    const [reportMissedSession, setReportMissedSession] = useState(null);
    const [showCancelForm, setShowCancelForm] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelling, setCancelling] = useState(false);
    const [cancelSessionTarget, setCancelSessionTarget] = useState(null);
    const [cancelSessionReason, setCancelSessionReason] = useState("");
    const [cancellingSession, setCancellingSession] = useState(false);
    const [rejectSessionTarget, setRejectSessionTarget] = useState(null);
    const [rejectSessionReason, setRejectSessionReason] = useState("");
    const [rejectingSession, setRejectingSession] = useState(false);
    const [showPaymentBanner, setShowPaymentBanner] = useState(false);
    const [rescheduleResponding, setRescheduleResponding] = useState(null);
    const [rescheduleConfirm, setRescheduleConfirm] = useState(null);
    const [actionError, setActionError] = useState(null);
    const [awaitingPaymentUpdate, setAwaitingPaymentUpdate] = useState(false);
    const [showRejectCancellationForm, setShowRejectCancellationForm] = useState(false);
    const [rejectCancellationReason, setRejectCancellationReason] = useState("");
    const [cancellationActing, setCancellationActing] = useState(false);

    useBookingPolling({ booking, refetch, awaitingPaymentUpdate, setAwaitingPaymentUpdate });
    usePaymentRedirect({ params, searchParams, setShowPaymentBanner, setAwaitingPaymentUpdate });

    const handleConfirmCompletion = async () => {
        setConfirming(true);
        setActionError(null);
        try {
            await bookingsApi.confirmSession(booking.sessions?.[0]?.id);
            trackEvent("session_confirmed_by_customer", {
                session_type: booking.sessionType,
                sessions_remaining: (booking.sessions ?? []).filter(
                    (s) => s.status !== "confirmed_by_customer"
                ).length - 1, // subtract the one just confirmed
            });
            setShowConfirmDialog(false);
            await refetch();
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to confirm completion.");
        } finally {
            setConfirming(false);
        }
    };

    const handleRequestCancellation = async () => {
        if (!cancelReason.trim()) return;
        setCancelling(true);
        setActionError(null);
        try {
            await bookingsApi.requestCancellation(params.id, cancelReason);
            setShowCancelForm(false);
            setCancelReason("");
            await refetch();
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to submit cancellation request.");
        } finally {
            setCancelling(false);
        }
    };

    const handleApproveCancellation = async () => {
        setCancellationActing(true);
        setActionError(null);
        try {
            await bookingsApi.approveCancellation(params.id);
            await refetch();
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to approve cancellation.");
        } finally {
            setCancellationActing(false);
        }
    };

    const handleRejectCancellation = async () => {
        if (!rejectCancellationReason.trim()) return;
        setCancellationActing(true);
        setActionError(null);
        try {
            await bookingsApi.rejectCancellation(params.id, rejectCancellationReason);
            setShowRejectCancellationForm(false);
            setRejectCancellationReason("");
            await refetch();
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to reject cancellation.");
        } finally {
            setCancellationActing(false);
        }
    };

    const handleCancelSession = async () => {
        if (!cancelSessionReason.trim()) return;
        setCancellingSession(true);
        setActionError(null);
        try {
            await bookingsApi.requestSessionCancellation(cancelSessionTarget.id, cancelSessionReason);
            setCancelSessionTarget(null);
            setCancelSessionReason("");
            await refetch();
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to submit cancellation request.");
        } finally {
            setCancellingSession(false);
        }
    };

    const handleApproveSessionCancellation = async (session) => {
        setActionError(null);
        try {
            await bookingsApi.approveSessionCancellation(session.id);
            await refetch();
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to approve cancellation.");
        }
    };

    const handleRejectSessionCancellation = async () => {
        if (!rejectSessionReason.trim()) return;
        setRejectingSession(true);
        setActionError(null);
        try {
            await bookingsApi.rejectSessionCancellation(rejectSessionTarget.id, rejectSessionReason);
            setRejectSessionTarget(null);
            setRejectSessionReason("");
            await refetch();
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to reject cancellation.");
        } finally {
            setRejectingSession(false);
        }
    };

    const handleRescheduleResponse = async (accept) => {
        setRescheduleResponding(accept ? "accept" : "decline");
        setActionError(null);
        try {
            await bookingsApi.respondToReschedule(params.id, accept);
            await refetch();
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to respond to reschedule.");
        } finally {
            setRescheduleResponding(null);
        }
    };

    const handlePaymentSuccess = () => {
        setShowPaymentBanner(true);
        setAwaitingPaymentUpdate(true);
        refetch();
        setTimeout(() => setShowPaymentBanner(false), 6000);
    };

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

    const therapist = booking.therapist;
    const sessions = booking.sessions || [];
    const session = sessions[0];
    const payment = booking.payment;
    const offer = booking.offer;
    const request = offer?.request;
    const therapistInitial = therapist?.fullName?.charAt(0) || "?";
    const sessionType = offer?.sessionType;

    const plan = resolveVisitPlan({ booking, offer, request });
    const totalSessions = sessions.length > 1 ? sessions.length : (computeTotalVisits(plan) ?? 1);
    const isMultiSession = totalSessions > 1;
    const perSessionRate = parseFloat(booking.rate);

    const allConfirmed = isMultiSession
        ? sessions.length > 0 && sessions.every(s => s.status === "confirmed_by_customer")
        : session?.status === "confirmed_by_customer";

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
            {showPaymentBanner && (
                <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-50  border border-emerald-200 ">
                    <MdCheckCircle className="text-emerald-600  text-lg shrink-0" />
                    <p className="text-sm text-emerald-800  flex-1">
                        Payment successful! Your session is confirmed.
                    </p>
                    <button onClick={() => setShowPaymentBanner(false)} className="text-emerald-600  hover:text-emerald-800 ">
                        <MdClose className="text-base" />
                    </button>
                </div>
            )}

            {actionError && (
                <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50  border border-red-200 ">
                    <MdWarning className="text-red-600  text-lg shrink-0" />
                    <p className="text-sm text-red-800  flex-1">{actionError}</p>
                    <button onClick={() => setActionError(null)} className="text-red-600  hover:text-red-800">
                        <MdClose className="text-base" />
                    </button>
                </div>
            )}

            <button
                onClick={() => router.push("/customer/bookings")}
                className="flex items-center gap-1 text-sm text-text-muted  hover:text-primary transition-colors mb-6"
            >
                <MdArrowBack className="text-base" /> Back to Bookings
            </button>

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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                    {/* Therapist card */}
                    <div className="bg-card-light  border border-border-light  rounded-xl p-5">
                        <div className="flex items-start gap-4">
                            {therapist?.profilePhotoUrl && !therapistImgError ? (
                                <Image
                                    src={therapist.profilePhotoUrl}
                                    alt={therapist.fullName}
                                    width={56}
                                    height={56}
                                    onError={() => setTherapistImgError(true)}
                                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                                    {therapistInitial}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-text-main ">
                                    {therapist?.fullName || "Therapist"}
                                </h3>
                                {therapist?.specialization && (
                                    <p className="text-sm text-text-muted  mt-0.5">{therapist.specialization}</p>
                                )}
                                {therapist?.phone && (
                                    <p className="text-xs text-text-muted  mt-1">{therapist.phone}</p>
                                )}
                            </div>
                            {["accepted", "confirmed", "in_progress", "completed", "reschedule_requested"].includes(booking.status) && (
                                <button
                                    onClick={() => router.push(`/customer/messages?c=booking:${params.id}`)}
                                    className="flex items-center gap-1.5 px-3 py-2 border border-primary text-primary rounded-lg text-xs font-bold hover:bg-primary/5 transition-colors shrink-0"
                                >
                                    <MdChat className="text-sm" />
                                    Message
                                </button>
                            )}
                        </div>
                    </div>

                    {booking.patient && (
                        <PatientInfoBlock patient={booking.patient} therapist={booking.therapist} />
                    )}

                    {/* Session details */}
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
                                {sessionType === "virtual"
                                    ? <MdVideocam className="text-primary text-lg mt-0.5 shrink-0" />
                                    : <MdLocationOn className="text-primary text-lg mt-0.5 shrink-0" />
                                }
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
                                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                                    sessionType === "virtual"
                                        ? "bg-blue-100  text-blue-700 "
                                        : "bg-emerald-100  text-emerald-700 "
                                }`}>
                                    {sessionType === "virtual" ? <MdVideocam className="text-sm" /> : <MdPerson className="text-sm" />}
                                    {sessionType === "virtual" ? "Virtual" : "In-Person"}
                                </span>
                            </div>
                        )}
                    </div>

                    <BookingTimeline booking={booking} />

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
                            onCancelSession={(s) => setCancelSessionTarget(s)}
                            onApproveSessionCancellation={handleApproveSessionCancellation}
                            onRejectSessionCancellation={(s) => setRejectSessionTarget(s)}
                        />
                    )}

                    {/* Action area */}
                    <div className="space-y-4">
                        {booking.status === "reschedule_requested" && booking.proposedNewDate && (
                            <div className="bg-amber-50  border border-amber-200  rounded-xl p-5">
                                <div className="flex items-start gap-3 mb-3">
                                    <MdUpdate className="text-amber-600  text-lg mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-amber-900 ">Reschedule Requested</p>
                                        <p className="text-xs text-amber-700  mt-0.5">
                                            Therapist proposed: {formatDate(booking.proposedNewDate)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-8">
                                    <button
                                        onClick={() => setRescheduleConfirm("accept")}
                                        disabled={!!rescheduleResponding}
                                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {rescheduleResponding === "accept" ? "Accepting..." : "Accept"}
                                    </button>
                                    <button
                                        onClick={() => setRescheduleConfirm("decline")}
                                        disabled={!!rescheduleResponding}
                                        className="px-4 py-2 border border-red-300  text-red-600  text-xs font-bold rounded-lg hover:bg-red-50  transition-colors disabled:opacity-50"
                                    >
                                        {rescheduleResponding === "decline" ? "Declining..." : "Decline"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {["pending", "accepted"].includes(booking.status) && (!payment || ["intent_created", "requires_action", "failed"].includes(payment.status)) && (
                            <div id="inline-payment">
                                <InlinePaymentSection booking={booking} onPaymentSuccess={handlePaymentSuccess} />
                            </div>
                        )}

                        {/* Cancellation pending — your own request, waiting on therapist */}
                        {booking.status === BOOKING_STATUS.CANCELLATION_REQUESTED &&
                            booking.cancellationRequestedBy === USER_ROLES.CUSTOMER && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <MdSchedule className="text-yellow-600 text-lg mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-yellow-900">Cancellation Pending</p>
                                        <p className="text-xs text-yellow-700 mt-0.5">
                                            Your request has been sent to {booking.therapist?.fullName}. They have 24 hours to respond. If they don&apos;t, your cancellation will be approved automatically.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Therapist requested cancellation — customer must approve or reject */}
                        {booking.status === BOOKING_STATUS.CANCELLATION_REQUESTED &&
                            booking.cancellationRequestedBy === USER_ROLES.THERAPIST && (
                            <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-5">
                                <div className="flex items-start gap-3 mb-4">
                                    <MdWarning className="text-yellow-600 text-xl mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-yellow-900">Cancellation Requested</p>
                                        <p className="text-xs text-yellow-700 mt-0.5">
                                            {booking.therapist?.fullName} has requested to cancel this booking.
                                            {booking.cancellationReason && <> Reason: &ldquo;{booking.cancellationReason}&rdquo;</>}
                                        </p>
                                        <p className="text-xs text-yellow-600 mt-1 font-semibold">
                                            You have until{" "}
                                            {booking.cancellationRequestedAt
                                                ? new Date(new Date(booking.cancellationRequestedAt).getTime() + 24 * 60 * 60 * 1000).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })
                                                : "24 hours from the request"}{" "}
                                            to respond. If you take no action, the request will be automatically declined and your booking will remain active.
                                        </p>
                                    </div>
                                </div>

                                {!showRejectCancellationForm ? (
                                    <div className="flex gap-3 ml-8">
                                        <button
                                            onClick={handleApproveCancellation}
                                            disabled={cancellationActing}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg disabled:opacity-50 transition-colors"
                                        >
                                            {cancellationActing ? "Processing..." : "Approve Cancellation"}
                                        </button>
                                        <button
                                            onClick={() => setShowRejectCancellationForm(true)}
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
                                            value={rejectCancellationReason}
                                            onChange={(e) => setRejectCancellationReason(e.target.value)}
                                            placeholder="Provide a reason for rejecting this cancellation request..."
                                            className="w-full text-sm rounded-lg border border-yellow-300 bg-white p-2 focus:ring-yellow-400 focus:outline-none resize-none text-text-main"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleRejectCancellation}
                                                disabled={!rejectCancellationReason.trim() || cancellationActing}
                                                className="px-4 py-2 bg-yellow-700 hover:bg-yellow-800 text-white text-sm font-bold rounded-lg disabled:opacity-50 transition-colors"
                                            >
                                                {cancellationActing ? "Submitting..." : "Confirm Rejection"}
                                            </button>
                                            <button
                                                onClick={() => { setShowRejectCancellationForm(false); setRejectCancellationReason(""); }}
                                                className="px-4 py-2 text-sm text-text-muted font-bold hover:text-text-main transition-colors"
                                            >
                                                Back
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Cancel button — escrowed (refundable) or intent_created (no money moved yet), no cancellation already in flight */}
                        {["escrowed", "intent_created"].includes(payment?.status) &&
                            booking.status !== BOOKING_STATUS.CANCELLATION_REQUESTED &&
                            booking.status !== BOOKING_STATUS.CANCELLED &&
                            !showCancelForm && (
                            <div className="bg-card-light border border-border-light rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <MdInfo className="text-primary text-lg mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-text-main">
                                            {payment.status === "escrowed" ? "Payment Secured" : "Payment Pending"}
                                        </p>
                                        <p className="text-xs text-text-muted mt-0.5">
                                            {payment.status === "escrowed"
                                                ? "Your payment is held securely and will be released after session completion."
                                                : "Your payment has not been completed yet."}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowCancelForm(true)}
                                    className="mt-3 ml-8 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                                >
                                    Request Cancellation
                                </button>
                            </div>
                        )}

                        {/* Cancellation request form */}
                        {showCancelForm && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                                <p className="text-sm font-bold text-red-900 mb-1">Request Cancellation</p>
                                <p className="text-xs text-red-700 mb-3">
                                    {payment?.status === "escrowed"
                                        ? <>Your request will be sent to {booking.therapist?.fullName}. They have 24 hours to approve or reject it. If they don&apos;t respond, your cancellation will be approved automatically and your payment will be credited back to your account.</>
                                        : <>This booking will be cancelled immediately. No payment has been made, so no credit is needed.</>
                                    }
                                </p>
                                <textarea
                                    rows={2}
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="Please provide a reason for cancelling..."
                                    className="w-full text-sm rounded-lg bg-white border border-red-200 p-2 focus:ring-red-400 focus:outline-none resize-none text-text-main mb-3"
                                />
                                <div className="flex items-center gap-2 justify-end">
                                    <button
                                        onClick={() => { setShowCancelForm(false); setCancelReason(""); }}
                                        className="text-sm text-slate-500 font-bold hover:text-text-main transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleRequestCancellation}
                                        disabled={!cancelReason.trim() || cancelling}
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 transition-colors"
                                    >
                                        {cancelling ? "Submitting..." : "Submit Request"}
                                    </button>
                                </div>
                            </div>
                        )}

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

                        {sessions.length <= 1 && session?.status === "completed_by_therapist" && !showConfirmDialog && (
                            <div className="bg-amber-50  border border-amber-200  rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <MdWarning className="text-amber-600  text-lg mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-amber-900 ">
                                            {session.revisionCount > 0 ? "Session Resubmitted" : "Session Marked Complete"}
                                        </p>
                                        <p className="text-xs text-amber-700  mt-0.5">
                                            {session.revisionCount > 0
                                                ? "Your therapist has addressed your revision request and resubmitted the session. Please review and confirm, or request additional changes."
                                                : "Your therapist has marked this session as complete. Please confirm to release payment, or request changes if something needs updating."}
                                        </p>
                                        <p className="text-xs text-amber-600  mt-1">
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
                                        className="border border-amber-300  text-amber-700  hover:bg-amber-100  px-5 py-2 rounded-lg text-sm font-bold transition-colors"
                                    >
                                        Request Revision
                                    </button>
                                </div>
                            </div>
                        )}

                        {sessions.length <= 1 && showConfirmDialog && (
                            <div className="bg-emerald-50  border border-emerald-200  rounded-xl p-5">
                                <p className="text-sm font-bold text-emerald-900  mb-1">Confirm Session Completion?</p>
                                <p className="text-xs text-emerald-700  mb-4">
                                    This will release {formatCurrency(perSessionRate)} to the therapist. This action cannot be undone.
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
                                        className="text-sm text-slate-500  font-bold hover:text-text-main  transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {booking.status !== "finalized" && (allConfirmed || payment?.status === "released") && (
                            <div className="bg-emerald-50  border border-emerald-200  rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <MdCheckCircle className="text-emerald-600  text-lg mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-emerald-900 ">
                                            {isMultiSession ? "All Sessions Complete" : "Session Complete"}
                                        </p>
                                        <p className="text-xs text-emerald-700  mt-0.5">
                                            {payment?.status === "released"
                                                // TODO: [BUG] payment.amount is total escrow amount, not what was actually released.
                                                // Should use payment.releasedAmount so missed/attempted deductions are reflected correctly.
                                                ? `Payment of ${formatCurrency(parseFloat(payment.amount))} has been released to the therapist.`
                                                : "Payment will be released shortly."
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {booking.status === "cancelled" && (
                            <div className="bg-slate-50  border border-border-light  rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <MdInfo className="text-text-muted  text-lg mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-text-main ">Booking Cancelled</p>
                                        {session?.cancellationReason && (
                                            <p className="text-xs text-text-muted  mt-0.5">
                                                Reason: {session.cancellationReason}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <PaymentSummaryCard
                        booking={booking}
                        role="customer"
                        onAction={(action) => {
                            if (action === "proceed_payment") {
                                document.getElementById("inline-payment")?.scrollIntoView({ behavior: "smooth" });
                            }
                        }}
                    />
                    <BookingSharedFiles bookingId={booking.id} canUpload={false} />
                    <BookingEscrowInfo booking={booking} payment={payment} />
                </div>
            </div>

            <ConfirmModal
                isOpen={!!rescheduleConfirm}
                onClose={() => { if (!rescheduleResponding) setRescheduleConfirm(null); }}
                onConfirm={() => {
                    const isAccept = rescheduleConfirm === "accept";
                    setRescheduleConfirm(null);
                    handleRescheduleResponse(isAccept);
                }}
                title={rescheduleConfirm === "accept" ? "Accept Reschedule" : "Decline Reschedule"}
                message={
                    rescheduleConfirm === "accept"
                        ? "The session will be moved to the new proposed date. The therapist will be notified."
                        : "The session will stay at its original date. The therapist will be notified."
                }
                confirmLabel={rescheduleConfirm === "accept" ? "Accept" : "Decline"}
                confirmClassName={
                    rescheduleConfirm === "accept"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-red-600 hover:bg-red-700 text-white"
                }
                loading={!!rescheduleResponding}
            />

            <RequestRevisionModal
                isOpen={showRevisionModal}
                onClose={() => { setShowRevisionModal(false); setRevisionSessionId(null); }}
                sessionId={revisionSessionId || session?.id}
                onSuccess={() => {
                    trackEvent("session_revision_requested");
                    refetch();
                }}
            />

            <MarkSessionMissedModal
                isOpen={!!reportMissedSession}
                onClose={() => setReportMissedSession(null)}
                sessionId={reportMissedSession?.id}
                sessionNumber={reportMissedSession?.sessionNumber}
                actorRole="customer"
                refundAmount={booking?.rate}
                onSuccess={refetch}
            />

            {/* Cancel session modal */}
            {cancelSessionTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-card-light rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
                        <h3 className="text-sm font-bold text-text-main">Request Cancellation — Visit {cancelSessionTarget.sessionNumber}</h3>
                        <p className="text-xs text-text-muted">Your request will be sent to the therapist. They have 24 hours to approve or reject. If they don&apos;t respond, the cancellation will be approved automatically.</p>
                        <textarea
                            rows={3}
                            value={cancelSessionReason}
                            onChange={(e) => setCancelSessionReason(e.target.value)}
                            placeholder="Reason for requesting cancellation…"
                            className="w-full text-sm rounded-lg border border-border-light bg-background-light p-2 resize-none focus:outline-none focus:ring-2 focus:ring-red-400 text-text-main"
                        />
                        {actionError && <p className="text-xs text-red-600">{actionError}</p>}
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
                        {actionError && <p className="text-xs text-red-600">{actionError}</p>}
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

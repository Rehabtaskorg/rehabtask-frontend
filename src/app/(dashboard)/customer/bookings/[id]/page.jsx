"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
    MdArrowBack, MdChat, MdCalendarToday, MdAccessTime, MdLocationOn, MdVideocam, MdPerson,
    MdCheckCircle, MdClose, MdWarning, MdInfo, MdRefresh, MdSchedule, MdUpdate,
} from "react-icons/md";
import { useBookingDetail } from "@/hooks/useBookings";
import { useBookingPolling, usePaymentRedirect } from "@/hooks/useBookingPolling";
import { bookingsApi } from "@/lib/bookings.api";
import { resolveVisitPlan, computeTotalVisits } from "@/lib/visitPlan";
import { formatCurrency } from "@/utils/messages";
import { formatDate, formatTime } from "@/utils/dates";
import { usePageTitle } from "@/hooks/usePageTitle";
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
import PatientInfoBlock from "@/components/customer/PatientInfoBlock";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function CustomerBookingDetailPage() {
    usePageTitle("Booking Details");
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { booking, loading, error, refetch } = useBookingDetail(params.id);

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
    const [rescheduleConfirm, setRescheduleConfirm] = useState(null);
    const [actionError, setActionError] = useState(null);
    const [awaitingPaymentUpdate, setAwaitingPaymentUpdate] = useState(false);

    useBookingPolling({ booking, refetch, awaitingPaymentUpdate, setAwaitingPaymentUpdate });
    usePaymentRedirect({ params, searchParams, setShowPaymentBanner, setAwaitingPaymentUpdate });

    const handleConfirmCompletion = async () => {
        setConfirming(true);
        setActionError(null);
        try {
            await bookingsApi.confirmSession(booking.sessions?.[0]?.id);
            setShowConfirmDialog(false);
            await refetch();
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to confirm completion.");
        } finally {
            setConfirming(false);
        }
    };

    const handleRequestRefund = async () => {
        if (!refundReason.trim()) return;
        setRefunding(true);
        setActionError(null);
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

                    {booking.patient && <PatientInfoBlock patient={booking.patient} />}

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
                                <MdAccessTime className="text-primary text-lg mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-text-muted ">Time</p>
                                    <p className="text-sm font-medium text-text-main ">{formatTime(session?.scheduledDate || booking.scheduledDate)}</p>
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
                                            Therapist proposed: {formatDate(booking.proposedNewDate)} at {formatTime(booking.proposedNewDate)}
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

                        {payment?.status === "escrowed" && session?.status === "scheduled" && !showRefundForm && (
                            <div className="bg-card-light  border border-border-light  rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <MdInfo className="text-primary text-lg mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-text-main ">Session Confirmed</p>
                                        <p className="text-xs text-text-muted  mt-0.5">
                                            Your payment is held securely and will be released after session completion.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowRefundForm(true)}
                                    className="mt-3 ml-8 text-xs font-semibold text-red-500  hover:text-red-700  transition-colors"
                                >
                                    Cancel & Request Refund
                                </button>
                            </div>
                        )}

                        {showRefundForm && (
                            <div className="bg-red-50  border border-red-200  rounded-xl p-5">
                                <p className="text-sm font-bold text-red-900  mb-2">Request Refund</p>
                                <p className="text-xs text-red-700  mb-3">
                                    This will cancel your booking and refund your payment.
                                </p>
                                <textarea
                                    rows={2}
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    placeholder="Please provide a reason for the refund..."
                                    className="w-full text-sm rounded-lg bg-white  border border-red-200  p-2 focus:ring-red-400 focus:outline-none resize-none text-text-main  mb-3"
                                />
                                <div className="flex items-center gap-2 justify-end">
                                    <button
                                        onClick={() => { setShowRefundForm(false); setRefundReason(""); }}
                                        className="text-sm text-slate-500  font-bold hover:text-text-main  transition-colors"
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
                onSuccess={refetch}
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
        </div>
    );
}

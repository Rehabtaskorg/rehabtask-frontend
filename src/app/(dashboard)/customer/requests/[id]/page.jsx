"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Image from "next/image";
import {
    MdArrowBack, MdCheckCircle, MdEdit, MdCancel, MdLocationOn,
    MdCalendarToday, MdAccessTime, MdAttachMoney, MdAssignment,
    MdPerson, MdInfo, MdSchedule, MdClose, MdChat, MdMoreHoriz,
    MdVideocam, MdPersonPin, MdWarning, MdRefresh
} from "react-icons/md";
import { usePageTitle } from "@/hooks/usePageTitle";
import PatientInfoBlock from "@/components/customer/PatientInfoBlock";

const STATUS_STYLES = {
    created: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    offers_received: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    offers_accepted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_LABELS = {
    created: "Created",
    offers_received: "Offers Received",
    offers_accepted: "Accepted",
    completed: "Completed",
    cancelled: "Cancelled",
};

const OFFER_STATUS_STYLES = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    accepted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    expired: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
    withdrawn: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
    change_requested: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

// ─── Timeline Step ───
function TimelineStep({ completed, current, label, date }) {
    return (
        <div className="relative flex items-start gap-4">
            <div className={`z-10 h-6 w-6 rounded-full flex items-center justify-center ring-4 ring-card-light dark:ring-card-dark shrink-0 ${completed
                ? "bg-emerald-500 text-white"
                : current
                    ? "bg-primary text-white"
                    : "bg-slate-200 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600"
                }`}>
                {completed && <MdCheckCircle className="text-sm" />}
                {current && <div className="h-2 w-2 rounded-full bg-white" />}
            </div>
            <div>
                <p className={`font-bold text-sm ${completed ? "text-text-main dark:text-white" : current ? "text-primary" : "text-slate-400 dark:text-slate-500"}`}>
                    {label}
                </p>
                {date && (
                    <p className="text-xs text-text-muted dark:text-gray-400 mt-0.5">{date}</p>
                )}
                {current && !date && (
                    <p className="text-xs text-slate-400 italic mt-0.5">Pending...</p>
                )}
            </div>
        </div>
    );
}

export default function CustomerRequestDetailPage() {
    usePageTitle("Request Details");
    const params = useParams();
    const router = useRouter();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(null);
    const [declining, setDeclining] = useState(null);
    const [acceptedBooking, setAcceptedBooking] = useState(null);
    const [changeOfferId, setChangeOfferId] = useState(null);
    const [changeNote, setChangeNote] = useState("");
    const [changingOffer, setChangingOffer] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const fetchRequest = async () => {
        try {
            const res = await api.get(`/requests/${params.id}`);
            setRequest(res.data.data);
        } catch (error) {
            console.error("Error fetching request:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequest();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    const handleAcceptOffer = async (offerId) => {
        if (!confirm("Accept this offer? A booking will be created and you can pay when ready.")) return;
        setAccepting(offerId);
        try {
            const res = await api.post(`/offers/${offerId}/accept`);
            setAcceptedBooking(res.data.data.booking);
            fetchRequest();
        } catch (error) {
            const code = error.response?.data?.code;
            if (code === "THERAPIST_LIMIT_REACHED" || code === "REQUEST_LIMIT_REACHED") {
                if (window.confirm(error.response.data.message + "\n\nWould you like to upgrade your plan?")) {
                    router.push("/customer/subscription");
                }
            } else {
                alert("Error: " + (error.response?.data?.message || "Failed to accept offer"));
            }
        } finally {
            setAccepting(null);
        }
    };

    const handleDeclineOffer = async (offerId) => {
        if (!confirm("Decline this offer? The therapist will be notified.")) return;
        setDeclining(offerId);
        try {
            await api.post(`/offers/${offerId}/decline`);
            fetchRequest();
        } catch (error) {
            alert("Error: " + (error.response?.data?.message || "Failed to decline offer"));
        } finally {
            setDeclining(null);
        }
    };

    const handleMessageTherapist = (offerId) => {
        router.push(`/customer/messages?c=offer:${offerId}`);
    };

    const handleRequestChange = async (offerId) => {
        setChangingOffer(true);
        try {
            await api.post(`/offers/${offerId}/request-change`, { note: changeNote });
            setChangeOfferId(null);
            setChangeNote("");
            fetchRequest();
        } catch (err) {
            const errors = err.response?.data?.errors;
            const msg = errors?.[0]?.message || err.response?.data?.message || "Failed to send change request.";
            alert(msg);
        } finally {
            setChangingOffer(false);
        }
    };

    const handleCancelRequest = async () => {
        setCancelling(true);
        try {
            await api.post(`/requests/${params.id}/cancel`);
            fetchRequest();
            setShowCancelConfirm(false);
        } catch (err) {
            alert("Error: " + (err.response?.data?.message || "Failed to cancel request"));
        } finally {
            setCancelling(false);
        }
    };

    // ─── Loading ───
    if (loading) {
        return (
            <div className="p-4 md:p-6 max-w-6xl mx-auto">
                <div className="animate-pulse space-y-4">
                    <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-8 space-y-4">
                            <div className="h-48 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl" />
                            <div className="h-32 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl" />
                        </div>
                        <div className="lg:col-span-4 space-y-4">
                            <div className="h-40 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl" />
                            <div className="h-64 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="p-4 md:p-6 max-w-6xl mx-auto">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                    <MdWarning className="text-3xl text-red-500 mx-auto mb-2" />
                    <p className="text-red-800 dark:text-red-300 font-bold">Request not found</p>
                    <button onClick={() => router.push("/customer/requests")} className="mt-3 text-sm text-primary font-bold hover:underline">
                        Back to My Requests
                    </button>
                </div>
            </div>
        );
    }

    const offers = request.offers || [];
    const now = new Date();
    const isEditable = ["created", "offers_received"].includes(request.status);

    // Determine timeline state
    const statusOrder = ["created", "offers_received", "offers_accepted", "completed"];
    const currentIdx = statusOrder.indexOf(request.status);

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
            {/* Back link */}
            <button
                onClick={() => router.push("/customer/requests")}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted dark:text-gray-400 hover:text-primary transition-colors mb-6"
            >
                <MdArrowBack className="text-base" />
                Back to My Requests
            </button>

            {/* Accepted offer success banner */}
            {acceptedBooking && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 mb-6">
                    <MdCheckCircle className="text-xl text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">Offer accepted — Booking created!</p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">You can pay when you&apos;re ready from the booking page.</p>
                        <button
                            onClick={() => router.push(`/customer/bookings/${acceptedBooking.id}`)}
                            className="mt-2 text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                        >
                            View Booking →
                        </button>
                    </div>
                    <button onClick={() => setAcceptedBooking(null)} className="text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 shrink-0">
                        <MdClose className="text-lg" />
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-main dark:text-white">
                            {request.serviceType}
                        </h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${STATUS_STYLES[request.status] || "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}>
                            {STATUS_LABELS[request.status] || request.status}
                        </span>
                    </div>
                    <p className="flex items-center gap-1 text-text-muted dark:text-gray-400 font-medium">
                        <MdLocationOn className="text-primary text-lg" />
                        {request.location || "No location specified"}
                    </p>
                </div>
            </div>

            {/* Two-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* ── Left Column (8) ── */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Card 1: Request Details */}
                    <section className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-border-light dark:border-border-dark">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <MdAssignment className="text-xl" />
                            </div>
                            <h3 className="text-lg font-bold text-text-main dark:text-white">Request Details</h3>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest">Preferred Date</p>
                                <p className="font-semibold text-text-main dark:text-white">{formatDate(request.preferredDate)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest">Time</p>
                                <p className="font-semibold text-text-main dark:text-white">{formatTime(request.preferredDate)}</p>
                            </div>
                            {request.rate && (
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest">Rate</p>
                                    <p className="font-bold text-emerald-600 dark:text-emerald-400">${parseFloat(request.rate).toFixed(2)}/visit</p>
                                </div>
                            )}
                            {request.visitType && (
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest">Visit Type</p>
                                    <p className="font-semibold text-text-main dark:text-white">{request.visitType}</p>
                                </div>
                            )}
                            {request.emrSystem && (
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest">EMR System</p>
                                    <p className="font-semibold text-text-main dark:text-white">{request.emrSystem}</p>
                                </div>
                            )}
                            {request.sessionType && (
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest">Session Mode</p>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold ${request.sessionType === "virtual"
                                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                        : "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                                        }`}>
                                        {request.sessionType === "virtual" ? <MdVideocam className="text-sm" /> : <MdPersonPin className="text-sm" />}
                                        {request.sessionType === "virtual" ? "Virtual" : "In-Person"}
                                    </span>
                                </div>
                            )}
                        </div>

                        {request.visitsPerWeek && request.numberOfWeeks && (
                            <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/30">
                                <MdRefresh className="text-indigo-500 text-xl flex-shrink-0" />
                                <div>
                                    <p className="font-bold text-sm text-text-main dark:text-white">
                                        {request.visitsPerWeek}x/week · {request.numberOfWeeks} week{request.numberOfWeeks > 1 ? "s" : ""} ({request.visitsPerWeek * request.numberOfWeeks} visits)
                                    </p>
                                    <p className="text-xs text-text-muted dark:text-gray-400">Treatment frequency from referral</p>
                                </div>
                            </div>
                        )}

                        {request.description && (
                            <div className="pt-6 border-t border-border-light dark:border-border-dark">
                                <h4 className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-3">Description</h4>
                                <p className="text-text-main dark:text-gray-300 leading-relaxed text-sm">{request.description}</p>
                            </div>
                        )}
                    </section>

                    {/* Card 2: Patient Info */}
                    {request.patient && (
                        <section className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                        <MdPerson className="text-xl" />
                                    </div>
                                    <h3 className="text-lg font-bold text-text-main dark:text-white">Patient Info</h3>
                                </div>
                                <PatientInfoBlock patient={request.patient} />
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/10 px-6 py-3 flex items-center gap-2 border-t border-amber-100 dark:border-amber-900/20">
                                <MdInfo className="text-amber-600 dark:text-amber-400" />
                                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">This request is managed by an agency</p>
                            </div>
                        </section>
                    )}

                    {/* Card 3: Offers Received */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-extrabold text-text-main dark:text-white">
                            Offers Received ({offers.length})
                        </h3>

                        {offers.length === 0 ? (
                            <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-8 text-center">
                                <MdSchedule className="text-4xl text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                <p className="text-sm font-semibold text-text-main dark:text-white">No offers received yet</p>
                                <p className="text-xs text-text-muted dark:text-gray-400 mt-1">Therapists in your area will be notified about this request</p>
                            </div>
                        ) : (
                            offers.map((offer) => {
                                const isExpired = offer.status === "pending" && offer.expiresAt && new Date(offer.expiresAt) <= now;
                                const displayStatus = isExpired ? "expired" : offer.status;
                                const isActionable = offer.status === "pending" && !isExpired;
                                const therapist = offer.therapist || {};
                                const initial = (therapist.fullName || "T").charAt(0).toUpperCase();

                                return (
                                    <div
                                        key={offer.id}
                                        className={`bg-card-light dark:bg-card-dark rounded-xl p-5 shadow-sm border border-border-light dark:border-border-dark transition-all ${isExpired ? "opacity-60 border-dashed" : "hover:shadow-md"
                                            }`}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                                            {/* Avatar */}
                                            {therapist.profilePhotoUrl ? (
                                                <Image
                                                    src={therapist.profilePhotoUrl}
                                                    alt={therapist.fullName}
                                                    width={56}
                                                    height={56}
                                                    className="h-14 w-14 rounded-xl object-cover shrink-0"
                                                />
                                            ) : (
                                                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                                                    {initial}
                                                </div>
                                            )}

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-text-main dark:text-white">
                                                        {therapist.fullName || "Therapist"}
                                                    </h4>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${OFFER_STATUS_STYLES[displayStatus]}`}>
                                                        {displayStatus.replace(/_/g, " ")}
                                                    </span>
                                                </div>
                                                {therapist.specialization && (
                                                    <p className="text-sm text-text-muted dark:text-gray-400">{therapist.specialization}</p>
                                                )}

                                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-text-muted dark:text-gray-400">
                                                    <span className="flex items-center gap-1 font-semibold text-text-main dark:text-white">
                                                        <MdAttachMoney className="text-emerald-500" />
                                                        ${parseFloat(offer.rate).toFixed(2)}/session
                                                        {request.visitsPerWeek && request.numberOfWeeks && (
                                                            <span className="text-text-muted dark:text-gray-400 font-normal text-xs ml-1">
                                                                (${(parseFloat(offer.rate) * request.visitsPerWeek * request.numberOfWeeks).toFixed(2)} total)
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        {offer.sessionType === "virtual" ? <MdVideocam className="text-sm" /> : <MdPersonPin className="text-sm" />}
                                                        {offer.sessionType === "virtual" ? "Virtual" : "In-Person"}
                                                    </span>
                                                    {offer.visitType && (
                                                        <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold">
                                                            {offer.visitType.name} ({offer.visitType.code})
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-xs text-text-muted dark:text-gray-400 mt-2 flex items-center gap-1">
                                                    <MdCalendarToday className="text-sm" />
                                                    Proposed: {formatDate(offer.proposedDate)} · {formatTime(offer.proposedDate)}
                                                </p>

                                                {offer.description && (
                                                    <p className="text-sm text-text-main dark:text-gray-300 mt-3 leading-relaxed">{offer.description}</p>
                                                )}

                                                {isExpired && (
                                                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 italic">
                                                        This offer has expired. The therapist can send a new offer if still interested.
                                                    </p>
                                                )}

                                                {!isExpired && offer.expiresAt && offer.status === "pending" && (
                                                    <p className="text-xs text-text-muted dark:text-gray-400 mt-2">
                                                        Expires: {formatDate(offer.expiresAt)} · {formatTime(offer.expiresAt)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        {isActionable && changeOfferId !== offer.id && (
                                            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                                                <button
                                                    onClick={() => handleAcceptOffer(offer.id)}
                                                    disabled={accepting === offer.id}
                                                    className="flex-1 sm:flex-none px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                                                >
                                                    {accepting === offer.id ? "Accepting..." : "Accept Offer"}
                                                </button>
                                                <button
                                                    onClick={() => { setChangeOfferId(offer.id); setChangeNote(""); }}
                                                    className="flex-1 sm:flex-none px-5 py-2.5 border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-lg text-sm font-bold transition-colors"
                                                >
                                                    Request Change
                                                </button>
                                                <button
                                                    onClick={() => handleDeclineOffer(offer.id)}
                                                    disabled={declining === offer.id}
                                                    className="px-5 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                                                >
                                                    {declining === offer.id ? "Declining..." : "Decline"}
                                                </button>
                                            </div>
                                        )}

                                        {/* Inline change request form */}
                                        {isActionable && changeOfferId === offer.id && (
                                            <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                                                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                                                    <label className="text-xs font-semibold text-amber-800 dark:text-amber-300 block mb-2">
                                                        What would you like to change?
                                                    </label>
                                                    <textarea
                                                        rows={3}
                                                        value={changeNote}
                                                        onChange={(e) => setChangeNote(e.target.value)}
                                                        className="w-full text-sm rounded-lg bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 p-3 focus:ring-primary focus:outline-none resize-none text-text-main dark:text-white"
                                                        placeholder="Describe what you'd like changed..."
                                                    />
                                                    <p className={`text-xs mt-1 ${changeNote.trim().length > 0 && changeNote.trim().length < 10 ? "text-red-500" : "text-slate-400 dark:text-slate-500"}`}>
                                                        {changeNote.trim().length > 0 && changeNote.trim().length < 10
                                                            ? `${10 - changeNote.trim().length} more characters needed`
                                                            : "Min 10 characters"}
                                                    </p>
                                                    <div className="flex gap-2 mt-3 justify-end">
                                                        <button
                                                            onClick={() => { setChangeOfferId(null); setChangeNote(""); }}
                                                            className="text-sm text-slate-500 dark:text-slate-400 font-bold hover:text-text-main dark:hover:text-white transition-colors px-3 py-1.5"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => handleRequestChange(offer.id)}
                                                            disabled={changeNote.trim().length < 10 || changingOffer}
                                                            className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-1.5 rounded-lg text-sm font-bold disabled:opacity-50 transition-colors"
                                                        >
                                                            {changingOffer ? "Sending..." : "Send"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </section>
                </div>

                {/* ── Right Column (4) ── */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Actions Card */}
                    <section className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-border-light dark:border-border-dark">
                        <h3 className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-4">Management</h3>
                        <div className="space-y-3">
                            {isEditable && (
                                <button
                                    onClick={() => router.push(`/customer/requests/new?edit=${request.id}`)}
                                    className="w-full py-3 bg-card-light dark:bg-card-dark border-2 border-primary text-primary hover:bg-primary/5 dark:hover:bg-primary/10 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                    <MdEdit className="text-lg" />
                                    Edit Request
                                </button>
                            )}
                            {isEditable && !showCancelConfirm && (
                                <button
                                    onClick={() => setShowCancelConfirm(true)}
                                    className="w-full py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                    <MdCancel className="text-lg" />
                                    Cancel Request
                                </button>
                            )}
                            {showCancelConfirm && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <div className="flex items-start gap-2 mb-3">
                                        <MdWarning className="text-red-600 dark:text-red-400 text-lg shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-red-800 dark:text-red-200">Cancel this request?</p>
                                            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                                                {offers.length > 0
                                                    ? `This will cancel your request and withdraw ${offers.filter(o => ["pending", "change_requested"].includes(o.status)).length} pending offer(s). Affected therapists will be notified.`
                                                    : "This will cancel your request. This action cannot be undone."
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={() => setShowCancelConfirm(false)}
                                            className="text-sm text-slate-500 dark:text-slate-400 font-bold hover:text-text-main dark:hover:text-white transition-colors px-3 py-1.5"
                                        >
                                            Go Back
                                        </button>
                                        <button
                                            onClick={handleCancelRequest}
                                            disabled={cancelling}
                                            className="bg-red-600 hover:bg-red-700 text-white px-5 py-1.5 rounded-lg text-sm font-bold disabled:opacity-50 transition-colors"
                                        >
                                            {cancelling ? "Cancelling..." : "Yes, Cancel"}
                                        </button>
                                    </div>
                                </div>
                            )}
                            {request.status === "offers_accepted" && (
                                <button
                                    onClick={() => router.push(`/customer/messages`)}
                                    className="w-full py-3 bg-card-light dark:bg-card-dark border-2 border-primary text-primary hover:bg-primary/5 dark:hover:bg-primary/10 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                    <MdChat className="text-lg" />
                                    Message Therapist
                                </button>
                            )}
                            {!isEditable && request.status !== "offers_accepted" && (
                                <p className="text-xs text-text-muted dark:text-gray-400 text-center py-2">No actions available for this status</p>
                            )}
                        </div>
                    </section>

                    {/* Timeline Card */}
                    <section className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-border-light dark:border-border-dark">
                        <h3 className="text-lg font-bold text-text-main dark:text-white mb-6">Request Timeline</h3>
                        <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                            <TimelineStep
                                completed={currentIdx >= 0}
                                label="Request Created"
                                date={formatDate(request.createdAt) + " · " + formatTime(request.createdAt)}
                            />
                            <TimelineStep
                                completed={currentIdx >= 1}
                                current={currentIdx === 0}
                                label="Offers Received"
                                date={offers.length > 0 ? `${offers.length} offer${offers.length > 1 ? "s" : ""}` : null}
                            />
                            <TimelineStep
                                completed={currentIdx >= 2}
                                current={currentIdx === 1}
                                label="Offer Accepted"
                            />
                            <TimelineStep
                                completed={currentIdx >= 3}
                                current={currentIdx === 2}
                                label="Session Scheduled"
                            />
                            <TimelineStep
                                completed={request.status === "completed"}
                                current={currentIdx === 3}
                                label="Completed"
                            />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    MdAdd,
    MdLocationOn,
    MdCalendarToday,
    MdArrowBack,
    MdSchedule,
    MdInfo,
    MdVisibility,
    MdEdit,

} from "react-icons/md";
import { api } from "@/lib/api";
import Image from "next/image";
import { usePageTitle } from "@/hooks/usePageTitle";
import PatientBadge from "@/components/customer/PatientBadge";

// ─── Helpers ────────────────────────────────────────────────

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return `${d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })} • ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
};

const formatSessionType = (type) => {
    if (!type) return "—";
    return type
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
};

// ─── Constants ──────────────────────────────────────────────

const FILTER_TABS = [
    { key: "all", label: "All" },
    { key: "open", label: "Open", status: "created" },
    { key: "offers_received", label: "Offers Received", status: "offers_received", showCount: true },
    { key: "accepted", label: "Accepted", status: "offers_accepted" },
    { key: "completed", label: "Completed", status: "completed" },
];

const STATUS_BADGE = {
    created: { bg: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400", label: "Open" },
    offers_received: { bg: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300", label: "Offers Received" },
    offers_accepted: { bg: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400", label: "Accepted" },
    completed: { bg: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400", label: "Completed" },
    cancelled: { bg: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400", label: "Cancelled" },
};

const OFFER_STATUS_BADGE = {
    pending: { bg: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400", label: "Pending" },
    accepted: { bg: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400", label: "Accepted" },
    rejected: { bg: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400", label: "Declined" },
    expired: { bg: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400", label: "Expired" },
    withdrawn: { bg: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400", label: "Withdrawn" },
    change_requested: { bg: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400", label: "Change Requested" },
};

export default function MyRequestsPage() {
    usePageTitle("My Requests");
    const router = useRouter();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("all");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [detailLoading] = useState(false);
    const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
    const [accepting, setAccepting] = useState(null);
    const [declining, setDeclining] = useState(null);
    const [changeOfferId, setChangeOfferId] = useState(null);
    const [changeNote, setChangeNote] = useState("");
    const [changingOffer, setChangingOffer] = useState(false);

    // Data fetching
    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/requests/my-requests");
            setRequests(Array.isArray(res.data.data) ? res.data.data : []);
        } catch (err) {
            console.error("Failed to fetch requests:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const fetchDetail = useCallback(async (id) => {
        try {
            const res = await api.get(`/requests/${id}`);
            setSelectedRequest(res.data.data);
        } catch (err) {
            console.error("Failed to fetch request detail:", err);
        }
    }, []);

    const refetchDetail = useCallback(async (id) => {
        try {
            const res = await api.get(`/requests/${id}`);
            setSelectedRequest(res.data.data);
        } catch (err) {
            console.error("Failed to refetch request detail:", err);
        }
    }, []);

    const handleSelectRequest = useCallback(
        (req) => {
            setSelectedRequest(req);   // show list data instantly
            setMobileDetailOpen(true);
            setChangeOfferId(null);
            setChangeNote("");
            fetchDetail(req.id);       // silently refresh with full detail in background
        },
        [fetchDetail]
    );

    // Filtering

    const offersReceivedCount = useMemo(
        () => requests.filter((r) => r.status === "offers_received").length,
        [requests]
    );

    const filteredRequests = useMemo(() => {
        if (activeFilter === "all") return requests;
        const tab = FILTER_TABS.find((t) => t.key === activeFilter);
        if (!tab || !tab.status) return requests;
        return requests.filter((r) => r.status === tab.status);
    }, [requests, activeFilter]);

    // Offer Actions

    const [acceptedBooking, setAcceptedBooking] = useState(null);

    const handleAccept = async (offerId) => {
        if (!window.confirm("Accept this offer? A booking will be created and you can pay when ready.")) return;
        setAccepting(offerId);
        try {
            const res = await api.post(`/offers/${offerId}/accept`);
            const booking = res.data.data.booking;
            setAcceptedBooking(booking);
            // Refresh the request detail to show updated offer statuses
            if (selectedRequest?.id) await refetchDetail(selectedRequest.id);
        } catch (err) {
            const code = err.response?.data?.code;
            if (code === "THERAPIST_LIMIT_REACHED" || code === "REQUEST_LIMIT_REACHED") {
                if (window.confirm(err.response.data.message + "\n\nWould you like to upgrade your plan?")) {
                    router.push("/customer/subscription");
                }
            } else {
                alert(err.response?.data?.message || "Failed to accept offer.");
            }
        } finally {
            setAccepting(null);
        }
    }

    const handleDecline = async (offerId) => {
        if (!window.confirm("Decline this offer?")) return;
        setDeclining(offerId);
        try {
            await api.post(`/offers/${offerId}/decline`);
            if (selectedRequest?.id) await refetchDetail(selectedRequest.id);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to decline offer.");
        } finally {
            setDeclining(null);
        }
    }

    const handleRequestChange = async (offerId) => {
        setChangingOffer(true);
        try {
            await api.post(`/offers/${offerId}/request-change`, { note: changeNote });
            setChangeOfferId(null);
            setChangeNote("");
            if (selectedRequest?.id) await refetchDetail(selectedRequest.id);
        } catch (err) {
            const errors = err.response?.data?.errors;
            const msg = errors?.[0]?.message || err.response?.data?.message || "Failed to send change request.";
            alert(msg);
        } finally {
            setChangingOffer(false);
        }
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Sticky Header */}
            <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-4 sm:px-8 shrink-0">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-text-main dark:text-white">
                    My Requests
                </h2>
                <button
                    onClick={() => router.push("/customer/requests/new")}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                >
                    <MdAdd className="text-lg" />
                    New Request
                </button>
            </header>

            {/* Two-panel body */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* ── LEFT PANEL ── */}
                <section className="w-full lg:w-[55%] flex flex-col overflow-hidden border-r-0 lg:border-r border-border-light dark:border-border-dark">
                    {/* Filter tabs */}
                    <div className="flex flex-wrap items-center gap-2 px-4 sm:px-6 py-3 border-b border-border-light dark:border-border-dark shrink-0">
                        {FILTER_TABS.map((tab) => {
                            const isActive = activeFilter === tab.key;
                            const count = tab.showCount ? offersReceivedCount : null;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveFilter(tab.key)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${isActive
                                        ? "bg-primary text-white"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                        }`}
                                >
                                    {tab.label}
                                    {count !== null ? ` (${count})` : ""}
                                </button>
                            );
                        })}
                    </div>

                    {/* Request list */}
                    <div className="flex-1 overflow-y-auto panel-scroll">
                        {loading ? (
                            <div className="animate-pulse space-y-3 p-4">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="h-24 bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark"
                                    />
                                ))}
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center py-16">
                                <div className="text-center space-y-3">
                                    <MdSchedule className="text-5xl text-slate-200 dark:text-slate-700 mx-auto" />
                                    <p className="text-text-muted dark:text-gray-400 text-sm">
                                        {requests.length === 0
                                            ? "No requests yet."
                                            : "No requests match this filter."}
                                    </p>
                                    {requests.length === 0 && (
                                        <button
                                            onClick={() => router.push("/customer/requests/new")}
                                            className="text-primary hover:underline text-sm font-bold"
                                        >
                                            Create Your First Request
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2 p-4">
                                {filteredRequests.map((req) => {
                                    const isSelected = selectedRequest?.id === req.id;
                                    const badge = STATUS_BADGE[req.status] || STATUS_BADGE.created;
                                    const offerCount = req.offers?.length || 0;

                                    return (
                                        <button
                                            key={req.id}
                                            onClick={() => handleSelectRequest(req)}
                                            className={`w-full text-left p-4 rounded-xl transition-all ${isSelected
                                                ? "border-2 border-primary bg-card-light dark:bg-card-dark shadow-md"
                                                : "border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark hover:shadow-sm"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <h3 className="text-sm font-bold text-text-main dark:text-white">
                                                    {req.serviceType}
                                                </h3>
                                                <span
                                                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${badge.bg}`}
                                                >
                                                    {badge.label}
                                                    {req.status === "offers_received" && offerCount > 0
                                                        ? ` (${offerCount})`
                                                        : ""}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-text-muted dark:text-gray-400">
                                                {req.location && (
                                                    <span className="flex items-center gap-1">
                                                        <MdLocationOn className="text-sm" />
                                                        {req.location}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <MdCalendarToday className="text-sm" />
                                                    {formatDate(req.preferredDate)}
                                                </span>
                                            </div>
                                            <PatientBadge patient={req.patient} />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                {/* ── RIGHT PANEL (desktop) ── */}
                <section className="hidden lg:flex lg:w-[45%] flex-col overflow-hidden">
                    {selectedRequest ? (
                        <>
                        {acceptedBooking && (
                            <div className="mx-6 mt-4 flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        )}
                        <DetailPanel
                            request={selectedRequest}
                            loading={detailLoading}
                            accepting={accepting}
                            declining={declining}
                            changeOfferId={changeOfferId}
                            changeNote={changeNote}
                            changingOffer={changingOffer}
                            onAccept={handleAccept}
                            onDecline={handleDecline}
                            onRequestChange={handleRequestChange}
                            onOpenChange={(id) => {
                                setChangeOfferId(id);
                                setChangeNote("");
                            }}
                            onCloseChange={() => {
                                setChangeOfferId(null);
                                setChangeNote("");
                            }}
                            onChangeNoteUpdate={setChangeNote}
                        />
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center space-y-2">
                                <MdInfo className="text-5xl text-slate-200 dark:text-slate-700 mx-auto" />
                                <p className="text-text-muted dark:text-gray-500 text-sm">
                                    Select a request to view details
                                </p>
                            </div>
                        </div>
                    )}
                </section>

                {/* ── MOBILE DETAIL OVERLAY ── */}
                {mobileDetailOpen && selectedRequest && (
                    <section className="absolute inset-0 z-20 bg-background-light dark:bg-background-dark flex flex-col overflow-hidden lg:hidden">
                        <div className="shrink-0 px-4 py-3 border-b border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark">
                            <button
                                onClick={() => setMobileDetailOpen(false)}
                                className="flex items-center gap-1 text-sm text-text-muted dark:text-gray-400 hover:text-primary transition-colors"
                            >
                                <MdArrowBack className="text-base" />
                                Back to list
                            </button>
                        </div>
                        {acceptedBooking && (
                            <div className="mx-4 mt-3 flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">Offer accepted — Booking created!</p>
                                    <button
                                        onClick={() => router.push(`/customer/bookings/${acceptedBooking.id}`)}
                                        className="mt-1 text-xs font-bold text-primary hover:underline"
                                    >
                                        View Booking →
                                    </button>
                                </div>
                                <button onClick={() => setAcceptedBooking(null)} className="text-emerald-400 hover:text-emerald-600 shrink-0">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        )}
                        <DetailPanel
                            request={selectedRequest}
                            loading={detailLoading}
                            accepting={accepting}
                            declining={declining}
                            changeOfferId={changeOfferId}
                            changeNote={changeNote}
                            changingOffer={changingOffer}
                            onAccept={handleAccept}
                            onDecline={handleDecline}
                            onRequestChange={handleRequestChange}
                            onOpenChange={(id) => {
                                setChangeOfferId(id);
                                setChangeNote("");
                            }}
                            onCloseChange={() => {
                                setChangeOfferId(null);
                                setChangeNote("");
                            }}
                            onChangeNoteUpdate={setChangeNote}
                        />
                    </section>
                )}
            </div>
        </div>
    );
}

// ─── Detail Panel ───────────────────────────────────────────

function DetailPanel({
    request,
    loading,
    accepting,
    declining,
    changeOfferId,
    changeNote,
    changingOffer,
    onAccept,
    onDecline,
    onRequestChange,
    onOpenChange,
    onCloseChange,
    onChangeNoteUpdate,
}) {
    if (loading) {
        return (
            <div className="flex-1 overflow-y-auto panel-scroll p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                    <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                </div>
            </div>
        );
    }

    const badge = STATUS_BADGE[request.status] || STATUS_BADGE.created;
    const offers = request.offers || [];
    const now = new Date();
    // Treat pending offers that have expired as non-actionable
    const pendingOffers = offers.filter((o) => o.status === "pending" && (!o.expiresAt || new Date(o.expiresAt) > now));
    const expiredPendingOffers = offers.filter((o) => o.status === "pending" && o.expiresAt && new Date(o.expiresAt) <= now);
    const otherOffers = [...offers.filter((o) => o.status !== "pending"), ...expiredPendingOffers];

    return (
        <div className="flex-1 overflow-y-auto panel-scroll">
            {/* Header section */}
            <div className="p-6 sm:p-8 border-b border-border-light dark:border-border-dark">
                <div className="flex items-start justify-between gap-3 mb-4">
                    <h2 className="text-xl font-bold text-text-main dark:text-white">
                        {request.serviceType}
                    </h2>
                    <div className="flex items-center gap-2 shrink-0">
                        {["created", "offers_received"].includes(request.status) && (
                            <button
                                onClick={() => window.location.href = `/customer/requests/new?edit=${request.id}`}
                                className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-primary border border-primary/30 rounded-full hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                            >
                                <MdEdit className="text-xs" />
                                Edit
                            </button>
                        )}
                        <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badge.bg}`}
                        >
                            {badge.label}
                            {request.status === "offers_received" && offers.length > 0
                                ? ` (${offers.length})`
                                : ""}
                        </span>
                    </div>
                </div>

                {/* Metadata chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {request.preferredDate && (
                        <span className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark text-sm text-text-main dark:text-white flex items-center gap-1.5">
                            <MdCalendarToday className="text-text-muted dark:text-gray-400" />
                            {formatDate(request.preferredDate)}
                        </span>
                    )}
                    {request.location && (
                        <span className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark text-sm text-text-main dark:text-white flex items-center gap-1.5">
                            <MdLocationOn className="text-text-muted dark:text-gray-400" />
                            {request.location}
                        </span>
                    )}
                </div>

                {/* Description */}
                {request.description && (
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted dark:text-gray-400 mb-1">
                            Description
                        </p>
                        <p className="text-sm text-text-main dark:text-gray-300 leading-relaxed">
                            {request.description}
                        </p>
                    </div>
                )}
            </div>

            {/* Offers section */}
            <div className="p-6 sm:p-8">
                <h3 className="text-sm font-bold text-text-main dark:text-white mb-4 flex items-center gap-2">
                    <MdVisibility className="text-base text-text-muted dark:text-gray-400" />
                    Available Offers
                </h3>

                {offers.length === 0 ? (
                    <div className="text-center py-8">
                        <MdSchedule className="text-4xl text-slate-200 dark:text-slate-700 mx-auto mb-2" />
                        <p className="text-text-muted dark:text-gray-400 text-sm">
                            No offers yet. Therapists in your area will be notified.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Pending offers first */}
                        {pendingOffers.map((offer) => (
                            <OfferCard
                                key={offer.id}
                                offer={offer}
                                isPending
                                accepting={accepting}
                                declining={declining}
                                changeOfferId={changeOfferId}
                                changeNote={changeNote}
                                changingOffer={changingOffer}
                                onAccept={onAccept}
                                onDecline={onDecline}
                                onRequestChange={onRequestChange}
                                onOpenChange={onOpenChange}
                                onCloseChange={onCloseChange}
                                onChangeNoteUpdate={onChangeNoteUpdate}
                            />
                        ))}
                        {/* Other offers */}
                        {otherOffers.map((offer) => (
                            <OfferCard key={offer.id} offer={offer} isPending={false} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Offer Card ─────────────────────────────────────────────

function OfferCard({
    offer,
    isPending,
    accepting,
    declining,
    changeOfferId,
    changeNote,
    changingOffer,
    onAccept,
    onDecline,
    onRequestChange,
    onOpenChange,
    onCloseChange,
    onChangeNoteUpdate,
}) {
    const therapist = offer.therapist;
    const isClientExpired = offer.status === "pending" && offer.expiresAt && new Date(offer.expiresAt) <= new Date();
    const displayStatus = isClientExpired ? "expired" : offer.status;
    const offerBadge = OFFER_STATUS_BADGE[displayStatus] || OFFER_STATUS_BADGE.pending;

    return (
        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm p-4">
            {/* Top row: avatar + info + rate */}
            <div className="flex items-start gap-3">
                {/* Avatar */}
                {therapist?.profilePhotoUrl ? (
                    <Image
                        src={therapist.profilePhotoUrl}
                        alt={therapist.fullName}
                        width={56}
                        height={56}
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                ) : (
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                        {therapist?.fullName?.charAt(0) || "?"}
                    </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h4 className="text-sm font-bold text-text-main dark:text-white">
                                {therapist?.fullName || "Therapist"}
                            </h4>
                            {therapist?.specialization && (
                                <p className="text-xs text-text-muted dark:text-gray-400 mt-0.5">
                                    {therapist.specialization}
                                </p>
                            )}
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-primary dark:text-blue-400 font-mono">
                                ${parseFloat(offer.rate).toFixed(2)}
                                <span className="text-xs text-text-muted dark:text-gray-400 font-sans font-normal">
                                    /session
                                </span>
                            </p>
                            {offer.sessionType && (
                                <span className="text-[10px] font-medium text-text-muted dark:text-gray-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full mt-1 inline-block">
                                    {formatSessionType(offer.sessionType)}
                                </span>
                            )}
                            {offer.visitType && (
                                <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full mt-1 inline-block">
                                    {offer.visitType.name} ({offer.visitType.code})
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Proposed date */}
            {offer.proposedDate && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 mt-3 text-xs text-text-muted dark:text-gray-400 flex items-center gap-1.5">
                    <MdCalendarToday className="text-sm" />
                    Proposed: {formatDateTime(offer.proposedDate)}
                </div>
            )}

            {/* Offer description */}
            {offer.description && (
                <p className="text-xs text-text-muted dark:text-gray-400 mt-2 leading-relaxed line-clamp-2">
                    {offer.description}
                </p>
            )}

            {/* Status badge — show for non-pending OR client-side expired */}
            {(!isPending || isClientExpired) && (
                <div className="mt-3">
                    <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${offerBadge.bg}`}
                    >
                        {offerBadge.label}
                    </span>
                    {isClientExpired && offer.expiresAt && (
                        <p className="text-xs text-text-muted dark:text-gray-400 mt-1.5">
                            Expired {formatDateTime(offer.expiresAt)}. The therapist can submit a new offer if still interested.
                        </p>
                    )}
                </div>
            )}

            {/* Action buttons (pending and not expired only) */}
            {isPending && !isClientExpired && (
                <div className="flex items-center gap-2 mt-4">
                    <button
                        onClick={() => onAccept(offer.id)}
                        disabled={accepting === offer.id}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {accepting === offer.id ? "Accepting..." : "Accept Offer"}
                    </button>
                    <button
                        onClick={() => onDecline(offer.id)}
                        disabled={declining === offer.id}
                        className="px-4 border border-red-300 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                    >
                        {declining === offer.id ? "..." : "Decline"}
                    </button>
                    <button
                        onClick={() => onOpenChange(offer.id)}
                        className="px-4 border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 py-2 rounded-lg text-xs font-bold transition-colors"
                    >
                        Request Change
                    </button>
                </div>
            )}

            {/* Inline change request form */}
            {isPending && !isClientExpired && changeOfferId === offer.id && (
                <div className="mt-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <label className="text-xs font-semibold text-amber-800 dark:text-amber-300 block mb-2">
                        What would you like to change?
                    </label>
                    <textarea
                        rows={2}
                        value={changeNote}
                        onChange={(e) => onChangeNoteUpdate(e.target.value)}
                        className="w-full text-sm rounded-lg bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 p-2 focus:ring-primary focus:outline-none resize-none text-text-main dark:text-white"
                        placeholder="Describe what you'd like changed..."
                    />
                    <p className={`text-xs mt-1 ${changeNote.trim().length > 0 && changeNote.trim().length < 10 ? "text-red-500" : "text-slate-400 dark:text-slate-500"}`}>
                        {changeNote.trim().length > 0 && changeNote.trim().length < 10
                            ? `${10 - changeNote.trim().length} more characters needed`
                            : "Min 10 characters"}
                    </p>

                    <div className="flex gap-2 mt-2 justify-end">
                        <button
                            onClick={onCloseChange}
                            className="text-sm text-slate-500 dark:text-slate-400 font-bold hover:text-text-main dark:hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onRequestChange(offer.id)}
                            disabled={changeNote.trim().length < 10 || changingOffer}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold disabled:opacity-50 transition-colors"
                        >
                            {changingOffer ? "Sending..." : "Send"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
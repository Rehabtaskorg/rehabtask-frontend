"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MdAdd, MdLocationOn, MdCalendarToday, MdSchedule, MdInfo } from "react-icons/md";
import { api } from "@/lib/api";
import { usePageTitle } from "@/hooks/usePageTitle";
import PatientBadge from "@/components/customer/PatientBadge";
import RequestDetailPanel from "@/components/customer/RequestDetailPanel";

// ─── Helpers ────────────────────────────────────────────────

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

const getServiceTypeStyle = (serviceType) => {
    const st = serviceType?.toLowerCase() || "";
    if (st.includes("physical") || st.includes("pt"))
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    if (st.includes("occupational") || st.includes("ot"))
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
    if (st.includes("speech") || st.includes("slp"))
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
    return "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300";
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
    offers_received: { bg: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400", label: "Offers Received" },
    offers_accepted: { bg: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400", label: "Accepted" },
    completed: { bg: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400", label: "Completed" },
    cancelled: { bg: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400", label: "Cancelled" },
};

export default function MyRequestsPage() {
    usePageTitle("My Requests");
    const router = useRouter();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("all");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [detailLoading] = useState(false);
    const [accepting, setAccepting] = useState(null);
    const [declining, setDeclining] = useState(null);
    const [changeOfferId, setChangeOfferId] = useState(null);
    const [changeNote, setChangeNote] = useState("");
    const [changingOffer, setChangingOffer] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [acceptedBooking, setAcceptedBooking] = useState(null);

    // ─── Data Fetching ──────────────────────────────────────

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

    useEffect(() => { fetchRequests(); }, [fetchRequests]);

    const fetchDetail = useCallback(async (id) => {
        try {
            const res = await api.get(`/requests/${id}`);
            setSelectedRequest(res.data.data);
        } catch (err) {
            console.error("Failed to fetch request detail:", err);
        }
    }, []);

    const handleSelectRequest = useCallback((req) => {
        setSelectedRequest(req);
        setChangeOfferId(null);
        setChangeNote("");
        setShowCancelConfirm(false);
        setAcceptedBooking(null);
        fetchDetail(req.id);
    }, [fetchDetail]);

    // ─── Filtering ──────────────────────────────────────────

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

    // ─── Offer Actions ──────────────────────────────────────

    const handleAccept = async (offerId) => {
        if (!window.confirm("Accept this offer? A booking will be created and you can pay when ready.")) return;
        setAccepting(offerId);
        try {
            const res = await api.post(`/offers/${offerId}/accept`);
            setAcceptedBooking(res.data.data.booking);
            if (selectedRequest?.id) await fetchDetail(selectedRequest.id);
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
    };

    const handleDecline = async (offerId) => {
        if (!window.confirm("Decline this offer?")) return;
        setDeclining(offerId);
        try {
            await api.post(`/offers/${offerId}/decline`);
            if (selectedRequest?.id) await fetchDetail(selectedRequest.id);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to decline offer.");
        } finally {
            setDeclining(null);
        }
    };

    const handleRequestChange = async (offerId) => {
        setChangingOffer(true);
        try {
            await api.post(`/offers/${offerId}/request-change`, { note: changeNote });
            setChangeOfferId(null);
            setChangeNote("");
            if (selectedRequest?.id) await fetchDetail(selectedRequest.id);
        } catch (err) {
            const errors = err.response?.data?.errors;
            const msg = errors?.[0]?.message || err.response?.data?.message || "Failed to send change request.";
            alert(msg);
        } finally {
            setChangingOffer(false);
        }
    };

    const handleCancelRequest = async () => {
        if (!selectedRequest) return;
        setCancelling(true);
        try {
            await api.post(`/requests/${selectedRequest.id}/cancel`);
            setShowCancelConfirm(false);
            const res = await api.get("/requests/my-requests");
            setRequests(res.data.data);
            setSelectedRequest(null);
        } catch (err) {
            alert("Error: " + (err.response?.data?.message || "Failed to cancel request"));
        } finally {
            setCancelling(false);
        }
    };

    // ─── Render ─────────────────────────────────────────────

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

            {/* Two-panel body — independent scroll */}
            <div className="flex-1 flex overflow-hidden">
                {/* ── LEFT PANEL: Request List ── */}
                <section className="w-full lg:w-[45%] flex flex-col overflow-hidden border-r-0 lg:border-r border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-background-dark">
                    {/* Filter tabs */}
                    <div className="flex flex-wrap items-center gap-2 px-4 sm:px-6 py-3 border-b border-border-light dark:border-border-dark bg-white dark:bg-card-dark shrink-0">
                        {FILTER_TABS.map((tab) => {
                            const isActive = activeFilter === tab.key;
                            const count = tab.showCount ? offersReceivedCount : null;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveFilter(tab.key)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${isActive
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

                    {/* Scrollable request list */}
                    <div className="flex-1 overflow-y-auto panel-scroll">
                        {loading ? (
                            <div className="animate-pulse space-y-3 p-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-28 bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark" />
                                ))}
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center py-16">
                                <div className="text-center space-y-3">
                                    <MdSchedule className="text-5xl text-slate-200 dark:text-slate-700 mx-auto" />
                                    <p className="text-text-muted dark:text-gray-400 text-sm">
                                        {requests.length === 0 ? "No requests yet." : "No requests match this filter."}
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
                                            onClick={() => {
                                                // Mobile: navigate to detail page. Desktop: open side panel.
                                                if (window.innerWidth < 1024) {
                                                    router.push(`/customer/requests/${req.id}`);
                                                } else {
                                                    handleSelectRequest(req);
                                                }
                                            }}
                                            className={`w-full text-left p-4 rounded-xl transition-all ${isSelected
                                                ? "border-l-4 border-l-primary border border-primary/20 bg-primary/5 dark:bg-primary/10 shadow-md"
                                                : "border border-border-light dark:border-border-dark bg-white dark:bg-card-dark hover:shadow-sm hover:border-slate-300 dark:hover:border-border-dark"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getServiceTypeStyle(req.serviceType)}`}>
                                                    {req.serviceType}
                                                </span>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${badge.bg}`}>
                                                    {badge.label}
                                                    {req.status === "offers_received" && offerCount > 0 ? ` (${offerCount})` : ""}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-text-muted dark:text-gray-400 mb-2">
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

                {/* ── RIGHT PANEL: Detail (desktop only) ── */}
                <section className="hidden lg:flex lg:flex-1 flex-col overflow-hidden bg-white dark:bg-card-dark">
                    {selectedRequest ? (
                        <>
                            {acceptedBooking && (
                                <div className="mx-6 mt-4 flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 shrink-0">
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
                            <RequestDetailPanel
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
                                onOpenChange={(id) => { setChangeOfferId(id); setChangeNote(""); }}
                                onCloseChange={() => { setChangeOfferId(null); setChangeNote(""); }}
                                onChangeNoteUpdate={setChangeNote}
                                showCancelConfirm={showCancelConfirm}
                                cancelling={cancelling}
                                onCancelRequest={handleCancelRequest}
                                onOpenCancel={() => setShowCancelConfirm(true)}
                                onCloseCancel={() => setShowCancelConfirm(false)}
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
            </div>
        </div>
    );
}

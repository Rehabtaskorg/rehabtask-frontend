"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MdAdd, MdSchedule, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { api } from "@/lib/api";
import { usePageTitle } from "@/hooks/usePageTitle";
import ExpandableRequestCard from "@/components/customer/ExpandableRequestCard";
import ConfirmModal from "@/components/ui/ConfirmModal";
import AcceptOfferModal from "@/components/customer/AcceptOfferModal";

const FILTER_TABS = [
    { key: "all", label: "All" },
    { key: "open", label: "Open", status: "created" },
    { key: "offers_received", label: "Offers Received", status: "offers_received" },
    { key: "accepted", label: "Accepted", status: "offers_accepted" },
    { key: "completed", label: "Completed", status: "completed" },
];

const PAGE_LIMIT = 15;

export default function MyRequestsPage() {
    usePageTitle("My Requests");
    const router = useRouter();

    const [requests, setRequests] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedId, setExpandedId] = useState(null);
    const [declining, setDeclining] = useState(null);
    const [changeOfferId, setChangeOfferId] = useState(null);
    const [changeNote, setChangeNote] = useState("");
    const [changingOffer, setChangingOffer] = useState(false);
    const [cancellingRequestId, setCancellingRequestId] = useState(null);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [acceptOfferTarget, setAcceptOfferTarget] = useState(null);

    // ─── Data Fetching ──────────────────────────────────────

    const fetchRequests = useCallback(async (filter, page) => {
        setLoading(true);
        try {
            const tab = FILTER_TABS.find((t) => t.key === filter);
            const params = { page, limit: PAGE_LIMIT };
            if (tab?.status) params.status = tab.status;
            const res = await api.get("/requests/my-requests", { params });
            const data = res.data.data;
            setRequests(data.requests || []);
            setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
        } catch (err) {
            console.error("Failed to fetch requests:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests(activeFilter, currentPage);
    }, [activeFilter, currentPage, fetchRequests]);

    const refreshExpandedRequest = useCallback(async (id) => {
        try {
            const res = await api.get(`/requests/${id}`);
            const updated = res.data.data;
            setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
        } catch (err) {
            console.error("Failed to refresh request:", err);
        }
    }, []);

    const handleFilterChange = (filterKey) => {
        setActiveFilter(filterKey);
        setCurrentPage(1);
        setExpandedId(null);
    };

    // ─── Expand / Collapse ──────────────────────────────────

    const handleToggle = useCallback((reqId) => {
        setExpandedId((prev) => {
            const next = prev === reqId ? null : reqId;
            if (next !== prev) {
                setChangeOfferId(null);
                setChangeNote("");
                setShowCancelConfirm(false);
                setCancellingRequestId(null);
            }
            return next;
        });
    }, []);

    // ─── Offer Actions ──────────────────────────────────────

    const handleAccept = (offer) => {
        setAcceptOfferTarget(offer);
    };

    const handleAccepted = useCallback(async () => {
        const reqId = expandedId;
        if (reqId) await refreshExpandedRequest(reqId);
    }, [expandedId, refreshExpandedRequest]);

    const handleDecline = (offerId) => {
        setConfirmAction({
            type: "decline",
            offerId,
            title: "Decline Offer",
            message: "The therapist will be notified that you declined. You can still receive new offers from other therapists.",
            confirmLabel: "Decline",
            confirmClassName: "bg-red-600 hover:bg-red-700 text-white",
        });
    };

    const executeConfirmAction = async () => {
        if (!confirmAction) return;
        const { type, offerId } = confirmAction;

        if (type === "decline") {
            setDeclining(offerId);
            try {
                await api.post(`/offers/${offerId}/decline`);
                if (expandedId) await refreshExpandedRequest(expandedId);
                setConfirmAction(null);
            } catch (err) {
                setConfirmAction(null);
                alert(err.response?.data?.message || "Failed to decline offer.");
            } finally {
                setDeclining(null);
            }
        } else if (type === "upgrade") {
            setConfirmAction(null);
            router.push("/customer/subscription");
        }
    };

    const handleRequestChange = async (offerId) => {
        setChangingOffer(true);
        try {
            await api.post(`/offers/${offerId}/request-change`, { note: changeNote });
            setChangeOfferId(null);
            setChangeNote("");
            if (expandedId) await refreshExpandedRequest(expandedId);
        } catch (err) {
            const errors = err.response?.data?.errors;
            alert(errors?.[0]?.message || err.response?.data?.message || "Failed to send change request.");
        } finally {
            setChangingOffer(false);
        }
    };

    const handleCancelRequest = async () => {
        const reqId = cancellingRequestId || expandedId;
        if (!reqId) return;
        setCancelling(true);
        try {
            await api.post(`/requests/${reqId}/cancel`);
            setShowCancelConfirm(false);
            setExpandedId(null);
            setCancellingRequestId(null);
            await fetchRequests(activeFilter, currentPage);
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
            <header className="h-16 border-b border-slate-200  bg-white/80  backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-4 sm:px-8 shrink-0">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-text-main ">
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

            {/* Sticky Filter Bar */}
            <div className="sticky top-16 z-[9] bg-white/95  backdrop-blur-md border-b border-border-light  px-4 sm:px-8 py-3 shrink-0">
                <div className="flex flex-wrap items-center justify-between gap-2 max-w-[900px] mx-auto">
                    <div className="flex flex-wrap gap-2">
                        {FILTER_TABS.map((tab) => {
                            const isActive = activeFilter === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => handleFilterChange(tab.key)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                                        isActive
                                            ? "bg-primary text-white shadow-sm"
                                            : "bg-slate-100  text-slate-600  hover:bg-slate-200 "
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                    {!loading && pagination.total > 0 && (
                        <span className="text-xs font-medium text-text-muted ">
                            {pagination.total} request{pagination.total !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>
            </div>

            {/* Scrollable Card Feed */}
            <div className="flex-1 overflow-y-auto panel-scroll">
                <div className="max-w-[900px] mx-auto px-4 sm:px-8 py-6">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-32 bg-white  rounded-xl border border-border-light  animate-pulse"
                                />
                            ))}
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center space-y-3">
                                <MdSchedule className="text-5xl text-slate-200  mx-auto" />
                                <p className="text-text-muted  text-sm">
                                    {activeFilter === "all" ? "No requests yet." : "No requests match this filter."}
                                </p>
                                {activeFilter === "all" && (
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
                        <div className="space-y-4">
                            {requests.map((req) => (
                                <ExpandableRequestCard
                                    key={req.id}
                                    request={req}
                                    isExpanded={expandedId === req.id}
                                    onToggle={() => handleToggle(req.id)}
                                    accepting={null}
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
                                    showCancelConfirm={showCancelConfirm && (cancellingRequestId === req.id || expandedId === req.id)}
                                    cancelling={cancelling}
                                    onCancelRequest={handleCancelRequest}
                                    onOpenCancel={() => { setCancellingRequestId(req.id); setShowCancelConfirm(true); }}
                                    onCloseCancel={() => { setShowCancelConfirm(false); setCancellingRequestId(null); }}
                                />
                            ))}

                            {pagination.totalPages > 1 && (
                                <div className="flex items-center justify-between pt-6 border-t border-border-light ">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="flex items-center gap-1 text-sm font-medium text-text-muted hover:text-primary disabled:opacity-30 transition-colors"
                                    >
                                        <MdChevronLeft className="text-lg" /> Previous
                                    </button>
                                    <span className="text-xs font-medium text-text-muted ">
                                        Page {currentPage} of {pagination.totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                                        disabled={currentPage === pagination.totalPages}
                                        className="flex items-center gap-1 text-sm font-medium text-text-muted hover:text-primary disabled:opacity-30 transition-colors"
                                    >
                                        Next <MdChevronRight className="text-lg" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={executeConfirmAction}
                title={confirmAction?.title || ""}
                message={confirmAction?.message || ""}
                confirmLabel={confirmAction?.confirmLabel || "Confirm"}
                confirmClassName={confirmAction?.confirmClassName}
                loading={!!declining}
            />

            <AcceptOfferModal
                isOpen={!!acceptOfferTarget}
                onClose={() => setAcceptOfferTarget(null)}
                offer={acceptOfferTarget}
                onAccepted={handleAccepted}
            />
        </div>
    );
}
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
    MdLocationOn, MdCalendarToday, MdSend,
    MdCheckCircle, MdRefresh, MdSchedule,
    MdChevronLeft, MdChevronRight,
} from "react-icons/md";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/hooks/useAuth";
import { useTherapistAccess } from "@/contexts/TherapistAccessContext";
import { REQUEST_TYPE } from "@/lib/constants";
import { useAnalytics } from "@/hooks/useAnalytics";
import { getCustomerLabel } from "@/utils/request";
import LockedPageOverlay from "@/components/therapist/LockedPageOverlay";
import TherapistRequestDetailPanel from "@/components/therapist/TherapistRequestDetailPanel";
import TherapistRequestFilters, { FilterToggleButton } from "@/components/therapist/TherapistRequestFilters";

// ─── Helpers ────────────────────────────────────────────────

const getServiceTypeStyle = (serviceType) => {
    const st = serviceType?.toLowerCase() || "";
    if (st.includes("physical") || st.includes("pt"))
        return "bg-blue-100 text-blue-700";
    if (st.includes("occupational") || st.includes("ot"))
        return "bg-purple-100 text-purple-700";
    if (st.includes("speech") || st.includes("slp"))
        return "bg-emerald-100 text-emerald-700";
    return "bg-slate-100 text-slate-700";
};

const timeAgo = (dateStr) => {
    if (!dateStr) return "—";
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return days === 1 ? "Yesterday" : `${days}d ago`;
};

const getMyOffer = (req) => req?.offers?.[0] ?? null;

const PAGE_LIMIT = 15;

export default function TherapistRequestsPage() {
    const { canAccessMarketplace } = useTherapistAccess();
    if (!canAccessMarketplace) return <LockedPageOverlay pageType="requests" />;
    return <TherapistRequestsContent />;
}

function TherapistRequestsContent() {
    usePageTitle("Browse Requests");
    const router = useRouter();
    const { trackEvent } = useAnalytics();
    const { user } = useAuth();
    const profileRate = user?.profile?.ratePerVisit ? parseFloat(user.profile.ratePerVisit).toFixed(2) : "";

    // ─── State ──────────────────────────────────────────────
    const [requests, setRequests] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState("newest");
    const [filters, setFilters] = useState({ show: "all", visitTypeIds: [], radiusMiles: 0 });
    const [committedFilters, setCommittedFilters] = useState({ show: "all", visitTypeIds: [], radiusMiles: 0 });
    const [showFilters, setShowFilters] = useState(false);
    const profileAttemptedRate = user?.profile?.attemptedVisitRate != null
        ? parseFloat(user.profile.attemptedVisitRate).toFixed(2) : '';
    const [offerData, setOfferData] = useState({
        rate: "", attemptedVisitRate: "", sessionType: "in-person", proposedDate: "", description: "", visitTypeId: "",
        planOverrideEnabled: false, visitType: "", visitsPerWeek: "", numberOfWeeks: "",
    });
    // visitTypes state removed — OfferForm now fetches its own via useVisitTypes hook
    const [submitting, setSubmitting] = useState(false);
    const [offerSuccess, setOfferSuccess] = useState(false);
    const [offerError, setOfferError] = useState("");
    const [commissionRate, setCommissionRate] = useState(null);

    // ─── Data Fetching (server-side filtered + paginated) ───
    // TODO: [NEXT] migrate fetchRequests to React Query — page uses raw axios + useState in violation of project conventions

    const fetchRequests = useCallback(async (appliedFilters, page) => {
        setLoading(true);
        try {
            const params = { page, limit: PAGE_LIMIT };
            if (appliedFilters.show !== "all") {
                params.show = appliedFilters.show;
            }
            if (appliedFilters.visitTypeIds.length > 0) {
                params.visitTypeIds = appliedFilters.visitTypeIds.join(",");
            }
            if (appliedFilters.radiusMiles > 0) {
                params.radiusMiles = appliedFilters.radiusMiles;
            }

            const res = await api.get("/requests/available", { params });
            const data = res.data.data;
            const fetched = data.requests || [];
            setRequests(fetched);
            setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
            trackEvent("request_list_viewed", { request_count: fetched.length });
        } catch {
            // non-fatal — list stays empty, user can retry via filter reset
        } finally {
            setLoading(false);
        }
    }, [trackEvent]);

    useEffect(() => {
        fetchRequests(committedFilters, currentPage);
    }, [committedFilters, currentPage, fetchRequests]);

    useEffect(() => {
        api.get("/payments/commission-rate").then((res) => setCommissionRate(res.data.data.rate)).catch(() => { });
    }, []);

    useEffect(() => {
        if (profileRate) setOfferData((prev) => ({ ...prev, rate: profileRate }));
    }, [profileRate]);

    useEffect(() => {
        if (profileAttemptedRate !== '') {
            setOfferData((prev) => prev.attemptedVisitRate === '' ? { ...prev, attemptedVisitRate: profileAttemptedRate } : prev);
        }
    }, [profileAttemptedRate]);

    // ─── Filter Actions ─────────────────────────────────────

    const applyFilters = () => {
        setCommittedFilters({ ...filters });
        setCurrentPage(1);
        setSelectedRequest(null);
    };

    const resetFilters = () => {
        const reset = { show: "all", visitTypeIds: [], radiusMiles: 0 };
        setFilters(reset);
        setCommittedFilters(reset);
        setCurrentPage(1);
        setSelectedRequest(null);
    };

    const toggleVisitType = (visitTypeId) => {
        setFilters((prev) => ({
            ...prev,
            visitTypeIds: prev.visitTypeIds.includes(visitTypeId)
                ? prev.visitTypeIds.filter((id) => id !== visitTypeId)
                : [...prev.visitTypeIds, visitTypeId],
        }));
    };

    const setRadius = (radiusMiles) => {
        setFilters((prev) => ({ ...prev, radiusMiles }));
    };

    const activeFilterCount =
        (committedFilters.show !== "all" ? 1 : 0) +
        (committedFilters.visitTypeIds.length > 0 ? 1 : 0) +
        (committedFilters.radiusMiles > 0 ? 1 : 0);

    // ─── Select Request ─────────────────────────────────────

    const handleSelectRequest = (req) => {
        setSelectedRequest(req);
        setOfferSuccess(false);
        setOfferError("");
        trackEvent("request_detail_viewed", {
            service_type: req.serviceType,
            request_type: req.requestType,
        });
        trackEvent("offer_form_started", { service_type: req.serviceType });
        if (req.preferredDate) {
            const d = new Date(req.preferredDate);
            const localDT = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            setOfferData({
                rate: profileRate, attemptedVisitRate: profileAttemptedRate, sessionType: "in-person", proposedDate: localDT, description: "", visitTypeId: "",
                planOverrideEnabled: false, visitType: "", visitsPerWeek: "", numberOfWeeks: "",
            });
        }
    };

    // ─── Submit Offer ───────────────────────────────────────

    const handleSubmitOffer = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setOfferError("");
        try {
            const attemptedTrim = String(offerData.attemptedVisitRate ?? "").trim();
            const attemptedNum = attemptedTrim === "" ? null : parseFloat(attemptedTrim);
            const createPayload = {
                requestId: selectedRequest.id,
                rate: parseFloat(offerData.rate),
                sessionType: offerData.sessionType,
                proposedDate: new Date(offerData.proposedDate).toISOString(),
                description: offerData.description,
                attemptedVisitRate: attemptedNum,
            };
            // Visit plan override — only include when toggle is on AND value filled.
            if (offerData.planOverrideEnabled) {
                if (offerData.visitTypeId) createPayload.visitTypeId = offerData.visitTypeId;
                if (offerData.visitsPerWeek) createPayload.visitsPerWeek = parseInt(offerData.visitsPerWeek, 10);
                if (offerData.numberOfWeeks) createPayload.numberOfWeeks = parseInt(offerData.numberOfWeeks, 10);
            }
            await api.post("/offers", createPayload);
            trackEvent("offer_sent", {
                service_type: selectedRequest.serviceType,
                session_type: offerData.sessionType,
                has_visit_type: !!offerData.visitTypeId,
            });
            setOfferSuccess(true);
            // Refresh list and update selected
            await fetchRequests(committedFilters, currentPage);
            const res = await api.get(`/requests/${selectedRequest.id}`);
            setSelectedRequest(res.data.data);
        } catch (error) {
            setOfferError(error.response?.data?.message || "Failed to send offer. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Revise Offer ───────────────────────────────────────

    const handleReviseOffer = async (e) => {
        e.preventDefault();
        const myOffer = getMyOffer(selectedRequest);
        if (!myOffer) return;
        setSubmitting(true);
        setOfferError("");
        try {
            // On revise, explicit `null` CLEARS a previous override. If the toggle
            // is off we always send nulls so the backend falls back to the request's plan.
            const revAttemptedTrim = String(offerData.attemptedVisitRate ?? "").trim();
            const revAttemptedNum = revAttemptedTrim === "" ? null : parseFloat(revAttemptedTrim);
            const revisePayload = {
                rate: parseFloat(offerData.rate),
                sessionType: offerData.sessionType,
                proposedDate: new Date(offerData.proposedDate).toISOString(),
                description: offerData.description,
                attemptedVisitRate: revAttemptedNum,
            };
            if (offerData.planOverrideEnabled) {
                revisePayload.visitTypeId = offerData.visitTypeId || null;
                revisePayload.visitsPerWeek = offerData.visitsPerWeek ? parseInt(offerData.visitsPerWeek, 10) : null;
                revisePayload.numberOfWeeks = offerData.numberOfWeeks ? parseInt(offerData.numberOfWeeks, 10) : null;
            } else {
                revisePayload.visitTypeId = null;
                revisePayload.visitsPerWeek = null;
                revisePayload.numberOfWeeks = null;
            }
            await api.put(`/offers/${myOffer.id}/revise`, revisePayload);
            setOfferSuccess(true);
            await fetchRequests(committedFilters, currentPage);
            const res = await api.get(`/requests/${selectedRequest.id}`);
            setSelectedRequest(res.data.data);
        } catch (error) {
            setOfferError(error.response?.data?.message || "Failed to update offer. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleMessageCustomer = (offerId) => router.push(`/therapist/messages?c=offer:${offerId}`);
    const handleSendNewOffer = () => setSelectedRequest({ ...selectedRequest, offers: [] });

    // ─── Loading ────────────────────────────────────────────

    if (loading && requests.length === 0) {
        return (
            <div className="flex h-full overflow-hidden">
                <div className="w-full lg:w-[45%] bg-slate-50  p-4 space-y-3 border-r border-border-light ">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="animate-pulse bg-white  rounded-xl p-4 h-32 border border-border-light " />
                    ))}
                </div>
                <div className="hidden lg:flex flex-1 bg-white  p-8 items-start">
                    <div className="animate-pulse space-y-4 w-full max-w-3xl">
                        <div className="h-8 bg-slate-200  rounded w-3/4" />
                        <div className="h-4 bg-slate-200  rounded w-1/2" />
                        <div className="h-32 bg-slate-200  rounded" />
                    </div>
                </div>
            </div>
        );
    }

    // ─── Render ─────────────────────────────────────────────

    return (
        <>
            <TherapistRequestFilters
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                filters={filters}
                onSetShow={(val) => setFilters((prev) => ({ ...prev, show: val }))}
                onToggleVisitType={toggleVisitType}
                onSetRadius={setRadius}
                onApply={applyFilters}
                onReset={resetFilters}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-14 border-b border-border-light  bg-white/80  backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 shrink-0">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-text-main ">Browse Requests</h2>
                        <span className="bg-slate-100  px-2.5 py-0.5 rounded-full text-xs font-bold text-text-muted ">
                            {pagination.total} found
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="text-sm border-none bg-transparent font-semibold text-primary focus:ring-0 cursor-pointer"
                        >
                            <option value="newest">Newest First</option>
                        </select>
                        <FilterToggleButton onClick={() => setShowFilters(true)} activeCount={activeFilterCount} />
                    </div>
                </header>

                {/* Two-panel body — independent scroll */}
                <div className="flex-1 flex overflow-hidden">
                    {/* ── LEFT PANEL: Request List ── */}
                    <section className="w-full lg:w-[45%] flex flex-col overflow-hidden border-r-0 lg:border-r border-border-light  bg-slate-50/50 ">
                        <div className={`flex-1 overflow-y-auto panel-scroll p-4 space-y-3 ${loading ? "opacity-60 pointer-events-none" : ""}`}>
                            {requests.length === 0 && !loading ? (
                                <div className="flex flex-col items-center justify-center h-48 text-center">
                                    <MdSchedule className="text-4xl text-slate-300  mb-3" />
                                    <p className="text-text-muted  font-medium">No requests match your filters</p>
                                    <button onClick={resetFilters} className="mt-2 text-sm text-primary font-semibold hover:underline">Reset filters</button>
                                </div>
                            ) : (
                                <>
                                    {requests.map((req) => {
                                        const isSelected = selectedRequest?.id === req.id;
                                        const myOffer = getMyOffer(req);
                                        const offerCount = req.offers?.length || 0;
                                        return (
                                            <button
                                                key={req.id}
                                                onClick={() => {
                                                    if (window.innerWidth < 1024) {
                                                        router.push(`/therapist/requests/${req.id}`);
                                                    } else {
                                                        handleSelectRequest(req);
                                                    }
                                                }}
                                                className={`w-full text-left p-4 rounded-2xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${isSelected
                                                    ? "border border-primary/20 bg-primary/[0.04] shadow-lg ring-2 ring-primary/30 ring-offset-0"
                                                    : "bg-white border border-border-light hover:shadow-lg hover:border-accent/40"
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] ${getServiceTypeStyle(req.serviceType)}`}>{req.serviceType}</span>
                                                        {req.requestType === REQUEST_TYPE.DIRECT && (
                                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] bg-accent/15 text-accent-strong">
                                                                Direct
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[11px] text-text-muted font-medium shrink-0 ml-2">{timeAgo(req.createdAt)}</span>
                                                </div>
                                                <h4 className="font-bold text-base text-primary leading-tight tracking-tight mb-0.5">
                                                    {getCustomerLabel(req.customer) || req.serviceType}
                                                </h4>
                                                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                                    {req.visitsPerWeek && req.numberOfWeeks && (
                                                        <div className="flex items-center gap-1 text-xs font-semibold text-accent-strong bg-accent/10 px-2 py-1 rounded-full">
                                                            <MdRefresh className="text-[13px]" />
                                                            {req.visitsPerWeek}x/week · {req.numberOfWeeks} weeks ({req.visitsPerWeek * req.numberOfWeeks} visits)
                                                        </div>
                                                    )}
                                                    {req.emr && (
                                                        <span className="text-[11px] font-semibold text-text-muted bg-slate-100 px-2 py-1 rounded-full truncate max-w-[140px]" title={req.emr}>
                                                            EMR: {req.emr}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-text-muted line-clamp-2 mb-2 leading-relaxed">{req.description}</p>
                                                {req.specialInstructions && (
                                                    <div className="pl-2.5 border-l-2 border-amber-300 mb-2">
                                                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-700 mb-0.5">
                                                            Special Instructions
                                                        </p>
                                                        <p className="text-xs text-text-muted line-clamp-1 leading-relaxed">
                                                            {req.specialInstructions}
                                                        </p>
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-light">
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex items-center gap-1 text-xs text-text-muted">
                                                            <MdLocationOn className="text-[15px] text-text-muted/70" /> {req.location ? "Nearby" : "—"}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-xs text-text-muted">
                                                            <MdCalendarToday className="text-[14px] text-text-muted/70" />
                                                            {req.preferredDate ? new Date(req.preferredDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Flexible"}
                                                        </span>
                                                    </div>
                                                    {myOffer ? (
                                                        <span className="text-xs font-bold text-accent-strong bg-accent/10 px-2 py-1 rounded-full flex items-center gap-1">
                                                            <MdCheckCircle className="text-[13px]" /> My Offer Sent
                                                        </span>
                                                    ) : offerCount > 0 ? (
                                                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">{offerCount} Offer{offerCount > 1 ? "s" : ""}</span>
                                                    ) : (
                                                        <span className="text-xs text-text-muted/80">No offers yet</span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}

                                    {/* Pagination */}
                                    {pagination.totalPages > 1 && (
                                        <div className="flex items-center justify-between pt-4 border-t border-border-light ">
                                            <button
                                                onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); setSelectedRequest(null); }}
                                                disabled={currentPage === 1}
                                                className="flex items-center gap-1 text-sm font-medium text-text-muted hover:text-primary disabled:opacity-30 transition-colors"
                                            >
                                                <MdChevronLeft className="text-lg" /> Prev
                                            </button>
                                            <span className="text-xs font-medium text-text-muted ">
                                                {currentPage} / {pagination.totalPages}
                                            </span>
                                            <button
                                                onClick={() => { setCurrentPage((p) => Math.min(pagination.totalPages, p + 1)); setSelectedRequest(null); }}
                                                disabled={currentPage === pagination.totalPages}
                                                className="flex items-center gap-1 text-sm font-medium text-text-muted hover:text-primary disabled:opacity-30 transition-colors"
                                            >
                                                Next <MdChevronRight className="text-lg" />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </section>

                    {/* ── RIGHT PANEL: Detail (desktop only) ── */}
                    <section className="hidden lg:flex flex-1 flex-col overflow-hidden bg-white ">
                        {!selectedRequest ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                                <div className="p-5 bg-primary/5 rounded-full mb-4">
                                    <MdSend className="text-3xl text-primary/40" />
                                </div>
                                <p className="font-semibold text-text-main ">Select a request</p>
                                <p className="text-sm text-text-muted  mt-1">Click any request to view details and send an offer</p>
                            </div>
                        ) : (
                            <TherapistRequestDetailPanel
                                request={selectedRequest}
                                myOffer={getMyOffer(selectedRequest)}
                                offerData={offerData}
                                setOfferData={setOfferData}
                                commissionRate={commissionRate}
                                submitting={submitting}
                                offerSuccess={offerSuccess}
                                offerError={offerError}
                                onSubmitOffer={handleSubmitOffer}
                                onReviseOffer={handleReviseOffer}
                                onMessageCustomer={handleMessageCustomer}
                                onSendNewOffer={handleSendNewOffer}
                                router={router}
                            />
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}

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
import LockedPageOverlay from "@/components/therapist/LockedPageOverlay";
import TherapistRequestDetailPanel from "@/components/therapist/TherapistRequestDetailPanel";
import TherapistRequestFilters, { FilterToggleButton } from "@/components/therapist/TherapistRequestFilters";

// ─── Helpers ────────────────────────────────────────────────

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
    const { user } = useAuth();
    const profileRate = user?.profile?.ratePerVisit ? parseFloat(user.profile.ratePerVisit).toFixed(2) : "";

    // ─── State ──────────────────────────────────────────────
    const [requests, setRequests] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState("newest");
    const [filters, setFilters] = useState({ serviceTypes: [], distance: "10", show: "all" });
    const [committedFilters, setCommittedFilters] = useState({ serviceTypes: [], distance: "10", show: "all" });
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

    const fetchRequests = useCallback(async (appliedFilters, page) => {
        setLoading(true);
        try {
            const params = { page, limit: PAGE_LIMIT };
            // Send service type as comma-separated for backend contains match
            if (appliedFilters.serviceTypes.length > 0) {
                params.serviceType = appliedFilters.serviceTypes.join(",");
            }
            if (appliedFilters.show !== "all") {
                params.show = appliedFilters.show;
            }

            const res = await api.get("/requests/available", { params });
            const data = res.data.data;
            setRequests(data.requests || []);
            setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests(committedFilters, currentPage);
    }, [committedFilters, currentPage, fetchRequests]);

    useEffect(() => {
        api.get("/payments/commission-rate").then((res) => setCommissionRate(res.data.data.rate)).catch(() => {});
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

    const toggleServiceType = (val) => {
        setFilters((prev) => ({
            ...prev,
            serviceTypes: prev.serviceTypes.includes(val)
                ? prev.serviceTypes.filter((v) => v !== val)
                : [...prev.serviceTypes, val],
        }));
    };

    const applyFilters = () => {
        setCommittedFilters({ ...filters });
        setCurrentPage(1);
        setSelectedRequest(null);
    };

    const resetFilters = () => {
        const reset = { serviceTypes: [], distance: "10", show: "all" };
        setFilters(reset);
        setCommittedFilters(reset);
        setCurrentPage(1);
        setSelectedRequest(null);
    };

    const activeFilterCount = committedFilters.serviceTypes.length + (committedFilters.show !== "all" ? 1 : 0);

    // ─── Select Request ─────────────────────────────────────

    const handleSelectRequest = (req) => {
        setSelectedRequest(req);
        setOfferSuccess(false);
        setOfferError("");
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
                <div className="w-full lg:w-[45%] bg-slate-50 dark:bg-background-dark p-4 space-y-3 border-r border-border-light dark:border-border-dark">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="animate-pulse bg-white dark:bg-card-dark rounded-xl p-4 h-32 border border-border-light dark:border-border-dark" />
                    ))}
                </div>
                <div className="hidden lg:flex flex-1 bg-white dark:bg-card-dark p-8 items-start">
                    <div className="animate-pulse space-y-4 w-full max-w-3xl">
                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                        <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded" />
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
                onToggleServiceType={toggleServiceType}
                onSetShow={(val) => setFilters((prev) => ({ ...prev, show: val }))}
                onSetDistance={(val) => setFilters((prev) => ({ ...prev, distance: val }))}
                onApply={applyFilters}
                onReset={resetFilters}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-14 border-b border-border-light dark:border-border-dark bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 shrink-0">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-text-main dark:text-white">Browse Requests</h2>
                        <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full text-xs font-bold text-text-muted dark:text-gray-400">
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
                            <option value="distance">Distance</option>
                        </select>
                        <FilterToggleButton onClick={() => setShowFilters(true)} activeCount={activeFilterCount} />
                    </div>
                </header>

                {/* Two-panel body — independent scroll */}
                <div className="flex-1 flex overflow-hidden">
                    {/* ── LEFT PANEL: Request List ── */}
                    <section className="w-full lg:w-[45%] flex flex-col overflow-hidden border-r-0 lg:border-r border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-background-dark">
                        <div className={`flex-1 overflow-y-auto panel-scroll p-4 space-y-3 ${loading ? "opacity-60 pointer-events-none" : ""}`}>
                            {requests.length === 0 && !loading ? (
                                <div className="flex flex-col items-center justify-center h-48 text-center">
                                    <MdSchedule className="text-4xl text-slate-300 dark:text-slate-600 mb-3" />
                                    <p className="text-text-muted dark:text-gray-400 font-medium">No requests match your filters</p>
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
                                                className={`w-full text-left p-4 rounded-xl transition-all ${isSelected
                                                    ? "border-l-4 border-l-primary border border-primary/20 bg-primary/5 dark:bg-primary/10 shadow-md"
                                                    : "bg-white dark:bg-card-dark border border-border-light dark:border-border-dark hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
                                                }`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getServiceTypeStyle(req.serviceType)}`}>{req.serviceType}</span>
                                                    <span className="text-[11px] text-text-muted dark:text-gray-400 font-medium shrink-0 ml-2">{timeAgo(req.createdAt)}</span>
                                                </div>
                                                <h4 className="font-bold text-text-main dark:text-white mb-1 leading-tight line-clamp-1">{req.description?.split("\n")[0] || req.serviceType}</h4>
                                                <p className="text-sm text-text-muted dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">{req.description}</p>
                                                {/* Patient identity hidden from therapist — visible only after booking */}
                                                {req.visitsPerWeek && req.numberOfWeeks && (
                                                    <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md mb-2 w-fit">
                                                        <MdRefresh className="text-[13px]" />
                                                        {req.visitsPerWeek}x/week · {req.numberOfWeeks} weeks ({req.visitsPerWeek * req.numberOfWeeks} visits)
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex items-center gap-1 text-xs text-text-muted dark:text-gray-400">
                                                            <MdLocationOn className="text-[15px]" /> {req.location ? "Nearby" : "—"}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-xs text-text-muted dark:text-gray-400">
                                                            <MdCalendarToday className="text-[14px]" />
                                                            {req.preferredDate ? new Date(req.preferredDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Flexible"}
                                                        </span>
                                                    </div>
                                                    {myOffer ? (
                                                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded flex items-center gap-1">
                                                            <MdCheckCircle className="text-[13px]" /> My Offer Sent
                                                        </span>
                                                    ) : offerCount > 0 ? (
                                                        <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">{offerCount} Offer{offerCount > 1 ? "s" : ""}</span>
                                                    ) : (
                                                        <span className="text-xs text-text-muted dark:text-gray-400 italic">No offers yet</span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}

                                    {/* Pagination */}
                                    {pagination.totalPages > 1 && (
                                        <div className="flex items-center justify-between pt-4 border-t border-border-light dark:border-border-dark">
                                            <button
                                                onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); setSelectedRequest(null); }}
                                                disabled={currentPage === 1}
                                                className="flex items-center gap-1 text-sm font-medium text-text-muted hover:text-primary disabled:opacity-30 transition-colors"
                                            >
                                                <MdChevronLeft className="text-lg" /> Prev
                                            </button>
                                            <span className="text-xs font-medium text-text-muted dark:text-gray-400">
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
                    <section className="hidden lg:flex flex-1 flex-col overflow-hidden bg-white dark:bg-card-dark">
                        {!selectedRequest ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                                <div className="p-5 bg-primary/5 rounded-full mb-4">
                                    <MdSend className="text-3xl text-primary/40" />
                                </div>
                                <p className="font-semibold text-text-main dark:text-white">Select a request</p>
                                <p className="text-sm text-text-muted dark:text-gray-400 mt-1">Click any request to view details and send an offer</p>
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
                                onClose={() => setSelectedRequest(null)}
                                router={router}
                            />
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}

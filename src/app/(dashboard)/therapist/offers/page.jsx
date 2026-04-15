"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    MdAdd,
    MdWarning,
    MdArrowForward,
    MdTimer,
    MdCheckCircle,
    MdLocationOn,
    MdCalendarToday,
    MdChatBubble,
    MdSend,
} from "react-icons/md";
import { useMyOffers } from "@/hooks/useOffers";
import { offersApi } from "@/lib/offers";
import { formatCurrency } from "@/utils/messages";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useTherapistAccess } from "@/contexts/TherapistAccessContext";
import LockedPageOverlay from "@/components/therapist/LockedPageOverlay";

// ─── Helpers ────────────────────────────────────────────────

const timeAgo = (dateStr) => {
    if (!dateStr) return "—";
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return days === 1 ? "Yesterday" : `${days}d ago`;
};

const getExpiryLabel = (expiresAt) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `Expires in ${hours}h ${mins}m`;
};

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const formatSessionType = (type) => {
    if (!type) return "—";
    return type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

// ─── Constants ──────────────────────────────────────────────

const STATUS_TABS = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "change_requested", label: "Change Requested" },
    { key: "accepted", label: "Accepted" },
    { key: "rejected", label: "Declined" },
    { key: "expired", label: "Expired" },
    { key: "withdrawn", label: "Withdrawn" },
];

const BADGE_STYLES = {
    pending: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400",
    change_requested: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400",
    accepted: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400",
    rejected: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400",
    expired: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
    withdrawn: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
};

const BADGE_LABELS = {
    pending: "Pending",
    change_requested: "Change Requested",
    accepted: "Accepted",
    rejected: "Declined",
    expired: "Expired",
    withdrawn: "Withdrawn",
};

// ─── Page Component ─────────────────────────────────────────

export default function MyOffersPage() {
    const { canAccessMarketplace } = useTherapistAccess();
    if (!canAccessMarketplace) return <LockedPageOverlay pageType="offers" />;
    return <MyOffersContent />;
}

function MyOffersContent() {
    usePageTitle("My Offers");
    const router = useRouter();
    const { offers, loading, error, refetch } = useMyOffers();

    const [activeTab, setActiveTab] = useState("all");
    const [reviseOpenId, setReviseOpenId] = useState(null);
    const [reviseData, setReviseData] = useState({ rate: "", attemptedVisitRate: "", sessionType: "in-person", proposedDate: "", description: "" });
    const [withdrawingIds, setWithdrawingIds] = useState(new Set());
    const [revising, setRevising] = useState(false);
    const [reviseError, setReviseError] = useState("");

    // ─── Derived data ───────────────────────────────────────

    const counts = useMemo(() => {
        const c = { all: offers.length, pending: 0, change_requested: 0, accepted: 0, rejected: 0, expired: 0, withdrawn: 0 };
        offers.forEach((o) => {
            if (c[o.status] !== undefined) c[o.status]++;
        });
        return c;
    }, [offers]);

    const filteredOffers = useMemo(() => {
        if (activeTab === "all") return offers;
        return offers.filter((o) => o.status === activeTab);
    }, [offers, activeTab]);

    const changeRequestedCount = counts.change_requested;

    // ─── Handlers ───────────────────────────────────────────

    const handleWithdraw = async (offerId) => {
        if (!window.confirm("Are you sure you want to withdraw this offer?")) return;
        setWithdrawingIds((prev) => new Set(prev).add(offerId));
        try {
            await offersApi.withdrawOffer(offerId);
            await refetch();
        } catch (err) {
            alert("Failed to withdraw offer. Please try again.");
        } finally {
            setWithdrawingIds((prev) => {
                const next = new Set(prev);
                next.delete(offerId);
                return next;
            });
        }
    };

    const openReviseForm = (offer) => {
        setReviseOpenId(offer.id);
        setReviseError("");
        setReviseData({
            rate: parseFloat(offer.rate) || "",
            attemptedVisitRate: offer.attemptedVisitRate != null ? parseFloat(offer.attemptedVisitRate) : "",
            sessionType: offer.sessionType || "in-person",
            proposedDate: offer.proposedDate ? new Date(offer.proposedDate).toISOString().slice(0, 16) : "",
            description: offer.description || "",
        });
    };

    const closeReviseForm = () => {
        setReviseOpenId(null);
        setReviseError("");
    };

    const handleReviseSubmit = async (offerId) => {
        setRevising(true);
        setReviseError("");
        try {
            const rateNum = parseFloat(reviseData.rate);
            const attemptedTrim = String(reviseData.attemptedVisitRate ?? "").trim();
            const attemptedNum = attemptedTrim === "" ? null : parseFloat(attemptedTrim);
            if (attemptedNum != null && attemptedNum > rateNum) {
                setReviseError("Attempted visit rate cannot be greater than the session rate.");
                setRevising(false);
                return;
            }
            await offersApi.reviseOffer(offerId, {
                rate: rateNum,
                sessionType: reviseData.sessionType,
                proposedDate: new Date(reviseData.proposedDate).toISOString(),
                description: reviseData.description,
                attemptedVisitRate: attemptedNum,
            });
            closeReviseForm();
            await refetch();
        } catch (err) {
            setReviseError(err?.response?.data?.message || "Failed to revise offer. Please try again.");
        } finally {
            setRevising(false);
        }
    };

    // ─── Loading state ──────────────────────────────────────

    if (loading) {
        return (
            <>
                <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-14 lg:top-0 z-10 flex items-center justify-between px-8">
                    <h2 className="text-2xl font-black tracking-tight text-text-main dark:text-white">My Offers</h2>
                </header>
                <div className="p-4 md:p-6">
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-36 bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark"
                            />
                        ))}
                    </div>
                </div>
            </>
        );
    }

    // ─── Error state ────────────────────────────────────────

    if (error) {
        return (
            <>
                <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-14 lg:top-0 z-10 flex items-center justify-between px-8">
                    <h2 className="text-2xl font-black tracking-tight text-text-main dark:text-white">My Offers</h2>
                </header>
                <div className="p-4 md:p-6 text-center py-16">
                    <p className="text-red-500 text-sm font-medium">Failed to load offers. Please try again later.</p>
                    <button onClick={() => refetch()} className="mt-4 text-primary hover:underline text-sm font-bold">
                        Retry
                    </button>
                </div>
            </>
        );
    }

    // ─── Render ─────────────────────────────────────────────

    return (
        <>
            {/* Sticky Header */}
            <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-14 lg:top-0 z-10 flex items-center justify-between px-8">
                <h2 className="text-2xl font-black tracking-tight text-text-main dark:text-white">My Offers</h2>
                <button
                    onClick={() => router.push("/therapist/requests")}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                >
                    <MdAdd className="text-lg" />
                    Create Offer
                </button>
            </header>

            <div className="p-4 md:p-6 space-y-6">
                {/* Action Required Banner */}
                {changeRequestedCount > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-4 rounded-xl flex items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <MdWarning className="text-amber-600 text-xl mt-0.5 shrink-0" />
                            <div>
                                <p className="text-amber-900 dark:text-amber-100 font-bold text-sm">
                                    {changeRequestedCount} offer{changeRequestedCount !== 1 ? "s" : ""} have change requests from customers
                                </p>
                                <p className="text-amber-800/80 dark:text-amber-400 text-sm mt-0.5">
                                    Review and update them to improve your acceptance rate.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setActiveTab("change_requested")}
                            className="bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-100 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors"
                        >
                            Show Change Requests
                            <MdArrowForward />
                        </button>
                    </div>
                )}

                {/* Status Filter Tabs */}
                <div className="flex flex-wrap items-center gap-2 pb-2">
                    {STATUS_TABS.map((tab) => {
                        const isActive = activeTab === tab.key;
                        const count = counts[tab.key];
                        const isChangeReq = tab.key === "change_requested";

                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive
                                    ? "bg-primary text-white"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                    }`}
                            >
                                {tab.label} ({count})
                                {isChangeReq && count > 0 && (
                                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Offer Cards */}
                {filteredOffers.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-text-muted dark:text-gray-400 text-sm">No offers found.</p>
                        <button
                            onClick={() => router.push("/therapist/requests")}
                            className="mt-4 text-primary hover:underline text-sm font-bold"
                        >
                            Browse Requests
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOffers.map((offer) => (
                            <OfferCard
                                key={offer.id}
                                offer={offer}
                                router={router}
                                withdrawingIds={withdrawingIds}
                                onWithdraw={handleWithdraw}
                                reviseOpenId={reviseOpenId}
                                reviseData={reviseData}
                                setReviseData={setReviseData}
                                onOpenRevise={openReviseForm}
                                onCloseRevise={closeReviseForm}
                                onSubmitRevise={handleReviseSubmit}
                                revising={revising}
                                reviseError={reviseError}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

// ─── Offer Card (inline component) ─────────────────────────

function OfferCard({
    offer,
    router,
    withdrawingIds,
    onWithdraw,
    reviseOpenId,
    reviseData,
    setReviseData,
    onOpenRevise,
    onCloseRevise,
    onSubmitRevise,
    revising,
    reviseError,
}) {
    const request = offer.request;
    const customer = request?.customer;
    const customerLabel = customer?.customerType === "individual" ? "Individual" : "Agency";
    const isWithdrawing = withdrawingIds.has(offer.id);
    const isReviseOpen = reviseOpenId === offer.id;

    return (
        <div>
            <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* ── Left Column ── */}
                    <div className="lg:col-span-7 flex flex-col gap-3">
                        {/* Title + Badge */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-base font-bold text-text-main dark:text-white">
                                {request?.serviceType || "Service"}{" "}
                                <span className="text-slate-400 font-normal">for {customerLabel}</span>
                            </h3>
                            <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${BADGE_STYLES[offer.status] || BADGE_STYLES.expired
                                    }`}
                            >
                                {BADGE_LABELS[offer.status] || offer.status}
                            </span>
                        </div>

                        {/* Description (change_requested only) */}
                        {offer.status === "change_requested" && offer.description && (
                            <p className="text-sm text-text-muted dark:text-gray-400 line-clamp-2">{offer.description}</p>
                        )}

                        {/* Metadata Row */}
                        <div className="flex items-center flex-wrap text-sm text-text-muted dark:text-gray-400">
                            <span className="font-mono text-primary dark:text-blue-400 text-sm mr-4">
                                {formatCurrency(parseFloat(offer.rate))}/session
                            </span>
                            <span className="border-l border-slate-200 dark:border-border-dark px-4">
                                {formatSessionType(offer.sessionType)}
                            </span>
                            <span className="border-l border-slate-200 dark:border-border-dark px-4 flex items-center gap-1">
                                <MdCalendarToday className="text-xs" />
                                {formatDate(offer.proposedDate)}
                            </span>
                            <span className="border-l border-slate-200 dark:border-border-dark px-4 flex items-center gap-1">
                                <MdSend className="text-xs" />
                                Sent {timeAgo(offer.createdAt)}
                            </span>
                            {request?.location && (
                                <span className="border-l border-slate-200 dark:border-border-dark px-4 flex items-center gap-1">
                                    <MdLocationOn className="text-xs" />
                                    {request.location}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* ── Right Column ── */}
                    <div className="lg:col-span-5 flex flex-col items-end justify-center gap-3">
                        {/* PENDING */}
                        {offer.status === "pending" && (
                            <>
                                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-sm">
                                    <MdTimer className="text-base" />
                                    {getExpiryLabel(offer.expiresAt)}
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => router.push("/therapist/requests")}
                                        className="text-slate-400 hover:text-primary text-sm font-bold transition-colors"
                                    >
                                        View Request
                                    </button>
                                    <button
                                        onClick={() => onWithdraw(offer.id)}
                                        disabled={isWithdrawing}
                                        className="border border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 px-6 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isWithdrawing ? "Withdrawing..." : "Withdraw"}
                                    </button>
                                </div>
                            </>
                        )}

                        {/* CHANGE REQUESTED */}
                        {offer.status === "change_requested" && (
                            <>
                                {offer.changeRequestNote && (
                                    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4 rounded-r-lg w-full">
                                        <p className="text-xs text-amber-800 dark:text-amber-300 italic font-medium flex items-start gap-2">
                                            <MdChatBubble className="text-sm mt-0.5 shrink-0" />
                                            &ldquo;{offer.changeRequestNote}&rdquo;
                                        </p>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => onWithdraw(offer.id)}
                                        disabled={isWithdrawing}
                                        className="text-red-500 hover:text-red-600 text-sm font-bold transition-colors disabled:opacity-50"
                                    >
                                        {isWithdrawing ? "Withdrawing..." : "Withdraw"}
                                    </button>
                                    <button
                                        onClick={() => onOpenRevise(offer)}
                                        className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors"
                                    >
                                        Update Offer
                                    </button>
                                </div>
                            </>
                        )}

                        {/* ACCEPTED */}
                        {offer.status === "accepted" && (
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                                    <MdCheckCircle className="text-base" />
                                    Accepted
                                </span>
                                <button
                                    onClick={() => router.push("/therapist/bookings")}
                                    className="text-primary hover:underline text-sm font-bold flex items-center gap-1 transition-colors"
                                >
                                    View Booking
                                    <MdArrowForward />
                                </button>
                            </div>
                        )}

                        {/* REJECTED */}
                        {offer.status === "rejected" && (
                            <p className="text-text-muted dark:text-gray-400 text-sm">No further action needed</p>
                        )}

                        {/* EXPIRED */}
                        {offer.status === "expired" && (
                            <p className="text-text-muted dark:text-gray-400 text-sm">No further action needed</p>
                        )}

                        {/* WITHDRAWN */}
                        {offer.status === "withdrawn" && (
                            <p className="text-text-muted dark:text-gray-400 text-sm">No further action needed</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Revise Form (inline below card) ── */}
            {isReviseOpen && (
                <div className="bg-background-light dark:bg-background-dark rounded-xl p-5 mt-4 border border-border-light dark:border-border-dark">
                    <h4 className="text-sm font-bold text-text-main dark:text-white mb-4">Update Your Offer</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Rate */}
                        <div>
                            <label className="block text-xs font-medium text-text-muted dark:text-gray-400 mb-1">
                                Rate ($)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={reviseData.rate}
                                onChange={(e) => setReviseData((d) => ({ ...d, rate: e.target.value }))}
                                className="w-full bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg px-3 py-2 text-sm text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* Attempted Visit Rate */}
                        <div>
                            <label className="block text-xs font-medium text-text-muted dark:text-gray-400 mb-1">
                                Attempted Visit Rate ($) — optional
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max={reviseData.rate || 10000}
                                placeholder="Blank = no charge"
                                value={reviseData.attemptedVisitRate}
                                onChange={(e) => setReviseData((d) => ({ ...d, attemptedVisitRate: e.target.value }))}
                                className="w-full bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg px-3 py-2 text-sm text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <p className="mt-1 text-[10px] text-text-muted dark:text-gray-500">Charged when patient isn&apos;t home. Must be ≤ rate.</p>
                        </div>

                        {/* Session Type */}
                        <div>
                            <label className="block text-xs font-medium text-text-muted dark:text-gray-400 mb-1">
                                Session Type
                            </label>
                            <select
                                value={reviseData.sessionType}
                                onChange={(e) => setReviseData((d) => ({ ...d, sessionType: e.target.value }))}
                                className="w-full bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg px-3 py-2 text-sm text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="in-person">In Person</option>
                                <option value="virtual">Virtual</option>
                            </select>
                        </div>

                        {/* Proposed Date */}
                        <div>
                            <label className="block text-xs font-medium text-text-muted dark:text-gray-400 mb-1">
                                Proposed Date
                            </label>
                            <input
                                type="datetime-local"
                                value={reviseData.proposedDate}
                                onChange={(e) => setReviseData((d) => ({ ...d, proposedDate: e.target.value }))}
                                className="w-full bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg px-3 py-2 text-sm text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mt-4">
                        <label className="block text-xs font-medium text-text-muted dark:text-gray-400 mb-1">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            value={reviseData.description}
                            onChange={(e) => setReviseData((d) => ({ ...d, description: e.target.value }))}
                            className="w-full bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg px-3 py-2 text-sm text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        />
                    </div>

                    {/* Error */}
                    {reviseError && <p className="text-red-500 text-xs mt-2">{reviseError}</p>}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 mt-4">
                        <button
                            onClick={onCloseRevise}
                            disabled={revising}
                            className="text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white text-sm font-bold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onSubmitRevise(offer.id)}
                            disabled={revising}
                            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {revising ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Submitting...
                                </>
                            ) : (
                                "Submit Revision"
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
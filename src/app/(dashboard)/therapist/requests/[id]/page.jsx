"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
    MdArrowBack, MdLocationOn, MdCheckCircle, MdWarning, MdError,
    MdCalendarToday, MdAccessTime, MdPerson, MdInfo, MdChat,
    MdVideocam, MdPersonPin, MdSend, MdSchedule, MdClose
} from "react-icons/md";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/hooks/useAuth";
import { useVisitTypes } from "@/hooks/useVisitTypes";
import PatientInfoBlock from "@/components/customer/PatientInfoBlock";

const STATUS_STYLES = {
    created: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    offers_received: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    offers_accepted: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

export default function TherapistRequestDetailPage() {
    usePageTitle("Request Details");
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const profileRate = user?.profile?.ratePerVisit ? parseFloat(user.profile.ratePerVisit).toFixed(2) : '';
    const profileAttemptedRate = user?.profile?.attemptedVisitRate != null
        ? parseFloat(user.profile.attemptedVisitRate).toFixed(2)
        : '';
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commissionRate, setCommissionRate] = useState(null);
    // visitTypes state removed — OfferForm fetches its own via useVisitTypes hook
    const [offerData, setOfferData] = useState({
        rate: "",
        attemptedVisitRate: "",
        sessionType: "in-person",
        visitTypeId: "",
        proposedDate: "",
        description: "",
        planOverrideEnabled: false,
        visitsPerWeek: "",
        numberOfWeeks: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [offerSuccess, setOfferSuccess] = useState(false);
    const [offerError, setOfferError] = useState(null);

    // Visit types for the override dropdown — filtered by the REQUEST's discipline
    const { data: overrideVisitTypes = [] } = useVisitTypes({
        serviceType: request?.serviceType,
        audience: "therapist",
    });

    const fetchRequest = async () => {
        try {
            const res = await api.get(`/requests/${params.id}`);
            setRequest(res.data.data);

            // Pre-fill proposed date
            if (res.data.data.preferredDate) {
                const date = new Date(res.data.data.preferredDate);
                const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 16);
                setOfferData(prev => ({ ...prev, proposedDate: localDateTime }));
            }

            // Rate pre-fill is handled by a separate effect (avoids race condition with auth loading)
        } catch (error) {
            console.error("Error fetching request:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequest();
        api.get("/payments/commission-rate").then(res => {
            setCommissionRate(res.data.data.rate);
        }).catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    // Pre-fill rate: profile rate > request rate > empty
    // Single effect handles both sources to avoid race conditions
    useEffect(() => {
        if (profileRate) {
            setOfferData(prev => ({ ...prev, rate: profileRate }));
        } else if (request?.rate) {
            setOfferData(prev => ({ ...prev, rate: parseFloat(request.rate).toFixed(2) }));
        }
    }, [profileRate, request]);

    useEffect(() => {
        if (profileAttemptedRate !== '') {
            setOfferData(prev => prev.attemptedVisitRate === '' ? { ...prev, attemptedVisitRate: profileAttemptedRate } : prev);
        }
    }, [profileAttemptedRate]);

    const handleSubmitOffer = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setOfferError(null);

        try {
            const rateNum = parseFloat(offerData.rate);
            const attemptedTrim = String(offerData.attemptedVisitRate ?? "").trim();
            const attemptedNum = attemptedTrim === "" ? null : parseFloat(attemptedTrim);

            if (attemptedNum != null && attemptedNum > rateNum) {
                setOfferError("Attempted visit rate cannot be greater than the session rate.");
                setSubmitting(false);
                return;
            }

            const payload = {
                requestId: params.id,
                rate: rateNum,
                sessionType: offerData.sessionType,
                proposedDate: new Date(offerData.proposedDate).toISOString(),
                description: offerData.description,
                attemptedVisitRate: attemptedNum,
            };

            // Visit plan override — only include when toggle is on AND value filled.
            if (offerData.planOverrideEnabled) {
                if (offerData.visitTypeId) payload.visitTypeId = offerData.visitTypeId;
                if (offerData.visitsPerWeek) payload.visitsPerWeek = parseInt(offerData.visitsPerWeek, 10);
                if (offerData.numberOfWeeks) payload.numberOfWeeks = parseInt(offerData.numberOfWeeks, 10);
            }

            await api.post("/offers", payload);
            setOfferSuccess(true);
            fetchRequest();
        } catch (error) {
            setOfferError(error.response?.data?.message || "Failed to send offer");
        } finally {
            setSubmitting(false);
        }
    };

    const getMyOffer = () => {
        return request?.offers?.find(o => o.isMyOffer) || (request?.offers?.length > 0 ? request.offers[0] : null);
    };

    const handleMessageCustomer = () => {
        const myOffer = getMyOffer();
        if (myOffer) router.push(`/therapist/messages?c=offer:${myOffer.id}`);
    };

    const earnPercentage = commissionRate !== null ? Math.round((1 - commissionRate) * 100) : 90;
    const earnAmount = offerData.rate ? (parseFloat(offerData.rate) * (1 - (commissionRate || 0.1))).toFixed(2) : null;

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
                        <div className="lg:col-span-4">
                            <div className="h-96 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl" />
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
                    <button onClick={() => router.push("/therapist/requests")} className="mt-3 text-sm text-primary font-bold hover:underline">
                        Back to Browse Requests
                    </button>
                </div>
            </div>
        );
    }

    const myOffer = getMyOffer();
    // Allow resubmit if the previous offer was rejected, withdrawn, or expired
    const offerIsTerminal = myOffer && ["rejected", "withdrawn", "expired"].includes(myOffer.status);
    const canSendOffer = request.status !== "offers_accepted" && (!myOffer || offerIsTerminal) && !offerSuccess;
    const isOpen = ["created", "offers_received"].includes(request.status);

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
            {/* Back link */}
            <button
                onClick={() => router.push("/therapist/requests")}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors mb-6"
            >
                <MdArrowBack className="text-base" />
                Back to Browse Requests
            </button>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-main dark:text-white">
                            {request.serviceType}
                        </h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isOpen
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : STATUS_STYLES[request.status] || "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}>
                            {isOpen ? "Open" : request.status === "offers_accepted" ? "Closed" : request.status.replace(/_/g, " ")}
                        </span>
                    </div>
                    <p className="text-text-muted dark:text-gray-400 font-medium flex items-center gap-1">
                        <MdLocationOn className="text-primary text-lg" />
                        {request.location || "No location specified"}
                    </p>
                    {request.customer && (
                        <p className="mt-1 text-text-muted dark:text-gray-400 text-sm">
                            Customer: <span className="font-bold text-text-main dark:text-white">{request.customer.fullName}</span>
                            {request.customer.agencyName && (
                                <span className="italic"> · {request.customer.agencyName}</span>
                            )}
                        </p>
                    )}
                </div>
            </div>

            {/* Two-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* ── Left Column (8) ── */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Card 1: Request Details */}
                    <section className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-border-light dark:border-border-dark">
                        <h2 className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-6 pb-4 border-b border-border-light dark:border-border-dark">
                            Request Details
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4 mb-6">
                            <div>
                                <p className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-1">Preferred Date</p>
                                <p className="font-semibold text-text-main dark:text-white">{formatDate(request.preferredDate)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-1">Time</p>
                                <p className="font-semibold text-text-main dark:text-white">{formatTime(request.preferredDate)}</p>
                            </div>
                            {request.rate != null && (
                                <div>
                                    <p className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-1">Rate</p>
                                    <p className="font-bold text-emerald-600 dark:text-emerald-400">${parseFloat(request.rate).toFixed(2)}/visit</p>
                                </div>
                            )}
                            {(request.visitTypeRef || request.visitType) && (
                                <div>
                                    <p className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-1">Visit Type</p>
                                    <p className="font-semibold text-text-main dark:text-white">
                                        {request.visitTypeRef
                                            ? `${request.visitTypeRef.name} (${request.visitTypeRef.code})`
                                            : request.visitType}
                                    </p>
                                </div>
                            )}
                            {request.emr && (
                                <div>
                                    <p className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-1">EMR</p>
                                    <p className="font-semibold text-text-main dark:text-white">{request.emr}</p>
                                </div>
                            )}
                            {request.sessionType && (
                                <div>
                                    <p className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-1">Session Mode</p>
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

                        {/* Customer's requested frequency */}
                        {request.visitsPerWeek && request.numberOfWeeks && (
                            <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4 mb-6 flex items-center gap-4">
                                <div className="bg-primary/10 p-3 rounded-full">
                                    <MdSchedule className="text-primary text-xl" />
                                </div>
                                <div>
                                    <p className="font-bold text-text-main dark:text-white">
                                        {request.visitsPerWeek}x/week · {request.numberOfWeeks} weeks ({request.visitsPerWeek * request.numberOfWeeks} visits)
                                    </p>
                                    <p className="text-xs text-text-muted dark:text-gray-400">Customer&apos;s initial plan — you can propose a different one in your offer below.</p>
                                </div>
                            </div>
                        )}

                        {request.description && (
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest">Clinical Description</p>
                                <p className="text-text-main dark:text-gray-300 leading-relaxed text-sm">{request.description}</p>
                            </div>
                        )}
                    </section>

                    {/* Card 2: Patient Info */}
                    {request.patient && (
                        <section className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-6">Patient Info</h2>
                                <PatientInfoBlock patient={request.patient} />
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-400 px-6 py-4 flex items-start gap-3">
                                <MdInfo className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                                    This patient is managed by {request.customer?.agencyName || "an agency"}. All documentation must be completed within their EMR system.
                                </p>
                            </div>
                        </section>
                    )}

                </div>

                {/* ── Right Column (4) ── */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Send Offer Form */}
                    {canSendOffer && (
                        <section className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-border-light dark:border-border-dark">
                            <h2 className="text-xl font-bold text-text-main dark:text-white mb-4">Send Offer</h2>

                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg mb-6">
                                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 text-center">
                                    You earn {earnPercentage}% of rate {earnAmount ? `($${earnAmount}/session)` : ""}
                                </p>
                            </div>

                            {offerError && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                                    <MdError className="text-red-600 shrink-0" />
                                    <p className="text-sm text-red-800 dark:text-red-300">{offerError}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmitOffer} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-2">Offer Rate ($)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-mono text-sm">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            placeholder="85.00"
                                            value={offerData.rate}
                                            onChange={(e) => setOfferData(prev => ({ ...prev, rate: e.target.value }))}
                                            className="w-full pl-8 pr-4 py-3 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-main dark:text-white transition-all outline-none font-semibold"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-2">
                                        Attempted Visit Rate ($) <span className="text-text-muted/70 font-normal normal-case ml-1">— optional</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-mono text-sm">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max={offerData.rate || 10000}
                                            placeholder="40.00"
                                            value={offerData.attemptedVisitRate}
                                            onChange={(e) => setOfferData(prev => ({ ...prev, attemptedVisitRate: e.target.value }))}
                                            className="w-full pl-8 pr-4 py-3 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-main dark:text-white transition-all outline-none font-semibold"
                                        />
                                    </div>
                                    <p className="mt-1.5 text-[11px] text-text-muted dark:text-gray-400">
                                        Charged when you arrive but the patient isn&apos;t home. Must be ≤ session rate. Leave blank for no charge.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-2">Visit Mode</label>
                                    <div className="flex bg-background-light dark:bg-background-dark p-1 rounded-lg border border-border-light dark:border-border-dark">
                                        <button
                                            type="button"
                                            onClick={() => setOfferData(prev => ({ ...prev, sessionType: "in-person" }))}
                                            className={`flex-1 py-2.5 text-xs font-bold rounded-md transition-all ${offerData.sessionType === "in-person"
                                                ? "bg-card-light dark:bg-card-dark shadow-sm text-primary"
                                                : "text-text-muted dark:text-gray-400"
                                            }`}
                                        >
                                            In-Person
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setOfferData(prev => ({ ...prev, sessionType: "virtual" }))}
                                            className={`flex-1 py-2.5 text-xs font-bold rounded-md transition-all ${offerData.sessionType === "virtual"
                                                ? "bg-card-light dark:bg-card-dark shadow-sm text-primary"
                                                : "text-text-muted dark:text-gray-400"
                                            }`}
                                        >
                                            Virtual
                                        </button>
                                    </div>
                                </div>

                                {/* Old top-level Visit Type dropdown removed — visit type is now
                                    selected via the override panel below, or inherits the customer's
                                    selection when no override is set. */}

                                <div>
                                    <label className="block text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-2">Proposed First Session</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={offerData.proposedDate}
                                        onChange={(e) => setOfferData(prev => ({ ...prev, proposedDate: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-main dark:text-white transition-all outline-none text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-2">Message to Client</label>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="Briefly describe your experience and approach..."
                                        value={offerData.description}
                                        onChange={(e) => setOfferData(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-main dark:text-white placeholder:text-text-muted/50 transition-all outline-none text-sm resize-none"
                                    />
                                </div>

                                {/* Visit Plan Override — optional counter-proposal */}
                                <div className="rounded-lg border border-border-light dark:border-border-dark p-3 space-y-3">
                                    <label className="flex items-start gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={offerData.planOverrideEnabled}
                                            onChange={(e) => setOfferData(prev => ({ ...prev, planOverrideEnabled: e.target.checked }))}
                                            className="mt-0.5 accent-primary"
                                        />
                                        <span className="text-xs font-bold text-text-main dark:text-white">
                                            Propose a different treatment plan
                                            <span className="block text-[10px] font-normal text-text-muted dark:text-gray-400 mt-0.5">
                                                Leave unchecked to accept the customer&apos;s plan as-is.
                                            </span>
                                        </span>
                                    </label>

                                    {offerData.planOverrideEnabled && (
                                        <div className="space-y-3 pl-6 pt-1">
                                            {(() => {
                                                const vtLabel = request.visitTypeRef
                                                    ? `${request.visitTypeRef.name} (${request.visitTypeRef.code})`
                                                    : request.visitType || null;
                                                return (vtLabel || (request.visitsPerWeek && request.numberOfWeeks)) ? (
                                                    <p className="text-[10px] text-text-muted dark:text-gray-400 italic">
                                                        Customer requested: {vtLabel || "—"}
                                                        {request.visitsPerWeek && request.numberOfWeeks && (
                                                            <> · {request.visitsPerWeek}×/week × {request.numberOfWeeks}wk ({request.visitsPerWeek * request.numberOfWeeks} visits)</>
                                                        )}
                                                    </p>
                                                ) : null;
                                            })()}

                                            <div>
                                                <label className="block text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-1">Visit Type</label>
                                                <select
                                                    value={offerData.visitTypeId || ""}
                                                    onChange={(e) => setOfferData(prev => ({ ...prev, visitTypeId: e.target.value }))}
                                                    className="w-full px-3 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-main dark:text-white text-sm outline-none"
                                                >
                                                    <option value="">— Same as customer&apos;s request —</option>
                                                    {overrideVisitTypes.map(vt => (
                                                        <option key={vt.id} value={vt.id}>{vt.name} ({vt.code})</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-1">Visits/Week</label>
                                                    <select
                                                        value={offerData.visitsPerWeek}
                                                        onChange={(e) => setOfferData(prev => ({ ...prev, visitsPerWeek: e.target.value }))}
                                                        className="w-full px-3 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-text-main dark:text-white text-sm outline-none"
                                                    >
                                                        <option value="">—</option>
                                                        {[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-1">Weeks</label>
                                                    <select
                                                        value={offerData.numberOfWeeks}
                                                        onChange={(e) => setOfferData(prev => ({ ...prev, numberOfWeeks: e.target.value }))}
                                                        className="w-full px-3 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-text-main dark:text-white text-sm outline-none"
                                                    >
                                                        <option value="">—</option>
                                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => <option key={n} value={n}>{n}</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                            {offerData.visitsPerWeek && offerData.numberOfWeeks && (
                                                <p className="text-[11px] font-bold text-primary">
                                                    You propose: {offerData.visitsPerWeek}×/week × {offerData.numberOfWeeks} weeks ({parseInt(offerData.visitsPerWeek, 10) * parseInt(offerData.numberOfWeeks, 10)} visits total)
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 p-3 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark">
                                    <MdSchedule className="text-text-muted text-sm shrink-0" />
                                    <span className="text-xs text-text-muted dark:text-gray-400 italic">Your offer will be valid for 48 hours</span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-3.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                                >
                                    <MdSend className="text-base" />
                                    {submitting ? "Sending..." : "Submit Offer"}
                                </button>
                            </form>
                        </section>
                    )}

                    {/* Offer Status — shows current state of the therapist's offer */}
                    {(myOffer && !offerIsTerminal) && (
                        <section className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-border-light dark:border-border-dark space-y-4">
                            {myOffer.status === "pending" && (
                                <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                                    <MdCheckCircle className="text-emerald-600 dark:text-emerald-400 text-xl shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">Offer sent successfully!</p>
                                        <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">The customer will be notified and can accept within 48 hours.</p>
                                    </div>
                                </div>
                            )}
                            {myOffer.status === "accepted" && (
                                <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                                    <MdCheckCircle className="text-emerald-600 dark:text-emerald-400 text-xl shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">Offer accepted!</p>
                                        <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">A booking has been created.</p>
                                    </div>
                                </div>
                            )}
                            {myOffer.status === "change_requested" && (
                                <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                    <MdWarning className="text-amber-600 dark:text-amber-400 text-xl shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-amber-800 dark:text-amber-200">Changes requested</p>
                                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">{myOffer.changeRequestNote || "The customer has requested changes to your offer."}</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-text-muted dark:text-gray-400">Your Rate</span>
                                    <span className="font-bold text-text-main dark:text-white">${parseFloat(myOffer.rate).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-muted dark:text-gray-400">Status</span>
                                    <span className="font-bold text-amber-600 dark:text-amber-400 uppercase text-xs">{myOffer.status?.replace(/_/g, " ")}</span>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Just-submitted success (before myOffer refreshes) */}
                    {offerSuccess && !myOffer && (
                        <section className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-border-light dark:border-border-dark">
                            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                                <MdCheckCircle className="text-emerald-600 dark:text-emerald-400 text-xl shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">Offer sent successfully!</p>
                                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">The customer will be notified and can accept within 48 hours.</p>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Previous offer was rejected/withdrawn/expired — show info and allow resubmit */}
                    {offerIsTerminal && (
                        <section className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-border-light dark:border-border-dark space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <MdInfo className="text-slate-500 text-lg shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                        Previous offer: <span className="uppercase">{myOffer.status?.replace(/_/g, " ")}</span>
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        You can submit a new offer below.
                                    </p>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Request Closed */}
                    {request.status === "offers_accepted" && !myOffer && (
                        <section className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-border-light dark:border-border-dark">
                            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <MdInfo className="text-slate-500 text-xl shrink-0" />
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    This request is closed. The customer has accepted an offer.
                                </p>
                            </div>
                        </section>
                    )}

                    {/* Customer Info */}
                    {request.customer && (
                        <section className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-border-light dark:border-border-dark">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                                    {(request.customer.fullName || "C").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-text-main dark:text-white">{request.customer.fullName}</p>
                                    {request.customer.agencyName && (
                                        <p className="text-xs text-text-muted dark:text-gray-400">{request.customer.agencyName}</p>
                                    )}
                                </div>
                            </div>
                            {myOffer && (
                                <button
                                    onClick={handleMessageCustomer}
                                    className="w-full py-3 rounded-lg border border-border-light dark:border-border-dark text-text-muted dark:text-gray-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-background-light dark:hover:bg-background-dark transition-all"
                                >
                                    <MdChat className="text-sm" />
                                    Message Customer
                                </button>
                            )}
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}

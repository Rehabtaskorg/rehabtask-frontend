"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
    MdArrowBack, MdLocationOn, MdCheckCircle, MdWarning, MdError,
    MdInfo, MdChat, MdVideocam, MdPersonPin, MdSend, MdSchedule,
} from "react-icons/md";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/hooks/useAuth";
import { REQUEST_TYPE } from "@/lib/constants";
import { useAnalytics } from "@/hooks/useAnalytics";
import OfferFormFields from "@/components/therapist/OfferFormFields";
import { getCustomerLabel } from "@/utils/request";

const STATUS_STYLES = {
    created: "bg-blue-100 text-blue-700  ",
    offers_received: "bg-amber-100 text-amber-700  ",
    offers_accepted: "bg-slate-100 text-slate-600  ",
    completed: "bg-emerald-100 text-emerald-700  ",
    cancelled: "bg-red-100 text-red-700  ",
};

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

export default function TherapistRequestDetailPage() {
    usePageTitle("Request Details");
    const router = useRouter();
    const params = useParams();
    const { trackEvent } = useAnalytics();
    const { user } = useAuth();
    const profileRate = user?.profile?.ratePerVisit ? parseFloat(user.profile.ratePerVisit).toFixed(2) : '';
    const profileAttemptedRate = user?.profile?.attemptedVisitRate != null
        ? parseFloat(user.profile.attemptedVisitRate).toFixed(2)
        : '';
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commissionRate, setCommissionRate] = useState(null);
    const [offerData, setOfferData] = useState({
        rate: "",
        attemptedVisitRate: "",
        sessionType: "in_person",
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

    const fetchRequest = useCallback(async () => {
        try {
            const res = await api.get(`/requests/${params.id}`);
            const fetched = res.data.data;
            setRequest(fetched);
            trackEvent("request_detail_viewed", {
                service_type: fetched.serviceType,
                request_type: fetched.requestType,
            });
            trackEvent("offer_form_started", { service_type: fetched.serviceType });

            if (fetched.preferredDate) {
                const date = new Date(fetched.preferredDate);
                const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 10);
                setOfferData(prev => ({ ...prev, proposedDate: localDate }));
            }
        } catch {
            // non-fatal — error state shown via empty request
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    useEffect(() => {
        fetchRequest();
        api.get("/payments/commission-rate").then(res => {
            setCommissionRate(res.data.data.rate);
        }).catch(() => { });
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
            const attemptedNum = attemptedTrim === "" || parseFloat(attemptedTrim) === 0 ? null : parseFloat(attemptedTrim);

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
            trackEvent("offer_sent", {
                service_type: request?.serviceType,
                session_type: offerData.sessionType,
                has_visit_type: !!offerData.visitTypeId,
            });
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
                    <div className="h-5 w-32 bg-slate-200  rounded" />
                    <div className="h-10 w-64 bg-slate-200  rounded" />
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-8 space-y-4">
                            <div className="h-48 bg-card-light  border border-border-light  rounded-xl" />
                            <div className="h-32 bg-card-light  border border-border-light  rounded-xl" />
                        </div>
                        <div className="lg:col-span-4">
                            <div className="h-96 bg-card-light  border border-border-light  rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="p-4 md:p-6 max-w-6xl mx-auto">
                <div className="bg-red-50  border border-red-200  rounded-xl p-6 text-center">
                    <MdWarning className="text-3xl text-red-500 mx-auto mb-2" />
                    <p className="text-red-800  font-bold">Request not found</p>
                    <button onClick={() => router.push("/therapist/requests")} className="mt-3 text-sm text-primary font-bold hover:underline">
                        Back to Browse Requests
                    </button>
                </div>
            </div>
        );
    }

    const myOffer = getMyOffer();
    // Withdrawn/expired offers allow a fresh submission; rejected offers permanently block resubmission.
    const offerIsTerminal = myOffer && ["withdrawn", "expired"].includes(myOffer.status);
    const offerIsRejected = myOffer?.status === "rejected";
    const canSendOffer = request.status !== "offers_accepted" && (!myOffer || offerIsTerminal) && !offerIsRejected && !offerSuccess;
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
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-main ">
                            {request.serviceType}
                        </h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isOpen
                            ? "bg-emerald-100 text-emerald-700  "
                            : STATUS_STYLES[request.status] || "bg-slate-100 text-slate-600  "
                            }`}>
                            {isOpen ? "Open" : request.status === "offers_accepted" ? "Closed" : request.status.replace(/_/g, " ")}
                        </span>
                        {request.requestType === REQUEST_TYPE.DIRECT && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700  ">
                                Direct
                            </span>
                        )}
                    </div>
                    <p className="text-text-muted  font-medium flex items-center gap-1">
                        <MdLocationOn className="text-primary text-lg" />
                        {request.location || "No location specified"}
                    </p>
                    {getCustomerLabel(request.customer) && (
                        <p className="mt-1 text-sm text-text-muted">
                            Client: <span className="font-bold text-text-main">{getCustomerLabel(request.customer)}</span>
                        </p>
                    )}
                </div>
            </div>

            {/* Two-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* ── Left Column (8) ── */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Card 1: Request Details */}
                    <section className="bg-card-light  rounded-xl p-6 shadow-sm border border-border-light ">
                        <h2 className="text-xs font-bold text-text-muted  uppercase tracking-widest mb-6 pb-4 border-b border-border-light ">
                            Request Details
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4 mb-6">
                            <div>
                                <p className="text-xs font-bold text-text-muted  uppercase tracking-widest mb-1">Preferred Date</p>
                                <p className="font-semibold text-text-main ">{formatDate(request.preferredDate)}</p>
                            </div>
                            {request.rate != null && (
                                <div>
                                    <p className="text-xs font-bold text-text-muted  uppercase tracking-widest mb-1">Rate</p>
                                    <p className="font-bold text-emerald-600 ">${parseFloat(request.rate).toFixed(2)}/visit</p>
                                </div>
                            )}
                            {(request.visitTypeRef || request.visitType) && (
                                <div>
                                    <p className="text-xs font-bold text-text-muted  uppercase tracking-widest mb-1">Visit Type</p>
                                    <p className="font-semibold text-text-main ">
                                        {request.visitTypeRef
                                            ? `${request.visitTypeRef.name} (${request.visitTypeRef.code})`
                                            : request.visitType}
                                    </p>
                                </div>
                            )}
                            {request.emr && (
                                <div>
                                    <p className="text-xs font-bold text-text-muted  uppercase tracking-widest mb-1">EMR</p>
                                    <p className="font-semibold text-text-main ">{request.emr}</p>
                                </div>
                            )}
                            {request.sessionType && (
                                <div>
                                    <p className="text-xs font-bold text-text-muted  uppercase tracking-widest mb-1">Session Mode</p>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold ${request.sessionType === "virtual"
                                        ? "bg-blue-50  text-blue-700 "
                                        : "bg-emerald-50  text-emerald-700 "
                                        }`}>
                                        {request.sessionType === "virtual" ? <MdVideocam className="text-sm" /> : <MdPersonPin className="text-sm" />}
                                        {request.sessionType === "virtual" ? "Virtual" : "In-Person"}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Customer's requested frequency */}
                        {request.visitsPerWeek && request.numberOfWeeks && (
                            <div className="bg-primary/5  rounded-xl p-4 mb-6 flex items-center gap-4">
                                <div className="bg-primary/10 p-3 rounded-full">
                                    <MdSchedule className="text-primary text-xl" />
                                </div>
                                <div>
                                    <p className="font-bold text-text-main ">
                                        {request.visitsPerWeek}x/week · {request.numberOfWeeks} weeks ({request.visitsPerWeek * request.numberOfWeeks} visits)
                                    </p>
                                    <p className="text-xs text-text-muted ">Customer&apos;s initial plan — you can propose a different one in your offer below.</p>
                                </div>
                            </div>
                        )}

                        {request.description && (
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-text-muted  uppercase tracking-widest">Clinical Description</p>
                                <p className="text-text-main  leading-relaxed text-sm">{request.description}</p>
                            </div>
                        )}
                    </section>

                    {/* Patient identity hidden from therapist pre-booking */}

                </div>

                {/* ── Right Column (4) ── */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Send Offer Form */}
                    {canSendOffer && (
                        <section className="bg-card-light  rounded-xl p-6 shadow-sm border border-border-light ">
                            <h2 className="text-xl font-bold text-text-main  mb-4">Send Offer</h2>

                            <div className="bg-emerald-50  p-3 rounded-lg mb-6">
                                <p className="text-sm font-bold text-emerald-700  text-center">
                                    You earn {earnPercentage}% of rate {earnAmount ? `($${earnAmount}/session)` : ""}
                                </p>
                            </div>

                            {offerError && (
                                <div className="flex items-center gap-2 p-3 bg-red-50  border border-red-200  rounded-lg mb-4">
                                    <MdError className="text-red-600 shrink-0" />
                                    <p className="text-sm text-red-800 ">{offerError}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmitOffer} className="space-y-4">
                                <OfferFormFields
                                    formData={offerData}
                                    setFormData={setOfferData}
                                    serviceType={request?.serviceType}
                                />
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
                    {(myOffer && !offerIsTerminal && !offerIsRejected) && (
                        <section className="bg-card-light  rounded-xl p-6 shadow-sm border border-border-light  space-y-4">
                            {myOffer.status === "pending" && (
                                <div className="flex items-center gap-3 p-4 bg-emerald-50  border border-emerald-200  rounded-lg">
                                    <MdCheckCircle className="text-emerald-600  text-xl shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-emerald-800 ">Offer sent successfully!</p>
                                        <p className="text-xs text-emerald-700  mt-0.5">The customer will be notified and can accept within 48 hours.</p>
                                    </div>
                                </div>
                            )}
                            {myOffer.status === "accepted" && (
                                <div className="flex items-center gap-3 p-4 bg-emerald-50  border border-emerald-200  rounded-lg">
                                    <MdCheckCircle className="text-emerald-600  text-xl shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-emerald-800 ">Offer accepted!</p>
                                        <p className="text-xs text-emerald-700  mt-0.5">A booking has been created.</p>
                                    </div>
                                </div>
                            )}
                            {myOffer.status === "change_requested" && (
                                <div className="flex items-center gap-3 p-4 bg-amber-50  border border-amber-200  rounded-lg">
                                    <MdWarning className="text-amber-600  text-xl shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-amber-800 ">Changes requested</p>
                                        <p className="text-xs text-amber-700  mt-0.5">{myOffer.changeRequestNote || "The customer has requested changes to your offer."}</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-text-muted ">Your Rate</span>
                                    <span className="font-bold text-text-main ">${parseFloat(myOffer.rate).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-muted ">Status</span>
                                    <span className="font-bold text-amber-600  uppercase text-xs">{myOffer.status?.replace(/_/g, " ")}</span>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Just-submitted success (before myOffer refreshes) */}
                    {offerSuccess && !myOffer && (
                        <section className="bg-card-light  rounded-xl p-6 shadow-sm border border-border-light ">
                            <div className="flex items-center gap-3 p-4 bg-emerald-50  border border-emerald-200  rounded-lg">
                                <MdCheckCircle className="text-emerald-600  text-xl shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-emerald-800 ">Offer sent successfully!</p>
                                    <p className="text-xs text-emerald-700  mt-0.5">The customer will be notified and can accept within 48 hours.</p>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Offer declined — blocked from resubmitting */}
                    {offerIsRejected && (
                        <section className="bg-card-light  rounded-xl p-6 shadow-sm border border-border-light  space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-red-50  border border-red-200  rounded-lg">
                                <MdWarning className="text-red-500  text-lg shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-red-700 ">Offer Declined</p>
                                    <p className="text-xs text-red-600  mt-0.5">
                                        The customer has declined your offer. You cannot submit another offer on this request.
                                    </p>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Previous offer was withdrawn/expired — show info and allow resubmit */}
                    {offerIsTerminal && (
                        <section className="bg-card-light  rounded-xl p-6 shadow-sm border border-border-light  space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-slate-50  rounded-lg">
                                <MdInfo className="text-slate-500 text-lg shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-slate-600 ">
                                        Previous offer: <span className="uppercase">{myOffer.status?.replace(/_/g, " ")}</span>
                                    </p>
                                    <p className="text-xs text-slate-500  mt-0.5">
                                        You can submit a new offer below.
                                    </p>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Request Closed */}
                    {request.status === "offers_accepted" && !myOffer && (
                        <section className="bg-card-light  rounded-xl p-6 shadow-sm border border-border-light ">
                            <div className="flex items-center gap-3 p-4 bg-slate-50  rounded-lg">
                                <MdInfo className="text-slate-500 text-xl shrink-0" />
                                <p className="text-sm text-slate-600 ">
                                    This request is closed. The customer has accepted an offer.
                                </p>
                            </div>
                        </section>
                    )}

                    {/* Customer Info */}
                    {request.customer && (
                        <section className="bg-card-light  rounded-xl p-6 shadow-sm border border-border-light ">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                                    {getCustomerLabel(request.customer)?.charAt(0).toUpperCase() ?? "C"}
                                </div>
                                <div>
                                    <p className="font-bold text-text-main">{getCustomerLabel(request.customer)}</p>
                                </div>
                            </div>
                            {myOffer && (
                                <button
                                    onClick={handleMessageCustomer}
                                    className="w-full py-3 rounded-lg border border-border-light  text-text-muted  font-bold text-sm flex items-center justify-center gap-2 hover:bg-background-light  transition-all"
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

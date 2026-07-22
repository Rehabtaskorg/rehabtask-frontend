"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { MdArrowBack, MdEdit, MdCancel, MdLocationOn, MdCheckCircle, MdChat, MdWarning } from "react-icons/md";
import { api } from "@/lib/api";
import useRequestStore from "@/store/requestStore";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAnalytics } from "@/hooks/useAnalytics";
import { formatDate, formatTime } from "@/utils/dates";
import { PatientInfoBlock } from "@/components/shared/patient/PatientInfoBlock";
import ConfirmModal from "@/components/ui/ConfirmModal";
import AcceptOfferModal from "@/components/customer/AcceptOfferModal";
import RequestDetailOfferCard from "@/components/customer/RequestDetailOfferCard";
import RequestTimeline from "@/components/customer/RequestTimeline";

const STATUS_STYLES = {
    created:         "bg-blue-100 text-blue-700  ",
    offers_received: "bg-amber-100 text-amber-700  ",
    offers_accepted: "bg-emerald-100 text-emerald-700  ",
    completed:       "bg-emerald-100 text-emerald-700  ",
    cancelled:       "bg-red-100 text-red-700  ",
};

const STATUS_LABELS = {
    created:         "Created",
    offers_received: "Offers Received",
    offers_accepted: "Accepted",
    completed:       "Completed",
    cancelled:       "Cancelled",
};

/**
 * Customer request detail page.
 * Renders request info, offer cards, and the accept/decline/change-request flow.
 */
export default function CustomerRequestDetailPage() {
    usePageTitle("Request Details");
    const params = useParams();
    const router = useRouter();
    const { trackEvent } = useAnalytics();
    const resetRequestStore = useRequestStore((state) => state.reset);

    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [declining, setDeclining] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [acceptOfferTarget, setAcceptOfferTarget] = useState(null);
    const [changeOfferId, setChangeOfferId] = useState(null);
    const [changeNote, setChangeNote] = useState("");
    const [changingOffer, setChangingOffer] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const fetchRequest = useCallback(async () => {
        try {
            const res = await api.get(`/requests/${params.id}`);
            setRequest(res.data.data);
        } catch (err) {
            console.error("Error fetching request:", err);
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        fetchRequest();
    }, [fetchRequest]);

    const handleAcceptOffer = (offer) => {
        setAcceptOfferTarget(offer);
    };

    const handleAccepted = useCallback((booking) => {
        trackEvent("offer_accepted", {
            service_type: booking?.request?.serviceType ?? request?.serviceType,
            session_type: booking?.sessionType,
        });
        trackEvent("booking_created", {
            session_type: booking?.sessionType,
            service_type: booking?.request?.serviceType ?? request?.serviceType,
        });
        fetchRequest();
    }, [fetchRequest, trackEvent, request?.serviceType]);

    const handleDeclineOffer = (offerId) => {
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
                trackEvent("offer_declined");
                fetchRequest();
                setConfirmAction(null);
            } catch (err) {
                setConfirmAction(null);
                alert("Error: " + (err.response?.data?.message || "Failed to decline offer"));
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
            trackEvent("offer_change_requested");
            setChangeOfferId(null);
            setChangeNote("");
            fetchRequest();
        } catch (err) {
            const errors = err.response?.data?.errors;
            alert(errors?.[0]?.message || err.response?.data?.message || "Failed to send change request.");
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

    if (loading) return null;

    if (!request) {
        return (
            <div className="p-4 md:p-6 max-w-6xl mx-auto">
                <div className="bg-red-50  border border-red-200  rounded-xl p-6 text-center">
                    <MdWarning className="text-3xl text-red-500 mx-auto mb-2" />
                    <p className="text-red-800  font-bold">Request not found</p>
                    <button onClick={() => router.push("/customer/requests")} className="mt-3 text-sm text-primary font-bold hover:underline">
                        Back to My Requests
                    </button>
                </div>
            </div>
        );
    }

    const offers = request.offers || [];
    const isEditable = ["created", "offers_received"].includes(request.status);
    const pendingOfferCount = offers.filter((o) => ["pending", "change_requested"].includes(o.status)).length;

    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
            <button
                onClick={() => router.push("/customer/requests")}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted  hover:text-primary transition-colors mb-6"
            >
                <MdArrowBack className="text-base" /> Back to My Requests
            </button>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-main ">
                            {request.serviceType}
                        </h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${STATUS_STYLES[request.status] || "bg-slate-100 text-slate-600  "}`}>
                            {STATUS_LABELS[request.status] || request.status}
                        </span>
                    </div>
                    <p className="flex items-center gap-1 text-text-muted  font-medium">
                        <MdLocationOn className="text-primary text-lg" />
                        {request.location || "No location specified"}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* ── Left Column ── */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Request Details */}
                    <section className="bg-card-light  rounded-xl p-6 shadow-sm border border-border-light ">
                        <h3 className="text-lg font-bold text-text-main  mb-4">Request Details</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-text-muted  uppercase tracking-widest">Preferred Date</p>
                                <p className="font-semibold text-text-main ">{formatDate(request.preferredDate)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-text-muted  uppercase tracking-widest">Time</p>
                                <p className="font-semibold text-text-main ">{formatTime(request.preferredDate)}</p>
                            </div>
                            {request.rate && (
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-text-muted  uppercase tracking-widest">Rate</p>
                                    <p className="font-bold text-emerald-600 ">${parseFloat(request.rate).toFixed(2)}/visit</p>
                                </div>
                            )}
                        </div>
                        {request.description && (
                            <div className="pt-6 border-t border-border-light  mt-6">
                                <h4 className="text-xs font-bold text-text-muted  uppercase tracking-widest mb-3">Description</h4>
                                <p className="text-text-main  leading-relaxed text-sm">{request.description}</p>
                            </div>
                        )}
                    </section>

                    {/* Patient Info */}
                    {request.patient && (
                        <section className="bg-card-light  rounded-xl shadow-sm border border-border-light  overflow-hidden">
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-text-main  mb-4">Patient Info</h3>
                                <PatientInfoBlock patient={request.patient} />
                            </div>
                        </section>
                    )}

                    {/* Offers */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-extrabold text-text-main ">
                            Offers Received ({offers.length})
                        </h3>
                        {offers.length === 0 ? (
                            <div className="bg-card-light  rounded-xl border border-border-light  p-8 text-center">
                                <MdCheckCircle className="text-4xl text-slate-300  mx-auto mb-3" />
                                <p className="text-sm font-semibold text-text-main ">No offers received yet</p>
                                <p className="text-xs text-text-muted  mt-1">Therapists in your area will be notified about this request</p>
                            </div>
                        ) : (
                            offers.map((offer) => (
                                <RequestDetailOfferCard
                                    key={offer.id}
                                    offer={offer}
                                    request={request}
                                    declining={declining}
                                    changeOfferId={changeOfferId}
                                    changeNote={changeNote}
                                    changingOffer={changingOffer}
                                    onAccept={handleAcceptOffer}
                                    onDecline={handleDeclineOffer}
                                    onOpenChange={(id) => { setChangeOfferId(id); setChangeNote(""); }}
                                    onCloseChange={() => { setChangeOfferId(null); setChangeNote(""); }}
                                    onChangeNoteUpdate={setChangeNote}
                                    onRequestChange={handleRequestChange}
                                    onMessage={(id) => router.push(`/customer/messages?c=offer:${id}`)}
                                />
                            ))
                        )}
                    </section>
                </div>

                {/* ── Right Column ── */}
                <div className="lg:col-span-4 space-y-6">
                    <section className="bg-card-light  rounded-xl p-6 shadow-sm border border-border-light ">
                        <h3 className="text-xs font-bold text-text-muted  uppercase tracking-widest mb-4">Management</h3>
                        <div className="space-y-3">
                            {isEditable && (
                                <button
                                    onClick={() => {
                                        resetRequestStore();
                                        router.push(`/customer/requests/new?edit=${request.id}`);
                                    }}
                                    className="w-full py-3 bg-card-light  border-2 border-primary text-primary hover:bg-primary/5  rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                    <MdEdit className="text-lg" /> Edit Request
                                </button>
                            )}
                            {isEditable && !showCancelConfirm && (
                                <button
                                    onClick={() => setShowCancelConfirm(true)}
                                    className="w-full py-3 text-red-600  hover:bg-red-50  rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                    <MdCancel className="text-lg" /> Cancel Request
                                </button>
                            )}
                            {showCancelConfirm && (
                                <div className="p-4 bg-red-50  border border-red-200  rounded-lg">
                                    <div className="flex items-start gap-2 mb-3">
                                        <MdWarning className="text-red-600  text-lg shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-red-800 ">Cancel this request?</p>
                                            <p className="text-xs text-red-700  mt-1">
                                                {pendingOfferCount > 0
                                                    ? `This will withdraw ${pendingOfferCount} pending offer(s). Affected therapists will be notified.`
                                                    : "This action cannot be undone."}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={() => setShowCancelConfirm(false)}
                                            className="text-sm text-slate-500  font-bold hover:text-text-main  transition-colors px-3 py-1.5"
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
                                    onClick={() => router.push("/customer/messages")}
                                    className="w-full py-3 bg-card-light  border-2 border-primary text-primary hover:bg-primary/5  rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                    <MdChat className="text-lg" /> Message Therapist
                                </button>
                            )}
                            {!isEditable && request.status !== "offers_accepted" && (
                                <p className="text-xs text-text-muted  text-center py-2">No actions available for this status</p>
                            )}
                        </div>
                    </section>

                    <RequestTimeline request={request} offers={offers} />
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
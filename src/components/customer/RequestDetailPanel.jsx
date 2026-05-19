"use client";

import {
    MdCalendarToday, MdLocationOn, MdSchedule, MdVisibility,
    MdEdit, MdOpenInNew, MdCancel,
} from "react-icons/md";
import RequestOfferCard from "@/components/customer/RequestOfferCard";

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

const STATUS_BADGE = {
    created: { bg: "bg-slate-100  text-slate-600 ", label: "Open" },
    offers_received: { bg: "bg-blue-100  text-blue-700 ", label: "Offers Received" },
    offers_accepted: { bg: "bg-emerald-100  text-emerald-700 ", label: "Accepted" },
    completed: { bg: "bg-slate-100  text-slate-600 ", label: "Completed" },
    cancelled: { bg: "bg-red-100  text-red-600 ", label: "Cancelled" },
};

export default function RequestDetailPanel({
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
    showCancelConfirm,
    cancelling,
    onCancelRequest,
    onOpenCancel,
    onCloseCancel,
}) {
    if (loading) {
        return (
            <div className="flex-1 overflow-y-auto panel-scroll p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-48 bg-slate-200  rounded" />
                    <div className="h-4 w-32 bg-slate-200  rounded" />
                    <div className="h-20 bg-slate-200  rounded-lg" />
                    <div className="h-40 bg-slate-200  rounded-xl" />
                </div>
            </div>
        );
    }

    const badge = STATUS_BADGE[request.status] || STATUS_BADGE.created;
    const offers = request.offers || [];
    const now = new Date();
    const pendingOffers = offers.filter((o) => o.status === "pending" && (!o.expiresAt || new Date(o.expiresAt) > now));
    const expiredPendingOffers = offers.filter((o) => o.status === "pending" && o.expiresAt && new Date(o.expiresAt) <= now);
    const otherOffers = [...offers.filter((o) => o.status !== "pending"), ...expiredPendingOffers];

    return (
        <div className="flex-1 overflow-y-auto panel-scroll">
            {/* Header section */}
            <div className="p-6 sm:p-8 border-b border-border-light ">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Request Details</p>
                <div className="flex items-start justify-between gap-3 mb-4">
                    <h2 className="text-xl font-bold text-text-main ">
                        {request.serviceType}
                    </h2>
                    <div className="flex items-center gap-2 shrink-0">
                        {["created", "offers_received"].includes(request.status) && (
                            <button
                                onClick={() => window.location.href = `/customer/requests/new?edit=${request.id}`}
                                className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-primary border border-primary/30 rounded-full hover:bg-primary/5  transition-colors"
                            >
                                <MdEdit className="text-xs" />
                                Edit
                            </button>
                        )}
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badge.bg}`}>
                            {badge.label}
                            {request.status === "offers_received" && offers.length > 0 ? ` (${offers.length})` : ""}
                        </span>
                    </div>
                </div>

                {/* Metadata chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {request.preferredDate && (
                        <span className="bg-slate-50  px-3 py-1.5 rounded-lg border border-border-light  text-sm text-text-main  flex items-center gap-1.5">
                            <MdCalendarToday className="text-text-muted " />
                            {formatDate(request.preferredDate)}
                        </span>
                    )}
                    {request.location && (
                        <span className="bg-slate-50  px-3 py-1.5 rounded-lg border border-border-light  text-sm text-text-main  flex items-center gap-1.5">
                            <MdLocationOn className="text-text-muted " />
                            {request.location}
                        </span>
                    )}
                </div>

                {/* Description */}
                {request.description && (
                    <div className="bg-slate-50  rounded-xl p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted  mb-1">Description</p>
                        <p className="text-sm text-text-main  leading-relaxed">{request.description}</p>
                    </div>
                )}

                {/* View Full Details + Cancel */}
                <div className="flex items-center gap-4 mt-4">
                    <a
                        href={`/customer/requests/${request.id}`}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                        <MdOpenInNew className="text-base" />
                        View Full Details
                    </a>
                    {["created", "offers_received"].includes(request.status) && !showCancelConfirm && (
                        <button
                            onClick={onOpenCancel}
                            className="inline-flex items-center gap-1 text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
                        >
                            <MdCancel className="text-base" />
                            Cancel
                        </button>
                    )}
                </div>

                {/* Cancel confirmation */}
                {showCancelConfirm && (
                    <div className="mt-4 p-4 bg-red-50  border border-red-200  rounded-lg">
                        <p className="text-sm font-bold text-red-800  mb-1">Cancel this request?</p>
                        <p className="text-xs text-red-700  mb-3">
                            {offers.length > 0
                                ? `This will withdraw ${pendingOffers.length} pending offer(s) and notify therapists.`
                                : "This action cannot be undone."}
                        </p>
                        <div className="flex gap-2 justify-end">
                            <button onClick={onCloseCancel} className="text-sm text-slate-500 font-bold px-3 py-1.5">Go Back</button>
                            <button
                                onClick={onCancelRequest}
                                disabled={cancelling}
                                className="bg-red-600 hover:bg-red-700 text-white px-5 py-1.5 rounded-lg text-sm font-bold disabled:opacity-50 transition-colors"
                            >
                                {cancelling ? "Cancelling..." : "Yes, Cancel"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Offers section */}
            <div className="p-6 sm:p-8">
                <h3 className="text-sm font-bold text-text-main  mb-4 flex items-center gap-2">
                    <MdVisibility className="text-base text-text-muted " />
                    Available Offers
                </h3>

                {offers.length === 0 ? (
                    <div className="text-center py-8">
                        <MdSchedule className="text-4xl text-slate-200  mx-auto mb-2" />
                        <p className="text-text-muted  text-sm">
                            No offers yet. Therapists in your area will be notified.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingOffers.map((offer) => (
                            <RequestOfferCard
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
                        {otherOffers.map((offer) => (
                            <RequestOfferCard key={offer.id} offer={offer} isPending={false} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

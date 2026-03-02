"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { MdArrowBack, MdChatBubble, MdCheckCircle } from "react-icons/md";
import { usePageTitle } from "@/hooks/usePageTitle";
import PatientInfoBlock from "@/components/customer/PatientInfoBlock";

const STATUS_STYLES = {
    created: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    offers_received: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    offers_accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_LABELS = {
    created: 'Created',
    offers_received: 'Offers Received',
    offers_accepted: 'Accepted',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

const OFFER_STATUS_STYLES = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    expired: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    withdrawn: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    change_requested: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

export default function CustomerRequestDetailPage() {
    usePageTitle("Request Details");
    const params = useParams();
    const router = useRouter();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(null);

    const fetchRequest = async () => {
        try {
            const res = await api.get(`/requests/${params.id}`);
            setRequest(res.data.data);
        } catch (error) {
            console.error("Error fetching request:", error)
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchRequest();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id])

    const handleAcceptOffer = async (offerId) => {
        if (!confirm("Are you sure you want to accept this offer?")) {
            return;
        }

        setAccepting(offerId);

        try {
            const res = await api.post(`/offers/${offerId}/accept`);
            const booking = res.data.data.booking;

            alert("Offer accepted! Redirecting to payment...");
            router.push(`/customer/bookings/${booking.id}/payment`);
        } catch (error) {
            alert("Error: " + (error.response?.data?.message || "Failed to accept offer"));
        } finally {
            setAccepting(null);
        }
    }

    const handleMessageTherapist = (offerId) => {
        router.push(`/customer/messages?c=offer:${offerId}`);
    }

    if (loading) {
        return (
            <div className="py-6 px-4 max-w-4xl mx-auto">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl w-1/3"></div>
                    <div className="h-40 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl"></div>
                    <div className="h-48 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl"></div>
                </div>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="py-6 px-4 max-w-4xl mx-auto">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                    <p className="text-red-800 dark:text-red-300">Request not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="py-6 px-4 max-w-4xl mx-auto">

            {/* Back button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 text-sm text-text-muted dark:text-gray-400 hover:text-primary mb-5 transition-colors"
            >
                <MdArrowBack className="text-base" />
                Back to Requests
            </button>

            {/* Request info card */}
            <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm p-6 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-text-main dark:text-white mb-1">{request.serviceType}</h1>
                        <p className="text-text-muted dark:text-gray-400">{request.location}</p>
                    </div>
                    <span className={`self-start px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${STATUS_STYLES[request.status] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                        {STATUS_LABELS[request.status] || request.status}
                    </span>
                </div>

                {/* Patient Info Block — shown when request has patient (agency bookings) */}
                {request.patient && (
                    <div className="mb-4">
                        <PatientInfoBlock patient={request.patient} />
                    </div>
                )}

                <div className="space-y-3 border-t border-border-light dark:border-border-dark pt-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-gray-400 mb-1">Description</p>
                        <p className="text-text-main dark:text-slate-200 text-sm leading-relaxed">{request.description}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-gray-400 mb-1">Preferred Date</p>
                        <p className="text-text-main dark:text-slate-200 text-sm">{new Date(request.preferredDate).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Offers section */}
            <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-text-main dark:text-white mb-4">
                    Offers Received ({request.offers?.length || 0})
                </h2>

                {!request.offers || request.offers.length === 0 ? (
                    <div className="bg-background-light dark:bg-background-dark rounded-xl p-8 text-center">
                        <p className="text-text-muted dark:text-gray-400">No offers yet</p>
                        <p className="text-sm text-text-muted dark:text-gray-400 mt-2">
                            Therapists in your area will be notified about your request
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {request.offers.map((offer) => (
                            <div
                                key={offer.id}
                                className="border border-border-light dark:border-border-dark rounded-xl p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                {/* Card header — therapist info + rate */}
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                                    <div>
                                        <h3 className="font-semibold text-text-main dark:text-white">
                                            {offer.therapist.fullName}
                                        </h3>
                                        <p className="text-sm text-text-muted dark:text-gray-400">
                                            {offer.therapist.specialization}
                                        </p>
                                    </div>
                                    <div className="sm:text-right">
                                        <p className="text-2xl font-bold text-primary dark:text-blue-400">
                                            ${parseFloat(offer.rate).toFixed(2)}
                                        </p>
                                        <p className="text-xs text-text-muted dark:text-gray-400 capitalize">
                                            {offer.sessionType?.replace(/-/g, ' ')}
                                        </p>
                                    </div>
                                </div>

                                {/* Proposed date */}
                                <div className="mb-3">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-gray-400 mb-1">Proposed Date</p>
                                    <p className="text-sm text-text-main dark:text-slate-200 font-medium">
                                        {new Date(offer.proposedDate).toLocaleString()}
                                    </p>
                                </div>

                                {/* Message/description */}
                                {offer.description && (
                                    <div className="mb-4">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-gray-400 mb-1">Message</p>
                                        <p className="text-sm text-text-main dark:text-slate-200 leading-relaxed">{offer.description}</p>
                                    </div>
                                )}

                                {/* Footer: status badge + actions */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-border-light dark:border-border-dark">
                                    <span className={`self-start px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${OFFER_STATUS_STYLES[offer.status] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                        {offer.status.replace(/_/g, ' ')}
                                    </span>

                                    {offer.status === 'pending' && (
                                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                            <button
                                                onClick={() => handleMessageTherapist(offer.id)}
                                                className="flex items-center justify-center gap-1.5 px-4 py-2 border border-border-light dark:border-border-dark text-text-main dark:text-white rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                <MdChatBubble className="text-base text-primary" />
                                                Message
                                            </button>
                                            <button
                                                onClick={() => handleAcceptOffer(offer.id)}
                                                disabled={accepting === offer.id}
                                                className="flex items-center justify-center gap-1.5 bg-primary hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <MdCheckCircle className="text-base" />
                                                {accepting === offer.id ? 'Accepting...' : 'Accept Offer'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Expires at */}
                                <p className="text-xs text-text-muted dark:text-gray-400 mt-2">
                                    Expires: {new Date(offer.expiresAt).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
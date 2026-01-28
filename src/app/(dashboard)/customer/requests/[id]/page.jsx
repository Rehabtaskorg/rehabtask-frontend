"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function CustomerRequestDetailPage() {
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

    if (loading) {
        return (
            <div className="py-8 px-4">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="py-8 px-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <p className="text-red-800">Request not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="py-8 px-4 max-w-4xl mx-auto">
            <button
                onClick={() => router.back()}
                className="text-blue-600 hover:text-blue-700 mb-4"
            >
                ← Back to Requests
            </button>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">{request.serviceType}</h1>
                        <p className="text-gray-600">{request.location}</p>
                    </div>
                    <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${request.status === 'offers_accepted'
                                ? 'bg-green-100 text-green-800'
                                : request.status === 'offers_received'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-blue-100 text-blue-800'
                            }`}
                    >
                        {request.status.replace('_', ' ').toUpperCase()}
                    </span>
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-1">Description</h3>
                        <p className="text-gray-700">{request.description}</p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-1">Preferred Date</h3>
                        <p className="text-gray-700">
                            {new Date(request.preferredDate).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                    Offers Received ({request.offers?.length || 0})
                </h2>

                {!request.offers || request.offers.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <p className="text-gray-600">No offers yet</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Therapists in your area will be notified about your request
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {request.offers.map((offer) => (
                            <div
                                key={offer.id}
                                className="border rounded-lg p-4 hover:bg-gray-50"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            {offer.therapist.fullName}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {offer.therapist.specialization}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-blue-600">
                                            ${offer.rate}
                                        </p>
                                        <p className="text-xs text-gray-500">{offer.sessionType}</p>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <p className="text-sm text-gray-600 mb-1">Proposed Date:</p>
                                    <p className="font-medium">
                                        {new Date(offer.proposedDate).toLocaleString()}
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 mb-1">Message:</p>
                                    <p className="text-gray-700">{offer.description}</p>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${offer.status === 'accepted'
                                                ? 'bg-green-100 text-green-800'
                                                : offer.status === 'rejected'
                                                    ? 'bg-red-100 text-red-800'
                                                    : offer.status === 'expired'
                                                        ? 'bg-gray-100 text-gray-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                    >
                                        {offer.status.toUpperCase()}
                                    </span>

                                    {offer.status === 'pending' && (
                                        <button
                                            onClick={() => handleAcceptOffer(offer.id)}
                                            disabled={accepting === offer.id}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                                        >
                                            {accepting === offer.id ? 'Accepting...' : 'Accept Offer'}
                                        </button>
                                    )}
                                </div>

                                <p className="text-xs text-gray-500 mt-2">
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
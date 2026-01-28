"use client"

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function TherapistRequestDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showOfferForm, setShowOfferForm] = useState(false);
    const [offerData, setOfferData] = useState({
        rate: "",
        sessionType: "in-person",
        proposedDate: "",
        description: "",
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchRequest = async () => {
        try {
            const res = await api.get(`/requests/${params.id}`);
            setRequest(res.data.data);

            // Pre-fill proposed date with request's preferred date
            if (res.data.data.preferredDate) {
                const date = new Date(res.data.data.preferredDate);
                const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 16);
                setOfferData(prev => ({ ...prev, proposedDate: localDateTime }));
            }
        } catch (error) {
            console.error("Error fetching request:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchRequest();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    const handleSubmitOffer = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const proposedDateISO = new Date(offerData.proposedDate).toISOString();

            await api.post("/offers", {
                requestId: params.id,
                rate: parseFloat(offerData.rate),
                sessionType: offerData.sessionType,
                proposedDate: proposedDateISO,
                description: offerData.description,
            });

            alert("Offer sent successfully!");
            router.push("/therapist/requests");
        } catch (error) {
            alert("Error: " + (error.response?.data?.message || "Failed to send offer"));
        } finally {
            setSubmitting(false);
        }

    }

    const hasMyOffer = () => {
        return request?.offers && request.offers.length > 0;
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
                        <p className="text-sm text-blue-600 mt-1">~10 miles from you</p>
                    </div>
                    <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${request.status === 'offers_accepted'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-blue-100 text-blue-800'
                            }`}
                    >
                        {request.status === 'offers_accepted'
                            ? 'CLOSED'
                            : 'OPEN FOR OFFERS'}
                    </span>
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-1">Customer</h3>
                        <p className="text-gray-700">{request.customer.fullName}</p>
                        <p className="text-sm text-gray-600">{request.customer.phone}</p>
                    </div>

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

                    <div>
                        <h3 className="font-semibold mb-1">Posted</h3>
                        <p className="text-gray-700">
                            {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {request.status !== 'offers_accepted' && !hasMyOffer() && (
                    <button
                        type="submit"
                        onClick={() => setShowOfferForm(!showOfferForm)}
                        className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                    >
                        {showOfferForm ? 'Cancel' : 'Send Offer'}
                    </button>
                )}

                {hasMyOffer() && (
                    <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-green-800 font-semibold">
                            ✓ You have already sent an offer for this request
                        </p>
                    </div>
                )}

                {request.status === 'offers_accepted' && (
                    <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-gray-800">
                            This request is closed. The customer has accepted an offer.
                        </p>
                    </div>
                )}
            </div>

            {showOfferForm && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Send Your Offer</h2>

                    <form onSubmit={handleSubmitOffer} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Your Rate (USD) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="100.00"
                                value={offerData.rate}
                                onChange={(e) =>
                                    setOfferData({ ...offerData, rate: e.target.value })
                                }
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Platform fee: 10% (You&lsquo;ll receive 90% of this amount)
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Session Type *
                            </label>
                            <select
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={offerData.sessionType}
                                onChange={(e) =>
                                    setOfferData({ ...offerData, sessionType: e.target.value })
                                }
                            >
                                <option value="in-person">In-Person</option>
                                <option value="virtual">Virtual (Future)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Proposed Date & Time *
                            </label>
                            <input
                                type="datetime-local"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={offerData.proposedDate}
                                onChange={(e) =>
                                    setOfferData({ ...offerData, proposedDate: e.target.value })
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Message to Customer *
                            </label>
                            <textarea
                                required
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Introduce yourself and explain how you can help..."
                                value={offerData.description}
                                onChange={(e) =>
                                    setOfferData({ ...offerData, description: e.target.value })
                                }
                            />
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                💡 Your offer will be valid for 48 hours. The customer will be notified
                                and can accept it at any time within this period.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {submitting ? 'Sending...' : 'Send Offer'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );


}
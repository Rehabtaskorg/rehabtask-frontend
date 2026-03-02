"use client"

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { usePageTitle } from "@/hooks/usePageTitle";
import PatientInfoBlock from "@/components/customer/PatientInfoBlock";

export default function TherapistRequestDetailPage() {
    usePageTitle("Request Details");
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

    // Navigate to messaging in the context of this offer
    // Only shown after therapist has sent an offer
    const handleMessageCustomer = () => {
        router.push(`/therapist/messages?c=offer:${request.offers[0]?.id}`);
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

                    {request.patient && (
                        <PatientInfoBlock
                            patient={request.patient}
                            note="This session is managed by an agency on the patient's behalf."
                        />
                    )}

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

                {/* Offer sent — show confirmation + Message Customer button (Option B) */}
                {hasMyOffer() && (
                    <div className="mt-6 space-y-3">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-green-800 font-semibold">
                                ✓ You have already sent an offer for this request
                            </p>
                        </div>
                        <button
                            onClick={handleMessageCustomer}
                            className="w-full flex items-center justify-center gap-2 border border-primary text-primary py-3 rounded-lg font-semibold hover:bg-primary/5 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Message Customer
                        </button>
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
                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-4 text-text-main dark:text-white">Send Your Offer</h2>

                    <form onSubmit={handleSubmitOffer} className="space-y-4">
                        <Input
                            type="number"
                            step="0.01"
                            required
                            label="Your Rate (USD)"
                            placeholder="100.00"
                            helperText="Platform fee: 10% (You'll receive 90% of this amount)"
                            value={offerData.rate}
                            onChange={(e) =>
                                setOfferData({ ...offerData, rate: e.target.value })
                            }
                        />

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-text-main dark:text-white uppercase tracking-wide">
                                Session Type <span className="text-red-500 ml-1">*</span>
                            </label>
                            <select
                                required
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-background-dark border border-border-subtle dark:border-[#2a3038] focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-main dark:text-white transition-all outline-none"
                                value={offerData.sessionType}
                                onChange={(e) =>
                                    setOfferData({ ...offerData, sessionType: e.target.value })
                                }
                            >
                                <option value="in-person">In-Person</option>
                                <option value="virtual">Virtual (Future)</option>
                            </select>
                        </div>

                        <Input
                            type="datetime-local"
                            required
                            label="Proposed Date & Time"
                            value={offerData.proposedDate}
                            onChange={(e) =>
                                setOfferData({ ...offerData, proposedDate: e.target.value })
                            }
                        />

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-text-main dark:text-white uppercase tracking-wide">
                                Message to Customer <span className="text-red-500 ml-1">*</span>
                            </label>
                            <textarea
                                required
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-background-dark border border-border-subtle dark:border-[#2a3038] focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-main dark:text-white placeholder:text-text-muted/50 transition-all outline-none resize-none"
                                placeholder="Introduce yourself and explain how you can help..."
                                value={offerData.description}
                                onChange={(e) =>
                                    setOfferData({ ...offerData, description: e.target.value })
                                }
                            />
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl p-4">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                Your offer will be valid for 48 hours. The customer will be notified
                                and can accept it at any time within this period.
                            </p>
                        </div>

                        <Button
                            type="submit"
                            disabled={submitting}
                            loading={submitting}
                            fullWidth
                        >
                            Send Offer
                        </Button>
                    </form>
                </div>
            )}
        </div>
    );


}
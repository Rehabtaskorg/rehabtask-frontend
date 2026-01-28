"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function TherapistRequestsPage() {
    const router = useRouter();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const res = await api.get("/requests/available");
            setRequests(res.data.data);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchRequests();
    }, [])

    const getStatusColor = (status) => {
        const colors = {
            created: 'bg-blue-100 text-blue-800',
            offers_received: 'bg-yellow-100 text-yellow-800',
            offers_accepted: 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const hasMyOffer = (request) => {
        return request.offers && request.offers.length > 0;
    }

    if (loading) {
        return (
            <div className="py-8 px-4">
                <h1 className="text-2xl font-bold mb-6">Available Requests</h1>
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Available Requests</h1>

            {requests.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <p className="text-gray-600">No requests available at the moment</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Check back later for new customer requests in your area
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => (
                        <div
                            key={request.id}
                            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => router.push(`/therapist/requests/${request.id}`)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold">{request.serviceType}</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {request.location}
                                    </p>
                                    {/* In production, calculate distance from therapist's work area */}
                                    <p className="text-xs text-blue-600 mt-1">~10 miles away</p>
                                </div>
                                <div className="text-right">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                            request.status
                                        )}`}
                                    >
                                        {request.status === 'offers_accepted'
                                            ? 'CLOSED'
                                            : request.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                    {hasMyOffer(request) && (
                                        <p className="text-xs text-green-600 mt-2">✓ You sent an offer</p>
                                    )}
                                </div>
                            </div>

                            <p className="text-gray-700 mb-4 line-clamp-2">
                                {request.description}
                            </p>

                            <div className="flex justify-between items-center text-sm text-gray-600">
                                <div>
                                    <span>Customer: </span>
                                    <span className="font-medium">{request.customer.fullName}</span>
                                </div>
                                <div>
                                    <span>Preferred: </span>
                                    <span className="font-medium">
                                        {new Date(request.preferredDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {!hasMyOffer(request) && request.status !== 'offers_accepted' && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/therapist/requests/${request.id}`);
                                    }}
                                    className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                                >
                                    Send Offer
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

}
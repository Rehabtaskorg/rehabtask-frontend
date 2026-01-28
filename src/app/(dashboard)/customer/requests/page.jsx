"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function CustomerRequestPage() {
    const router = useRouter();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const res = await api.get("/requests/my-requests");
            setRequests(res.data.data);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchRequests();
    }, []);

    const getStatusColor = (status) => {
        const colors = {
            created: 'bg-blue-100 text-blue-800',
            offers_received: 'bg-yellow-100 text-yellow-800',
            offers_accepted: 'bg-green-100 text-green-800',
            completed: 'bg-gray-100 text-gray-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="py-8 px-4">
                <h1 className="text-2xl font-bold mb-6">My Requests</h1>
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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">My Requests</h1>
                <button
                    onClick={() => router.push('/customer/requests/new')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    + New Request
                </button>
            </div>

            {requests.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <p className="text-gray-600 mb-4">You haven&apos;t created any requests yet</p>
                    <button
                        onClick={() => router.push('/customer/requests/new')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Create Your First Request
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => (
                        <div
                            key={request.id}
                            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => router.push(`/customer/requests/${request.id}`)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold">{request.serviceType}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{request.location}</p>
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                        request.status
                                    )}`}
                                >
                                    {request.status.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>

                            <p className="text-gray-700 mb-4">{request.description}</p>

                            <div className="flex justify-between items-center text-sm text-gray-600">
                                <div>
                                    <span>Preferred Date: </span>
                                    <span className="font-medium">
                                        {new Date(request.preferredDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <div>
                                    <span>Offers: </span>
                                    <span className="font-medium text-blue-600">
                                        {request.offers?.length || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

}
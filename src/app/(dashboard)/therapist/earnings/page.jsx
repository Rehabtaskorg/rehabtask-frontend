"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function TherapistEarningsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayouts();
    }, [])

    const fetchPayouts = async () => {
        try {
            const res = await api.get("/payments/payouts");
            setData(res.data.data);
        } catch (error) {
            console.error('Error fetching payouts:', error);
        } finally {
            setLoading(false);
        }
    }

    const getStatusColor = (status) => {
        const colors = {
            escrowed: "bg-yellow-100 text-yellow-800",
            released: "bg-green-100 text-green-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    }

    const getStatusText = (status) => {
        const texts = {
            escrowed: 'Pending Customer Confirmation',
            released: 'Paid Out',
        };
        return texts[status] || status;
    };

    if (loading) {
        return (
            <div className="py-8 px-4">
                <h1 className="text-2xl font-bold mb-6">Earnings & Payouts</h1>
                <div className="animate-pulse space-y-4">
                    <div className="h-32 bg-gray-200 rounded"></div>
                    <div className="h-24 bg-gray-200 rounded"></div>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="py-8 px-4">
                <h1 className="text-2xl font-bold mb-6">Earnings & Payouts</h1>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <p className="text-red-800">Failed to load earnings data</p>
                </div>
            </div>
        )
    }

    return (
        <div className="py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Earnings & Payouts</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
                    <p className="text-3xl font-bold text-green-600">
                        ${data.totalEarnings?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">All time</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600 mb-1">Pending Earnings</p>
                    <p className="text-3xl font-bold text-yellow-600">
                        ${data.pendingEarnings?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Awaiting confirmation</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600 mb-1">Completed Sessions</p>
                    <p className="text-3xl font-bold text-blue-600">
                        {data.payments?.filter((p) => p.status === 'released').length || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Sessions paid out</p>
                </div>
            </div>

            {/* Payout History */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Payout History</h2>

                {data.payments.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <p className="text-gray-600">No payout history yet</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Complete sessions to start earning
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {data.payments.map((payment) => (
                            <div
                                key={payment.id}
                                className="border rounded-lg p-4 hover:bg-gray-50"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-semibold">
                                            {payment.booking.customer.fullName}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {payment.booking.offer.request.serviceType}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Session: {new Date(payment.booking.scheduledDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                            payment.status
                                        )}`}
                                    >
                                        {getStatusText(payment.status)}
                                    </span>
                                </div>

                                <div className="border-t pt-3 grid grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Session Rate</p>
                                        <p className="font-semibold">${payment.amount}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Platform Fee (10%)</p>
                                        <p className="text-red-600">-${payment.platformFee}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Your Earnings</p>
                                        <p className="font-semibold text-green-600">
                                            ${payment.therapistPayout}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">
                                            {payment.status === 'released' ? 'Paid On' : 'Created'}
                                        </p>
                                        <p className="text-xs">
                                            {new Date(
                                                payment.releasedAt || payment.createdAt
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {payment.status === 'escrowed' && (
                                    <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-2">
                                        <p className="text-xs text-yellow-800">
                                            💡 This payment is being held securely and will be released after the customer confirms session completion (or auto-confirms after 72 hours).
                                        </p>
                                    </div>
                                )}

                                {payment.stripeTransferId && (
                                    <div className="mt-2 text-xs text-gray-500">
                                        Transfer ID: {payment.stripeTransferId}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )

}
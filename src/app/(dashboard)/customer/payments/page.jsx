"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function CustomerPaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayments();
    }, [])

    const fetchPayments = async () => {
        try {
            const res = await api.get("/payments/history");
            setPayments(res.data.data);
        } catch (error) {
            console.error("Error fetching payments:", error);
        } finally {
            setLoading(false);
        }
    }

    const getStatusColor = (status) => {
        const colors = {
            intent_created: 'bg-yellow-100 text-yellow-800',
            escrowed: 'bg-blue-100 text-blue-800',
            released: 'bg-green-100 text-green-800',
            refunded: 'bg-gray-100 text-gray-800',
            failed: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status) => {
        const texts = {
            intent_created: 'Pending',
            escrowed: 'Held (Awaiting Completion)',
            released: 'Completed',
            refunded: 'Refunded',
            failed: 'Failed',
        };
        return texts[status] || status;
    };

    if (loading) {
        return (
            <div className="py-8 px-4">
                <h1 className="text-2xl font-bold mb-6">Payment History</h1>
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Payment History</h1>

            {payments.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <p className="text-gray-600">No payment history yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {payments.map((payment) => (
                        <div
                            key={payment.id}
                            className="bg-white rounded-lg shadow p-6"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-semibold text-lg">
                                        {payment.booking.therapist.fullName}
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

                            <div className="border-t pt-4 grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Amount Paid</p>
                                    <p className="font-semibold">${payment.amount}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Transaction Date</p>
                                    <p>{new Date(payment.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Payment ID</p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {payment.id}
                                    </p>
                                </div>
                            </div>

                            {payment.status === 'escrowed' && (
                                <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-3">
                                    <p className="text-sm text-blue-800">
                                        💡 Payment is being held securely. It will be released to the therapist after you confirm session completion.
                                    </p>
                                </div>
                            )}

                            {payment.refundedAt && (
                                <div className="mt-4 bg-gray-50 border border-gray-200 rounded p-3">
                                    <p className="text-sm text-gray-600">
                                        Refunded on {new Date(payment.refundedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

}
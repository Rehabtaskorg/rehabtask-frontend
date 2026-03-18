"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function CustomerPaymentsPage() {
    usePageTitle("Payment History");
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
            intent_created: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300',
            escrowed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
            released: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
            refunded: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
            failed: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        };
        return colors[status] || 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400';
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
            <div className="p-4 md:p-6">
                <h1 className="text-2xl font-bold text-text-main dark:text-white mb-6">Payment History</h1>
                <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            <h1 className="text-2xl font-bold text-text-main dark:text-white mb-6">Payment History</h1>

            {payments.length === 0 ? (
                <div className="bg-background-light dark:bg-background-dark rounded-xl p-8 text-center">
                    <p className="text-text-muted dark:text-gray-400">No payment history yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {payments.map((payment) => (
                        <div
                            key={payment.id}
                            className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5"
                        >
                            {/* Header row — therapist + status badge */}
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                                <div>
                                    <h3 className="font-semibold text-text-main dark:text-white">
                                        {payment.booking.therapist.fullName}
                                    </h3>
                                    <p className="text-sm text-text-muted dark:text-gray-400">
                                        {payment.booking.offer.request.serviceType}
                                    </p>
                                    <p className="text-xs text-text-muted dark:text-gray-400 mt-1">
                                        Session: {new Date(payment.booking.scheduledDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`self-start px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>
                                    {getStatusText(payment.status)}
                                </span>
                            </div>

                            {/* Payment breakdown — 2 cols on mobile, 3 cols on sm+ */}
                            <div className="border-t border-border-light dark:border-border-dark pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                                <div>
                                    <p className="text-text-muted dark:text-gray-400">Amount Paid</p>
                                    <p className="font-semibold text-text-main dark:text-white">${payment.amount}</p>
                                </div>
                                <div>
                                    <p className="text-text-muted dark:text-gray-400">Transaction Date</p>
                                    <p className="text-text-main dark:text-slate-200">{new Date(payment.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <p className="text-text-muted dark:text-gray-400">Payment ID</p>
                                    <p className="text-xs text-text-muted dark:text-gray-400 truncate">{payment.id}</p>
                                </div>
                            </div>

                            {payment.status === 'escrowed' && (
                                <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg p-3">
                                    <p className="text-sm text-blue-800 dark:text-blue-300">
                                        💡 Payment is being held securely. It will be released to the therapist after you confirm session completion.
                                    </p>
                                </div>
                            )}

                            {payment.refundedAt && (
                                <div className="mt-4 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg p-3">
                                    <p className="text-sm text-text-muted dark:text-gray-400">
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
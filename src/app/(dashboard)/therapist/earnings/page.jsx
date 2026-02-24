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
            escrowed: "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300",
            released: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
        };
        return colors[status] || "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400";
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
            <div className="py-6 px-4 max-w-5xl mx-auto">
                <h1 className="text-2xl font-bold text-text-main dark:text-white mb-6">Earnings & Payouts</h1>
                <div className="animate-pulse space-y-4">
                    <div className="h-32 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl animate-pulse"></div>
                    <div className="h-24 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl animate-pulse"></div>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="py-6 px-4 max-w-5xl mx-auto">
                <h1 className="text-2xl font-bold text-text-main dark:text-white mb-6">Earnings & Payouts</h1>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                    <p className="text-red-800 dark:text-red-300">Failed to load earnings data</p>
                </div>
            </div>
        )
    }

    return (
        <div className="py-6 px-4 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-text-main dark:text-white mb-6">Earnings & Payouts</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6">
                    <p className="text-sm text-text-muted dark:text-gray-400 mb-1">Total Earnings</p>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                        ${data.totalEarnings?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-xs text-text-muted dark:text-gray-400 mt-1">All time</p>
                </div>

                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6">
                    <p className="text-sm text-text-muted dark:text-gray-400 mb-1">Pending Earnings</p>
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                        ${data.pendingEarnings?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-xs text-text-muted dark:text-gray-400 mt-1">Awaiting confirmation</p>
                </div>

                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6">
                    <p className="text-sm text-text-muted dark:text-gray-400 mb-1">Completed Sessions</p>
                    <p className="text-3xl font-bold text-primary">
                        {data.payments?.filter((p) => p.status === 'released').length || 0}
                    </p>
                    <p className="text-xs text-text-muted dark:text-gray-400 mt-1">Sessions paid out</p>
                </div>
            </div>

            {/* Payout History */}
            <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6">
                <h2 className="text-xl font-semibold text-text-main dark:text-white mb-4">Payout History</h2>

                {data.payments.length === 0 ? (
                    <div className="bg-background-light dark:bg-background-dark rounded-xl p-8 text-center">
                        <p className="text-text-muted dark:text-gray-400">No payout history yet</p>
                        <p className="text-sm text-text-muted dark:text-gray-400 mt-2">
                            Complete sessions to start earning
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {data.payments.map((payment) => (
                            <div
                                key={payment.id}
                                className="border border-border-light dark:border-border-dark rounded-xl p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                                    <div>
                                        <h3 className="font-semibold text-text-main dark:text-white">
                                            {payment.booking.customer.fullName}
                                        </h3>
                                        <p className="text-sm text-text-muted dark:text-gray-400">
                                            {payment.booking.offer.request.serviceType}
                                        </p>
                                        <p className="text-xs text-text-muted dark:text-gray-400 mt-1">
                                            Session: {new Date(payment.booking.scheduledDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span
                                        className={`self-start px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                            payment.status
                                        )}`}
                                    >
                                        {getStatusText(payment.status)}
                                    </span>
                                </div>

                                <div className="border-t border-border-light dark:border-border-dark pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                    <div>
                                        <p className="text-text-muted dark:text-gray-400">Session Rate</p>
                                        <p className="font-semibold text-text-main dark:text-white">${payment.amount}</p>
                                    </div>
                                    <div>
                                        <p className="text-text-muted dark:text-gray-400">Platform Fee (10%)</p>
                                        <p className="text-red-600 dark:text-red-400">-${payment.platformFee}</p>
                                    </div>
                                    <div>
                                        <p className="text-text-muted dark:text-gray-400">Your Earnings</p>
                                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                                            ${payment.therapistPayout}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-text-muted dark:text-gray-400">
                                            {payment.status === 'released' ? 'Paid On' : 'Created'}
                                        </p>
                                        <p className="text-xs text-text-main dark:text-white">
                                            {new Date(
                                                payment.releasedAt || payment.createdAt
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {payment.status === 'escrowed' && (
                                    <div className="mt-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-3">
                                        <p className="text-xs text-amber-800 dark:text-amber-300">
                                            💡 This payment is being held securely and will be released after the customer confirms session completion (or auto-confirms after 72 hours).
                                        </p>
                                    </div>
                                )}

                                {payment.stripeTransferId && (
                                    <div className="mt-2 text-xs text-text-muted dark:text-gray-400">
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
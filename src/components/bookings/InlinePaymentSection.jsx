"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { MdLock, MdInfo, MdCreditCard } from "react-icons/md";
import { api } from "@/lib/api";
import { paymentsApi } from "@/lib/payments.api";
import { resolveVisitPlan, computeTotalVisits } from "@/lib/visitPlan";
import { getStripeAppearance } from "@/lib/stripe.appearance";
import { formatCurrency } from "@/utils/messages";
import NewCardCheckoutForm from "./NewCardCheckoutForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const BRAND_LABELS = {
    visa: "Visa", mastercard: "Mastercard", amex: "Amex",
    discover: "Discover", diners: "Diners", jcb: "JCB", unionpay: "UnionPay",
};

export default function InlinePaymentSection({ booking, onPaymentSuccess }) {
    const [selectedPmId, setSelectedPmId] = useState(null);
    const [showNewCard, setShowNewCard] = useState(false);
    const [paying, setPaying] = useState(false);
    const [payError, setPayError] = useState(null);
    const [newCardClientSecret, setNewCardClientSecret] = useState(null);
    const [loadingNewCard, setLoadingNewCard] = useState(false);

    const { data: methods = [], isLoading: methodsLoading } = useQuery({
        queryKey: ["paymentMethods"],
        queryFn: async () => {
            const res = await paymentsApi.getPaymentMethods();
            return res.data.data;
        },
    });

    useEffect(() => {
        if (methods.length > 0 && !selectedPmId) {
            const defaultCard = methods.find((m) => m.isDefault) || methods[0];
            setSelectedPmId(defaultCard.id);
        }
    }, [methods.length]);

    const handlePayWithSavedCard = async () => {
        if (paying || !selectedPmId) return;
        setPaying(true);
        setPayError(null);
        try {
            const res = await api.post("/payments/create-intent", {
                bookingId: booking.id,
                paymentMethodId: selectedPmId,
            });
            const result = res.data.data;

            if (result.status === "succeeded") {
                onPaymentSuccess();
                return;
            }

            if (result.status === "requires_action" && result.clientSecret) {
                const stripeInstance = await stripePromise;
                const { error: confirmError, paymentIntent } = await stripeInstance.confirmCardPayment(
                    result.clientSecret,
                    { payment_method: selectedPmId }
                );
                if (confirmError) {
                    setPayError(confirmError.message);
                } else if (paymentIntent?.status === "succeeded") {
                    onPaymentSuccess();
                } else {
                    setPayError("Payment could not be completed. Please try again.");
                }
                return;
            }

            if (result.status === "processing") {
                setPayError("Payment is processing. Please wait a moment and refresh.");
                return;
            }

            setPayError("Payment could not be completed. Please try again or use a different card.");
        } catch (err) {
            setPayError(err.response?.data?.message || "Payment failed. Please try again.");
        } finally {
            setPaying(false);
        }
    };

    const handleShowNewCard = async () => {
        setLoadingNewCard(true);
        setPayError(null);
        try {
            const res = await api.post("/payments/create-intent", { bookingId: booking.id });
            setNewCardClientSecret(res.data.data.clientSecret);
            setShowNewCard(true);
        } catch (err) {
            setPayError(err.response?.data?.message || "Failed to start payment.");
        } finally {
            setLoadingNewCard(false);
        }
    };

    const perSessionRate = parseFloat(booking.rate);
    const plan = resolveVisitPlan({ booking, offer: booking.offer, request: booking.offer?.request });
    const sessionsCount = booking.sessions?.length > 1 ? booking.sessions.length : (computeTotalVisits(plan) ?? 1);
    const isMultiSession = sessionsCount > 1;
    const amount = formatCurrency(perSessionRate * sessionsCount);

    return (
        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6 space-y-5">
            <div className="flex items-center gap-2">
                <MdLock className="text-text-muted dark:text-gray-400" />
                <h3 className="text-base font-bold text-text-main dark:text-white">Complete Payment</h3>
            </div>

            <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2.5">
                <MdInfo className="text-blue-600 dark:text-blue-400 text-sm mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                    Your payment will be held securely until you confirm {isMultiSession ? "all sessions" : "session"} completion
                </p>
            </div>

            <div>
                {isMultiSession ? (
                    <>
                        <p className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wider">
                            {formatCurrency(perSessionRate)}/session × {sessionsCount} sessions
                        </p>
                        <p className="text-2xl font-black text-text-main dark:text-white">{amount}</p>
                    </>
                ) : (
                    <>
                        <p className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wider">Session Rate</p>
                        <p className="text-2xl font-black text-text-main dark:text-white">{amount}</p>
                    </>
                )}
            </div>

            {payError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2.5">
                    <p className="text-xs text-red-700 dark:text-red-300">{payError}</p>
                </div>
            )}

            {methodsLoading ? (
                <div className="flex justify-center py-6">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : !showNewCard ? (
                <>
                    {methods.length > 0 && (
                        <div className="space-y-2">
                            {methods.map((pm) => (
                                <label
                                    key={pm.id}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                                        selectedPmId === pm.id
                                            ? "border-primary bg-primary/5 dark:bg-primary/10"
                                            : "border-border-light dark:border-border-dark hover:border-slate-300 dark:hover:border-slate-600"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value={pm.id}
                                        checked={selectedPmId === pm.id}
                                        onChange={() => { setSelectedPmId(pm.id); setPayError(null); }}
                                        className="accent-primary"
                                    />
                                    <MdCreditCard className="text-lg text-text-muted dark:text-gray-400" />
                                    <div className="flex-1 min-w-0">
                                        <span className="text-sm font-bold text-text-main dark:text-white">
                                            {BRAND_LABELS[pm.brand] || pm.brand} &bull;&bull;&bull;&bull; {pm.last4}
                                        </span>
                                        <span className="text-xs text-text-muted dark:text-gray-400 ml-2">
                                            Expires {String(pm.expMonth).padStart(2, "0")}/{String(pm.expYear).slice(-2)}
                                        </span>
                                    </div>
                                    {pm.isDefault && (
                                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                            Default
                                        </span>
                                    )}
                                </label>
                            ))}
                        </div>
                    )}
                    <button
                        onClick={handleShowNewCard}
                        disabled={loadingNewCard}
                        className="text-sm text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50"
                    >
                        {loadingNewCard ? "Loading..." : methods.length > 0 ? "Use a different payment method" : "Enter card details"}
                    </button>
                    {methods.length > 0 && (
                        <button
                            onClick={handlePayWithSavedCard}
                            disabled={paying || !selectedPmId}
                            className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-colors disabled:opacity-50 text-sm"
                        >
                            {paying ? "Processing..." : `Pay ${amount}`}
                        </button>
                    )}
                </>
            ) : (
                newCardClientSecret && (
                    <div className="space-y-3">
                        {methods.length > 0 && (
                            <button
                                onClick={() => setShowNewCard(false)}
                                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                            >
                                &larr; Back to saved cards
                            </button>
                        )}
                        <Elements
                            stripe={stripePromise}
                            options={{ clientSecret: newCardClientSecret, appearance: getStripeAppearance() }}
                        >
                            <NewCardCheckoutForm booking={booking} onSuccess={onPaymentSuccess} />
                        </Elements>
                    </div>
                )
            )}

            <p className="text-[10px] text-text-muted dark:text-gray-500 text-center">Powered by Stripe</p>
        </div>
    );
}

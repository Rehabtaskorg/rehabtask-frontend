"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripeAppearance } from "@/lib/stripe.appearance";
import { paymentsApi } from "@/services/payment.api";
import {
    MdCreditCard, MdAdd, MdDeleteOutline, MdStar, MdStarOutline, MdLock,
} from "react-icons/md";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const BRAND_LABELS = {
    visa: "Visa",
    mastercard: "Mastercard",
    amex: "Amex",
    discover: "Discover",
    diners: "Diners",
    jcb: "JCB",
    unionpay: "UnionPay",
};

/**
 * Card entry form rendered inside Stripe Elements.
 *
 * @param {Object} props
 * @param {() => void} props.onSuccess - Called once the SetupIntent confirms.
 * @param {() => void} props.onCancel - Dismisses the form without saving.
 */
function SetupForm({ onSuccess, onCancel }) {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        setError(null);

        try {
            const { error: setupError } = await stripe.confirmSetup({
                elements,
                redirect: "if_required",
            });

            if (setupError) {
                setError(setupError.message);
            } else {
                onSuccess();
            }
        } catch (err) {
            setError("An unexpected error occurred.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            {error && (
                <p className="text-sm text-red-600 ">{error}</p>
            )}
            <div className="flex items-center gap-3">
                <button
                    type="submit"
                    disabled={!stripe || processing}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/20 transition-colors disabled:opacity-50"
                >
                    <MdLock className="text-base" />
                    {processing ? "Saving..." : "Save Card"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2.5 text-sm font-medium text-text-muted  hover:text-text-main  transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

/**
 * Saved payment methods: list, set default, remove, and add a new card through
 * a Stripe SetupIntent.
 */
export function PaymentMethodsTab() {
    const queryClient = useQueryClient();
    const [showAddForm, setShowAddForm] = useState(false);
    const [setupClientSecret, setSetupClientSecret] = useState(null);
    const [addCardLoading, setAddCardLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [actionError, setActionError] = useState(null);

    const { data: methods = [], isLoading, error } = useQuery({
        queryKey: ["paymentMethods"],
        queryFn: async () => {
            const res = await paymentsApi.getPaymentMethods();
            return res.data.data;
        },
    });

    const handleAddCard = async () => {
        if (addCardLoading) return;
        setAddCardLoading(true);
        setActionError(null);
        try {
            const res = await paymentsApi.createSetupIntent();
            setSetupClientSecret(res.data.data.clientSecret);
            setShowAddForm(true);
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to start card setup.");
        } finally {
            setAddCardLoading(false);
        }
    };

    const handleSetupSuccess = () => {
        setShowAddForm(false);
        setSetupClientSecret(null);
        queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
    };

    const handleRemove = async (pmId) => {
        if (!window.confirm("Remove this payment method?")) return;
        setActionLoading(pmId);
        setActionError(null);
        try {
            await paymentsApi.removePaymentMethod(pmId);
            queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to remove card.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleSetDefault = async (pmId) => {
        setActionLoading(pmId);
        setActionError(null);
        try {
            await paymentsApi.setDefaultPaymentMethod(pmId);
            queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to set default.");
        } finally {
            setActionLoading(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50  border border-red-200  rounded-xl p-6 text-center">
                <p className="text-sm text-red-700 ">
                    Failed to load payment methods. Please try again.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-text-main ">
                        Your Payment Methods
                    </h2>
                    <p className="text-sm text-text-muted ">
                        Manage your saved cards for faster checkout
                    </p>
                </div>
                {methods.length > 0 && !showAddForm && (
                    <button
                        onClick={handleAddCard}
                        disabled={addCardLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/20 transition-colors disabled:opacity-50"
                    >
                        <MdAdd className="text-lg" />
                        {addCardLoading ? "Loading..." : "Add Card"}
                    </button>
                )}
            </div>

            {actionError && (
                <div className="bg-red-50  border border-red-200  rounded-lg px-4 py-3">
                    <p className="text-sm text-red-700 ">{actionError}</p>
                </div>
            )}

            {methods.length > 0 && (
                <div className="space-y-3">
                    {methods.map((pm) => (
                        <div
                            key={pm.id}
                            className="flex items-center justify-between bg-card-light  border border-border-light  rounded-xl px-5 py-4 shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-100  rounded-lg flex items-center justify-center">
                                    <MdCreditCard className="text-xl text-text-muted " />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-text-main ">
                                        {BRAND_LABELS[pm.brand] || pm.brand} &bull;&bull;&bull;&bull; {pm.last4}
                                    </p>
                                    <p className="text-xs text-text-muted ">
                                        Expires {String(pm.expMonth).padStart(2, "0")}/{String(pm.expYear).slice(-2)}
                                    </p>
                                </div>
                                {pm.isDefault && (
                                    <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                                        Default
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {!pm.isDefault && (
                                    <button
                                        onClick={() => handleSetDefault(pm.id)}
                                        disabled={actionLoading === pm.id}
                                        className="p-2 text-text-muted  hover:text-primary transition-colors disabled:opacity-50"
                                        title="Set as default"
                                    >
                                        <MdStarOutline className="text-lg" />
                                    </button>
                                )}
                                {pm.isDefault && (
                                    <span className="p-2 text-primary" title="Default card">
                                        <MdStar className="text-lg" />
                                    </span>
                                )}
                                <button
                                    onClick={() => handleRemove(pm.id)}
                                    disabled={actionLoading === pm.id}
                                    className="p-2 text-text-muted  hover:text-red-500 transition-colors disabled:opacity-50"
                                    title="Remove card"
                                >
                                    <MdDeleteOutline className="text-lg" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {methods.length === 0 && !showAddForm && (
                <div className="bg-card-light  border border-border-light  rounded-xl p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100  rounded-full mb-4">
                        <MdCreditCard className="text-2xl text-text-muted " />
                    </div>
                    <h3 className="text-lg font-semibold text-text-main  mb-2">
                        No payment methods saved yet
                    </h3>
                    <p className="text-sm text-text-muted  mb-6">
                        Add a payment method to speed up future bookings
                    </p>
                    <button
                        onClick={handleAddCard}
                        disabled={addCardLoading}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/20 transition-colors disabled:opacity-50"
                    >
                        <MdAdd className="text-lg" />
                        {addCardLoading ? "Loading..." : "Add Payment Method"}
                    </button>
                </div>
            )}

            {showAddForm && setupClientSecret && (
                <div className="bg-card-light  border border-border-light  rounded-xl p-6">
                    <h3 className="text-sm font-bold text-text-main  uppercase tracking-wider mb-4">
                        Add New Card
                    </h3>
                    <Elements
                        stripe={stripePromise}
                        options={{ clientSecret: setupClientSecret, appearance: getStripeAppearance() }}
                    >
                        <SetupForm
                            onSuccess={handleSetupSuccess}
                            onCancel={() => { setShowAddForm(false); setSetupClientSecret(null); }}
                        />
                    </Elements>
                </div>
            )}
        </div>
    );
}

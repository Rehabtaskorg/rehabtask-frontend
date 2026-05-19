"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripeAppearance } from "@/lib/stripe.appearance";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import { usePageTitle } from "@/hooks/usePageTitle";
import { authAPi } from "@/lib/auth.api";
import { api } from "@/lib/api";
import { paymentsApi } from "@/lib/payments.api";
import {
    MdPerson, MdSecurity, MdBusiness, MdEdit, MdCheck, MdClose,
    MdCreditCard, MdAdd, MdDeleteOutline, MdStar, MdStarOutline, MdLock,
} from "react-icons/md";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const TABS = [
    { key: "account", label: "Account", icon: MdPerson },
    { key: "payment-methods", label: "Payment Methods", icon: MdCreditCard },
];

const BRAND_LABELS = {
    visa: "Visa",
    mastercard: "Mastercard",
    amex: "Amex",
    discover: "Discover",
    diners: "Diners",
    jcb: "JCB",
    unionpay: "UnionPay",
};

// ─── Setup Form (rendered inside Stripe Elements) ────────────────────────────
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

// ─── Payment Methods Tab ─────────────────────────────────────────────────────
function PaymentMethodsTab() {
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
            {/* Header */}
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

            {/* Card List */}
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

            {/* Empty State */}
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

            {/* Add Card Form (Stripe SetupElement) */}
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

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function CustomerProfilePage() {
    usePageTitle("Account Settings");
    const searchParams = useSearchParams();
    const tabFromUrl = searchParams.get("tab");
    const [activeTab, setActiveTab] = useState("account");

    const [user, setUser] = useState(null);
    const [editingAgency, setEditingAgency] = useState(false);
    const [agencyName, setAgencyName] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");

    useEffect(() => {
        if (tabFromUrl && TABS.some((t) => t.key === tabFromUrl)) {
            setActiveTab(tabFromUrl);
        }
    }, [tabFromUrl]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await authAPi.getCurrentUser();
                setUser(res.data.data.user);
            } catch (err) {
                // handled by layout
            }
        };
        fetchUser();
    }, []);

    const isAgency = user?.profile?.customerType === "agency";

    const handleStartEditAgency = () => {
        setAgencyName(user?.profile?.agencyName || "");
        setSaveError("");
        setEditingAgency(true);
    }

    const handleSaveAgencyName = async () => {
        setSaving(true);
        setSaveError("");
        try {
            await api.put("/customers/profile", { agencyName: agencyName.trim() });
            setUser((prev) => ({
                ...prev,
                profile: { ...prev.profile, agencyName: agencyName.trim() },
            }));
            setEditingAgency(false);
        } catch (err) {
            setSaveError(err.response?.data?.message || "Failed to update agency name.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
            {/* Page Header */}
            <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-primary/10 rounded-xl">
                    <MdPerson className="text-primary text-2xl" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-text-main ">
                        Profile Settings
                    </h1>
                    <p className="text-sm text-text-muted ">
                        Manage your account settings and security
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 bg-muted-light  p-1 rounded-xl overflow-x-auto">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.key;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                                isActive
                                    ? "bg-primary text-white shadow-sm"
                                    : "text-text-muted hover:text-text-main "
                            }`}
                        >
                            <Icon className="text-lg" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            {activeTab === "account" && (
                <>
                    {/* Agency Account Type Badge + Agency Name (agency only) */}
                    {isAgency && (
                        <div className="bg-card-light  border border-border-light  rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <MdBusiness className="text-primary text-xl" />
                                <span className="text-sm font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                                    Agency Account
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-text-muted  uppercase tracking-wider mb-1.5">
                                        Agency Name
                                    </label>
                                    {editingAgency ? (
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                value={agencyName}
                                                onChange={(e) => setAgencyName(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-lg border border-border-light  bg-background-light  text-text-main  text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="Enter your agency name"
                                            />
                                            {saveError && (
                                                <p className="text-xs text-red-500">{saveError}</p>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={handleSaveAgencyName}
                                                    disabled={saving}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    <MdCheck className="text-base" />
                                                    {saving ? "Saving..." : "Save"}
                                                </button>
                                                <button
                                                    onClick={() => setEditingAgency(false)}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-text-muted  hover:text-text-main  text-sm font-bold transition-colors"
                                                >
                                                    <MdClose className="text-base" />
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-text-main ">
                                                {user?.profile?.agencyName || "Not set"}
                                            </p>
                                            <button
                                                onClick={handleStartEditAgency}
                                                className="p-1.5 bg-slate-100  hover:bg-slate-200  rounded-lg transition-colors text-text-muted "
                                            >
                                                <MdEdit className="text-base" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Section Info Card */}
                    <div className="bg-linear-to-r from-blue-50 to-indigo-50   border border-blue-200  rounded-xl p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <MdSecurity className="text-blue-600  text-2xl" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-blue-900  mb-2">
                                    Account Security
                                </h3>
                                <p className="text-sm text-blue-800  mb-3">
                                    Keep your account secure by using a strong password and changing it regularly.
                                </p>
                                <div className="text-xs text-blue-700  space-y-1">
                                    <p>&#x1f4a1; <strong>Tip:</strong> Use a unique password that you don&apos;t use anywhere else</p>
                                    <p>&#x1f512; <strong>Best Practice:</strong> Change your password every 3-6 months</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <ChangePasswordForm />
                </>
            )}

            {activeTab === "payment-methods" && <PaymentMethodsTab />}
        </div>
    );
}
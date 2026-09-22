"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MdPerson, MdDescription, MdCreditCard, MdSecurity, MdRefresh } from "react-icons/md";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useCustomerProfile } from "@/hooks/useCustomerProfile";
import { useCustomerUser } from "@/contexts/CustomerUserContext";
import { CustomerLockedPageOverlay } from "@/components/customer/CustomerLockedPageOverlay";
import { APPROVAL_STATUS } from "@/lib/constants";
import { ProfileTab } from "./ProfileTab";
import { DocumentsTab } from "./DocumentsTab";
import { PaymentMethodsTab } from "./PaymentMethodsTab";
import { SecurityTab } from "./SecurityTab";
import { CustomerProfileSkeleton } from "./CustomerProfileSkeleton";

const TABS = [
    { key: "profile", label: "Profile", icon: MdPerson },
    { key: "documents", label: "Documents", icon: MdDescription },
    { key: "payment-methods", label: "Payment Methods", icon: MdCreditCard },
    { key: "security", label: "Security", icon: MdSecurity },
];

const EDITABLE_STATUSES = [APPROVAL_STATUS.APPROVED, APPROVAL_STATUS.REVIEW];

/**
 * Customer profile page shell: status gate, header, tab bar and panel
 * orchestration. Every field-level behaviour lives in the tabs below it.
 *
 * Gated to approved and in-review accounts. A rejected customer is sent to the
 * shared locked overlay, which routes them to `/customer/application-review` —
 * `rejected` permits editing every policy tier with no re-review server-side,
 * so this page must not be reachable in that state.
 */
export function CustomerProfileContent() {
    usePageTitle("My Profile");
    const searchParams = useSearchParams();
    const tabFromUrl = searchParams.get("tab");
    const [activeTab, setActiveTab] = useState("profile");
    const customer = useCustomerUser();
    const { profile, loading, error, refetch } = useCustomerProfile();

    useEffect(() => {
        if (tabFromUrl && TABS.some((t) => t.key === tabFromUrl)) {
            setActiveTab(tabFromUrl);
        }
    }, [tabFromUrl]);

    const contextStatus = customer?.approvalStatus ?? null;
    if (contextStatus && !EDITABLE_STATUSES.includes(contextStatus)) {
        return <CustomerLockedPageOverlay pageType="profile" />;
    }

    if (loading) {
        return <CustomerProfileSkeleton />;
    }

    if (error || !profile) {
        return (
            <div className="p-4 md:p-6">
                <Alert type="error" message="Failed to load your profile. Please try again." />
                <div className="mt-4">
                    <Button variant="secondary" onClick={refetch}>
                        <MdRefresh className="text-lg" aria-hidden="true" />
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    if (!EDITABLE_STATUSES.includes(profile.approvalStatus)) {
        return <CustomerLockedPageOverlay pageType="profile" />;
    }

    return (
        <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
            <div className="mb-8 flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-3">
                    <MdPerson className="text-2xl text-primary" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                    <h1 className="text-2xl font-bold text-text-main">My Profile</h1>
                    <p className="text-sm text-text-muted">
                        Manage your account details, documents and security
                    </p>
                </div>
            </div>

            <div className="mb-8 flex items-center gap-1 overflow-x-auto rounded-xl bg-muted-light p-1">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            aria-current={isActive ? "page" : undefined}
                            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isActive
                                ? "bg-primary text-white shadow-sm"
                                : "text-text-muted hover:text-text-main"
                                }`}
                        >
                            <Icon className="text-lg" aria-hidden="true" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {activeTab === "profile" && <ProfileTab profile={profile} />}
            {activeTab === "documents" && <DocumentsTab profile={profile} />}
            {activeTab === "payment-methods" && <PaymentMethodsTab />}
            {activeTab === "security" && <SecurityTab />}
        </div>
    );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/hooks/useAuth";
import { USER_ROLES } from "@/lib/constants";
import TwoFactorSettings from "@/components/profile/TwoFactorSettings";

export default function SecurityPage() {
    usePageTitle("Security");
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (loading || !user?.role) return;
        if (user.role === USER_ROLES.CUSTOMER) {
            router.replace("/customer/profile");
            return;
        }
        if (user.role === USER_ROLES.THERAPIST) {
            router.replace("/therapist/account-settings");
        }
    }, [user?.role, loading, router]);

    if (loading || user?.role === USER_ROLES.CUSTOMER || user?.role === USER_ROLES.THERAPIST) {
        return <div className="p-8 text-text-muted">Loading security settings...</div>;
    }

    return (
        <div className="flex-1 overflow-y-auto panel-scroll">
            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 space-y-6">
                <div>
                    <h1 className="text-2xl font-black text-text-main">Security</h1>
                    <p className="text-sm text-text-muted mt-1">Protect your RehabTask account with email or SMS verification.</p>
                </div>
                <TwoFactorSettings />
            </div>
        </div>
    );
}

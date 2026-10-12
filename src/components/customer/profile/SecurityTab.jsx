"use client";

import TwoFactorSettings from "@/components/profile/TwoFactorSettings";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";

/**
 * Account security tab. Both panels are shared with the therapist surface and
 * are rendered unchanged — this tab only groups them.
 */
export function SecurityTab() {
    return (
        <div className="space-y-6">
            <TwoFactorSettings />
            <ChangePasswordForm />
        </div>
    );
}

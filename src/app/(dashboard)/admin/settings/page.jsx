"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import { useAdminUser } from "@/contexts/AdminUserContext";
import CommissionRateCard from "@/components/admin/CommissionRateCard";
import CommissionHistoryTable from "@/components/admin/CommissionHistoryTable";
import PlatformInfoCard from "@/components/admin/PlatformInfoCard";

/**
 * Admin Settings page.
 * Sections: Platform Commission (view + edit) and Platform Configuration (read-only).
 * Write access to commission rate is restricted to full admin role only.
 */
export default function AdminSettingsPage() {
    usePageTitle("Settings");
    const adminUser = useAdminUser();
    const isFullAdmin = adminUser?.role === "admin";

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 flex items-center px-4 sm:px-8 shrink-0">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-text-main dark:text-white">
                    Settings
                </h2>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto panel-scroll">
                <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8">

                    {/* Section: Commission */}
                    <section className="space-y-4">
                        <div>
                            <h3 className="text-base font-bold text-text-main dark:text-white">
                                Commission
                            </h3>
                            <p className="text-sm text-text-muted dark:text-gray-400 mt-0.5">
                                Manage the platform commission rate applied to therapist payouts.
                            </p>
                        </div>
                        <CommissionRateCard canWrite={isFullAdmin} />
                        <CommissionHistoryTable />
                    </section>

                    {/* Section: Platform Configuration */}
                    <section className="space-y-4">
                        <div>
                            <h3 className="text-base font-bold text-text-main dark:text-white">
                                Platform Configuration
                            </h3>
                            <p className="text-sm text-text-muted dark:text-gray-400 mt-0.5">
                                System-level defaults configured at deployment time.
                            </p>
                        </div>
                        <PlatformInfoCard />
                    </section>

                </div>
            </div>
        </div>
    );
}
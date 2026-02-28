"use client";

import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import { usePageTitle } from "@/hooks/usePageTitle";
import { MdPerson, MdSecurity } from "react-icons/md";

export default function CustomerProfilePage() {
    usePageTitle("Account Settings");
    return (
        <div className="py-8 px-4 max-w-4xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl">
                    <MdPerson className="text-primary text-2xl" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-text-main dark:text-white">
                        Profile Settings
                    </h1>
                    <p className="text-sm text-text-muted dark:text-gray-400">
                        Manage your account settings and security
                    </p>
                </div>
            </div>

            {/* Security Section Info Card */}
            <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <MdSecurity className="text-blue-600 dark:text-blue-400 text-2xl" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">
                            Account Security
                        </h3>
                        <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                            Keep your account secure by using a strong password and changing it regularly.
                        </p>
                        <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                            <p>💡 <strong>Tip:</strong> Use a unique password that you don&apos;t use anywhere else</p>
                            <p>🔒 <strong>Best Practice:</strong> Change your password every 3-6 months</p>
                        </div>
                    </div>
                </div>
            </div>

            <ChangePasswordForm />

            {/* Future Sections Placeholder */}
            <div className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark rounded-xl p-6">
                <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mb-4">
                        <MdPerson className="text-gray-400 dark:text-gray-500 text-2xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-main dark:text-white mb-2">
                        More Settings Coming Soon
                    </h3>
                    <p className="text-sm text-text-muted dark:text-gray-400">
                        Additional profile management features will be available here
                    </p>
                </div>
            </div>
        </div>
    )
}
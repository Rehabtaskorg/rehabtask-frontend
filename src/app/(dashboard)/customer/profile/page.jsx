"use client";

import { useState, useEffect } from "react";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import { usePageTitle } from "@/hooks/usePageTitle";
import { authAPi } from "@/lib/auth.api";
import { api } from "@/lib/api";
import { MdPerson, MdSecurity, MdBusiness, MdEdit, MdCheck, MdClose } from "react-icons/md";

export default function CustomerProfilePage() {
    usePageTitle("Account Settings");
    const [user, setUser] = useState(null);
    const [editingAgency, setEditingAgency] = useState(false);
    const [agencyName, setAgencyName] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");

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
            // Update local state
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

            {/* Agency Account Type Badge + Agency Name (agency only) */}
            {isAgency && (
                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <MdBusiness className="text-primary text-xl" />
                        <span className="text-sm font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                            Agency Account
                        </span>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                Agency Name
                            </label>
                            {editingAgency ? (
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        value={agencyName}
                                        onChange={(e) => setAgencyName(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                                            className="flex items-center gap-1 px-3 py-1.5 text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white text-sm font-bold transition-colors"
                                        >
                                            <MdClose className="text-base" />
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-text-main dark:text-white">
                                        {user?.profile?.agencyName || "Not set"}
                                    </p>
                                    <button
                                        onClick={handleStartEditAgency}
                                        className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-text-muted dark:text-gray-400"
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
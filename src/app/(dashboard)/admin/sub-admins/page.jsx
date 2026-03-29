/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
    MdAdd,
    MdClose,
    MdSearch,
    MdWarning,
    MdShield,
} from "react-icons/md";
import {
    useAdminSubAdmins,
    useAdminUsers,
    useCreateSubAdmin,
    usePromoteSubAdmin,
    useUpdateSubAdminPermissions,
    useDeactivateSubAdmin,
    useReactivateSubAdmin,
    useResendSubAdminInvite,
} from "@/hooks/useAdmin";

const ALL_PERMISSIONS = [
    { key: "users", label: "User Management" },
    { key: "therapists", label: "Therapist Management" },
    { key: "disputes", label: "Dispute Management" },
    { key: "bookings", label: "Booking Management" },
    { key: "payments", label: "Payment Management" },
    { key: "subscriptions", label: "Subscription Management" },
    { key: "faqs", label: "FAQ Management" },
    { key: "notifications", label: "Notification Management" },
    { key: "commission", label: "Commission Management" },
];

function Skeleton({ className = "" }) {
    return (
        <div
            className={`animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${className}`}
        />
    );
}

const getSubAdminDisplayName = (user) =>
    user.subAdminProfile?.fullName ||
    user.customerProfile?.fullName ||
    user.therapistProfile?.fullName ||
    user.email?.split("@")[0] ||
    "Unknown";

const getSubAdminInitial = (user) => {
    const name = user.subAdminProfile?.fullName || user.customerProfile?.fullName || user.therapistProfile?.fullName || user.email;
    return (name?.[0] || "?").toUpperCase();
};

function StatusBadge({ isActive }) {
    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isActive
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                }`}
        >
            {isActive ? "Active" : "Deactivated"}
        </span>
    );
}

function PermissionsCheckboxes({ selected, onChange }) {
    const toggle = (key) =>
        onChange(
            selected.includes(key)
                ? selected.filter((k) => k !== key)
                : [...selected, key]
        );

    const allSelected = selected.length === ALL_PERMISSIONS.length;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                    Permissions
                </p>
                <button
                    type="button"
                    onClick={() =>
                        onChange(allSelected ? [] : ALL_PERMISSIONS.map((p) => p.key))
                    }
                    className="text-xs text-primary hover:underline"
                >
                    {allSelected ? "Deselect All" : "Select All"}
                </button>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
                {ALL_PERMISSIONS.map((perm) => (
                    <label
                        key={perm.key}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-background-dark cursor-pointer transition-colors"
                    >
                        <input
                            type="checkbox"
                            checked={selected.includes(perm.key)}
                            onChange={() => toggle(perm.key)}
                            className="w-4 h-4 rounded accent-primary shrink-0"
                        />
                        <span className="text-sm text-text-main dark:text-white">{perm.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

function AddSubAdminModal({ onClose }) {
    const [mode, setMode] = useState("invite");
    const [email, setEmail] = useState("");
    const [userSearch, setUserSearch] = useState("");
    const [searchDebounced, setSearchDebounced] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [error, setError] = useState("");

    const createMutation = useCreateSubAdmin();
    const promoteMutation = usePromoteSubAdmin();

    // Debounce user search input
    useEffect(() => {
        const t = setTimeout(() => setSearchDebounced(userSearch), 400);
        return () => clearTimeout(t);
    }, [userSearch]);

    const shouldSearch = mode === "promote" && searchDebounced.trim().length >= 2;

    const { data: usersData, isLoading: usersLoading } = useAdminUsers(
        shouldSearch ? { search: searchDebounced.trim(), limit: 8 } : {}
    );
    const searchResults = shouldSearch ? (usersData?.users ?? []) : [];

    const isPending = createMutation.isPending || promoteMutation.isPending;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (permissions.length === 0) {
            setError("Select at least one permission.");
            return;
        }
        try {
            if (mode === "invite") {
                if (!email.trim()) { setError("Email is required."); return; }
                await createMutation.mutateAsync({ email: email.trim(), permissions });
            } else {
                if (!selectedUser) { setError("Select a user to promote."); return; }
                await promoteMutation.mutateAsync({ userId: selectedUser.id, permissions });
            }
            onClose();
        } catch (err) {
            setError(err?.response?.data?.message ?? "Something went wrong.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative bg-card-light dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark w-full max-w-md shadow-xl flex flex-col max-h-[90dvh]">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border-light dark:border-border-dark shrink-0">
                    <h2 className="font-semibold text-text-main dark:text-white">Add Sub-Admin</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-background-light dark:hover:bg-background-dark text-text-muted"
                    >
                        <MdClose size={18} />
                    </button>
                </div>

                {/* Mode switcher */}
                <div className="px-5 pt-4 shrink-0">
                    <div className="flex bg-background-light dark:bg-background-dark rounded-lg p-1 border border-border-light dark:border-border-dark">
                        {[
                            { key: "invite", label: "Invite New User" },
                            { key: "promote", label: "Promote Existing" },
                        ].map((t) => (
                            <button
                                key={t.key}
                                type="button"
                                onClick={() => {
                                    setMode(t.key);
                                    setError("");
                                    setSelectedUser(null);
                                    setUserSearch("");
                                }}
                                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === t.key
                                    ? "bg-card-light dark:bg-card-dark text-text-main dark:text-white shadow-sm"
                                    : "text-text-muted hover:text-text-main dark:hover:text-white"
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col flex-1 overflow-hidden"
                >
                    <div className="flex-1 overflow-y-auto panel-scroll px-5 py-4 space-y-4">
                        {/* Invite tab */}
                        {mode === "invite" && (
                            <div>
                                <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <p className="text-xs text-text-muted mt-1">
                                    An invitation email will be sent to this address.
                                </p>
                            </div>
                        )}

                        {/* Promote tab */}
                        {mode === "promote" && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                                    Search User <span className="text-red-500">*</span>
                                </label>

                                {/* Selected user chip */}
                                {selectedUser ? (
                                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                                        <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                                            {getSubAdminInitial(selectedUser)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-text-main dark:text-white truncate">
                                                {getSubAdminDisplayName(selectedUser)}
                                            </p>
                                            <p className="text-xs text-text-muted truncate">
                                                {selectedUser.email}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedUser(null)}
                                            className="text-text-muted hover:text-text-main dark:hover:text-white shrink-0"
                                        >
                                            <MdClose size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="relative">
                                            <MdSearch
                                                size={16}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                                            />
                                            <input
                                                type="text"
                                                value={userSearch}
                                                onChange={(e) => setUserSearch(e.target.value)}
                                                placeholder="Search by name or email…"
                                                className="w-full pl-8 pr-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>

                                        {/* Results dropdown */}
                                        {shouldSearch && (
                                            <div className="border border-border-light dark:border-border-dark rounded-lg overflow-hidden max-h-44 overflow-y-auto">
                                                {usersLoading ? (
                                                    <div className="p-3 space-y-2">
                                                        {[...Array(3)].map((_, i) => (
                                                            <Skeleton key={i} className="h-8 w-full" />
                                                        ))}
                                                    </div>
                                                ) : searchResults.length === 0 ? (
                                                    <p className="p-3 text-sm text-text-muted text-center">
                                                        No users found.
                                                    </p>
                                                ) : (
                                                    searchResults.map((u) => (
                                                        <button
                                                            key={u.id}
                                                            type="button"
                                                            onClick={() => setSelectedUser(u)}
                                                            className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-background-light dark:hover:bg-background-dark text-left transition-colors border-b border-border-light dark:border-border-dark last:border-0"
                                                        >
                                                            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                                                                {getSubAdminInitial(u)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm text-text-main dark:text-white truncate">
                                                                    {getSubAdminDisplayName(u)}
                                                                </p>
                                                                <p className="text-xs text-text-muted truncate">
                                                                    {u.email}
                                                                </p>
                                                            </div>
                                                            <span className="text-xs text-text-muted capitalize shrink-0">
                                                                {u.role}
                                                            </span>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        )}

                                        {!shouldSearch && (
                                            <p className="text-xs text-text-muted">
                                                Type at least 2 characters to search.
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        <PermissionsCheckboxes
                            selected={permissions}
                            onChange={setPermissions}
                        />

                        {error && (
                            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                <MdWarning size={16} />
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-4 border-t border-border-light dark:border-border-dark shrink-0 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 rounded-lg border border-border-light dark:border-border-dark text-text-muted text-sm hover:bg-background-light dark:hover:bg-background-dark"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-medium disabled:opacity-50"
                        >
                            {isPending
                                ? "Processing…"
                                : mode === "invite"
                                    ? "Send Invite"
                                    : "Promote User"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SubAdminSidePanel({ subAdmin, onClose }) {
    const [permissions, setPermissions] = useState(
        subAdmin?.subAdminProfile?.permissions ?? []
    );
    const [dirty, setDirty] = useState(false);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");

    const [confirmDeactivate, setConfirmDeactivate] = useState(false);
    const [confirmReactivate, setConfirmReactivate] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const updateMutation = useUpdateSubAdminPermissions();
    const deactivateMutation = useDeactivateSubAdmin();
    const reactivateMutation = useReactivateSubAdmin();
    const resendMutation = useResendSubAdminInvite();

    // Sync when selected sub-admin changes
    useEffect(() => {
        const perms = subAdmin?.subAdminProfile?.permissions ?? [];
        setPermissions(perms);
        setDirty(false);
        setError("");
        setActionError("");
        setResendSuccess(false);
    }, [subAdmin.id, subAdmin?.subAdminProfile?.permissions]);

    const handlePermissionsChange = (newPerms) => {
        setPermissions(newPerms);
        const original = subAdmin?.subAdminProfile?.permissions ?? [];
        setDirty(
            newPerms.length !== original.length ||
            newPerms.some((p) => !original.includes(p))
        );
    };

    const handleSavePermissions = async () => {
        setError("");
        try {
            await updateMutation.mutateAsync({ userId: subAdmin.id, permissions });
            setDirty(false);
        } catch (err) {
            setError(err?.response?.data?.message ?? "Failed to save permissions.");
        }
    };

    if (!subAdmin) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                onClick={onClose}
            />
            <aside className="fixed right-0 top-14 lg:top-0 h-[calc(100dvh-3.5rem)] lg:h-dvh max-w-95 w-full bg-card-light dark:bg-card-dark border-l border-border-light dark:border-border-dark z-40 lg:z-20 flex flex-col shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border-light dark:border-border-dark shrink-0">
                    <h2 className="font-semibold text-text-main dark:text-white text-sm">
                        Sub-Admin Detail
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-background-light dark:hover:bg-background-dark text-text-muted"
                    >
                        <MdClose size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto panel-scroll p-4 space-y-5">
                    {/* Identity */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center text-lg font-bold shrink-0">
                            {getSubAdminInitial(subAdmin)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-text-main dark:text-white truncate">
                                {getSubAdminDisplayName(subAdmin)}
                            </p>
                            <p className="text-sm text-text-muted truncate">
                                {subAdmin.email}
                            </p>
                            <div className="mt-1.5">
                                {!subAdmin.emailVerified ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                        Pending Invite
                                    </span>
                                ) : (
                                    <StatusBadge isActive={subAdmin.isActive} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Meta */}
                    <dl className="space-y-1.5 text-xs">
                        {subAdmin.subAdminProfile?.createdByAdmin && (
                            <div className="flex justify-between gap-3">
                                <dt className="text-text-muted">Added by</dt>
                                <dd className="text-text-main dark:text-white truncate max-w-40 text-right">
                                    {subAdmin.subAdminProfile.createdByAdmin.email}
                                </dd>
                            </div>
                        )}
                        {subAdmin.subAdminProfile?.createdAt && (
                            <div className="flex justify-between gap-3">
                                <dt className="text-text-muted">Added on</dt>
                                <dd className="text-text-main dark:text-white">
                                    {new Date(subAdmin.subAdminProfile.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </dd>
                            </div>
                        )}
                        <div className="flex justify-between gap-3">
                            <dt className="text-text-muted">Invite status</dt>
                            <dd>
                                {subAdmin.emailVerified ? (
                                    <span className="text-green-600 dark:text-green-400 font-medium">Accepted</span>
                                ) : (
                                    <span className="text-amber-600 dark:text-amber-400 font-medium">Pending</span>
                                )}
                            </dd>
                        </div>
                    </dl>

                    {/* Permissions */}
                    <PermissionsCheckboxes
                        selected={permissions}
                        onChange={handlePermissionsChange}
                    />

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                            <MdWarning size={16} />
                            {error}
                        </div>
                    )}

                    {dirty && (
                        <button
                            onClick={handleSavePermissions}
                            disabled={updateMutation.isPending}
                            className="w-full py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-medium disabled:opacity-50"
                        >
                            {updateMutation.isPending ? "Saving…" : "Save Permissions"}
                        </button>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-border-light dark:border-border-dark shrink-0 space-y-2">
                    {!subAdmin.emailVerified && (
                        <div>
                            {resendSuccess ? (
                                <p className="text-xs text-green-600 dark:text-green-400 text-center py-2">
                                    Invite resent successfully.
                                </p>
                            ) : (
                                <>
                                    {resendMutation.error && (
                                        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mb-1.5">
                                            <MdWarning size={13} />
                                            {resendMutation.error?.response?.data?.message ?? "Failed to resend invite."}
                                        </p>
                                    )}
                                    <button
                                        onClick={async () => {
                                            try {
                                                await resendMutation.mutateAsync(subAdmin.id);
                                                setResendSuccess(true);
                                            } catch { /* shown via resendMutation.error */ }
                                        }}
                                        disabled={resendMutation.isPending}
                                        className="w-full py-2 rounded-lg border border-border-light dark:border-border-dark text-sm font-medium text-text-main dark:text-white hover:bg-background-light dark:hover:bg-background-dark disabled:opacity-50"
                                    >
                                        {resendMutation.isPending ? "Sending…" : "Resend Invite"}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                    {subAdmin.isActive ? (
                        confirmDeactivate ? (
                            <div className="space-y-2">
                                <p className="text-xs text-red-600 dark:text-red-400">This sub-admin will be unable to log in or access the platform.</p>
                                {actionError && (
                                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <MdWarning size={13} /> {actionError}
                                    </p>
                                )}
                                <div className="flex gap-2">
                                    <button
                                        onClick={async () => {
                                            setActionError("");
                                            try {
                                                await deactivateMutation.mutateAsync(subAdmin.id);
                                                setConfirmDeactivate(false);
                                            } catch (err) {
                                                setActionError(err?.response?.data?.message ?? "Failed to deactivate.");
                                            }
                                        }}
                                        disabled={deactivateMutation.isPending}
                                        className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {deactivateMutation.isPending ? "Deactivating…" : "Confirm"}
                                    </button>
                                    <button
                                        onClick={() => { setConfirmDeactivate(false); setActionError(""); }}
                                        className="flex-1 py-2 rounded-lg border border-border-light dark:border-border-dark text-sm font-medium text-text-main dark:text-white hover:bg-background-light dark:hover:bg-background-dark"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setConfirmDeactivate(true)}
                                disabled={deactivateMutation.isPending}
                                className="w-full py-2 rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium disabled:opacity-50"
                            >
                                Deactivate Sub-Admin
                            </button>
                        )
                    ) : (
                        confirmReactivate ? (
                            <div className="space-y-2">
                                <p className="text-xs text-emerald-600 dark:text-emerald-400">This will restore the sub-admin&apos;s access to the platform.</p>
                                {actionError && (
                                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <MdWarning size={13} /> {actionError}
                                    </p>
                                )}
                                <div className="flex gap-2">
                                    <button
                                        onClick={async () => {
                                            setActionError("");
                                            try {
                                                await reactivateMutation.mutateAsync(subAdmin.id);
                                                setConfirmReactivate(false);
                                            } catch (err) {
                                                setActionError(err?.response?.data?.message ?? "Failed to reactivate.");
                                            }
                                        }}
                                        disabled={reactivateMutation.isPending}
                                        className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-50"
                                    >
                                        {reactivateMutation.isPending ? 'Processing…' : 'Confirm'}
                                    </button>
                                    <button
                                        onClick={() => { setConfirmReactivate(false); setActionError(""); }}
                                        className="flex-1 py-2 rounded-lg border border-border-light dark:border-border-dark text-sm font-medium text-text-main dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setConfirmReactivate(true)}
                                disabled={reactivateMutation.isPending}
                                className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium disabled:opacity-50"
                            >
                                Reactivate Sub-Admin
                            </button>
                        )
                    )}
                </div>
            </aside>
        </>
    );
}

export default function AdminSubAdminsPage() {
    usePageTitle("Sub-Admins");
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedSubAdmin, setSelectedSubAdmin] = useState(null);

    const { data, isLoading } = useAdminSubAdmins();
    const subAdmins = data?.subAdmins ?? [];

    // Keep selectedSubAdmin in sync with fresh query data
    const resolvedSubAdmin = selectedSubAdmin
        ? subAdmins.find((sa) => sa.id === selectedSubAdmin.id) ?? selectedSubAdmin
        : null;

    return (
        <div
            className={`flex-1 transition-all duration-300 ${selectedSubAdmin ? "lg:mr-95" : ""}`}
        >
            <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-text-main dark:text-white">
                            Sub-Admin Management
                        </h1>
                        <p className="text-sm text-text-muted mt-0.5">
                            {subAdmins.length} sub-admin
                            {subAdmins.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-medium"
                    >
                        <MdAdd size={18} />
                        Add Sub-Admin
                    </button>
                </div>

                {/* Table */}
                <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted hidden md:table-cell">
                                        Email
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">
                                        Permissions
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                {isLoading ? (
                                    [...Array(4)].map((_, i) => (
                                        <tr key={i}>
                                            {[...Array(4)].map((_, j) => (
                                                <td key={j} className="px-4 py-3">
                                                    <Skeleton className="h-4 w-full" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : subAdmins.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-14 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <MdShield size={32} className="text-text-muted" />
                                                <p className="text-sm text-text-muted">
                                                    No sub-admins yet.
                                                </p>
                                                <button
                                                    onClick={() => setShowAddModal(true)}
                                                    className="text-sm text-primary hover:underline"
                                                >
                                                    Add the first one
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    subAdmins.map((sa) => {
                                        const perms = sa.subAdminProfile?.permissions ?? [];
                                        const allAccess = perms.length === ALL_PERMISSIONS.length;

                                        return (
                                            <tr
                                                key={sa.id}
                                                onClick={() =>
                                                    setSelectedSubAdmin(
                                                        selectedSubAdmin?.id === sa.id ? null : sa
                                                    )
                                                }
                                                className={`cursor-pointer transition-colors hover:bg-background-light dark:hover:bg-background-dark ${selectedSubAdmin?.id === sa.id
                                                    ? "bg-primary/5 dark:bg-primary/10"
                                                    : ""
                                                    }`}
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                                                            {getSubAdminInitial(sa)}
                                                        </div>
                                                        <span className="text-text-main dark:text-white font-medium truncate max-w-25">
                                                            {getSubAdminDisplayName(sa)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-text-muted hidden md:table-cell truncate max-w-45">
                                                    {sa.email}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {perms.length === 0 ? (
                                                            <span className="text-xs text-text-muted">
                                                                None
                                                            </span>
                                                        ) : allAccess ? (
                                                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                                                All access
                                                            </span>
                                                        ) : (
                                                            <>
                                                                {perms.slice(0, 2).map((p) => (
                                                                    <span
                                                                        key={p}
                                                                        className="text-xs px-2 py-0.5 rounded-full bg-background-light dark:bg-background-dark text-text-muted capitalize"
                                                                    >
                                                                        {p}
                                                                    </span>
                                                                ))}
                                                                {perms.length > 2 && (
                                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-background-light dark:bg-background-dark text-text-muted">
                                                                        +{perms.length - 2}
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {!sa.emailVerified ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                                            Pending Invite
                                                        </span>
                                                    ) : (
                                                        <StatusBadge isActive={sa.isActive} />
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Side Panel */}
            {resolvedSubAdmin && (
                <SubAdminSidePanel
                    subAdmin={resolvedSubAdmin}
                    onClose={() => setSelectedSubAdmin(null)}
                />
            )}

            {/* Add Modal */}
            {showAddModal && (
                <AddSubAdminModal onClose={() => setShowAddModal(false)} />
            )}
        </div>
    );
}
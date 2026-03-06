"use client";

import { useState, useEffect, useMemo } from "react";
import {
    MdNotifications,
    MdSend,
    MdWarning,
    MdSearch,
    MdClose,
    MdCheckCircle,
    MdError,
    MdChevronLeft,
    MdChevronRight,
} from "react-icons/md";
import {
    useAdminNotifications,
    useBroadcastNotification,
    useAdminUsers,
} from "@/hooks/useAdmin";

const ROLES = [
    { value: "all", label: "All Users" },
    { value: "customer", label: "Customers" },
    { value: "therapist", label: "Therapists" },
    { value: "admin", label: "Admins" },
    { value: "sub_admin", label: "Sub-Admins" },
];

const NOTIFICATION_TYPES = [
    { value: "general", label: "General" },
    { value: "system", label: "System" },
    { value: "booking_update", label: "Booking Update" },
    { value: "payment_update", label: "Payment Update" },
    { value: "offer_update", label: "Offer Update" },
    { value: "promotion", label: "Promotion" },
];

const TYPE_COLORS = {
    general: "bg-gray-100  text-gray-700   dark:bg-gray-800      dark:text-gray-300",
    system: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    booking_update: "bg-blue-100  text-blue-800   dark:bg-blue-900/30   dark:text-blue-300",
    payment_update: "bg-green-100 text-green-800  dark:bg-green-900/30  dark:text-green-300",
    offer_update: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    promotion: "bg-pink-100  text-pink-800   dark:bg-pink-900/30   dark:text-pink-300",
};

function Skeleton({ className = "" }) {
    return (
        <div
            className={`animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${className}`}
        />
    );
}

const fmtDate = (d) =>
    d
        ? new Date(d).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
        : "—";

function TypeBadge({ type }) {
    const cls =
        TYPE_COLORS[type] ??
        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}
        >
            {type?.replace(/_/g, " ") ?? "—"}
        </span>
    );
}

function UserPicker({ value, onChange }) {
    const [search, setSearch] = useState("");
    const [debounced, setDebounced] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setDebounced(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    const shouldFetch = debounced.trim().length >= 2;
    const { data, isLoading } = useAdminUsers(
        shouldFetch ? { search: debounced.trim(), limit: 6 } : {}
    );
    const results = shouldFetch ? (data?.users ?? []) : [];

    const select = (user) => {
        onChange(user);
        setDropdownOpen(false);
        setSearch("");
    };

    if (value) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/30 bg-primary/5 text-sm">
                <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                    {value.firstName?.[0] ?? "?"}
                </div>
                <span className="text-text-main truncate flex-1">
                    {value.firstName} {value.lastName}
                </span>
                <button
                    onClick={() => onChange(null)}
                    className="text-text-muted hover:text-text-main dark:hover:text-white shrink-0"
                >
                    <MdClose size={14} />
                </button>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="relative">
                <MdSearch
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setDropdownOpen(true);
                    }}
                    onFocus={() => setDropdownOpen(true)}
                    placeholder="Filter by user…"
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-text-main dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            {dropdownOpen && shouldFetch && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg shadow-lg z-20 overflow-hidden max-h-48 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-3 space-y-2">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-7 w-full" />
                            ))}
                        </div>
                    ) : results.length === 0 ? (
                        <p className="p-3 text-sm text-text-muted text-center">
                            No users found.
                        </p>
                    ) : (
                        results.map((u) => (
                            <button
                                key={u.id}
                                onClick={() => select(u)}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-background-light dark:hover:bg-background-dark text-left transition-colors border-b border-border-light dark:border-border-dark last:border-0"
                            >
                                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                                    {u.firstName?.[0] ?? "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-text-main dark:text-white truncate">
                                        {u.firstName} {u.lastName}
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
        </div>
    );
}

function AllNotificationsTab() {
    const [selectedUser, setSelectedUser] = useState(null);
    const [typeFilter, setTypeFilter] = useState("");
    const [failedOnly, setFailedOnly] = useState(false);
    const [page, setPage] = useState(1);

    const handleUserChange = (user) => {
        setSelectedUser(user);
        setPage(1);
    };

    const handleTypeChange = (type) => {
        setTypeFilter(type);
        setPage(1);
    };

    const handleFailedChange = () => {
        setFailedOnly((v) => !v);
        setPage(1);
    };

    const params = useMemo(() => {
        const p = { page, limit: 20 };
        if (selectedUser) p.userId = selectedUser.id;
        if (typeFilter) p.type = typeFilter;
        if (failedOnly) p.failed = true;
        return p;
    }, [selectedUser, typeFilter, failedOnly, page]);

    const { data, isLoading } = useAdminNotifications(params);
    const notifications = data?.notifications ?? [];
    const pagination    = data?.pagination    ?? {};

    const hasFilters = selectedUser || typeFilter || failedOnly;

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="w-56">
                    <UserPicker value={selectedUser} onChange={handleUserChange} />
                </div>

                <select
                    value={typeFilter}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-text-main dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="">All Types</option>
                    {NOTIFICATION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                            {t.label}
                        </option>
                    ))}
                </select>

                <button
                    onClick={handleFailedChange}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${failedOnly
                        ? "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                        : "border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-text-muted hover:text-text-main dark:hover:text-white"
                        }`}
                >
                    <MdError size={16} />
                    Failed Only
                </button>

                {hasFilters && (
                    <button
                        onClick={() => {
                            setSelectedUser(null);
                            setTypeFilter("");
                            setFailedOnly(false);
                            setPage(1);
                        }}
                        className="text-xs text-primary hover:underline"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">
                                    User
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">
                                    Type
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">
                                    Title & Message
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">
                                    Read
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted hidden lg:table-cell">
                                    Sent
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light dark:divide-border-dark">
                            {isLoading ? (
                                [...Array(8)].map((_, i) => (
                                    <tr key={i}>
                                        {[...Array(5)].map((_, j) => (
                                            <td key={j} className="px-4 py-3">
                                                <Skeleton className="h-4 w-full" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : notifications.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-12 text-center text-sm text-text-muted"
                                    >
                                        No notifications found.
                                    </td>
                                </tr>
                            ) : (
                                notifications.map((n) => (
                                    <tr
                                        key={n.id}
                                        className="hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                                                    {n.user?.firstName?.[0] ?? "?"}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium text-text-main dark:text-white truncate max-w-22.5">
                                                        {n.user?.firstName} {n.user?.lastName}
                                                    </p>
                                                    <p className="text-xs text-text-muted truncate max-w-22.5">
                                                        {n.user?.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <TypeBadge type={n.type} />
                                        </td>
                                        <td className="px-4 py-3 max-w-55">
                                            <p className="text-xs font-medium text-text-main dark:text-white truncate">
                                                {n.title}
                                            </p>
                                            <p className="text-xs text-text-muted truncate">
                                                {n.message}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            {n.read ? (
                                                <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                                    <MdCheckCircle size={14} />
                                                    Read
                                                </span>
                                            ) : (
                                                <span className="text-xs text-text-muted">
                                                    Unread
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-text-muted hidden lg:table-cell whitespace-nowrap">
                                            {fmtDate(n.createdAt)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border-light dark:border-border-dark">
                        <p className="text-xs text-text-muted">
                            Page {pagination.page} of {pagination.totalPages}
                            {pagination.total ? ` · ${pagination.total} total` : ""}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-1.5 rounded-lg border border-border-light dark:border-border-dark text-text-muted hover:text-text-main dark:hover:text-white disabled:opacity-40"
                            >
                                <MdChevronLeft size={18} />
                            </button>
                            <button
                                onClick={() => setPage((p) => p + 1)}
                                disabled={page >= pagination.totalPages}
                                className="p-1.5 rounded-lg border border-border-light dark:border-border-dark text-text-muted hover:text-text-main dark:hover:text-white disabled:opacity-40"
                            >
                                <MdChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const EMPTY_BROADCAST = { role: "all", type: "general", title: "", message: "" };

function BroadcastTab() {
    const broadcastMutation = useBroadcastNotification();

    const [form, setForm] = useState(EMPTY_BROADCAST);
    const [customType, setCustomType] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const set = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        setSuccess(false);
        setError("");
    };

    const handleTypeSelect = (e) => {
        if (e.target.value === "__custom__") {
            setCustomType(true);
            setForm((prev) => ({ ...prev, type: "" }));
        } else {
            set("type")(e);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        if (!form.title.trim()) { setError("Title is required."); return; }
        if (!form.message.trim()) { setError("Message is required."); return; }
        if (!form.type.trim()) { setError("Type is required."); return; }
        try {
            await broadcastMutation.mutateAsync({
                role: form.role,
                type: form.type.trim(),
                title: form.title.trim(),
                message: form.message.trim(),
            });
            setSuccess(true);
            setForm(EMPTY_BROADCAST);
            setCustomType(false);
        } catch (err) {
            setError(err?.response?.data?.message ?? "Failed to send broadcast.");
        }
    };

    return (
        <div className="max-w-xl">
            <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6 space-y-5">
                <div>
                    <h3 className="font-semibold text-text-main dark:text-white">
                        Send Broadcast Notification
                    </h3>
                    <p className="text-sm text-text-muted mt-0.5">
                        Push an in-app notification to a group of users.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Target audience */}
                    <div>
                        <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                            Target Audience
                        </label>
                        <select
                            value={form.role}
                            onChange={set("role")}
                            className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {ROLES.map((r) => (
                                <option key={r.value} value={r.value}>
                                    {r.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Notification type */}
                    <div>
                        <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                            Notification Type
                        </label>
                        {customType ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={form.type}
                                    onChange={set("type")}
                                    placeholder="e.g. custom_alert"
                                    className="flex-1 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCustomType(false);
                                        setForm((prev) => ({ ...prev, type: "general" }));
                                    }}
                                    className="px-3 py-2 rounded-lg border border-border-light dark:border-border-dark text-text-muted text-sm hover:bg-background-light dark:hover:bg-background-dark whitespace-nowrap"
                                >
                                    Use predefined
                                </button>
                            </div>
                        ) : (
                            <select
                                value={form.type}
                                onChange={handleTypeSelect}
                                className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                {NOTIFICATION_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>
                                        {t.label}
                                    </option>
                                ))}
                                <option value="__custom__">Custom…</option>
                            </select>
                        )}
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={set("title")}
                            placeholder="Notification title"
                            maxLength={100}
                            className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <p className="text-xs text-text-muted mt-1 text-right">
                            {form.title.length}/100
                        </p>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                            Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={form.message}
                            onChange={set("message")}
                            rows={4}
                            placeholder="Write your notification message…"
                            maxLength={500}
                            className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <p className="text-xs text-text-muted mt-1 text-right">
                            {form.message.length}/500
                        </p>
                    </div>

                    {/* Live preview */}
                    {(form.title || form.message) && (
                        <div className="border border-border-light dark:border-border-dark rounded-lg p-3 bg-background-light dark:bg-background-dark space-y-2">
                            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                                Preview
                            </p>
                            <div className="flex items-start gap-2.5">
                                <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                                    <MdNotifications size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-text-main dark:text-white">
                                        {form.title || "Title"}
                                    </p>
                                    <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                                        {form.message || "Message"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                            <MdWarning size={16} />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <MdCheckCircle size={16} />
                            Broadcast sent successfully.
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={broadcastMutation.isPending}
                        className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <MdSend size={16} />
                        {broadcastMutation.isPending ? "Sending…" : "Send Broadcast"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function AdminNotificationsPage() {
    const [activeTab, setActiveTab] = useState("all");

    return (
        <div className="flex-1 p-4 lg:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-text-main dark:text-white">Notifications</h1>
                    <p className="text-sm text-text-muted mt-0.5">
                        View system notifications and send broadcasts
                    </p>
                </div>
                <div className="flex bg-background-light dark:bg-background-dark rounded-lg p-1 border border-border-light dark:border-border-dark">
                    {[
                        { key: "all", label: "All Notifications" },
                        { key: "broadcast", label: "Broadcast" },
                    ].map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setActiveTab(t.key)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === t.key
                                ? "bg-card-light dark:bg-card-dark text-text-main dark:text-white shadow-sm"
                                : "text-text-muted hover:text-text-main dark:hover:text-white"
                                }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === "all" ? <AllNotificationsTab /> : <BroadcastTab />}
        </div>
    );
}

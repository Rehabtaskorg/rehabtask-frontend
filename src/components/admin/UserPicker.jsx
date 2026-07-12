"use client";

import { useState, useEffect } from "react";
import { MdSearch, MdClose } from "react-icons/md";
import { useAdminUsers } from "@/hooks/useAdmin";

function Skeleton({ className }) {
    return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />;
}

/**
 * @param {{ value: object|null, onChange: (user: object|null) => void }} props
 */
export function UserPicker({ value, onChange }) {
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

    const getLabel = (u) =>
        u.customerProfile?.fullName ?? u.therapistProfile?.fullName ?? u.email;

    if (value) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/30 bg-primary/5 text-sm">
                <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                    {getLabel(value)?.[0]?.toUpperCase() ?? "?"}
                </div>
                <span className="text-text-main truncate flex-1">{getLabel(value)}</span>
                <button
                    type="button"
                    onClick={() => onChange(null)}
                    className="text-text-muted hover:text-text-main shrink-0"
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
                    onChange={(e) => { setSearch(e.target.value); setDropdownOpen(true); }}
                    onFocus={() => setDropdownOpen(true)}
                    placeholder="Search by name or email…"
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-border-light bg-card-light text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            {dropdownOpen && shouldFetch && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card-light border border-border-light rounded-lg shadow-lg z-20 overflow-hidden max-h-48 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-3 space-y-2">
                            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-7 w-full" />)}
                        </div>
                    ) : results.length === 0 ? (
                        <p className="p-3 text-sm text-text-muted text-center">No users found.</p>
                    ) : (
                        results.map((u) => (
                            <button
                                key={u.id}
                                type="button"
                                onClick={() => select(u)}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-background-light text-left transition-colors border-b border-border-light last:border-0"
                            >
                                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                                    {getLabel(u)?.[0]?.toUpperCase() ?? "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-text-main truncate">{getLabel(u)}</p>
                                    <p className="text-xs text-text-muted truncate">{u.email}</p>
                                </div>
                                <span className="text-xs text-text-muted capitalize shrink-0">{u.role}</span>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

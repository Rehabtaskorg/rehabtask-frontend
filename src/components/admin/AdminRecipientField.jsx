"use client";

import { useState } from "react";
import { MdClose } from "react-icons/md";
import { UserPicker } from "@/components/admin/UserPicker";

const getLabel = (u) =>
    u.customerProfile?.fullName ?? u.therapistProfile?.fullName ?? u.email;

/**
 * Email recipient field: free-type an address or pick a DB user via typeahead.
 * When a DB user is selected, their email is stored and a chip replaces the input.
 *
 * @param {{
 *   value: string,
 *   onChange: (email: string) => void,
 *   error?: { message?: string }
 * }} props
 */
export function AdminRecipientField({ value, onChange, error }) {
    const [pickedUser, setPickedUser] = useState(null);

    const handleUserSelect = (user) => {
        if (!user) {
            setPickedUser(null);
            onChange("");
            return;
        }
        setPickedUser(user);
        onChange(user.email);
    };

    if (pickedUser) {
        return (
            <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${error ? "border-red-400" : "border-primary/30"} bg-primary/5 text-sm`}
            >
                <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                    {getLabel(pickedUser)?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-text-main truncate text-sm">{getLabel(pickedUser)}</p>
                    <p className="text-text-muted truncate text-xs">{pickedUser.email}</p>
                </div>
                <button
                    type="button"
                    aria-label="Remove selected recipient"
                    onClick={() => handleUserSelect(null)}
                    className="text-text-muted hover:text-text-main shrink-0"
                >
                    <MdClose size={14} />
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="space-y-2">
                <input
                    type="email"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Enter email address directly…"
                    autoComplete="off"
                    className={`w-full px-3 py-2 rounded-lg border ${error ? "border-red-400" : "border-border-light"} bg-card-light text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-primary`}
                />
                <div className="relative">
                    <UserPicker value={null} onChange={handleUserSelect} />
                </div>
            </div>
            {error?.message && (
                <p className="text-xs text-red-500 mt-1">{error.message}</p>
            )}
        </div>
    );
}

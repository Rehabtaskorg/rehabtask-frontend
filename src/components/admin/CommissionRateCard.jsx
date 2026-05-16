"use client";

import { useState } from "react";
import { MdEdit, MdCheck, MdClose, MdPercent, MdInfo } from "react-icons/md";
import { useAdminCommissionRate, useSetCommissionRate } from "@/hooks/useAdmin";
import { showToast } from "@/lib/toast";
import { formatDate } from "@/utils/dates";

/**
 * Displays the current global platform commission rate and allows
 * admin-only editing. Sub-admins with the commission permission can
 * view but not write (write is admin-only on the backend).
 *
 * @param {Object}  props
 * @param {boolean} props.canWrite - true only for full admin role
 */
export default function CommissionRateCard({ canWrite }) {
    const { data, isLoading, isError } = useAdminCommissionRate();
    const setRate = useSetCommissionRate();

    const [editing, setEditing] = useState(false);
    const [rateInput, setRateInput] = useState("");
    const [effectiveFrom, setEffectiveFrom] = useState("");

    const handleEdit = () => {
        setRateInput(data ? (parseFloat(data.rate) * 100).toFixed(2) : "10.00");
        setEffectiveFrom("");
        setEditing(true);
    };

    const handleCancel = () => {
        setEditing(false);
        setRateInput("");
        setEffectiveFrom("");
    };

    const handleSave = async () => {
        const parsed = parseFloat(rateInput);
        if (isNaN(parsed) || parsed < 0 || parsed > 100) {
            showToast.error("Commission rate must be between 0 and 100.");
            return;
        }
        try {
            await setRate.mutateAsync({
                rate: parsed / 100,
                effectiveFrom: effectiveFrom
                    ? new Date(effectiveFrom + ":00").toISOString()
                    : undefined,
            });
            showToast.success("Commission rate updated successfully.");
            setEditing(false);
        } catch (err) {
            showToast.error(err.response?.data?.message || "Failed to update commission rate.");
        }
    };

    return (
        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MdPercent className="text-primary text-xl" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-text-main dark:text-white uppercase tracking-wider">
                            Platform Commission Rate
                        </h3>
                        <p className="text-xs text-text-muted dark:text-gray-400 mt-0.5">
                            Applied to all therapist payouts
                        </p>
                    </div>
                </div>
                {canWrite && !editing && !isLoading && (
                    <button
                        onClick={handleEdit}
                        className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                        <MdEdit className="text-sm" /> Edit
                    </button>
                )}
            </div>

            {isLoading && (
                <div className="animate-pulse space-y-2">
                    <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
            )}

            {isError && (
                <p className="text-sm text-red-500">Failed to load commission rate.</p>
            )}

            {!isLoading && !isError && data && !editing && (
                <div>
                    <p className="text-4xl font-black text-text-main dark:text-white">
                        {(parseFloat(data.rate) * 100).toFixed(2)}
                        <span className="text-lg font-bold text-text-muted dark:text-gray-400 ml-1">%</span>
                    </p>
                    {data.isDefault ? (
                        <p className="text-xs text-text-muted dark:text-gray-400 mt-1 flex items-center gap-1">
                            <MdInfo className="text-sm" /> Default rate — no manual override set
                        </p>
                    ) : (
                        <p className="text-xs text-text-muted dark:text-gray-400 mt-1">
                            Effective {formatDate(data.effectiveFrom)}
                            {data.createdByAdmin && ` · Set by ${data.createdByAdmin.email}`}
                        </p>
                    )}
                </div>
            )}

            {editing && (
                <div className="space-y-4 mt-2">
                    <div>
                        <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 mb-1">
                            New Rate (%)
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={rateInput}
                            onChange={(e) => setRateInput(e.target.value)}
                            className="w-40 px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 mb-1">
                            Effective From (optional — defaults to now)
                        </label>
                        <input
                            type="datetime-local"
                            value={effectiveFrom}
                            onChange={(e) => setEffectiveFrom(e.target.value)}
                            className="w-64 px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSave}
                            disabled={setRate.isPending}
                            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                        >
                            <MdCheck className="text-base" />
                            {setRate.isPending ? "Saving…" : "Save"}
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={setRate.isPending}
                            className="flex items-center gap-1.5 px-4 py-2 text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white text-sm font-bold transition-colors"
                        >
                            <MdClose className="text-base" /> Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
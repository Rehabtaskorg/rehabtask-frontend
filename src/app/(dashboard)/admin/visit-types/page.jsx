"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { usePageTitle } from "@/hooks/usePageTitle";
import { logger } from "@/lib/logger";

const DISCIPLINES = ["Physical Therapist", "Occupational Therapist", "Speech Therapist"];

/**
 * Accessible labeled toggle switch for a single boolean visit type flag.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {boolean} props.isChecked
 * @param {(next: boolean) => void} props.onChange
 */
function ToggleSwitch({ label, isChecked, onChange }) {
    return (
        <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs font-medium text-text-muted">{label}</span>
            <button
                type="button"
                role="switch"
                aria-checked={isChecked}
                aria-label={label}
                onClick={() => onChange(!isChecked)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isChecked ? "bg-emerald-500" : "bg-slate-300"
                    }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isChecked ? "translate-x-4" : "translate-x-1"
                        }`}
                />
            </button>
        </label>
    );
}

/**
 * Admin visit type catalog. The catalog shape (code, name, discipline, sortOrder)
 * is owned by the seed file and synced on every deploy. This page only manages
 * the runtime flags `isActive` and `customerVisible`.
 */
export default function AdminVisitTypesPage() {
    usePageTitle("Visit Types");
    const [visitTypes, setVisitTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);

    const fetchVisitTypes = async () => {
        try {
            const res = await api.get("/admin/visit-types");
            setVisitTypes(res.data.data || []);
        } catch (err) {
            logger.error("Failed to load visit types", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchVisitTypes(); }, []);

    const handleSeed = async () => {
        setSeeding(true);
        try {
            const res = await api.post("/admin/visit-types/seed");
            alert(`Seeded: ${res.data.data.created} created, ${res.data.data.updated} updated`);
            fetchVisitTypes();
        } catch (err) {
            alert("Seed failed: " + (err.response?.data?.message || err.message));
        } finally {
            setSeeding(false);
        }
    };

    const handleToggle = async (vt, field, value) => {
        const previous = visitTypes;
        setVisitTypes((prev) => prev.map((v) => (v.id === vt.id ? { ...v, [field]: value } : v)));
        try {
            await api.put(`/admin/visit-types/${vt.id}`, { [field]: value });
        } catch {
            setVisitTypes(previous);
            alert("Failed to update");
        }
    };

    const universalTypes = visitTypes.filter((vt) => vt.discipline === "All");
    const grouped = DISCIPLINES.reduce((acc, d) => {
        if (d === "All") return acc;
        acc[d] = [
            ...visitTypes.filter((vt) => vt.discipline === d),
            ...universalTypes,
        ];
        return acc;
    }, {});

    if (isLoading) return <div className="p-4 md:p-6"><p className="text-text-muted">Loading...</p></div>;

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-main">Visit Types</h1>
                    <p className="text-sm text-text-muted mt-1">
                        Catalog codes are managed in code and deployed automatically. Use the toggles below to control availability.
                    </p>
                </div>
                {visitTypes.length === 0 && (
                    <button
                        onClick={handleSeed}
                        disabled={seeding}
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 disabled:opacity-50"
                    >
                        {seeding ? "Seeding..." : "Seed Default Types"}
                    </button>
                )}
            </div>

            {Object.entries(grouped).map(([discipline, types]) => types.length > 0 && (
                <div key={discipline} className="bg-card-light border border-border-light rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-border-light bg-slate-50">
                        <h3 className="text-sm font-bold text-text-main">{discipline}</h3>
                        <p className="text-xs text-text-muted">{types.length} visit type{types.length !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="divide-y divide-border-light">
                        {types.map((vt) => (
                            <div key={vt.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded">{vt.code}</span>
                                    <span className={`text-sm font-medium ${vt.isActive ? "text-text-main" : "text-text-muted line-through"}`}>
                                        {vt.name}
                                    </span>
                                    {!vt.isActive && (
                                        <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">INACTIVE</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    <ToggleSwitch
                                        label="Active"
                                        isChecked={vt.isActive}
                                        onChange={(next) => handleToggle(vt, "isActive", next)}
                                    />
                                    <ToggleSwitch
                                        label="Customer Visible"
                                        isChecked={vt.customerVisible}
                                        onChange={(next) => handleToggle(vt, "customerVisible", next)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {visitTypes.length === 0 && !isLoading && (
                <div className="text-center py-12">
                    <p className="text-text-muted">No visit types configured yet.</p>
                    <p className="text-sm text-text-muted mt-1">Click &ldquo;Seed Default Types&rdquo; to populate the standard clinical visit types.</p>
                </div>
            )}
        </div>
    );
}
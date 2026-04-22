"use client";

import { useVisitTypes } from "@/hooks/useVisitTypes";
import { MdSchedule } from "react-icons/md";

export default function OfferFormFields({ formData, setFormData, serviceType }) {
    const { data: visitTypes = [] } = useVisitTypes({
        serviceType,
        audience: "therapist",
        enabled: !!serviceType && formData.planOverrideEnabled,
    });

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-2">
                    Offer Rate ($)
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-mono text-sm">$</span>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="85.00"
                        value={formData.rate}
                        onChange={(e) => setFormData((d) => ({ ...d, rate: e.target.value }))}
                        className="w-full pl-8 pr-4 py-3 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-main dark:text-white transition-all outline-none font-semibold"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-2">
                    Attempted Visit Rate ($){" "}
                    <span className="text-text-muted/70 font-normal normal-case ml-1">— optional</span>
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-mono text-sm">$</span>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={formData.rate || 10000}
                        placeholder="40.00"
                        value={formData.attemptedVisitRate}
                        onChange={(e) => setFormData((d) => ({ ...d, attemptedVisitRate: e.target.value }))}
                        className="w-full pl-8 pr-4 py-3 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-main dark:text-white transition-all outline-none font-semibold"
                    />
                </div>
                <p className="mt-1.5 text-[11px] text-text-muted dark:text-gray-400">
                    Charged when you arrive but the patient isn&apos;t home. Must be ≤ session rate. Leave blank for no charge.
                </p>
            </div>

            <div>
                <label className="block text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-2">
                    Visit Mode
                </label>
                <div className="flex bg-background-light dark:bg-background-dark p-1 rounded-lg border border-border-light dark:border-border-dark">
                    <button
                        type="button"
                        onClick={() => setFormData((d) => ({ ...d, sessionType: "in_person" }))}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-md transition-all ${
                            formData.sessionType === "in_person"
                                ? "bg-card-light dark:bg-card-dark shadow-sm text-primary"
                                : "text-text-muted dark:text-gray-400"
                        }`}
                    >
                        In-Person
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData((d) => ({ ...d, sessionType: "virtual" }))}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-md transition-all ${
                            formData.sessionType === "virtual"
                                ? "bg-card-light dark:bg-card-dark shadow-sm text-primary"
                                : "text-text-muted dark:text-gray-400"
                        }`}
                    >
                        Virtual
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-2">
                    Proposed First Session
                </label>
                <input
                    type="datetime-local"
                    required
                    value={formData.proposedDate}
                    onChange={(e) => setFormData((d) => ({ ...d, proposedDate: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-main dark:text-white transition-all outline-none text-sm"
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-2">
                    Message to Client
                </label>
                <textarea
                    required
                    rows={4}
                    placeholder="Briefly describe your experience and approach..."
                    value={formData.description}
                    onChange={(e) => setFormData((d) => ({ ...d, description: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-main dark:text-white placeholder:text-text-muted/50 transition-all outline-none text-sm resize-none"
                />
            </div>

            <div className="rounded-lg border border-border-light dark:border-border-dark p-3 space-y-3">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={formData.planOverrideEnabled}
                        onChange={(e) => setFormData((d) => ({ ...d, planOverrideEnabled: e.target.checked }))}
                        className="mt-0.5 accent-primary"
                    />
                    <span className="text-xs font-bold text-text-main dark:text-white">
                        Propose a different treatment plan
                        <span className="block text-[10px] font-normal text-text-muted dark:text-gray-400 mt-0.5">
                            Leave unchecked to accept the customer&apos;s plan as-is.
                        </span>
                    </span>
                </label>

                {formData.planOverrideEnabled && (
                    <div className="space-y-3 pl-6 pt-1">
                        <div>
                            <label className="block text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-1">
                                Visit Type
                            </label>
                            <select
                                value={formData.visitTypeId || ""}
                                onChange={(e) => setFormData((d) => ({ ...d, visitTypeId: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-main dark:text-white text-sm outline-none"
                            >
                                <option value="">— Same as customer&apos;s request —</option>
                                {visitTypes.map((vt) => (
                                    <option key={vt.id} value={vt.id}>
                                        {vt.name} ({vt.code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-1">
                                    Visits/Week
                                </label>
                                <select
                                    value={formData.visitsPerWeek}
                                    onChange={(e) => setFormData((d) => ({ ...d, visitsPerWeek: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-text-main dark:text-white text-sm outline-none"
                                >
                                    <option value="">—</option>
                                    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-1">
                                    Weeks
                                </label>
                                <select
                                    value={formData.numberOfWeeks}
                                    onChange={(e) => setFormData((d) => ({ ...d, numberOfWeeks: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-text-main dark:text-white text-sm outline-none"
                                >
                                    <option value="">—</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {formData.visitsPerWeek && formData.numberOfWeeks && (
                            <p className="text-[11px] font-bold text-primary">
                                You propose: {formData.visitsPerWeek}×/week × {formData.numberOfWeeks} weeks (
                                {parseInt(formData.visitsPerWeek, 10) * parseInt(formData.numberOfWeeks, 10)} visits total)
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark">
                <MdSchedule className="text-text-muted text-sm shrink-0" />
                <span className="text-xs text-text-muted dark:text-gray-400 italic">Your offer will be valid for 48 hours</span>
            </div>
        </div>
    );
}

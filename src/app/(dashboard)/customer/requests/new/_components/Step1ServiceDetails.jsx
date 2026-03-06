"use client";

import useRequestStore from "@/store/requestStore";
import { useRequestOptions } from "@/hooks/useRequestOptions";

const SERVICE_TYPES = [
    { value: "", label: "Select a service type..." },
    { value: "Physical Therapy", label: "Physical Therapy" },
    { value: "Occupational Therapy", label: "Occupational Therapy" },
    { value: "Speech Language Pathology (SLP)", label: "Speech Language Pathology (SLP)" },
];

const INPUT_CLASS =
    "w-full bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark rounded-lg px-3 py-2.5 text-sm text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none";

const LABEL_CLASS = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

export default function Step1ServiceDetails() {
    const { step1, setStep1 } = useRequestStore();
    const { data: visitTypeOptions = [] } = useRequestOptions("visit_type");
    const { data: emrOptions = [] } = useRequestOptions("emr");

    const todayStr = new Date().toISOString().split("T")[0];

    return (
        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-text-main dark:text-white">
                Step 1: Service Details
            </h3>

            {/* Service Type */}
            <div>
                <label className={LABEL_CLASS}>
                    Service Type <span className="text-red-500">*</span>
                </label>
                <select
                    value={step1.serviceType}
                    onChange={(e) => setStep1({ serviceType: e.target.value })}
                    className={INPUT_CLASS}
                >
                    {SERVICE_TYPES.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {!step1.serviceType && (
                    <p className="text-xs text-text-muted dark:text-gray-500 mt-1">
                        Please select the type of therapy you need
                    </p>
                )}
            </div>

            {/* Description */}
            <div>
                <label className={LABEL_CLASS}>
                    Description <span className="text-red-500">*</span>
                </label>
                <textarea
                    rows={4}
                    value={step1.description}
                    onChange={(e) => setStep1({ description: e.target.value })}
                    placeholder="Please provide details about your condition, any recent surgeries, or specific goals for therapy..."
                    className={`${INPUT_CLASS} resize-none`}
                />
                {step1.description.length > 0 && step1.description.trim().length < 10 && (
                    <p className="text-xs text-red-500 mt-1">
                        Please provide at least 10 characters
                    </p>
                )}
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className={LABEL_CLASS}>
                        Preferred Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        value={step1.preferredDate}
                        min={todayStr}
                        onChange={(e) => setStep1({ preferredDate: e.target.value })}
                        className={INPUT_CLASS}
                    />
                </div>
                <div>
                    <label className={LABEL_CLASS}>Preferred Time (optional)</label>
                    <input
                        type="time"
                        value={step1.preferredTime}
                        onChange={(e) => setStep1({ preferredTime: e.target.value })}
                        className={INPUT_CLASS}
                    />
                </div>
            </div>

            {/* Rate per Visit */}
            <div>
                <label className={LABEL_CLASS}>
                    Rate per Visit <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-semibold text-sm">$</span>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={step1.rate}
                        onChange={(e) => setStep1({ rate: e.target.value })}
                        placeholder="0.00"
                        className={`${INPUT_CLASS} pl-7 font-mono`}
                    />
                </div>
                {step1.rate && parseFloat(step1.rate) <= 0 && (
                    <p className="text-xs text-red-500 mt-1">Rate must be a positive number</p>
                )}
            </div>

            {/* Visit Type + EMR — 2-col grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Visit Type */}
                <div>
                    <label className={LABEL_CLASS}>
                        Type of Visit <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={step1.visitType}
                        onChange={(e) => {
                            setStep1({ visitType: e.target.value });
                            if (e.target.value !== "Other") setStep1({ visitTypeOther: "" });
                        }}
                        className={INPUT_CLASS}
                    >
                        <option value="">Select visit type...</option>
                        {visitTypeOptions.map((opt) => (
                            <option key={opt.id} value={opt.value}>
                                {opt.value}
                            </option>
                        ))}
                        <option value="Other">Other</option>
                    </select>
                    {step1.visitType === "Other" && (
                        <input
                            type="text"
                            value={step1.visitTypeOther}
                            onChange={(e) => setStep1({ visitTypeOther: e.target.value })}
                            placeholder="Enter visit type..."
                            className={`${INPUT_CLASS} mt-2`}
                        />
                    )}
                </div>

                {/* EMR System */}
                <div>
                    <label className={LABEL_CLASS}>
                        EMR System <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={step1.emr}
                        onChange={(e) => {
                            setStep1({ emr: e.target.value });
                            if (e.target.value !== "Other") setStep1({ emrOther: "" });
                        }}
                        className={INPUT_CLASS}
                    >
                        <option value="">Select EMR system...</option>
                        {emrOptions.map((opt) => (
                            <option key={opt.id} value={opt.value}>
                                {opt.value}
                            </option>
                        ))}
                        <option value="Other">Other</option>
                    </select>
                    {step1.emr === "Other" && (
                        <input
                            type="text"
                            value={step1.emrOther}
                            onChange={(e) => setStep1({ emrOther: e.target.value })}
                            placeholder="Enter EMR system..."
                            className={`${INPUT_CLASS} mt-2`}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
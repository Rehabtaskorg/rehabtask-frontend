"use client";

import useRequestStore from "@/store/requestStore";

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
        </div>
    )

}
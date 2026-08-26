"use client";

import { useState } from "react";
import useRequestStore from "@/stores/requestStore";
import { useRequestOptions } from "@/hooks/useRequestOptions";
import { useVisitTypes } from "@/hooks/useVisitTypes";
import { localDateStr, isDateTodayOrLater } from "@/utils/dates";

const SERVICE_TYPES = [
    { value: "", label: "Select a service type..." },
    { value: "Physical Therapy", label: "Physical Therapy" },
    { value: "Occupational Therapy", label: "Occupational Therapy" },
    { value: "Speech Language Pathology (SLP)", label: "Speech Language Pathology (SLP)" },
];

const INPUT_CLASS =
    "w-full bg-muted-light  border border-border-light  rounded-lg px-3 py-2.5 text-sm text-text-main  focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none";

const LABEL_CLASS = "block text-sm font-semibold text-slate-700  mb-1.5";

export default function Step1ServiceDetails() {
    const { step1, setStep1 } = useRequestStore();
    const { data: emrOptions = [] } = useRequestOptions("emr");

    // Visit types fetched from the curated catalog, filtered by the selected service type.
    // audience="customer" hides therapist-internal codes (MV, Supervisory, Attempted, etc.)
    const { data: visitTypeOptions = [], isLoading: loadingVisitTypes } = useVisitTypes({
        serviceType: step1.serviceType,
        audience: "customer",
    });

    const todayStr = localDateStr();
    const [dateTouched, setDateTouched] = useState(false);

    const handleServiceTypeChange = (e) => {
        const newServiceType = e.target.value;
        setStep1({
            serviceType: newServiceType,
            visitTypeId: "",
            visitTypeName: "",
            visitType: "",
            visitTypeOther: "",
        });
    };

    const handleVisitTypeChange = (e) => {
        const selectedId = e.target.value;
        if (!selectedId) {
            setStep1({ visitTypeId: "", visitTypeName: "", visitType: "" });
            return;
        }
        const selected = visitTypeOptions.find((vt) => vt.id === selectedId);
        setStep1({
            visitTypeId: selectedId,
            visitTypeName: selected ? `${selected.name} (${selected.code})` : "",
            visitType: "",
            visitTypeOther: "",
            ...(selected?.isEvaluation && { visitsPerWeek: "", numberOfWeeks: "" }),
        });
    };

    const selectedVisitType = visitTypeOptions.find((vt) => vt.id === step1.visitTypeId);
    const isEvaluationVisit = selectedVisitType?.isEvaluation ?? false;

    return (
        <div className="bg-card-light  border border-border-light  rounded-xl shadow-sm p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-text-main ">
                Step 1: Service Details
            </h3>

            {/* Service Type */}
            <div>
                <label className={LABEL_CLASS}>
                    Service Type <span className="text-red-500">*</span>
                </label>
                <select
                    value={step1.serviceType}
                    onChange={handleServiceTypeChange}
                    className={INPUT_CLASS}
                >
                    {SERVICE_TYPES.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {!step1.serviceType && (
                    <p className="text-xs text-text-muted  mt-1">
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
                        onBlur={() => setDateTouched(true)}
                        onChange={(e) => setStep1({ preferredDate: e.target.value })}
                        className={INPUT_CLASS}
                    />
                    {dateTouched && step1.preferredDate && !isDateTodayOrLater(step1.preferredDate) && (
                        <p className="text-xs text-red-500 mt-1">Preferred date must be today or later.</p>
                    )}
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

            {/* Frequency (optional) — not applicable to evaluation visits */}
            {!isEvaluationVisit && (
                <div>
                    <label className={LABEL_CLASS}>Treatment Frequency (optional)</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-text-muted  mb-1">Visits per week</label>
                            <select
                                value={step1.visitsPerWeek}
                                onChange={(e) => setStep1({ visitsPerWeek: e.target.value })}
                                className={INPUT_CLASS}
                            >
                                <option value="">Not specified</option>
                                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                                    <option key={n} value={n}>{n}x / week</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-text-muted  mb-1">Number of weeks</label>
                            <select
                                value={step1.numberOfWeeks}
                                onChange={(e) => setStep1({ numberOfWeeks: e.target.value })}
                                className={INPUT_CLASS}
                            >
                                <option value="">Not specified</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                                    <option key={n} value={n}>{n} week{n > 1 ? "s" : ""}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {step1.visitsPerWeek && step1.numberOfWeeks && (
                        <div className="mt-2 px-3 py-2 rounded-lg bg-primary/5  border border-primary/20">
                            <p className="text-sm font-semibold text-primary">
                                {parseInt(step1.visitsPerWeek) * parseInt(step1.numberOfWeeks)} visits total
                            </p>
                        </div>
                    )}
                    <p className="text-xs text-text-muted  mt-1">
                        From the doctor&apos;s referral order. Leave blank for single-visit requests.
                    </p>
                </div>
            )}

            {/* Visit Type + EMR — 2-col grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Visit Type — FK-backed dropdown filtered by service type */}
                <div>
                    <label className={LABEL_CLASS}>
                        Type of Visit <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={step1.visitTypeId}
                        onChange={handleVisitTypeChange}
                        disabled={!step1.serviceType || loadingVisitTypes}
                        className={`${INPUT_CLASS} ${!step1.serviceType ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        <option value="">
                            {!step1.serviceType
                                ? "Select a service type first"
                                : loadingVisitTypes
                                    ? "Loading..."
                                    : "Select visit type..."}
                        </option>
                        {visitTypeOptions.map((vt) => (
                            <option key={vt.id} value={vt.id}>
                                {vt.name} ({vt.code})
                            </option>
                        ))}
                    </select>
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

            {/* Special Instructions */}
            <div>
                <label htmlFor="special-instructions" className={LABEL_CLASS}>
                    Special Instructions (optional)
                </label>
                <textarea
                    id="special-instructions"
                    rows={3}
                    maxLength={1000}
                    value={step1.specialInstructions}
                    onChange={(e) => setStep1({ specialInstructions: e.target.value })}
                    placeholder="e.g. EVV IN KINNSER"
                    className={`${INPUT_CLASS} resize-none`}
                />
            </div>
        </div>
    );
}

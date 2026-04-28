"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MdArrowBack, MdGavel, MdCheckCircle, MdWarning } from "react-icons/md";
import { useCustomerBookings } from "@/hooks/useBookings";
import { useCreateDispute } from "@/hooks/useDisputes";
import { usePageTitle } from "@/hooks/usePageTitle";

const DISPUTE_TYPES = [
    { value: "billing", label: "Billing", description: "Issues with charges, payments, or refunds" },
    { value: "service_quality", label: "Service Quality", description: "Unsatisfactory service or unprofessional conduct" },
    { value: "no_show", label: "No Show", description: "Therapist did not show up for the session" },
    { value: "communication", label: "Communication", description: "Unresponsive or miscommunication issues" },
    { value: "other", label: "Other", description: "Any other issue not listed above" },
];

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

export default function NewDisputePage() {
    usePageTitle("File a Dispute");
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedBookingId = searchParams.get("bookingId") || "";

    const { bookings, loading: loadingBookings } = useCustomerBookings();
    const createDispute = useCreateDispute();

    const [bookingId, setBookingId] = useState(preselectedBookingId);
    const [type, setType] = useState("");
    const [description, setDescription] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const charCount = description.length;
    const isValid = type && description.length >= 20;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValid) return;

        setError("");
        try {
            await createDispute.mutateAsync({
                ...(bookingId && { bookingId }),
                type,
                description,
            });
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit dispute. Please try again.");
        }
    };

    if (submitted) {
        return (
            <div className="flex-1 flex flex-col">
                <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-14 lg:top-0 z-10 flex items-center px-4 sm:px-8 shrink-0">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-text-main dark:text-white">File a Dispute</h2>
                </header>
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center space-y-4 max-w-md">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                            <MdCheckCircle className="text-3xl text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-bold text-text-main dark:text-white">Dispute Submitted</h3>
                        <p className="text-sm text-text-muted dark:text-gray-400">
                            Your dispute has been filed and our team will review it shortly.
                            You can track the progress from your disputes page.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                            <button
                                onClick={() => router.push("/customer/disputes")}
                                className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors"
                            >
                                View My Disputes
                            </button>
                            <button
                                onClick={() => router.push("/customer/dashboard")}
                                className="border border-border-light dark:border-border-dark text-text-main dark:text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-14 lg:top-0 z-10 flex items-center gap-3 px-4 sm:px-8 shrink-0">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                >
                    <MdArrowBack className="text-xl" />
                </button>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-text-main dark:text-white">File a Dispute</h2>
            </header>

            {/* Form */}
            <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 sm:p-8 space-y-6">

                    {/* Info banner */}
                    <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <MdGavel className="text-blue-600 dark:text-blue-400 text-lg shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                            If you&apos;re experiencing an issue with a booking or service, file a dispute and our team will investigate within 24-48 hours.
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <MdWarning className="text-red-600 dark:text-red-400 text-lg shrink-0" />
                            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Related Booking (optional) */}
                    <div>
                        <label className="block text-sm font-semibold text-text-main dark:text-white mb-2">
                            Related Booking <span className="text-text-muted dark:text-slate-400 font-normal">(optional)</span>
                        </label>
                        <select
                            value={bookingId}
                            onChange={(e) => setBookingId(e.target.value)}
                            disabled={loadingBookings}
                            className="w-full px-4 py-3 text-sm rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        >
                            <option value="">No specific booking</option>
                            {bookings.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.therapist?.fullName || "Therapist"} — {b.offer?.request?.serviceType || "Session"} — {fmtDate(b.scheduledDate)}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-text-muted dark:text-slate-400 mt-1.5">
                            Link this dispute to a specific booking if applicable.
                        </p>
                    </div>

                    {/* Dispute Type */}
                    <div>
                        <label className="block text-sm font-semibold text-text-main dark:text-white mb-2">
                            Dispute Type <span className="text-red-500">*</span>
                        </label>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {DISPUTE_TYPES.map((dt) => {
                                const selected = type === dt.value;
                                return (
                                    <button
                                        key={dt.value}
                                        type="button"
                                        onClick={() => setType(dt.value)}
                                        className={`text-left p-3.5 rounded-xl border-2 transition-all ${selected
                                            ? "border-primary bg-primary/5 dark:bg-primary/10"
                                            : "border-border-light dark:border-border-dark hover:border-slate-300 dark:hover:border-slate-600"
                                            }`}
                                    >
                                        <p className={`text-sm font-semibold ${selected ? "text-primary" : "text-text-main dark:text-white"}`}>
                                            {dt.label}
                                        </p>
                                        <p className="text-xs text-text-muted dark:text-slate-400 mt-0.5">
                                            {dt.description}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-text-main dark:text-white mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the issue in detail. Include dates, what happened, and what resolution you expect..."
                            rows={5}
                            maxLength={5000}
                            className="w-full px-4 py-3 text-sm rounded-xl border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-text-main dark:text-white placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        />
                        <div className="flex justify-between mt-1.5">
                            <p className={`text-xs ${charCount < 20 ? "text-amber-600 dark:text-amber-400" : "text-text-muted dark:text-slate-400"}`}>
                                {charCount < 20 ? `Minimum 20 characters (${20 - charCount} more needed)` : ""}
                            </p>
                            <p className="text-xs text-text-muted dark:text-slate-400">
                                {charCount.toLocaleString()} / 5,000
                            </p>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={!isValid || createDispute.isPending}
                            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <MdGavel className="text-base" />
                            {createDispute.isPending ? "Submitting..." : "Submit Dispute"}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="border border-border-light dark:border-border-dark text-text-main dark:text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

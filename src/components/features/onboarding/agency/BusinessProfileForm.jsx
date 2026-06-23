"use client";

import { useRouter } from "next/navigation";
import { usePageTitle } from "@/hooks/usePageTitle";

/**
 * Agency onboarding Step 2 — Business Profile.
 * Skeleton screen: pure navigation, no validation, no API calls.
 */
export function BusinessProfileForm() {
    usePageTitle("Business Profile");
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background-light py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 px-4">
                    <h1 className="text-text-main text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                        Business Profile
                    </h1>
                    <p className="text-text-muted text-lg font-normal leading-normal">
                        Provide your agency&apos;s legal and billing information.
                    </p>
                </header>

                <div className="bg-card-light border border-border-light rounded-xl overflow-hidden shadow-sm">
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <SkeletonField label="Agency Legal Name" placeholder="From registration" readOnly />
                                <SkeletonField label="DBA Name" placeholder="e.g. ABC Therapy Services" optional />
                                <SkeletonField label="EIN" placeholder="e.g. 12-3456789" optional />
                                <SkeletonField label="Billing Contact Email" placeholder="billing@youragency.com" />
                            </div>
                            <div className="space-y-6">
                                <SkeletonField label="Primary Contact Person" placeholder="From registration" readOnly />
                                <SkeletonField label="Phone" placeholder="From registration" readOnly />
                                <SkeletonField label="Business Address Line 1" placeholder="e.g. 233 S Wacker Dr, Chicago, IL" />
                                <SkeletonField label="Address Line 2" placeholder="e.g. Suite 400" optional />
                                <div className="grid grid-cols-2 gap-4">
                                    <SkeletonField label="City" placeholder="e.g. Chicago" />
                                    <SkeletonField label="ZIP Code" placeholder="e.g. 60601" />
                                </div>
                                <SkeletonField label="State" placeholder="e.g. IL" />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-muted-light flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-border-light">
                        <button
                            type="button"
                            onClick={() => router.push("/customer/onboarding/agency/welcome")}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-12 text-text-muted font-bold hover:text-text-main transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push("/customer/onboarding/agency/upload-documents")}
                            className="w-full sm:w-auto px-10 h-12 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:brightness-95 transition-all flex items-center justify-center gap-2"
                        >
                            Next
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SkeletonField({ label, placeholder, readOnly = false, optional = false }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-text-main text-base font-semibold">
                {label}{optional && <span className="text-text-muted font-normal text-sm"> (optional)</span>}
            </label>
            <input
                type="text"
                placeholder={placeholder}
                readOnly={readOnly}
                className={`w-full px-4 py-3 rounded-lg border border-border-light text-text-main outline-none transition-all ${readOnly ? "bg-gray-50 text-text-muted cursor-default" : "bg-input-light focus:ring-2 focus:ring-primary focus:border-transparent"}`}
            />
        </div>
    );
}

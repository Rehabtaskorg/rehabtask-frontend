"use client";

import { useRouter } from "next/navigation";
import { usePageTitle } from "@/hooks/usePageTitle";
import { IndividualOnboardingProgressBar } from "@/components/features/onboarding/individual/IndividualOnboardingProgressBar";

export function IndividualPersonalInfoForm() {
    usePageTitle("Personal Information");
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background-light py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <IndividualOnboardingProgressBar />

                <header className="mb-8 px-4">
                    <h1 className="text-text-main text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                        Personal Information
                    </h1>
                    <p className="text-text-muted text-lg font-normal leading-normal">
                        Confirm your details and provide your date of birth and home address.
                    </p>
                </header>

                <div className="bg-card-light border border-border-light rounded-xl overflow-hidden shadow-sm">
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-text-main text-sm font-semibold">Full Name</label>
                                <input
                                    type="text"
                                    disabled
                                    placeholder="From registration"
                                    className="w-full px-4 py-3 rounded-lg border border-border-light bg-muted-light text-text-muted cursor-not-allowed"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-text-main text-sm font-semibold">Email Address</label>
                                <input
                                    type="email"
                                    disabled
                                    placeholder="From registration"
                                    className="w-full px-4 py-3 rounded-lg border border-border-light bg-muted-light text-text-muted cursor-not-allowed"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-text-main text-sm font-semibold">Phone Number</label>
                                <input
                                    type="tel"
                                    disabled
                                    placeholder="From registration"
                                    className="w-full px-4 py-3 rounded-lg border border-border-light bg-muted-light text-text-muted cursor-not-allowed"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="dateOfBirth" className="text-text-main text-sm font-semibold">
                                    Date of Birth <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="dateOfBirth"
                                    type="date"
                                    className="w-full px-4 py-3 rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                />
                            </div>

                            <div className="md:col-span-2 flex flex-col gap-2">
                                <label htmlFor="addressLine1" className="text-text-main text-sm font-semibold">
                                    Home Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="addressLine1"
                                    type="text"
                                    placeholder="e.g. 742 Evergreen Terrace"
                                    className="w-full px-4 py-3 rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                />
                            </div>

                            <div className="md:col-span-2 flex flex-col gap-2">
                                <label htmlFor="addressLine2" className="text-text-main text-sm font-semibold">
                                    Address Line 2 <span className="text-text-muted font-normal text-sm">(optional)</span>
                                </label>
                                <input
                                    id="addressLine2"
                                    type="text"
                                    placeholder="e.g. Apt 4B"
                                    className="w-full px-4 py-3 rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="city" className="text-text-main text-sm font-semibold">
                                    City <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="city"
                                    type="text"
                                    placeholder="e.g. Chicago"
                                    className="w-full px-4 py-3 rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="state" className="text-text-main text-sm font-semibold">
                                        State <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="state"
                                        type="text"
                                        placeholder="e.g. IL"
                                        className="w-full px-4 py-3 rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="zipCode" className="text-text-main text-sm font-semibold">
                                        ZIP Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="zipCode"
                                        type="text"
                                        placeholder="e.g. 60606"
                                        className="w-full px-4 py-3 rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-muted-light flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-border-light">
                        <button
                            type="button"
                            onClick={() => router.push("/customer/onboarding/individual/welcome")}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-12 text-text-muted font-bold hover:text-text-main transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push("/customer/onboarding/individual/medical-info")}
                            className="w-full sm:w-auto px-10 h-12 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:brightness-95 transition-all flex items-center justify-center gap-2"
                        >
                            Save & Continue
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
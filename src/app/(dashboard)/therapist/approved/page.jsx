"use client";

import { useRouter } from "next/navigation";

export default function ApprovedSuccessPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark py-12 px-4">
            <div className="layout-content-container flex flex-col max-w-200 mx-auto items-center">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                    <div className="bg-primary/10 rounded-full p-8 flex items-center justify-center">
                        <svg
                            className="w-20 h-20 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Headline */}
                <h1 className="text-text-main dark:text-white tracking-light text-[36px] font-extrabold leading-tight px-4 text-center pb-3">
                    Welcome to RehabMarket!
                    <br />
                    Your account is approved
                </h1>

                {/* Body Text */}
                <div className="max-w-150">
                    <p className="text-text-muted dark:text-gray-400 text-lg font-normal leading-relaxed pb-8 pt-1 px-4 text-center">
                        Our clinical team has verified your credentials. You&apos;re all set to start helping
                        patients and growing your clinical practice today.
                    </p>
                </div>

                {/* Primary CTA */}
                <div className="flex px-4 py-3 justify-center w-full">
                    <button
                        onClick={() => router.push("/therapist/dashboard")}
                        className="flex min-w-70 max-w-120 cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-8 bg-primary text-white text-lg font-bold leading-normal tracking-[0.015em] hover:brightness-95 transition-all shadow-lg shadow-primary/20"
                    >
                        <span className="truncate">Go to My Dashboard</span>
                    </button>
                </div>

                {/* Quick Actions */}
                <div className="w-full mt-16">
                    <div className="flex items-center justify-between mb-6 px-4">
                        <h3 className="text-xl font-bold text-text-main dark:text-white">Quick Actions</h3>
                        <span className="text-sm font-semibold text-primary">GET STARTED</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
                        {/* Action Cards */}
                        <div
                            onClick={() => router.push("/therapist/onboarding/availability")}
                            className="group flex items-start gap-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-5 rounded-xl hover:border-primary/50 transition-colors cursor-pointer shadow-sm"
                        >
                            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg text-blue-600 dark:text-blue-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <h4 className="font-bold text-text-main dark:text-white group-hover:text-primary transition-colors">
                                    Update Your Availability
                                </h4>
                                <p className="text-sm text-text-muted dark:text-gray-400">
                                    Tell us when you&apos;re free to see new patients.
                                </p>
                            </div>
                        </div>

                        <div
                            onClick={() => router.push("/therapist/requests")}
                            className="group flex items-start gap-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-5 rounded-xl hover:border-primary/50 transition-colors cursor-pointer shadow-sm"
                        >
                            <div className="bg-primary/10 p-3 rounded-lg text-primary">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <h4 className="font-bold text-text-main dark:text-white group-hover:text-primary transition-colors">
                                    Browse Service Requests
                                </h4>
                                <p className="text-sm text-text-muted dark:text-gray-400">
                                    See active rehabilitation needs in your area.
                                </p>
                            </div>
                        </div>

                        <div
                            onClick={() => router.push("/therapist/profile")}
                            className="group flex items-start gap-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-5 rounded-xl hover:border-primary/50 transition-colors cursor-pointer shadow-sm"
                        >
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-purple-600 dark:text-purple-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <h4 className="font-bold text-text-main dark:text-white group-hover:text-primary transition-colors">
                                    Enhance Your Profile
                                </h4>
                                <p className="text-sm text-text-muted dark:text-gray-400">
                                    Add more details to attract more clients.
                                </p>
                            </div>
                        </div>

                        <div
                            className="group flex items-start gap-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark p-5 rounded-xl hover:border-primary/50 transition-colors cursor-pointer shadow-sm"
                        >
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg text-orange-600 dark:text-orange-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <h4 className="font-bold text-text-main dark:text-white group-hover:text-primary transition-colors">
                                    View Compliance Docs
                                </h4>
                                <p className="text-sm text-text-muted dark:text-gray-400">
                                    Review HIPAA and professional standards.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust Signal */}
                <div className="mt-12 flex items-center gap-2 text-text-muted dark:text-gray-400 text-xs uppercase tracking-widest font-bold">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                    </svg>
                    HIPAA Compliant Marketplace
                </div>
            </div>
        </div>
    );
}
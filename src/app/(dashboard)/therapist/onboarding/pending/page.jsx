"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import { useRouter } from "next/navigation";

export default function PendingReviewPage() {
    usePageTitle("Approval Pending");
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col items-center text-center gap-8">
                    {/* Animated Icon */}
                    <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-pulse">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>

                    <div>
                        <h1 className="text-text-main dark:text-white text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                            Verification Under Review
                        </h1>
                        <p className="text-text-muted dark:text-gray-400 text-lg max-w-2xl leading-normal">
                            We&apos;re currently reviewing your credentials to maintain the highest standard of care on our platform.
                        </p>
                    </div>

                    {/* Timeline */}
                    <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-8 w-full max-w-2xl shadow-sm">
                        <h3 className="text-lg font-bold text-text-main dark:text-white mb-6">Verification Progress</h3>

                        <div className="space-y-6">
                            {[
                                { step: "Profile Created", status: "complete", date: "Completed" },
                                { step: "Credentials Submitted", status: "complete", date: "Completed" },
                                { step: "Background Check", status: "complete", date: "Completed" },
                                { step: "Final Quality Audit", status: "pending", date: "In Progress - Est. 24-48 hours" },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-start gap-4">
                                    {item.status === "complete" ? (
                                        <svg className="w-6 h-6 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6 text-primary animate-pulse shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                    <div className="flex-1">
                                        <p className={`font-semibold ${item.status === "pending" ? "text-primary" : "text-text-main dark:text-white"}`}>
                                            {item.step}
                                        </p>
                                        <p className="text-sm text-text-muted dark:text-gray-400">{item.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* What to Expect */}
                    <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-8 w-full max-w-2xl text-left shadow-sm">
                        <h3 className="text-xl font-bold text-text-main dark:text-white mb-4">What to expect next</h3>
                        <div className="space-y-4 text-text-muted dark:text-gray-300">
                            <p>
                                Our manual review process typically takes <strong className="text-text-main dark:text-white">24-48 business hours</strong>. We will check your license validity and professional references to ensure a safe community.
                            </p>
                            <p>
                                You will receive an email notification once your profile is live. Your profile remains <strong className="text-text-main dark:text-white">hidden from patients</strong> until the verification is complete.
                            </p>
                        </div>
                    </div>

                    {/* Action Panel */}
                    <div className="bg-primary/10 dark:bg-primary/5 border border-primary/20 rounded-xl p-6 w-full max-w-2xl">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <p className="text-text-main dark:text-white text-base font-bold">Need urgent assistance?</p>
                                <p className="text-text-muted dark:text-gray-400 text-sm">
                                    Our support team is here to help with any questions.
                                </p>
                            </div>
                            <button
                                onClick={() => window.location.href = "mailto:support@rehabtask.com"}
                                className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:brightness-95 transition-all shadow-md"
                            >
                                Contact Support
                            </button>
                        </div>
                    </div>

                    {/* Back to Dashboard */}
                    <button
                        onClick={() => router.push("/therapist/dashboard")}
                        className="text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dashboard
                    </button>

                    {/* Footer note */}
                    <div className="text-center py-4">
                        <p className="text-text-muted dark:text-gray-500 text-xs">
                            © {new Date().getFullYear()} RehabTask Professional Services. All credentials are encrypted and stored securely.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
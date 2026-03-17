"use client";

import { useRouter } from "next/navigation";
import { MdArrowBack, MdArrowForward } from "react-icons/md";

export default function RequestFormFooter({
    currentStep,
    onBack,
    onNext,
    onSubmit,
    canNext,
    submitting
}) {
    const router = useRouter();

    return (
        <div className="fixed bottom-0 left-0 lg:left-64 right-0 z-20 bg-card-light dark:bg-card-dark border-t border-border-light dark:border-border-dark">
            <div className="max-w-170 mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
                {/* Left side */}
                <div>
                    {currentStep === 1 ? (
                        <button
                            onClick={() => router.push("/customer/requests")}
                            className="text-sm text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white font-bold transition-colors"
                        >
                            Cancel
                        </button>
                    ) : (
                        <button
                            onClick={onBack}
                            className="flex items-center gap-1 text-sm text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white font-bold transition-colors"
                        >
                            <MdArrowBack className="text-base" />
                            Back
                        </button>
                    )}
                </div>

                {/* Right side */}
                <div>
                    {currentStep < 3 ? (
                        <button
                            onClick={onNext}
                            disabled={!canNext}
                            className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            Next
                            <MdArrowForward className="text-base" />
                        </button>
                    ) : (
                        <button
                            onClick={onSubmit}
                            disabled={submitting}
                            className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <svg
                                        className="animate-spin h-4 w-4"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                        />
                                    </svg>
                                    Posting...
                                </>
                            ) : (
                                "Post Request"
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
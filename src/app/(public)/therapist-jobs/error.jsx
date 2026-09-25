"use client";

/**
 * @param {{ reset: Function }} props
 */
export default function TherapistJobsError({ reset }) {
    return (
        <div className="h-screen flex flex-col items-center justify-center gap-4">
            <p className="text-gray-400">Something went wrong.</p>
            <button
                onClick={reset}
                className="text-primary hover:underline text-sm font-semibold"
            >
                Try again
            </button>
        </div>
    );
}
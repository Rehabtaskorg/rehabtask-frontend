"use client";

/**
 * @param {object} props
 * @param {Function} props.reset
 */
export default function TherapistsError({ reset }) {
    return (
        <div className="h-screen flex flex-col items-center justify-center gap-4">
            <p className="text-text-muted">Something went wrong.</p>
            <button
                onClick={reset}
                className="text-primary hover:underline text-sm font-semibold"
            >
                Try again
            </button>
        </div>
    );
}
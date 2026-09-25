"use client";

export default function Error({ error, reset }) {
    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="bg-card-light border border-border-light rounded-xl p-12 text-center">
                <p className="text-sm font-semibold text-text-main mb-1">Failed to load therapist profile</p>
                <p className="text-xs text-text-muted mb-4">{error?.message || "An unexpected error occurred."}</p>
                <button
                    onClick={reset}
                    className="text-sm text-primary font-semibold hover:underline"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}
"use client";

export default function TherapistRequestDetailError({ reset }) {
    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-800 font-bold">Something went wrong loading this request.</p>
                <button
                    onClick={reset}
                    className="mt-3 text-sm text-primary font-bold hover:underline"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}

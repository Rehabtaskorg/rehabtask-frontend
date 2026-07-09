/**
 * Skeleton shown while an onboarding step route segment is loading.
 * Shared by every step's loading.jsx so the flow feels consistent.
 */
export function OnboardingStepLoading() {
    return (
        <div className="min-h-screen bg-background-light py-10 px-4">
            <div className="max-w-4xl mx-auto animate-pulse space-y-6">
                <div className="h-24 bg-card-light border border-border-light rounded-xl" />
                <div className="h-10 w-80 bg-slate-200 rounded" />
                <div className="h-96 bg-card-light border border-border-light rounded-xl" />
            </div>
        </div>
    );
}

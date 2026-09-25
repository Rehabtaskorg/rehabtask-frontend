/**
 * Loading placeholder block for the admin therapist screens.
 * Local to this feature until a shared ui/Skeleton primitive exists (Phase 4).
 * @param {{ className?: string }} props
 */
export function TherapistSkeleton({ className }) {
    return <div className={`animate-pulse rounded bg-slate-200  ${className}`} />;
}

/**
 * Placeholder shown while a Stripe embedded component is mounting.
 * Stays visible until the component fires onLoaderStart, at which point
 * Stripe's own iframe loader takes over.
 *
 * @param {{ rows?: number }} props
 */
export default function EmbeddedComponentSkeleton({ rows = 3 }) {
    return (
        <div className="animate-pulse space-y-4">
            <div className="h-5 w-40 bg-slate-200 rounded" />
            <div className="space-y-3 pt-2">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="h-12 w-full bg-slate-100 rounded-lg" />
                ))}
            </div>
        </div>
    );
}

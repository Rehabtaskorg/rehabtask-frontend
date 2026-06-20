/**
 * 4-segment progress indicator for the Compliance Forms sub-steps, shown
 * below the "Form X of 4 — <name>" label on each sub-form screen.
 *
 * @param {{ current: number, total: number }} props - current is 0-indexed
 */
export function SubStepDots({ current, total }) {
    return (
        <div className="flex gap-2">
            {Array.from({ length: total }).map((_, i) => (
                <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${i <= current ? "bg-primary" : "bg-border-light"}`}
                />
            ))}
        </div>
    );
}
import { MdCheck, MdLock } from "react-icons/md";

/**
 * 4-segment progress indicator for the Compliance Forms sub-steps.
 * Completed steps show a check icon; the active step is highlighted;
 * future steps are dimmed.
 *
 * @param {{ current: number, total: number, completedSteps?: Set<number> }} props
 */
export function SubStepDots({ current, total, completedSteps = new Set() }) {
    return (
        <div className="flex gap-2">
            {Array.from({ length: total }).map((_, i) => {
                const isCompleted = completedSteps.has(i);
                const isActive = i === current;

                return (
                    <div
                        key={i}
                        className={`relative h-1.5 flex-1 rounded-full transition-colors ${
                            isActive
                                ? "bg-primary"
                                : isCompleted
                                    ? "bg-emerald-500"
                                    : "bg-border-light"
                        }`}
                    >
                        {isCompleted && !isActive && (
                            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                <MdCheck className="text-emerald-500 text-sm" />
                            </span>
                        )}
                        {!isCompleted && !isActive && i > current && (
                            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                <MdLock className="text-slate-300 text-xs" />
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

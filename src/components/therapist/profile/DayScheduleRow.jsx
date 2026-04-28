"use client";

import { MdAdd } from "react-icons/md";
import TimeBlockPicker from "./TimeBlockPicker";

const DayScheduleRow = ({ day, dayLabel, enabled, timeBlocks, onToggle, onAddBlock, onRemoveBlock, onUpdateBlock }) => {
    return (
        <div
            className={`rounded-xl border p-4 transition-colors ${enabled
                ? "bg-primary/5 border-primary/20"
                : "bg-muted-light dark:bg-muted-dark border-border-light dark:border-border-dark"
                }`}
        >
            <div className="flex items-center justify-between mb-3">
                <span
                    className={`text-sm font-bold uppercase tracking-wide ${enabled ? "text-primary" : "text-text-muted"
                        }`}
                >
                    {dayLabel}
                </span>

                {/* Toggle switch */}
                <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    onClick={() => onToggle(day)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                        }`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? "translate-x-6" : "translate-x-1"
                            }`}
                    />
                </button>
            </div>

            {enabled ? (
                <div className="space-y-3">
                    {timeBlocks.map((block, index) => (
                        <TimeBlockPicker
                            key={index}
                            startTime={block.startTime}
                            endTime={block.endTime}
                            onChange={(field, value) =>
                                onUpdateBlock(day, index, { ...block, [field]: value })
                            }
                            onRemove={
                                timeBlocks.length > 1
                                    ? () => onRemoveBlock(day, index)
                                    : undefined
                            }
                        />
                    ))}

                    <button
                        type="button"
                        onClick={() => onAddBlock(day)}
                        className="flex items-center gap-1.5 text-primary text-sm font-medium hover:text-primary/80 transition-colors"
                    >
                        <MdAdd className="text-lg" />
                        Add time block
                    </button>
                </div>
            ) : (
                <p className="text-sm text-text-muted">Not available</p>
            )}
        </div>
    )
}

export default DayScheduleRow;
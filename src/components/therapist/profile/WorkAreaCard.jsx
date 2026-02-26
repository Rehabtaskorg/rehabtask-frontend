"use client";

import { MdEdit, MdDelete, MdLocationOn } from "react-icons/md";

const WorkAreaCard = ({ workArea, onEdit, onDelete }) => {
    return (
        <div className="bg-muted-light dark:bg-muted-dark rounded-lg p-4 border border-border-light dark:border-border-dark">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                        <MdLocationOn className="text-primary text-lg" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-text-main dark:text-white">
                            {workArea.city}, {workArea.state}
                        </h3>
                        <span className="inline-block mt-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            {workArea.radiusMiles} mi radius
                        </span>
                        <p className="text-xs text-text-muted mt-1">
                            {parseFloat(workArea.latitude).toFixed(4)}, {parseFloat(workArea.longitude).toFixed(4)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => onEdit(workArea)}
                        className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-colors"
                        aria-label="Edit work area"
                    >
                        <MdEdit className="text-lg" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onDelete(workArea)}
                        className="p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        aria-label="Delete work area"
                    >
                        <MdDelete className="text-lg" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default WorkAreaCard;
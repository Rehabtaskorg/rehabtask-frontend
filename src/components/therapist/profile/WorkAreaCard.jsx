"use client";

import { MdEdit, MdDelete, MdLocationOn } from "react-icons/md";

/**
 * Displays a single work area entry with edit and delete actions.
 *
 * @param {Object} props
 * @param {Object} props.workArea
 * @param {Function} props.onEdit
 * @param {Function} props.onDelete
 */
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
                        {workArea.zipCode && (
                            <p className="text-xs text-text-muted mt-0.5">ZIP {workArea.zipCode}</p>
                        )}
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
    );
};

export default WorkAreaCard;
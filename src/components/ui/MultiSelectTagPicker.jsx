"use client";

import { MdClose } from "react-icons/md";

/**
 * Reusable multi-select tag picker.
 * Renders a dropdown of available options + dismissible chips for selected values.
 *
 * @param {object} props
 * @param {string[]} props.options - Full list of selectable values
 * @param {string[]} props.selected - Currently selected values (controlled)
 * @param {(value: string) => void} props.onAdd - Called when user picks an option
 * @param {(value: string) => void} props.onRemove - Called when user dismisses a chip
 * @param {string} [props.placeholder] - Dropdown placeholder text
 * @param {string} [props.error] - Validation error message
 */
export function MultiSelectTagPicker({ options, selected, onAdd, onRemove, placeholder = "Add...", error }) {
    const available = options.filter((o) => !selected.includes(o));

    return (
        <div className="flex flex-col gap-2">
            {selected.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selected.map((value) => (
                        <span
                            key={value}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold"
                        >
                            {value}
                            <button
                                type="button"
                                onClick={() => onRemove(value)}
                                className="hover:text-primary/70 transition-colors"
                                aria-label={`Remove ${value}`}
                            >
                                <MdClose className="text-sm" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <select
                value=""
                onChange={(e) => { if (e.target.value) onAdd(e.target.value); }}
                disabled={available.length === 0}
                className="w-full px-4 py-3 h-12 rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:opacity-50"
            >
                <option value="">{available.length === 0 ? "All options selected" : placeholder}</option>
                {available.map((o) => (
                    <option key={o} value={o}>{o}</option>
                ))}
            </select>

            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    );
}

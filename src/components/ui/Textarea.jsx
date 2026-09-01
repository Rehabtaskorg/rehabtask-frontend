import { forwardRef } from "react";
import { MdErrorOutline } from "react-icons/md";

/**
 * Textarea input matching the Input.jsx pattern with optional character counter.
 *
 * @param {{ label?: string, error?: string, helperText?: string, rows?: number, maxLength?: number, value?: string, className?: string }} props
 */
const Textarea = forwardRef(
    ({ label, error, helperText, rows = 3, maxLength, value, className = "", ...props }, ref) => {
        const charCount = typeof value === "string" ? value.length : 0;
        const showCounter = maxLength != null && charCount > 0;

        return (
            <div className="space-y-2">
                {label && (
                    <label className="block text-sm font-bold text-text-main uppercase tracking-wide">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <div className="relative space-y-1.5">
                    <textarea
                        ref={ref}
                        rows={rows}
                        maxLength={maxLength}
                        value={value}
                        className={`
                            w-full px-4 py-3 rounded-xl resize-none
                            bg-white
                            border transition-all outline-none
                            ${error
                                ? "border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                : "border-border-subtle focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            }
                            text-text-main
                            placeholder:text-text-muted/50
                            ${className}
                        `}
                        {...props}
                    />

                    {showCounter && (
                        <p className="text-xs text-text-muted text-right" aria-live="polite">
                            {charCount}/{maxLength}
                        </p>
                    )}

                    {error && (
                        <p className="text-xs text-red-500 flex items-center gap-1 font-medium animate-in fade-in slide-in-from-top-1">
                            <MdErrorOutline size={14} />
                            {error}
                        </p>
                    )}

                    {helperText && !error && (
                        <p className="text-xs text-text-muted">{helperText}</p>
                    )}
                </div>
            </div>
        );
    }
);

Textarea.displayName = "Textarea";

export { Textarea };

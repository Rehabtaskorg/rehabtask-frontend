import { forwardRef } from "react";
import { MdErrorOutline } from "react-icons/md";

const Input = forwardRef(
    ({ label, error, helperText, className = "", icon, ...props }, ref) => {
        return (
            <div className="space-y-2">
                {label && (
                    <label className="block text-sm font-bold text-text-main  uppercase tracking-wide">
                        {label}
                        {props.required && (
                            <span className="text-red-500 ml-1">*</span>
                        )}
                    </label>
                )}
                <div className="relative space-y-1.5">
                    <input
                        ref={ref}
                        className={`
                            w-full px-4 py-3 rounded-xl
                            bg-white 
                            border transition-all outline-none
                            /* Border Logic: Light vs Dark vs Error */
                            ${error
                                ? "border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                : "border-border-subtle  focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            }
                            /* Text Colors */
                            text-text-main 
                            placeholder:text-text-muted/50
                            ${icon ? "pr-10" : ""}
                            ${className}
                        `}
                        {...props}
                    />

                    {icon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                            {icon}
                        </div>
                    )}

                    {error && (
                        <p className="text-xs text-red-500 flex items-center gap-1 font-medium animate-in fade-in slide-in-from-top-1">
                            <MdErrorOutline size={14} />
                            {error}
                        </p>
                    )}

                    {helperText && !error && (
                        <p className="text-xs text-text-muted ">
                            {helperText}
                        </p>
                    )}
                </div>
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;
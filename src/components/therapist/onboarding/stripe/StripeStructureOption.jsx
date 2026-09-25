"use client";

/**
 * Single radio option for business structure selection.
 *
 * @param {{ value: string, title: string, description: string, isSelected: boolean, onChange: (value: string) => void }} props
 * @returns {JSX.Element}
 */
export const StripeStructureOption = ({ value, title, description, isSelected, onChange }) => (
    <label
        className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
            isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border-light hover:border-primary/40"
        }`}
    >
        <input
            type="radio"
            name="businessStructure"
            value={value}
            checked={isSelected}
            onChange={() => onChange(value)}
            aria-describedby={`desc-${value}`}
            className="sr-only"
        />
        <span
            aria-hidden="true"
            className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                isSelected ? "border-primary" : "border-slate-300"
            }`}
        >
            {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
        </span>
        <span className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-text-main">{title}</span>
            <span id={`desc-${value}`} className="text-xs text-text-muted leading-relaxed">
                {description}
            </span>
        </span>
    </label>
);
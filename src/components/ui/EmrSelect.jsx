"use client";

import { useRequestOptions } from "@/hooks/useRequestOptions";

const OTHER = "Other";

export function EmrSelect({
    value,
    otherValue,
    onChange,
    onOtherChange,
    label = "EMR System",
    isRequired = false,
    selectClassName = "",
    inputClassName = "",
    labelClassName = "",
    id = "emr",
}) {
    const { data: options = [] } = useRequestOptions("emr");

    const handleChange = (event) => {
        const next = event.target.value;
        onChange(next);
        if (next !== OTHER) onOtherChange("");
    };

    return (
        <div>
            <label htmlFor={id} className={labelClassName}>
                {label}
                {isRequired && <span className="ml-1 text-red-500">*</span>}
            </label>

            <select id={id} value={value ?? ""} onChange={handleChange} className={selectClassName}>
                <option value="">Select EMR system...</option>
                {options.map((option) => (
                    <option key={option.id} value={option.value}>
                        {option.value}
                    </option>
                ))}
                <option value={OTHER}>{OTHER}</option>
            </select>

            {value === OTHER && (
                <input
                    type="text"
                    value={otherValue ?? ""}
                    onChange={(event) => onOtherChange(event.target.value)}
                    placeholder="Enter EMR system..."
                    maxLength={100}
                    aria-label="EMR system name"
                    className={`${inputClassName} mt-2`}
                />
            )}
        </div>
    );
}

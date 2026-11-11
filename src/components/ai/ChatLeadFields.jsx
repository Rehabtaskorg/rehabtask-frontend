"use client";

import { MdExpandMore } from "react-icons/md";
import PhoneInput from "@/components/ui/PhoneInput";
import { LEAD_CATEGORY_OPTIONS, LEAD_COPY, LEAD_ROLE_OPTIONS } from "@/lib/aiChatConfig";

const FIELD_CLASS =
    "w-full rounded-lg border border-border-light px-3 py-2 text-base text-text-main outline-none focus:border-primary sm:text-sm";

export function ChatLeadFields({ register, control, errors, selectedRole, showOptional, onExpand }) {
    const describe = (field) =>
        errors[field] ? { "aria-invalid": true, "aria-describedby": `lead-${field}-error` } : {};

    const fieldError = (field) =>
        errors[field] && (
            <p id={`lead-${field}-error`} className="mt-1 text-xs text-red-700" role="alert">
                {errors[field].message}
            </p>
        );

    return (
        <>
            <fieldset className="mb-3">
                <legend className="mb-2 text-sm text-text-main">I am a...</legend>
                <div className="flex flex-wrap gap-1.5">
                    {LEAD_ROLE_OPTIONS.map(({ value, label }) => (
                        <label
                            key={value}
                            className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs ${selectedRole === value
                                ? "border-primary bg-primary text-white"
                                : "border-border-light text-text-muted hover:border-primary"
                                }`}
                        >
                            <input type="radio" value={value} {...register("role")} className="sr-only" />
                            {label}
                        </label>
                    ))}
                </div>
                {fieldError("role")}
            </fieldset>

            <div className="space-y-2">
                <div>
                    <label htmlFor="lead-name" className="text-sm text-text-main">Name</label>
                    <input id="lead-name" type="text" autoComplete="name" className={FIELD_CLASS}
                        {...register("name")} {...describe("name")} />
                    {fieldError("name")}
                </div>

                <div>
                    <label htmlFor="lead-email" className="text-sm text-text-main">Email</label>
                    <input id="lead-email" type="email" inputMode="email" autoComplete="email"
                        className={FIELD_CLASS} {...register("email")} {...describe("email")} />
                    {fieldError("email")}
                </div>

                <div>
                    <label htmlFor="lead-category" className="text-sm text-text-main">
                        What is this about? (optional)
                    </label>
                    <select id="lead-category" className={FIELD_CLASS}
                        {...register("category")} {...describe("category")}>
                        <option value="">Choose one</option>
                        {LEAD_CATEGORY_OPTIONS.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                    {fieldError("category")}
                </div>
            </div>

            <div className="mt-2">
                <label htmlFor="lead-context" className="text-sm text-text-main">
                    What can we help with?
                </label>
                <textarea id="lead-context" rows={3} maxLength={300}
                    className={`${FIELD_CLASS} resize-none`} {...register("context")} {...describe("context")} />
                <p className="mt-1 text-xs text-text-muted">{LEAD_COPY.contextHelper}</p>
                {fieldError("context")}
            </div>

            {showOptional ? (
                <div className="mt-2">
                    <PhoneInput
                        label="Phone (optional)"
                        name="phone"
                        control={control}
                        error={errors.phone?.message}
                    />
                </div>
            ) : (
                <button type="button" onClick={onExpand}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                    <MdExpandMore className="text-sm" />
                    {LEAD_COPY.expand}
                </button>
            )}
        </>
    );
}

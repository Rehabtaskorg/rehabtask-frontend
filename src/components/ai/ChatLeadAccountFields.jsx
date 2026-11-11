"use client";

import { LEAD_CATEGORY_OPTIONS, LEAD_COPY } from "@/lib/aiChatConfig";

const FIELD_CLASS =
    "w-full rounded-lg border border-border-light px-3 py-2 text-base text-text-main outline-none focus:border-primary sm:text-sm";

export function ChatLeadAccountFields({ account, register, errors }) {
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
            <div className="mb-3 rounded-lg border border-border-light bg-background-light px-3 py-2">
                <p className="text-sm font-medium text-text-main">{account.name}</p>
                <p className="text-xs text-text-muted">{account.email}</p>
            </div>

            <div className="space-y-2">
                <div>
                    <label htmlFor="lead-category" className="text-sm text-text-main">
                        What is this about?
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

                <div>
                    <label htmlFor="lead-subject" className="text-sm text-text-main">
                        Subject (optional)
                    </label>
                    <input id="lead-subject" type="text" maxLength={120} className={FIELD_CLASS}
                        {...register("subject")} {...describe("subject")} />
                    {fieldError("subject")}
                </div>

                <div>
                    <label htmlFor="lead-context" className="text-sm text-text-main">
                        What can we help with?
                    </label>
                    <textarea id="lead-context" rows={3} maxLength={300}
                        className={`${FIELD_CLASS} resize-none`}
                        {...register("context")} {...describe("context")} />
                    <p className="mt-1 text-xs text-text-muted">{LEAD_COPY.contextHelper}</p>
                    {fieldError("context")}
                </div>
            </div>
        </>
    );
}

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdCheckCircle } from "react-icons/md";
import { chatLeadSchema } from "@/lib/validators/chatLead.schema";
import { LEAD_COPY, LEAD_ROLE_OPTIONS, SUPPORT_EMAIL } from "@/lib/aiChatConfig";
import { sendChatLead, getChatErrorMessage } from "@/services/ai.api";

const FIELD_CLASS =
    "w-full rounded-lg border border-border-light px-3 py-2 text-base text-text-main outline-none focus:border-primary sm:text-sm";

/**
 * @param {{ onSent: (email: string) => void, onDismiss: () => void,
 *           onStart: () => void }} props
 */
export function ChatLeadForm({ onSent, onDismiss, onStart }) {
    const {
        register,
        handleSubmit,
        watch,
        setError,
        formState: { errors, isSubmitting, isDirty },
    } = useForm({
        resolver: zodResolver(chatLeadSchema),
        defaultValues: { role: "", name: "", email: "", phone: "", context: "" },
    });

    const selectedRole = watch("role");

    const submit = async (values) => {
        try {
            await sendChatLead(values);
            onSent(values.email);
        } catch (error) {
            setError("root", { message: getChatErrorMessage(error) });
        }
    };

    const describe = (field) =>
        errors[field] ? { "aria-invalid": true, "aria-describedby": `lead-${field}-error` } : {};

    const fieldError = (field) =>
        errors[field] && (
            <p id={`lead-${field}-error`} className="mt-1 text-xs text-red-700" role="alert">
                {errors[field].message}
            </p>
        );

    return (
        <form
            onSubmit={handleSubmit(submit)}
            onFocus={isDirty ? undefined : onStart}
            className="rounded-2xl border border-border-light bg-white p-4"
            aria-label="Contact the RehabTask team"
        >
            <fieldset className="mb-3">
                <legend className="mb-2 text-sm font-semibold text-text-main">I am a...</legend>
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
                    <label htmlFor="lead-phone" className="text-sm text-text-main">Phone (optional)</label>
                    <input id="lead-phone" type="tel" inputMode="tel" autoComplete="tel"
                        className={FIELD_CLASS} {...register("phone")} {...describe("phone")} />
                    {fieldError("phone")}
                </div>

                <div>
                    <label htmlFor="lead-context" className="text-sm text-text-main">
                        What can we help with? (optional)
                    </label>
                    <textarea id="lead-context" rows={2} maxLength={300}
                        className={`${FIELD_CLASS} resize-none`} {...register("context")} {...describe("context")} />
                    <p className="mt-1 text-xs text-text-muted">{LEAD_COPY.contextHelper}</p>
                    {fieldError("context")}
                </div>
            </div>

            {errors.root && (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
                    {errors.root.message} Or email us at {SUPPORT_EMAIL}.
                </p>
            )}

            <button type="submit" disabled={isSubmitting}
                className="mt-3 w-full rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {isSubmitting ? "Sending..." : LEAD_COPY.submit}
            </button>

            <button type="button" onClick={onDismiss} disabled={isSubmitting}
                className="mt-2 w-full text-xs text-text-muted hover:text-text-main disabled:opacity-50">
                {LEAD_COPY.dismiss}
            </button>

            <p className="mt-3 text-xs text-text-muted">{LEAD_COPY.consent}</p>
        </form>
    );
}

/**
 * @param {{ email: string }} props
 */
export function ChatLeadSent({ email }) {
    return (
        <div className="flex items-start gap-2 rounded-2xl border border-border-light bg-background-light p-3">
            <MdCheckCircle className="mt-0.5 shrink-0 text-lg text-primary" aria-hidden="true" />
            <p className="text-sm text-text-main">
                Thanks, the RehabTask team will email you at <strong>{email}</strong>.
            </p>
        </div>
    );
}

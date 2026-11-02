"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdArrowBack, MdCheckCircle } from "react-icons/md";
import { chatLeadSchema } from "@/lib/validators/chatLead.schema";
import { LEAD_COPY, SUPPORT_EMAIL } from "@/lib/aiChatConfig";
import { sendChatLead, getChatErrorMessage } from "@/services/ai.api";
import { ChatLeadFields } from "./ChatLeadFields";

export function ChatLeadForm({ onSent, onBack, onStart, onExpand }) {
    const [showOptional, setShowOptional] = useState(false);

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

    const submit = async (values) => {
        try {
            await sendChatLead(values);
            onSent(values.email);
        } catch (error) {
            setError("root", { message: getChatErrorMessage(error) });
        }
    };

    const expandOptional = () => {
        setShowOptional(true);
        onExpand();
    };

    return (
        <form
            onSubmit={handleSubmit(submit)}
            onFocus={isDirty ? undefined : onStart}
            className="flex h-full flex-col"
        >
            <div className="flex items-center gap-1 border-b border-border-light px-2 py-2">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isSubmitting}
                    className="rounded-lg p-2 text-text-muted hover:bg-background-light hover:text-text-main disabled:opacity-50"
                    aria-label="Back to chat"
                >
                    <MdArrowBack className="text-lg" />
                </button>
                <h3 className="text-sm font-bold text-text-main">Contact the team</h3>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3">
                <p className="mb-3 text-sm text-text-muted">{LEAD_COPY.intro}</p>

                <ChatLeadFields
                    register={register}
                    errors={errors}
                    selectedRole={watch("role")}
                    showOptional={showOptional}
                    onExpand={expandOptional}
                />

                {errors.root && (
                    <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
                        {errors.root.message} Or email us at {SUPPORT_EMAIL}.
                    </p>
                )}
            </div>

            <div className="border-t border-border-light px-4 py-3">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                    {isSubmitting ? "Sending..." : LEAD_COPY.submit}
                </button>
                <p className="mt-2 text-xs text-text-muted">{LEAD_COPY.consent}</p>
            </div>
        </form>
    );
}

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

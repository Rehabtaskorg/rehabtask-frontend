"use client";

import { useEffect, useRef, useState } from "react";
import { ChatHeader } from "./ChatHeader";
import { useAiChat } from "@/hooks/useAiChat";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useChatLead } from "@/hooks/useChatLead";
import { getSuggestedQuestions } from "@/lib/aiChatConfig";
import { ChatWelcome } from "./ChatWelcome";
import { ChatMessages } from "./ChatMessages";
import { ChatComposer } from "./ChatComposer";

/**
 * @param {{ isOpen: boolean, audience?: "public"|"customer"|"therapist"|"agency",
 *           onClose: () => void }} props
 */
export function ChatPanel({ isOpen, audience = "public", onClose }) {
    const {
        messages, error, failedText, isSending, retryAfterSeconds, hasLeadCard,
        send, reset, openLead, dismissLead, completeLead,
    } = useAiChat(audience);
    const [draft, setDraft] = useState("");
    const [cooldown, setCooldown] = useState(0);

    const endRef = useRef(null);
    const inputRef = useRef(null);
    const { trackEvent } = useAnalytics();

    const suggestions = getSuggestedQuestions(audience);

    const lead = useChatLead({
        audience,
        hasLeadCard,
        openLead,
        dismissLead,
        completeLead,
        scrollToEnd: () => endRef.current?.scrollIntoView({ behavior: "smooth" }),
    });
    const isEmpty = messages.length <= 1;
    const isBlocked = isSending || cooldown > 0;

    useEffect(() => {
        if (!isOpen) return;
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isSending, error, isOpen]);

    useEffect(() => {
        if (failedText) setDraft((current) => (current.trim() ? current : failedText));
    }, [failedText]);

    useEffect(() => {
        const lastReply = messages.filter((m) => m.role !== "lead").at(-1);
        if (lastReply?.role === "assistant") {
            trackEvent("ai_response_received", { audience });
        }
    }, [messages, audience, trackEvent]);

    useEffect(() => {
        if (!retryAfterSeconds) return undefined;
        setCooldown(retryAfterSeconds);
        const timer = setInterval(() => {
            setCooldown((seconds) => {
                if (seconds <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return seconds - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [retryAfterSeconds]);

    useEffect(() => {
        if (!isOpen) return undefined;
        const onKeyDown = (event) => {
            if (event.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) return;
        if (window.matchMedia("(min-width: 640px)").matches) inputRef.current?.focus();
    }, [isOpen]);

    const submit = (text) => {
        if (isBlocked || !text.trim()) return;
        setDraft("");
        trackEvent("ai_question_sent", { audience, turn: messages.length / 2 + 1 });
        send(text);
        inputRef.current?.focus();
    };

    return (
        <section
            role="dialog"
            aria-label="RehabTask assistant"
            aria-hidden={!isOpen}
            className={`fixed bottom-0 right-0 z-50 h-[100dvh] w-full flex-col bg-white shadow-2xl sm:bottom-24 sm:right-6 sm:h-[32rem] sm:w-96 sm:rounded-2xl sm:border sm:border-border-light ${isOpen ? "flex" : "hidden"}`}
        >
            <ChatHeader
                canReset={!isEmpty}
                onReset={() => { reset(); setDraft(""); }}
                onClose={onClose}
            />

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                <ChatMessages
                    messages={messages}
                    isSending={isSending}
                    error={error}
                    onLeadStart={lead.onLeadStart}
                    onLeadDismiss={lead.onLeadDismiss}
                    onLeadSent={lead.onLeadSent}
                />

                {isEmpty && suggestions.length > 0 && (
                    <ChatWelcome suggestions={suggestions} isBlocked={isBlocked} onPick={submit} />
                )}

                <div ref={endRef} />
            </div>

            <ChatComposer
                draft={draft}
                onDraftChange={setDraft}
                onSubmit={submit}
                isBlocked={isBlocked}
                cooldown={cooldown}
                inputRef={inputRef}
                onSupportClick={() => trackEvent("ai_support_clicked", { audience })}
                onTalkToTeam={audience === "public" ? lead.onTalkToTeam : undefined}
            />
        </section>
    );
}

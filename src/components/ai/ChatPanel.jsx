"use client";

import { useEffect, useRef, useState } from "react";
import { MdArrowForward } from "react-icons/md";
import { ChatHeader } from "./ChatHeader";
import { useAiChat } from "@/hooks/useAiChat";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useChatLead } from "@/hooks/useChatLead";
import { getSuggestedQuestions, LEAD_COPY } from "@/lib/aiChatConfig";
import { ChatWelcome } from "./ChatWelcome";
import { ChatMessages } from "./ChatMessages";
import { ChatComposer } from "./ChatComposer";
import { ChatLeadForm } from "./ChatLeadForm";
import { useChatScroll } from "@/hooks/useChatScroll";

export function ChatPanel({ isOpen, audience = "public", onClose }) {
    const {
        messages, error, failedText, isSending, retryAfterSeconds, isLeadOpen, isLeadOffered,
        send, reset, openLead, closeLead, completeLead,
    } = useAiChat(audience);
    const [draft, setDraft] = useState("");
    const [cooldown, setCooldown] = useState(0);

    const inputRef = useRef(null);
    const { scrollRef, endRef } = useChatScroll({
        isActive: isOpen && !isLeadOpen,
        messages,
        isSending,
        error,
    });
    const { trackEvent } = useAnalytics();

    const suggestions = getSuggestedQuestions(audience);

    const lead = useChatLead({ audience, isLeadOffered, openLead, completeLead });
    const isEmpty = messages.length <= 1;
    const isBlocked = isSending || cooldown > 0;


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
            className={`fixed bottom-0 right-0 z-[100] h-[100dvh] w-full flex-col bg-white shadow-2xl sm:bottom-24 sm:right-6 sm:h-[min(42rem,calc(100dvh-8rem))] sm:w-96 sm:rounded-2xl sm:border sm:border-border-light ${isOpen ? "flex" : "hidden"}`}
        >
            {isLeadOpen ? (
                <ChatLeadForm
                    onSent={lead.onSent}
                    onBack={closeLead}
                    onStart={lead.onStart}
                    onExpand={lead.onExpand}
                />
            ) : (
                <>
                    <ChatHeader
                        canReset={!isEmpty}
                        onReset={() => { reset(); setDraft(""); }}
                        onClose={onClose}
                    />

                    <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                        <ChatMessages messages={messages} isSending={isSending} error={error} />

                        {isEmpty && suggestions.length > 0 && (
                            <ChatWelcome suggestions={suggestions} isBlocked={isBlocked} onPick={submit} />
                        )}

                        {isLeadOffered && (
                            <button
                                type="button"
                                onClick={() => lead.onOpen("offer")}
                                className="flex w-full items-center justify-between gap-2 rounded-xl bg-primary px-3 py-2.5 text-left text-sm font-semibold text-white hover:opacity-90"
                            >
                                {LEAD_COPY.offer}
                                <MdArrowForward className="shrink-0 text-base" aria-hidden="true" />
                            </button>
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
                        onTalkToTeam={
                            audience === "public" && !isLeadOffered
                                ? () => lead.onOpen("footer")
                                : undefined
                        }
                    />
                </>
            )}
        </section>
    );
}

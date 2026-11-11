"use client";

import { useEffect, useRef, useState } from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatLeadOffer } from "./ChatLeadOffer";
import { useAiChat } from "@/hooks/useAiChat";
import { useChatAnalytics } from "@/hooks/useChatAnalytics";
import { useChatLead } from "@/hooks/useChatLead";
import { getSuggestedQuestions } from "@/lib/aiChatConfig";
import { ChatWelcome } from "./ChatWelcome";
import { ChatMessages } from "./ChatMessages";
import { ChatComposer } from "./ChatComposer";
import { ChatLeadForm } from "./ChatLeadForm";
import { useChatScroll } from "@/hooks/useChatScroll";

export function ChatPanel({ isOpen, audience = "public", account = null, onClose }) {
    const {
        messages, error, failedText, isSending, retryAfterSeconds, isLeadOpen, isLeadOffered,
        send, reset, openLead, closeLead, completeLead, declineLead,
    } = useAiChat(audience, account?.name);
    const [draft, setDraft] = useState("");
    const [cooldown, setCooldown] = useState(0);

    const inputRef = useRef(null);
    const { scrollRef, endRef } = useChatScroll({
        isActive: isOpen && !isLeadOpen,
        messages,
        isSending,
        error,
        isLeadOffered,
    });
    const { trackQuestion, resetSession } = useChatAnalytics({ audience, messages });

    const suggestions = getSuggestedQuestions(audience);

    const lead = useChatLead({
        audience,
        hasAccount: Boolean(account?.email),
        isLeadOffered,
        openLead,
        completeLead,
        declineLead,
    });
    const isEmpty = messages.length <= 1;
    const isBlocked = isSending || cooldown > 0;


    useEffect(() => {
        if (failedText) setDraft((current) => (current.trim() ? current : failedText));
    }, [failedText]);

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
        trackQuestion(messages.length / 2 + 1);
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
                    account={account}
                    onSent={lead.onSent}
                    onBack={closeLead}
                    onStart={lead.onStart}
                    onExpand={lead.onExpand}
                />
            ) : (
                <>
                    <ChatHeader
                        canReset={!isEmpty}
                        onReset={() => { reset(); setDraft(""); resetSession(); }}
                        onClose={onClose}
                    />

                    <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                        <ChatMessages messages={messages} isSending={isSending} error={error} />

                        {isEmpty && suggestions.length > 0 && (
                            <ChatWelcome suggestions={suggestions} isBlocked={isBlocked} onPick={submit} />
                        )}

                        {isLeadOffered && (
                            <ChatLeadOffer
                                onAccept={() => lead.onOpen("offer")}
                                onDecline={lead.onDecline}
                            />
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
                        onTalkToTeam={isLeadOffered ? undefined : () => lead.onOpen("footer")}
                    />
                </>
            )}
        </section>
    );
}

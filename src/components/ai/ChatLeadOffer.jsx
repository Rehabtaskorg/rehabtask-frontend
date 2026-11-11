"use client";

import { LEAD_COPY } from "@/lib/aiChatConfig";

export function ChatLeadOffer({ onAccept, onDecline }) {
    return (
        <div className="rounded-2xl border border-border-light bg-background-light p-3">
            <p className="text-sm text-text-main">{LEAD_COPY.offer}</p>
            <div className="mt-2 flex gap-2">
                <button
                    type="button"
                    onClick={onAccept}
                    className="flex-1 rounded-xl bg-accent-strong px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                    {LEAD_COPY.offerAccept}
                </button>
                <button
                    type="button"
                    onClick={onDecline}
                    className="flex-1 rounded-xl border border-border-light bg-white px-3 py-2 text-sm font-semibold text-text-main hover:border-text-muted"
                >
                    {LEAD_COPY.offerDecline}
                </button>
            </div>
        </div>
    );
}

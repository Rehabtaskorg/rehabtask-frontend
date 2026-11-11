"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { LEAD_COPY } from "@/lib/aiChatConfig";

export function useChatLead({ audience, hasAccount, isLeadOffered, openLead, completeLead, declineLead }) {
    const { trackEvent } = useAnalytics();
    const offeredRef = useRef(false);

    useEffect(() => {
        if (!isLeadOffered) {
            offeredRef.current = false;
            return;
        }
        if (offeredRef.current) return;
        offeredRef.current = true;
        trackEvent("lead_offered", { audience });
    }, [audience, isLeadOffered, trackEvent]);

    const onOpen = useCallback(
        (source) => {
            openLead();
            trackEvent("lead_form_opened", { audience, source });
        },
        [audience, openLead, trackEvent]
    );

    const onStart = useCallback(
        () => trackEvent("lead_form_started", { audience }),
        [audience, trackEvent]
    );

    const onExpand = useCallback(
        () => trackEvent("lead_form_expanded", { audience }),
        [audience, trackEvent]
    );

    const onSent = useCallback(
        (result) => {
            completeLead(result);
            trackEvent("lead_form_submitted", { audience });
        },
        [audience, completeLead, trackEvent]
    );

    const onDecline = useCallback(
        () => declineLead(hasAccount ? LEAD_COPY.declinedAccount : LEAD_COPY.declinedGuest),
        [declineLead, hasAccount]
    );

    return { onOpen, onStart, onExpand, onSent, onDecline };
}

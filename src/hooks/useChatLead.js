"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";

export function useChatLead({ audience, hasLeadCard, openLead, dismissLead, completeLead, scrollToEnd }) {
    const { trackEvent } = useAnalytics();
    const shownRef = useRef(false);

    useEffect(() => {
        if (!hasLeadCard) {
            shownRef.current = false;
            return;
        }
        if (shownRef.current) return;
        shownRef.current = true;
        trackEvent("lead_card_shown", { audience });
    }, [audience, hasLeadCard, trackEvent]);

    const onTalkToTeam = useCallback(() => {
        if (!hasLeadCard) openLead();
        scrollToEnd();
    }, [hasLeadCard, openLead, scrollToEnd]);

    const onLeadStart = useCallback(
        () => trackEvent("lead_card_started", { audience }),
        [audience, trackEvent]
    );

    const onLeadDismiss = useCallback(() => {
        dismissLead();
        trackEvent("lead_card_dismissed", { audience });
    }, [audience, dismissLead, trackEvent]);

    const onLeadSent = useCallback(
        (email) => {
            completeLead(email);
            trackEvent("lead_card_submitted", { audience });
        },
        [audience, completeLead, trackEvent]
    );

    return { onTalkToTeam, onLeadStart, onLeadDismiss, onLeadSent };
}

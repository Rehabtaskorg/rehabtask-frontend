"use client";

import { useCallback, useRef, useState } from "react";

export function useLeadState(setMessages) {
    const [isLeadOpen, setIsLeadOpen] = useState(false);
    const [isLeadOffered, setIsLeadOffered] = useState(false);
    const leadSentRef = useRef(false);

    const openLead = useCallback(() => setIsLeadOpen(true), []);

    const closeLead = useCallback(() => setIsLeadOpen(false), []);

    const markLeadOffered = useCallback(() => {
        if (!leadSentRef.current) setIsLeadOffered(true);
    }, []);

    const completeLead = useCallback(
        ({ email, reference }) => {
            leadSentRef.current = true;
            setIsLeadOpen(false);
            setIsLeadOffered(false);
            setMessages((current) => [...current, { role: "lead-sent", email, reference }]);
        },
        [setMessages]
    );

    const declineLead = useCallback(
        (content) => {
            setIsLeadOffered(false);
            setMessages((current) => [...current, { role: "assistant", content }]);
        },
        [setMessages]
    );

    const resetLead = useCallback(() => {
        leadSentRef.current = false;
        setIsLeadOpen(false);
        setIsLeadOffered(false);
    }, []);

    return {
        isLeadOpen,
        isLeadOffered,
        openLead,
        closeLead,
        markLeadOffered,
        completeLead,
        declineLead,
        resetLead,
    };
}

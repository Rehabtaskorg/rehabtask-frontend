"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "rehabtask.chat.invite.seen";
const SHOW_AFTER_MS = 1500;

const hasSeen = () => {
    try {
        return globalThis.localStorage?.getItem(STORAGE_KEY) === "1";
    } catch {
        return true;
    }
};

const remember = () => {
    try {
        globalThis.localStorage?.setItem(STORAGE_KEY, "1");
    } catch {
        return;
    }
};

export function useChatInvite({ isSuppressed }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isSuppressed || hasSeen()) return undefined;

        const timer = setTimeout(() => setIsVisible(true), SHOW_AFTER_MS);
        return () => clearTimeout(timer);
    }, [isSuppressed]);

    useEffect(() => {
        if (isSuppressed && isVisible) setIsVisible(false);
    }, [isSuppressed, isVisible]);

    const dismiss = useCallback(() => {
        setIsVisible(false);
        remember();
    }, []);

    return { isInviteVisible: isVisible, dismissInvite: dismiss };
}

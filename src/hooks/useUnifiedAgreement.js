'use client';

import { useState, useEffect, useCallback } from 'react';
import { authAPi } from '@/services/auth.api';

/**
 * Manages the unified legal agreement modal flow.
 * Fetches role-filtered sections, enforces the scroll gate,
 * records acceptance, and handles decline (logout + redirect).
 *
 * @param {{ onAccepted: () => void, onDecline: () => void }} options
 * @returns {{
 *   sections: Array<{ sectionNumber: number, title: string, body: string }>,
 *   hasScrolledToBottom: boolean,
 *   accepted: boolean,
 *   loading: boolean,
 *   accepting: boolean,
 *   error: string | null,
 *   setAccepted: (value: boolean) => void,
 *   handleAccept: () => Promise<void>,
 *   handleScroll: (e: React.UIEvent<HTMLElement>) => void,
 * }}
 */
export function useUnifiedAgreement({ onAccepted, onDecline }) {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);
    const [error, setError] = useState(null);
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const [accepted, setAccepted] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const fetchSections = async () => {
            try {
                const res = await authAPi.getAgreementContent();
                if (!cancelled) setSections(res.data.data.sections);
            } catch {
                if (!cancelled) setError('Failed to load agreement. Please refresh the page.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchSections();
        return () => { cancelled = true; };
    }, []);

    const handleScroll = useCallback((e) => {
        if (hasScrolledToBottom) return;
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop - clientHeight < 40) {
            setHasScrolledToBottom(true);
        }
    }, [hasScrolledToBottom]);

    const handleAccept = useCallback(async () => {
        if (!accepted || accepting) return;
        setAccepting(true);
        setError(null);
        try {
            await authAPi.acceptAgreement();
            onAccepted();
        } catch {
            setError('Failed to record your acceptance. Please try again.');
        } finally {
            setAccepting(false);
        }
    }, [accepted, accepting, onAccepted]);

    return {
        sections,
        hasScrolledToBottom,
        accepted,
        loading,
        accepting,
        error,
        setAccepted,
        handleAccept,
        handleScroll,
        handleDecline: onDecline,
    };
}

"use client";

import { useEffect, useState } from "react";
import { authAPi } from "@/services/auth.api";

export const useSignupPhoneVerification = (onVerified, { oauth = false } = {}) => {
    const [pending, setPending] = useState(null);
    const [challenge, setChallenge] = useState(null);
    const [code, setCode] = useState("");
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        if (!cooldown) return;
        const timer = window.setTimeout(() => setCooldown(cooldown - 1), 1000);
        return () => window.clearTimeout(timer);
    }, [cooldown]);

    const send = async (data) => {
        if (busy || cooldown) return;
        setBusy(true);
        setError(null);
        setPending(data);
        try {
            const response = oauth
                ? await authAPi.startOnboardingPhoneVerification(data.phone)
                : await authAPi.startSignupPhoneVerification(data.email, data.phone);
            setChallenge(response.data.data);
            setCode("");
            setCooldown(60);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to send a phone verification code.");
            if (err.response?.data?.code === "PHONE_RESEND_COOLDOWN" || err.isRateLimit) {
                setCooldown(err.retryAfterSeconds || 60);
            }
        } finally { setBusy(false); }
    };

    const verify = async (event) => {
        event.preventDefault();
        if (busy || !challenge || code.length !== 6) return;
        setBusy(true);
        setError(null);
        try {
            const result = await onVerified({ ...pending, phoneVerification: { challengeId: challenge.challengeId, challengeToken: challenge.challengeToken, code } });
            if (result?.success) {
                setCompleted(true);
                setPending(null);
                setChallenge(null);
                setCode("");
            } else {
                setError(result?.error || "Unable to complete signup. Please try again.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Unable to complete signup. Please try again.");
        } finally { setBusy(false); }
    };

    const cancel = () => { if (!busy) { setPending(null); setChallenge(null); setCode(""); setError(null); setCooldown(0); } };
    return { pending, challenge, code, setCode, error, busy, cooldown, completed, send, verify, cancel, resend: () => send(pending) };
};

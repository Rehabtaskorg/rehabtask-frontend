"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MdCheckCircle, MdClose, MdEmail, MdPhone, MdSecurity } from "react-icons/md";
import { authAPi } from "@/services/auth.api";
import { useAnalytics } from "@/hooks/useAnalytics";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";
import { Badge, BADGE_VARIANTS } from "@/components/ui/Badge";

export default function TwoFactorSettings() {
    const { trackEvent } = useAnalytics();
    const [status, setStatus] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [challenge, setChallenge] = useState(null);
    const [code, setCode] = useState("");
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [editingPhone, setEditingPhone] = useState(false);
    const [removeSmsOpen, setRemoveSmsOpen] = useState(false);
    const [removeSmsPassword, setRemoveSmsPassword] = useState("");
    const [addSmsOpen, setAddSmsOpen] = useState(false);
    const [useDifferentNumber, setUseDifferentNumber] = useState(false);
    const [disableOpen, setDisableOpen] = useState(false);
    const [disablePassword, setDisablePassword] = useState("");
    const [disableChallenge, setDisableChallenge] = useState(null);
    const [disableCode, setDisableCode] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const loadStatus = async () => {
        try {
            const response = await authAPi.getTwoFactorStatus();
            setStatus(response.data.data);
        } catch (error) {
            setMessage(error.response?.data?.message || "Unable to load security settings.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadStatus(); }, []);

    useEffect(() => {
        if (!cooldown) return undefined;
        const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
        return () => window.clearInterval(timer);
    }, [cooldown]);

    const closeAddSmsModal = () => {
        if (submitting) return;
        setAddSmsOpen(false);
        setPhoneNumber("");
        setChallenge(null);
        setCode("");
        setEditingPhone(false);
        setUseDifferentNumber(false);
        setCooldown(0);
    };

    const closeDisableModal = () => {
        if (submitting) return;
        setDisableOpen(false);
        setDisablePassword("");
        setDisableChallenge(null);
        setDisableCode("");
        setCooldown(0);
    };

    const openAddSms = () => {
        setMessage(null);
        setUseDifferentNumber(false);
        setPhoneNumber("");
        trackEvent("two_factor_setup_started", { method: "sms" });
        setAddSmsOpen(true);
    };

    const startEnrollment = async (selectedMethod = "sms", numberOverride) => {
        setSubmitting(true);
        setMessage(null);
        try {
            const number = numberOverride === undefined ? phoneNumber : numberOverride;
            trackEvent("two_factor_method_selected", { method: selectedMethod });
            const response = await authAPi.startTwoFactorEnrollment(
                selectedMethod,
                selectedMethod === "sms" && number ? number : undefined
            );
            setChallenge(response.data.data.challenge);
            setEditingPhone(false);
            setCooldown(60);
        } catch (error) {
            setMessage(error.response?.data?.message || "Unable to send a verification code.");
        } finally {
            setSubmitting(false);
        }
    };

    const verifyEnrollment = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setMessage(null);
        try {
            await authAPi.verifyTwoFactorEnrollment({
                challengeId: challenge.challengeId,
                challengeToken: challenge.challengeToken,
                code,
            });
            setChallenge(null);
            setCode("");
            setPhoneNumber("");
            setEditingPhone(false);
            setAddSmsOpen(false);
            await loadStatus();
            trackEvent("two_factor_enabled", { method: challenge?.method || "sms" });
            setMessage("Two-factor authentication enabled.");
        } catch (error) {
            setMessage(error.response?.data?.message || "The verification code is incorrect.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggle = async () => {
        setMessage(null);
        if (status?.enabled) {
            if (status.mandatory) return;
            setDisableOpen(true);
            return;
        }

        setSubmitting(true);
        try {
            trackEvent("two_factor_setup_started", { method: "email" });
            await authAPi.setTwoFactorEnabled(true);
            await loadStatus();
            trackEvent("two_factor_enabled", { method: "email" });
            setMessage("Email two-factor authentication is enabled.");
        } catch (error) {
            setMessage(error.response?.data?.message || "Unable to update two-factor authentication.");
        } finally {
            setSubmitting(false);
        }
    };

    const startDisable = async () => {
        setSubmitting(true);
        setMessage(null);
        try {
            const response = await authAPi.startDisableTwoFactor(status?.preferredMethod);
            setDisableChallenge(response.data.data.challenge);
            setCooldown(60);
        } catch (error) {
            setMessage(error.response?.data?.message || "Unable to start the disable process.");
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDisable = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setMessage(null);
        try {
            await authAPi.disableTwoFactor({
                currentPassword: disablePassword,
                challengeId: disableChallenge.challengeId,
                challengeToken: disableChallenge.challengeToken,
                code: disableCode,
            });
            closeDisableModal();
            await loadStatus();
            setMessage("Two-factor authentication has been disabled.");
        } catch (error) {
            setMessage(error.response?.data?.message || "Unable to disable two-factor authentication.");
        } finally {
            setSubmitting(false);
        }
    };

    const setPreferredMethod = async (method) => {
        if (!status?.enabled || status.preferredMethod === method || submitting) return;
        setSubmitting(true);
        setMessage(null);
        try {
            await authAPi.setPreferredTwoFactorMethod(method);
            await loadStatus();
            setMessage(`${method === "sms" ? "SMS" : "Email"} is now your primary verification method.`);
        } catch (error) {
            setMessage(error.response?.data?.message || "Unable to update preferred method.");
        } finally {
            setSubmitting(false);
        }
    };

    const confirmRemoveSms = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setMessage(null);
        try {
            await authAPi.removeSmsMethod(removeSmsPassword);
            setRemoveSmsOpen(false);
            setRemoveSmsPassword("");
            await loadStatus();
            setMessage("SMS two-factor authentication has been removed.");
        } catch (error) {
            setMessage(error.response?.data?.message || "Unable to remove SMS two-factor authentication.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-border-light p-6 text-sm text-text-muted">
                Loading two-factor authentication settings...
            </div>
        );
    }

    const bothMethodsEnabled = status?.methods?.email?.enabled && status?.methods?.sms?.enabled;
    const preferred = status?.preferredMethod;

    const methodRows = [
        status?.methods?.sms?.enabled && {
            key: "sms",
            icon: MdPhone,
            label: "SMS",
            value: status.methods.sms.destination,
            enabled: true,
            role: preferred === "sms" ? "Primary" : bothMethodsEnabled ? "Backup" : null,
        },
        {
            key: "email",
            icon: MdEmail,
            label: "Email",
            value: status?.methods?.email?.enabled ? status.methods.email.destination : "Not enabled",
            enabled: Boolean(status?.methods?.email?.enabled),
            role: status?.methods?.email?.enabled
                ? (preferred === "email" ? "Primary" : bothMethodsEnabled ? "Backup" : null)
                : null,
        },
        !status?.methods?.sms?.enabled && {
            key: "sms",
            icon: MdPhone,
            label: "SMS",
            value: status?.methods?.sms?.destination || "Not enabled",
            enabled: false,
            role: null,
        },
    ].filter(Boolean);

    return (
        <>
            <div className="rounded-xl border border-border-light bg-card-light p-6 shadow-sm">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                            <MdSecurity className="text-xl text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text-main">Two-factor authentication</h3>
                            <p className="text-sm text-text-muted">
                                Status: {status?.enabled ? "Enabled" : "Not enabled"}
                                {preferred ? ` · Primary: ${preferred === "sms" ? "SMS" : "Email"}` : ""}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-sm font-semibold ${status?.enabled ? "text-green-700" : "text-text-muted"}`}>
                            {status?.enabled ? "On" : "Off"}
                        </span>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={!!status?.enabled}
                            onClick={handleToggle}
                            disabled={submitting || status?.mandatory || disableOpen}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${status?.enabled ? "bg-primary" : "bg-gray-300"}`}
                            aria-label={status?.enabled ? "Turn off two-factor authentication" : "Turn on two-factor authentication"}
                        >
                            <span
                                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${status?.enabled ? "translate-x-5" : "translate-x-0"}`}
                            />
                        </button>
                    </div>
                </div>

                <div className="space-y-5">
                    {message && (
                        <Alert
                            type={message.includes("enabled") || message.includes("removed") || message.includes("disabled") || message.includes("primary") ? "success" : "error"}
                            message={message}
                            onClose={() => setMessage(null)}
                        />
                    )}

                    {status?.recommended && !status?.enabled && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                            Two-factor authentication is strongly recommended for therapist accounts before accessing sensitive payout and account features.
                        </div>
                    )}

                    <div className="grid gap-3">
                        {methodRows.map(({ key, icon: Icon, label, value, enabled, role }) => (
                            <div key={key} className="rounded-lg border border-border-light p-4 flex items-center gap-3">
                                <Icon className="text-xl text-primary shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-semibold text-text-main">{label}</p>
                                        {role && (
                                            <Badge variant={role === "Primary" ? BADGE_VARIANTS.INFO : BADGE_VARIANTS.NEUTRAL}>
                                                {role}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-text-muted">{value}</p>
                                </div>
                                {enabled ? (
                                    <MdCheckCircle className="text-green-600 text-lg shrink-0" />
                                ) : key === "sms" ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="shrink-0"
                                        onClick={openAddSms}
                                        disabled={submitting || removeSmsOpen || disableOpen}
                                    >
                                        Add number
                                    </Button>
                                ) : null}
                            </div>
                        ))}
                    </div>

                    {bothMethodsEnabled && (
                        <div className="rounded-lg border border-border-light p-4 space-y-3">
                            <div>
                                <h3 className="font-semibold text-text-main">Preferred method</h3>
                                <p className="text-sm text-text-muted mt-1">Choose which verified method receives login codes first.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {["sms", "email"].map((method) => (
                                    <button
                                        key={method}
                                        type="button"
                                        onClick={() => setPreferredMethod(method)}
                                        disabled={submitting || preferred === method}
                                        className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
                                            preferred === method
                                                ? "border-primary bg-primary/5 text-primary"
                                                : "border-border-light text-text-main hover:bg-muted-light"
                                        }`}
                                    >
                                        Use {method === "sms" ? "SMS" : "email"} first
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {status?.methods?.sms?.enabled && !removeSmsOpen && (
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => setRemoveSmsOpen(true)}
                                className="text-sm font-semibold text-red-600 hover:underline"
                            >
                                Remove SMS method
                            </button>
                        </div>
                    )}

                    {removeSmsOpen && (
                        <form onSubmit={confirmRemoveSms} className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-4">
                            <div>
                                <h3 className="font-semibold text-text-main">Remove SMS verification</h3>
                                <p className="text-sm text-text-muted mt-1">Email verification will remain enabled. Confirm with your current password.</p>
                            </div>
                            <Input
                                label="Current password"
                                type="password"
                                value={removeSmsPassword}
                                onChange={(event) => setRemoveSmsPassword(event.target.value)}
                                required
                            />
                            <div className="flex justify-end gap-3">
                                <Button type="submit" variant="destructive" loading={submitting} disabled={submitting || !removeSmsPassword}>Remove SMS</Button>
                                <Button type="button" variant="ghost" onClick={() => setRemoveSmsOpen(false)}>Cancel</Button>
                            </div>
                        </form>
                    )}

                    {status?.mandatory && (
                        <p className="text-sm text-text-muted">Two-factor authentication is required for this administrator account.</p>
                    )}
                </div>
            </div>

            {mounted && addSmsOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeAddSmsModal} aria-hidden="true" />
                    <div role="dialog" aria-modal="true" aria-label="Add SMS verification" className="relative bg-card-light rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-border-light flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MdPhone className="text-primary text-xl" />
                                <h2 className="text-lg font-semibold text-text-main">
                                    {editingPhone ? "Update mobile number" : challenge ? "Verify SMS number" : "Add SMS verification"}
                                </h2>
                            </div>
                            <button type="button" onClick={closeAddSmsModal} disabled={submitting} aria-label="Close dialog" className="text-text-muted hover:text-text-main transition-colors p-1 disabled:opacity-50">
                                <MdClose className="text-xl" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {message && !message.includes("enabled") && !message.includes("removed") && !message.includes("disabled") && !message.includes("primary") && (
                                <Alert type="error" message={message} onClose={() => setMessage(null)} />
                            )}
                            {!challenge && !editingPhone && (
                                <>
                                    <p className="text-sm text-text-muted">
                                        SMS becomes your primary login verification method. Email remains available as a backup.
                                    </p>

                                    {status?.methods?.sms?.reusable && !useDifferentNumber ? (
                                        <div className="space-y-4">
                                            <div className="rounded-lg border border-border-light bg-muted-light p-4">
                                                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Mobile phone</p>
                                                <p className="mt-1 text-base font-semibold text-text-main">{status.methods.sms.destination}</p>
                                                <p className="mt-1 text-sm text-text-muted">We&apos;ll send a verification code to this number from your profile.</p>
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <Button type="button" onClick={() => startEnrollment("sms", null)} loading={submitting} disabled={submitting} fullWidth>
                                                    Send code to this number
                                                </Button>
                                                <button
                                                    type="button"
                                                    onClick={() => { setUseDifferentNumber(true); setPhoneNumber(""); setMessage(null); }}
                                                    disabled={submitting}
                                                    className="text-sm font-semibold text-primary hover:underline disabled:opacity-50"
                                                >
                                                    Use a different number
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={closeAddSmsModal}
                                                    disabled={submitting}
                                                    className="text-sm text-text-muted hover:text-text-main disabled:opacity-50"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <Input
                                                label="Mobile phone"
                                                value={phoneNumber}
                                                onChange={(event) => setPhoneNumber(event.target.value)}
                                                placeholder="+1 555 123 4567"
                                                required
                                            />
                                            <div className="flex flex-col gap-3">
                                                <Button
                                                    type="button"
                                                    onClick={() => startEnrollment("sms")}
                                                    loading={submitting}
                                                    disabled={submitting || !phoneNumber}
                                                    fullWidth
                                                >
                                                    Send verification code
                                                </Button>
                                                {status?.methods?.sms?.reusable && (
                                                    <button
                                                        type="button"
                                                        onClick={() => { setUseDifferentNumber(false); setPhoneNumber(""); setMessage(null); }}
                                                        disabled={submitting}
                                                        className="text-sm font-semibold text-primary hover:underline disabled:opacity-50"
                                                    >
                                                        Back to {status.methods.sms.destination}
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={closeAddSmsModal}
                                                    disabled={submitting}
                                                    className="text-sm text-text-muted hover:text-text-main disabled:opacity-50"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                            {editingPhone && (
                                <div className="space-y-4">
                                    <p className="text-sm text-text-muted">Enter the correct number to receive a new verification code.</p>
                                    <Input label="Mobile phone" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} placeholder="+1 555 123 4567" required />
                                    <div className="flex flex-col gap-3">
                                        <Button type="button" onClick={() => startEnrollment("sms")} loading={submitting} disabled={submitting || !phoneNumber} fullWidth>
                                            Send code to this number
                                        </Button>
                                        <button type="button" onClick={() => setEditingPhone(false)} disabled={submitting} className="text-sm text-text-muted hover:text-text-main disabled:opacity-50">
                                            Back
                                        </button>
                                    </div>
                                </div>
                            )}
                            {challenge && !editingPhone && (
                                <form onSubmit={verifyEnrollment} className="space-y-4">
                                    <p className="text-sm text-text-muted">We sent a 6-digit code to {challenge.destination}. It expires in 10 minutes.</p>
                                    <Input label="Verification code" value={code} maxLength={6} inputMode="numeric" onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} required />
                                    <div className="flex flex-col items-stretch gap-3">
                                        <Button type="submit" loading={submitting} disabled={submitting || code.length !== 6}>Verify and enable</Button>
                                        <button type="button" onClick={() => { setChallenge(null); setEditingPhone(true); setCode(""); setCooldown(0); }} className="text-sm text-primary font-semibold hover:underline text-center">
                                            Wrong number?
                                        </button>
                                        <p className="text-xs text-text-muted text-center">You can request another code in {cooldown ? `${cooldown}s` : "a moment"}.</p>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {mounted && disableOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeDisableModal} aria-hidden="true" />
                    <div role="dialog" aria-modal="true" aria-label="Disable two-factor authentication" className="relative bg-card-light rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-border-light flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-text-main">Disable two-factor authentication</h2>
                            <button type="button" onClick={closeDisableModal} disabled={submitting} aria-label="Close dialog" className="text-text-muted hover:text-text-main transition-colors p-1 disabled:opacity-50">
                                <MdClose className="text-xl" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {message && !message.includes("enabled") && !message.includes("removed") && !message.includes("disabled") && !message.includes("primary") && (
                                <Alert type="error" message={message} onClose={() => setMessage(null)} />
                            )}
                            {!disableChallenge ? (
                                <>
                                    <p className="text-sm text-text-muted">For your security, disabling 2FA requires your current password and a verification code.</p>
                                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                        <Button type="button" variant="ghost" onClick={closeDisableModal} disabled={submitting}>Cancel</Button>
                                        <Button type="button" variant="destructive" onClick={startDisable} loading={submitting} disabled={submitting}>Send verification code</Button>
                                    </div>
                                </>
                            ) : (
                                <form onSubmit={confirmDisable} className="space-y-4">
                                    <p className="text-sm text-text-muted">Enter your password and the code sent to {disableChallenge.destination}.</p>
                                    <Input label="Current password" type="password" value={disablePassword} onChange={(event) => setDisablePassword(event.target.value)} required />
                                    <Input label="Verification code" inputMode="numeric" maxLength={6} value={disableCode} onChange={(event) => setDisableCode(event.target.value.replace(/\D/g, ""))} required />
                                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                        <Button type="button" variant="ghost" onClick={closeDisableModal} disabled={submitting}>Cancel</Button>
                                        <Button type="submit" variant="destructive" loading={submitting} disabled={submitting || !disablePassword || disableCode.length !== 6}>Disable 2FA</Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

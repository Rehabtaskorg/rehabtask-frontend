"use client";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

export default function SignupPhoneVerification({ verification }) {
    const { challenge, code, setCode, error, busy, cooldown, completed, verify, cancel, resend } = verification;
    return (
        <div className="mx-auto w-full max-w-lg rounded-xl border border-border-light bg-card-light p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-text-main">Verify your phone number</h2>
            <p className="mt-3 text-sm text-text-muted">SMS two-factor authentication will be enabled automatically to help protect your account.</p>
            {error && <div className="mt-4"><Alert type="error" message={error} /></div>}
            {completed ? (
                <div className="mt-4"><Alert type="success" message="Phone verified and SMS two-factor authentication enabled. Taking you to the next step…" /></div>
            ) : challenge ? (
                <form onSubmit={verify} className="mt-5 space-y-4">
                    <p className="text-sm text-text-muted">Enter the 6-digit code sent to {challenge.destination}. It expires in 10 minutes.</p>
                    <Input label="Verification code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} required />
                    <Button type="submit" fullWidth loading={busy} disabled={busy || code.length !== 6}>Verify and complete signup</Button>
                    <Button type="button" variant="outline" fullWidth disabled={busy || cooldown > 0} onClick={resend}>{cooldown ? `Resend code in ${cooldown}s` : "Resend code"}</Button>
                    <Button type="button" variant="ghost" fullWidth disabled={busy} onClick={cancel}>Edit signup details or phone number</Button>
                </form>
            ) : (
                <div className="mt-5 space-y-3">
                    <Button type="button" fullWidth loading={busy} disabled={busy || cooldown > 0} onClick={resend}>{cooldown ? `Try again in ${cooldown}s` : "Send verification code"}</Button>
                    <Button type="button" variant="ghost" fullWidth disabled={busy} onClick={cancel}>Back to signup details</Button>
                </div>
            )}
        </div>
    );
}

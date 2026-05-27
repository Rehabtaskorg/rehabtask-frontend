"use client";

import { useMemo } from "react";
import { loadConnectAndInitialize } from "@stripe/connect-js";
import { ConnectComponentsProvider } from "@stripe/react-connect-js";
import { api } from "@/lib/api";

const BG = "#ffffff";
const TEXT = "#111418";
const SECONDARY = "#617589";
const BORDER = "#e5e7eb";
const INPUT_BG = "#ffffff";
const OFFSET_BG = "#f9fafb";
const PRIMARY = "#0A2540";
const DANGER = "#ef4444";

const APPEARANCE = {
    variables: {
        colorPrimary: PRIMARY,
        colorBackground: BG,
        formBackgroundColor: INPUT_BG,
        offsetBackgroundColor: OFFSET_BG,
        colorText: TEXT,
        colorSecondaryText: SECONDARY,
        colorBorder: BORDER,
        formHighlightColorBorder: PRIMARY,
        formAccentColor: PRIMARY,
        colorDanger: DANGER,
        fontFamily: "inherit",
        fontSizeBase: "16px",
        headingXlFontSize: "24px",
        headingXlFontWeight: "700",
        headingLgFontSize: "20px",
        headingLgFontWeight: "700",
        headingMdFontSize: "18px",
        headingMdFontWeight: "600",
        headingSmFontSize: "16px",
        headingSmFontWeight: "600",
        headingXsFontSize: "14px",
        headingXsFontWeight: "600",
        bodyMdFontSize: "16px",
        bodyMdFontWeight: "400",
        bodySmFontSize: "14px",
        bodySmFontWeight: "400",
        labelMdFontSize: "14px",
        labelMdFontWeight: "600",
        labelSmFontSize: "13px",
        labelSmFontWeight: "500",
        buttonPrimaryColorBackground: PRIMARY,
        buttonPrimaryColorBorder: PRIMARY,
        buttonPrimaryColorText: "#ffffff",
        buttonSecondaryColorBackground: BG,
        buttonSecondaryColorBorder: BORDER,
        buttonSecondaryColorText: TEXT,
        buttonLabelFontSize: "14px",
        buttonLabelFontWeight: "600",
        buttonBorderRadius: "8px",
        buttonPaddingX: "16px",
        buttonPaddingY: "10px",
        formBorderRadius: "8px",
        inputFieldPaddingX: "14px",
        inputFieldPaddingY: "10px",
        borderRadius: "12px",
        overlayBorderRadius: "12px",
        spacingUnit: "8px",
    },
};

/**
 * Shared wrapper for all Stripe embedded Connect components.
 * Must wrap any <Connect*> component from @stripe/react-connect-js.
 *
 * Incrementing `retryKey` forces a full remount, which re-runs
 * loadConnectAndInitialize and issues a fresh fetchClientSecret call.
 * Use this to recover from transient SDK load failures.
 *
 * @param {{ children: React.ReactNode, accountSessionEndpoint?: string, retryKey?: number }} props
 */
export default function StripeConnectProvider({ children, accountSessionEndpoint, retryKey }) {
    const stripeConnectInstance = useMemo(() => {
        return loadConnectAndInitialize({
            publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
            fetchClientSecret: async () => {
                const endpoint = accountSessionEndpoint || "/payments/account-session";
                const res = await api.post(endpoint);
                return res.data.data.clientSecret;
            },
            appearance: APPEARANCE,
        });
    // retryKey forces a fresh instance on change — intentional dep
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountSessionEndpoint, retryKey]);

    return (
        <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
            {children}
        </ConnectComponentsProvider>
    );
}
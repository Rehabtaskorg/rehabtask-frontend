"use client";

import { useEffect, useMemo, useState } from "react";
import { loadConnectAndInitialize } from "@stripe/connect-js";
import { ConnectComponentsProvider } from "@stripe/react-connect-js";
import { api } from "@/lib/api";

/**
 * StripeConnectProvider
 *
 * Shared wrapper for all Stripe embedded components (account onboarding,
 * balances, payments, payouts). Must wrap any <Connect*> component from
 * @stripe/react-connect-js.
 *
 * Theme detection
 * ───────────────
 * This app uses Tailwind v4 with the default `dark:` variant, which resolves
 * via `prefers-color-scheme: dark` (there is no `class="dark"` on <html>).
 * So we detect dark mode through matchMedia, NOT classList.
 *
 * Stripe captures appearance at `loadConnectAndInitialize` time and does NOT
 * dynamically re-theme. To switch themes we re-create the instance and
 * remount the provider via a key, unmounting all embedded components.
 *
 * Typography alignment with app onboarding pages
 * ──────────────────────────────────────────────
 * The rest of the onboarding flow uses:
 *   h1  → text-4xl font-black (36px / 900) — but Stripe renders inside a card,
 *          not as the page h1, so we map this to Stripe's headingXl instead.
 *   h3  → text-xl font-bold (20px / 700)   → headingLg
 *   label → text-base font-semibold (16px / 600)
 *   body  → text-base (16px / 400)
 *   hint  → text-sm   (14px / 400)
 *   tiny  → text-xs   (12px / 400)
 *
 * Stripe's `fontSizeBase` is the root em-equivalent — all other font-sizes
 * scale relative to it. We set it to 16px to match the app's body text.
 *
 * Valid appearance variables (verified from Stripe docs):
 * https://docs.stripe.com/connect/embedded-appearance-options
 *
 * Colour source
 * ─────────────
 * All colour values mirror the CSS custom properties in src/app/globals.css.
 * Update both places if the theme ever changes.
 */

/* ─── Colour tokens (mirror globals.css) ───────────────────────────────── */

// Card surfaces — --color-card-light / --color-card-dark
const BG_LIGHT = "#ffffff";
const BG_DARK = "#1a2633";

// Body text — --color-text-main / white
const TEXT_LIGHT = "#111418";
const TEXT_DARK = "#ffffff";

// Muted / secondary text — --color-text-muted / slate-400 (matches dark mode in app)
const SECONDARY_LIGHT = "#617589";
const SECONDARY_DARK = "#94a3b8";

// Borders — --color-border-light / --color-border-dark
const BORDER_LIGHT = "#e5e7eb";
const BORDER_DARK = "#2d3748";

// Input / form field backgrounds — --color-input-light / slightly darker
// surface in dark mode (matches how app inputs look against card-dark)
const INPUT_BG_LIGHT = "#ffffff";
const INPUT_BG_DARK = "#0f1923";

// Hover / highlight row — --color-muted-light in light, slightly lighter
// than card-dark in dark mode for contrast on hover states
const OFFSET_BG_LIGHT = "#f9fafb";
const OFFSET_BG_DARK = "#162232";

// Brand — --color-primary
const PRIMARY = "#0A2540";
// Hover variant of primary (matches Tailwind's primary/90)
const PRIMARY_BORDER = "#0A2540";

// Status colours (match badges used elsewhere in the app)
const DANGER = "#ef4444";

/* ─── Theme helpers ─────────────────────────────────────────────────────── */

/**
 * Detect OS/browser dark mode preference. Safe to call server-side.
 */
function getInitialTheme() {
    if (typeof window === "undefined") return "light";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

/**
 * Build the full appearance object for a given theme. The object mirrors
 * the app's design tokens from globals.css and the onboarding pages'
 * typography scale exactly.
 */
function buildAppearance(theme) {
    const isDark = theme === "dark";

    return {
        variables: {
            /* ─── Brand ─── */
            colorPrimary: PRIMARY,

            /* ─── Surfaces ─── */
            colorBackground: isDark ? BG_DARK : BG_LIGHT,
            formBackgroundColor: isDark ? INPUT_BG_DARK : INPUT_BG_LIGHT,
            offsetBackgroundColor: isDark ? OFFSET_BG_DARK : OFFSET_BG_LIGHT,

            /* ─── Text ─── */
            colorText: isDark ? TEXT_DARK : TEXT_LIGHT,
            colorSecondaryText: isDark ? SECONDARY_DARK : SECONDARY_LIGHT,

            /* ─── Borders ─── */
            colorBorder: isDark ? BORDER_DARK : BORDER_LIGHT,
            formHighlightColorBorder: PRIMARY,
            formAccentColor: PRIMARY,

            /* ─── Feedback ─── */
            colorDanger: DANGER,

            /* ─── Typography ───────────────────────────────────────────
             * Base scale matches the app: body = 16px, label = 16px,
             * hint = 14px, tiny = 12px. Stripe's font-size variables
             * scale relative to fontSizeBase. */
            fontFamily: "inherit",
            fontSizeBase: "16px",

            /* Headings — match app's onboarding step headings (h3 = 20px/700) */
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

            /* Body — matches text-base (16px) and text-sm (14px) */
            bodyMdFontSize: "16px",
            bodyMdFontWeight: "400",
            bodySmFontSize: "14px",
            bodySmFontWeight: "400",

            /* Labels — matches text-base font-semibold (16px/600) used on
             * form field labels throughout the onboarding pages */
            labelMdFontSize: "14px",
            labelMdFontWeight: "600",
            labelSmFontSize: "13px",
            labelSmFontWeight: "500",

            /* ─── Buttons — match the app's primary button style
             * (bg-primary hover:brightness-95 text-white px-8 py-3
             *  rounded-lg font-bold) ─── */
            buttonPrimaryColorBackground: PRIMARY,
            buttonPrimaryColorBorder: PRIMARY_BORDER,
            buttonPrimaryColorText: "#ffffff",
            buttonSecondaryColorBackground: isDark ? BG_DARK : BG_LIGHT,
            buttonSecondaryColorBorder: isDark ? BORDER_DARK : BORDER_LIGHT,
            buttonSecondaryColorText: isDark ? TEXT_DARK : TEXT_LIGHT,
            buttonLabelFontSize: "14px",
            buttonLabelFontWeight: "600",
            buttonBorderRadius: "8px", // matches rounded-lg in the app
            buttonPaddingX: "16px",
            buttonPaddingY: "10px",

            /* ─── Inputs — denser to match form inputs in other steps ─── */
            formBorderRadius: "8px",
            inputFieldPaddingX: "14px",
            inputFieldPaddingY: "10px",

            /* ─── Radii — matches app card (rounded-xl = 12px) ─── */
            borderRadius: "12px",
            overlayBorderRadius: "12px",

            /* ─── Spacing — tightened so sections feel as dense as the
             * rest of the onboarding cards ─── */
            spacingUnit: "4px",
        },
    };
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function StripeConnectProvider({ children, accountSessionEndpoint }) {
    const [theme, setTheme] = useState(getInitialTheme);

    // Subscribe to OS theme changes. Flipping `theme` triggers a new memo
    // and a new key on the provider, which unmounts + remounts the embedded
    // components with fresh appearance.
    useEffect(() => {
        if (typeof window === "undefined") return;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = (e) => setTheme(e.matches ? "dark" : "light");
        mq.addEventListener?.("change", handler);
        return () => mq.removeEventListener?.("change", handler);
    }, []);

    const stripeConnectInstance = useMemo(() => {
        return loadConnectAndInitialize({
            publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,

            /**
             * fetchClientSecret — called by Stripe on mount and on session
             * expiry. Must return a raw client_secret string.
             */
            fetchClientSecret: async () => {
                const endpoint = accountSessionEndpoint || "/payments/account-session";
                const res = await api.post(endpoint);
                return res.data.data.clientSecret;
            },

            appearance: buildAppearance(theme),
        });
    }, [theme, accountSessionEndpoint]);

    return (
        <ConnectComponentsProvider
            key={theme}
            connectInstance={stripeConnectInstance}
        >
            {children}
        </ConnectComponentsProvider>
    );
}

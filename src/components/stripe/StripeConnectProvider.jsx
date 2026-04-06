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
 * via the `prefers-color-scheme: dark` media query (there is no `class="dark"`
 * on the <html> element). So we detect dark mode through matchMedia, NOT
 * through document.documentElement.classList.
 *
 * Stripe captures appearance at `loadConnectAndInitialize` time and does NOT
 * dynamically re-theme. To switch themes, the Stripe instance must be
 * re-created. We do this by keying the ConnectComponentsProvider with the
 * current theme and recreating the memoized instance whenever the media
 * query changes — this unmounts and remounts all embedded components.
 * Remounting will trigger a fresh account-session fetch, which is fine: the
 * backend is idempotent and sessions are single-use by design.
 *
 * Colour source
 * ─────────────
 * All colour values below mirror the CSS custom properties in globals.css.
 * Do NOT hardcode values that drift from those definitions — if the theme
 * changes in globals.css, update them here too. Stripe's appearance API only
 * accepts literal strings, not CSS variables, so direct duplication is
 * unavoidable.
 *
 * Valid appearance variables
 * ──────────────────────────
 * Stripe Connect embedded components only accept a strict subset of
 * appearance variables. Invalid keys emit console warnings. See:
 * https://docs.stripe.com/connect/embedded-appearance-options
 */

// globals.css: --color-card-light / --color-card-dark — surface for content
const BG_LIGHT = "#ffffff";
const BG_DARK = "#1a2633";

// globals.css: --color-text-main (light) / white (dark)
const TEXT_LIGHT = "#111418";
const TEXT_DARK = "#ffffff";

// globals.css: --color-text-muted (light) / slate-400 (dark, matches app)
const SECONDARY_LIGHT = "#617589";
const SECONDARY_DARK = "#94a3b8";

// globals.css: --color-border-light / --color-border-dark
const BORDER_LIGHT = "#e5e7eb";
const BORDER_DARK = "#2d3748";

// globals.css: --color-muted-light / slightly lighter surface in dark
// Used for input fields / form wells inside embedded components
const FORM_BG_LIGHT = "#f9fafb";
const FORM_BG_DARK = "#0f1923";

// globals.css: --color-primary (brand)
const PRIMARY = "#137fec";

/**
 * Detect the current theme preference from the OS/browser.
 * Returns "dark" or "light". Safe to call server-side (returns "light").
 */
function getInitialTheme() {
    if (typeof window === "undefined") return "light";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

function buildAppearance(theme) {
    const isDark = theme === "dark";
    return {
        variables: {
            // Brand
            colorPrimary: PRIMARY,

            // Surfaces
            colorBackground: isDark ? BG_DARK : BG_LIGHT,
            formBackgroundColor: isDark ? FORM_BG_DARK : FORM_BG_LIGHT,

            // Text
            colorText: isDark ? TEXT_DARK : TEXT_LIGHT,
            colorSecondaryText: isDark ? SECONDARY_DARK : SECONDARY_LIGHT,

            // Borders
            colorBorder: isDark ? BORDER_DARK : BORDER_LIGHT,

            // Feedback
            colorDanger: "#ef4444",

            // Typography — inherit app fonts, tune for density
            fontFamily: "inherit",
            fontSizeBase: "14px",

            // Headings (valid Stripe variables — drive H1/H2 sizes inside components)
            headingXlFontSize: "20px",
            headingXlFontWeight: "700",
            headingLgFontSize: "16px",
            headingLgFontWeight: "700",
            headingMdFontSize: "14px",
            headingMdFontWeight: "600",
            headingSmFontSize: "13px",
            headingSmFontWeight: "600",

            // Body
            bodyMdFontSize: "14px",
            bodyMdFontWeight: "400",
            bodySmFontSize: "13px",
            bodySmFontWeight: "400",

            // Labels
            labelMdFontSize: "13px",
            labelMdFontWeight: "500",
            labelSmFontSize: "12px",
            labelSmFontWeight: "500",

            // Buttons — match app button density
            buttonLabelFontSize: "14px",
            buttonLabelFontWeight: "600",

            // Radius — matches app rounded-xl
            borderRadius: "12px",

            // Spacing — app-level rhythm (globals uses Tailwind's 4px scale;
            // 6px gives Stripe components a slightly denser feel that matches
            // our card padding without feeling cramped)
            spacingUnit: "6px",
        },
    };
}

export default function StripeConnectProvider({ children }) {
    // Track theme in state so we can re-create the Stripe instance when it
    // changes. Initial value is computed synchronously to avoid a flash.
    const [theme, setTheme] = useState(getInitialTheme);

    // Subscribe to OS/browser theme changes. When the user toggles dark mode
    // at the OS level, we flip `theme` which triggers a new memo computation
    // below, which remounts all embedded components with fresh appearance.
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
             * fetchClientSecret — called by Stripe on mount and on session expiry.
             * Must return a raw client_secret string, not the full response.
             */
            fetchClientSecret: async () => {
                const res = await api.post("/payments/account-session");
                return res.data.data.clientSecret;
            },

            appearance: buildAppearance(theme),
        });
    }, [theme]);

    // Keying the provider by theme forces a full unmount/remount of the
    // embedded components when the theme changes. This is necessary because
    // Stripe captures appearance at init time and won't re-theme in place.
    return (
        <ConnectComponentsProvider
            key={theme}
            connectInstance={stripeConnectInstance}
        >
            {children}
        </ConnectComponentsProvider>
    );
}

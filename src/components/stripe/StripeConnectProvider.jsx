"use client";

import { useMemo } from "react";
import { loadConnectAndInitialize } from "@stripe/connect-js";
import { ConnectComponentsProvider } from "@stripe/react-connect-js";
import { api } from "@/lib/api";

/**
 * StripeConnectProvider
 *
 * Shared wrapper for all Stripe embedded components (account onboarding,
 * balances, payments, payouts). Must wrap any component that renders
 * a <Connect*> component from @stripe/react-connect-js.
 *
 * Architecture notes:
 * - loadConnectAndInitialize is called inside useMemo so the Stripe instance
 *   is created exactly once per mount, regardless of re-renders.
 * - fetchClientSecret is the only network boundary: it calls our backend
 *   which calls Stripe for a short-lived Account Session client_secret.
 *   Stripe automatically re-invokes fetchClientSecret when a session expires
 *   (~60 min) — we never cache it ourselves.
 * - Appearance variables mirror the app's design system (globals.css @theme).
 *   Dark mode is detected at init time via the html element's class list.
 *   Because Stripe initialises once, a full page reload is required to switch
 *   themes — this is standard behaviour for Connect embedded components.
 * - onLoadError is NOT handled here — ConnectComponentsProvider does not
 *   support it. Pass onLoadError directly to each <Connect*> component
 *   (ConnectBalances, ConnectPayments, ConnectAccountOnboarding, etc.).
 *   Each component accepts it as a prop via CommonComponentProps.
 *
 * @param {ReactNode} children - One or more <Connect*> components
 */
export default function StripeConnectProvider({ children }) {
    const stripeConnectInstance = useMemo(() => {
        // Detect dark mode at init time by reading the class on <html>.
        // Stripe does not dynamically respond to theme changes — a remount
        // (e.g. full page reload) is required to switch themes. This is by design.
        const isDark =
            typeof document !== "undefined" &&
            document.documentElement.classList.contains("dark");

        return loadConnectAndInitialize({
            publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,

            /**
             * fetchClientSecret — called by Stripe on mount and on session expiry.
             * Must return a raw client_secret string, not the full response object.
             * Errors thrown here are surfaced inside the embedded component UI by Stripe.
             */
            fetchClientSecret: async () => {
                const res = await api.post("/payments/account-session");
                return res.data.data.clientSecret;
            },

            appearance: {
                // Overlay: match the card background so components blend in
                overlayZIndex: 1000,
                variables: {
                    // Brand color from globals.css: --color-primary: #137fec
                    colorPrimary: "#137fec",

                    // Typography: inherit the app's font stack
                    fontFamily: "inherit",
                    fontSizeBase: "14px",
                    fontWeightNormal: "500",
                    fontWeightBold: "700",

                    // Border radius matching rounded-xl (app standard)
                    borderRadius: "12px",
                    buttonBorderRadius: "8px",
                    badgeBorderRadius: "6px",

                    // Spacing
                    spacingUnit: "10px",

                    // Light / dark surface colours
                    // These values must match the CSS custom properties in globals.css
                    colorBackground: isDark ? "#0f1923" : "#ffffff",
                    colorText: isDark ? "#f1f5f9" : "#0f172a",
                    colorTextSecondary: isDark ? "#94a3b8" : "#64748b",
                    colorBorder: isDark ? "#1e2d3d" : "#e2e8f0",

                    // Component surface (cards inside the embedded UI)
                    colorComponentBackground: isDark ? "#162232" : "#f8fafc",

                    // Action colours
                    colorDanger: "#ef4444",
                    colorSuccess: "#10b981",

                    // Button text is always white regardless of theme
                    buttonPrimaryColorText: "#ffffff",
                },
            },
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // intentionally empty — instance must be stable across re-renders

    return (
        <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
            {children}
        </ConnectComponentsProvider>
    );
}

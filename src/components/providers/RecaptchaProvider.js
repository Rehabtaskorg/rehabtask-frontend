"use client";

import { useEffect } from "react";

/**
 * Loads the reCAPTCHA v3 script and makes `window.grecaptcha` available.
 * Mount this only on pages that need reCAPTCHA — currently the auth layout.
 * The badge will only appear while this provider is mounted.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export default function RecaptchaProvider({ children }) {
    useEffect(() => {
        const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

        if (!siteKey) return;
        if (document.querySelector('script[src*="recaptcha"]')) return;

        const script = document.createElement("script");
        script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        return () => {
            const existingScript = document.querySelector('script[src*="recaptcha"]');
            if (existingScript) existingScript.remove();
        };
    }, []);

    return <>{children}</>;
}

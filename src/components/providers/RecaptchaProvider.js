"use client";

import { useEffect } from "react";

export default function RecaptchaProvider({ children }) {
    useEffect(() => {
        const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

        if (!siteKey) {
            console.warn("⚠️  NEXT_PUBLIC_RECAPTCHA_SITE_KEY not configured");
            return;
        }

        // Check if script is already loaded
        if (document.querySelector(`script[src*="recaptcha"]`)) {
            return;
        }

        // Load reCAPTCHA script
        const script = document.createElement("script");
        script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            console.log("reCAPTCHA loaded successfully");
        }

        script.onerror = () => {
            console.error("Failed to load reCAPTCHA script");
        }

        document.body.appendChild(script);

        return () => {
            // Cleanup: Remove script when component unmounts
            const existingScript = document.querySelector(`script[src*="recaptcha"]`);
            if (existingScript) {
                existingScript.remove();
            }
        };
    }, []);

    return <>{children}</>;
}
const SCRIPT_ID = "recaptcha-enterprise";

let scriptPromise = null;

const loadScript = (siteKey) => {
    if (window.grecaptcha?.enterprise) return Promise.resolve();

    if (!scriptPromise) {
        scriptPromise = new Promise((resolve, reject) => {
            const existing = document.getElementById(SCRIPT_ID);
            const script = existing ?? document.createElement("script");

            script.addEventListener("load", resolve, { once: true });
            script.addEventListener("error", reject, { once: true });

            if (!existing) {
                script.id = SCRIPT_ID;
                script.src = `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`;
                script.async = true;
                script.defer = true;
                document.body.appendChild(script);
            }
        }).catch((error) => {
            scriptPromise = null;
            throw error;
        });
    }

    return scriptPromise;
};

export const getRecaptchaToken = async (action) => {
    if (typeof window === "undefined") return null;

    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) return null;

    try {
        await loadScript(siteKey);
        await new Promise((resolve) => window.grecaptcha.enterprise.ready(resolve));
        return await window.grecaptcha.enterprise.execute(siteKey, { action });
    } catch {
        return null;
    }
};

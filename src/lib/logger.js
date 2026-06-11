const isDev = process.env.NODE_ENV !== "production";

/**
 * Dev-only logging wrapper around console. No-ops in production.
 */
export const logger = {
    log: (...args) => { if (isDev) console.log(...args); },
    warn: (...args) => { if (isDev) console.warn(...args); },
    error: (...args) => { if (isDev) console.error(...args); },
};

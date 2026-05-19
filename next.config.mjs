/** @type {import('next').NextConfig} */

const SELF = "'self'";
const NONE = "'none'";
const UNSAFE_INLINE = "'unsafe-inline'";

// External domains used by the app — keep in sync with actual integrations.
const SUPABASE = "https://*.supabase.co";
const STRIPE_JS = "https://js.stripe.com https://connect-js.stripe.com";
const STRIPE_API = "https://*.stripe.com";
const STRIPE_NETWORK = "https://*.stripe.network";
const GOOGLE_RECAPTCHA = "https://www.google.com";
const GOOGLE_GSTATIC = "https://www.gstatic.com";
const GOOGLE_MAPS = "https://maps.googleapis.com https://maps.gstatic.com https://*.googleapis.com";
const UNSPLASH = "https://images.unsplash.com";
const COUNTRY_FLAGS = "https://purecatamphetamine.github.io";

const securityHeaders = [
    // Force HTTPS for 2 years; include subdomains; allow preload submission.
    {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
    },
    // Prevent MIME-type sniffing.
    {
        key: "X-Content-Type-Options",
        value: "nosniff",
    },
    // Block the app from being embedded in iframes on other origins.
    {
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
    },
    // Limit referrer information sent to third parties.
    {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
    },
    // Disable browser features not used by the app.
    {
        key: "Permissions-Policy",
        value: [
            "camera=()",
            "microphone=()",
            "geolocation=(self)",
            "payment=(self)",
            "usb=()",
            "bluetooth=()",
        ].join(", "),
    },
    // Content Security Policy.
    // — script-src: self + Stripe JS + Google reCAPTCHA/Maps + unsafe-inline
    //   for Next.js inline scripts. unsafe-eval excluded — test for breakage.
    // — connect-src: self (API proxy) + Supabase (auth/storage) + Stripe + Maps.
    // — frame-src: Stripe Connect embedded components render in iframes.
    // — img-src: self + Supabase storage + Unsplash + Google Maps static tiles
    //   + data URIs (inline SVGs / base64 images used throughout the app).
    {
        key: "Content-Security-Policy-Report-Only",
        value: [
            `default-src ${SELF}`,
            `script-src ${SELF} ${UNSAFE_INLINE} ${STRIPE_JS} ${STRIPE_API} ${STRIPE_NETWORK} ${GOOGLE_RECAPTCHA} ${GOOGLE_GSTATIC} ${GOOGLE_MAPS}`,
            `style-src ${SELF} ${UNSAFE_INLINE} ${STRIPE_API} ${STRIPE_NETWORK} ${GOOGLE_GSTATIC}`,
            `img-src ${SELF} data: blob: ${SUPABASE} ${STRIPE_API} ${STRIPE_NETWORK} ${UNSPLASH} ${GOOGLE_MAPS} ${GOOGLE_GSTATIC} ${COUNTRY_FLAGS}`,
            `font-src ${SELF} ${STRIPE_API} ${STRIPE_NETWORK} ${GOOGLE_GSTATIC}`,
            `connect-src ${SELF} ${SUPABASE} ${STRIPE_API} ${STRIPE_NETWORK} ${STRIPE_JS} ${GOOGLE_MAPS} ${GOOGLE_RECAPTCHA} https://*.rehabtask.com wss://*.rehabtask.com`,
            `frame-src ${SELF} ${STRIPE_JS} ${STRIPE_API} ${STRIPE_NETWORK} ${GOOGLE_RECAPTCHA}`,
            `worker-src blob:`,
            `object-src ${NONE}`,
            `base-uri ${SELF}`,
            `form-action ${SELF}`,
        ].join("; "),
    },
];

const nextConfig = {
    output: "standalone",
    reactCompiler: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "xtailsgtkrmwezdiymmw.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
        ],
    },
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: securityHeaders,
            },
        ];
    },
    async rewrites() {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        return [
            {
                source: "/api/:path*",
                destination: `${backendUrl}/:path*`,
            },
        ];
    },
};

export default nextConfig;
/** @type {import('next').NextConfig} */

const SELF = "'self'";
const NONE = "'none'";
const UNSAFE_INLINE = "'unsafe-inline'";
const UNSAFE_EVAL = "'unsafe-eval'";

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
    // TODO: Re-enable CSP before production launch. Commented out during pre-launch
    // testing to unblock debugging of Stripe, Google Maps, and other integrations.
    // All other security headers above remain active.
    // {
    //     key: "Content-Security-Policy",
    //     value: [
    //         `default-src ${SELF}`,
    //         `script-src ${SELF} ${UNSAFE_INLINE} ${UNSAFE_EVAL} ${STRIPE_JS} ${STRIPE_API} ${STRIPE_NETWORK} ${GOOGLE_RECAPTCHA} ${GOOGLE_GSTATIC} ${GOOGLE_MAPS}`,
    //         `style-src ${SELF} ${UNSAFE_INLINE} ${STRIPE_API} ${STRIPE_NETWORK} ${GOOGLE_GSTATIC}`,
    //         `style-src-attr ${UNSAFE_INLINE}`,
    //         `img-src ${SELF} data: blob: ${SUPABASE} ${STRIPE_API} ${STRIPE_NETWORK} ${UNSPLASH} ${GOOGLE_MAPS} ${GOOGLE_GSTATIC} ${COUNTRY_FLAGS}`,
    //         `font-src ${SELF} ${STRIPE_API} ${STRIPE_NETWORK} ${GOOGLE_GSTATIC}`,
    //         `connect-src ${SELF} data: ${SUPABASE} ${STRIPE_API} ${STRIPE_NETWORK} ${STRIPE_JS} ${GOOGLE_MAPS} ${GOOGLE_GSTATIC} ${GOOGLE_RECAPTCHA} https://*.rehabtask.com wss://*.rehabtask.com`,
    //         `frame-src ${SELF} ${STRIPE_JS} ${STRIPE_API} ${STRIPE_NETWORK} ${GOOGLE_RECAPTCHA}`,
    //         `worker-src blob: data:`,
    //         `object-src ${NONE}`,
    //         `base-uri ${SELF}`,
    //         `form-action ${SELF}`,
    //     ].join("; "),
    // },
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
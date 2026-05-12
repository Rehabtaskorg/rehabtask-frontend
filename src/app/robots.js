const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rehabtask.com";

export default function robots() {
    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/therapists", "/requests"],
                disallow: [
                    "/api/",
                    "/login",
                    "/register/",
                    "/forgot-password",
                    "/reset-password",
                    "/verify-email",
                    "/verify-callback",
                    "/oauth/",
                    "/customer/",
                    "/therapist/",
                    "/admin/",
                    "/invite/",
                ],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}

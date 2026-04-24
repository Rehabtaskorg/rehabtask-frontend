import RecaptchaProvider from "@/components/providers/RecaptchaProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import ToastProvider from "@/components/providers/ToastProvider";
import { montserrat } from "@/lib/fonts";
import "./globals.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rehabtask.com";

export const metadata = {
  title: {
    template: "%s | RehabTask",
    default: "RehabTask — Find Licensed Rehabilitation Therapists",
  },
  description: "Connect with verified Physical Therapists, Occupational Therapists, and Speech-Language Pathologists for home health rehabilitation services.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "RehabTask",
    title: "RehabTask — Find Licensed Rehabilitation Therapists",
    description: "Connect with verified PTs, OTs, and SLPs for home health rehabilitation services. Browse therapists, compare rates, and book sessions online.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "RehabTask — Find Licensed Rehabilitation Therapists",
    description: "Connect with verified PTs, OTs, and SLPs for home health rehabilitation services.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "RehabTask",
  url: SITE_URL,
  description: "Digital platform connecting home health agencies with licensed rehabilitation therapists for Physical Therapy, Occupational Therapy, and Speech-Language Pathology services.",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    availableLanguage: "English",
  },
  sameAs: [],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={montserrat.className}>
        <PostHogProvider>
          <QueryProvider>
            <RecaptchaProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </RecaptchaProvider>
          </QueryProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}

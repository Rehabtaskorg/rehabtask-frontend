import RecaptchaProvider from "@/components/providers/RecaptchaProvider";

/**
 * Layout for all authentication pages.
 * Loads the reCAPTCHA script only here — it is not needed outside of auth flows.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export default function AuthLayout({ children }) {
    return (
        <RecaptchaProvider>
            <div className="min-h-screen bg-gray-50">
                {children}
            </div>
        </RecaptchaProvider>
    );
}

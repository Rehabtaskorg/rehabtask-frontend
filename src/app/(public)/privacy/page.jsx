import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata = {
    title: "Privacy Policy | RehabTask",
    description: "How RehabTask collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
    const lastUpdated = "July 11, 2025";

    return (
        <>
            <Navbar />
            <main className="max-w-3xl mx-auto px-4 py-16 text-gray-800">
                <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
                <p className="text-sm text-gray-500 mb-10">Last updated: {lastUpdated}</p>

                <section className="space-y-8 text-sm leading-7">
                    <div>
                        <h2 className="text-lg font-semibold mb-2">1. Who We Are</h2>
                        <p>
                            RehabTask (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is a digital marketplace that
                            connects Home Health Agencies and individual patients with licensed rehabilitation
                            therapists.
                        </p>
                        <p className="mt-2">
                            If you have questions about this policy, contact us at{" "}
                            <a href="mailto:support@rehabtask.com" className="text-primary underline">
                                contact@rehabtask.com
                            </a>
                            .
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">2. Information We Collect</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>
                                <strong>Account information</strong> — name, email address, phone number, and role
                                (customer or therapist) when you register.
                            </li>
                            <li>
                                <strong>Professional information</strong> (therapists only) — license documents,
                                credentials, service areas, and professional biography.
                            </li>
                            <li>
                                <strong>Payment information</strong> — processed securely by Stripe. We do not store
                                card numbers on our servers.
                            </li>
                            <li>
                                <strong>Usage data</strong> — pages visited, features used, and session duration to
                                improve platform performance.
                            </li>
                            <li>
                                <strong>Communications</strong> — messages sent between customers and therapists
                                through the platform messaging system.
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">3. How We Use Your Information</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>To create and manage your account.</li>
                            <li>To facilitate bookings, payments, and communications between users.</li>
                            <li>To verify therapist credentials and maintain platform safety.</li>
                            <li>To send transactional emails (booking confirmations, verification links, receipts).</li>
                            <li>To improve our services through anonymised analytics.</li>
                            <li>To comply with legal obligations.</li>
                        </ul>
                        <p className="mt-2">We do not sell your personal information to third parties.</p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">4. Information Sharing</h2>
                        <p>We share your information only with:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li>
                                <strong>Other users</strong> — therapist profiles are visible to customers for the
                                purpose of booking. Customers&apos; contact details are shared with a therapist only
                                after a booking is confirmed.
                            </li>
                            <li>
                                <strong>Service providers</strong> — Stripe (payments), Google Firebase (authentication
                                and storage), Resend (transactional email), and Google Cloud (hosting). Each is bound
                                by their own privacy policies and data processing agreements.
                            </li>
                            <li>
                                <strong>Legal authorities</strong> — when required by law or to protect the rights and
                                safety of our users.
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">5. Data Retention</h2>
                        <p>
                            We retain your account data for as long as your account is active. If you close your
                            account, we will delete or anonymise your personal information within 90 days, unless we
                            are required to retain it for legal or financial record-keeping purposes.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">6. Your Rights</h2>
                        <p>Depending on your location, you may have the right to:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li>Access the personal data we hold about you.</li>
                            <li>Correct inaccurate data.</li>
                            <li>Request deletion of your data (subject to legal retention requirements).</li>
                            <li>Withdraw consent for optional data processing at any time.</li>
                        </ul>
                        <p className="mt-2">
                            To exercise these rights, email{" "}
                            <a href="mailto:support@rehabtask.com" className="text-primary underline">
                                support@rehabtask.com
                            </a>
                            .
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">7. Cookies</h2>
                        <p>
                            We use strictly necessary cookies to keep you logged in and maintain your session. We do
                            not use advertising cookies or third-party tracking cookies beyond anonymised product
                            analytics.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">8. Security</h2>
                        <p>
                            We use industry-standard security measures including HTTPS encryption, httpOnly cookies,
                            and access controls. No method of transmission over the internet is 100% secure; we
                            cannot guarantee absolute security but take commercially reasonable steps to protect your
                            data.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">9. Children</h2>
                        <p>
                            RehabTask is not intended for use by anyone under 18. We do not knowingly collect
                            personal information from minors.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">10. Changes to This Policy</h2>
                        <p>
                            We may update this policy from time to time. We will notify you of material changes by
                            email or a prominent notice on the platform. Continued use of RehabTask after changes
                            become effective constitutes acceptance of the updated policy.
                        </p>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                        <p>
                            Questions?{" "}
                            <a href="mailto:support@rehabtask.com" className="text-primary underline">
                                contact@rehabtask.com
                            </a>
                            {" · "}
                            <Link href="/terms" className="text-primary underline">
                                Terms of Service
                            </Link>
                        </p>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
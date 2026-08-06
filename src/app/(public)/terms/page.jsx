import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata = {
    title: "Terms of Service | RehabTask",
    description: "The terms governing your use of the RehabTask platform.",
};

export default function TermsOfServicePage() {
    const lastUpdated = "July 11, 2025";

    return (
        <>
            <Navbar />
            <main className="max-w-3xl mx-auto px-4 py-16 text-gray-800">
                <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
                <p className="text-sm text-gray-500 mb-10">Last updated: {lastUpdated}</p>

                <section className="space-y-8 text-sm leading-7">
                    <div>
                        <h2 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h2>
                        <p>
                            By creating an account or using RehabTask (&quot;Platform&quot;), you agree to be bound by
                            these Terms of Service (&quot;Terms&quot;). If you do not agree, do not use the Platform.
                            These Terms form a binding agreement between you and RehabTask
                            (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;).
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">2. Description of Service</h2>
                        <p>
                            RehabTask is an online marketplace that connects Home Health Agencies and individual
                            patients (&quot;Customers&quot;) with licensed rehabilitation therapists
                            (&quot;Therapists&quot;). We facilitate discovery, booking, communication, and payment —
                            we are not a healthcare provider and do not employ therapists.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">3. Eligibility</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>You must be at least 18 years old to use the Platform.</li>
                            <li>
                                Therapists must hold a valid, current licence in their stated discipline and
                                jurisdiction. You are solely responsible for maintaining your licensure.
                            </li>
                            <li>
                                By registering, you represent that all information you provide is accurate and
                                complete.
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">4. Accounts</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>You are responsible for maintaining the security of your account credentials.</li>
                            <li>You must notify us immediately at support@rehabtask.com of any unauthorised use.</li>
                            <li>
                                We reserve the right to suspend or terminate accounts that violate these Terms or
                                engage in fraudulent, harmful, or illegal activity.
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">5. Bookings and Payments</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>
                                Payments are processed by Stripe. By making a payment you agree to Stripe&apos;s
                                terms of service.
                            </li>
                            <li>
                                Funds are held in escrow until the Customer confirms service completion (or 3 days
                                after the session end date, whichever comes first), after which they are released to
                                the Therapist minus the applicable platform commission.
                            </li>
                            <li>
                                Commission rates vary by Therapist subscription tier (Basic 20%, Pro 12%, Elite 7%).
                            </li>
                            <li>
                                Disputes must be raised within 3 days of session completion. We will mediate in good
                                faith but our decision is final.
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">6. Subscriptions</h2>
                        <p>
                            RehabTask offers optional paid subscription plans for both Customers and Therapists.
                            Subscriptions renew automatically unless cancelled before the renewal date. You may
                            cancel at any time from your account settings; cancellation takes effect at the end of
                            the current billing period.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">7. Prohibited Conduct</h2>
                        <p>You agree not to:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li>Misrepresent your identity, qualifications, or licensure status.</li>
                            <li>Use the Platform for any unlawful purpose.</li>
                            <li>
                                Circumvent the Platform to conduct bookings or payments directly to avoid commissions.
                            </li>
                            <li>Upload harmful, offensive, or misleading content.</li>
                            <li>
                                Attempt to access, tamper with, or disrupt the Platform&apos;s infrastructure or
                                other users&apos; accounts.
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">8. Therapist Independence</h2>
                        <p>
                            Therapists on RehabTask are independent professionals, not employees or agents of
                            RehabTask. We do not supervise, direct, or control the clinical services
                            provided. The Company is not liable for the quality, safety, or outcome of any therapy
                            session arranged through the Platform.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">9. Intellectual Property</h2>
                        <p>
                            All Platform content, design, and code are owned by RehabTask or its
                            licensors. You may not reproduce, distribute, or create derivative works without our
                            prior written consent. You retain ownership of content you upload (profile information,
                            messages) and grant us a limited licence to display and transmit it as necessary to
                            operate the Platform.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">10. Disclaimer of Warranties</h2>
                        <p>
                            The Platform is provided &quot;as is&quot; without warranties of any kind, express or
                            implied. We do not warrant that the Platform will be uninterrupted, error-free, or free
                            of harmful components.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">11. Limitation of Liability</h2>
                        <p>
                            To the maximum extent permitted by law, RehabTask shall not be liable for any
                            indirect, incidental, special, consequential, or punitive damages arising from your use
                            of the Platform. Our total liability to you for any claim shall not exceed the amount you
                            paid to us in the 12 months preceding the claim.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">12. Governing Law</h2>
                        <p>
                            These Terms are governed by the laws of the State of Delaware, United States, without
                            regard to conflict of law principles. Any disputes shall be resolved by binding
                            arbitration in accordance with the American Arbitration Association rules.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">13. Changes to Terms</h2>
                        <p>
                            We may update these Terms at any time. We will notify you of material changes by email
                            or a prominent notice on the Platform. Continued use after the effective date constitutes
                            acceptance of the updated Terms.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">14. Contact</h2>
                        <p>
                            RehabTask
                            <br />
                            Email:{" "}
                            <a href="mailto:support@rehabtask.com" className="text-primary underline">
                                contact@rehabtask.com
                            </a>
                        </p>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                        <p>
                            <Link href="/privacy" className="text-primary underline">
                                Privacy Policy
                            </Link>
                            {" · "}
                            Questions?{" "}
                            <a href="mailto:support@rehabtask.com" className="text-primary underline">
                                contact@rehabtask.com
                            </a>
                        </p>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
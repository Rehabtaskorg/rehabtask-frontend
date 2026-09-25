import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";

/**
 * Final call-to-action section for the therapist landing page.
 */
export function TherapistFinalCTA() {
    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <FadeIn>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                        Ready to Grow Your Practice?
                    </h2>
                    <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                        Join RehabTask to connect with Home Health Agencies, receive qualified patient referrals, and manage your work from one platform.
                    </p>

                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <Link
                            href="/requests"
                            className="px-7 py-3.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Browse Referrals
                        </Link>
                        <Link
                            href="/register/therapist"
                            className="px-7 py-3.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Create Free Therapist Account
                        </Link>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}
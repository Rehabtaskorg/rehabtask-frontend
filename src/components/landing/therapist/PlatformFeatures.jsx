import FadeIn from "@/components/ui/FadeIn";
import { MdCheckCircle, MdAutoAwesome } from "react-icons/md";

const FEATURES = [
    { label: "Professional Therapist Profile", comingSoon: false },
    { label: "Referral Marketplace", comingSoon: false },
    { label: "Secure Messaging", comingSoon: false },
    { label: "Availability Management", comingSoon: false },
    { label: "Booking Management", comingSoon: false },
    { label: "Visit Scheduling", comingSoon: false },
    { label: "Calendar", comingSoon: false },
    { label: "Earnings Dashboard", comingSoon: false },
    { label: "Stripe Payouts", comingSoon: false },
    { label: "Mobile-Friendly Platform", comingSoon: false },
    { label: "AI Therapist Matching", comingSoon: true },
];

/**
 * Platform features list for the therapist landing page.
 * The AI Therapist Matching entry is flagged as coming soon.
 */
export function PlatformFeatures() {
    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <FadeIn>
                        <h2 className="mt-2 text-3xl md:text-4xl font-bold leading-tight" style={{ color: "#2EC4B6" }}>
                            Everything You Need to Run Your Practice
                        </h2>
                        <p className="mt-4 text-gray-500 leading-relaxed">
                            From finding your next referral to getting paid, RehabTask gives you a complete toolkit — built specifically for home health therapists.
                        </p>
                    </FadeIn>

                    <FadeIn delay={0.15}>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {FEATURES.map((feature) => (
                                <li key={feature.label} className="flex items-center gap-3">
                                    {feature.comingSoon ? (
                                        <MdAutoAwesome className="text-amber-500 shrink-0 text-lg" />
                                    ) : (
                                        <MdCheckCircle className="text-primary shrink-0 text-lg" />
                                    )}
                                    <span className="text-sm text-gray-700 font-medium">
                                        {feature.label}
                                        {feature.comingSoon && (
                                            <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                                Coming Soon
                                            </span>
                                        )}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
}
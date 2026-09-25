import FadeIn from "@/components/ui/FadeIn";
import { MdGroups, MdCalendarToday, MdPayments, MdStarRate, MdPublic, MdDashboard } from "react-icons/md";

const BENEFITS = [
    {
        icon: MdGroups,
        title: "More Referral Opportunities",
        description: "Access patient referrals from Home Health Agencies across the country.",
    },
    {
        icon: MdCalendarToday,
        title: "Flexible Schedule",
        description: "Accept only the referrals that fit your availability.",
    },
    {
        icon: MdPayments,
        title: "Secure Payments",
        description: "Receive reliable payouts directly through RehabTask.",
    },
    {
        icon: MdStarRate,
        title: "Grow Your Reputation",
        description: "Build your professional profile through completed visits and reviews.",
    },
    {
        icon: MdPublic,
        title: "Nationwide Opportunities",
        description: "Expand beyond your local network.",
    },
    {
        icon: MdDashboard,
        title: "Everything in One Place",
        description: "Manage referrals, messaging, scheduling, bookings, and payments from one platform.",
    },
];

/**
 * Six therapist-focused benefit cards for the therapist landing page.
 */
export function TherapistBenefits() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <FadeIn className="text-center mb-14">
                    <h2 className="mt-2 text-3xl md:text-4xl font-bold text-primary">
                        Why Therapists Choose RehabTask
                    </h2>
                    <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
                        Built for licensed therapists who want more flexibility, more patients, and a simpler way to manage their practice.
                    </p>
                </FadeIn>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {BENEFITS.map((benefit, i) => (
                        <FadeIn
                            key={benefit.title}
                            delay={i * 0.08}
                            hover
                            className="bg-gray-50 border border-gray-200 rounded-xl p-6"
                        >
                            <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                <benefit.icon className="text-xl text-primary" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 mb-2">{benefit.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{benefit.description}</p>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}
import FadeIn from "@/components/ui/FadeIn";
import { MdCalendarToday, MdAttachMoney, MdBusinessCenter, MdHome } from "react-icons/md";

const CARDS = [
    {
        icon: MdCalendarToday,
        title: "Fill gaps in your schedule",
        description: "Find opportunities that fit your open hours.",
        iconBg: "bg-teal-50",
        iconColor: "text-teal-600",
        accentColor: "bg-teal-500",
    },
    {
        icon: MdAttachMoney,
        title: "Earn on the side",
        description: "Add extra work without another fixed schedule.",
        iconBg: "bg-orange-50",
        iconColor: "text-orange-500",
        accentColor: "bg-orange-500",
    },
    {
        icon: MdBusinessCenter,
        title: "Build your own caseload",
        description: "Choose opportunities that fit how you want to work.",
        iconBg: "bg-purple-50",
        iconColor: "text-purple-600",
        accentColor: "bg-purple-500",
    },
    {
        icon: MdHome,
        title: "Explore home health",
        description: "Discover home health opportunities in your area.",
        iconBg: "bg-blue-50",
        iconColor: "text-blue-500",
        accentColor: "bg-blue-500",
    },
];

/**
 * "Work on Your Terms" section — left headline block + 2×2 grid of benefit cards.
 * Positioned immediately after the hero on the therapist landing page.
 */
export function WorkOnYourTerms() {
    return (
        <section className="py-20 md:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 xl:gap-16 items-center">
                    <FadeIn>
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-accent-strong mb-3">
                            Work on your terms
                        </p>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-primary leading-tight tracking-tight">
                            More flexibility shouldn&apos;t mean more chasing.
                        </h2>
                        <p className="mt-4 text-base text-gray-500 leading-relaxed max-w-md">
                            Tell us when and where you want to work. We&apos;ll surface opportunities that fit your schedule.
                        </p>
                    </FadeIn>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {CARDS.map((card, i) => (
                            <FadeIn
                                key={card.title}
                                delay={i * 0.08}
                                hover
                                className="bg-white border border-border-light rounded-2xl p-6 hover:shadow-lg transition-all duration-200"
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${card.iconBg}`}>
                                    <card.icon className={`text-xl ${card.iconColor}`} />
                                </div>
                                <h3 className="text-base font-bold text-primary mb-2">{card.title}</h3>
                                <span className={`block h-0.5 w-10 rounded-full mb-3 ${card.accentColor}`} aria-hidden="true" />
                                <p className="text-sm text-gray-500 leading-relaxed">{card.description}</p>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
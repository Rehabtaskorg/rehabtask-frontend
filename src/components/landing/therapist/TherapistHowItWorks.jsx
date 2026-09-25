import FadeIn from "@/components/ui/FadeIn";
import { MdPersonSearch, MdSend, MdEventAvailable, MdCheckCircle, MdAccountBalanceWallet } from "react-icons/md";

const STEPS = [
    {
        icon: MdPersonSearch,
        title: "Get Matched",
        description: "We match you with opportunities that fit your availability.",
    },
    {
        icon: MdSend,
        title: "Send an Offer",
        description: "Submit your rate and express interest.",
    },
    {
        icon: MdEventAvailable,
        title: "Get Booked",
        description: "Once accepted, it moves to your bookings.",
    },
    {
        icon: MdCheckCircle,
        title: "Complete Sessions",
        description: "Complete your visit and mark it done.",
    },
    {
        icon: MdAccountBalanceWallet,
        title: "Get Paid",
        description: "Track your earnings and get paid on time.",
    },
];

/**
 * Therapist-specific 5-step "How RehabTask Works" flow.
 * Uses <ol>/<li> so step sequence is conveyed semantically, not just visually.
 * Dashed connectors are decorative only and hidden below lg breakpoint.
 *
 * Named TherapistHowItWorks to avoid collision with the shared HowItWorks component.
 */
export function TherapistHowItWorks() {
    return (
        <section className="py-20 md:py-24 bg-background-light">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <FadeIn className="text-center mb-16">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-accent-strong mb-3">
                        How RehabTask works
                    </p>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-primary leading-tight tracking-tight">
                        From available time to booked work.
                    </h2>
                </FadeIn>

                <FadeIn delay={0.1}>
                    <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-4">
                        {STEPS.map((step, i) => (
                            <li key={step.title} className="relative flex flex-col items-center text-center">
                                {i < STEPS.length - 1 && (
                                    <span
                                        aria-hidden="true"
                                        className="hidden lg:block absolute top-[2.75rem] left-[calc(50%+2.75rem)] w-[calc(100%-5.5rem)] border-t-2 border-dashed border-accent/40"
                                    />
                                )}

                                <div className="relative mb-4">
                                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold text-primary z-10">
                                        {i + 1}
                                    </span>
                                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                                        <step.icon className="text-3xl text-accent-strong" />
                                    </div>
                                </div>

                                <h3 className="text-sm font-bold text-primary mb-1">{step.title}</h3>
                                <p className="text-xs text-gray-500 leading-relaxed max-w-[140px]">{step.description}</p>
                            </li>
                        ))}
                    </ol>
                </FadeIn>

                <FadeIn delay={0.2} className="text-center mt-14">
                    <p className="text-sm font-semibold text-accent-strong flex items-center justify-center gap-2">
                        <span aria-hidden="true">♡</span>
                        More control. More flexibility. More work that fits.
                    </p>
                </FadeIn>
            </div>
        </section>
    );
}
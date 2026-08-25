import FadeIn from "@/components/ui/FadeIn";
import { MdAccessTime, MdLocationOn, MdAttachMoney, MdFactCheck, MdThumbUp } from "react-icons/md";

const ITEMS = [
    {
        icon: MdAccessTime,
        title: "Set your availability",
        description: "Choose when you want to work.",
    },
    {
        icon: MdLocationOn,
        title: "Choose where you work",
        description: "Set your preferred coverage area.",
    },
    {
        icon: MdAttachMoney,
        title: "Set your rates",
        description: "Submit rates that work for you.",
    },
    {
        icon: MdFactCheck,
        title: "Review before accepting",
        description: "See key case details upfront.",
    },
    {
        icon: MdThumbUp,
        title: "Decide what you accept",
        description: "Decline opportunities without penalty.",
    },
];

/**
 * "Your Control. Your Choice." section — centered headline with 5 autonomy pillars.
 * Uses semantic <ul>/<li> since this is a list of guarantees, not a sequence.
 */
export function YourControlYourChoice() {
    return (
        <section className="py-20 md:py-24 bg-background-light">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <FadeIn className="text-center mb-14">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-accent-strong mb-3">
                        Your control. Your choice.
                    </p>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-primary leading-tight tracking-tight">
                        Your schedule. Your rates. Your choice.
                    </h2>
                </FadeIn>

                <FadeIn delay={0.1}>
                    <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-8 xl:gap-0 xl:divide-x xl:divide-border-light">
                        {ITEMS.map((item, i) => (
                            <li key={item.title} className="flex flex-col items-center text-center xl:px-6">
                                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                                    <item.icon className="text-2xl text-accent-strong" />
                                </div>
                                <h3 className="text-sm font-bold text-primary mb-1">{item.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                            </li>
                        ))}
                    </ul>
                </FadeIn>

                <FadeIn delay={0.2} className="text-center mt-12">
                    <p className="text-lg font-bold text-accent-strong">
                        You decide what fits. RehabTask helps you find it.
                    </p>
                </FadeIn>
            </div>
        </section>
    );
}
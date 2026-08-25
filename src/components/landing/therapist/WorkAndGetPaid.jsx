import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import { MdShowChart, MdShield, MdAccountBalanceWallet, MdPayments } from "react-icons/md";

const FEATURES = [
    { icon: MdShowChart, label: "Track your earnings" },
    { icon: MdShield, label: "Secure payments" },
    { icon: MdAccountBalanceWallet, label: "See available payout" },
];

/**
 * "Work today. Get paid." feature section — earnings & payout highlight.
 * Part of the 3-part platform highlights sequence on the therapist landing page.
 * Right-to-left layout alternates visually with StayInSync.
 */
export function WorkAndGetPaid() {
    return (
        <section className="py-20 md:py-24 bg-background-light">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-center">

                    <FadeIn delay={0.1} className="order-2 lg:order-1 bg-white rounded-2xl border border-border-light p-6 shadow-sm">
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: "Net Earnings", value: "$432.00", sub: "+ $96.00 this month", icon: MdShowChart, iconBg: "bg-accent/10", iconColor: "text-accent-strong" },
                                { label: "Payouts", value: "$324.50", sub: "2 payouts this month", icon: MdPayments, iconBg: "bg-orange-50", iconColor: "text-orange-500" },
                                { label: "Next Payout", value: "$107.50", sub: "June 22", icon: MdAccountBalanceWallet, iconBg: "bg-blue-50", iconColor: "text-blue-500" },
                            ].map((stat) => (
                                <div key={stat.label} className="bg-background-light rounded-xl p-3 text-center border border-border-light">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${stat.iconBg}`}>
                                        <stat.icon className={`text-base ${stat.iconColor}`} />
                                    </div>
                                    <p className="text-[10px] text-gray-500 mb-1">{stat.label}</p>
                                    <p className="text-sm font-bold text-primary">{stat.value}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{stat.sub}</p>
                                </div>
                            ))}
                        </div>
                    </FadeIn>

                    <FadeIn className="order-1 lg:order-2">
                        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-5">
                            <MdPayments className="text-2xl text-accent-strong" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-accent-strong mb-3">
                            From work to payout
                        </p>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-primary leading-tight tracking-tight">
                            Work today. Get paid.
                        </h2>
                        <ul className="mt-6 space-y-3">
                            {FEATURES.map((f) => (
                                <li key={f.label} className="flex items-center gap-3 text-sm text-gray-700">
                                    <f.icon className="text-accent-strong shrink-0 text-xl" />
                                    {f.label}
                                </li>
                            ))}
                        </ul>
                        <Link
                            href="/register/therapist"
                            className="group inline-flex items-center gap-2 mt-8 px-6 py-3 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            View Earnings
                            <span className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true">&rarr;</span>
                        </Link>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
}
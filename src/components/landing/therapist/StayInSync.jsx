import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import { MdCheckCircle, MdMessage } from "react-icons/md";

const SYNC_ITEMS = [
    "See the offer",
    "See the booking",
    "Keep conversations organized",
];

/**
 * "Stay in sync with bookings" feature section — messaging highlight.
 * Part of the 3-part platform highlights sequence on the therapist landing page.
 */
export function StayInSync() {
    return (
        <section className="py-20 md:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-center">

                    <FadeIn>
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-5">
                            <MdMessage className="text-xl text-accent-strong" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-accent-strong mb-3">
                            Keep the conversation
                        </p>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-primary leading-tight tracking-tight">
                            Stay in sync with bookings.
                        </h2>
                        <ul className="mt-6 space-y-3">
                            {SYNC_ITEMS.map((item) => (
                                <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                                    <MdCheckCircle className="text-accent-strong shrink-0 text-lg" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link
                            href="/register/therapist"
                            className="group inline-flex items-center gap-2 mt-8 px-6 py-3 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            View Messages
                            <span className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true">&rarr;</span>
                        </Link>
                    </FadeIn>

                    <FadeIn delay={0.15} className="bg-background-light rounded-2xl border border-border-light p-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between pb-3 border-b border-border-light">
                                <div>
                                    <p className="text-xs text-gray-500">Kitty Klein</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-border-light p-4 shadow-sm">
                                <p className="text-[10px] font-bold text-accent-strong uppercase tracking-wide mb-1">New Offer</p>
                                <p className="text-xs font-semibold text-primary">Physical Therapy</p>
                                <p className="text-[11px] text-gray-500 mt-0.5">Tue, Jun 11 · 10:00 AM</p>
                                <p className="text-[11px] text-gray-500">$95 / session</p>
                                <button className="mt-2 text-xs font-semibold text-accent-strong">View Offer</button>
                            </div>

                            <div className="bg-white rounded-xl border border-border-light p-4 shadow-sm">
                                <p className="text-[10px] font-bold text-accent-strong uppercase tracking-wide mb-1">Booking Confirmed</p>
                                <p className="text-xs font-semibold text-primary">Physical Therapy</p>
                                <p className="text-[11px] text-gray-500 mt-0.5">Tue, Jun 11 · 10:00 AM</p>
                                <p className="text-[11px] text-gray-500">$95 / session</p>
                                <button className="mt-2 text-xs font-semibold text-accent-strong">View Booking</button>
                            </div>

                            <div className="pt-2 border-t border-border-light">
                                <p className="text-xs text-gray-400 italic">Type a message…</p>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
}
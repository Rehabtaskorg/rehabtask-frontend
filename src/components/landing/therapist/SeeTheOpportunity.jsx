import Image from "next/image";
import FadeIn from "@/components/ui/FadeIn";
import { SeeTheOpportunityCTA } from "@/components/landing/therapist/SeeTheOpportunityCTA";
import {
    MdLocationOn,
    MdEventNote,
    MdRepeat,
    MdBusiness,
    MdCalendarToday,
    MdAssignment,
} from "react-icons/md";

const THERAPIST_PHOTO = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=900&h=675&fit=crop";

const UPFRONT_ITEMS = [
    { icon: MdLocationOn, label: "Location & distance" },
    { icon: MdEventNote, label: "Visit type" },
    { icon: MdRepeat, label: "Frequency" },
    { icon: MdBusiness, label: "Agency" },
    { icon: MdCalendarToday, label: "SOC / due date" },
    { icon: MdAssignment, label: "Treatment plan" },
];

/**
 * "See the Opportunity Before You Say Yes" section.
 * Left: copy + upfront-info icon grid + CTA.
 * Right: therapist photo with floating request-card mockup (decorative, aria-hidden).
 *
 * TODO: [NEXT] Replace THERAPIST_PHOTO with marketing-supplied licensed asset.
 */
export function SeeTheOpportunity() {
    return (
        <section className="py-20 md:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-center">

                    <FadeIn>
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-accent-strong mb-3">
                            See the opportunity before you say yes
                        </p>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-primary leading-tight tracking-tight">
                            See the opportunity before you say yes.
                        </h2>
                        <p className="mt-4 text-base text-gray-500 leading-relaxed">
                            Review the details that matter before deciding if a case fits.
                        </p>

                        <p className="mt-8 text-sm font-bold text-primary">See upfront:</p>
                        <ul className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
                            {UPFRONT_ITEMS.map((item) => (
                                <li key={item.label} className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                                        <item.icon className="text-lg text-accent-strong" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                </li>
                            ))}
                        </ul>

                        <SeeTheOpportunityCTA />
                    </FadeIn>

                    <FadeIn delay={0.15} className="relative">
                        <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3]">
                            <Image
                                src={THERAPIST_PHOTO}
                                alt="Physical therapist reviewing a patient case on their phone"
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-cover object-center"
                                loading="lazy"
                            />
                        </div>

                        <div
                            className="hidden lg:block absolute top-6 -right-4 xl:-right-8 w-64 xl:w-72 rounded-xl bg-white shadow-2xl ring-1 ring-black/5 p-4"
                            aria-hidden="true"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-accent-strong bg-accent/10 px-2.5 py-1 rounded-full">
                                    Physical Therapy
                                </span>
                                <span className="text-[10px] font-bold text-accent-strong bg-accent/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                    New Request
                                </span>
                            </div>

                            <p className="text-sm font-bold text-primary leading-tight mb-1">
                                Sunshine Home Health Agency
                            </p>

                            <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                <span className="flex items-center gap-1 text-[11px] font-semibold text-accent-strong bg-accent/10 px-2 py-0.5 rounded-full">
                                    <MdRepeat className="text-[11px]" />
                                    2–3x/week · 8 weeks
                                </span>
                                <span className="text-[11px] font-semibold text-gray-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                    EMR: KINNSER
                                </span>
                            </div>

                            <div className="space-y-1.5 text-xs text-gray-600">
                                <div className="flex items-center gap-2">
                                    <MdLocationOn className="text-gray-400 shrink-0" />
                                    <span>1420 W 6th St, Austin, TX 78703 (8 mi)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MdCalendarToday className="text-gray-400 shrink-0" />
                                    <span>SOC: Sep 15, 2026</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MdEventNote className="text-gray-400 shrink-0" />
                                    <span>In Person</span>
                                </div>
                            </div>

                            <button className="mt-3 text-xs font-semibold text-accent-strong flex items-center gap-1 hover:gap-2 transition-all">
                                View details <span>&rarr;</span>
                            </button>
                        </div>

                        <div
                            className="hidden lg:block absolute -bottom-5 -left-4 xl:-left-8 w-56 xl:w-60 rounded-xl bg-white shadow-xl ring-1 ring-black/5 p-4"
                            aria-hidden="true"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                                    <MdAssignment className="text-sm text-accent-strong" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-primary">Proposed Treatment Plan</p>
                                    <p className="text-[11px] text-gray-500 mt-0.5">Includes plan of care.</p>
                                    <p className="text-[11px] text-gray-500">Suggest changes if needed.</p>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
}
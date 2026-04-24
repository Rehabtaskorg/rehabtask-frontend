import Link from "next/link";
import Image from "next/image";
import FadeIn from "@/components/ui/FadeIn";
import HeroSearchBar from "./HeroSearchBar";
import { MdBusiness, MdMedicalServices, MdArrowForward } from "react-icons/md";

export default function Hero() {
    return (
        <section className="pt-28 pb-16 md:pt-36 md:pb-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <FadeIn duration={0.6}>
                        <h1 className="text-4xl md:text-5xl lg:text-[52px] font-extrabold text-gray-900 leading-tight tracking-tight">
                            Where agencies and therapists connect
                        </h1>
                        <p className="mt-5 text-lg text-gray-600 max-w-lg leading-relaxed">
                            The platform that matches licensed PTs, OTs, and SLPs with home health agencies that need their expertise.
                        </p>

                        <div className="mt-8">
                            <HeroSearchBar />
                        </div>

                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Link href="/therapists" className="group">
                                <div className="bg-white border border-gray-100 rounded-xl p-4 hover:border-primary/30 hover:shadow-md transition-all h-full flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <MdBusiness className="text-primary text-xl" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-900 leading-tight">I&apos;m a Home Health Agency</p>
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all mt-0.5">
                                            Find Therapists <MdArrowForward className="text-sm" />
                                        </span>
                                    </div>
                                </div>
                            </Link>

                            <Link href="/requests" className="group">
                                <div className="bg-white border border-gray-100 rounded-xl p-4 hover:border-emerald-300 hover:shadow-md transition-all h-full flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                                        <MdMedicalServices className="text-emerald-600 text-xl" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-900 leading-tight">I&apos;m a Licensed Therapist</p>
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 group-hover:gap-2 transition-all mt-0.5">
                                            Browse Requests <MdArrowForward className="text-sm" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.2} duration={0.7} className="relative hidden lg:block">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                            <Image
                                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop"
                                alt="Physical therapist helping a patient with rehabilitation exercises"
                                width={800}
                                height={600}
                                className="w-full h-auto object-cover"
                                priority
                            />
                        </div>
                        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
                        <div className="absolute -top-4 -right-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
                    </FadeIn>
                </div>
            </div>
        </section>
    );
}

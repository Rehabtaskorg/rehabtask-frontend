"use client";

import Link from "next/link";
import Image from "next/image";
import FadeIn from "@/components/ui/FadeIn";
import { useAnalytics } from "@/hooks/useAnalytics";

/**
 * Hero section for the therapist landing page.
 * H1 is NOT wrapped in FadeIn — opacity:0 until hydration would kill LCP and cause CLS.
 */
export function TherapistLandingHero() {
    const { trackEvent } = useAnalytics();
    return (
        <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 xl:gap-12 items-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl lg:text-[52px] font-extrabold text-black leading-tight tracking-tight">
                            Find More Patients. Grow Your Practice.
                        </h1>

                        <FadeIn delay={0.1} duration={0.6}>
                            <p className="mt-5 text-lg text-gray-600 leading-relaxed max-w-lg">
                                Browse available patient referrals from Home Health Agencies across the United States. Choose opportunities that match your discipline, preferred location, schedule, and rates—all from one platform.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    href="/requests"
                                    onClick={() => trackEvent("browse_referrals_clicked", { source: "hero" })}
                                    className="px-6 py-3 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    Browse Referrals
                                </Link>
                                <Link
                                    href="/register/therapist"
                                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Join as a Therapist
                                </Link>
                            </div>
                        </FadeIn>
                    </div>

                    <FadeIn delay={0.2} duration={0.7} className="relative hidden lg:block">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
                            <Image
                                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&h=675&fit=crop"
                                alt="Licensed therapist providing home health rehabilitation care"
                                fill
                                className="object-cover object-center"
                                priority
                                unoptimized
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
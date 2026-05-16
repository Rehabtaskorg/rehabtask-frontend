import Image from "next/image";
import FadeIn from "@/components/ui/FadeIn";
import HeroSearchBar from "./HeroSearchBar";

export default function Hero() {
    return (
        <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 xl:gap-12 items-center">
                    <FadeIn duration={0.6}>
                        <h1 className="text-4xl md:text-5xl lg:text-[52px] font-extrabold text-black leading-tight tracking-tight">
                            The marketplace for modern rehabilitation care
                        </h1>

                        <div className="mt-8">
                            <HeroSearchBar />
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.2} duration={0.7} className="relative hidden lg:block">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
                            <Image
                                src="/images/hero-platform-preview.png"
                                alt="RehabTask platform showing agency scheduling and therapist mobile app"
                                fill
                                className="object-cover object-top"
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

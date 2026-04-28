import Image from "next/image";
import FadeIn from "@/components/ui/FadeIn";
import HeroSearchBar from "./HeroSearchBar";

export default function Hero() {
    return (
        <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <FadeIn duration={0.6}>
                        <h1 className="text-4xl md:text-5xl lg:text-[52px] font-extrabold text-gray-900 leading-tight tracking-tight">
                            Where agencies and therapists connect
                        </h1>

                        <div className="mt-8">
                            <HeroSearchBar />
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

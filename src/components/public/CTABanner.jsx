import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";

export default function CTABanner() {
    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
            <FadeIn
                duration={0.6}
                className="max-w-7xl mx-auto relative rounded-2xl overflow-hidden min-h-75 flex items-center justify-center"
            >
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url(/images/agency-therapist-care.png)" }}
                />
                <div className="absolute inset-0 bg-gray-900/75" />
                <div className="relative text-center px-6 py-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                        The faster way to place patients and grow your caseload
                    </h2>
                    <p className="mt-3 text-gray-300 max-w-xl mx-auto">
                        Home health agencies fill cases instantly. Therapists stay fully booked. Everyone wins.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <Link
                            href="/register/customer"
                            className="px-7 py-3 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                        >
                            I&apos;m an Agency — Find Therapists
                        </Link>
                        <Link
                            href="/register/therapist"
                            className="px-7 py-3 text-sm font-semibold text-white border border-white/30 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            I&apos;m a Therapist — Get Booked
                        </Link>
                    </div>
                </div>
            </FadeIn>
        </section>
    );
}

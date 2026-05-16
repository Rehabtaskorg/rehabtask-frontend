import Link from "next/link";
import Image from "next/image";
import FadeIn from "@/components/ui/FadeIn";

export default function ForTherapists() {
    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <FadeIn className="text-center mb-10">
                    <h2 className="mt-2 text-3xl md:text-4xl font-bold" style={{ color: "#2EC4B6" }}>Get Matched. Get Booked. Get to Work.</h2>
                    <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
                        Manage your schedule, set your rates, and accept cases with a single tap. Choose what fits, when it fits and stay consistently booked without the back-and-forth.
                    </p>
                </FadeIn>

                <FadeIn
                    delay={0.2}
                    duration={0.6}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden bg-white"
                >
                    <div className="relative min-h-75 lg:min-h-100">
                        <Image
                            src="/images/therapist-matching.png"
                            alt="Therapist reviewing real-time patient matching on a tablet"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="p-8 md:p-12 flex flex-col justify-center">
                        <p className="mt-4 text-gray-500 leading-relaxed">
                            Get matched with the right cases in real time. Set your availability, accept opportunities instantly, and manage your entire workflow, from one platform.
                        </p>
                        <div className="mt-6 flex flex-wrap items-center gap-4">
                            <Link
                                href="/register/therapist"
                                className="px-6 py-3 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                Join as therapist
                            </Link>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}

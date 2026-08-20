import FadeIn from "@/components/ui/FadeIn";
import { MdFormatQuote } from "react-icons/md";

const TESTIMONIALS = [
    {
        quote: "RehabTask made it incredibly easy to find home health referrals that matched my schedule and specialty. I went from one agency to four within my first month.",
        name: "Maria T.",
        credential: "Physical Therapist, DPT",
        location: "Houston, TX",
    },
    {
        quote: "I love that I can browse open referrals before committing to anything. The platform gives me full control over which cases I accept and when.",
        name: "James R.",
        credential: "Occupational Therapist, OTR/L",
        location: "Atlanta, GA",
    },
    {
        quote: "Getting paid through RehabTask is seamless. No chasing invoices, no delays — payments come through reliably every time a visit is confirmed.",
        name: "Aisha K.",
        credential: "Speech-Language Pathologist, CCC-SLP",
        location: "Chicago, IL",
    },
];

/**
 * Placeholder therapist testimonials.
 * These are illustrative examples — not real endorsements.
 * Marketing to provide verified testimonials for production.
 */
export function TherapistTestimonials() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <FadeIn className="text-center mb-14">
                    <h2 className="mt-2 text-3xl md:text-4xl font-bold" style={{ color: "#2EC4B6" }}>
                        What Therapists Are Saying
                    </h2>
                    <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
                        Hear from licensed therapists who are growing their practice with RehabTask.
                    </p>
                    <p className="mt-2 text-xs text-gray-400 italic">
                        Illustrative examples — not verified endorsements. Real therapist stories coming soon.
                    </p>
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {TESTIMONIALS.map((testimonial, i) => (
                        <FadeIn
                            key={testimonial.name}
                            delay={i * 0.1}
                            className="bg-gray-50 border border-gray-200 rounded-xl p-7 flex flex-col"
                        >
                            <MdFormatQuote className="text-3xl text-primary/30 mb-3" />
                            <p className="text-sm text-gray-600 leading-relaxed flex-1">{testimonial.quote}</p>
                            <div className="mt-6 pt-5 border-t border-gray-200">
                                <p className="text-sm font-bold text-gray-900">{testimonial.name}</p>
                                <p className="text-xs text-primary font-medium mt-0.5">{testimonial.credential}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{testimonial.location}</p>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}
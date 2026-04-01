import Image from "next/image";
import FadeIn from "@/components/ui/FadeIn";
import { MdStar } from "react-icons/md";

const REVIEWS = [
    {
        quote: "I found a physical therapist who understood my injury and got me back on my feet in weeks, not months.",
        name: "Marcus Chen",
        role: "Patient, Los Angeles",
        rating: 5,
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    },
    {
        quote: "The process was straightforward. I compared three therapists and booked my first session the same day.",
        name: "Sarah Mitchell",
        role: "Patient, Austin",
        rating: 5,
        photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    },
    {
        quote: "RehabTask made it easy to find an occupational therapist who specializes in hand injuries. Highly recommend.",
        name: "James Rodriguez",
        role: "Patient, Seattle",
        rating: 5,
        photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    },
];

export default function Testimonials() {
    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <FadeIn className="text-center mb-14">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Real stories</h2>
                    <p className="mt-3 text-gray-500">Hear from patients who found the right therapist</p>
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {REVIEWS.map((review, i) => (
                        <FadeIn
                            key={review.name}
                            delay={i * 0.12}
                            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex gap-0.5 mb-4">
                                {Array.from({ length: review.rating }).map((_, j) => (
                                    <MdStar key={j} className="text-amber-500 text-lg" />
                                ))}
                            </div>
                            <p className="text-gray-700 leading-relaxed mb-6">
                                &ldquo;{review.quote}&rdquo;
                            </p>
                            <div className="flex items-center gap-3">
                                <Image
                                    src={review.photo}
                                    alt={review.name}
                                    width={40}
                                    height={40}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{review.name}</p>
                                    <p className="text-xs text-gray-500">{review.role}</p>
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}

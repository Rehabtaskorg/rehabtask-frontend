import Link from "next/link";
import Image from "next/image";
import FadeIn from "@/components/ui/FadeIn";
import { MdArrowForward } from "react-icons/md";

export default function ForTherapists() {
    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <FadeIn className="text-center mb-10">
                    <p className="text-sm font-semibold text-primary uppercase tracking-wider">Opportunity</p>
                    <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">Build your practice on your terms</h2>
                    <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
                        Set your own rates, control your schedule, and work with agencies that value your expertise. Join a network of rehabilitation professionals who are making a real difference in home health care.
                    </p>
                </FadeIn>

                <FadeIn
                    delay={0.2}
                    duration={0.6}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-gray-200 bg-white"
                >
                    <div className="relative min-h-75 lg:min-h-100">
                        <Image
                            src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=600&fit=crop"
                            alt="Therapist working with a patient in a home health setting"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="p-8 md:p-12 flex flex-col justify-center">
                        <p className="text-sm font-semibold text-primary uppercase tracking-wider">For therapists</p>
                        <h3 className="mt-2 text-2xl md:text-3xl font-bold text-gray-900">Are you a licensed therapist?</h3>
                        <p className="mt-4 text-gray-500 leading-relaxed">
                            RehabTask gives you the freedom to grow your practice while connecting with agencies that need your skills. Manage everything from one platform and get paid securely for every session.
                        </p>
                        <div className="mt-6 flex flex-wrap items-center gap-4">
                            <Link
                                href="/register/therapist"
                                className="px-6 py-3 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                Join as a therapist
                            </Link>
                            <Link
                                href="/register/therapist"
                                className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                            >
                                Get started <MdArrowForward className="text-sm" />
                            </Link>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}

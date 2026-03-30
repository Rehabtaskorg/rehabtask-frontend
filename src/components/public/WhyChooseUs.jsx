"use client";

import { motion } from "framer-motion";
import { MdVerified, MdCategory, MdVisibility, MdArrowForward } from "react-icons/md";
import Link from "next/link";

const FEATURES = [
    {
        badge: "Verified",
        title: "Verified therapists and credentials",
        description: "Every therapist on RehabTask is licensed and verified. We check credentials, insurance acceptance, and professional standing to ensure you get quality care.",
        image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=700&h=500&fit=crop",
        cta: { label: "Explore", href: "/register/customer" },
        large: true,
    },
    {
        icon: MdCategory,
        title: "Specializations across all disciplines",
        description: "From orthopedic to neurological rehab, speech pathology to pediatric therapy. Find specialists trained in your specific condition and recovery needs.",
        cta: { label: "Browse specialties", href: "/register/customer" },
    },
    {
        icon: MdVisibility,
        title: "Transparent pricing and availability",
        description: "See rates upfront. No hidden fees. Check real-time availability and book sessions that fit your schedule without surprises.",
        cta: { label: "View rates", href: "/register/customer" },
    },
];

export default function WhyChooseUs() {
    return (
        <section className="py-20 bg-blue-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-14"
                >
                    <p className="text-sm font-semibold text-[#137fec] uppercase tracking-wider">Why choose us</p>
                    <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">Everything you need to heal</h2>
                    <p className="mt-3 text-gray-500">Browse, compare, and book therapy sessions with confidence</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {FEATURES.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.12 }}
                            className={`relative rounded-2xl overflow-hidden flex flex-col justify-end group ${
                                feature.large ? "md:row-span-1 min-h-[320px]" : "min-h-[280px] bg-gray-900"
                            }`}
                        >
                            {feature.image ? (
                                <>
                                    <div
                                        className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-60 transition-opacity duration-500"
                                        style={{ backgroundImage: `url(${feature.image})` }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-gray-900/20" />
                                </>
                            ) : (
                                <div className="absolute inset-0 bg-gray-900" />
                            )}

                            <div className="relative p-6 text-white">
                                {feature.badge && (
                                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full mb-3">
                                        {feature.badge}
                                    </span>
                                )}
                                {feature.icon && <feature.icon className="text-2xl text-white/80 mb-3" />}
                                <h3 className="text-xl font-bold leading-snug">{feature.title}</h3>
                                <p className="mt-2 text-sm text-gray-300 leading-relaxed">{feature.description}</p>
                                <Link
                                    href={feature.cta.href}
                                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-white/80 hover:text-white transition-colors"
                                >
                                    {feature.cta.label} <MdArrowForward className="text-sm group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

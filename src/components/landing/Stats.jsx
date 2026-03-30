"use client";

import { motion } from "framer-motion";
import { MdStar } from "react-icons/md";
import { usePlatformStats } from "@/hooks/usePublic";

function formatStat(n) {
    if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k+`;
    return `${n}+`;
}

export default function Stats() {
    const { data } = usePlatformStats();

    const STATS = [
        { value: data ? formatStat(data.therapists) : "500+", label: "Licensed therapists", sublabel: "Available across the platform" },
        { value: data ? formatStat(data.sessionsCompleted) : "2,000+", label: "Sessions completed", sublabel: "Connecting patients with care" },
        { value: data ? String(data.averageRating) : "4.8", label: "Average rating", sublabel: "From verified patient reviews", icon: MdStar },
        { value: data ? String(data.statesCovered) : "50", label: "States covered", sublabel: "Growing network nationwide" },
    ];
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <p className="text-sm font-semibold text-primary uppercase tracking-wider">Impact</p>
                        <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                            Trusted by agencies across the country
                        </h2>
                        <p className="mt-4 text-gray-500 leading-relaxed">
                            RehabTask connects home health agencies with qualified therapists every day. Our platform has grown to serve hundreds of agencies and thousands of patients nationwide.
                        </p>
                    </motion.div>

                    <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                        {STATS.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                                className="bg-gray-50 border border-gray-200 rounded-xl p-6"
                            >
                                <div className="flex items-end gap-1">
                                    <span className="text-4xl font-extrabold text-gray-900">{stat.value}</span>
                                    {stat.icon && <stat.icon className="text-2xl text-amber-500 mb-1" />}
                                </div>
                                <p className="mt-2 text-sm font-semibold text-gray-900">{stat.label}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{stat.sublabel}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

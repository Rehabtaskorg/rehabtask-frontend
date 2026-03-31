"use client";

import { motion } from "framer-motion";
import { MdStar } from "react-icons/md";
import Link from "next/link";
import { usePlatformStats } from "@/hooks/usePublic";

function formatStat(n) {
    if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k+`;
    return `${n}+`;
}

export default function PublicStats() {
    const { data } = usePlatformStats();

    const STATS = [
        { value: data ? formatStat(data.therapists) : "—", label: "Licensed therapists", sublabel: "Verified professionals ready to help" },
        { value: data ? `${data.citiesCovered}+` : "—", label: "Cities covered", sublabel: "Available across the country and growing" },
        { value: data ? String(data.averageRating) : "—", label: "Average rating", sublabel: `From verified patient reviews`, icon: MdStar },
        { value: data ? formatStat(data.sessionsCompleted) : "—", label: "Sessions booked", sublabel: "Successful appointments completed" },
    ];

    return (
        <section className="py-20 bg-gray-950 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">By the numbers</p>
                        <h2 className="mt-2 text-3xl md:text-4xl font-bold leading-tight">
                            Thousands trust RehabTask for their recovery
                        </h2>
                        <p className="mt-4 text-gray-400 leading-relaxed">
                            Our platform connects patients with licensed therapists across the country. Here&apos;s what our community has achieved.
                        </p>
                        <div className="mt-6 flex items-center gap-4">
                            <Link href="/register/customer" className="text-sm font-semibold text-white hover:text-primary transition-colors">
                                Get started
                            </Link>
                            <Link href="/register/customer" className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                                Learn more &rsaquo;
                            </Link>
                        </div>
                    </motion.div>

                    <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                        {STATS.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                                className="bg-gray-900 border border-gray-800 rounded-xl p-6"
                            >
                                <p className="text-sm font-medium text-gray-400 mb-3">{stat.label}</p>
                                <div className="flex items-end gap-1">
                                    <span className="text-4xl md:text-5xl font-extrabold">{stat.value}</span>
                                    {stat.icon && <stat.icon className="text-2xl text-amber-500 mb-1.5" />}
                                </div>
                                <p className="text-xs text-gray-500 mt-3 leading-relaxed">{stat.sublabel}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

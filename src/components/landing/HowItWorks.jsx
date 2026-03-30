"use client";

import { motion } from "framer-motion";
import { MdSearch, MdHandshake, MdFavorite } from "react-icons/md";

const STEPS = [
    {
        icon: MdSearch,
        title: "Search",
        description: "Browse verified therapists by discipline, location, and availability",
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop",
    },
    {
        icon: MdHandshake,
        title: "Connect",
        description: "Send offers, discuss details, and book sessions securely",
        image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&h=400&fit=crop",
    },
    {
        icon: MdFavorite,
        title: "Get care",
        description: "Receive professional rehabilitation therapy at home",
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=400&fit=crop",
    },
];

export default function HowItWorks() {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-14"
                >
                    <p className="text-sm font-semibold text-primary uppercase tracking-wider">Process</p>
                    <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">How it works</h2>
                    <p className="mt-3 text-gray-500">Get started in three simple steps</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {STEPS.map((step, i) => (
                        <motion.div
                            key={step.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.15 }}
                            className="group relative rounded-2xl overflow-hidden bg-gray-900 text-white min-h-70 flex flex-col justify-end"
                        >
                            <div
                                className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity duration-500"
                                style={{ backgroundImage: `url(${step.image})` }}
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-gray-900/60 to-transparent" />
                            <div className="relative p-6">
                                <step.icon className="text-2xl text-white mb-3" />
                                <h3 className="text-xl font-bold">{step.title}</h3>
                                <p className="mt-1 text-sm text-gray-300 leading-relaxed">{step.description}</p>
                                <p className="mt-3 text-sm font-medium text-white/80 flex items-center gap-1 group-hover:text-white transition-colors">
                                    Learn more <span className="group-hover:translate-x-0.5 transition-transform">&rsaquo;</span>
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

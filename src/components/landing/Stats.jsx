import FadeIn from "@/components/ui/FadeIn";
import { MdStar } from "react-icons/md";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function formatStat(n) {
    if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k+`;
    return `${n}+`;
}

async function fetchStats() {
    try {
        const res = await fetch(`${API_URL}/therapists/stats`, { next: { revalidate: 300 } });
        if (!res.ok) return null;
        const json = await res.json();
        return json.data || null;
    } catch {
        return null;
    }
}

export default async function Stats() {
    const data = await fetchStats();

    const STATS = [
        { value: data ? formatStat(data.therapists) : "500+", label: "Licensed therapists", sublabel: "Available across the platform" },
        { value: data ? formatStat(data.sessionsCompleted) : "2,000+", label: "Sessions completed", sublabel: "Connecting patients with care" },
        { value: data ? String(data.averageRating) : "4.8", label: "Average rating", sublabel: "From verified patient reviews", icon: MdStar },
        { value: data ? `${data.statesCovered}+` : "50", label: "States covered", sublabel: "Growing network nationwide" },
    ];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                    <FadeIn>
                        <h2 className="mt-2 text-3xl md:text-4xl font-bold leading-tight text-primary">
                            Faster patient placement nationwide
                        </h2>
                        <p className="mt-4 text-gray-500 leading-relaxed">
                            RehabTask connects agencies with available therapists instantly, helping patients begin care sooner. From first match to first visit, the platform is built to remove bottlenecks and keep rehabilitation moving forward.
                        </p>
                    </FadeIn>

                    <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                        {STATS.map((stat, i) => (
                            <FadeIn
                                key={stat.label}
                                delay={i * 0.1}
                                duration={0.4}
                                className="bg-gray-50 border border-gray-200 rounded-xl p-6"
                            >
                                <div className="flex items-end gap-1">
                                    <span className="text-4xl font-extrabold text-gray-900">{stat.value}</span>
                                    {stat.icon && <stat.icon className="text-2xl text-amber-500 mb-1" />}
                                </div>
                                <p className="mt-2 text-sm font-semibold text-gray-900">{stat.label}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{stat.sublabel}</p>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

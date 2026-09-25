import FadeIn from "@/components/ui/FadeIn";

const DISCIPLINES = [
    {
        abbreviation: "PT",
        title: "Physical Therapist",
        description: "Help patients recover movement, manage pain, and restore function after injury or illness.",
        color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
        abbreviation: "OT",
        title: "Occupational Therapist",
        description: "Support patients in regaining the skills needed for daily living and independence.",
        color: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
        abbreviation: "SLP",
        title: "Speech-Language Pathologist",
        description: "Evaluate and treat communication, swallowing, and cognitive-linguistic disorders.",
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
        abbreviation: "PTA",
        title: "Physical Therapist Assistant",
        description: "Work alongside PTs to deliver rehabilitation services and progress patient treatment plans.",
        color: "bg-sky-50 text-sky-700 border-sky-200",
    },
    {
        abbreviation: "COTA",
        title: "Certified Occupational Therapy Assistant",
        description: "Assist OTs in implementing therapy plans and helping patients build everyday skills.",
        color: "bg-violet-50 text-violet-700 border-violet-200",
    },
];

/**
 * Displays the therapy disciplines supported on the platform.
 * Data-driven — adding MSW later requires one new entry in the DISCIPLINES array.
 */
export function SupportedDisciplines() {
    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <FadeIn className="text-center mb-14">
                    <h2 className="mt-2 text-3xl md:text-4xl font-bold" style={{ color: "#2EC4B6" }}>
                        Supported Disciplines
                    </h2>
                    <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
                        RehabTask connects Home Health Agencies with licensed therapists across all major rehabilitation disciplines.
                    </p>
                </FadeIn>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {DISCIPLINES.map((discipline, i) => (
                        <FadeIn
                            key={discipline.abbreviation}
                            delay={i * 0.08}
                            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                        >
                            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider mb-4 ${discipline.color}`}>
                                {discipline.abbreviation}
                            </span>
                            <h3 className="text-base font-bold text-gray-900 mb-2">{discipline.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{discipline.description}</p>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}
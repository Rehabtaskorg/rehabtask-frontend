const StatCard = ({ iconColor }) => (
    <div className="bg-card-light  border border-border-light  rounded-xl p-6 relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-28 h-28 ${iconColor} rounded-full -mr-14 -mt-14 opacity-5`} />
        <div className={`w-11 h-11 ${iconColor} rounded-full mb-4`} />
        <div className="h-3 w-28 bg-slate-200  rounded mb-2" />
        <div className="h-8 w-32 bg-slate-200  rounded mb-2" />
        <div className="h-3 w-36 bg-slate-100  rounded" />
    </div>
);

export default function EarningsPreview() {
    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6" aria-hidden="true">
            <div className="flex justify-between items-center">
                <div className="h-8 w-28 bg-slate-200  rounded-lg" />
                <div className="flex gap-2">
                    <div className="h-9 w-24 bg-slate-200  rounded-lg" />
                    <div className="h-9 w-36 bg-primary/20 rounded-lg" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard iconColor="bg-emerald-500/20" />
                <StatCard iconColor="bg-amber-500/20" />
                <StatCard iconColor="bg-primary/20" />
            </div>

            <div className="bg-card-light  border border-border-light  rounded-xl p-6">
                <div className="h-5 w-36 bg-slate-200  rounded mb-6" />
                <div className="flex items-end justify-between gap-3 h-48">
                    {[35, 55, 45, 70, 80, 90].map((h, i) => (
                        <div key={i} className={`flex-1 rounded-t-lg ${i === 5 ? "bg-emerald-500/40" : "bg-emerald-500/15"}`} style={{ height: `${h}%` }} />
                    ))}
                </div>
            </div>

            <div className="bg-card-light  border border-border-light  rounded-xl overflow-hidden">
                <div className="p-6 pb-3">
                    <div className="h-5 w-28 bg-slate-200  rounded mb-4" />
                    <div className="flex gap-2 pb-3 border-b border-border-light ">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-7 w-20 bg-slate-100  rounded-lg" />
                        ))}
                    </div>
                </div>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-border-light  last:border-b-0">
                        <div className="w-9 h-9 bg-primary/10 rounded-full shrink-0" />
                        <div className="flex-1 space-y-1.5">
                            <div className="h-4 w-28 bg-slate-200  rounded" />
                            <div className="h-3 w-20 bg-slate-100  rounded" />
                        </div>
                        <div className="h-4 w-14 bg-slate-200  rounded" />
                        <div className="h-4 w-14 bg-red-100  rounded" />
                        <div className="h-4 w-14 bg-emerald-100  rounded" />
                        <div className="h-6 w-16 bg-emerald-100  rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

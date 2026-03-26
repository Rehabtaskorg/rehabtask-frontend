export default function EarningsPageSkeleton() {
    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto animate-pulse">
            <div className="flex justify-between items-center mb-8">
                <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                <div className="flex gap-3">
                    <div className="h-10 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                    <div className="h-10 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6">
                        <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full mb-4" />
                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                        <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                        <div className="h-3 w-36 bg-slate-100 dark:bg-slate-800 rounded" />
                    </div>
                ))}
            </div>

            <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6 mb-8">
                <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
                <div className="flex items-end justify-between gap-3 h-48">
                    {[40, 60, 45, 75, 85, 90].map((h, i) => (
                        <div key={i} className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-t-lg" style={{ height: `${h}%` }} />
                    ))}
                </div>
            </div>

            <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6">
                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-4 py-4 border-b border-border-light dark:border-border-dark last:border-b-0">
                        <div className="h-9 w-9 bg-slate-200 dark:bg-slate-700 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
                            <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
                        </div>
                        <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

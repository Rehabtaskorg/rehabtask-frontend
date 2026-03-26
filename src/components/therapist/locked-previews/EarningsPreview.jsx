const StatCard = ({ color, label }) => (
    <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5">
        <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
        <div className={`h-8 w-28 ${color} rounded mb-2`} />
        <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
    </div>
);

const PayoutRow = ({ statusColor, statusWidth }) => (
    <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <div className="space-y-1.5">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="flex items-center gap-2">
                    <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
            </div>
            <div className={`h-6 ${statusWidth} ${statusColor} rounded-full self-start`} />
        </div>
        <div className="border-t border-border-light dark:border-border-dark pt-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                    <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-1.5" />
                    <div className="h-4 w-14 bg-slate-300 dark:bg-slate-600 rounded" />
                </div>
                <div>
                    <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-1.5" />
                    <div className="h-4 w-12 bg-red-100 dark:bg-red-900/20 rounded" />
                </div>
                <div>
                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-1.5" />
                    <div className="h-4 w-14 bg-emerald-100 dark:bg-emerald-900/20 rounded" />
                </div>
                <div>
                    <div className="h-3 w-14 bg-slate-200 dark:bg-slate-700 rounded mb-1.5" />
                    <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
            </div>
        </div>
    </div>
);

export default function EarningsPreview() {
    return (
        <div className="p-4 md:p-6 space-y-6" aria-hidden="true">
            {/* Title */}
            <div className="h-7 w-44 bg-slate-200 dark:bg-slate-700 rounded" />

            {/* Stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard color="bg-emerald-200 dark:bg-emerald-800" />
                <StatCard color="bg-amber-200 dark:bg-amber-800" />
                <StatCard color="bg-primary/20" />
            </div>

            {/* Payout history */}
            <div>
                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
                <div className="space-y-4">
                    <PayoutRow statusColor="bg-emerald-100 dark:bg-emerald-900/20" statusWidth="w-20" />
                    <PayoutRow statusColor="bg-amber-100 dark:bg-amber-900/20" statusWidth="w-18" />
                    <PayoutRow statusColor="bg-emerald-100 dark:bg-emerald-900/20" statusWidth="w-20" />
                    <PayoutRow statusColor="bg-orange-100 dark:bg-orange-900/20" statusWidth="w-28" />
                </div>
            </div>
        </div>
    );
}

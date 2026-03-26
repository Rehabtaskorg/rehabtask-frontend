const STATUS_TABS = [
    { label: "All", count: 8, active: true },
    { label: "Pending", count: 3 },
    { label: "Change Requested", count: 1, dot: true },
    { label: "Accepted", count: 2 },
    { label: "Declined", count: 1 },
    { label: "Expired", count: 1 },
];

const OfferCard = ({ statusColor, statusWidth, hasChangeNote }) => (
    <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5">
        <div className="lg:grid lg:grid-cols-12 lg:gap-4">
            <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center gap-2">
                    <div className="h-5 w-44 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className={`h-5 ${statusWidth} ${statusColor} rounded-full`} />
                </div>
                {hasChangeNote && (
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                        <div className="h-3 w-full bg-amber-100 dark:bg-amber-800/30 rounded" />
                        <div className="h-3 w-2/3 bg-amber-100 dark:bg-amber-800/30 rounded mt-1.5" />
                    </div>
                )}
                <div className="flex items-center gap-3 text-sm divide-x divide-border-light dark:divide-border-dark">
                    <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded pl-3" />
                    <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded pl-3" />
                    <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded pl-3" />
                </div>
            </div>
            <div className="lg:col-span-5 flex items-center justify-end gap-2 mt-3 lg:mt-0">
                <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                <div className="h-8 w-28 bg-primary/10 rounded-lg" />
            </div>
        </div>
    </div>
);

export default function OffersPreview() {
    return (
        <div className="p-4 md:p-6 space-y-6" aria-hidden="true">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="h-7 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-9 w-32 bg-primary/20 rounded-lg" />
            </div>

            {/* Warning banner */}
            <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <div className="w-5 h-5 rounded-full bg-amber-300 dark:bg-amber-700 shrink-0" />
                <div className="h-4 w-64 bg-amber-100 dark:bg-amber-800/30 rounded" />
                <div className="h-7 w-36 bg-amber-200 dark:bg-amber-800 rounded-lg ml-auto" />
            </div>

            {/* Status tabs */}
            <div className="flex flex-wrap gap-2">
                {STATUS_TABS.map((tab) => (
                    <div
                        key={tab.label}
                        className={`h-8 px-3 rounded-full flex items-center gap-1.5 ${tab.active
                            ? "bg-primary/20"
                            : "bg-slate-100 dark:bg-slate-800"
                            }`}
                    >
                        <div className={`h-3 ${tab.label.length > 8 ? "w-28" : "w-12"} ${tab.active ? "bg-primary/30" : "bg-slate-200 dark:bg-slate-700"} rounded`} />
                        {tab.dot && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                    </div>
                ))}
            </div>

            {/* Offer cards */}
            <div className="space-y-4">
                <OfferCard statusColor="bg-amber-200 dark:bg-amber-800" statusWidth="w-16" hasChangeNote={false} />
                <OfferCard statusColor="bg-amber-200 dark:bg-amber-800" statusWidth="w-28" hasChangeNote={true} />
                <OfferCard statusColor="bg-emerald-200 dark:bg-emerald-800" statusWidth="w-18" hasChangeNote={false} />
                <OfferCard statusColor="bg-slate-200 dark:bg-slate-700" statusWidth="w-16" hasChangeNote={false} />
            </div>
        </div>
    );
}

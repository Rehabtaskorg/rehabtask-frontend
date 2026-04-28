const FILTER_TABS = [
    { label: "All", count: 12, active: true },
    { label: "Upcoming", count: 4 },
    { label: "Completed", count: 6 },
    { label: "Cancelled", count: 2 },
];

const TableRow = ({ statusColor, statusWidth, hasPatient }) => (
    <tr className="border-b border-border-light dark:border-border-dark last:border-b-0">
        <td className="py-3 px-4">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 shrink-0" />
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
        </td>
        <td className="py-3 px-4">
            <div className="h-4 w-28 bg-slate-100 dark:bg-slate-800 rounded" />
            {hasPatient && <div className="h-4 w-20 bg-amber-100 dark:bg-amber-900/20 rounded-full mt-1" />}
        </td>
        <td className="py-3 px-4">
            <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="h-3 w-14 bg-slate-100 dark:bg-slate-800 rounded mt-1" />
        </td>
        <td className="py-3 px-4">
            <div className="h-4 w-16 bg-emerald-100 dark:bg-emerald-900/20 rounded" />
        </td>
        <td className="py-3 px-4">
            <div className={`h-6 ${statusWidth} ${statusColor} rounded-full`} />
        </td>
        <td className="py-3 px-2">
            <div className="w-5 h-5 bg-slate-100 dark:bg-slate-800 rounded" />
        </td>
    </tr>
);

export default function BookingsPreview() {
    return (
        <div aria-hidden="true">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-light dark:border-border-dark">
                <div className="h-7 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-9 w-36 bg-primary/20 rounded-lg" />
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 px-6 py-3 border-b border-border-light dark:border-border-dark">
                {FILTER_TABS.map((tab) => (
                    <div
                        key={tab.label}
                        className={`h-8 px-3 rounded-full flex items-center ${tab.active ? "bg-primary/20" : "bg-slate-100 dark:bg-slate-800"}`}
                    >
                        <div className={`h-3 w-16 ${tab.active ? "bg-primary/30" : "bg-slate-200 dark:bg-slate-700"} rounded`} />
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="px-6 py-2">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border-light dark:border-border-dark">
                            {["Customer", "Service", "Date & Time", "Earnings", "Status", ""].map((col) => (
                                <th key={col} className="py-3 px-4 text-left">
                                    <div className={`h-3 ${col ? "w-16" : "w-4"} bg-slate-200 dark:bg-slate-700 rounded`} />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <TableRow statusColor="bg-blue-100 dark:bg-blue-900/20" statusWidth="w-20" hasPatient={false} />
                        <TableRow statusColor="bg-emerald-100 dark:bg-emerald-900/20" statusWidth="w-22" hasPatient={true} />
                        <TableRow statusColor="bg-blue-100 dark:bg-blue-900/20" statusWidth="w-20" hasPatient={false} />
                        <TableRow statusColor="bg-amber-100 dark:bg-amber-900/20" statusWidth="w-24" hasPatient={false} />
                        <TableRow statusColor="bg-emerald-100 dark:bg-emerald-900/20" statusWidth="w-22" hasPatient={true} />
                        <TableRow statusColor="bg-slate-100 dark:bg-slate-800" statusWidth="w-20" hasPatient={false} />
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="flex items-center justify-between py-4 border-t border-border-light dark:border-border-dark mt-2">
                    <div className="h-8 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                    <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

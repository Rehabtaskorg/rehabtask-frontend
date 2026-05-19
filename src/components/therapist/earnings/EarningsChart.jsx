"use client";

import { fillMissingMonths, formatMonthLabel, getBarHeightPercent } from "@/lib/earnings.utils";
import { formatCurrency } from "@/utils/messages";

export default function EarningsChart({ earningsByMonth }) {
    const months = fillMissingMonths(earningsByMonth || []);
    const maxEarnings = Math.max(...months.map((m) => m.earnings), 1);
    const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

    if (months.every((m) => m.earnings === 0)) {
        return (
            <div className="bg-card-light  border border-border-light  rounded-xl p-6">
                <h2 className="text-lg font-bold text-text-main  mb-4">Earnings Overview</h2>
                <div className="h-48 flex items-center justify-center">
                    <p className="text-sm text-text-muted ">No earnings data to display yet</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card-light  border border-border-light  rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-text-main ">Earnings Overview</h2>
                <span className="text-xs font-semibold text-text-muted  uppercase tracking-wider">Monthly</span>
            </div>

            <div className="relative w-full flex items-end gap-2 sm:gap-4 px-1" style={{ height: "16rem" }}>
                {months.map((m) => {
                    const isCurrent = m.month === currentMonthKey;
                    const height = getBarHeightPercent(m.earnings, maxEarnings);

                    return (
                        <div key={m.month} className="group relative flex-1 flex flex-col items-center h-full justify-end">
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform origin-bottom bg-slate-800  text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none z-20 whitespace-nowrap">
                                <div>{formatCurrency(m.earnings)}</div>
                                <div className="text-slate-400 font-normal">{m.sessions} session{m.sessions !== 1 ? "s" : ""}</div>
                            </div>
                            <div
                                className={`w-full rounded-t-lg transition-all cursor-pointer ${
                                    isCurrent
                                        ? "bg-emerald-500 group-hover:bg-emerald-600"
                                        : "bg-emerald-500/20  group-hover:bg-emerald-500/40"
                                }`}
                                style={{ height: `${height}%`, minHeight: m.earnings > 0 ? "8px" : "0px" }}
                            />
                            <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 shrink-0 ${
                                isCurrent ? "text-emerald-500" : "text-text-muted "
                            }`}>
                                {formatMonthLabel(m.month)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

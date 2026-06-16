import { MdAccountBalanceWallet, MdHourglassEmpty, MdPercent, MdTrendingUp } from "react-icons/md";
import { formatCurrency } from "@/utils/messages";

function StatCard({ icon: Icon, iconBg, value, label, tag, subtitle, subtitleColor }) {
    return (
        <div className="bg-card-light  border border-border-light  rounded-xl p-6 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-28 h-28 ${iconBg} rounded-full -mr-14 -mt-14 opacity-5 group-hover:opacity-10 transition-opacity`} />
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`w-11 h-11 ${iconBg} rounded-full flex items-center justify-center`}>
                    <Icon className="text-xl" />
                </div>
                {tag && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted  px-2 py-0.5 bg-slate-100  rounded">
                        {tag}
                    </span>
                )}
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted  mb-1">{label}</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-text-main  mb-2">{value}</p>
            {subtitle && (
                <p className={`text-xs font-medium flex items-center gap-1 ${subtitleColor || "text-text-muted "}`}>
                    {subtitle}
                </p>
            )}
        </div>
    );
}

/**
 * @param {{ totalEarnings: number, pendingEarnings: number, pendingSessionCount: number, periodStats: object, commissionInfo: { commissionRate: number } }} props
 */
export function EarningsSummaryCards({ totalEarnings, pendingEarnings, pendingSessionCount, periodStats, commissionInfo }) {
    const thisMonthEarnings = periodStats?.thisMonth?.earnings ?? 0;
    const rate = commissionInfo?.commissionRate ?? 0.1;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
                icon={MdAccountBalanceWallet}
                iconBg="bg-emerald-500/20 text-emerald-500"
                label="Total Earnings"
                value={formatCurrency(totalEarnings)}
                tag="All time"
                subtitle={
                    thisMonthEarnings > 0
                        ? <><MdTrendingUp className="text-sm" /> +{formatCurrency(thisMonthEarnings)} this month</>
                        : "No earnings this month"
                }
                subtitleColor={thisMonthEarnings > 0 ? "text-emerald-500" : undefined}
            />
            <StatCard
                icon={MdHourglassEmpty}
                iconBg="bg-amber-500/20 text-amber-500"
                label="Pending"
                value={formatCurrency(pendingEarnings)}
                tag="In escrow"
                subtitle={pendingSessionCount > 0 ? `${pendingSessionCount} session${pendingSessionCount !== 1 ? "s" : ""} awaiting confirmation` : "No pending sessions"}
            />
            <StatCard
                icon={MdPercent}
                iconBg="bg-primary/20 text-primary"
                label="Commission Rate"
                value={`${Math.round(rate * 100)}%`}
                tag="Platform rate"
                subtitle="Platform fee applied per session"
            />
        </div>
    );
}

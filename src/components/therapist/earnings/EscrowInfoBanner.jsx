import { MdInfo } from "react-icons/md";

export default function EscrowInfoBanner({ hasEscrowedPayments }) {
    if (!hasEscrowedPayments) return null;

    return (
        <div className="bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 rounded-xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary shrink-0">
                <MdInfo className="text-xl" />
            </div>
            <div className="flex-1">
                <h4 className="text-sm font-bold text-text-main dark:text-white mb-1">About Escrow Protection</h4>
                <p className="text-sm text-text-muted dark:text-slate-300 leading-relaxed">
                    Payments in escrow are held securely and released after the customer confirms session completion, or automatically after 72 hours.
                </p>
            </div>
        </div>
    );
}

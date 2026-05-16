import { MdSettings, MdAccessTime, MdCheckCircle, MdLocationOn, MdInfo } from "react-icons/md";

// These values mirror the backend env vars OFFER_EXPIRY_HOURS, AUTO_CONFIRM_HOURS,
// and DEFAULT_SERVICE_RADIUS_MILES defined in deploy-backend.yml.
// They are not exposed to the frontend and have no DB-backed config model.
// Commission rate is handled separately via CommissionConfig and CommissionRateCard.
// TODO: When a PlatformConfig table is added to the backend, replace these
// constants with a live fetch from GET /admin/config.
const PLATFORM_SETTINGS = [
    {
        icon: MdAccessTime,
        label: "Offer Expiry",
        value: "48 hours",
        description: "Time before an unaccepted therapist offer expires",
    },
    {
        icon: MdCheckCircle,
        label: "Auto-Confirm Window",
        value: "72 hours",
        description: "Sessions auto-confirm and release payment after this period",
    },
    {
        icon: MdLocationOn,
        label: "Default Service Radius",
        value: "25 miles",
        description: "Default therapist work area radius assigned on signup",
    },
];

/**
 * Read-only display of operational platform configuration.
 * Commission rate is managed separately via CommissionRateCard.
 * These three values are deployment-time env vars with no DB equivalent yet.
 */
export default function PlatformInfoCard() {
    return (
        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MdSettings className="text-primary text-xl" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-text-main dark:text-white uppercase tracking-wider">
                            Operational Defaults
                        </h3>
                        <p className="text-xs text-text-muted dark:text-gray-400 mt-0.5">
                            Read-only — contact engineering to change
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-2 mb-4 px-3 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
                <MdInfo className="text-amber-600 dark:text-amber-400 text-sm mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                    These values are configured at deployment time. To change them, update the backend environment variables and redeploy.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {PLATFORM_SETTINGS.map(({ icon: Icon, label, value, description }) => (
                    <div
                        key={label}
                        className="flex items-start gap-3 p-4 rounded-lg bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark"
                    >
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Icon className="text-primary text-lg" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wider">
                                {label}
                            </p>
                            <p className="text-lg font-black text-text-main dark:text-white mt-0.5">
                                {value}
                            </p>
                            <p className="text-xs text-text-muted dark:text-gray-400 mt-0.5">
                                {description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
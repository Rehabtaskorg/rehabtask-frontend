import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import { MdNotifications, MdEmail, MdSms, MdPhoneAndroid } from "react-icons/md";

const CHANNELS = [
    { icon: MdEmail, label: "Email" },
    { icon: MdSms, label: "SMS" },
    { icon: MdPhoneAndroid, label: "Push Notifications" },
    { icon: MdNotifications, label: "In-App Notifications" },
];

const SAMPLE_NOTIFICATIONS = [
    { title: "RehabTask", body: "New offer near you", time: "now", read: false },
    { title: "RehabTask", body: "Offer status updated", time: "10m ago", read: false },
    { title: "RehabTask", body: "Session reminder — Tomorrow at 10:00 AM", time: "1h ago", read: true },
];

/**
 * "Get updates that matter" feature section — notification channels highlight.
 * Part of the 3-part platform highlights sequence on the therapist landing page.
 */
export function StayInTheLoop() {
    return (
        <section className="py-20 md:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-center">

                    <FadeIn>
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-5">
                            <MdNotifications className="text-xl text-accent-strong" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-accent-strong mb-3">
                            Stay in the loop
                        </p>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-primary leading-tight tracking-tight">
                            Get updates that matter.
                        </h2>
                        <ul className="mt-6 space-y-3">
                            {CHANNELS.map((channel) => (
                                <li key={channel.label} className="flex items-center gap-3 text-sm text-gray-700">
                                    <channel.icon className="text-accent-strong shrink-0 text-lg" />
                                    {channel.label}
                                </li>
                            ))}
                        </ul>
                        <Link
                            href="/register/therapist"
                            className="group inline-flex items-center gap-2 mt-8 px-6 py-3 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Join as a Therapist
                            <span className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true">&rarr;</span>
                        </Link>
                    </FadeIn>

                    <FadeIn delay={0.15} className="bg-gray-900 rounded-2xl p-6 shadow-xl max-w-sm mx-auto lg:max-w-none">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-white text-2xl font-bold">9:41</p>
                            <p className="text-gray-400 text-xs">Monday, June 10</p>
                        </div>
                        <div className="space-y-3">
                            {SAMPLE_NOTIFICATIONS.map((notif, i) => (
                                <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-3 flex items-start gap-3">
                                    <div className="w-7 h-7 rounded-full bg-accent-strong flex items-center justify-center shrink-0">
                                        <span className="text-white text-[10px] font-bold">RT</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-white text-xs font-semibold">{notif.title}</p>
                                            <p className="text-gray-400 text-[10px] shrink-0">{notif.time}</p>
                                        </div>
                                        <p className="text-gray-300 text-[11px] mt-0.5 truncate">{notif.body}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
}
import { MdCheckCircle } from "react-icons/md";
import { formatDate, formatTime } from "@/utils/dates";

/**
 * Vertical timeline showing the progression of a customer therapy request.
 *
 * @param {Object}   props
 * @param {Object}   props.request
 * @param {Array}    props.offers
 */
export default function RequestTimeline({ request, offers }) {
    const statusOrder = ["created", "offers_received", "offers_accepted", "completed"];
    const currentIdx = statusOrder.indexOf(request.status);

    return (
        <section className="bg-card-light  rounded-xl p-6 shadow-sm border border-border-light ">
            <h3 className="text-lg font-bold text-text-main  mb-6">Request Timeline</h3>
            <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-slate-100 ">
                <TimelineStep
                    completed={currentIdx >= 0}
                    label="Request Created"
                    date={`${formatDate(request.createdAt)} · ${formatTime(request.createdAt)}`}
                />
                <TimelineStep
                    completed={currentIdx >= 1}
                    current={currentIdx === 0}
                    label="Offers Received"
                    date={offers.length > 0 ? `${offers.length} offer${offers.length > 1 ? "s" : ""}` : null}
                />
                <TimelineStep
                    completed={currentIdx >= 2}
                    current={currentIdx === 1}
                    label="Offer Accepted"
                />
                <TimelineStep
                    completed={currentIdx >= 3}
                    current={currentIdx === 2}
                    label="Session Scheduled"
                />
                <TimelineStep
                    completed={request.status === "completed"}
                    current={currentIdx === 3}
                    label="Completed"
                />
            </div>
        </section>
    );
}

/**
 * @param {Object}  props
 * @param {boolean} props.completed
 * @param {boolean} [props.current]
 * @param {string}  props.label
 * @param {string}  [props.date]
 */
function TimelineStep({ completed, current, label, date }) {
    return (
        <div className="relative flex items-start gap-4">
            <div className={`z-10 h-6 w-6 rounded-full flex items-center justify-center ring-4 ring-card-light  shrink-0 ${
                completed
                    ? "bg-emerald-500 text-white"
                    : current
                        ? "bg-primary text-white"
                        : "bg-slate-200  border-2 border-slate-300 "
            }`}>
                {completed && <MdCheckCircle className="text-sm" />}
                {current && !completed && <div className="h-2 w-2 rounded-full bg-white" />}
            </div>
            <div>
                <p className={`font-bold text-sm ${completed ? "text-text-main " : current ? "text-primary" : "text-slate-400 "}`}>
                    {label}
                </p>
                {date && <p className="text-xs text-text-muted  mt-0.5">{date}</p>}
                {current && !date && <p className="text-xs text-slate-400 italic mt-0.5">Pending...</p>}
            </div>
        </div>
    );
}
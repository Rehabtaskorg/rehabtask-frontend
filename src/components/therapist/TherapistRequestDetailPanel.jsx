"use client";

import {
    MdLocationOn, MdSend, MdChatBubble, MdCheckCircle,
    MdWarning, MdError, MdAccessTime, MdOpenInNew,
    MdCalendarToday, MdSchedule,
} from "react-icons/md";
import { useVisitTypes } from "@/hooks/useVisitTypes";

const nowLocalISO = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const getServiceTypeStyle = (serviceType) => {
    const st = serviceType?.toLowerCase() || "";
    if (st.includes("physical") || st.includes("pt"))
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    if (st.includes("occupational") || st.includes("ot"))
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
    if (st.includes("speech") || st.includes("slp"))
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
    return "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300";
};

const timeAgo = (dateStr) => {
    if (!dateStr) return "—";
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return days === 1 ? "Yesterday" : `${days}d ago`;
};

/** Resolve the customer's requested visit type label (FK first, legacy string fallback). */
const requestVisitTypeLabel = (request) => {
    if (request?.visitTypeRef) return `${request.visitTypeRef.name} (${request.visitTypeRef.code})`;
    if (request?.visitType) return request.visitType;
    return null;
};

export default function TherapistRequestDetailPanel({
    request,
    myOffer,
    offerData,
    setOfferData,
    commissionRate,
    submitting,
    offerSuccess,
    offerError,
    onSubmitOffer,
    onReviseOffer,
    onMessageCustomer,
    onSendNewOffer,
    onClose,
    router,
}) {
    const earnPct = commissionRate !== null ? `${Math.round((1 - commissionRate) * 100)}` : "90";

    const visitTypeLabel = requestVisitTypeLabel(request);

    return (
        <div className="flex-1 overflow-y-auto panel-scroll">
            <div className="p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">

                {/* ── Request Header ── */}
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${getServiceTypeStyle(request.serviceType)}`}>
                            {request.serviceType}
                        </span>
                        <span className="text-sm text-text-muted dark:text-slate-400">{timeAgo(request.createdAt)}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-text-main dark:text-white tracking-tight mb-2">
                        {request.description?.split("\n")[0] || request.serviceType}
                    </h2>
                    <div className="flex flex-wrap gap-4 text-sm text-text-muted dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                            <MdLocationOn className="text-primary" />
                            {request.location || "Location not specified"}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <MdCalendarToday className="text-primary" />
                            {request.preferredDate
                                ? new Date(request.preferredDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                : "Flexible"}
                        </span>
                    </div>
                </div>

                {/* ── Description ── */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-border-light dark:border-border-dark">
                    <p className="text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-2">Case Description</p>
                    <p className="text-sm text-text-main dark:text-gray-300 leading-relaxed">{request.description}</p>
                </div>

                {/* Patient identity hidden from therapist pre-booking */}

                {/* ── Metadata Grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border border-border-light dark:border-border-dark">
                        <p className="text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest">Preferred Date</p>
                        <p className="text-sm font-semibold text-text-main dark:text-white mt-1">
                            {request.preferredDate ? new Date(request.preferredDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Flexible"}
                        </p>
                    </div>
                    <div className="p-3 rounded-lg border border-border-light dark:border-border-dark">
                        <p className="text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest">Total Offers</p>
                        <p className="text-sm font-semibold text-text-main dark:text-white mt-1">
                            {request.offers?.length || 0} offer{request.offers?.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                    {request.rate != null && (
                        <div className="p-3 rounded-lg border border-border-light dark:border-border-dark">
                            <p className="text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest">Rate per Visit</p>
                            <p className="text-sm font-semibold text-text-main dark:text-white mt-1">${parseFloat(request.rate).toFixed(2)}</p>
                        </div>
                    )}
                    {visitTypeLabel && (
                        <div className="p-3 rounded-lg border border-border-light dark:border-border-dark">
                            <p className="text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest">Visit Type</p>
                            <p className="text-sm font-semibold text-text-main dark:text-white mt-1">{visitTypeLabel}</p>
                        </div>
                    )}
                    {request.emr && (
                        <div className="p-3 rounded-lg border border-border-light dark:border-border-dark">
                            <p className="text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest">EMR System</p>
                            <p className="text-sm font-semibold text-text-main dark:text-white mt-1">{request.emr}</p>
                        </div>
                    )}
                    {request.visitsPerWeek && request.numberOfWeeks && (
                        <div className="p-3 rounded-lg border border-border-light dark:border-border-dark">
                            <p className="text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest">Frequency</p>
                            <p className="text-sm font-semibold text-text-main dark:text-white mt-1">
                                {request.visitsPerWeek}x/week · {request.numberOfWeeks} weeks ({request.visitsPerWeek * request.numberOfWeeks} visits)
                            </p>
                        </div>
                    )}
                </div>

                <a href={`/therapist/requests/${request.id}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                    <MdOpenInNew className="text-base" />
                    View Full Details
                </a>

                {/* ── Offer States ── */}
                <div className="pt-6 border-t border-border-light dark:border-border-dark">
                    {renderOfferState({
                        request, myOffer, offerData, setOfferData,
                        earnPct, submitting, offerSuccess, offerError,
                        onSubmitOffer, onReviseOffer, onMessageCustomer, onSendNewOffer, router,
                    })}
                </div>
            </div>
        </div>
    );
}

// ─── Offer State Renderer ───────────────────────────────────

function renderOfferState({
    request, myOffer, offerData, setOfferData,
    earnPct, submitting, offerSuccess, offerError,
    onSubmitOffer, onReviseOffer, onMessageCustomer, onSendNewOffer, router,
}) {
    // State 1: No offer — show form
    if (!myOffer) return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="font-bold text-lg text-text-main dark:text-white">Send Offer</h4>
                <span className="text-xs font-medium text-text-muted italic">You earn {earnPct}% of rate</span>
            </div>
            {offerSuccess && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                    <MdCheckCircle className="text-emerald-600 shrink-0" />
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium">Offer sent successfully!</p>
                </div>
            )}
            {offerError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <MdError className="text-red-600 shrink-0" />
                    <p className="text-sm text-red-800 dark:text-red-300">{offerError}</p>
                </div>
            )}
            <OfferForm
                request={request}
                offerData={offerData}
                setOfferData={setOfferData}
                submitting={submitting}
                onSubmit={onSubmitOffer}
                submitLabel="Submit Offer"
            />
        </div>
    );

    // State 2: Pending
    if (myOffer.status === "pending") return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/50 rounded-xl">
                <MdAccessTime className="text-emerald-600 text-xl shrink-0" />
                <div>
                    <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">Offer Pending</p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">Awaiting customer response</p>
                </div>
            </div>
            <div className="p-4 rounded-xl border border-border-light dark:border-border-dark space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <p className="text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase">Your Rate</p>
                        <p className="text-base font-bold text-primary mt-0.5">${parseFloat(myOffer.rate).toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase">Session Type</p>
                        <p className="text-sm font-semibold text-text-main dark:text-white mt-0.5 capitalize">{myOffer.sessionType}</p>
                    </div>
                </div>
                {myOffer.visitTypeRef && (
                    <div>
                        <p className="text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase">Visit Type</p>
                        <p className="text-sm font-semibold text-text-main dark:text-white mt-0.5">{myOffer.visitTypeRef.name} ({myOffer.visitTypeRef.code})</p>
                    </div>
                )}
                <div>
                    <p className="text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase">Proposed Date</p>
                    <p className="text-sm font-semibold text-text-main dark:text-white mt-0.5">{myOffer.proposedDate ? new Date(myOffer.proposedDate).toLocaleString() : "—"}</p>
                </div>
                {myOffer.expiresAt && (
                    <div>
                        <p className="text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase">Expires</p>
                        <p className="text-sm font-semibold text-text-main dark:text-white mt-0.5">{new Date(myOffer.expiresAt).toLocaleString()}</p>
                    </div>
                )}
            </div>
            <div className="space-y-2">
                <button onClick={() => onMessageCustomer(myOffer.id)} className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors">
                    <MdChatBubble className="text-lg" /> Message Customer
                </button>
                <button onClick={() => alert("Withdraw offer feature coming soon")} className="w-full flex items-center justify-center gap-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 py-2.5 rounded-lg font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    Withdraw Offer
                </button>
            </div>
        </div>
    );

    // State 3: Change requested
    if (myOffer.status === "change_requested") return (
        <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-xl">
                <MdWarning className="text-amber-600 text-xl shrink-0 mt-0.5" />
                <div>
                    <p className="font-bold text-amber-800 dark:text-amber-300 text-sm">Change Requested</p>
                    {myOffer.changeRequestNote && (
                        <div className="mt-2 pl-3 border-l-2 border-amber-300 dark:border-amber-600">
                            <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">&quot;{myOffer.changeRequestNote}&quot;</p>
                        </div>
                    )}
                </div>
            </div>
            <button onClick={() => onMessageCustomer(myOffer.id)} className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors">
                <MdChatBubble className="text-lg" /> Message Customer
            </button>
            <div className="pt-4 border-t border-border-light dark:border-border-dark">
                <p className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase mb-3">Update Your Offer</p>
                <OfferForm
                    request={request}
                    offerData={offerData}
                    setOfferData={setOfferData}
                    submitting={submitting}
                    onSubmit={onReviseOffer}
                    submitLabel="Update Offer"
                    submitClassName="bg-amber-600 hover:bg-amber-700"
                    error={offerError}
                />
            </div>
        </div>
    );

    // State 4: Accepted
    if (myOffer.status === "accepted") return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/50 rounded-xl">
                <MdCheckCircle className="text-emerald-600 text-xl shrink-0" />
                <div>
                    <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">Offer Accepted!</p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">A booking has been created</p>
                </div>
            </div>
            <div className="p-4 rounded-xl border border-border-light dark:border-border-dark">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <p className="text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase">Rate</p>
                        <p className="text-base font-bold text-primary mt-0.5">${parseFloat(myOffer.rate).toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase">Your Payout</p>
                        <p className="text-base font-bold text-emerald-600 mt-0.5">${(parseFloat(myOffer.rate) * 0.9).toFixed(2)}</p>
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <button onClick={() => onMessageCustomer(myOffer.id)} className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors">
                    <MdChatBubble className="text-lg" /> Message Customer
                </button>
                <button onClick={() => router.push("/therapist/bookings")} className="w-full border border-primary text-primary py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/5 transition-colors">
                    View My Bookings
                </button>
            </div>
        </div>
    );

    // State 5: Rejected / Expired / Withdrawn
    const statusLabels = { rejected: "Offer Rejected", expired: "Offer Expired", withdrawn: "Offer Withdrawn" };
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-border-light dark:border-border-dark rounded-xl">
                <MdError className="text-slate-400 text-xl shrink-0" />
                <div>
                    <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">{statusLabels[myOffer.status] || "Offer Inactive"}</p>
                    <p className="text-xs text-text-muted mt-0.5">You can send a new offer for this request</p>
                </div>
            </div>
            <button onClick={onSendNewOffer} className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                <MdSend className="text-lg" /> Send New Offer
            </button>
        </div>
    );
}

// ─── Shared Offer Form ──────────────────────────────────────

function OfferForm({ request, offerData, setOfferData, submitting, onSubmit, submitLabel, submitClassName, error }) {
    // Visit types filtered by the REQUEST's service type (not the therapist's license).
    // Therapist audience — all codes visible including MV, supervisory, etc.
    const { data: visitTypes = [] } = useVisitTypes({
        serviceType: request?.serviceType,
        audience: "therapist",
    });

    // Resolve the customer's requested visit type for the "Customer requested:" banner.
    const customerVTLabel = requestVisitTypeLabel(request);

    // Find the selected override visit type name for the side-by-side preview.
    const overrideVT = offerData.planOverrideEnabled && offerData.visitTypeId
        ? visitTypes.find((vt) => vt.id === offerData.visitTypeId)
        : null;

    return (
        <form onSubmit={onSubmit} className="p-5 rounded-xl border-2 border-primary/20 bg-primary/5 dark:bg-primary/5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-muted dark:text-gray-400 uppercase">Rate per Session</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-mono text-sm">$</span>
                        <input
                            type="number" step="0.01" min="1" required placeholder="0.00"
                            value={offerData.rate}
                            onChange={(e) => setOfferData((prev) => ({ ...prev, rate: e.target.value }))}
                            className="w-full pl-7 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-main dark:text-white font-mono text-sm py-2 pr-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-muted dark:text-gray-400 uppercase">Session Type</label>
                    <div className="flex bg-white dark:bg-card-dark rounded-lg p-1 border border-border-light dark:border-border-dark gap-1">
                        {["in-person", "virtual"].map((type) => (
                            <button
                                key={type} type="button"
                                onClick={() => setOfferData((prev) => ({ ...prev, sessionType: type }))}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${offerData.sessionType === type
                                    ? "bg-primary text-white"
                                    : "text-text-muted hover:bg-slate-100 dark:hover:bg-slate-700"
                                }`}
                            >
                                {type === "in-person" ? "In-Person" : "Virtual"}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-muted dark:text-gray-400 uppercase">
                    Attempted Visit Rate ($) <span className="text-text-muted/70 font-normal normal-case">— optional</span>
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-mono text-sm">$</span>
                    <input
                        type="number" step="0.01" min="0" max={offerData.rate || 10000}
                        placeholder="Blank = no charge"
                        value={offerData.attemptedVisitRate ?? ""}
                        onChange={(e) => setOfferData((prev) => ({ ...prev, attemptedVisitRate: e.target.value }))}
                        className="w-full pl-7 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-main dark:text-white font-mono text-sm py-2 pr-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <p className="text-[10px] text-text-muted dark:text-gray-500">Charged when you arrive but patient isn&apos;t home. Must be ≤ session rate.</p>
            </div>
            <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-muted dark:text-gray-400 uppercase">Proposed First Session</label>
                <input
                    type="datetime-local" required
                    min={nowLocalISO()}
                    value={offerData.proposedDate}
                    onChange={(e) => setOfferData((prev) => ({ ...prev, proposedDate: e.target.value }))}
                    className="w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-main dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>
            <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-muted dark:text-gray-400 uppercase">Message to Client</label>
                <textarea
                    required rows={3}
                    value={offerData.description}
                    onChange={(e) => setOfferData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Explain your experience with this condition and your approach..."
                    className="w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-main dark:text-white text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            {/* Visit Plan Override — optional counter-proposal to the customer's plan */}
            <div className="rounded-lg border border-border-light dark:border-border-dark p-3 space-y-3 bg-white dark:bg-card-dark">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={!!offerData.planOverrideEnabled}
                        onChange={(e) => setOfferData((prev) => ({ ...prev, planOverrideEnabled: e.target.checked }))}
                        className="mt-0.5 accent-primary"
                    />
                    <span className="text-xs font-bold text-text-main dark:text-white">
                        Propose a different treatment plan
                        <span className="block text-[10px] font-normal text-text-muted dark:text-gray-400 mt-0.5">
                            Leave unchecked to accept the customer&apos;s plan as-is.
                        </span>
                    </span>
                </label>

                {offerData.planOverrideEnabled && (
                    <div className="space-y-3 pl-6 pt-1">
                        {/* Customer's original plan reference */}
                        {request && (customerVTLabel || (request.visitsPerWeek && request.numberOfWeeks)) && (
                            <p className="text-[10px] text-text-muted dark:text-gray-400 italic">
                                Customer requested: {customerVTLabel || "—"}
                                {request.visitsPerWeek && request.numberOfWeeks && (
                                    <> · {request.visitsPerWeek}×/week × {request.numberOfWeeks}wk ({request.visitsPerWeek * request.numberOfWeeks} visits)</>
                                )}
                            </p>
                        )}

                        {/* Visit Type override — dropdown backed by visit_types catalog */}
                        <div>
                            <label className="block text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-1">Visit Type</label>
                            <select
                                value={offerData.visitTypeId || ""}
                                onChange={(e) => setOfferData((prev) => ({ ...prev, visitTypeId: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-card-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-main dark:text-white text-sm outline-none"
                            >
                                <option value="">— Same as customer&apos;s request —</option>
                                {visitTypes.map((vt) => (
                                    <option key={vt.id} value={vt.id}>{vt.name} ({vt.code})</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-1">Visits/Week</label>
                                <select
                                    value={offerData.visitsPerWeek || ""}
                                    onChange={(e) => setOfferData((prev) => ({ ...prev, visitsPerWeek: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-card-dark border border-border-light dark:border-border-dark text-text-main dark:text-white text-sm outline-none"
                                >
                                    <option value="">—</option>
                                    {[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-1">Weeks</label>
                                <select
                                    value={offerData.numberOfWeeks || ""}
                                    onChange={(e) => setOfferData((prev) => ({ ...prev, numberOfWeeks: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-card-dark border border-border-light dark:border-border-dark text-text-main dark:text-white text-sm outline-none"
                                >
                                    <option value="">—</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Live preview of the proposed plan */}
                        {(overrideVT || (offerData.visitsPerWeek && offerData.numberOfWeeks)) && (
                            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
                                    You propose: {overrideVT ? `${overrideVT.name} (${overrideVT.code})` : (customerVTLabel || "—")}
                                    {offerData.visitsPerWeek && offerData.numberOfWeeks && (
                                        <> · {offerData.visitsPerWeek}×/week × {offerData.numberOfWeeks} weeks ({parseInt(offerData.visitsPerWeek, 10) * parseInt(offerData.numberOfWeeks, 10)} visits total)</>
                                    )}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-lg p-3">
                <p className="text-xs text-blue-800 dark:text-blue-300">Your offer will be valid for 48 hours. The customer will be notified and can accept within this period.</p>
            </div>
            <button
                type="submit" disabled={submitting}
                className={`w-full text-white py-3 rounded-lg font-bold text-sm shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${submitClassName || "bg-primary hover:bg-primary/90"}`}
            >
                <MdSend className="text-lg" />
                {submitting ? "Sending..." : submitLabel}
            </button>
        </form>
    );
}

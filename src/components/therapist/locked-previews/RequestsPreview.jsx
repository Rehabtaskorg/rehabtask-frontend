const ServiceBadge = ({ color, width }) => (
    <div className={`h-5 ${width} ${color} rounded-full`} />
);

const RequestCard = ({ hasPatient }) => (
    <div className="bg-card-light  border border-border-light  rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
            <ServiceBadge color="bg-blue-200 " width="w-28" />
            <div className="h-4 w-20 bg-slate-200  rounded" />
        </div>
        <div className="h-4 w-3/4 bg-slate-100  rounded" />
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-slate-200 " />
                <div className="h-3 w-24 bg-slate-100  rounded" />
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-slate-200 " />
                <div className="h-3 w-20 bg-slate-100  rounded" />
            </div>
            <div className="h-3 w-16 bg-slate-100  rounded" />
        </div>
        {hasPatient && <div className="h-5 w-32 bg-amber-100  rounded-full" />}
        <div className="flex justify-end">
            <div className="h-8 w-24 bg-primary/10 rounded-lg" />
        </div>
    </div>
);

export default function RequestsPreview() {
    return (
        <div className="flex h-[calc(100vh-8rem)]" aria-hidden="true">
            {/* Filters sidebar */}
            <div className="hidden lg:block w-60 border-r border-border-light  p-4 space-y-5">
                <div className="h-5 w-24 bg-slate-200  rounded" />
                <div className="space-y-2">
                    {["Physical Therapy", "Occupational", "Speech-Lang", "Other"].map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded border border-slate-300 " />
                            <div className={`h-3 ${i === 0 ? "w-24" : i === 1 ? "w-28" : i === 2 ? "w-24" : "w-12"} bg-slate-200  rounded`} />
                        </div>
                    ))}
                </div>
                <div className="space-y-2">
                    <div className="h-4 w-16 bg-slate-200  rounded" />
                    <div className="h-9 w-full bg-slate-100  rounded-lg border border-border-light " />
                </div>
                <div className="h-9 w-full bg-primary/20 rounded-lg" />
            </div>

            {/* Request list */}
            <div className="flex-1 p-4 space-y-3 overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                    <div className="h-4 w-32 bg-slate-200  rounded" />
                    <div className="h-8 w-28 bg-slate-100  rounded-lg border border-border-light " />
                </div>
                <RequestCard hasPatient={false} />
                <RequestCard hasPatient={true} />
                <RequestCard hasPatient={false} />
                <RequestCard hasPatient={true} />
            </div>

            {/* Detail sidebar */}
            <div className="hidden lg:block w-96 border-l border-border-light  p-5 space-y-4">
                <div className="h-6 w-32 bg-slate-200  rounded" />
                <div className="space-y-3">
                    <div className="h-4 w-full bg-slate-100  rounded" />
                    <div className="h-4 w-2/3 bg-slate-100  rounded" />
                </div>
                <div className="border-t border-border-light  pt-4 space-y-3">
                    <div className="h-4 w-20 bg-slate-200  rounded" />
                    <div className="h-10 w-full bg-slate-100  rounded-lg border border-border-light " />
                    <div className="h-4 w-24 bg-slate-200  rounded" />
                    <div className="flex gap-2">
                        <div className="h-9 flex-1 bg-primary/10 rounded-lg" />
                        <div className="h-9 flex-1 bg-slate-100  rounded-lg" />
                    </div>
                    <div className="h-20 w-full bg-slate-100  rounded-lg border border-border-light " />
                    <div className="h-10 w-full bg-primary/20 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

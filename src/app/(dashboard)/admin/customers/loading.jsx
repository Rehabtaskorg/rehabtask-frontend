export default function Loading() {
    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5 animate-pulse">
            <div className="h-7 w-56 bg-slate-200 rounded" />
            <div className="h-4 w-80 bg-slate-100 rounded" />
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="h-11 bg-slate-50 border-b border-slate-200" />
                <div className="p-4 border-b border-slate-200 flex gap-3">
                    <div className="h-8 w-20 bg-slate-100 rounded-full" />
                    <div className="h-8 w-24 bg-slate-100 rounded-full" />
                    <div className="h-8 w-20 bg-slate-100 rounded-full" />
                    <div className="ml-auto h-8 w-64 bg-slate-100 rounded-lg" />
                </div>
                <div className="p-4 space-y-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-12 bg-slate-100 rounded" />
                    ))}
                </div>
            </div>
        </div>
    );
}
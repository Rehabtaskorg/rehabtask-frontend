export default function Loading() {
    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-pulse">
            <div className="h-5 w-40 bg-slate-200 rounded" />
            <div className="h-56 bg-slate-200 rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="h-40 bg-slate-200 rounded-xl" />
                    <div className="h-40 bg-slate-200 rounded-xl" />
                </div>
                <div className="h-64 bg-slate-200 rounded-xl" />
            </div>
        </div>
    );
}
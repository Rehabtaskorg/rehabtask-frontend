export default function Loading() {
    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5 animate-pulse">
            <div className="h-6 w-32 bg-slate-200 rounded" />
            <div className="h-36 bg-slate-200 rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="h-52 bg-slate-200 rounded-xl" />
                <div className="h-52 bg-slate-200 rounded-xl" />
            </div>
            <div className="h-44 bg-slate-200 rounded-xl" />
            <div className="h-40 bg-slate-200 rounded-xl" />
        </div>
    );
}
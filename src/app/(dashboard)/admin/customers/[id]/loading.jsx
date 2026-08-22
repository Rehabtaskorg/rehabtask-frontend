export default function Loading() {
    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5 animate-pulse">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="h-8 w-64 bg-slate-200 rounded" />
            <div className="h-20 bg-slate-100 rounded-xl" />
            <div className="h-40 bg-slate-100 rounded-xl" />
            <div className="h-56 bg-slate-100 rounded-xl" />
            <div className="h-40 bg-slate-100 rounded-xl" />
        </div>
    );
}
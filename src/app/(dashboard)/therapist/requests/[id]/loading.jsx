export default function TherapistRequestDetailLoading() {
    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
            <div className="animate-pulse space-y-4">
                <div className="h-5 w-32 bg-slate-200 rounded" />
                <div className="h-10 w-64 bg-slate-200 rounded" />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 space-y-4">
                        <div className="h-48 bg-card-light border border-border-light rounded-xl" />
                        <div className="h-32 bg-card-light border border-border-light rounded-xl" />
                    </div>
                    <div className="lg:col-span-4">
                        <div className="h-96 bg-card-light border border-border-light rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}

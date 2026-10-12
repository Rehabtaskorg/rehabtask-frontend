/**
 * Loading placeholder matching the profile page's header, tab bar and card grid.
 */
export function CustomerProfileSkeleton() {
    return (
        <div className="p-4 md:p-6">
            <div className="animate-pulse space-y-6">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-gray-200" />
                    <div className="space-y-2">
                        <div className="h-6 w-48 rounded bg-gray-200" />
                        <div className="h-4 w-64 rounded bg-gray-200" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="h-10 w-24 rounded-lg bg-gray-200" />
                    <div className="h-10 w-28 rounded-lg bg-gray-200" />
                    <div className="h-10 w-36 rounded-lg bg-gray-200" />
                    <div className="h-10 w-28 rounded-lg bg-gray-200" />
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="h-96 rounded-xl bg-gray-200 lg:col-span-2" />
                    <div className="h-56 rounded-xl bg-gray-200" />
                </div>
            </div>
        </div>
    );
}

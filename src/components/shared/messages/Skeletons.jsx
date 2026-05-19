export function ConversationSkeleton() {
    return (
        <div className="flex items-center gap-3 px-4 py-3 animate-pulse border-l-4 border-transparent">
            <div className="h-12 w-12 rounded-full bg-gray-200  shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200  rounded w-3/4" />
                <div className="h-3 bg-gray-200  rounded w-1/2" />
            </div>
            <div className="h-3 w-10 bg-gray-200  rounded shrink-0" />
        </div>
    );
}

export function MessageSkeleton() {
    return (
        <div className="flex flex-col gap-4 p-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className={`flex items-end gap-2 ${i % 2 === 0 ? '' : 'flex-row-reverse'} animate-pulse`}>
                    <div className="h-8 w-8 rounded-full bg-gray-200  shrink-0" />
                    <div className={`h-10 rounded-xl bg-gray-200  ${i % 2 === 0 ? 'w-48' : 'w-36'}`} />
                </div>
            ))}
        </div>
    );
}

export function RightSidebarSkeleton() {
    return (
        <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="h-24 w-24 rounded-full bg-gray-200 " />
            <div className="h-4 w-32 bg-gray-200  rounded" />
            <div className="h-3 w-20 bg-gray-200  rounded" />
            <div className="w-full h-px bg-gray-200  my-2" />
            <div className="w-full space-y-3">
                <div className="h-3 w-24 bg-gray-200  rounded" />
                <div className="h-16 w-full bg-gray-200  rounded-lg" />
            </div>
        </div>
    );
}
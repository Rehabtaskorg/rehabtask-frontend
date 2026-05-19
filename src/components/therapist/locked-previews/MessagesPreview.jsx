const ConversationItem = ({ unread }) => (
    <div className={`flex items-center gap-3 px-4 py-3 border-b border-border-light  ${unread ? "bg-primary/5" : ""}`}>
        <div className="w-10 h-10 rounded-full bg-primary/10 shrink-0" />
        <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center justify-between">
                <div className="h-4 w-28 bg-slate-200  rounded" />
                <div className="h-3 w-10 bg-slate-100  rounded" />
            </div>
            <div className="h-3 w-full bg-slate-100  rounded" />
        </div>
        {unread && <div className="w-5 h-5 rounded-full bg-primary/20 shrink-0" />}
    </div>
);

const ChatBubble = ({ sent, width }) => (
    <div className={`flex ${sent ? "justify-end" : "justify-start"} mb-3`}>
        <div className={`rounded-2xl px-4 py-2.5 max-w-[70%] ${sent
            ? "bg-primary/15 "
            : "bg-slate-100 "
            }`}>
            <div className={`h-3 ${width} bg-slate-200  rounded`} />
            {width === "w-48" && <div className="h-3 w-32 bg-slate-200  rounded mt-1.5" />}
        </div>
    </div>
);

export default function MessagesPreview() {
    return (
        <div className="flex h-[calc(100vh-8rem)] border border-border-light  rounded-xl overflow-hidden" aria-hidden="true">
            {/* Conversation list */}
            <div className="w-80 border-r border-border-light  bg-background-light/30  shrink-0">
                {/* Filter tabs */}
                <div className="flex gap-1 p-3 border-b border-border-light ">
                    {["All", "Unread", "Active Offers"].map((tab, i) => (
                        <div key={tab} className={`h-7 px-3 rounded-full ${i === 0 ? "bg-primary/20" : "bg-slate-100 "}`}>
                            <div className={`h-3 mt-1.5 ${i === 2 ? "w-16" : "w-10"} ${i === 0 ? "bg-primary/30" : "bg-slate-200 "} rounded`} />
                        </div>
                    ))}
                </div>
                <ConversationItem unread={true} />
                <ConversationItem unread={true} />
                <ConversationItem unread={false} />
                <ConversationItem unread={false} />
                <ConversationItem unread={false} />
                <ConversationItem unread={false} />
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col bg-card-light  min-w-0">
                {/* Chat header */}
                <div className="flex items-center gap-3 px-5 py-3 border-b border-border-light ">
                    <div className="w-9 h-9 rounded-full bg-primary/10 shrink-0" />
                    <div className="h-5 w-32 bg-slate-200  rounded" />
                    <div className="ml-auto h-7 w-24 bg-primary/10 rounded-lg" />
                </div>

                {/* Messages */}
                <div className="flex-1 p-5 overflow-hidden">
                    <ChatBubble sent={false} width="w-48" />
                    <ChatBubble sent={true} width="w-36" />
                    <ChatBubble sent={false} width="w-32" />
                    <ChatBubble sent={true} width="w-48" />
                    <ChatBubble sent={false} width="w-28" />
                    <ChatBubble sent={true} width="w-40" />
                </div>

                {/* Input */}
                <div className="px-5 py-3 border-t border-border-light ">
                    <div className="h-10 w-full bg-slate-100  rounded-xl border border-border-light " />
                </div>
            </div>

            {/* Right sidebar */}
            <div className="hidden lg:block w-72 border-l border-border-light  bg-background-light/30  p-5 space-y-4">
                <div className="h-5 w-28 bg-slate-200  rounded" />
                <div className="bg-card-light  border border-border-light  rounded-xl p-4 space-y-3">
                    <div className="h-4 w-20 bg-slate-200  rounded" />
                    <div className="h-3 w-full bg-slate-100  rounded" />
                    <div className="h-3 w-2/3 bg-slate-100  rounded" />
                    <div className="h-6 w-20 bg-amber-100  rounded-full" />
                </div>
            </div>
        </div>
    );
}

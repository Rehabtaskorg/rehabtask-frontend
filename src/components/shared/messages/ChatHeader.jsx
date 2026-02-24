import UserAvatar from "../../ui/UserAvatar";
import { getPhotoUrl, getContextBadge } from "@/utils/messages";

export default function ChatHeader({ selected, selectedConversation, onBack, headerActions }) {
    const badge = selected ? getContextBadge(selected.type) : null;

    return (
        <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark shrink-0">
            <div className="flex items-center gap-3 min-w-0">
                <button onClick={onBack} className="md:hidden flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted-light dark:hover:bg-muted-dark transition-colors text-text-muted dark:text-gray-400 shrink-0" aria-label="Back to conversations">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <UserAvatar
                    name={selected.name}
                    photoUrl={getPhotoUrl(selectedConversation?.otherUser)}
                    size="md"
                />
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-text-main dark:text-white truncate">{selected.name}</h3>
                        {badge && <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${badge.className}`}>{badge.label}</span>}
                    </div>
                    <p className="text-xs text-text-muted dark:text-gray-400">
                        {selected.type === 'booking' ? 'Booking Conversation' : selected.type === 'offer' ? 'Offer Conversation' : 'Request Conversation'}
                    </p>
                </div>
            </div>
            {headerActions && (
                <div className="flex items-center gap-2 shrink-0 ml-3">
                    {headerActions}
                </div>
            )}
        </div>
    )

}
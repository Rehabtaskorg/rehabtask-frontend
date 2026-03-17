import UserAvatar from "../../ui/UserAvatar";
import { getDisplayName, getPhotoUrl, getContextBadge, formatTime } from "@/utils/messages";

export default function ConversationListItem({ conversation, isSelected, onSelect }) {
    const name = getDisplayName(conversation.otherUser);
    const badge = getContextBadge(conversation.currentContext?.type);
    const hasUnread = conversation.unreadCount > 0;

    return (
        <li
            onClick={() => onSelect(conversation)}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-l-4 ${isSelected ? 'border-primary bg-primary/10 dark:bg-primary/20' : 'border-transparent hover:bg-muted-light dark:hover:bg-muted-dark'}`}
        >
            <div className="relative shrink-0">
                <UserAvatar
                    name={name}
                    photoUrl={getPhotoUrl(conversation.otherUser)}
                    size="lg"
                />
                {hasUnread && (
                    <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary border-2 border-white dark:border-card-dark" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <p className={`text-sm truncate ${hasUnread ? 'font-bold' : 'font-medium'} text-text-main dark:text-white`}>{name}</p>
                        {badge && <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${badge.className}`}>{badge.label}</span>}
                    </div>
                    <span className="shrink-0 text-[10px] text-text-muted dark:text-gray-500">{formatTime(conversation.lastMessage?.createdAt)}</span>
                </div>
                {conversation.patient && (
                    <p className="text-[11px] text-primary font-medium mb-0.5 truncate">Patient: {conversation.patient.fullName}</p>
                )}
                <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs truncate ${hasUnread ? 'text-text-main dark:text-gray-200 font-medium' : 'text-text-muted dark:text-gray-400'}`}>
                        {conversation.lastMessage?.content || 'No messages yet'}
                    </p>
                    {hasUnread && (
                        <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                            {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </li>
    )

}
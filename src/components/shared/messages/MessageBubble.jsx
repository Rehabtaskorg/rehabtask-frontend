import UserAvatar from "../../ui/UserAvatar";
import SessionOfferWidget from "./SessionOfferWidget";
import { getDisplayName, getPhotoUrl, formatMessageTime, formatDateSeparator, shouldShowDateSeparator } from "@/utils/messages";

function DateSeparator({ label }) {
    return (
        <div className="flex items-center justify-center my-4">
            <div className="h-px bg-border-light dark:bg-border-dark flex-1" />
            <span className="mx-3 text-[10px] font-semibold text-text-muted dark:text-gray-500 uppercase tracking-widest">{label}</span>
            <div className="h-px bg-border-light dark:bg-border-dark flex-1" />
        </div>
    );
}

function SystemMessage({ content }) {
    return (
        <div className="flex items-center justify-center my-4">
            <div className="h-px bg-border-light dark:bg-border-dark flex-1" />
            <span className="mx-3 text-[10px] font-semibold text-text-muted dark:text-gray-500 uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-full">{content}</span>
            <div className="h-px bg-border-light dark:bg-border-dark flex-1" />
        </div>
    )
}

function MessageStatus({ isFailed, isSending, isSender, readAt, createdAt, onRetry }) {
    if (isFailed) {
        return (
            <>
                <svg className="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-[10px] text-red-500 font-medium">Not delivered</span>
                <span className="text-[10px] text-text-muted dark:text-gray-500">&middot;</span>
                <button onClick={onRetry} className="text-[10px] text-primary font-semibold hover:underline">Try again</button>
            </>
        )
    }

    if (isSending) {
        return <span className="text-[10px] text-text-muted dark:text-gray-500 italic">Sending…</span>;
    }

    return (
        <>
            <span className="text-[10px] text-text-muted dark:text-gray-500">{formatMessageTime(createdAt)}</span>
            {isSender && readAt && (
                <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            )}
        </>
    );
}

export default function MessageBubble({ msg, messages, index, currentUser, onRetry }) {
    if (msg.type === 'system') {
        // Render rich offer widget for offer-sent messages
        // Phase 3: check systemType field; legacy: check id prefix
        const isOfferSent = msg.systemType === 'offer_sent' || msg.id?.startsWith('system:offer-sent:');
        if (isOfferSent) {
            const offerId = msg.offerId || msg.id?.replace('system:offer-sent:', '');
            if (offerId) {
                return (
                    <div>
                        <div className="flex items-center justify-center my-3">
                            <div className="h-px bg-border-light dark:bg-border-dark flex-1" />
                            <span className="mx-3 text-[10px] font-semibold text-text-muted dark:text-gray-500 uppercase tracking-widest">Offer</span>
                            <div className="h-px bg-border-light dark:bg-border-dark flex-1" />
                        </div>
                        <SessionOfferWidget offerId={offerId} />
                    </div>
                );
            }
        }
        return <SystemMessage key={msg.id} content={msg.content} />;
    }

    const isSender = msg.sender?.id === currentUser?.id || msg.senderId === currentUser?.id;
    const showDateSep = shouldShowDateSeparator(messages, index);
    const senderName = getDisplayName(msg.sender);
    const isSending = msg.status === 'sending';
    const isFailed = msg.status === 'failed';

    return (
        <div>
            {showDateSep && <DateSeparator label={formatDateSeparator(msg.createdAt)} />}
            <div className={`flex items-end gap-2 mb-2 ${isSender ? 'flex-row-reverse' : ''}`}>
                <UserAvatar
                    name={isSender ? (currentUser?.profile?.fullName || 'You') : senderName}
                    photoUrl={isSender ? getPhotoUrl(currentUser) : getPhotoUrl(msg.sender)}
                    size="xs"
                    className="mb-0.5"
                />
                <div className={`flex flex-col gap-0.5 max-w-[70%] ${isSender ? 'items-end' : 'items-start'}`}>
                    <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm transition-opacity ${isSender ? (isFailed ? 'bg-primary text-white rounded-br-sm border-2 border-red-400' : 'bg-primary text-white rounded-br-sm') : 'bg-card-light dark:bg-card-dark text-text-main dark:text-white border border-border-light dark:border-border-dark rounded-bl-sm'} ${isSending ? 'opacity-60' : ''}`}>
                        {msg.content}
                    </div>
                    <div className="flex items-center gap-1.5 px-1">
                        <MessageStatus
                            isFailed={isFailed}
                            isSending={isSending}
                            isSender={isSender}
                            readAt={msg.readAt}
                            createdAt={msg.createdAt}
                            onRetry={() => onRetry(msg.id)}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
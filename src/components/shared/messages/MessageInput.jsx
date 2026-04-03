"use client";

import { useRef } from "react";

export default function MessageInput({ inputValue, setInputValue, onSend, placeholder = "Type a message..." }) {
    const inputRef = useRef(null);

    const handleSend = (e) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;
        const content = inputValue;
        setInputValue('');
        if (inputRef.current) inputRef.current.style.height = 'auto';
        onSend(content);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="px-3 md:px-6 py-3 border-t border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark shrink-0">
            <div className="flex items-end gap-2 md:gap-3">
                {/* Attach button */}
                <button
                    type="button"
                    className="flex items-center justify-center h-11 w-11 rounded-full text-text-muted dark:text-gray-500 hover:bg-muted-light dark:hover:bg-muted-dark hover:text-primary transition-colors shrink-0"
                    aria-label="Add attachment"
                    tabIndex={-1}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                </button>

                {/* Input field */}
                <div className="flex-1 min-w-0 rounded-2xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                    <textarea
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        rows={1}
                        maxLength={2000}
                        className="w-full resize-none border-none bg-transparent focus:outline-none focus:ring-0 text-sm text-text-main dark:text-white placeholder:text-text-muted dark:placeholder:text-gray-500 px-4 py-3 leading-relaxed"
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                        onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`; }}
                    />
                </div>

                {/* Send button */}
                <button
                    type="button"
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className="flex items-center justify-center h-11 w-11 rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 shadow-lg"
                    aria-label="Send message"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                </button>
            </div>

            <div className="flex items-center justify-between px-12 mt-1.5">
                <span className="text-[10px] text-text-muted dark:text-gray-500">Enter to send · Shift+Enter for new line</span>
                <span className="text-[10px] text-text-muted dark:text-gray-500">{inputValue.length}/2000</span>
            </div>
        </div>
    )
}

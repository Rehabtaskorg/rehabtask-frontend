import { ChatWidget } from "@/components/ai/ChatWidget";

export default function PublicLayout({ children }) {
    return (
        <>
            {children}
            <ChatWidget audience="public" />
        </>
    );
}

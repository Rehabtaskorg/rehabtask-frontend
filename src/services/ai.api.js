import { api } from "@/lib/api";

export const AI_CHAT = {
    maxHistoryMessages: 20,
    maxInputChars: 1000,
    requestTimeoutMs: 35000,
};

const GENERIC_ERROR =
    "Something went wrong. Please try again or contact support@rehabtask.com.";

const readEvents = async (response, onChunk) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let result = { offerLead: false };

    const handleEvent = (block) => {
        const name = block.match(/^event: (.+)$/m)?.[1];
        const raw = block.match(/^data: (.+)$/m)?.[1];
        if (!name || !raw) return;

        const data = JSON.parse(raw);
        if (name === "chunk") onChunk(data.text);
        else if (name === "done") result = data;
        else if (name === "error") throw Object.assign(new Error(data.message), { code: data.code });
    };

    for (;;) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() ?? "";
        blocks.forEach(handleEvent);
    }

    if (buffer.trim()) handleEvent(buffer);
    return result;
};

export const sendChatMessage = async ({ messages, sessionId, audience, onChunk }) => {
    const payload = messages
        .slice(-AI_CHAT.maxHistoryMessages)
        .map(({ role, content }) => ({ role, content }));

    const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sessionId, audience, messages: payload }),
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw Object.assign(new Error(body.message || GENERIC_ERROR), {
            isRateLimit: response.status === 429,
            retryAfterSeconds: Number(response.headers.get("retry-after")) || undefined,
        });
    }

    return readEvents(response, onChunk);
};

export const sendChatLead = async (lead) => {
    const { data } = await api.post("/ai/lead", lead, { timeout: AI_CHAT.requestTimeoutMs });
    return data.data;
};

export const getChatErrorMessage = (error) =>
    error?.response?.data?.message || error?.message || GENERIC_ERROR;

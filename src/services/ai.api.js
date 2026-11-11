import { api } from "@/lib/api";
import { getRecaptchaToken } from "@/lib/recaptcha";

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

    for (; ;) {
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

export const sendChatMessage = async ({ messages, sessionId, audience, handoverArranged, onChunk }) => {
    const payload = messages
        .slice(-AI_CHAT.maxHistoryMessages)
        .map(({ role, content }) => ({ role, content }));

    const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sessionId, audience, handoverArranged, messages: payload }),
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
    const recaptchaAction = "CHAT_LEAD";
    const recaptchaToken = await getRecaptchaToken(recaptchaAction);

    const { data } = await api.post(
        "/ai/lead",
        { ...lead, recaptchaToken, recaptchaAction },
        { timeout: AI_CHAT.requestTimeoutMs }
    );
    return data.data;
};

const VALIDATION_FALLBACK = "Please check the details above and try again.";

const RECAPTCHA_FALLBACK =
    "We could not confirm you are human. Refresh the page and try again, or email support@rehabtask.com.";

const CODE_MESSAGES = {
    RECAPTCHA_REQUIRED: RECAPTCHA_FALLBACK,
    RECAPTCHA_FAILED: RECAPTCHA_FALLBACK,
    RECAPTCHA_ERROR: RECAPTCHA_FALLBACK,
};

export const getChatErrorMessage = (error) => {
    const data = error?.response?.data;

    if (data?.code === "VALIDATION_ERROR") {
        return data.errors?.[0]?.message || VALIDATION_FALLBACK;
    }

    return CODE_MESSAGES[data?.code] || data?.message || error?.message || GENERIC_ERROR;
};

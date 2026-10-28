import { api } from "@/lib/api";

export const AI_CHAT = {
    maxHistoryMessages: 20,
    maxInputChars: 1000,
    requestTimeoutMs: 35000,
};

const GENERIC_ERROR =
    "Something went wrong. Please try again or contact support@rehabtask.com.";

export const sendChatMessage = async ({ messages, sessionId }) => {
    const payload = messages
        .slice(-AI_CHAT.maxHistoryMessages)
        .map(({ role, content }) => ({ role, content }));

    const { data } = await api.post(
        "/ai/chat",
        { sessionId, messages: payload },
        { timeout: AI_CHAT.requestTimeoutMs }
    );

    return data.data.reply;
};

export const getChatErrorMessage = (error) =>
    error?.response?.data?.message || GENERIC_ERROR;

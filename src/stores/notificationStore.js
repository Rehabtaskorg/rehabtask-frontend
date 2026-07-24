import { create } from "zustand";

export const useNotificationStore = create((set) => ({
    toasts: [],
    addToast: (message, type = "info") =>
        set((state) => ({
            toasts: [
                ...state.toasts,
                { id: Date.now(), message, type },
            ],
        })),
    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        })),
}))
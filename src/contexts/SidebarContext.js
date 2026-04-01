/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const SidebarContext = createContext({
    isCollapsed: false,
    toggleSidebar: () => { },
});

const STORAGE_KEY = "sidebar_collapsed";

export function SidebarProvider({ children }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === "true") setIsCollapsed(true);
        setMounted(true);
    }, []);

    const toggleSidebar = useCallback(() => {
        setIsCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem(STORAGE_KEY, String(next));
            return next;
        });
    }, []);

    // Prevent flash of wrong state on first render
    if (!mounted) return <>{children}</>;

    return (
        <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    return useContext(SidebarContext);
}

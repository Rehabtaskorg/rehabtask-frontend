"use client";

import { useState, useEffect } from "react";

/**
 * Reads the non-httpOnly `app_role` cookie set by the backend at login.
 * Returns null when the user is unauthenticated or the cookie hasn't been
 * set yet (e.g. sessions created before the cookie was introduced).
 *
 * Possible values: "customer" | "therapist" | "admin" | "sub_admin" | null
 */
export function useAppRole() {
    const [role, setRole] = useState(null);

    useEffect(() => {
        const match = document.cookie.match(/(?:^|;\s*)app_role=([^;]+)/);
        setRole(match ? match[1] : null);
    }, []);

    return role;
}

export const ROLE_DASHBOARDS = {
    customer: "/customer/dashboard",
    therapist: "/therapist/dashboard",
    admin: "/admin/dashboard",
    sub_admin: "/admin/dashboard",
};

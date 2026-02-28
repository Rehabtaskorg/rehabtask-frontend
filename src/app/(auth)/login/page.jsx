"use client";

import { Suspense } from "react";
import LoginContent from "./LoginContent";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function LoginPage() {
    usePageTitle("Log In");

    return (
        <Suspense fallback={null}>
            <LoginContent />
        </Suspense>
    )
}
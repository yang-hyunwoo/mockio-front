"use client";

import { useEffect, useState } from "react";
import { validateSession } from "@/lib/api/home/authApi";
import { SessionValidateResponse } from "@mockio/shared/src/api/home/SessionValidateResponse";

type AuthState = "loading" | "authenticated" | "unauthenticated";

export function useAuth() {
    const [authState, setAuthState] = useState<AuthState>("loading");
    const [session, setSession] = useState<SessionValidateResponse | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        validateSession()
            .then((data) => {
                setAuthState("authenticated");
                setSession(data);
            })
            .catch(() => {
                setAuthState("unauthenticated");
                setSession(null);
            });

        return () => controller.abort();
    }, []);

    const username =
        session?.username ?? session?.preferredUsername ?? session?.name ?? null;

    return { authState, session, username, isAuthenticated: authState === "authenticated" };
}

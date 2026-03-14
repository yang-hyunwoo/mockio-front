"use client";

import { useEffect, useState } from "react";
import { validateSession } from "@/lib/api/home/authApi";
import { SessionValidateResponse } from "@mockio/shared/src/api/home/SessionValidateResponse";

type AuthState = "loading" | "authenticated" | "unauthenticated";

interface UseAuthOptions {
    enabled?: boolean;
}

export function useAuth({ enabled = true }: UseAuthOptions = {}) {

    const [authState, setAuthState] = useState<AuthState>(
        enabled ? "loading" : "unauthenticated"
    );
    const [session, setSession] = useState<SessionValidateResponse | null>(null);

    useEffect(() => {
        if (!enabled) {
            setAuthState("unauthenticated");
            setSession(null);
            return;
        }

        let cancelled = false;
        validateSession()
            .then((data) => {
                if (cancelled) return;

                if (data) {
                    setAuthState("authenticated");
                    setSession(data);
                } else {
                    setAuthState("unauthenticated");
                    setSession(null);
                }
            })
            .catch(() => {
                if (cancelled) return;
                setAuthState("unauthenticated");
                setSession(null);
            });

        return () => {
            cancelled = true;
        };
    }, [enabled]);

    const username =
        session?.username ?? session?.preferredUsername ?? session?.name ?? null;

    return { authState, session, username, isAuthenticated: authState === "authenticated" };
}
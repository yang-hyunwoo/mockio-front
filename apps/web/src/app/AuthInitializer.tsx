"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/axios";
import { getClientApiEndpoints } from "@mockio/shared/src/api";

const EXCLUDED_PATHS = ["/login", "/social/callback", "/signup", "/password/reset", "/password"];
const endpoints = getClientApiEndpoints();

export default function AuthInitializer({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const setAccessToken = useAuthStore((s) => s.setAccessToken);
    const setUser = useAuthStore((s) => s.setUser);
    const setInitialized = useAuthStore((s) => s.setInitialized);
    const clearAuth = useAuthStore((s) => s.clearAuth);
    const isInitialized = useAuthStore((s) => s.isInitialized);

    const isExcludedPath = EXCLUDED_PATHS.some((path) =>
        pathname.startsWith(path)
    );

    useEffect(() => {
        if (isExcludedPath) {
            setInitialized(true);
            return;
        }

        setInitialized(false);

        const initAuth = async () => {
            try {
                const refreshRes = await api.get(
                    `${endpoints.authPublic}/refresh`,
                    {
                        withCredentials: true,
                        skipAuthRefresh: true,
                    }
                );

                const newAccessToken =
                    refreshRes.data?.data?.accessToken ??
                    refreshRes.data?.accessToken ??
                    null;

                if (!newAccessToken) {
                    clearAuth();
                    return;
                }

                setAccessToken(newAccessToken);

                const meRes = await api.get(`${endpoints.auth}/me`, {
                    withCredentials: true,
                    skipAuthRefresh: true,
                });

                const meData = meRes.data?.data ?? meRes.data ?? null;

                setUser({
                    id: meData?.id ?? null,
                    email: meData?.email ?? null,
                    nickname: meData?.nickname ?? null,
                });
            } catch (e) {
                clearAuth();
            } finally {
                setInitialized(true);
            }
        };

        void initAuth();
    }, [pathname, isExcludedPath, setAccessToken, setUser, setInitialized, clearAuth]);

    if (!isExcludedPath && !isInitialized) {
        return null;
    }

    return <>{children}</>;
}
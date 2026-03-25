"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/axios";
import { apiEndpoints } from "@mockio/shared/src";

const EXCLUDED_PATHS = ["/login", "/social/callback", "/signup","/password/reset","/password"];

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

    useEffect(() => {
        const isExcludedPath = EXCLUDED_PATHS.some((path) =>
            pathname.startsWith(path)
        );

        if (isExcludedPath) {
            setInitialized(true);
            return;
        }

        setInitialized(false);

        const initAuth = async () => {
            try {
                const refreshRes = await api.get(
                    `${apiEndpoints.authPublic}/refresh`,
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

                const meRes = await api.get(`${apiEndpoints.auth}/me`, {
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

        initAuth();
    }, [pathname, setAccessToken, setUser, setInitialized, clearAuth]);

    return <>{children}</>;
}

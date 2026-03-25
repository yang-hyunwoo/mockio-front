"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { apiEndpoints } from "@mockio/shared/src/api";
import { useAuthStore } from "@/store/authStore";

export default function SocialCallbackPage() {
    const router = useRouter();
    const setAccessToken = useAuthStore((state) => state.setAccessToken);
    const clearAuth = useAuthStore((state) => state.clearAuth);

    const [message, setMessage] = useState("소셜 로그인 처리 중입니다...");

    useEffect(() => {
        const handleSocialLogin = async () => {
            try {
                const response = await axios.get(`${apiEndpoints.authPublic}/refresh`, {
                    withCredentials: true,
                });

                const accessToken = response.data?.data?.accessToken;

                if (!accessToken) {
                    clearAuth();
                    setMessage("로그인 처리에 실패했습니다.");
                    router.replace("/login");
                    return;
                }

                setAccessToken(accessToken);
                setMessage("로그인에 성공했습니다. 이동 중입니다...");
                router.replace("/");
            } catch (error) {
                clearAuth();
                setMessage("소셜 로그인 처리에 실패했습니다.");
                router.replace("/login");
            }
        };

        handleSocialLogin();
    }, [router, setAccessToken, clearAuth]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <p className="text-lg font-medium">{message}</p>
            </div>
        </div>
    );
}

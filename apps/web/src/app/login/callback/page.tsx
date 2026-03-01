"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { initKeycloak, isKeycloakConfigured, getKeycloak } from "@/lib/keycloak";

export default function LoginCallbackPage() {
    const router = useRouter();
    const [message, setMessage] = useState("로그인 중입니다...");

    useEffect(() => {
        if (!isKeycloakConfigured()) {
            setMessage("로그인 설정이 맞지 않습니다.");
            return;
        }

        (async () => {
            try {
                const authenticated = await initKeycloak();
                if (!authenticated) {
                    setMessage("로그인에 실패 했습니다 다시 시도해 주세요.");
                    return;
                }


                const token = kc.token;
                if (!token) {
                    setMessage("토큰이 없습니다.");
                    return;
                }

                setMessage("유저 동기화 중...");

                // ✅ 여기서 /me/sync 호출
                const res = await fetch("http://localhost:9000/api/users/v1/me/sync", {
                    method: "POST", // 서버 스펙에 맞게 GET/POST 확인
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    // 디버깅을 위해 메시지 노출(운영에서는 로깅/토스트로)
                    const text = await res.text().catch(() => "");
                    throw new Error(`Sync failed: ${res.status} ${text}`);
                }

                // ✅ 완료 후 홈으로 이동
                router.replace("/");
            } catch (error) {
                setMessage(error instanceof Error ? error.message : "Sign-in failed.");
            }
        })();
    }, [router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-sm text-zinc-600">
            {message}
        </div>
    );
}
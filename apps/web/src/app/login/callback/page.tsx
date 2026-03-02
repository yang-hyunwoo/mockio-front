"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


export default function LoginCallbackPage() {
    const router = useRouter();
    const [message, setMessage] = useState("로그인 중입니다...");

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-sm text-zinc-600">
            {message}
        </div>
    );
}
"use client";

import Button from "@/components/Common/Button";

export default function Login({ primaryLabel = "로그인하고 시작" }: { primaryLabel?: string }) {
    const handleLogin = () => {
        // window.location.href = "http://localhost:9000/api/auth/v1/public/login";
        window.location.href = "/login";
    };

    return (
        // <button
        //     type="button"
        //     className="h-11 rounded-full bg-[#355a7a] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#2f4f6b]"
        //     onClick={handleLogin}
        // >
        //     {primaryLabel}
        // </button>
        <Button variant="primary" size="lg" pill onClick={handleLogin}>
            {primaryLabel}
        </Button>
    );
}
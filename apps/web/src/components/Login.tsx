"use client";

import Button from "@/components/Common/Button";

export default function Login({ primaryLabel = "로그인하고 시작" }: { primaryLabel?: string }) {
    const handleLogin = () => {
        window.location.href = "/login";
    };

    return (

        <Button variant="primary" size="lg" pill onClick={handleLogin}>
            {primaryLabel}
        </Button>
    );
}

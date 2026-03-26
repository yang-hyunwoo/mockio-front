import { Suspense } from "react";
import ResetPasswordPageClient from "@/components/password/ResetPasswordPageClient";

export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <ResetPasswordPageClient />
        </Suspense>
    );
}
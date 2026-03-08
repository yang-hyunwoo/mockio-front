"use client";

import { useGlobalLoading } from "@/components/providers/GlobalLoadingProivder";

export default function GlobalTopLoadingBar() {
    const { isTopLoading, isCenterLoading } = useGlobalLoading();

    if (!isTopLoading || isCenterLoading) return null;

    return (
        <div className="fixed left-0 top-0 z-[9999] h-1 w-full overflow-hidden">
            <div className="h-full w-full animate-pulse bg-[#355a7a]" />
        </div>
    );
}
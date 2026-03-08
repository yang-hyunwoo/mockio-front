"use client";

import { useGlobalLoading } from "@/components/providers/GlobalLoadingProivder";

export default function GlobalCenterLoading() {
    const { isCenterLoading } = useGlobalLoading();

    if (!isCenterLoading) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="min-w-[260px] rounded-3xl border border-white/10 bg-white px-8 py-7 text-center shadow-2xl dark:bg-slate-900">
                <div className="mb-3 text-4xl">🤖</div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    면접 질문을 생성하고 있습니다
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    잠시만 기다려 주세요
                </p>

                <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-full w-full animate-pulse bg-[#355a7a]" />
                </div>
            </div>
        </div>
    );
}
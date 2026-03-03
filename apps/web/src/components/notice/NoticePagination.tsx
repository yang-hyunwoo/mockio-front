"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

type Props = {
    pageNumber: number            // 0-based
    totalPages: number
    onChange: (nextPage: number) => void
    windowSize?: number     // 한번에 보여줄 페이지 버튼 수
}

export default function NoticePagination({
                                             pageNumber,
                                             totalPages,
                                             onChange,
                                             windowSize = 5,
                                         }: Props) {
    if (totalPages <= 1) return null

    const current = pageNumber
    const half = Math.floor(windowSize / 2)
    let start = Math.max(0, current - half)
    let end = Math.min(totalPages - 1, start + windowSize - 1)
    start = Math.max(0, end - windowSize + 1)
    const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

    const go = (p: number) => {
        if (p < 0 || p >= totalPages || p === current) return
        onChange(p)
    }

    return (
        <nav className="flex items-center justify-center gap-2">
            <button
                onClick={() => go(current - 1)}
                disabled={current === 0}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm
                   disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04]"
            >
                <ChevronLeft className="h-4 w-4" />
                이전
            </button>

            <div className="flex items-center gap-1">
                {start > 0 && (
                    <>
                        <PageBtn active={false} onClick={() => go(0)} label="1" />
                        <span className="px-1 text-slate-400">…</span>
                    </>
                )}

                {pages.map((p) => (
                    <PageBtn
                        key={p}
                        active={p === current}
                        onClick={() => go(p)}
                        label={String(p + 1)} // 화면은 1-based
                    />
                ))}

                {end < totalPages - 1 && (
                    <>
                        <span className="px-1 text-slate-400">…</span>
                        <PageBtn active={false} onClick={() => go(totalPages - 1)} label={String(totalPages)} />
                    </>
                )}
            </div>

            <button
                onClick={() => go(current + 1)}
                disabled={current === totalPages - 1}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm
                   disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.04]"
            >
                다음
                <ChevronRight className="h-4 w-4" />
            </button>
        </nav>
    )
}

function PageBtn({
                     active,
                     onClick,
                     label,
                 }: {
    active: boolean
    onClick: () => void
    label: string
}) {
    return (
        <button
            onClick={onClick}
            className={[
                "h-10 min-w-10 rounded-xl border px-3 text-sm transition",
                active
                    ? "border-slate-300 bg-slate-900 text-white dark:border-white/20 dark:bg-white/15 dark:text-slate-50"
                    : "border-slate-200/70 bg-white/70 text-slate-700 hover:border-slate-300/80 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-white/20",
            ].join(" ")}
            aria-current={active ? "page" : undefined}
        >
            {label}
        </button>
    )
}

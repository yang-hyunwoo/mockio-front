"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"
import {Interview} from "@mockio/shared/src/api/home/Interview";
interface Props {
    interviews: Interview[]
    autoplayMs?: number
}

export default function InterviewCarousel({ interviews, autoplayMs = 5000 }: Props) {
    const items = useMemo(() => interviews ?? [], [interviews])
    const [index, setIndex] = useState(0)

    // ✅ autoplay 토글 상태(버튼으로 제어)
    const [isPlaying, setIsPlaying] = useState(true)
    const pausedRef = useRef(false)

    // drag 상태
    const viewportRef = useRef<HTMLDivElement | null>(null)
    const draggingRef = useRef(false)
    const startXRef = useRef(0)
    const deltaXRef = useRef(0)
    const [isDragging, setIsDragging] = useState(false)

    const [dragOffset, setDragOffset] = useState(0)

    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))
    const goTo = (i: number) => setIndex(() => clamp(i, 0, items.length - 1))
    const prev = () => goTo(index - 1)
    const next = () => goTo(index + 1)

    // ✅ autoplay (isPlaying이 true일 때만)
    useEffect(() => {
        if (!items.length) return
        if (!isPlaying) return

        const id = window.setInterval(() => {
            if (pausedRef.current) return
            setIndex((cur) => (cur + 1) % items.length)
        }, autoplayMs)

        return () => window.clearInterval(id)
    }, [items.length, autoplayMs, isPlaying])

    useEffect(() => {
        setDragOffset(0)
        deltaXRef.current = 0
    }, [index])

    const onPointerDown = (e: React.PointerEvent) => {
        if (!viewportRef.current) return
        setIsDragging(true);
        draggingRef.current = true
        pausedRef.current = true
        startXRef.current = e.clientX
        deltaXRef.current = 0
        setDragOffset(0)
        ;(e.currentTarget as HTMLDivElement).setPointerCapture?.(e.pointerId)
    }

    const onPointerMove = (e: React.PointerEvent) => {
        if (!draggingRef.current || !viewportRef.current) return
        const dx = e.clientX - startXRef.current
        deltaXRef.current = dx

        const atFirst = index === 0 && dx > 0
        const atLast = index === items.length - 1 && dx < 0
        const resist = atFirst || atLast ? 0.35 : 1

        setDragOffset(dx * resist)
    }

    const endDrag = () => {
        if (!viewportRef.current) return;
        setIsDragging(false);
        const width = viewportRef.current.clientWidth || 1
        const dx = deltaXRef.current

        draggingRef.current = false
        const threshold = width * 0.18

        if (dx > threshold) {
            if (index > 0) prev()
            else setDragOffset(0)
        } else if (dx < -threshold) {
            if (index < items.length - 1) next()
            else setDragOffset(0)
        } else {
            setDragOffset(0)
        }

        pausedRef.current = false
    }

    const onPointerUp = () => endDrag()
    const onPointerCancel = () => endDrag()

    const onMouseEnter = () => {
        pausedRef.current = true
    }
    const onMouseLeave = () => {
        if (!draggingRef.current) pausedRef.current = false
    }

    if (!items.length) {
        return (
            <div className="mt-4 rounded-2xl border border-[var(--border-glass)] bg-[var(--surface-glass)] p-4">
                <p className="text-sm text-[var(--brand-copy)]">진행 중인 면접이 없습니다.</p>
            </div>
        )
    }

    const canPrev = index > 0
    const canNext = index < items.length - 1

    return (
        <div className="mt-4">
            <div className="relative rounded-2xl" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
                <div ref={viewportRef} className="overflow-hidden rounded-2xl">
                    <div
                        className="select-none"
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerCancel={onPointerCancel}
                        style={{ touchAction: "pan-y" }}
                    >
                        <div
                            className={["flex", isDragging ? "" : "transition-transform duration-300 ease-out"].join(" ")}
                            style={{ transform: `translateX(calc(-${index * 100}% + ${dragOffset}px))` }}
                        >
                            {items.filter((item): item is Interview => item !== null)
                                .map((item) => (
                                    <div key={String(item.id)} className="w-full shrink-0">
                                        <Card item={item} />
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>

                {/* ✅ 아래 컨트롤 바: 버튼 겹침 제거 + 재생/정지 추가 */}
                <div className="absolute bottom-3 left-0 right-0 z-20 flex items-center justify-between px-3 pointer-events-none">
                    <button
                        type="button"
                        aria-label="이전"
                        disabled={!canPrev}
                        onPointerDown={(e) => e.stopPropagation()}
                        onPointerUp={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.stopPropagation()
                            pausedRef.current = true
                            prev()
                            setTimeout(() => (pausedRef.current = false), 400)
                        }}
                        className={[
                            "pointer-events-auto",
                            "h-9 w-9 rounded-full border border-[var(--border-glass)]",
                            "bg-[var(--surface-glass-strong)] backdrop-blur",
                            "grid place-items-center shadow-sm transition-opacity",
                            canPrev ? "opacity-100" : "opacity-30 cursor-not-allowed",
                        ].join(" ")}
                    >
                        <ChevronLeft className="h-5 w-5 text-[var(--text-primary)]" />
                    </button>

                    {/* ✅ Play/Pause 토글 */}
                    <button
                        type="button"
                        aria-label={isPlaying ? "일시정지" : "재생"}
                        onPointerDown={(e) => e.stopPropagation()}
                        onPointerUp={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsPlaying((v) => !v)
                        }}
                        className={[
                            "pointer-events-auto",
                            "h-9 w-9 rounded-full border border-[var(--border-glass)]",
                            "bg-[var(--surface-glass-strong)] backdrop-blur",
                            "grid place-items-center shadow-sm",
                        ].join(" ")}
                        title={isPlaying ? "일시정지" : "재생"}
                    >
                        {isPlaying ? (
                            <Pause className="h-5 w-5 text-[var(--text-primary)]" />
                        ) : (
                            <Play className="h-5 w-5 text-[var(--text-primary)]" />
                        )}
                    </button>

                    <button
                        type="button"
                        aria-label="다음"
                        disabled={!canNext}
                        onPointerDown={(e) => e.stopPropagation()}
                        onPointerUp={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.stopPropagation()
                            pausedRef.current = true
                            next()
                            setTimeout(() => (pausedRef.current = false), 400)
                        }}
                        className={[
                            "pointer-events-auto",
                            "h-9 w-9 rounded-full border border-[var(--border-glass)]",
                            "bg-[var(--surface-glass-strong)] backdrop-blur",
                            "grid place-items-center shadow-sm transition-opacity",
                            canNext ? "opacity-100" : "opacity-30 cursor-not-allowed",
                        ].join(" ")}
                    >
                        <ChevronRight className="h-5 w-5 text-[var(--text-primary)]" />
                    </button>
                </div>
            </div>

            {/* dots */}
            <div className="mt-3 flex items-center justify-center gap-2">
                {items.map((_, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => {
                            pausedRef.current = true
                            goTo(i)
                            setTimeout(() => (pausedRef.current = false), 400)
                        }}
                        aria-label={`슬라이드 ${i + 1}`}
                        className={[
                            "h-2 rounded-full transition-all",
                            i === index ? "w-6 bg-[var(--brand)]" : "w-2 bg-[var(--border-glass)]",
                        ].join(" ")}
                    />
                ))}
            </div>
        </div>
    )
}

function Card({ item }: { item: Interview }) {
    const p = Number(item.progress)
    const progress = Number.isFinite(p) ? Math.max(0, Math.min(100, p)) : 0

    return (
        <div className="rounded-2xl border border-[var(--border-glass)] bg-[var(--surface-glass)] p-4 pb-14">
            <h4 className="text-center text-sm font-semibold text-[var(--text-primary)]">{item.title} </h4>

            <p className="mt-2 text-center text-xs text-[var(--brand-copy)]">
                진행률 <span className="font-semibold">{progress}%</span>
            </p>
            <p className="mt-2 text-center text-xs text-[var(--brand-copy)]">
                {item.createdAt}
            </p>

            <div className="mt-3 w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div
                    className="h-full transition-all"
                    style={{
                        width: `${progress}%`,
                        backgroundColor: "var(--brand, #3b82f6)", // ✅ --brand 없으면 파란색으로 fallback
                    }}
                />
            </div>
        </div>
    )
}
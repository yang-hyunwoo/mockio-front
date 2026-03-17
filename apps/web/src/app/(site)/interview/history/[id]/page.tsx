"use client"

import { use, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
    ArrowLeft,
    BadgeCheck,
    Brain,
    CheckCircle2,
    Clock3,
    MessageSquareText,
    Sparkles,
    Target,
    TriangleAlert,
} from "lucide-react"
import { InterviewResultApi } from "@/lib/api/interview/InterviewResultApi"
import { InterviewResultResponse } from "@mockio/shared/src/api/interview/InterviewResultResponse"

const getScoreMeta = (score: number) => {
    if (score >= 85) {
        return {
            label: "우수",
            className:
                "bg-emerald-500/12 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400 dark:ring-emerald-400/20",
        }
    }

    if (score >= 70) {
        return {
            label: "양호",
            className:
                "bg-blue-500/12 text-blue-600 ring-1 ring-blue-500/20 dark:text-blue-400 dark:ring-blue-400/20",
        }
    }

    return {
        label: "보완 필요",
        className:
            "bg-amber-500/12 text-amber-600 ring-1 ring-amber-500/20 dark:text-amber-400 dark:ring-amber-400/20",
    }
}

const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    return `${min}분 ${sec}초`
}

export default function InterviewResultPage({
                                                params,
                                            }: {
    params: Promise<{ id: string }>
}) {
    const resolvedParams = use(params)
    const interviewId = Number(resolvedParams.id)

    const [result, setResult] = useState<InterviewResultResponse | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchResult = async () => {
            try {
                if (Number.isNaN(interviewId)) {
                    throw new Error("잘못된 interview id")
                }

                const data = await InterviewResultApi(interviewId)
                console.log("data", data)
                setResult(data)
            } catch (error) {
                console.error("면접 결과 조회 실패", error)
                setResult(null)
            } finally {
                setLoading(false)
            }
        }

        fetchResult()
    }, [interviewId])

    const completionRate = useMemo(() => {
        if (!result || result.totalCount === 0) return 0
        return Math.round((result.answeredCount / result.totalCount) * 100)
    }, [result])

    if (loading) {
        return (
            <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white/70 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/70">
                    <div className="px-6 py-8 sm:px-8">
                        <div className="h-4 w-28 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
                        <div className="mt-4 h-8 w-56 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
                        <div className="mt-2 h-4 w-72 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />

                        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {[1, 2, 3, 4].map((idx) => (
                                <div
                                    key={idx}
                                    className="rounded-[24px] border border-black/5 bg-white/80 p-5 dark:border-white/10 dark:bg-white/[0.03]"
                                >
                                    <div className="h-4 w-20 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
                                    <div className="mt-4 h-8 w-24 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    if (!result) {
        return (
            <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="rounded-[28px] border border-black/5 bg-white/70 px-6 py-12 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-zinc-950/70">
                    <p className="text-lg font-semibold text-[var(--text-primary)]">
                        면접 결과를 불러오지 못했습니다.
                    </p>
                    <p className="mt-2 text-sm text-[var(--brand-muted)]">
                        잠시 후 다시 시도해주세요.
                    </p>
                </div>
            </section>
        )
    }

    const overallScoreMeta = getScoreMeta(result.overallScore ?? 0)

    return (
        <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white/70 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/70">
                <div className="border-b border-black/5 px-6 py-8 dark:border-white/10 sm:px-8">
                    <Link
                        href="/interview/history"
                        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--brand-muted)] transition-colors hover:text-[var(--text-primary)]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        면접 기록으로 돌아가기
                    </Link>

                    <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold tracking-[0.18em] text-[var(--brand-primary)]">
                                INTERVIEW RESULT
                            </p>
                            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
                                {result.title}
                            </h1>
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[var(--brand-muted)]">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.03] px-3 py-1 dark:bg-white/[0.04]">
                                    {result.track.label}
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.03] px-3 py-1 dark:bg-white/[0.04]">
                                    난이도 {result.difficulty.label}
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.03] px-3 py-1 dark:bg-white/[0.04]">
                                    피드백 {result.feedbackStyle.label}
                                </span>
                            </div>
                        </div>

                        {result.overallScore !== null && (
                            <div
                                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${overallScoreMeta.className}`}
                            >
                                <BadgeCheck className="h-4 w-4" />
                                종합 점수 {result.overallScore}점 · {overallScoreMeta.label}
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-6 py-6 sm:px-8">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-[24px] border border-black/5 bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.03]">
                            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--brand-muted)]">
                                <Target className="h-4 w-4" />
                                전체 점수
                            </div>
                            <p className="mt-4 text-3xl font-semibold text-[var(--text-primary)]">
                                {result.overallScore ?? "-"}
                                <span className="ml-1 text-base font-medium text-[var(--brand-muted)]">/ 100</span>
                            </p>
                        </div>

                        <div className="rounded-[24px] border border-black/5 bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.03]">
                            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--brand-muted)]">
                                <MessageSquareText className="h-4 w-4" />
                                답변 수
                            </div>
                            <p className="mt-4 text-3xl font-semibold text-[var(--text-primary)]">
                                {result.answeredCount}
                                <span className="ml-1 text-base font-medium text-[var(--brand-muted)]">
                                    / {result.totalCount}
                                </span>
                            </p>
                        </div>

                        <div className="rounded-[24px] border border-black/5 bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.03]">
                            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--brand-muted)]">
                                <Clock3 className="h-4 w-4" />
                                소요 시간
                            </div>
                            <p className="mt-4 text-3xl font-semibold text-[var(--text-primary)]">
                                {formatDuration(result.durationSeconds)}
                            </p>
                        </div>

                        <div className="rounded-[24px] border border-black/5 bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.03]">
                            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--brand-muted)]">
                                <Brain className="h-4 w-4" />
                                완료율
                            </div>
                            <p className="mt-4 text-3xl font-semibold text-[var(--text-primary)]">
                                {completionRate}
                                <span className="ml-1 text-base font-medium text-[var(--brand-muted)]">%</span>
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                        <section className="rounded-[28px] border border-black/5 bg-white/80 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.03]">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-[var(--brand-primary)]" />
                                <h2 className="text-xl font-semibold text-[var(--text-primary)]">종합 총평</h2>
                            </div>
                            <p className="mt-4 leading-7 text-[var(--brand-muted)]">
                                {result.summary ?? "아직 종합 총평이 생성되지 않았습니다."}
                            </p>
                        </section>

                        <div className="grid gap-6">
                            <section className="rounded-[28px] border border-black/5 bg-white/80 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.03]">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">강점</h2>
                                </div>
                                <ul className="mt-4 space-y-3">
                                    {(result.strengths.length > 0
                                        ? result.strengths
                                        : ["아직 강점 분석이 없습니다."]).map((item, index) => (
                                        <li
                                            key={`${item}-${index}`}
                                            className="rounded-2xl bg-emerald-500/5 px-4 py-3 text-sm leading-6 text-[var(--text-primary)] ring-1 ring-emerald-500/10"
                                        >
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <section className="rounded-[28px] border border-black/5 bg-white/80 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.03]">
                                <div className="flex items-center gap-2">
                                    <TriangleAlert className="h-5 w-5 text-amber-500" />
                                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">보완 포인트</h2>
                                </div>
                                <ul className="mt-4 space-y-3">
                                    {(result.improvements.length > 0
                                        ? result.improvements
                                        : ["아직 보완 포인트 분석이 없습니다."]).map((item, index) => (
                                        <li
                                            key={`${item}-${index}`}
                                            className="rounded-2xl bg-amber-500/5 px-4 py-3 text-sm leading-6 text-[var(--text-primary)] ring-1 ring-amber-500/10"
                                        >
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>
                    </div>

                    <section className="mt-6 rounded-[28px] border border-black/5 bg-white/80 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.03]">
                        <div className="flex items-center gap-2">
                            <MessageSquareText className="h-5 w-5 text-[var(--brand-primary)]" />
                            <h2 className="text-xl font-semibold text-[var(--text-primary)]">질문별 상세 피드백</h2>
                        </div>

                        <div className="mt-6 space-y-5">
                            {result.questions.map((item) => {
                                const scoreMeta = getScoreMeta(item.score ?? 0)

                                return (
                                    <article
                                        key={item.id}
                                        className="rounded-[24px] border border-black/5 bg-white/90 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-white/[0.02]"
                                    >
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="inline-flex items-center rounded-full bg-[var(--brand-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--brand-primary)]">
                                                        Q{item.questionOrder}
                                                    </span>
                                                    {item.score !== null && (
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${scoreMeta.className}`}
                                                        >
                                                            {item.score}점 · {scoreMeta.label}
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="mt-3 text-lg font-semibold leading-7 text-[var(--text-primary)]">
                                                    {item.question}
                                                </h3>

                                                <div className="mt-5 grid gap-4 xl:grid-cols-2">
                                                    <div className="rounded-2xl bg-black/[0.03] p-4 dark:bg-white/[0.04]">
                                                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                                                            내 답변
                                                        </p>
                                                        <p className="mt-2 text-sm leading-7 text-[var(--brand-muted)]">
                                                            {item.answer ?? "답변 내용이 없습니다."}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-2xl bg-[var(--brand-primary)]/5 p-4 ring-1 ring-[var(--brand-primary)]/10">
                                                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                                                            AI 피드백
                                                        </p>
                                                        <p className="mt-2 text-sm leading-7 text-[var(--brand-muted)]">
                                                            {item.feedback ?? "아직 피드백이 생성되지 않았습니다."}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                )
                            })}
                        </div>
                    </section>
                </div>
            </div>
        </section>
    )
}
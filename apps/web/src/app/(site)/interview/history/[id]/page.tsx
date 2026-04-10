"use client"

import axios from "axios"
import { use, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    ArrowLeft,
    BadgeCheck,
    Brain,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Clock3,
    MessageSquareText,
    RotateCcw,
    Sparkles,
    Target,
    TriangleAlert,
} from "lucide-react"

import { InterviewResultApi } from "@/lib/api/interview/InterviewResultApi"
import { RetryInterviewApi } from "@/lib/api/interview/RetryInterviewApi"
import InterviewConflictModal from "@/components/modal/InterviewConflictModal"

import {
    InterviewResultResponse,
    InterviewQuestionFeedbackItem,
} from "@mockio/shared/src/api/interview/InterviewResultResponse"
import {TerminateInterviewApi} from "@/lib/api/interview/TerminateInterviewApi";

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

const getQuestionTypeStyle = (typeCode?: string) => {
    if (typeCode === "FOLLOW_UP") {
        return "border-amber-500/30 bg-amber-500/10 text-amber-300"
    }

    if (typeCode === "DEEP_DIVE") {
        return "border-indigo-500/30 bg-indigo-500/10 text-indigo-300"
    }

    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
}

const getQuestionTypeLabel = (typeCode?: string) => {
    if (typeCode === "FOLLOW_UP") return "추가 질문"
    if (typeCode === "DEEP_DIVE") return "심화 질문"
    return "기본 질문"
}

const getExampleAnswerText = (item: any) => {
    if (!item.answer?.trim()) {
        return "답변이 없어 예시를 제공할 수 없습니다."
    }

    return (
        item.exampleAnswer ??
        item.sampleAnswer ??
        item.modelAnswer ??
        item.answerExample ??
        "아직 답변 예시가 생성되지 않았습니다."
    )
}

const renderImprovementContent = (item: InterviewQuestionFeedbackItem) => {
    if (!item.answer?.trim()) {
        return (
            <p className="mt-2 text-sm text-(--brand-muted)">
                답변이 없어 보완 포인트를 제공할 수 없습니다.
            </p>
        )
    }
    if (item.improvements?.length) {
        return (
            <ul className="mt-3 space-y-2">
                {item.improvements.map((point, index) => {
                    return (
                        <li
                            key={index}
                            className="flex items-start gap-2 text-sm leading-6 text-(--brand-muted)"
                        >
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400" />

                            <div>
                                <p className="text-foreground">
                                    {point.problem}
                                </p>
                                <p className="text-(--brand-muted)">
                                    → {point.action}
                                </p>

                                {point.example && (
                                    <details className="mt-1">
                                        <summary className="cursor-pointer text-xs text-amber-400">
                                            예시 보기
                                        </summary>
                                        <p className="mt-1 text-xs text-(--brand-muted)">
                                            {point.example}
                                        </p>
                                    </details>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        );
    }

    return (
        <p className="mt-2 text-sm text-(--brand-muted)">
            아직 보완 포인트가 생성되지 않았습니다.
        </p>
    )
}

const dimensionItems = (feedbackDimensions?: {
    structure?: number
    clarity?: number
    specificity?: number
}) => [
    { label: "구조성", value: feedbackDimensions?.structure ?? 0 },
    { label: "명확성", value: feedbackDimensions?.clarity ?? 0 },
    { label: "구체성", value: feedbackDimensions?.specificity ?? 0 },
]


const jobMetricItems = (feedbackJobMetrics?: {
    practicality?: number
    decisionMaking?: number
    tradeoff?: number
}) => [
    { label: "실무 적합도", value: feedbackJobMetrics?.practicality ?? 0 },
    { label: "의사결정 기준", value: feedbackJobMetrics?.decisionMaking ?? 0 },
    { label: "트래이드오프 이해", value: feedbackJobMetrics?.tradeoff ?? 0 },
]

export default function InterviewResultPage({
                                                params,
                                            }: {
    params: Promise<{ id: string }>
}) {
    const router = useRouter()
    const resolvedParams = use(params)
    const interviewId = Number(resolvedParams.id)

    const [result, setResult] = useState<InterviewResultResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [retryLoading, setRetryLoading] = useState(false)
    const [openQuestionIds, setOpenQuestionIds] = useState<number[]>([])
    const [showConflictModal, setShowConflictModal] = useState(false)

    const completionRate = useMemo(() => {
        if (!result || result.totalCount === 0) return 0
        return Math.round((result.answeredCount / result.totalCount) * 100)
    }, [result])

    const toggleQuestionDetail = (questionId: number) => {
        setOpenQuestionIds((prev) =>
            prev.includes(questionId)
                ? prev.filter((id) => id !== questionId)
                : [...prev, questionId]
        )
    }

    const moveToInterview = () => {
        router.push(`/interview`)
    }

    const executeRetry = async () => {
        if (retryLoading) return

        if (!result?.id) {
            alert("면접 정보가 없습니다.")
            return
        }

        const payload = {
            interviewId: result.id,
            idempotencyKey: crypto.randomUUID(),
        }

        try {
            setRetryLoading(true)

            const retryResult = await RetryInterviewApi(payload)

            if (!retryResult) {
                alert("면접을 다시 시작하지 못했습니다.")
                return
            }

            moveToInterview()
        } catch (e) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status

                if (status === 409) {
                    setShowConflictModal(true)
                    return
                }
            }

            console.error("에러 발생", e)
            alert("면접 재시작 중 오류가 발생했습니다.")
        } finally {
            setRetryLoading(false)
        }
    }

    const handleRetry = async () => {
        await executeRetry()
    }
    const handleTest = async () => {
        window.location.href="/interview/compare"
    }

    const handleContinueInterview = () => {
        setShowConflictModal(false)
        window.location.href="/interview"
    }

    const handleRestartAfterTerminate = async () => {


        try {
            setShowConflictModal(false)

            await TerminateInterviewApi();
            // 종료 성공 후 다시 재시작
            await executeRetry()
        } catch (e) {
            console.error("기존 면접 종료 후 재시작 실패", e)
            alert("기존 면접 종료 후 다시 시작하지 못했습니다.")
        }
    }

    useEffect(() => {
        const fetchResult = async () => {
            try {
                if (Number.isNaN(interviewId)) {
                    throw new Error("잘못된 interview id")
                }

                const data = await InterviewResultApi(interviewId)
                setResult(data)
            } catch (error) {
                console.error("면접 결과 조회 실패", error)
                setResult(null)
            } finally {
                setLoading(false)
            }
        }

        void fetchResult()
    }, [interviewId])

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
                                    className="rounded-3xl border border-black/5 bg-white/80 p-5 dark:border-white/10 dark:bg-white/3"
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
                    <p className="text-lg font-semibold text-foreground">
                        면접 결과를 불러오지 못했습니다.
                    </p>
                    <p className="mt-2 text-sm text-(--brand-muted)">
                        잠시 후 다시 시도해주세요.
                    </p>
                </div>
            </section>
        )
    }

    const isUserExit = result.endReason.code === "USER_EXIT"
    const overallScoreMeta = getScoreMeta(result.overallScore ?? 0)
    const retryLabel = isUserExit ? "다시 면접하기" : "재응시"
    const retryDescription = isUserExit
        ? "중도 종료된 면접을 같은 조건으로 다시 시작할 수 있습니다."
        : "같은 조건으로 새 면접을 시작해 성장 변화를 다시 확인해보세요."

    return (
        <>
            <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white/70 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/70">
                    <div className="border-b border-black/5 px-6 py-8 dark:border-white/10 sm:px-8">
                        <Link
                            href="/interview/history"
                            className="inline-flex items-center gap-2 text-sm font-medium text-(--brand-muted) transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            면접 기록으로 돌아가기
                        </Link>

                        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="text-sm font-semibold tracking-[0.18em] text-(--brand-primary)">
                                    INTERVIEW RESULT
                                </p>
                                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                                    {result.title}
                                </h1>
                                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-(--brand-muted)">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/3 px-3 py-1 dark:bg-white/4">
                                        {result.track.label}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/3 px-3 py-1 dark:bg-white/4">
                                        난이도 {result.difficulty.label}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/3 px-3 py-1 dark:bg-white/4">
                                        피드백 {result.feedbackStyle.label}
                                    </span>
                                    {isUserExit && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-amber-600 dark:text-amber-400">
                                            중도 종료
                                        </span>
                                    )}
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
                            <div className="rounded-3xl border border-black/5 bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-(--brand-muted)">
                                    <Target className="h-4 w-4" />
                                    전체 점수
                                </div>
                                <p className="mt-4 text-3xl font-semibold text-foreground">
                                    {result.overallScore ?? "-"}
                                    <span className="ml-1 text-base font-medium text-(--brand-muted)">
                                        / 100
                                    </span>
                                </p>
                            </div>

                            <div className="rounded-3xl border border-black/5 bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-(--brand-muted)">
                                    <MessageSquareText className="h-4 w-4" />
                                    답변 수
                                </div>
                                <p className="mt-4 text-3xl font-semibold text-foreground">
                                    {result.answeredCount}
                                    <span className="ml-1 text-base font-medium text-(--brand-muted)">
                                        / {result.totalCount}
                                    </span>
                                </p>
                            </div>

                            <div className="rounded-3xl border border-black/5 bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-(--brand-muted)">
                                    <Clock3 className="h-4 w-4" />
                                    소요 시간
                                </div>
                                <p className="mt-4 text-3xl font-semibold text-foreground">
                                    {formatDuration(result.durationSeconds)}
                                </p>
                            </div>

                            <div className="rounded-3xl border border-black/5 bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-(--brand-muted)">
                                    <Brain className="h-4 w-4" />
                                    완료율
                                </div>
                                <p className="mt-4 text-3xl font-semibold text-foreground">
                                    {completionRate}
                                    <span className="ml-1 text-base font-medium text-(--brand-muted)">%</span>
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 rounded-[28px] border border-black/5 bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/3">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{retryLabel}</p>
                                    <p className="mt-1 text-sm text-(--brand-muted)">
                                        {retryDescription}
                                    </p>
                                </div>

                                <button
                                    onClick={handleRetry}
                                    disabled={retryLoading}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-(--brand-primary) px-5 text-sm font-semibold text-white transition-colors hover:bg-(--brand-primary-hover) disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    {retryLoading ? "생성중..." : retryLabel}
                                </button>
                                <button
                                    onClick={handleTest}
                                >
                                    버튼 클릭
                                </button>
                            </div>
                        </div>

                        {isUserExit && (
                            <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-600 dark:text-amber-400">
                                <div className="flex items-start gap-2">
                                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                                    <div>
                                        <p className="font-semibold">중도 종료된 면접입니다.</p>
                                        <p className="mt-1 leading-6">
                                            이 면접은 사용자가 중도 종료했습니다. 일부 답변만 기반으로 결과가
                                            생성되었으며, 종합 평가나 분석 결과는 제한적으로 제공될 수 있습니다.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                            <section className="rounded-[28px] border border-black/5 bg-white/80 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/3">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-(--brand-primary)" />
                                    <h2 className="text-xl font-semibold text-foreground">종합 총평</h2>
                                </div>

                                <p className="mt-4 leading-7 text-(--brand-muted)">
                                    {isUserExit
                                        ? result.summary ??
                                        "면접이 중도 종료되어 일부 답변 기준으로만 결과가 표시됩니다."
                                        : result.summary ?? "아직 종합 총평이 생성되지 않았습니다."}
                                </p>

                                {!isUserExit && (
                                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                        {dimensionItems(result.feedbackDimensions).map((item) => (
                                            <div
                                                key={item.label}
                                                className="rounded-2xl bg-[var(--brand-primary)]/5 p-4 ring-1 ring-[var(--brand-primary)]/10"
                                            >
                                                <div className="flex items-center justify-between text-xs text-(--brand-muted)">
                                                    <span>{item.label}</span>
                                                    <span className="font-semibold text-foreground">
                                                        {item.value}
                                                    </span>
                                                </div>
                                                <div className="mt-2 h-2 w-full rounded-full bg-black/10 dark:bg-white/10">
                                                    <div
                                                        className="h-2 rounded-full bg-(--brand-primary)"
                                                        style={{ width: `${item.value}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {!isUserExit && (
                                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                        {jobMetricItems(result.feedbackJobMetrics).map((item) => (
                                            <div
                                                key={item.label}
                                                className="rounded-2xl bg-[var(--brand-primary)]/5 p-4 ring-1 ring-[var(--brand-primary)]/10"
                                            >
                                                <div className="flex items-center justify-between text-xs text-(--brand-muted)">
                                                    <span>{item.label}</span>
                                                    <span className="font-semibold text-foreground">
                                                        {item.value}
                                                    </span>
                                                </div>
                                                <div className="mt-2 h-2 w-full rounded-full bg-black/10 dark:bg-white/10">
                                                    <div
                                                        className="h-2 rounded-full bg-(--brand-primary)"
                                                        style={{ width: `${item.value}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <div className="grid gap-6">
                                <section className="rounded-[28px] border border-black/5 bg-white/80 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/3">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                        <h2 className="text-xl font-semibold text-foreground">강점</h2>
                                    </div>
                                    <ul className="mt-4 space-y-3">
                                        {(result.strengths.length > 0
                                            ? result.strengths
                                            : [
                                                isUserExit
                                                    ? "중도 종료로 인해 충분한 강점 분석이 이루어지지 않았습니다."
                                                    : "아직 강점 분석이 없습니다.",
                                            ]).map((item, index) => (
                                            <li
                                                key={`${item}-${index}`}
                                                className="rounded-2xl bg-emerald-500/5 px-4 py-3 text-sm leading-6 text-foreground ring-1 ring-emerald-500/10"
                                            >
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                <section className="rounded-[28px] border border-black/5 bg-white/80 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/3">
                                    <div className="flex items-center gap-2">
                                        <TriangleAlert className="h-5 w-5 text-amber-500" />
                                        <h2 className="text-xl font-semibold text-foreground">보완 포인트</h2>
                                    </div>
                                    <ul className="mt-4 space-y-3">
                                        {(result.improvements.length > 0
                                            ? result.improvements
                                            : [
                                                isUserExit
                                                    ? "중도 종료로 인해 보완 포인트가 제한적으로 도출되었습니다."
                                                    : "아직 보완 포인트 분석이 없습니다.",
                                            ]).map((item, index) => (
                                            <li
                                                key={`${item}-${index}`}
                                                className="rounded-2xl bg-amber-500/5 px-4 py-3 text-sm leading-6 text-foreground ring-1 ring-amber-500/10"
                                            >
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            </div>
                        </div>

                        <section className="mt-6 rounded-[28px] border border-black/5 bg-white/80 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/3">
                            <div className="flex items-center gap-2">
                                <MessageSquareText className="h-5 w-5 text-(--brand-primary)" />
                                <h2 className="text-xl font-semibold text-foreground">질문별 상세 피드백</h2>
                            </div>

                            <div className="mt-6 space-y-5">
                                {result.questions.map((item, index) => {
                                    const scoreMeta = getScoreMeta(item.score ?? 0)
                                    const isOpen = openQuestionIds.includes(item.id)

                                    return (
                                        <article
                                            key={item.id}
                                            className="rounded-3xl border border-black/5 bg-white/90 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-white/2"
                                        >
                                            <div className="flex flex-col gap-4">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="inline-flex items-center rounded-full bg-[var(--brand-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--brand-primary)]">
                                                            Q{index + 1}
                                                        </span>

                                                        <span
                                                            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${getQuestionTypeStyle(
                                                                item.type.code
                                                            )}`}
                                                        >
                                                            {getQuestionTypeLabel(item.type.code)}
                                                        </span>

                                                        {item.score !== null && (
                                                            <span
                                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${scoreMeta.className}`}
                                                            >
                                                                {item.score}점 · {scoreMeta.label}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <h3 className="mt-3 text-lg font-semibold leading-7 text-foreground">
                                                        {item.question}
                                                    </h3>

                                                    <div className="mt-5 grid gap-4 xl:grid-cols-2">
                                                        <div className="rounded-2xl bg-black/3 p-4 dark:bg-white/4">
                                                            <p className="text-sm font-semibold text-foreground">
                                                                내 답변
                                                            </p>
                                                            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-(--brand-muted)">
                                                                {item.answer ?? "답변 내용이 없습니다."}
                                                            </p>
                                                        </div>

                                                        <div className="rounded-2xl bg-[var(--brand-primary)]/5 p-4 ring-1 ring-[var(--brand-primary)]/10">
                                                            <p className="text-sm font-semibold text-foreground">
                                                                AI 피드백
                                                            </p>
                                                            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-(--brand-muted)">
                                                                {!item.answer?.trim()
                                                                    ? "피드백할 답변이 없습니다."
                                                                    : item.feedback ??
                                                                    "아직 피드백이 생성되지 않았습니다."}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 flex justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleQuestionDetail(item.id)}
                                                            className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-(--brand-muted) transition hover:bg-black/5 hover:text-foreground dark:border-white/10 dark:hover:bg-white/5"
                                                        >
                                                            {isOpen ? (
                                                                <>
                                                                    접기
                                                                    <ChevronUp className="h-4 w-4" />
                                                                </>
                                                            ) : (
                                                                <>
                                                                    더보기
                                                                    <ChevronDown className="h-4 w-4" />
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>

                                                    {isOpen && (
                                                        <div className="mt-4 space-y-4">
                                                            <div className="rounded-2xl bg-[var(--brand-primary)]/5 p-4 ring-1 ring-[var(--brand-primary)]/10">
                                                                <p className="text-sm font-semibold text-foreground">
                                                                    답변 분석
                                                                </p>

                                                                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                                                    {dimensionItems(item.dimensions).map(
                                                                        (dimension) => (
                                                                            <div key={dimension.label}>
                                                                                <div className="flex items-center justify-between text-xs text-(--brand-muted)">
                                                                                    <span>{dimension.label}</span>
                                                                                    <span className="font-semibold text-foreground">
                                                                                        {dimension.value}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="mt-1 h-2 w-full rounded-full bg-black/10 dark:bg-white/10">
                                                                                    <div
                                                                                        className="h-2 rounded-full bg-(--brand-primary)"
                                                                                        style={{
                                                                                            width: `${dimension.value}%`,
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>

                                                                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                                                    {jobMetricItems(item.jobMetrics).map(
                                                                        (dimension) => (
                                                                            <div key={dimension.label}>
                                                                                <div className="flex items-center justify-between text-xs text-(--brand-muted)">
                                                                                    <span>{dimension.label}</span>
                                                                                    <span className="font-semibold text-foreground">
                                                                                        {dimension.value}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="mt-1 h-2 w-full rounded-full bg-black/10 dark:bg-white/10">
                                                                                    <div
                                                                                        className="h-2 rounded-full bg-(--brand-primary)"
                                                                                        style={{
                                                                                            width: `${dimension.value}%`,
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>

                                                                {!!item.improvementTags?.length && (
                                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                                        {item.improvementTags.map((tag, index) => (
                                                                            <span
                                                                                key={`${tag}-${index}`}
                                                                                className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-500"
                                                                            >
                                                                                {tag}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="grid gap-4 xl:grid-cols-2">
                                                                <div className="rounded-2xl bg-amber-500/5 p-4 ring-1 ring-amber-500/10">
                                                                    <p className="text-sm font-semibold text-foreground">
                                                                        보완하면 좋은 점
                                                                    </p>
                                                                    {renderImprovementContent(item)}
                                                                </div>
                                                                <div className="rounded-2xl bg-emerald-500/5 p-4 ring-1 ring-emerald-500/10">
                                                                    <p className="text-sm font-semibold text-foreground">
                                                                        답변 예시
                                                                    </p>
                                                                    <p className="mt-2 whitespace-pre-line text-sm leading-7 text-(--brand-muted)">
                                                                        {getExampleAnswerText(item)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
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

            <InterviewConflictModal
                open={showConflictModal}
                onClose={() => setShowConflictModal(false)}
                onContinue={handleContinueInterview}
                onRestart={handleRestartAfterTerminate}
            />
        </>
    )
}

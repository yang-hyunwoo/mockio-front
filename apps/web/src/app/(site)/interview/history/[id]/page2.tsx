"use client"

import { useMemo } from "react"
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

interface EnumResponse {
    code: string
    label: string
}

interface InterviewQuestionFeedbackItem {
    id: number
    questionOrder: number
    question: string
    answer: string
    feedback: string
    score: number
}

interface InterviewResultResponse {
    id: number
    title: string
    createdAt: string
    endedAt: string
    durationMinutes: number
    totalCount: number
    answeredCount: number
    overallScore: number
    status: EnumResponse
    track: EnumResponse
    difficulty: EnumResponse
    feedbackStyle: EnumResponse
    summary: string
    strengths: string[]
    improvements: string[]
    questions: InterviewQuestionFeedbackItem[]
}

const MOCK_RESULT: InterviewResultResponse = {
    id: 12,
    title: "백엔드 (중간)",
    createdAt: "2026-03-17",
    endedAt: "2026-03-17",
    durationMinutes: 2400,
    totalCount: 5,
    answeredCount: 5,
    overallScore: 82,
    status: {
        code: "DONE",
        label: "완료",
    },
    track: {
        code: "BACKEND",
        label: "백엔드",
    },
    difficulty: {
        code: "MEDIUM",
        label: "중간",
    },
    feedbackStyle: {
        code: "COACHING",
        label: "코칭형",
    },
    summary:
        "전반적으로 핵심 개념을 안정적으로 설명했고, 실무 경험을 바탕으로 답변을 이어가는 점이 좋았습니다. 다만 일부 질문에서는 답변 구조가 길어지며 핵심 결론이 뒤로 밀리는 경향이 있어, 결론을 먼저 말하고 근거를 덧붙이는 방식으로 개선하면 전달력이 더 좋아질 수 있습니다.",
    strengths: [
        "Spring Boot와 JPA 관련 핵심 개념을 실무 맥락과 함께 설명했습니다.",
        "문제를 해결했던 경험을 구체적으로 언급해 답변 신뢰도가 높았습니다.",
        "전체적으로 답변의 자신감과 일관성이 좋았습니다.",
    ],
    improvements: [
        "질문에 대한 결론을 먼저 제시하고 세부 설명을 뒤에 덧붙이면 더 명확합니다.",
        "트랜잭션, 동시성, 예외 처리와 같은 심화 주제는 개념과 사례를 함께 정리하는 연습이 필요합니다.",
        "답변 길이가 길어질 때 핵심 메시지를 2~3문장으로 요약하는 습관을 들이면 좋습니다.",
    ],
    questions: [
        {
            id: 1,
            questionOrder: 1,
            question: "Spring Boot에서 @Transactional의 역할과 주의할 점을 설명해주세요.",
            answer:
                "트랜잭션을 선언적으로 처리할 수 있게 해주는 어노테이션입니다. 서비스 계층에서 주로 사용하고, 런타임 예외 발생 시 롤백되며, 체크 예외는 별도 설정이 필요합니다. 또한 프록시 기반이라 self-invocation에서는 동작하지 않는 점을 주의해야 합니다.",
            feedback:
                "핵심 개념과 실무상 주의점(self-invocation, rollback 정책)을 잘 짚었습니다. 여기에 propagation, isolation 수준까지 짧게 언급했다면 더욱 완성도 높은 답변이 되었을 것입니다.",
            score: 88,
        },
        {
            id: 2,
            questionOrder: 2,
            question: "JPA의 N+1 문제와 해결 방법을 설명해주세요.",
            answer:
                "연관 엔티티를 조회할 때 추가 쿼리가 반복적으로 발생하는 문제입니다. fetch join이나 EntityGraph를 사용해서 해결할 수 있고, 컬렉션 조회에서는 페이징과 함께 사용할 때 주의가 필요합니다.",
            feedback:
                "문제 정의와 대표 해결책을 정확히 답변했습니다. 특히 fetch join과 페이징 이슈를 짚은 점이 좋았습니다. batch size 전략까지 함께 말하면 더 좋습니다.",
            score: 91,
        },
        {
            id: 3,
            questionOrder: 3,
            question: "Redis를 어떤 상황에서 도입하는 것이 적절한가요?",
            answer:
                "조회 성능 개선이 필요한 캐시 용도, 세션 저장소, 랭킹이나 카운터처럼 빠른 인메모리 연산이 필요한 상황에서 적절합니다.",
            feedback:
                "활용 사례를 간결하게 잘 설명했습니다. 다만 캐시 일관성, TTL, 장애 시 fallback 전략까지 확장하면 더 깊이 있는 답변이 됩니다.",
            score: 79,
        },
        {
            id: 4,
            questionOrder: 4,
            question: "대규모 트래픽 상황에서 DB 부하를 줄이기 위한 방법을 설명해주세요.",
            answer:
                "캐싱, 읽기/쓰기 분리, 인덱스 최적화, 비동기 처리, 페이지네이션, 불필요한 조인 감소 등을 사용할 수 있습니다.",
            feedback:
                "키워드는 잘 나열했지만, 답변 구조가 조금 나열형으로 흘렀습니다. 실무에서 실제로 적용했던 한 가지 사례를 중심으로 설명하면 훨씬 설득력이 커집니다.",
            score: 74,
        },
        {
            id: 5,
            questionOrder: 5,
            question: "협업 중 의견 충돌이 생겼을 때 어떻게 해결하시나요?",
            answer:
                "상대방의 의견을 먼저 듣고, 목적과 요구사항을 기준으로 정리한 뒤, 기술적 근거와 일정 영향을 함께 고려해 대안을 제시합니다. 필요하면 작은 PoC로 빠르게 검증합니다.",
            feedback:
                "기술적 판단뿐 아니라 협업 태도와 문제 해결 방식이 잘 드러났습니다. 백엔드 개발자로서 실무 협업 역량을 보여주는 좋은 답변입니다.",
            score: 86,
        },
    ],
}

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

export default function InterviewResultPage() {
    const result = MOCK_RESULT

    const completionRate = useMemo(() => {
        if (result.totalCount === 0) return 0
        return Math.round((result.answeredCount / result.totalCount) * 100)
    }, [result.answeredCount, result.totalCount])

    const overallScoreMeta = getScoreMeta(result.overallScore)

    const formatDuration = (seconds: number) => {
        const min = Math.floor(seconds / 60)
        const sec = seconds % 60
        return `${min}분 ${sec}초`
    }

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

                        <div
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${overallScoreMeta.className}`}
                        >
                            <BadgeCheck className="h-4 w-4" />
                            종합 점수 {result.overallScore}점 · {overallScoreMeta.label}
                        </div>
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
                                {result.overallScore}
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
                                {formatDuration(result.durationMinutes)}
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
                            <p className="mt-4 leading-7 text-[var(--brand-muted)]">{result.summary}</p>
                        </section>

                        <div className="grid gap-6">
                            <section className="rounded-[28px] border border-black/5 bg-white/80 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.03]">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">강점</h2>
                                </div>
                                <ul className="mt-4 space-y-3">
                                    {result.strengths.map((item, index) => (
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
                                    {result.improvements.map((item, index) => (
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
                                const scoreMeta = getScoreMeta(item.score)

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
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${scoreMeta.className}`}
                                                    >
                                                        {item.score}점 · {scoreMeta.label}
                                                    </span>
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
                                                            {item.answer}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-2xl bg-[var(--brand-primary)]/5 p-4 ring-1 ring-[var(--brand-primary)]/10">
                                                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                                                            AI 피드백
                                                        </p>
                                                        <p className="mt-2 text-sm leading-7 text-[var(--brand-muted)]">
                                                            {item.feedback}
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
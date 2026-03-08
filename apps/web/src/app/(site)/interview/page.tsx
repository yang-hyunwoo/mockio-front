"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Send, Timer, MessageSquareWarning, BadgeCheck } from "lucide-react"
import Button from "@/components/Common/Button"
import { InterviewQuestionApi } from "@/lib/api/interview/InterviewQuestionApi"
import { InterviewQuestion } from "@mockio/shared/src/api/Interview/InterviewQuestion"
import { InterviewAnswerApi } from "@/lib/api/interview/InterviewAnswerApi"
import {InterviewAnswerReadApi} from "@/lib/api/interview/InterviewAnswerReadApi";
import {FeedbackDetailApi} from "@/lib/api/interview/FeedbackDetailApi";
import { FeedbackResponse } from "@mockio/shared/src/api/Interview/FeedbackDetail"

export default function InterviewPage() {
    const [questions, setQuestions] = useState<InterviewQuestion[]>([])
    const [index, setIndex] = useState(0)
    const [isInitializing, setIsInitializing] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const current = questions[index]
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [answerDurationSeconds, setAnswerDurationSeconds] = useState(0)
    const [feedbackByQuestionId, setFeedbackByQuestionId] = useState<Record<string, FeedbackResponse>>({})
    const [submittedQuestionIds, setSubmittedQuestionIds] = useState<Record<string, boolean>>({})
    const startedAtRef = useRef<number | null>(null)
    const intervalRef = useRef<number | null>(null)
    const feedbackPollingRef = useRef<number | null>(null)

    useEffect(() => {
        setIsInitializing(true)

        const fetchInterview = async () => {
            const result = await InterviewQuestionApi()
            if (!result) return

            const mappedQuestions: InterviewQuestion[] = (result.questions ?? []).map((q) => ({
                id: q.id,
                interviewId: q.interviewId,
                title: q.title,
                questionText: q.questionText,
                tags: q.tags ?? [],
                timeLimitSec: 300,
                type: q.type,
                seq : q.seq
            }))

            setQuestions(mappedQuestions)
            setIsInitializing(false)
            setIndex(0)
        }

        fetchInterview()
    }, [])

    useEffect(() => {
        if (!current) return
        const fetchAnswer = async () => {
            const res = await InterviewAnswerReadApi(current.id)

            if (!res) return

            setAnswers((prev) => ({
                ...prev,
                [current.id]: res.answerText ?? ""
            }))

            setSubmittedQuestionIds((prev) => ({
                ...prev,
                [current.id]: true
            }))

            const feedbackRes = await FeedbackDetailApi(current.id)
            if (feedbackRes) {
                setFeedbackByQuestionId((prev) => ({
                    ...prev,
                    [current.id]: feedbackRes,
                }))
                if(feedbackRes.status.code === "PENDING") {
                    startFeedbackPolling(current.id);
                }
            }
        }

        fetchAnswer()


    }, [current?.id])


    useEffect(() => {
        if (!current) return

        startedAtRef.current = Date.now()
        setAnswerDurationSeconds(0)

        if (intervalRef.current) window.clearInterval(intervalRef.current)

        intervalRef.current = window.setInterval(() => {
            if (!startedAtRef.current) return
            const diff = Math.floor((Date.now() - startedAtRef.current) / 1000)
            setAnswerDurationSeconds(diff)
        }, 1000)

        return () => {
            if (intervalRef.current) window.clearInterval(intervalRef.current)
        }
    }, [current?.id])

    const remainingSec =
        typeof current?.timeLimitSec === "number"
            ? Math.max(current.timeLimitSec - answerDurationSeconds, 0)
            : null

    const currentAnswer = current ? answers[current.id] ?? "" : ""

    const currentFeedback = current ? feedbackByQuestionId[current.id] : null
    const isFeedbackPending = currentFeedback?.status.code === "PENDING"
    const isFeedbackSucceeded = currentFeedback?.status.code === "SUCCEEDED"
    const isFeedbackFailed = currentFeedback?.status.code === "FAILED"

    const isCurrentSubmitted = current ? !!submittedQuestionIds[current.id] : false

    const onChangeAnswer = (text: string) => {
        if (!current) return
        setAnswers((prev) => ({ ...prev, [current.id]: text }))
    }

    const goPrev = () => setIndex((v) => Math.max(v - 1, 0))
    const goNext = () => {
        if (!current) return
        if (!submittedQuestionIds[current.id]) return
        setIndex((v) => Math.min(v + 1, questions.length - 1))
    }

    const startFeedbackPolling = (questionId: number) => {
        if (feedbackPollingRef.current) {
            window.clearInterval(feedbackPollingRef.current)
        }

        let retryCount = 0
        const maxRetry = 15

        feedbackPollingRef.current = window.setInterval(async () => {
            retryCount += 1

            const feedbackRes = await FeedbackDetailApi(questionId)

            if (!feedbackRes) {
                if (retryCount >= maxRetry && feedbackPollingRef.current) {
                    window.clearInterval(feedbackPollingRef.current)
                    feedbackPollingRef.current = null
                }
                return
            }

            setFeedbackByQuestionId((prev) => ({
                ...prev,
                [questionId]: feedbackRes,
            }))

            if (
                feedbackRes.status.code === "SUCCEEDED" || feedbackRes.status.code === "FAILED"
            ) {
                if (feedbackPollingRef.current) {
                    window.clearInterval(feedbackPollingRef.current)
                    feedbackPollingRef.current = null
                }
            }
        }, 2000)
    }

    const submitCurrent = async () => {
        if (!current || isSubmitting) return

        try {
            setIsSubmitting(true)

            const idempotencyKey = createIdempotencyKey(current.interviewId, current.id)

            const payload = {
                interviewId: current.interviewId,
                questionId: current.id,
                answerText: answers[current.id] ?? "",
                answerDurationSeconds,
                idempotencyKey,
            }
            console.log("::::",payload);
            const result = await InterviewAnswerApi(payload)

            const nextQuestion = result?.questions?.[0]

            if (nextQuestion) {
                if(nextQuestion.type.code !== "BASE") {
                    upsertQuestion({
                        id: nextQuestion.id,
                        interviewId: nextQuestion.interviewId,
                        seq: nextQuestion.seq,
                        title: nextQuestion.title,
                        questionText: nextQuestion.questionText,
                        tags: nextQuestion.tags ?? [],
                        type: nextQuestion.type,
                        timeLimitSec: 300,
                    } as InterviewQuestion)
                }
            }

            setSubmittedQuestionIds((prev) => ({
                ...prev,
                [current.id]: true,
            }))

            const feedbackRes = await FeedbackDetailApi(current.id)

            if (!feedbackRes) {
                startFeedbackPolling(current.id)
                return
            }

            setFeedbackByQuestionId((prev) => ({
                ...prev,
                [current.id]: feedbackRes,
            }))

            if (feedbackRes.status.code === "PENDING") {
                startFeedbackPolling(current.id)
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const getQuestionGuideText = (typeCode?: string) => {
        if (typeCode === "FOLLOW_UP") {
            return "이전 답변을 바탕으로 이어지는 추가 질문입니다."
        }

        if (typeCode === "DEEP_DIVE") {
            return "이전 답변을 바탕으로 더 깊이 확인하는 심화 질문입니다."
        }

        return ""
    }

    const upsertQuestion = (nextQuestion: InterviewQuestion) => {
        setQuestions((prev) => {
            const exists = prev.some((q) => q.id === nextQuestion.id)

            const merged = exists
                ? prev.map((q) => (q.id === nextQuestion.id ? nextQuestion : q))
                : [...prev, nextQuestion]

            return merged.sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0))
        })
    }


    const getQuestionTypeLabel = (typeCode?: string) => {
        if (typeCode === "FOLLOW_UP") return "추가 질문"
        if (typeCode === "DEEP_DIVE") return "심화 질문"
        return "기본 질문"
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

    function formatMMSS(sec: number) {
        const m = Math.floor(sec / 60)
        const s = sec % 60
        const mm = String(m).padStart(2, "0")
        const ss = String(s).padStart(2, "0")
        return `${mm}:${ss}`
    }

    const createIdempotencyKey = (interviewId: number, questionId: number) => {
        const raw = `interview-answer:${interviewId}:${questionId}`
        return btoa(raw)
    }

    const getScoreStyle = (score?: number) => {
        if (score == null) return ""

        if (score >= 80)
            return "border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"

        if (score >= 60)
            return "border-yellow-500/40 bg-yellow-500/15 text-yellow-600 dark:text-yellow-300"

        if (score >= 40)
            return "border-orange-500/40 bg-orange-500/15 text-orange-600 dark:text-orange-300"

        return "border-red-500/40 bg-red-500/15 text-red-600 dark:text-red-300"
    }


    if (isInitializing) {
        return (
            <div className="mx-auto w-full max-w-6xl px-4 py-10">
                <div className="rounded-3xl border border-white/10 bg-(--surface-glass-strong) p-8 text-center shadow-[0_24px_48px_rgba(20,30,50,0.12)]">
                    <p className="text-sm text-(--brand-muted)">면접을 준비하고 있습니다...</p>
                </div>
            </div>
        )
    }

    if (!current) {
        return (
            <div className="mx-auto w-full max-w-6xl px-4 py-10">
                <div className="rounded-3xl border border-white/10 bg-(--surface-glass-strong) p-8 text-center shadow-[0_24px_48px_rgba(20,30,50,0.12)]">
                    <p className="text-sm text-(--brand-muted)">불러올 질문이 없습니다.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-10">
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm text-(--brand-muted)">면접 세션</p>
                    <h1 className="text-2xl font-semibold text-foreground">인터뷰 진행</h1>
                    <p className="mt-1 text-sm text-(--brand-muted)">
                        질문 {index + 1} / {questions.length}
                    </p>
                </div>

                <div
                    className="rounded-2xl border border-white/10 bg-(--surface-glass-strong) px-4 py-3 shadow-[0_18px_40px_rgba(20,30,50,0.12)]">
                    <div className="flex items-center gap-2 text-sm text-(--brand-muted)">
                        <Timer className="h-4 w-4"/>
                        <span>Time</span>
                    </div>
                    <div className="mt-1 text-xl font-semibold text-foreground tabular-nums">
                        {remainingSec !== null ? formatMMSS(remainingSec) : formatMMSS(answerDurationSeconds)}
                    </div>
                    {remainingSec !== null && (
                        <p className="mt-1 text-xs text-(--brand-muted)">
                            제한 {Math.floor((current.timeLimitSec ?? 0) / 60)}분
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <section className="rounded-3xl border border-white/10 bg-(--surface-glass-strong) p-6 shadow-[0_24px_48px_rgba(20,30,50,0.12)]">
                    <div className="mb-4">
                        <div className="flex items-center gap-2">
                            <p className="text-xs uppercase tracking-[0.2em] text-(--brand-muted)">Question</p>
                            <span
                                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${getQuestionTypeStyle(current.type?.code)}`}
                            >
            {getQuestionTypeLabel(current.type?.code)}
        </span>
                        </div>

                        <h2 className="mt-1 text-xl font-semibold text-foreground break-keep">
                            {current.title}
                        </h2>

                        {current.type?.code !== "BASE" && (
                            <p className="mt-2 text-sm text-(--brand-muted)">
                                {getQuestionGuideText(current.type?.code)}
                            </p>
                        )}

                        {!!current.tags?.length && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {current.tags.map((t) => (
                                    <span
                                        key={t}
                                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-(--brand-muted)"
                                    >
                    {t}
                </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed text-foreground">
                        {current.questionText}
                    </div>

                    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm font-medium text-foreground">답변 팁</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-(--brand-muted)">
                            <li>정의 → 장단점 → 적용 시나리오 순으로 말하기</li>
                            <li>트레이드오프(복잡도/일관성/성능)를 명확히 언급</li>
                            <li>가능하면 본인 프로젝트 사례 1개 포함</li>
                        </ul>
                    </div>
                </section>

                <section
                    className="rounded-3xl border border-white/10 bg-(--surface-glass-strong) p-6 shadow-[0_24px_48px_rgba(20,30,50,0.12)]">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-(--brand-muted)">Answer</p>
                            <h3 className="mt-1 text-lg font-semibold text-foreground">답변 작성</h3>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                className="rounded-xl"
                                onClick={goPrev}
                                disabled={index === 0}
                            >
                                <ChevronLeft className="mr-1 h-4 w-4"/>
                                이전
                            </Button>

                            <Button
                                className="rounded-xl"
                                onClick={index === questions.length - 1 ? submitCurrent : goNext}
                                disabled={!isCurrentSubmitted && index !== questions.length - 1}
                            >
                                {index === questions.length - 1 ? "면접 완료" : "다음"}
                                {index !== questions.length - 1 && <ChevronRight className="ml-1 h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    <textarea
                        value={currentAnswer}
                        onChange={(e) => onChangeAnswer(e.target.value)}
                        disabled={isCurrentSubmitted}
                        className="min-h-70 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-foreground outline-none disabled:cursor-not-allowed disabled:opacity-60"
                        placeholder="답변을 입력해 주세요."
                    />

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-(--brand-muted)">
                            자동 저장: 현재 질문별로 로컬 상태에 저장 중
                        </p>

                        <Button
                            className="rounded-xl"
                            onClick={submitCurrent}
                            disabled={isSubmitting || currentAnswer.trim().length === 0 || isCurrentSubmitted}
                        >
                            <Send className="mr-2 h-4 w-4"/>
                            {isCurrentSubmitted ? "제출 완료" : isSubmitting ? "제출 중..." : "답변 제출"}
                        </Button>
                    </div>

                    {isFeedbackPending && (
                        <div className="mt-5 rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5">
                            <div className="flex items-center gap-2">
                                <BadgeCheck className="h-4 w-4 text-sky-400" />
                                <p className="text-sm font-semibold text-foreground">간단 피드백 생성 중</p>
                            </div>

                            <p className="mt-3 text-sm leading-relaxed text-(--brand-muted)">
                                답변을 분석하고 있습니다. 잠시 후 피드백이 표시됩니다.
                            </p>
                        </div>
                    )}

                    {isFeedbackSucceeded && currentFeedback && (
                        <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                            <div className="flex items-center gap-2">
                                <BadgeCheck className="h-4 w-4 text-emerald-400"/>
                                <p className="text-sm font-semibold text-foreground">간단 피드백</p>
                                {typeof currentFeedback.score === "number" && (
                                    <span
                                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${getScoreStyle(currentFeedback.score)}`}>
                                        {currentFeedback.score}점
                                    </span>
                                )}
                            </div>

                            <p className="mt-3 text-sm leading-relaxed text-(--brand-muted)">
                                {currentFeedback.summary}
                            </p>

                            {!!currentFeedback.strengths.length && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-foreground">좋았던 점</p>
                                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-(--brand-muted)">
                                        {currentFeedback.strengths.map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {!!currentFeedback.improvements.length && (
                                <div className="mt-4">
                                    <div className="flex items-center gap-2">
                                        <MessageSquareWarning className="h-4 w-4 text-amber-400"/>
                                        <p className="text-sm font-medium text-foreground">보완하면 좋은 점</p>
                                    </div>
                                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-(--brand-muted)">
                                        {currentFeedback.improvements.map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {!!currentFeedback.modelAnswer && (
                                <div className="mt-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4">
                                    <p className="text-sm font-semibold text-foreground">
                                        답변 예시
                                    </p>

                                    <p className="mt-2 text-sm leading-relaxed text-(--brand-muted)">
                                        {currentFeedback.modelAnswer}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {isFeedbackFailed && (
                        <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
                            <p className="text-sm font-semibold text-foreground">피드백 생성 실패</p>
                            <p className="mt-2 text-sm text-(--brand-muted)">
                                피드백을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
                            </p>
                        </div>
                    )}

                </section>
            </div>
        </div>
    );
}
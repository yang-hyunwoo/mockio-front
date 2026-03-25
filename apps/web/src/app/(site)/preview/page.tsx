"use client"

import { useMemo, useState } from "react"
import {
    BadgeCheck,
    ChevronLeft,
    ChevronRight,
    MessageSquareWarning,
    Send,
    Timer,
} from "lucide-react"
import Button from "@/components/Common/Button"

type QuestionTypeCode = "BASE" | "FOLLOW_UP" | "DEEP_DIVE"

type PreviewInterviewQuestion = {
    id: number
    interviewId: number
    seq: number
    title: string
    questionText: string
    tags: string[]
    timeLimitSec: number
    type: {
        code: QuestionTypeCode
        label: string
    }
}

type PreviewFeedbackResponse = {
    status: {
        code: "SUCCEEDED" | "PENDING" | "FAILED" | "SKIPPED"
        label: string
    }
    score?: number
    summary?: string
    strengths: string[]
    improvements: string[]
    modelAnswer?: string
}

const mockQuestions: PreviewInterviewQuestion[] = [
    {
        id: 101,
        interviewId: 1,
        seq: 1,
        title: "최근에 가장 몰입했던 경험이나 프로젝트를 소개해 주세요.",
        questionText:
            "어떤 목표를 가지고 있었는지, 본인의 역할은 무엇이었는지, 그리고 어떤 결과로 이어졌는지 중심으로 설명해 주세요.",
        tags: ["경험", "역할", "성과"],
        timeLimitSec: 180,
        type: {
            code: "BASE",
            label: "기본 질문",
        },
    },
    {
        id: 102,
        interviewId: 1,
        seq: 2,
        title: "그 과정에서 가장 어려웠던 문제는 무엇이었고, 어떻게 해결했나요?",
        questionText:
            "문제 상황, 해결을 위해 시도한 방법, 그리고 최종적으로 어떤 판단을 했는지 설명해 주세요.",
        tags: ["문제 해결", "판단", "과정"],
        timeLimitSec: 180,
        type: {
            code: "DEEP_DIVE",
            label: "심화 질문",
        },
    },
    {
        id: 103,
        interviewId: 1,
        seq: 3,
        title: "비슷한 상황이 다시 온다면, 이번에는 무엇을 다르게 해보고 싶나요?",
        questionText:
            "이전 경험을 돌아보며 아쉬웠던 점이나, 다음에는 더 잘하고 싶은 부분을 중심으로 이야기해 주세요.",
        tags: ["회고", "성장", "개선"],
        timeLimitSec: 120,
        type: {
            code: "FOLLOW_UP",
            label: "추가 질문",
        },
    },
]

const mockFeedbackByQuestionId: Record<number, PreviewFeedbackResponse> = {
    101: {
        status: {
            code: "SUCCEEDED",
            label: "성공",
        },
        score: 82,
        summary:
            "답변의 구조가 비교적 명확했고, 경험의 맥락과 본인의 역할이 잘 드러났습니다.",
        strengths: [
            "경험의 배경 설명이 자연스럽습니다.",
            "본인의 역할이 비교적 또렷하게 드러납니다.",
        ],
        improvements: [
            "성과를 조금 더 구체적으로 설명하면 설득력이 높아집니다.",
            "결과가 어떤 의미였는지 한 번 더 정리하면 좋습니다.",
        ],
        modelAnswer:
            "최근 가장 몰입했던 경험은 팀 프로젝트였습니다. 당시 목표는 일정 안에 결과물을 완성하는 것이었고, 저는 역할을 나누고 핵심 업무를 정리하는 부분을 맡았습니다. 그 과정에서 ...",
    },
    102: {
        status: {
            code: "SUCCEEDED",
            label: "성공",
        },
        score: 78,
        summary:
            "문제 해결 과정은 잘 설명했지만, 어떤 기준으로 해결 방안을 선택했는지 조금 더 구체적으로 드러내면 좋습니다.",
        strengths: [
            "문제 상황과 해결 흐름이 자연스럽게 이어집니다.",
            "실제 경험 기반 설명이라 신뢰감이 있습니다.",
        ],
        improvements: [
            "대안을 어떻게 비교했는지 함께 설명해 주세요.",
            "최종 판단의 기준을 조금 더 선명하게 드러내면 좋습니다.",
        ],
        modelAnswer:
            "가장 어려웠던 점은 예상과 다른 문제가 발생했을 때 우선순위를 다시 정해야 했던 점입니다. 저는 먼저 원인을 정리하고, 가능한 해결 방법을 비교한 뒤 ...",
    },
    103: {
        status: {
            code: "SUCCEEDED",
            label: "성공",
        },
        score: 84,
        summary:
            "회고와 개선 방향이 자연스럽게 연결되어 있었고, 성장 관점이 잘 드러났습니다.",
        strengths: [
            "경험을 단순히 설명하는 데서 끝나지 않고 돌아본 점이 좋습니다.",
            "다음 행동으로 이어지는 개선 의지가 잘 드러납니다.",
        ],
        improvements: [
            "다음에는 무엇을 먼저 시도할지 조금 더 구체적으로 말하면 좋습니다.",
        ],
        modelAnswer:
            "비슷한 상황이 다시 온다면 초기에 기대치와 역할을 더 분명히 맞추려고 합니다. 당시에는 진행하면서 조정한 부분이 많았는데, 다음에는 시작 단계에서 기준을 더 명확히 세우고 싶습니다.",
    },
}
export default function InterviewPreviewPage() {
    const [questions] = useState(mockQuestions)
    const [index, setIndex] = useState(0)

    const [answers, setAnswers] = useState<Record<number, string>>({})
    const [submittedQuestionIds, setSubmittedQuestionIds] = useState<Record<number, boolean>>({})
    const [feedbackByQuestionId, setFeedbackByQuestionId] = useState<
        Record<number, PreviewFeedbackResponse>
    >({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)

    const current = questions[index]

    const currentAnswer = answers[current.id] ?? ""
    const isCurrentSubmitted = !!submittedQuestionIds[current.id]
    const currentFeedback = feedbackByQuestionId[current.id]

    const progressText = useMemo(() => {
        return `질문 ${index + 1} / ${questions.length}`
    }, [index, questions.length])

    const getQuestionGuideText = (typeCode?: QuestionTypeCode) => {
        if (typeCode === "FOLLOW_UP") {
            return "이전 답변을 바탕으로 이어지는 추가 질문입니다."
        }

        if (typeCode === "DEEP_DIVE") {
            return "이전 답변을 바탕으로 더 깊이 확인하는 심화 질문입니다."
        }

        return ""
    }

    const getQuestionTypeLabel = (typeCode?: QuestionTypeCode) => {
        if (typeCode === "FOLLOW_UP") return "추가 질문"
        if (typeCode === "DEEP_DIVE") return "심화 질문"
        return "기본 질문"
    }

    const getQuestionTypeStyle = (typeCode?: QuestionTypeCode) => {
        if (typeCode === "FOLLOW_UP") {
            return "border-amber-500/30 bg-amber-500/10 text-amber-300"
        }

        if (typeCode === "DEEP_DIVE") {
            return "border-indigo-500/30 bg-indigo-500/10 text-indigo-300"
        }

        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
    }

    const getScoreStyle = (score?: number) => {
        if (score == null) return ""

        if (score >= 80) {
            return "border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
        }

        if (score >= 60) {
            return "border-yellow-500/40 bg-yellow-500/15 text-yellow-600 dark:text-yellow-300"
        }

        if (score >= 40) {
            return "border-orange-500/40 bg-orange-500/15 text-orange-600 dark:text-orange-300"
        }

        return "border-red-500/40 bg-red-500/15 text-red-600 dark:text-red-300"
    }

    const formatMMSS = (sec: number) => {
        const m = Math.floor(sec / 60)
        const s = sec % 60
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    }

    const onChangeAnswer = (text: string) => {
        if (isCurrentSubmitted) return

        setAnswers((prev) => ({
            ...prev,
            [current.id]: text,
        }))
    }

    const goPrev = () => {
        setIndex((prev) => Math.max(prev - 1, 0))
    }

    const goNext = () => {
        if (!isCurrentSubmitted) return
        setIndex((prev) => Math.min(prev + 1, questions.length - 1))
    }

    const submitCurrent = async () => {
        if (isCurrentSubmitted) return

        setIsSubmitting(true)

        await new Promise((resolve) => setTimeout(resolve, 500))

        setSubmittedQuestionIds((prev) => ({
            ...prev,
            [current.id]: true,
        }))

        setFeedbackByQuestionId((prev) => ({
            ...prev,
            [current.id]: mockFeedbackByQuestionId[current.id],
        }))

        setIsSubmitting(false)
    }

    const completePreview = () => {
        if (!isCurrentSubmitted) return
        setIsCompleted(true)
    }

    if (isCompleted) {
        return (
            <div className="mx-auto w-full max-w-6xl px-4 py-10">
                <div className="rounded-3xl border border-white/10 bg-(--surface-glass-strong) p-8 text-center shadow-[0_24px_48px_rgba(20,30,50,0.12)]">
                    <p className="text-sm text-(--brand-muted)">미리보기가 완료되었습니다.</p>
                    <h2 className="mt-2 text-2xl font-semibold text-foreground">
                        실제 세션은 이런 흐름으로 진행됩니다
                    </h2>
                    <p className="mt-3 text-sm text-(--brand-muted)">
                        로그인 후 실제 질문과 피드백을 기반으로 연습을 이어갈 수 있습니다.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-10">
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm text-(--brand-muted)">면접 미리보기</p>
                    <h1 className="text-2xl font-semibold text-foreground">인터뷰 진행 예시</h1>
                    <p className="mt-1 text-sm text-(--brand-muted)">{progressText}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-(--surface-glass-strong) px-4 py-3 shadow-[0_18px_40px_rgba(20,30,50,0.12)]">
                    <div className="flex items-center gap-2 text-sm text-(--brand-muted)">
                        <Timer className="h-4 w-4" />
                        <span>예시 제한 시간</span>
                    </div>

                    <div className="mt-1 text-xl font-semibold tabular-nums text-foreground">
                        {formatMMSS(current.timeLimitSec)}
                    </div>

                    <p className="mt-1 text-xs text-(--brand-muted)">
                        실제 세션에서는 시간 제한이 적용됩니다.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <section className="rounded-3xl border border-white/10 bg-(--surface-glass-strong) p-6 shadow-[0_24px_48px_rgba(20,30,50,0.12)]">
                    <div className="mb-4">
                        <div className="flex items-center gap-2">
                            <p className="text-xs uppercase tracking-[0.2em] text-(--brand-muted)">
                                Question
                            </p>
                            <span
                                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${getQuestionTypeStyle(
                                    current.type.code
                                )}`}
                            >
                                {getQuestionTypeLabel(current.type.code)}
                            </span>
                        </div>

                        <h2 className="mt-1 break-keep text-xl font-semibold text-foreground">
                            {current.title}
                        </h2>

                        {current.type.code !== "BASE" && (
                            <p className="mt-2 text-sm text-(--brand-muted)">
                                {getQuestionGuideText(current.type.code)}
                            </p>
                        )}

                        {!!current.tags.length && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {current.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-(--brand-muted)"
                                    >
                                        {tag}
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
                            <li>상황 → 역할 → 행동 → 결과 순으로 말해 보세요.</li>
                            <li>기술 선택 이유와 트레이드오프를 함께 설명해 보세요.</li>
                            <li>가능하면 실제 프로젝트 경험을 1개 연결해 보세요.</li>
                        </ul>
                    </div>
                </section>

                <section className="rounded-3xl border border-white/10 bg-(--surface-glass-strong) p-6 shadow-[0_24px_48px_rgba(20,30,50,0.12)]">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-(--brand-muted)">
                                Answer
                            </p>
                            <h3 className="mt-1 text-lg font-semibold text-foreground">답변 작성</h3>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button className="rounded-xl" onClick={goPrev} disabled={index === 0}>
                                <ChevronLeft className="mr-1 h-4 w-4" />
                                이전
                            </Button>

                            <Button
                                className="rounded-xl"
                                onClick={index === questions.length - 1 ? completePreview : goNext}
                                disabled={!isCurrentSubmitted}
                            >
                                {index === questions.length - 1 ? "미리보기 완료" : "다음"}
                                {index !== questions.length - 1 && (
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    <textarea
                        value={currentAnswer}
                        onChange={(e) => onChangeAnswer(e.target.value)}
                        disabled={isCurrentSubmitted}
                        className="min-h-70 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-foreground outline-none disabled:cursor-not-allowed disabled:opacity-60"
                        placeholder="미리보기용 답변을 입력해 보세요."
                    />

                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-(--brand-muted)">
                            이 화면은 예시입니다. 실제 저장이나 AI 호출은 일어나지 않습니다.
                        </p>

                        <Button
                            className="rounded-xl"
                            onClick={submitCurrent}
                            disabled={isSubmitting || isCurrentSubmitted}
                        >
                            <Send className="mr-2 h-4 w-4" />
                            {isCurrentSubmitted
                                ? "제출 완료"
                                : isSubmitting
                                    ? "제출 중..."
                                    : "답변 제출"}
                        </Button>
                    </div>

                    {currentFeedback?.status.code === "SUCCEEDED" && (
                        <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                            <div className="flex items-center gap-2">
                                <BadgeCheck className="h-4 w-4 text-emerald-400" />
                                <p className="text-sm font-semibold text-foreground">간단 피드백</p>

                                {typeof currentFeedback.score === "number" && (
                                    <span
                                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${getScoreStyle(
                                            currentFeedback.score
                                        )}`}
                                    >
                                        {currentFeedback.score}점
                                    </span>
                                )}
                            </div>

                            {!!currentFeedback.summary && (
                                <p className="mt-3 text-sm leading-relaxed text-(--brand-muted)">
                                    {currentFeedback.summary}
                                </p>
                            )}

                            {!!currentFeedback.strengths.length && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-foreground">좋았던 점</p>
                                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-(--brand-muted)">
                                        {currentFeedback.strengths.map((item, idx) => (
                                            <li key={`${item}-${idx}`}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {!!currentFeedback.improvements.length && (
                                <div className="mt-4">
                                    <div className="flex items-center gap-2">
                                        <MessageSquareWarning className="h-4 w-4 text-amber-400" />
                                        <p className="text-sm font-medium text-foreground">
                                            보완하면 좋은 점
                                        </p>
                                    </div>
                                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-(--brand-muted)">
                                        {currentFeedback.improvements.map((item, idx) => (
                                            <li key={`${item}-${idx}`}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {!!currentFeedback.modelAnswer && (
                                <div className="mt-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4">
                                    <p className="text-sm font-semibold text-foreground">답변 예시</p>
                                    <p className="mt-2 text-sm leading-relaxed text-(--brand-muted)">
                                        {currentFeedback.modelAnswer}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}

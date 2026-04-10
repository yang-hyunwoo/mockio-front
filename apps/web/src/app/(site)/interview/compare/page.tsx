"use client"

import { useMemo, useState } from "react"
import { ArrowLeftRight, ArrowUpRight, CheckCircle2, ChevronDown, ChevronUp, MessageSquareText, Minus, Sparkles, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

interface DimensionScore {
    structure: number
    clarity: number
    specificity: number
    practicality?: number
    decisionMaking?: number
    tradeOff?: number
}

interface FeedbackSummary {
    headline: string
    summary: string
    strengths: string[]
    improvements: string[]
    improvementTags: string[]
    modelAnswer?: string
}

interface QuestionItem {
    id: string
    type: "basic" | "followup" | "deepdive"
    category: string
    title: string
    question: string
    previousAnswer: string
    currentAnswer: string
    previousScore: number
    currentScore: number
    feedback?: string
}

interface InterviewSnapshot {
    id: number
    title: string
    createdAt: string
    overallScore: number
    totalQuestions: number
    answeredQuestions: number
    dimensions: DimensionScore
    feedback: FeedbackSummary
    questions: QuestionItem[]
}

const previousInterview: InterviewSnapshot = {
    id: 101,
    title: "React 프론트엔드 모의면접 1회차",
    createdAt: "2026.04.02 20:00",
    overallScore: 68,
    totalQuestions: 5,
    answeredQuestions: 5,
    dimensions: {
        structure: 64,
        clarity: 70,
        specificity: 60,
        practicality: 58,
        decisionMaking: 62,
        tradeOff: 55,
    },
    feedback: {
        headline: "기초 개념은 이해하고 있지만 실무 맥락 연결이 약한 상태",
        summary:
            "핵심 개념 자체는 알고 있었지만, 왜 그런 선택을 하는지와 실제 서비스 상황에서의 기준 설명이 부족했습니다.",
        strengths: [
            "React 기본 렌더링 흐름을 큰 틀에서 설명할 수 있었습니다.",
            "상태와 props의 역할 차이를 구분할 수 있었습니다.",
        ],
        improvements: [
            "성능 최적화 기법을 사용할 시점과 근거를 더 구체적으로 설명할 필요가 있습니다.",
            "추상적인 설명보다 실제 장애나 UX 상황을 예시로 연결하면 설득력이 올라갑니다.",
        ],
        improvementTags: ["근거 부족", "실무 예시 부족", "트레이드오프 설명 필요"],
        modelAnswer:
            "예를 들어 React.memo는 무조건 적용하는 것이 아니라, 렌더 비용이 큰 컴포넌트이면서 props 변경 빈도가 낮을 때 효과가 있습니다.",
    },
    questions: [
        {
            id: "q1",
            type: "basic",
            category: "React",
            title: "React.memo 개념",
            question: "React.memo는 무엇이고 언제 사용하는 것이 적절한가요?",
            previousAnswer:
                "컴포넌트가 다시 렌더링되지 않게 막아주는 기능입니다. 성능 최적화에 사용합니다.",
            currentAnswer:
                "React.memo는 props가 동일할 때 함수형 컴포넌트의 재렌더링을 방지하는 메모이제이션 도구입니다. 다만 모든 컴포넌트에 적용하면 비교 비용이 생기므로, 렌더 비용이 큰 컴포넌트이면서 동일 props로 반복 렌더링되는 경우에 우선 검토합니다.",
            previousScore: 60,
            currentScore: 84,
            feedback: "개념 설명에서 사용 기준과 비용까지 언급해 답변 완성도가 높아졌습니다.",
        },
        {
            id: "q2",
            type: "deepdive",
            category: "React",
            title: "useMemo 오남용",
            question: "useMemo를 남용하면 어떤 문제가 생길 수 있나요?",
            previousAnswer:
                "남용하면 코드가 복잡해질 수 있습니다.",
            currentAnswer:
                "useMemo는 계산 비용이 큰 값을 캐싱할 때 의미가 있지만, 가벼운 계산까지 모두 감싸면 오히려 의존성 관리 비용과 가독성 저하가 발생합니다. 또한 잘못된 의존성 배열로 인해 stale value 문제가 생길 수도 있습니다.",
            previousScore: 58,
            currentScore: 81,
            feedback: "단순 단점 나열을 넘어서 실제 유지보수 비용과 버그 포인트를 설명했습니다.",
        },
        {
            id: "q3",
            type: "followup",
            category: "상태관리",
            title: "전역 상태 선택 기준",
            question: "Zustand와 Context API 중 무엇을 선택하겠습니까?",
            previousAnswer:
                "규모가 크면 Zustand를 쓰고 작으면 Context를 쓰겠습니다.",
            currentAnswer:
                "단순 테마나 인증 사용자처럼 변경 빈도가 낮고 범위가 명확하면 Context API로 충분합니다. 반면 여러 페이지에서 자주 변경되는 상태나 selector 최적화가 중요하면 Zustand가 더 유리합니다. 특히 Context는 provider 하위 전체 재렌더링 이슈를 고려해야 합니다.",
            previousScore: 70,
            currentScore: 86,
            feedback: "도구 선택을 크기 기준이 아니라 변경 빈도와 렌더링 특성 기준으로 설명해 좋아졌습니다.",
        },
    ],
}

const currentInterview: InterviewSnapshot = {
    id: 102,
    title: "React 프론트엔드 모의면접 2회차",
    createdAt: "2026.04.09 20:00",
    overallScore: 84,
    totalQuestions: 5,
    answeredQuestions: 5,
    dimensions: {
        structure: 82,
        clarity: 86,
        specificity: 84,
        practicality: 81,
        decisionMaking: 83,
        tradeOff: 78,
    },
    feedback: {
        headline: "개념 이해를 실무 판단 기준으로 연결하기 시작한 상태",
        summary:
            "이전보다 실무형 답변이 많이 늘었고, 단순 정의를 넘어 적용 기준과 장단점을 설명하는 능력이 좋아졌습니다.",
        strengths: [
            "기술 선택 이유를 상황과 비용 기준으로 설명할 수 있습니다.",
            "답변의 구조가 이전보다 안정적이며 핵심부터 말하는 습관이 좋아졌습니다.",
            "성능 최적화 관련 질문에서 남용의 리스크까지 설명했습니다.",
        ],
        improvements: [
            "트레이드오프는 언급했지만 수치나 실제 사례를 더 붙이면 더 강해집니다.",
            "실제 장애 대응 경험처럼 정량적 근거가 추가되면 시니어스러운 답변이 됩니다.",
        ],
        improvementTags: ["실무 적합성 향상", "의사결정 근거 강화", "사례 구체화 필요"],
        modelAnswer:
            "상태관리 도구 선택은 규모 하나가 아니라 변경 빈도, 구독 범위, selector 최적화 필요성, 팀 러닝커브를 함께 보고 판단합니다.",
    },
    questions: previousInterview.questions,
}

const dimensionLabels: Record<string, string> = {
    structure: "구조화",
    clarity: "명확성",
    specificity: "구체성",
    practicality: "실무 적합성",
    decisionMaking: "의사결정 기준",
    tradeOff: "트레이드오프 이해",
}

function getDelta(current: number, previous: number) {
    return current - previous
}

function deltaText(delta: number) {
    if (delta > 0) return `+${delta}`
    return `${delta}`
}

function questionTypeLabel(type: QuestionItem["type"]) {
    if (type === "basic") return "기본 질문"
    if (type === "followup") return "꼬리 질문"
    return "딥다이브"
}

function DeltaBadge({ delta }: { delta: number }) {
    const positive = delta > 0
    const zero = delta === 0

    return (
        <Badge
            variant="outline"
            className={
                zero
                    ? "border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-300"
                    : positive
                        ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
                        : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            }
        >
            {zero ? <Minus className="mr-1 h-3 w-3" /> : <TrendingUp className="mr-1 h-3 w-3" />}
            {deltaText(delta)}
        </Badge>
    )
}

function ScoreRow({ label, previous, current }: { label: string; previous: number; current: number }) {
    const delta = getDelta(current, previous)

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{previous}</span>
                    <ArrowLeftRight className="h-3.5 w-3.5 text-gray-400" />
                    <span className="font-semibold text-gray-900 dark:text-white">{current}</span>
                    <DeltaBadge delta={delta} />
                </div>
            </div>
            <Progress value={current} className="h-2" />
        </div>
    )
}

export default function InterviewComparePage() {
    const [expandedQuestionIds, setExpandedQuestionIds] = useState<string[]>(["q1"])
    const [questionFilter, setQuestionFilter] = useState<"all" | "basic" | "followup" | "deepdive">("all")
    const [showOnlyImproved, setShowOnlyImproved] = useState(false)

    const mergedQuestions = useMemo(() => {
        const mapped = currentInterview.questions.map((current) => {
            const previous = previousInterview.questions.find((item) => item.id === current.id)
            return {
                ...current,
                previousAnswer: previous?.previousAnswer ?? previous?.currentAnswer ?? "",
                previousScore: previous?.previousScore ?? 0,
            }
        })

        return mapped.filter((item) => {
            const typeMatched = questionFilter === "all" || item.type === questionFilter
            const improvedMatched = !showOnlyImproved || item.currentScore > item.previousScore
            return typeMatched && improvedMatched
        })
    }, [questionFilter, showOnlyImproved])

    const toggleQuestion = (questionId: string) => {
        setExpandedQuestionIds((prev) =>
            prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId],
        )
    }

    const totalDelta = currentInterview.overallScore - previousInterview.overallScore

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="rounded-full px-3 py-1">면접 비교</Badge>
                        <Badge variant="outline" className="rounded-full px-3 py-1">이전 대비 성장 추적</Badge>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">면접 비교하기</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        이전 면접과 현재 면접의 점수, 답변 내용, 개선 포인트를 한눈에 비교합니다.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline">이전 면접 상세</Button>
                    <Button variant="outline">현재 면접 상세</Button>
                    <Button>AI 성장 요약 다시 생성</Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 rounded-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <ArrowLeftRight className="h-5 w-5" />
                            전체 점수 비교
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-2xl border p-5">
                                <div className="text-sm text-gray-500 dark:text-gray-400">이전 면접</div>
                                <div className="mt-2 text-3xl font-bold">{previousInterview.overallScore}</div>
                                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">{previousInterview.createdAt}</div>
                            </div>

                            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-5 text-center">
                                <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">변화량</div>
                                <div className="text-4xl font-bold text-green-600 dark:text-green-400">+{totalDelta}</div>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    전반적인 답변 품질이 향상되었습니다.
                                </p>
                            </div>

                            <div className="rounded-2xl border p-5">
                                <div className="text-sm text-gray-500 dark:text-gray-400">현재 면접</div>
                                <div className="mt-2 flex items-center gap-2 text-3xl font-bold">
                                    {currentInterview.overallScore}
                                    <ArrowUpRight className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">{currentInterview.createdAt}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Sparkles className="h-5 w-5" />
                            AI 성장 요약
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">한 줄 총평</div>
                            <p className="mt-2 font-semibold text-gray-900 dark:text-white">{currentInterview.feedback.headline}</p>
                        </div>
                        <Separator />
                        <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">
                            {currentInterview.feedback.summary}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {currentInterview.feedback.improvementTags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="rounded-full">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-lg">항목별 점수 변화</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {Object.entries(dimensionLabels).map(([key, label]) => {
                            const previous = previousInterview.dimensions[key as keyof DimensionScore] ?? 0
                            const current = currentInterview.dimensions[key as keyof DimensionScore] ?? 0
                            return <ScoreRow key={key} label={label} previous={previous} current={current} />
                        })}
                    </CardContent>
                </Card>

                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-lg">강점 / 개선점 비교</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-5 md:grid-cols-2">
                        <div>
                            <div className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">현재 강점</div>
                            <div className="space-y-3">
                                {currentInterview.feedback.strengths.map((item) => (
                                    <div key={item} className="flex items-start gap-2 rounded-xl border p-3">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600 dark:text-green-400" />
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">다음 개선 포인트</div>
                            <div className="space-y-3">
                                {currentInterview.feedback.improvements.map((item) => (
                                    <div key={item} className="rounded-xl border p-3">
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-6 rounded-2xl">
                <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <MessageSquareText className="h-5 w-5" />
                        질문별 비교
                    </CardTitle>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={questionFilter === "all" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setQuestionFilter("all")}
                        >
                            전체
                        </Button>
                        <Button
                            variant={questionFilter === "basic" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setQuestionFilter("basic")}
                        >
                            기본 질문
                        </Button>
                        <Button
                            variant={questionFilter === "followup" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setQuestionFilter("followup")}
                        >
                            꼬리 질문
                        </Button>
                        <Button
                            variant={questionFilter === "deepdive" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setQuestionFilter("deepdive")}
                        >
                            딥다이브
                        </Button>
                        <Button
                            variant={showOnlyImproved ? "default" : "outline"}
                            size="sm"
                            onClick={() => setShowOnlyImproved((prev) => !prev)}
                        >
                            향상된 답변만
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {mergedQuestions.map((question) => {
                        const expanded = expandedQuestionIds.includes(question.id)
                        const delta = question.currentScore - question.previousScore

                        return (
                            <div key={question.id} className="overflow-hidden rounded-2xl border">
                                <button
                                    type="button"
                                    onClick={() => toggleQuestion(question.id)}
                                    className="flex w-full items-center justify-between gap-4 bg-white px-5 py-4 text-left transition hover:bg-gray-50 dark:bg-gray-950 dark:hover:bg-gray-900"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-2 flex flex-wrap items-center gap-2">
                                            <Badge variant="outline">{questionTypeLabel(question.type)}</Badge>
                                            <Badge variant="secondary">{question.category}</Badge>
                                        </div>
                                        <div className="font-semibold text-gray-900 dark:text-white">{question.title}</div>
                                        <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{question.question}</p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">점수 변화</div>
                                            <div className="mt-1 flex items-center gap-2">
                                                <span className="text-sm text-gray-500 dark:text-gray-400">{question.previousScore}</span>
                                                <ArrowLeftRight className="h-3.5 w-3.5 text-gray-400" />
                                                <span className="font-semibold text-gray-900 dark:text-white">{question.currentScore}</span>
                                                <DeltaBadge delta={delta} />
                                            </div>
                                        </div>
                                        {expanded ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                                    </div>
                                </button>

                                {expanded && (
                                    <div className="border-t bg-gray-50/70 px-5 py-5 dark:bg-gray-900/40">
                                        <div className="grid gap-4 xl:grid-cols-2">
                                            <div className="rounded-2xl border bg-white p-4 dark:bg-gray-950">
                                                <div className="mb-3 flex items-center justify-between">
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">이전 답변</div>
                                                    <Badge variant="outline">{question.previousScore}점</Badge>
                                                </div>
                                                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-gray-300">
                                                    {question.previousAnswer}
                                                </p>
                                            </div>

                                            <div className="rounded-2xl border bg-white p-4 dark:bg-gray-950">
                                                <div className="mb-3 flex items-center justify-between">
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">현재 답변</div>
                                                    <Badge>{question.currentScore}점</Badge>
                                                </div>
                                                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-gray-300">
                                                    {question.currentAnswer}
                                                </p>
                                            </div>
                                        </div>

                                        {question.feedback && (
                                            <div className="mt-4 rounded-2xl border border-dashed p-4">
                                                <div className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">AI 코멘트</div>
                                                <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">{question.feedback}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
        </div>
    )
}

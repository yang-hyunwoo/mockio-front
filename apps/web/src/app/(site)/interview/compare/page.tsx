"use client"

import { useEffect, useMemo, useState } from "react"
import {
    ArrowLeftRight,
    ArrowUpRight,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    MessageSquareText,
    Minus,
    Sparkles,
    TrendingUp,
    Loader2,
    AlertCircle, ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {useRouter, useSearchParams} from "next/navigation"
import { CompareInterviewApi } from "@/lib/api/interview/CompareInterviewApi"
import { CompareSummaryInterviewApi } from "@/lib/api/interview/CompareSummaryInterviewApi"
import {
    CompareQuestionApi,
    GetCompareQuestionApi,
} from "@/lib/api/interview/CompareQuestionApi"
import {router} from "next/client";
import Link from "next/link";

interface DimensionScore {
    structure: number
    clarity: number
    specificity: number
}

interface JobMetricScore {
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
}

interface QuestionItem {
    currentQuestionId: number
    prevQuestionId: number
    title: string
    seq: number
    previousAnswer: string
    currentAnswer: string
    previousScore: number
    currentScore: number
}

type CompareQuestionStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"

interface QuestionAiFeedback {
    id: number
    questionId: number
    headline: string
    summary: string
    strengths: string[]
    improvements: string[]
    improvementTags?: string[]
    verdict?: string
    status: CompareQuestionStatus
    errorMessage?: string | null
}

interface CompareQuestionResponse {
    id: number
    interviewId: number
    currentQuestionId: number
    prevQuestionId: number
    status: CompareQuestionStatus
    headline?: string | null
    summary?: string | null
    strengths?: string[] | null
    improvements?: string[] | null
    improvementTags?: string[] | null
    verdict?: string | null
    errorMessage?: string | null
}

interface InterviewSnapshot {
    interviewId: number
    createdAt: string
    overallScore: number
    answeredQuestions: number
    dimensions: DimensionScore
    jobMetrics: JobMetricScore
}

interface ComparePageData {
    currentInterview: InterviewSnapshot
    previousInterview: InterviewSnapshot
    questionItem: QuestionItem[]
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

function getQuestionKind(seq: number): "basic" | "followup" | "deepdive" | "unknown" {
    const lastDigit = seq % 10

    if (lastDigit === 0) return "basic"
    if (lastDigit === 5) return "followup"
    if (lastDigit === 6) return "deepdive"

    return "unknown"
}

function questionTypeLabel(seq: number) {
    const kind = getQuestionKind(seq)

    if (kind === "basic") return "기본 질문"
    if (kind === "followup") return "추가 질문"
    if (kind === "deepdive") return "심화 질문"

    return "기타 질문"
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
            {zero ? (
                <Minus className="mr-1 h-3 w-3" />
            ) : (
                <TrendingUp className="mr-1 h-3 w-3" />
            )}
            {deltaText(delta)}
        </Badge>
    )
}


function ScoreRow({
                      label,
                      previous,
                      current,
                  }: {
    label: string
    previous: number
    current: number
}) {
    const delta = getDelta(current, previous)

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
        </span>
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{previous}</span>
                    <ArrowLeftRight className="h-3.5 w-3.5 text-gray-400" />
                    <span className="font-semibold text-gray-900 dark:text-white">
            {current}
          </span>
                    <DeltaBadge delta={delta} />
                </div>
            </div>
            <Progress value={current} className="h-2" />
        </div>
    )
}

function QuestionAiFeedbackCard({
                                    feedback,
                                    loading,
                                }: {
    feedback?: QuestionAiFeedback
    loading?: boolean
}) {
    if (loading) {
        return (
            <div className="mt-4 rounded-2xl border bg-white p-4 dark:bg-gray-950">
                <div className="mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
            AI 평가
          </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>이 질문을 AI가 평가 중입니다...</span>
                </div>
            </div>
        )
    }

    if (!feedback) {
        return (
            <div className="mt-4 rounded-2xl border bg-white p-4 dark:bg-gray-950">
                <div className="mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
            AI 평가
          </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    아직 이 질문에 대한 AI 평가가 없습니다.
                </p>
            </div>
        )
    }

    if (feedback.status === "PENDING" || feedback.status === "PROCESSING") {
        return (
            <div className="mt-4 rounded-2xl border bg-white p-4 dark:bg-gray-950">
                <div className="mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
            AI 평가
          </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>
            {feedback.status === "PENDING"
                ? "평가 요청이 접수되었습니다."
                : "AI가 비교 분석 중입니다."}
          </span>
                </div>
            </div>
        )
    }

    if (feedback.status === "FAILED") {
        return (
            <div className="mt-4 rounded-2xl border bg-white p-4 dark:bg-gray-950">
                <div className="mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
            AI 평가
          </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <span>{feedback.errorMessage || "AI 평가 생성에 실패했습니다."}</span>
                </div>
            </div>
        )
    }

    return (
        <div className="mt-4 rounded-2xl border bg-white p-4 dark:bg-gray-950">
            <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
          AI 평가
        </span>
            </div>

            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {feedback.headline}
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
                {feedback.summary}
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                    <div className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                        강점
                    </div>
                    {feedback.strengths.length > 0 ? (
                        <div className="space-y-2">
                            {feedback.strengths.map((item) => (
                                <div
                                    key={item}
                                    className="flex items-start gap-2 rounded-xl border p-3"
                                >
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600 dark:text-green-400" />
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {item}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            강점 정보가 없습니다.
                        </p>
                    )}
                </div>

                <div>
                    <div className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                        개선 포인트
                    </div>
                    {feedback.improvements.length > 0 ? (
                        <div className="space-y-2">
                            {feedback.improvements.map((item) => (
                                <div key={item} className="rounded-xl border p-3">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {item}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            개선 포인트가 없습니다.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

function normalizeQuestionFeedback(data: CompareQuestionResponse): QuestionAiFeedback {
    return {
        id: data.id,
        questionId: data.currentQuestionId,
        headline: data.headline ?? "",
        summary: data.summary ?? "",
        strengths: data.strengths ?? [],
        improvements: data.improvements ?? [],
        improvementTags: data.improvementTags ?? [],
        verdict: data.verdict ?? undefined,
        status: data.status,
        errorMessage: data.errorMessage ?? null,
    }
}

export default function InterviewComparePage() {
    const [compareData, setCompareData] = useState<ComparePageData | null>(null)
    const [aiSummary, setAiSummary] = useState<FeedbackSummary | null>(null)
    const [questionAiMap, setQuestionAiMap] = useState<Record<number, QuestionAiFeedback>>({})
    const [questionAiLoadingMap, setQuestionAiLoadingMap] = useState<Record<number, boolean>>({})

    const [compareLoading, setCompareLoading] = useState(true)
    const [aiLoading, setAiLoading] = useState(false)

    const searchParams = useSearchParams()
    const router = useRouter()
    const [expandedQuestionIds, setExpandedQuestionIds] = useState<string[]>([])
    const [questionView, setQuestionView] = useState<"basic" | "additional">("basic")
    const [showOnlyImproved, setShowOnlyImproved] = useState(false)

    function moveToInterviewDetail(targetInterviewId: number) {
        const returnTo = `${window.location.pathname}${window.location.search}`

        router.push(
            `/interview/history/${targetInterviewId}?returnTo=${encodeURIComponent(returnTo)}`
        )
    }



    useEffect(() => {
        const fetchCompareData = async () => {
            const interviewId = searchParams.get("interviewId")
            if (!interviewId) return

            try {
                setCompareLoading(true)
                const data = await CompareInterviewApi(Number(interviewId))
                setCompareData(data)
            } catch (e) {
                console.error("비교 데이터 조회 실패", e)
                setCompareData(null)
            } finally {
                setCompareLoading(false)
            }
        }

        void fetchCompareData()
    }, [searchParams])

    useEffect(() => {
        const fetchAiSummary = async () => {
            if (!compareData) return

            try {
                setAiLoading(true)
                const summary = await CompareSummaryInterviewApi(compareData.currentInterview.interviewId)
                setAiSummary(summary)
            } catch (e) {
                console.error("AI 비교 요약 조회 실패", e)
                setAiSummary(null)
            } finally {
                setAiLoading(false)
            }
        }

        void fetchAiSummary()
    }, [compareData])

    const pollCompareQuestion = async (compareQuestionId: number) => {
        const maxRetry = 20

        for (let i = 0; i < maxRetry; i++) {
            const result = await GetCompareQuestionApi(compareQuestionId)

            if (result.status === "COMPLETED") {
                return result
            }

            if (result.status === "FAILED") {
                return result
            }

            await new Promise((resolve) => setTimeout(resolve, 1500))
        }
        await new Promise((r) => setTimeout(r, 1500))
        throw new Error("질문 비교 AI 평가 조회 타임아웃")
    }

    const fetchQuestionAiFeedback = async (
        interviewId: number,
        currentQuestionId: number,
        prevQuestionId: number
    ) => {
        if (questionAiMap[currentQuestionId] || questionAiLoadingMap[currentQuestionId]) return

        try {
            setQuestionAiLoadingMap((prev) => ({
                ...prev,
                [currentQuestionId]: true,
            }))

            const payload = {
                interviewId,
                currentQuestionId,
                prevQuestionId,
            }

            const initialResponse: CompareQuestionResponse = await CompareQuestionApi(payload)

            const initialFeedback = normalizeQuestionFeedback(initialResponse)

            if (initialResponse.status === "COMPLETED" || initialResponse.status === "FAILED") {
                setQuestionAiMap((prev) => ({
                    ...prev,
                    [currentQuestionId]: initialFeedback,
                }))
                return
            }

            setQuestionAiMap((prev) => ({
                ...prev,
                [currentQuestionId]: initialFeedback,
            }))

            const finalResponse = await pollCompareQuestion(initialResponse.id)

            setQuestionAiMap((prev) => ({
                ...prev,
                [currentQuestionId]: normalizeQuestionFeedback(finalResponse),
            }))
        } catch (e) {
            console.error("질문 AI 평가 조회 실패", e)
            setQuestionAiMap((prev) => ({
                ...prev,
                [currentQuestionId]: {
                    id: -1,
                    questionId: currentQuestionId,
                    headline: "",
                    summary: "",
                    strengths: [],
                    improvements: [],
                    status: "FAILED",
                    errorMessage: "질문 AI 평가를 불러오지 못했습니다.",
                },
            }))
        } finally {
            setQuestionAiLoadingMap((prev) => ({
                ...prev,
                [currentQuestionId]: false,
            }))
        }
    }

    const handleRegenerateAiSummary = async () => {
        if (!compareData) return

        try {
            setAiLoading(true)
            // TODO: 재생성 API 연결
        } catch (e) {
            console.error("AI 비교 요약 재생성 실패", e)
        } finally {
            setAiLoading(false)
        }
    }

    const toggleQuestion = (currentQuestionId: string, prevQuestionId: string) => {
        const isExpanded = expandedQuestionIds.includes(currentQuestionId)

        setExpandedQuestionIds((prev) =>
            isExpanded ? prev.filter((id) => id !== currentQuestionId) : [...prev, currentQuestionId]
        )

        if (!isExpanded) {
            const interviewId = searchParams.get("interviewId")
            if (!interviewId) return

            void fetchQuestionAiFeedback(
                Number(interviewId),
                Number(currentQuestionId),
                Number(prevQuestionId)
            )
        }
    }



    const filteredQuestions = useMemo(() => {
        if (!compareData) return []

        return compareData.questionItem.filter((q) => {
            const kind = getQuestionKind(q.seq)

            const viewMatched =
                questionView === "basic"
                    ? kind === "basic"
                    : kind === "followup" || kind === "deepdive"

            const improvedMatched = !showOnlyImproved || q.currentScore > q.previousScore

            return viewMatched && improvedMatched
        })
    }, [compareData, questionView, showOnlyImproved])

    const additionalSummary = useMemo(() => {
        if (!compareData) {
            return {
                previousFollowupCount: 0,
                currentFollowupCount: 0,
                previousDeepDiveCount: 0,
                currentDeepDiveCount: 0,
                previousAdditionalAvg: 0,
                currentAdditionalAvg: 0,
            }
        }

        const additionalQuestions = compareData.questionItem.filter((q) => {
            const kind = getQuestionKind(q.seq)
            return kind === "followup" || kind === "deepdive"
        })

        const prevFollowups = additionalQuestions.filter((q) => getQuestionKind(q.seq) === "followup" && q.prevQuestionId != null)
        const currentFollowups = additionalQuestions.filter((q) => getQuestionKind(q.seq) === "followup")
        const prevDeepdives = additionalQuestions.filter((q) => getQuestionKind(q.seq) === "deepdive" && q.prevQuestionId != null)
        const currentDeepdives = additionalQuestions.filter((q) => getQuestionKind(q.seq) === "deepdive")

        const previousAdditionalAvg =
            additionalQuestions.length > 0
                ? Math.round(
                    additionalQuestions.reduce((sum, q) => sum + q.previousScore, 0) /
                    additionalQuestions.length
                )
                : 0

        const currentAdditionalAvg =
            additionalQuestions.length > 0
                ? Math.round(
                    additionalQuestions.reduce((sum, q) => sum + q.currentScore, 0) /
                    additionalQuestions.length
                )
                : 0

        return {
            previousFollowupCount: prevFollowups.length,
            currentFollowupCount: currentFollowups.length,
            previousDeepDiveCount: prevDeepdives.length,
            currentDeepDiveCount: currentDeepdives.length,
            previousAdditionalAvg,
            currentAdditionalAvg,
        }
    }, [compareData])

    if (compareLoading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
                <div className="space-y-6">
                    <div className="h-10 w-56 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="h-64 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800 lg:col-span-2" />
                        <div className="h-64 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
                    </div>
                    <div className="h-96 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
                </div>
            </div>
        )
    }

    if (!compareData) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-10 md:px-6 lg:px-8">
                <Card className="rounded-2xl">
                    <CardContent className="py-16 text-center">
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            비교 데이터를 불러오지 못했습니다.
                        </p>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            잠시 후 다시 시도해주세요.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const { previousInterview, currentInterview } = compareData
    const totalDelta = currentInterview.overallScore - previousInterview.overallScore

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8">
                <div className="mb-6">
                    <Link
                        href="/interview/history"
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        면접 기록으로 돌아가기
                    </Link>
                </div>

                <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="rounded-full px-3 py-1">
                                면접 비교
                            </Badge>
                            <Badge variant="outline" className="rounded-full px-3 py-1">
                                이전 대비 성장 추적
                            </Badge>
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            면접 비교하기
                        </h1>

                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                            이전 면접과 현재 면접의 점수와 답변 내용을 비교합니다.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => moveToInterviewDetail(previousInterview.interviewId)}
                        >
                            이전 면접 상세
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => moveToInterviewDetail(currentInterview.interviewId)}
                        >
                            현재 면접 상세
                        </Button>
                        {/*<Button onClick={handleRegenerateAiSummary} disabled={aiLoading}>*/}
                        {/*    {aiLoading ? "AI 요약 생성 중..." : "AI 성장 요약 다시 생성"}*/}
                        {/*</Button>*/}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="rounded-2xl lg:col-span-2">
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
                                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    {previousInterview.createdAt}
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-5 text-center">
                                <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">변화량</div>
                                <div
                                    className={`text-4xl font-bold ${
                                        totalDelta >= 0
                                            ? "text-green-600 dark:text-green-400"
                                            : "text-red-600 dark:text-red-400"
                                    }`}
                                >
                                    {deltaText(totalDelta)}
                                </div>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    이전 대비 전체 평가 점수 변화입니다.
                                </p>
                            </div>

                            <div className="rounded-2xl border p-5">
                                <div className="text-sm text-gray-500 dark:text-gray-400">현재 면접</div>
                                <div className="mt-2 flex items-center gap-2 text-3xl font-bold">
                                    {currentInterview.overallScore}
                                    {totalDelta > 0 && (
                                        <ArrowUpRight className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    )}
                                </div>
                                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    {currentInterview.createdAt}
                                </div>
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
                        {aiLoading ? (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>성장 요약을 AI가 평가 중입니다...</span>
                                </div>
                        ) : aiSummary ? (
                            <>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">한 줄 총평</div>
                                    <p className="mt-2 font-semibold text-gray-900 dark:text-white">
                                        {aiSummary.headline}
                                    </p>
                                </div>

                                <Separator />

                                <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">
                                    {aiSummary.summary}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {aiSummary.improvementTags.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="rounded-full">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                AI 성장 요약을 불러오지 못했습니다.
                            </p>
                        )}
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

                            return (
                                <ScoreRow key={key} label={label} previous={previous} current={current} />
                            )
                        })}
                    </CardContent>
                </Card>

                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-lg">강점 / 개선점 비교</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-5 md:grid-cols-2">
                        <div>
                            <div className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                                현재 강점
                            </div>
                            {aiLoading ? (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>강점을 AI가 평가 중입니다...</span>
                                    </div>
                            ) : aiSummary?.strengths?.length ? (
                                <div className="space-y-3">
                                    {aiSummary.strengths.map((item) => (
                                        <div key={item} className="flex items-start gap-2 rounded-xl border p-3">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-600 dark:text-green-400" />
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    아직 AI 강점 요약이 없습니다.
                                </p>
                            )}
                        </div>

                        <div>
                            <div className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                                다음 개선 포인트
                            </div>
                            {aiLoading ? (
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>개선 포인트를 AI가 평가 중입니다...</span>
                                    </div>
                            ) : aiSummary?.improvements?.length ? (
                                <div className="space-y-3">
                                    {aiSummary.improvements.map((item) => (
                                        <div key={item} className="rounded-xl border p-3">
                                            <p className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    아직 AI 개선 포인트가 없습니다.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-6 rounded-2xl">
                <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <MessageSquareText className="h-5 w-5" />
                        {questionView === "basic" ? "기본 질문 비교" : "추가 질문 대응"}
                    </CardTitle>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={questionView === "basic" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setQuestionView("basic")}
                        >
                            기본 질문 비교
                        </Button>
                        <Button
                            variant={questionView === "additional" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setQuestionView("additional")}
                        >
                            추가 질문 대응
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
                    {questionView === "basic" ? (
                        filteredQuestions.length > 0 ? (
                            filteredQuestions.map((q) => {
                                const expanded = expandedQuestionIds.includes(String(q.currentQuestionId))
                                const delta = q.currentScore - q.previousScore

                                return (
                                    <div key={q.currentQuestionId} className="overflow-hidden rounded-2xl border">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                toggleQuestion(String(q.currentQuestionId), String(q.prevQuestionId))
                                            }
                                            className="flex w-full items-center justify-between gap-4 bg-white px-5 py-4 text-left hover:bg-gray-50 dark:bg-gray-950 dark:hover:bg-gray-900"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                                    <Badge variant="outline">{questionTypeLabel(q.seq)}</Badge>
                                                    <Badge variant="secondary">Q{q.seq / 10}</Badge>
                                                </div>

                                                <div className="font-semibold text-gray-900 dark:text-white">
                                                    {q.title}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <div className="text-sm text-gray-500">점수 변화</div>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <span className="text-sm text-gray-500">{q.previousScore}</span>
                                                        <ArrowLeftRight className="h-3.5 w-3.5 text-gray-400" />
                                                        <span className="font-semibold">{q.currentScore}</span>
                                                        <DeltaBadge delta={delta} />
                                                    </div>
                                                </div>
                                                {expanded ? (
                                                    <ChevronUp className="h-5 w-5 text-gray-500" />
                                                ) : (
                                                    <ChevronDown className="h-5 w-5 text-gray-500" />
                                                )}
                                            </div>
                                        </button>

                                        {expanded && (
                                            <div className="border-t bg-gray-50/70 px-5 py-5 dark:bg-gray-900/40">
                                                <div className="grid gap-4 xl:grid-cols-2">
                                                    <div className="rounded-2xl border bg-white p-4 dark:bg-gray-950">
                                                        <div className="mb-3 flex justify-between">
                                                            <span className="text-sm font-semibold">이전 답변</span>
                                                            <Badge variant="outline">{q.previousScore}점</Badge>
                                                        </div>
                                                        <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">
                                                            {q.previousAnswer}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-2xl border bg-white p-4 dark:bg-gray-950">
                                                        <div className="mb-3 flex justify-between">
                                                            <span className="text-sm font-semibold">현재 답변</span>
                                                            <Badge>{q.currentScore}점</Badge>
                                                        </div>
                                                        <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">
                                                            {q.currentAnswer}
                                                        </p>
                                                    </div>
                                                </div>

                                                <QuestionAiFeedbackCard
                                                    feedback={questionAiMap[q.currentQuestionId]}
                                                    loading={questionAiLoadingMap[q.currentQuestionId]}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )
                            })
                        ) : (
                            <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-gray-600 dark:text-gray-400">
                                비교할 기본 질문이 없습니다.
                            </div>
                        )
                    ) : (
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-2xl border p-5">
                                <div className="text-sm text-gray-500 dark:text-gray-400">추가 질문 수</div>
                                <div className="mt-3 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
                                    {additionalSummary.previousFollowupCount}
                                    <ArrowLeftRight className="h-4 w-4 text-gray-400" />
                                    {additionalSummary.currentFollowupCount}
                                </div>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    이전과 현재의 추가 질문 대응 개수입니다.
                                </p>
                            </div>

                            <div className="rounded-2xl border p-5">
                                <div className="text-sm text-gray-500 dark:text-gray-400">심화 질문 수</div>
                                <div className="mt-3 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
                                    {additionalSummary.previousDeepDiveCount}
                                    <ArrowLeftRight className="h-4 w-4 text-gray-400" />
                                    {additionalSummary.currentDeepDiveCount}
                                </div>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    이전과 현재의 심화 질문 대응 개수입니다.
                                </p>
                            </div>

                            <div className="rounded-2xl border p-5">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    추가 질문 평균 점수
                                </div>
                                <div className="mt-3 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
                                    {additionalSummary.previousAdditionalAvg}
                                    <ArrowLeftRight className="h-4 w-4 text-gray-400" />
                                    {additionalSummary.currentAdditionalAvg}
                                </div>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    추가 질문과 심화 질문을 합친 평균 점수입니다.
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
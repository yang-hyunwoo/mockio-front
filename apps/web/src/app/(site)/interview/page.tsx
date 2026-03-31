"use client"

import { useEffect, useRef, useState } from "react"
import {
    ChevronLeft,
    ChevronRight,
    Send,
    Timer,
    MessageSquareWarning,
    BadgeCheck,
    XCircle,
    Mic,
    Square,
    RotateCcw,
    Volume2,
} from "lucide-react"
import Button from "@/components/Common/Button"
import { InterviewQuestionApi } from "@/lib/api/interview/InterviewQuestionApi"
import { InterviewQuestion } from "@mockio/shared/src/api/interview/InterviewQuestion"
import { InterviewAnswerApi } from "@/lib/api/interview/InterviewAnswerApi"
import { InterviewAnswerReadApi } from "@/lib/api/interview/InterviewAnswerReadApi"
import { FeedbackDetailApi } from "@/lib/api/interview/FeedbackDetailApi"
import { FeedbackResponse } from "@mockio/shared/src/api/interview/FeedbackDetail"
import { InterviewExitApi } from "@/lib/api/interview/InterviewExitApi"
import { InterviewSttApi } from "@/lib/api/interview/InterviewSttApi"

type AnswerMode = "TEXT" | "VOICE"

export default function InterviewPage() {
    const [questions, setQuestions] = useState<InterviewQuestion[]>([])
    const [index, setIndex] = useState(0)
    const [isInitializing, setIsInitializing] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)
    const [isTerminating, setIsTerminating] = useState(false)
    const [isExited, setIsExited] = useState(false)

    const [answerMode, setAnswerMode] = useState<AnswerMode>("TEXT")

    const [answers, setAnswers] = useState<Record<number, string>>({})
    const [feedbackByQuestionId, setFeedbackByQuestionId] = useState<Record<number, FeedbackResponse>>({})
    const [submittedQuestionIds, setSubmittedQuestionIds] = useState<Record<number, boolean>>({})
    const [expiredQuestionIds, setExpiredQuestionIds] = useState<Record<number, boolean>>({})
    const [startedAtByQuestionId, setStartedAtByQuestionId] = useState<Record<number, number>>({})
    const [deadlineAtByQuestionId, setDeadlineAtByQuestionId] = useState<Record<number, number>>({})
    const [submittedDurationByQuestionId, setSubmittedDurationByQuestionId] = useState<Record<number, number>>({})
    const [now, setNow] = useState(Date.now())

    const [audioUrlByQuestionId, setAudioUrlByQuestionId] = useState<Record<number, string>>({})
    const [audioFileByQuestionId, setAudioFileByQuestionId] = useState<Record<number, File>>({})
    const [isRecording, setIsRecording] = useState(false)
    const [recordingQuestionId, setRecordingQuestionId] = useState<number | null>(null)
    const [isTranscribing, setIsTranscribing] = useState(false)

    const initializedRef = useRef(false)
    const startInterviewKeyRef = useRef<string | null>(null)
    const feedbackPollingMapRef = useRef<Record<number, number | null>>({})

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const audioChunksRef = useRef<Blob[]>([])

    const current = questions[index]

    useEffect(() => {
        if (initializedRef.current) return
        initializedRef.current = true

        if (!startInterviewKeyRef.current) {
            startInterviewKeyRef.current = crypto.randomUUID()
        }

        setIsInitializing(true)

        const fetchInterview = async () => {
            try {
                const result = await InterviewQuestionApi({
                    idempotencyKey: startInterviewKeyRef.current!,
                })

                if (!result) {
                    setIsInitializing(false)
                    return
                }

                setAnswerMode((result.interviewMode?.code as AnswerMode) ?? "TEXT")

                if (result.completed) {
                    setIsCompleted(true)
                    setQuestions([])
                    setIsInitializing(false)
                    return
                }

                const mappedQuestions: InterviewQuestion[] = (result.questions ?? []).map((q) => ({
                    id: q.id,
                    interviewId: q.interviewId,
                    title: q.title,
                    questionText: q.questionText,
                    tags: q.tags ?? [],
                    timeLimitSec: result.answerTimeSeconds,
                    type: q.type,
                    seq: q.seq,
                }))

                setQuestions(mappedQuestions)
                setIndex(0)
            } finally {
                setIsInitializing(false)
            }
        }

        void fetchInterview()
    }, [])

    useEffect(() => {
        const timerId = window.setInterval(() => {
            setNow(Date.now())
        }, 1000)

        return () => {
            window.clearInterval(timerId)
        }
    }, [])

    useEffect(() => {
        if (!current) return

        const fetchAnswerAndFeedback = async () => {
            const res = await InterviewAnswerReadApi(current.id)

            if (res) {
                setAnswers((prev) => ({
                    ...prev,
                    [current.id]: res.answerText ?? "",
                }))

                setSubmittedQuestionIds((prev) => ({
                    ...prev,
                    [current.id]: true,
                }))

                setSubmittedDurationByQuestionId((prev) => ({
                    ...prev,
                    [current.id]: res.answerDurationSeconds ?? 0,
                }))
            }

            const feedbackRes = await FeedbackDetailApi(current.id)

            if (feedbackRes) {
                setFeedbackByQuestionId((prev) => ({
                    ...prev,
                    [current.id]: feedbackRes,
                }))

                if (feedbackRes.status.code === "PENDING") {
                    startFeedbackPolling(current.id)
                }
            }
        }

        void fetchAnswerAndFeedback()
    }, [current?.id])

    useEffect(() => {
        if (!current) return
        if (startedAtByQuestionId[current.id]) return

        const startedAt = Date.now()

        setStartedAtByQuestionId((prev) => ({
            ...prev,
            [current.id]: startedAt,
        }))

        setDeadlineAtByQuestionId((prev) => ({
            ...prev,
            [current.id]: startedAt + (current.timeLimitSec ?? 0) * 1000,
        }))
    }, [current?.id, current?.timeLimitSec, startedAtByQuestionId])

    useEffect(() => {
        return () => {
            Object.values(feedbackPollingMapRef.current).forEach((timerId) => {
                if (timerId) {
                    window.clearInterval(timerId)
                }
            })

            Object.values(audioUrlByQuestionId).forEach((url) => {
                URL.revokeObjectURL(url)
            })

            stopStreamTracks()
        }
    }, [audioUrlByQuestionId])

    const isCurrentSubmitted = current ? !!submittedQuestionIds[current.id] : false
    const isCurrentExpired = current ? !!expiredQuestionIds[current.id] : false

    const currentStartedAt = current ? startedAtByQuestionId[current.id] : null
    const currentDeadlineAt = current ? deadlineAtByQuestionId[current.id] : null
    const submittedDuration = current ? submittedDurationByQuestionId[current.id] ?? 0 : 0

    const elapsedSec =
        currentStartedAt
            ? Math.max(Math.floor((now - currentStartedAt) / 1000), 0)
            : 0

    const remainingSec =
        currentDeadlineAt
            ? Math.max(Math.floor((currentDeadlineAt - now + 999) / 1000), 0)
            : (current?.timeLimitSec ?? 0)

    const currentAnswer = current ? answers[current.id] ?? "" : ""
    const currentFeedback = current ? feedbackByQuestionId[current.id] : null
    const currentAudioUrl = current ? audioUrlByQuestionId[current.id] : ""
    const isCurrentRecording = isRecording && recordingQuestionId === current?.id

    const isFeedbackPending = currentFeedback?.status.code === "PENDING"
    const isFeedbackSucceeded = currentFeedback?.status.code === "SUCCEEDED"
    const isFeedbackFailed = currentFeedback?.status.code === "FAILED"
    const isFeedbackSkipped = currentFeedback?.status.code === "SKIPPED"

    const displaySec = isCurrentSubmitted ? submittedDuration : remainingSec
    const timerLabel = isCurrentSubmitted ? "답변 시간" : "남은 시간"

    const onChangeAnswer = (text: string) => {
        if (!current) return
        if (isCurrentSubmitted || isCurrentExpired) return

        setAnswers((prev) => ({
            ...prev,
            [current.id]: text,
        }))
    }

    const goPrev = () => {
        setIndex((v) => Math.max(v - 1, 0))
    }

    const goNext = () => {
        if (!current) return
        if (!submittedQuestionIds[current.id]) return

        setIndex((v) => Math.min(v + 1, questions.length - 1))
    }

    const startFeedbackPolling = (questionId: number) => {
        const existingTimer = feedbackPollingMapRef.current[questionId]
        if (existingTimer) {
            window.clearInterval(existingTimer)
        }

        let retryCount = 0
        const maxRetry = 15

        const timerId = window.setInterval(async () => {
            retryCount += 1

            const feedbackRes = await FeedbackDetailApi(questionId)

            if (!feedbackRes) {
                if (retryCount >= maxRetry) {
                    const currentTimer = feedbackPollingMapRef.current[questionId]
                    if (currentTimer) {
                        window.clearInterval(currentTimer)
                        feedbackPollingMapRef.current[questionId] = null
                    }
                }
                return
            }

            setFeedbackByQuestionId((prev) => ({
                ...prev,
                [questionId]: feedbackRes,
            }))

            if (
                feedbackRes.status.code === "SUCCEEDED" ||
                feedbackRes.status.code === "FAILED" ||
                retryCount >= maxRetry
            ) {
                const currentTimer = feedbackPollingMapRef.current[questionId]
                if (currentTimer) {
                    window.clearInterval(currentTimer)
                    feedbackPollingMapRef.current[questionId] = null
                }
            }
        }, 2000)

        feedbackPollingMapRef.current[questionId] = timerId
    }

    const submitQuestion = async (
        question: InterviewQuestion,
        options?: { autoSubmit?: boolean }
    ) => {
        if (isSubmitting) return
        if (submittedQuestionIds[question.id]) return

        try {
            setIsSubmitting(true)

            const idempotencyKey = createIdempotencyKey(question.interviewId, question.id)
            const questionStartedAt = startedAtByQuestionId[question.id]
            const rawDurationSeconds = questionStartedAt
                ? Math.floor((Date.now() - questionStartedAt) / 1000)
                : 0

            const timeLimitSec = question.timeLimitSec ?? rawDurationSeconds
            const durationSeconds = options?.autoSubmit
                ? Math.min(rawDurationSeconds, timeLimitSec)
                : rawDurationSeconds

            setSubmittedDurationByQuestionId((prev) => ({
                ...prev,
                [question.id]: durationSeconds,
            }))

            const payload = {
                interviewId: question.interviewId,
                questionId: question.id,
                answerText: answers[question.id] ?? "",
                answerDurationSeconds: durationSeconds,
                idempotencyKey,
            }

            const result = await InterviewAnswerApi(payload)

            setSubmittedQuestionIds((prev) => ({
                ...prev,
                [question.id]: true,
            }))

            if (options?.autoSubmit) {
                setExpiredQuestionIds((prev) => ({
                    ...prev,
                    [question.id]: true,
                }))
            }

            if (result?.completed) {
                setIsCompleted(true)
                return
            }

            const nextQuestion = result?.questions?.[0]

            if (nextQuestion && nextQuestion.type.code !== "BASE") {
                upsertQuestion({
                    id: nextQuestion.id,
                    interviewId: nextQuestion.interviewId,
                    seq: nextQuestion.seq,
                    title: nextQuestion.title,
                    questionText: nextQuestion.questionText,
                    tags: nextQuestion.tags ?? [],
                    type: nextQuestion.type,
                    timeLimitSec: result.answerTimeSeconds,
                } as InterviewQuestion)
            }

            const feedbackRes = await FeedbackDetailApi(question.id)

            if (!feedbackRes) {
                startFeedbackPolling(question.id)
                return
            }

            setFeedbackByQuestionId((prev) => ({
                ...prev,
                [question.id]: feedbackRes,
            }))

            if (feedbackRes.status.code === "PENDING") {
                startFeedbackPolling(question.id)
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const submitCurrent = async () => {
        if (!current) return
        if (isCurrentSubmitted) return

        await submitQuestion(current)
    }

    const handleExitInterview = async () => {
        if (!current) return
        if (isSubmitting || isTerminating) return

        const confirmed = window.confirm(
            "면접을 종료하시겠습니까?\n현재 진행 상태는 저장되며, 완료되지 않은 면접으로 기록됩니다."
        )

        if (!confirmed) return

        try {
            setIsTerminating(true)

            const success = await InterviewExitApi(current.interviewId)

            if (!success) {
                alert("면접 종료에 실패했습니다. 잠시 후 다시 시도해 주세요.")
                return
            }

            Object.values(feedbackPollingMapRef.current).forEach((timerId) => {
                if (timerId) {
                    window.clearInterval(timerId)
                }
            })

            feedbackPollingMapRef.current = {}
            setIsExited(true)
        } finally {
            setIsTerminating(false)
        }
    }

    useEffect(() => {
        if (!current) return
        if (isSubmitting) return
        if (submittedQuestionIds[current.id]) return
        if (expiredQuestionIds[current.id]) return

        const deadlineAt = deadlineAtByQuestionId[current.id]
        if (!deadlineAt) return

        if (now < deadlineAt) return

        setExpiredQuestionIds((prev) => ({
            ...prev,
            [current.id]: true,
        }))

        void submitQuestion(current, { autoSubmit: true })
    }, [
        now,
        current?.id,
        isSubmitting,
        submittedQuestionIds,
        expiredQuestionIds,
        deadlineAtByQuestionId,
    ])

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

    const stopStreamTracks = () => {
        streamRef.current?.getTracks().forEach((track) => track.stop())
        streamRef.current = null
    }

    const startRecording = async () => {
        if (!current) return
        if (isCurrentSubmitted || isCurrentExpired || isTranscribing) return

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            streamRef.current = stream

            const mimeType = MediaRecorder.isTypeSupported("audio/webm")
                ? "audio/webm"
                : ""

            const recorder = mimeType
                ? new MediaRecorder(stream, { mimeType })
                : new MediaRecorder(stream)

            audioChunksRef.current = []
        console.log(mimeType);
            console.log(recorder);

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data)
                }
            }

            recorder.onstop = async () => {
                const blob = new Blob(audioChunksRef.current, {
                    type: mimeType || "audio/webm",
                })

                const file = new File([blob], `interview-answer-${current.id}.webm`, {
                    type: blob.type,
                })

                const newAudioUrl = URL.createObjectURL(blob)

                setAudioUrlByQuestionId((prev) => {
                    const oldUrl = prev[current.id]
                    if (oldUrl) {
                        URL.revokeObjectURL(oldUrl)
                    }

                    return {
                        ...prev,
                        [current.id]: newAudioUrl,
                    }
                })

                setAudioFileByQuestionId((prev) => ({
                    ...prev,
                    [current.id]: file,
                }))

                stopStreamTracks()
                setIsRecording(false)
                setRecordingQuestionId(null)

                await requestStt(current.id, file)
            }

            mediaRecorderRef.current = recorder
            recorder.start()
            setIsRecording(true)
            setRecordingQuestionId(current.id)
        } catch (error) {
            console.error(error)
            alert("마이크 권한을 확인해주세요.")
            stopStreamTracks()
            setIsRecording(false)
            setRecordingQuestionId(null)
        }
    }


    const stopRecording = () => {
        mediaRecorderRef.current?.stop()
        mediaRecorderRef.current = null
    }

    const requestStt = async (questionId: number, file: File) => {
        try {
            setIsTranscribing(true)

            const res = await InterviewSttApi(file, current.interviewId)

            if (!res) {
                alert("음성 텍스트 변환에 실패했습니다.")
                return
            }

            setAnswers((prev) => ({
                ...prev,
                [questionId]: res.text ?? "",
            }))
        } finally {
            setIsTranscribing(false)
        }
    }

    const rerecordCurrent = async () => {
        if (!current) return
        if (isCurrentSubmitted || isCurrentExpired || isTranscribing) return

        const oldUrl = audioUrlByQuestionId[current.id]
        if (oldUrl) {
            URL.revokeObjectURL(oldUrl)
        }

        setAudioUrlByQuestionId((prev) => {
            const next = { ...prev }
            delete next[current.id]
            return next
        })

        setAudioFileByQuestionId((prev) => {
            const next = { ...prev }
            delete next[current.id]
            return next
        })

        setAnswers((prev) => ({
            ...prev,
            [current.id]: "",
        }))

        await startRecording()
    }

    const timerTextClass =
        !isCurrentSubmitted && remainingSec !== null && remainingSec <= 10
            ? "text-red-400"
            : "text-foreground"

    const isVoiceMode = answerMode === "VOICE"

    if (isInitializing) {
        return (
            <div className="mx-auto w-full max-w-6xl px-4 py-10">
                <div className="rounded-3xl border border-white/10 bg-(--surface-glass-strong) p-8 text-center shadow-[0_24px_48px_rgba(20,30,50,0.12)]">
                    <p className="text-sm text-(--brand-muted)">면접을 준비하고 있습니다...</p>
                </div>
            </div>
        )
    }

    if (isExited) {
        return (
            <div className="mx-auto w-full max-w-6xl px-4 py-10">
                <div className="rounded-3xl border border-white/10 bg-(--surface-glass-strong) p-8 text-center shadow-[0_24px_48px_rgba(20,30,50,0.12)]">
                    <p className="text-sm text-(--brand-muted)">면접이 종료되었습니다.</p>
                    <h2 className="mt-2 text-2xl font-semibold text-foreground">면접을 중도 종료했습니다</h2>
                    <p className="mt-3 text-sm text-(--brand-muted)">
                        현재 진행 상태는 저장되며, 마이페이지 히스토리에서 다시 확인할 수 있습니다.
                    </p>
                </div>
            </div>
        )
    }

    if (isCompleted) {
        return (
            <div className="mx-auto w-full max-w-6xl px-4 py-10">
                <div className="rounded-3xl border border-white/10 bg-(--surface-glass-strong) p-8 text-center shadow-[0_24px_48px_rgba(20,30,50,0.12)]">
                    <p className="text-sm text-(--brand-muted)">면접이 완료되었습니다.</p>
                    <h2 className="mt-2 text-2xl font-semibold text-foreground">수고하셨습니다</h2>
                    <p className="mt-3 text-sm text-(--brand-muted)">
                        답변과 피드백을 바탕으로 결과를 확인해 보세요.
                    </p>
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
                    <p className="mt-1 text-xs text-(--brand-muted)">
                        답변 방식: {isVoiceMode ? "보이스" : "텍스트"}
                    </p>
                </div>

                <div className="flex flex-col items-stretch gap-3 sm:min-w-[180px]">
                    <Button
                        className="w-full rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/15 dark:text-red-300"
                        onClick={handleExitInterview}
                        disabled={isSubmitting || isTerminating}
                    >
                        <XCircle className="mr-2 h-4 w-4" />
                        {isTerminating ? "종료 중..." : "면접 종료"}
                    </Button>

                    <div className="rounded-2xl border border-white/10 bg-(--surface-glass-strong) px-4 py-3 shadow-[0_18px_40px_rgba(20,30,50,0.12)]">
                        <div className="flex items-center gap-2 text-sm text-(--brand-muted)">
                            <Timer className="h-4 w-4" />
                            <span>{timerLabel}</span>
                        </div>

                        <div className={`mt-1 text-xl font-semibold tabular-nums ${timerTextClass}`}>
                            {formatMMSS(displaySec ?? 0)}
                        </div>

                        <p className="mt-1 text-xs text-(--brand-muted)">
                            제한 {Math.floor((current.timeLimitSec ?? 0) / 60)}분{" "}
                            {Math.floor((current.timeLimitSec ?? 0) % 60)}초
                        </p>
                        {!isCurrentSubmitted && (
                            <p className="mt-1 text-[11px] text-(--brand-muted)">
                                경과 시간 {formatMMSS(elapsedSec)}
                            </p>
                        )}
                    </div>
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
                                    current.type?.code
                                )}`}
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

                <section className="rounded-3xl border border-white/10 bg-(--surface-glass-strong) p-6 shadow-[0_24px_48px_rgba(20,30,50,0.12)]">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-(--brand-muted)">
                                Answer
                            </p>
                            <h3 className="mt-1 text-lg font-semibold text-foreground">답변 작성</h3>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                className="rounded-xl"
                                onClick={goPrev}
                                disabled={index === 0}
                            >
                                <ChevronLeft className="mr-1 h-4 w-4" />
                                이전
                            </Button>

                            <Button
                                className="rounded-xl"
                                onClick={index === questions.length - 1 ? submitCurrent : goNext}
                                disabled={!isCurrentSubmitted && index !== questions.length - 1}
                            >
                                다음
                                <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {isVoiceMode ? (
                        <div className="space-y-4">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-sm text-(--brand-muted)">
                                    보이스 모드입니다. 먼저 답변을 녹음하면 텍스트로 변환됩니다.
                                </p>
                                <p className="mt-1 text-xs text-(--brand-muted)">
                                    변환된 텍스트는 수정한 뒤 제출할 수 있습니다.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {!isCurrentRecording ? (
                                    <Button
                                        className="rounded-xl"
                                        onClick={startRecording}
                                        disabled={isCurrentSubmitted || isCurrentExpired || isTranscribing || isSubmitting}
                                    >
                                        <Mic className="mr-2 h-4 w-4" />
                                        녹음 시작
                                    </Button>
                                ) : (
                                    <Button
                                        className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/15 dark:text-red-300"
                                        onClick={stopRecording}
                                    >
                                        <Square className="mr-2 h-4 w-4" />
                                        녹음 종료
                                    </Button>
                                )}

                                {!!currentAudioUrl && !isCurrentRecording && (
                                    <Button
                                        className="rounded-xl"
                                        onClick={rerecordCurrent}
                                        disabled={isCurrentSubmitted || isCurrentExpired || isTranscribing || isSubmitting}
                                    >
                                        <RotateCcw className="mr-2 h-4 w-4" />
                                        다시 녹음
                                    </Button>
                                )}
                            </div>

                            {isCurrentRecording && (
                                <p className="text-sm text-red-400">
                                    녹음 중입니다. 답변이 끝나면 녹음 종료를 눌러주세요.
                                </p>
                            )}

                            {isTranscribing && (
                                <p className="text-sm text-sky-400">
                                    음성을 텍스트로 변환 중입니다...
                                </p>
                            )}

                            {!!currentAudioUrl && (
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <div className="mb-2 flex items-center gap-2 text-sm text-foreground">
                                        <Volume2 className="h-4 w-4" />
                                        <span>녹음된 답변</span>
                                    </div>

                                    <audio controls src={currentAudioUrl} className="w-full" />
                                </div>
                            )}

                            {(!!currentAudioUrl || !!currentAnswer) && (
                                <textarea
                                    value={currentAnswer}
                                    onChange={(e) => onChangeAnswer(e.target.value)}
                                    disabled={isCurrentSubmitted || isCurrentExpired || isTranscribing}
                                    className="min-h-70 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-foreground outline-none disabled:cursor-not-allowed disabled:opacity-60"
                                    placeholder="음성 답변이 텍스트로 변환되면 여기에 표시됩니다."
                                />
                            )}
                        </div>
                    ) : (
                        <textarea
                            value={currentAnswer}
                            onChange={(e) => onChangeAnswer(e.target.value)}
                            disabled={isCurrentSubmitted || isCurrentExpired}
                            className="min-h-70 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-foreground outline-none disabled:cursor-not-allowed disabled:opacity-60"
                            placeholder="답변을 입력해 주세요."
                        />
                    )}

                    <div className="mt-3 flex flex-col gap-2">
                        {isCurrentExpired && !isCurrentSubmitted && (
                            <p className="text-sm text-amber-400">
                                답변 시간이 종료되어 자동 제출 중입니다.
                            </p>
                        )}

                        {isCurrentExpired && isCurrentSubmitted && (
                            <p className="text-sm text-amber-400">
                                답변 시간이 종료되어 자동 제출되었습니다.
                            </p>
                        )}
                    </div>

                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-(--brand-muted)">
                            {isVoiceMode && !currentAnswer && !isCurrentSubmitted
                                ? "녹음 후 변환된 텍스트를 확인하고 제출해 주세요."
                                : ""}
                        </p>

                        <Button
                            className="rounded-xl"
                            onClick={submitCurrent}
                            disabled={
                                isSubmitting ||
                                isCurrentSubmitted ||
                                isCurrentExpired ||
                                isTerminating ||
                                isTranscribing ||
                                (isVoiceMode && !currentAnswer.trim())
                            }
                        >
                            <Send className="mr-2 h-4 w-4" />
                            {isCurrentSubmitted
                                ? "제출 완료"
                                : isSubmitting
                                    ? "제출 중..."
                                    : "답변 제출"}
                        </Button>
                    </div>

                    {isFeedbackPending && (
                        <div className="mt-5 rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5">
                            <div className="flex items-center gap-2">
                                <BadgeCheck className="h-4 w-4 text-sky-400" />
                                <p className="text-sm font-semibold text-foreground">
                                    간단 피드백 생성 중
                                </p>
                            </div>

                            <p className="mt-3 text-sm leading-relaxed text-(--brand-muted)">
                                답변을 분석하고 있습니다. 잠시 후 피드백이 표시됩니다.
                            </p>
                        </div>
                    )}

                    {isFeedbackSucceeded && currentFeedback && (
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
                                        <MessageSquareWarning className="h-4 w-4 text-amber-400" />
                                        <p className="text-sm font-medium text-foreground">
                                            보완하면 좋은 점
                                        </p>
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
                                    <p className="text-sm font-semibold text-foreground">답변 예시</p>

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

                    {isFeedbackSkipped && (
                        <div className="mt-5 rounded-2xl border border-zinc-500/20 bg-zinc-500/5 p-5">
                            <p className="text-sm font-semibold text-foreground">간단 피드백 없음</p>
                            <p className="mt-2 text-sm text-(--brand-muted)">
                                답변이 없어 해당 질문의 피드백은 생성되지 않았습니다.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
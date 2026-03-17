
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

export interface InterviewResultResponse {
    id: number
    title: string
    createdAt: string
    endedAt: string
    durationSeconds: number
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
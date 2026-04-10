import {EnumResponse} from "../EnumResponse";


export interface InterviewQuestionFeedbackItem {
    id: number
    questionOrder: number
    question: string
    answer: string
    feedback: string
    score: number
    type : EnumResponse,
    strengths: string[],
    improvements: FeedbackImprovement[]
    dimensions : FeedbackDimensions
    jobMetrics : FeedbackJobMetrics
    headline : string
    improvementTags: string[]
}

interface FeedbackImprovement {
    problem: string
    action: string
    example: string
}

interface FeedbackDimensions {
    structure: number
    clarity: number
    specificity: number
}

interface FeedbackJobMetrics {
    decisionMaking: number
    practicality: number
    tradeoff: number
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
    feedbackDimensions : FeedbackDimensions,
    feedbackJobMetrics : FeedbackJobMetrics,
    endReason:EnumResponse
}

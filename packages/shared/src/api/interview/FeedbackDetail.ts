type FeedbackStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "SKIPPED"

export interface FeedbackResponse  {
    id: number
    status: {
        code : FeedbackStatus,
        label : string
    }
    score: number | null
    summary: string | null
    strengths: string[]
    improvements: FeedbackImprovement[]
    modelAnswer: string | null
}

interface FeedbackImprovement {
    problem: string
    action: string
    example: string
}